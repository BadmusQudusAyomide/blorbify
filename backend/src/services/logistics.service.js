import { adminDb, fieldValue } from '../config/firebaseAdmin.js';
import { createHttpError } from '../utils/httpError.js';

function toIso(value) {
  if (!value) return null;
  if (typeof value?.toDate === 'function') return value.toDate().toISOString();
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function serializeCompany(doc) {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name || '',
    coverage: data.coverage || '',
    description: data.description || '',
    whatsapp: data.whatsapp || '',
    phone: data.phone || '',
    email: data.email || '',
    website: data.website || '',
    active: Boolean(data.active),
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  };
}

const TRIMMED_FIELDS = ['name', 'whatsapp', 'coverage', 'description', 'phone', 'email', 'website'];

export async function listLogisticsCompanies() {
  const snapshot = await adminDb.collection('logisticsCompanies').orderBy('name').get();
  return snapshot.docs.map(serializeCompany);
}

export async function createLogisticsCompany(payload) {
  const name = String(payload.name || '').trim();
  const whatsapp = String(payload.whatsapp || '').trim();

  if (!name) throw createHttpError(400, 'name is required.');
  if (!whatsapp) throw createHttpError(400, 'whatsapp is required.');

  const docRef = adminDb.collection('logisticsCompanies').doc();
  await docRef.set({
    name,
    whatsapp,
    coverage: String(payload.coverage || '').trim(),
    description: String(payload.description || '').trim(),
    phone: String(payload.phone || '').trim(),
    email: String(payload.email || '').trim(),
    website: String(payload.website || '').trim(),
    active: payload.active !== false,
    createdAt: fieldValue.serverTimestamp(),
    updatedAt: fieldValue.serverTimestamp(),
  });

  const created = await docRef.get();
  return serializeCompany(created);
}

export async function updateLogisticsCompany(companyId, payload) {
  const docRef = adminDb.collection('logisticsCompanies').doc(companyId);
  const existing = await docRef.get();
  if (!existing.exists) {
    throw createHttpError(404, 'Logistics company not found.');
  }

  const update = { updatedAt: fieldValue.serverTimestamp() };

  for (const field of TRIMMED_FIELDS) {
    if (payload[field] !== undefined) {
      update[field] = String(payload[field]).trim();
    }
  }

  if (update.name === '') throw createHttpError(400, 'name cannot be empty.');
  if (update.whatsapp === '') throw createHttpError(400, 'whatsapp cannot be empty.');

  if (payload.active !== undefined) {
    update.active = Boolean(payload.active);
  }

  await docRef.update(update);
  const updated = await docRef.get();
  return serializeCompany(updated);
}

export async function deleteLogisticsCompany(companyId) {
  const docRef = adminDb.collection('logisticsCompanies').doc(companyId);
  const existing = await docRef.get();
  if (!existing.exists) {
    throw createHttpError(404, 'Logistics company not found.');
  }
  await docRef.delete();
}
