import { adminDb, fieldValue } from '../config/firebaseAdmin.js';

function toIso(value) {
  if (!value) return null;
  if (typeof value?.toDate === 'function') return value.toDate().toISOString();
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export async function listSupportConversations() {
  const snapshot = await adminDb.collection('supportConversations').orderBy('lastMessageAt', 'desc').get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      sellerId: doc.id,
      storeName: data.storeName || '',
      ownerName: data.ownerName || '',
      email: data.email || '',
      lastMessageText: data.lastMessageText || '',
      lastMessageAt: toIso(data.lastMessageAt),
      lastMessageSender: data.lastMessageSender || 'seller',
      unreadByAdmin: Boolean(data.unreadByAdmin),
      hasAdminReplied: Boolean(data.hasAdminReplied),
    };
  });
}

export async function getSupportMessages(sellerId) {
  const snapshot = await adminDb
    .collection('supportConversations')
    .doc(sellerId)
    .collection('messages')
    .orderBy('createdAt', 'asc')
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      senderType: data.senderType || 'seller',
      senderName: data.senderName || '',
      text: data.text || '',
      createdAt: toIso(data.createdAt),
    };
  });
}

export async function postAdminReply(sellerId, text, adminName) {
  const conversationRef = adminDb.collection('supportConversations').doc(sellerId);
  const messageRef = conversationRef.collection('messages').doc();
  const resolvedName = adminName || 'Blorbify Support';

  const batch = adminDb.batch();
  batch.set(messageRef, {
    senderType: 'admin',
    senderName: resolvedName,
    text,
    createdAt: fieldValue.serverTimestamp(),
  });
  batch.set(
    conversationRef,
    {
      lastMessageText: text,
      lastMessageAt: fieldValue.serverTimestamp(),
      lastMessageSender: 'admin',
      unreadByAdmin: false,
      unreadBySeller: true,
      hasAdminReplied: true,
      updatedAt: fieldValue.serverTimestamp(),
    },
    { merge: true }
  );
  await batch.commit();

  return {
    id: messageRef.id,
    senderType: 'admin',
    senderName: resolvedName,
    text,
    createdAt: new Date().toISOString(),
  };
}

export async function markConversationReadByAdmin(sellerId) {
  await adminDb.collection('supportConversations').doc(sellerId).set(
    { unreadByAdmin: false, updatedAt: fieldValue.serverTimestamp() },
    { merge: true }
  );
}
