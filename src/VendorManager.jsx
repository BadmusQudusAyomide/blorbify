import { useState } from 'react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { uploadImage, validateImage } from './cloudinary';
import { publishCampusPublicStore } from './campusPublicStore';

function createId(prefix) {
  const random = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `${prefix}-${random}`;
}

function formatCurrency(value) {
  return `NGN ${Number(value || 0).toLocaleString()}`;
}

const emptyVendorForm = { name: '', description: '' };
const emptyProductForm = { name: '', price: '' };

// Admin UI for the Campus Runs Logistics template: unlike the generic
// ProductManager (which every other template uses), here the seller curates
// many vendor mini-stores, each with its own image/details and its own
// name+price-only product list. Kept as its own file rather than folded into
// the already-huge Dashboard.jsx.
export default function VendorManager({ userId, storeInfo, vendors, onVendorsSaved }) {
  const [vendorForm, setVendorForm] = useState(emptyVendorForm);
  const [imageItem, setImageItem] = useState(null);
  const [editingVendorId, setEditingVendorId] = useState('');
  const [expandedVendorId, setExpandedVendorId] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deletingId, setDeletingId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const updateVendorField = (field, value) => {
    setVendorForm((current) => ({ ...current, [field]: value }));
    setError('');
    setSuccess('');
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const validationError = validateImage(file, 'Vendor image');
    if (validationError) {
      setError(validationError);
      return;
    }

    if (imageItem?.kind === 'new') URL.revokeObjectURL(imageItem.previewUrl);
    setImageItem({ kind: 'new', file, previewUrl: URL.createObjectURL(file) });
    setError('');
    setSuccess('');
  };

  const removeImageItem = () => {
    if (imageItem?.kind === 'new') URL.revokeObjectURL(imageItem.previewUrl);
    setImageItem(null);
  };

  const resetVendorForm = () => {
    if (imageItem?.kind === 'new') URL.revokeObjectURL(imageItem.previewUrl);
    setVendorForm(emptyVendorForm);
    setImageItem(null);
    setEditingVendorId('');
    setUploadProgress(0);
  };

  const saveVendors = async (nextVendors) => {
    const nextStoreInfo = { ...(storeInfo || {}), vendors: nextVendors };

    await setDoc(
      doc(db, 'stores', userId),
      { userId, vendors: nextVendors, updatedAt: serverTimestamp() },
      { merge: true }
    );
    await publishCampusPublicStore(nextStoreInfo, userId);
    onVendorsSaved(nextVendors);
  };

  const handleVendorSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const name = vendorForm.name.trim();
    if (!name) {
      setError('Enter a vendor name.');
      return;
    }

    const currentVendor = editingVendorId ? vendors.find((vendor) => vendor.id === editingVendorId) : null;

    if (!imageItem && !currentVendor?.image?.url) {
      setError('Add a photo for this vendor.');
      return;
    }

    setSaving(true);
    setUploadProgress(imageItem?.kind === 'new' ? 1 : 0);
    try {
      let image = currentVendor?.image || null;
      if (imageItem?.kind === 'new') {
        const uploaded = await uploadImage(imageItem.file, `blorbify/vendors/${userId}`, setUploadProgress, 'Vendor image');
        image = {
          url: uploaded.secureUrl,
          publicId: uploaded.publicId,
          width: uploaded.width,
          height: uploaded.height,
          format: uploaded.format,
          bytes: uploaded.bytes,
        };
      }

      const now = new Date().toISOString();
      const vendor = {
        ...(currentVendor || {}),
        id: currentVendor?.id || createId('vendor'),
        name,
        description: vendorForm.description.trim(),
        image,
        products: currentVendor?.products || [],
        status: currentVendor?.status || 'active',
        createdAt: currentVendor?.createdAt || now,
        updatedAt: now,
      };

      const nextVendors = editingVendorId
        ? vendors.map((item) => (item.id === editingVendorId ? vendor : item))
        : [vendor, ...vendors];

      await saveVendors(nextVendors);
      resetVendorForm();
      setSuccess(editingVendorId ? 'Vendor updated.' : 'Vendor added.');
    } catch (saveError) {
      setError(saveError?.message || 'Vendor could not be saved. Please try again.');
    } finally {
      setSaving(false);
      setUploadProgress(0);
    }
  };

  const handleEditVendor = (vendor) => {
    if (imageItem?.kind === 'new') URL.revokeObjectURL(imageItem.previewUrl);
    setEditingVendorId(vendor.id);
    setImageItem(null);
    setError('');
    setSuccess('');
    setVendorForm({ name: vendor.name || '', description: vendor.description || '' });
  };

  const handleDeleteVendor = async (vendorId) => {
    const vendor = vendors.find((item) => item.id === vendorId);
    if (!vendor || !window.confirm(`Remove ${vendor.name} and all of its products?`)) return;

    setDeletingId(vendorId);
    setError('');
    setSuccess('');
    try {
      await saveVendors(vendors.filter((item) => item.id !== vendorId));
      setSuccess('Vendor removed.');
    } catch (deleteError) {
      setError(deleteError?.message || 'Vendor could not be removed. Please try again.');
    } finally {
      setDeletingId('');
    }
  };

  const handleSaveVendorProducts = async (vendorId, nextProducts) => {
    const nextVendors = vendors.map((vendor) => (
      vendor.id === vendorId ? { ...vendor, products: nextProducts, updatedAt: new Date().toISOString() } : vendor
    ));
    await saveVendors(nextVendors);
  };

  return (
    <div className="vendor-manager">
      <style>{`
        .vendor-manager { display: flex; flex-direction: column; gap: 24px; }
        .vendor-manager .form-card, .vendor-manager .list-card { background: #fff; border-radius: 16px; padding: 20px; box-shadow: 0 10px 24px rgba(0,0,0,0.05); }
        .vendor-manager .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; margin-bottom: 14px; }
        .vendor-manager label.field { display: flex; flex-direction: column; gap: 6px; font-size: 13px; font-weight: 600; color: #2A2320; }
        .vendor-manager label.field.full { grid-column: 1 / -1; }
        .vendor-manager input, .vendor-manager textarea { padding: 10px 12px; border-radius: 10px; border: 1px solid #ddd; font-size: 14px; font-family: inherit; }
        .vendor-manager .image-row { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; }
        .vendor-manager .image-preview { width: 72px; height: 72px; border-radius: 12px; object-fit: cover; background: #f2f2f2; }
        .vendor-manager .image-upload-btn { padding: 10px 16px; border-radius: 999px; border: 1px dashed #999; background: none; cursor: pointer; font-size: 13px; }
        .vendor-manager .remove-image { border: none; background: none; color: #b3261e; font-size: 12px; cursor: pointer; }
        .vendor-manager .alert { padding: 10px 12px; border-radius: 10px; font-size: 13px; margin-bottom: 10px; }
        .vendor-manager .alert.error { background: #fdecea; color: #b3261e; }
        .vendor-manager .alert.success { background: #eaf7ee; color: #1b7a3c; }
        .vendor-manager .submit-btn { padding: 12px 20px; border-radius: 999px; border: none; background: #FF7A00; color: #101820; font-weight: 700; cursor: pointer; }
        .vendor-manager .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .vendor-manager .edit-banner { display: flex; justify-content: space-between; align-items: center; background: #fff6ea; padding: 8px 12px; border-radius: 10px; margin-bottom: 12px; font-size: 13px; }
        .vendor-manager .vendor-grid { display: grid; gap: 14px; }
        .vendor-manager .vendor-card { border: 1px solid #eee; border-radius: 14px; padding: 14px; display: flex; gap: 14px; }
        .vendor-manager .vendor-card img { width: 60px; height: 60px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
        .vendor-manager .vendor-card-body { flex: 1; min-width: 0; }
        .vendor-manager .vendor-card-body h4 { margin: 0 0 2px; }
        .vendor-manager .vendor-card-body p { margin: 0 0 8px; font-size: 13px; color: #777; }
        .vendor-manager .vendor-actions { display: flex; gap: 10px; flex-wrap: wrap; }
        .vendor-manager .vendor-actions button { border: none; background: #f4f4f4; border-radius: 999px; padding: 6px 14px; font-size: 12.5px; cursor: pointer; }
        .vendor-manager .vendor-actions button.danger { color: #b3261e; }
        .vendor-manager .products-editor { margin-top: 14px; border-top: 1px dashed #ddd; padding-top: 14px; }
        .vendor-manager .product-form-row { display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
        .vendor-manager .product-form-row input { flex: 1; min-width: 120px; }
        .vendor-manager .product-list { display: flex; flex-direction: column; gap: 6px; }
        .vendor-manager .product-list-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: #fafafa; border-radius: 8px; font-size: 13.5px; }
        .vendor-manager .product-list-row .row-actions button { border: none; background: none; cursor: pointer; font-size: 12px; margin-left: 8px; color: #666; }
        .vendor-manager .product-list-row .row-actions button.danger { color: #b3261e; }
        .vendor-manager .empty-state { text-align: center; color: #888; padding: 24px; font-size: 13.5px; }
      `}</style>

      <form className="form-card" onSubmit={handleVendorSubmit}>
        {editingVendorId && (
          <div className="edit-banner">
            <span>Editing vendor</span>
            <button type="button" onClick={resetVendorForm} disabled={saving}>Cancel</button>
          </div>
        )}

        <div className="image-row">
          {(imageItem?.previewUrl || vendors.find((v) => v.id === editingVendorId)?.image?.url) && (
            <img
              className="image-preview"
              src={imageItem?.previewUrl || vendors.find((v) => v.id === editingVendorId)?.image?.url}
              alt=""
            />
          )}
          <label className="image-upload-btn">
            {imageItem ? 'Change photo' : 'Add vendor photo'}
            <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
          </label>
          {imageItem && <button type="button" className="remove-image" onClick={removeImageItem}>Remove</button>}
        </div>

        <div className="form-grid">
          <label className="field full">
            <span>Vendor name</span>
            <input value={vendorForm.name} onChange={(event) => updateVendorField('name', event.target.value)} placeholder="Mama Ngozi's Kitchen" />
          </label>
          <label className="field full">
            <span>Description (optional)</span>
            <textarea rows="2" value={vendorForm.description} onChange={(event) => updateVendorField('description', event.target.value)} placeholder="What this vendor sells" />
          </label>
        </div>

        {saving && imageItem?.kind === 'new' && (
          <div className="alert" style={{ background: '#f4f4f4' }}>Uploading photo... {uploadProgress}%</div>
        )}
        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}

        <button type="submit" className="submit-btn" disabled={saving}>
          {saving ? 'Saving...' : editingVendorId ? 'Save changes' : 'Add vendor'}
        </button>
      </form>

      <div className="list-card">
        <h3>Vendors ({vendors.length})</h3>
        {vendors.length ? (
          <div className="vendor-grid">
            {vendors.map((vendor) => (
              <div className="vendor-card" key={vendor.id}>
                <img src={vendor.image?.url} alt="" />
                <div className="vendor-card-body">
                  <h4>{vendor.name}</h4>
                  <p>{vendor.products?.length || 0} product{vendor.products?.length === 1 ? '' : 's'}</p>
                  <div className="vendor-actions">
                    <button type="button" onClick={() => handleEditVendor(vendor)} disabled={saving}>Edit vendor</button>
                    <button type="button" onClick={() => setExpandedVendorId(expandedVendorId === vendor.id ? '' : vendor.id)}>
                      {expandedVendorId === vendor.id ? 'Hide products' : 'Manage products'}
                    </button>
                    <button type="button" className="danger" onClick={() => handleDeleteVendor(vendor.id)} disabled={deletingId === vendor.id}>
                      {deletingId === vendor.id ? 'Removing...' : 'Remove vendor'}
                    </button>
                  </div>

                  {expandedVendorId === vendor.id && (
                    <VendorProductsEditor
                      vendor={vendor}
                      onSave={(nextProducts) => handleSaveVendorProducts(vendor.id, nextProducts)}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">No vendors yet. Add your first vendor above.</div>
        )}
      </div>
    </div>
  );
}

function VendorProductsEditor({ vendor, onSave }) {
  const [form, setForm] = useState(emptyProductForm);
  const [editingProductId, setEditingProductId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const products = vendor.products || [];

  const resetForm = () => {
    setForm(emptyProductForm);
    setEditingProductId('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const name = form.name.trim();
    const price = Number(String(form.price).replace(/[^\d.]/g, ''));

    if (!name) {
      setError('Enter a product name.');
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setError('Enter a valid price.');
      return;
    }

    const now = new Date().toISOString();
    const currentProduct = editingProductId ? products.find((product) => product.id === editingProductId) : null;
    const product = {
      ...(currentProduct || {}),
      id: currentProduct?.id || createId('vproduct'),
      name,
      price,
      status: currentProduct?.status || 'active',
      createdAt: currentProduct?.createdAt || now,
      updatedAt: now,
    };

    const nextProducts = editingProductId
      ? products.map((item) => (item.id === editingProductId ? product : item))
      : [product, ...products];

    setSaving(true);
    try {
      await onSave(nextProducts);
      resetForm();
    } catch (saveError) {
      setError(saveError?.message || 'Product could not be saved. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProductId(product.id);
    setForm({ name: product.name || '', price: product.price ?? '' });
    setError('');
  };

  const handleDelete = async (productId) => {
    const product = products.find((item) => item.id === productId);
    if (!product || !window.confirm(`Remove ${product.name}?`)) return;

    setSaving(true);
    setError('');
    try {
      await onSave(products.filter((item) => item.id !== productId));
    } catch (deleteError) {
      setError(deleteError?.message || 'Product could not be removed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="products-editor">
      <form className="product-form-row" onSubmit={handleSubmit}>
        <input
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          placeholder="Product name"
        />
        <input
          inputMode="decimal"
          value={form.price}
          onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
          placeholder="Price (NGN)"
          style={{ maxWidth: 130 }}
        />
        <button type="submit" className="submit-btn" disabled={saving} style={{ padding: '8px 14px', fontSize: 12.5 }}>
          {saving ? 'Saving...' : editingProductId ? 'Save' : 'Add'}
        </button>
        {editingProductId && (
          <button type="button" onClick={resetForm} style={{ border: 'none', background: 'none', fontSize: 12.5, color: '#666', cursor: 'pointer' }}>
            Cancel
          </button>
        )}
      </form>

      {error && <div className="alert error">{error}</div>}

      {products.length ? (
        <div className="product-list">
          {products.map((product) => (
            <div className="product-list-row" key={product.id}>
              <span>{product.name}</span>
              <span>
                {formatCurrency(product.price)}
                <span className="row-actions">
                  <button type="button" onClick={() => handleEdit(product)}>Edit</button>
                  <button type="button" className="danger" onClick={() => handleDelete(product.id)}>Remove</button>
                </span>
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">No products for this vendor yet.</div>
      )}
    </div>
  );
}
