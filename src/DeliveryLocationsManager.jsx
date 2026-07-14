import { useState } from 'react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { publishCampusPublicStore } from './campusPublicStore';

function createId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `location-${Date.now()}`;
}

function formatCurrency(value) {
  return `NGN ${Number(value || 0).toLocaleString()}`;
}

const emptyForm = { name: '', price: '' };

// Campus Runs Logistics replaces the generic single `deliveryFee` field
// (used by every other template) with a list of named locations, each with
// its own price — customers pick one at checkout instead of a flat fee.
export default function DeliveryLocationsManager({ userId, storeInfo, deliveryLocations, onDeliveryLocationsSaved }) {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId('');
  };

  const saveLocations = async (nextLocations) => {
    const nextStoreInfo = { ...(storeInfo || {}), deliveryLocations: nextLocations };

    await setDoc(
      doc(db, 'stores', userId),
      { userId, deliveryLocations: nextLocations, updatedAt: serverTimestamp() },
      { merge: true }
    );
    await publishCampusPublicStore(nextStoreInfo, userId);
    onDeliveryLocationsSaved(nextLocations);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const name = form.name.trim();
    const price = form.price === '' ? 0 : Number(String(form.price).replace(/[^\d.]/g, ''));

    if (!name) {
      setError('Enter a location name.');
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      setError('Enter a valid delivery price.');
      return;
    }

    const location = { id: editingId || createId(), name, price };
    const nextLocations = editingId
      ? deliveryLocations.map((item) => (item.id === editingId ? location : item))
      : [...deliveryLocations, location];

    setSaving(true);
    try {
      await saveLocations(nextLocations);
      resetForm();
      setSuccess(editingId ? 'Location updated.' : 'Location added.');
    } catch (saveError) {
      setError(saveError?.message || 'Location could not be saved. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (location) => {
    setEditingId(location.id);
    setForm({ name: location.name || '', price: location.price ?? '' });
    setError('');
    setSuccess('');
  };

  const handleDelete = async (locationId) => {
    const location = deliveryLocations.find((item) => item.id === locationId);
    if (!location || !window.confirm(`Remove "${location.name}" from delivery locations?`)) return;

    setDeletingId(locationId);
    setError('');
    setSuccess('');
    try {
      await saveLocations(deliveryLocations.filter((item) => item.id !== locationId));
      setSuccess('Location removed.');
    } catch (deleteError) {
      setError(deleteError?.message || 'Location could not be removed. Please try again.');
    } finally {
      setDeletingId('');
    }
  };

  return (
    <div className="delivery-locations-manager">
      <style>{`
        .delivery-locations-manager { background: #fff; border-radius: 16px; padding: 20px; box-shadow: 0 10px 24px rgba(0,0,0,0.05); }
        .delivery-locations-manager h3 { margin: 0 0 4px; }
        .delivery-locations-manager .hint { margin: 0 0 14px; font-size: 13px; color: #777; }
        .delivery-locations-manager .form-row { display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
        .delivery-locations-manager .form-row input { flex: 1; min-width: 140px; padding: 10px 12px; border-radius: 10px; border: 1px solid #ddd; font-size: 14px; }
        .delivery-locations-manager .form-row input.price { max-width: 130px; flex: none; }
        .delivery-locations-manager .form-row button { padding: 10px 18px; border-radius: 999px; border: none; background: #FF7A00; color: #101820; font-weight: 700; cursor: pointer; }
        .delivery-locations-manager .form-row button:disabled { opacity: 0.6; cursor: not-allowed; }
        .delivery-locations-manager .form-row .cancel-btn { background: none; color: #666; font-weight: 500; }
        .delivery-locations-manager .alert { padding: 10px 12px; border-radius: 10px; font-size: 13px; margin-bottom: 10px; }
        .delivery-locations-manager .alert.error { background: #fdecea; color: #b3261e; }
        .delivery-locations-manager .alert.success { background: #eaf7ee; color: #1b7a3c; }
        .delivery-locations-manager .location-list { display: flex; flex-direction: column; gap: 6px; }
        .delivery-locations-manager .location-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #fafafa; border-radius: 10px; font-size: 13.5px; }
        .delivery-locations-manager .location-row .row-actions button { border: none; background: none; cursor: pointer; font-size: 12px; margin-left: 10px; color: #666; }
        .delivery-locations-manager .location-row .row-actions button.danger { color: #b3261e; }
        .delivery-locations-manager .empty-state { text-align: center; color: #888; padding: 20px; font-size: 13.5px; }
      `}</style>

      <h3>Delivery locations</h3>
      <p className="hint">Add each drop-off point on campus and its delivery price — customers pick one at checkout.</p>

      <form className="form-row" onSubmit={handleSubmit}>
        <input
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          placeholder="e.g. North Gate"
        />
        <input
          className="price"
          inputMode="decimal"
          value={form.price}
          onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
          placeholder="Price (NGN)"
        />
        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : editingId ? 'Save' : 'Add location'}
        </button>
        {editingId && <button type="button" className="cancel-btn" onClick={resetForm} disabled={saving}>Cancel</button>}
      </form>

      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}

      {deliveryLocations.length ? (
        <div className="location-list">
          {deliveryLocations.map((location) => (
            <div className="location-row" key={location.id}>
              <span>{location.name}</span>
              <span>
                {formatCurrency(location.price)}
                <span className="row-actions">
                  <button type="button" onClick={() => handleEdit(location)}>Edit</button>
                  <button type="button" className="danger" onClick={() => handleDelete(location.id)} disabled={deletingId === location.id}>
                    {deletingId === location.id ? 'Removing...' : 'Remove'}
                  </button>
                </span>
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">No delivery locations yet. Add your first one above.</div>
      )}
    </div>
  );
}
