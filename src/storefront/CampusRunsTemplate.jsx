import { useMemo, useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { sharedStorefrontStyles } from './sharedStorefrontStyles';
import { getWhatsAppOrderHref, formatCurrency as formatCurrencyUtil } from './storefrontUtils';
import { ToastStack } from './Toast';
import StoreFooter from './StoreFooter';
import CampusVendorCard from './CampusVendorCard';
import CampusProductRow from './CampusProductRow';
import CampusCartDrawer from './CampusCartDrawer';

function buildCampusOrderMessage({ vendorName, items, deliveryLocation, itemsSubtotal, grandTotal, customerName, customerPhone, note }) {
  const lines = [
    '🛵 New Campus Runs Order',
    '',
    `Vendor: ${vendorName}`,
    '',
    'Items:',
    ...items.map((item, index) => `${index + 1}. ${item.name} x${item.quantity} — ${formatCurrencyUtil(item.price * item.quantity)}`),
    '',
    `Delivery: ${deliveryLocation ? `${deliveryLocation.name} (${formatCurrencyUtil(deliveryLocation.price)})` : 'Not selected'}`,
    `Items total: ${formatCurrencyUtil(itemsSubtotal)}`,
    `Grand total: ${formatCurrencyUtil(grandTotal)}`,
    '',
    `Customer: ${customerName}`,
    `Phone: ${customerPhone}`,
  ];
  if (note) lines.push(`Room/Note: ${note}`);
  return lines.join('\n');
}

export default function CampusRunsTemplate(props) {
  const {
    store, theme, accentTextColor, businessTypeLabel, visibleSocialLinks, footerText,
    vendors = [], deliveryLocations = [],
    formatCurrency, cart, cartCount, cartSubtotal, addToCart, updateQuantity, removeItem, clearCart,
    heroHeadline, heroSubtext, heroEyebrow,
    toasts, dismiss, notify,
  } = props;

  const [openVendorId, setOpenVendorId] = useState(null);
  const [vendorConflict, setVendorConflict] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState(null);
  const [customer, setCustomer] = useState({ name: '', phone: '', note: '' });

  const activeVendors = useMemo(() => vendors.filter((vendor) => vendor?.status !== 'hidden'), [vendors]);
  const openVendor = activeVendors.find((vendor) => vendor.id === openVendorId) || null;
  const activeVendorId = cart[0]?.vendorId ?? null;
  const activeVendorName = cart[0]?.vendorName ?? '';

  const updateCustomer = (field, value) => setCustomer((current) => ({ ...current, [field]: value }));

  const quantityFor = (productId) => cart.find((item) => item.id === productId)?.quantity || 0;

  const addProductToCart = (product, vendor) => {
    addToCart({ id: product.id, name: product.name, price: product.price, vendorId: vendor.id, vendorName: vendor.name }, 1);
  };

  const handleAddToCart = (product, vendor) => {
    if (activeVendorId && activeVendorId !== vendor.id) {
      setVendorConflict({ vendor, product });
      return;
    }
    addProductToCart(product, vendor);
  };

  const confirmVendorSwitch = () => {
    if (!vendorConflict) return;
    clearCart();
    addProductToCart(vendorConflict.product, vendorConflict.vendor);
    setVendorConflict(null);
  };

  const handleCheckout = (event) => {
    event.preventDefault();
    if (!cart.length) {
      notify('Add something to your ticket first', { type: 'error' });
      return;
    }

    const name = customer.name.trim();
    const phone = customer.phone.trim();
    if (!name || !phone) {
      notify('We need your name and phone number to send your order', { type: 'error' });
      return;
    }

    const selectedLocation = deliveryLocations.find((location) => location.id === selectedLocationId) || null;
    if (deliveryLocations.length && !selectedLocation) {
      notify('Pick a delivery location first', { type: 'error' });
      return;
    }

    const whatsappHref = getWhatsAppOrderHref(store.whatsapp, 'x');
    if (!whatsappHref) {
      notify('This store has not set up WhatsApp ordering yet', { type: 'error' });
      return;
    }

    setSubmitting(true);

    const deliveryPrice = selectedLocation ? Number(selectedLocation.price || 0) : 0;
    const grandTotal = cartSubtotal + deliveryPrice;
    const message = buildCampusOrderMessage({
      vendorName: activeVendorName,
      items: cart,
      deliveryLocation: selectedLocation,
      itemsSubtotal: cartSubtotal,
      grandTotal,
      customerName: name,
      customerPhone: phone,
      note: customer.note.trim(),
    });

    window.open(getWhatsAppOrderHref(store.whatsapp, message), '_blank', 'noopener,noreferrer');

    addDoc(collection(db, 'orders'), {
      storeId: store.ownerId,
      storeSlug: store.storeSlug,
      storeName: store.businessName,
      customerName: name,
      customerPhone: phone,
      customerNote: customer.note.trim(),
      vendorId: activeVendorId,
      vendorName: activeVendorName,
      deliveryLocationName: selectedLocation?.name || '',
      deliveryLocationPrice: deliveryPrice,
      items: cart.map((item) => ({ productId: item.id, name: item.name, price: item.price, quantity: item.quantity, subtotal: item.price * item.quantity })),
      subtotal: cartSubtotal,
      deliveryFee: deliveryPrice,
      total: grandTotal,
      status: 'pending',
      requiresAddress: false,
      paymentMethod: 'whatsapp',
      createdAt: serverTimestamp(),
    }).catch((error) => {
      console.error('Campus Runs order record failed:', error);
    });

    clearCart();
    setSubmitting(false);
    setOrderPlaced(true);
  };

  return (
    <main className="storefront campus-runs">
      <style>{`
        .storefront.campus-runs {
          --store-accent: ${theme.primaryColor};
          --store-accent-text: ${accentTextColor};
          --store-ink: ${theme.textColor};
          --store-surface: ${theme.backgroundColor};
          --store-card: ${theme.cardColor};
          --store-display: 'Space Grotesk', 'Inter', system-ui, sans-serif;
          --store-mono: 'JetBrains Mono', ui-monospace, monospace;
          --store-muted: color-mix(in srgb, var(--store-ink) 62%, transparent);
          --store-line: color-mix(in srgb, var(--store-ink) 20%, transparent);
          background: var(--store-surface);
          color: var(--store-ink);
          min-height: 100vh;
          font-family: 'Inter', system-ui, sans-serif;
        }
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=JetBrains+Mono:wght@400;600&family=Inter:wght@400;500;600;700&display=swap');
        ${sharedStorefrontStyles}

        .campus-header { position: sticky; top: 0; z-index: 50; background: var(--store-surface); border-bottom: 1px solid var(--store-line); }
        .campus-header-inner { display: flex; align-items: center; gap: 16px; padding: 16px 0; }
        .campus-logo { width: 44px; height: 44px; border-radius: 50%; border: 2px solid var(--store-accent); overflow: hidden; display: grid; place-items: center; font-family: var(--store-display); font-weight: 700; flex: 0 0 auto; background: var(--store-card); }
        .campus-logo img { width: 100%; height: 100%; object-fit: cover; }
        .campus-header-copy { flex: 1; min-width: 0; }
        .campus-header-copy h1 { font-family: var(--store-display); font-size: clamp(18px, 3vw, 24px); margin: 0; }
        .campus-header-copy p { margin: 2px 0 0; font-size: 13px; color: var(--store-muted); }
        .campus-cart-toggle { display: flex; align-items: center; gap: 8px; background: var(--store-accent); color: var(--store-accent-text); border: none; border-radius: 999px; padding: 10px 18px; font-weight: 700; font-family: var(--store-mono); flex: 0 0 auto; }

        .campus-hub { padding: 32px 0 60px; }
        .campus-hub-title { font-family: var(--store-display); font-size: clamp(22px, 4vw, 32px); margin: 0 0 6px; }
        .campus-hub-sub { color: var(--store-muted); margin: 0 0 28px; font-size: 14px; }
        .campus-route { position: relative; display: flex; flex-direction: column; gap: 14px; padding-left: 4px; }
        .campus-route::before { content: ''; position: absolute; left: 39px; top: 30px; bottom: 30px; width: 2px; background-image: repeating-linear-gradient(to bottom, var(--store-accent) 0 6px, transparent 6px 12px); }
        .campus-stop { position: relative; display: flex; align-items: center; gap: 14px; background: var(--store-card); border: 1px solid var(--store-line); border-radius: 16px; padding: 14px 16px; text-align: left; z-index: 1; transition: transform .18s ease, border-color .18s ease; }
        .campus-stop:hover { transform: translateY(-2px); border-color: var(--store-accent); }
        .campus-stop-number { font-family: var(--store-mono); font-size: 11px; color: var(--store-accent); width: 20px; flex: 0 0 auto; }
        .campus-stop-badge { width: 52px; height: 52px; border-radius: 50%; border: 2px solid var(--store-accent); overflow: hidden; flex: 0 0 auto; background: var(--store-surface); display: grid; place-items: center; }
        .campus-stop-badge img { width: 100%; height: 100%; object-fit: cover; }
        .campus-stop-badge-fallback { font-family: var(--store-display); font-weight: 700; }
        .campus-stop-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
        .campus-stop-info strong { font-family: var(--store-display); font-size: 15.5px; }
        .campus-stop-desc { font-size: 12.5px; color: var(--store-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .campus-stop-meta { font-size: 11.5px; font-family: var(--store-mono); color: var(--store-accent); }
        .campus-stop-arrow { font-size: 18px; color: var(--store-accent); flex: 0 0 auto; }
        .campus-hub-empty { text-align: center; padding: 60px 20px; color: var(--store-muted); }

        .campus-vendor-sheet { position: fixed; inset: 0; z-index: 90; background: var(--store-surface); overflow-y: auto; animation: campusSheetIn .28s cubic-bezier(.22,1,.36,1); }
        @keyframes campusSheetIn { from { transform: translateY(24px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .campus-vendor-sheet-header { position: sticky; top: 0; background: var(--store-surface); border-bottom: 1px solid var(--store-line); padding: 16px 0; z-index: 2; }
        .campus-back-pill { display: inline-flex; align-items: center; gap: 6px; background: var(--store-card); border: 1px solid var(--store-line); border-radius: 999px; padding: 8px 16px; font-size: 12.5px; font-weight: 700; margin-bottom: 14px; }
        .campus-vendor-sheet-title { display: flex; align-items: center; gap: 14px; }
        .campus-vendor-sheet-title img { width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 2px solid var(--store-accent); }
        .campus-vendor-sheet-title h2 { font-family: var(--store-display); margin: 0; font-size: 20px; }
        .campus-vendor-sheet-title p { margin: 2px 0 0; font-size: 13px; color: var(--store-muted); }

        .campus-manifest { padding: 22px 0 60px; }
        .campus-manifest-label { font-family: var(--store-mono); font-size: 11px; text-transform: uppercase; letter-spacing: .08em; color: var(--store-muted); margin-bottom: 10px; }
        .campus-manifest-row { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px dashed var(--store-line); }
        .campus-manifest-line { font-family: var(--store-mono); font-size: 11px; color: var(--store-muted); width: 20px; flex: 0 0 auto; }
        .campus-manifest-name { flex: 1; min-width: 0; font-weight: 600; }
        .campus-manifest-price { font-family: var(--store-mono); font-size: 13.5px; color: var(--store-muted); }
        .campus-manifest-add { background: var(--store-accent); color: var(--store-accent-text); border: none; border-radius: 999px; padding: 7px 16px; font-size: 12.5px; font-weight: 700; flex: 0 0 auto; }
        .campus-qty-stepper { display: inline-flex; align-items: center; gap: 8px; background: var(--store-card); border: 1px solid var(--store-line); border-radius: 999px; padding: 4px 10px; flex: 0 0 auto; }
        .campus-qty-stepper button { border: none; background: none; width: 20px; height: 20px; font-size: 15px; line-height: 1; color: var(--store-ink); }
        .campus-qty-stepper b { font-family: var(--store-mono); font-size: 13px; min-width: 14px; text-align: center; }

        .campus-modal-overlay { position: fixed; inset: 0; z-index: 200; background: rgba(0,0,0,.5); display: grid; place-items: center; padding: 20px; }
        .campus-modal { background: var(--store-card); border-radius: 16px; padding: 24px; max-width: 380px; }
        .campus-modal p { margin: 0 0 18px; font-size: 14px; line-height: 1.5; }
        .campus-modal-actions { display: flex; gap: 10px; justify-content: flex-end; }
        .campus-modal-actions button { border-radius: 999px; padding: 9px 18px; font-size: 13px; font-weight: 700; border: none; cursor: pointer; }
        .campus-modal-actions .cancel { background: none; color: var(--store-muted); }
        .campus-modal-actions .confirm { background: var(--store-accent); color: var(--store-accent-text); }

        .campus-cta { display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: var(--store-accent); color: var(--store-accent-text); border: none; border-radius: 999px; padding: 13px 20px; font-weight: 700; font-size: 14px; }
        .campus-cta.block { width: 100%; }
        .campus-cta:disabled { opacity: .6; cursor: not-allowed; }

        .campus-cart-drawer { position: fixed; inset: 0; z-index: 120; pointer-events: none; }
        .campus-cart-overlay { position: absolute; inset: 0; background: rgba(0,0,0,.4); opacity: 0; transition: opacity .3s ease; }
        .campus-cart-panel { position: absolute; top: 0; right: 0; bottom: 0; width: 420px; max-width: 92vw; background: var(--store-surface); display: flex; flex-direction: column; transform: translateX(100%); transition: transform .35s cubic-bezier(.4,0,.2,1); }
        .campus-cart-drawer.open { pointer-events: auto; }
        .campus-cart-drawer.open .campus-cart-overlay { opacity: 1; }
        .campus-cart-drawer.open .campus-cart-panel { transform: translateX(0); }
        .campus-cart-head { display: flex; justify-content: space-between; align-items: flex-start; padding: 20px 22px; border-bottom: 1px solid var(--store-line); }
        .campus-cart-eyebrow { font-family: var(--store-mono); font-size: 10.5px; text-transform: uppercase; letter-spacing: .08em; color: var(--store-accent); }
        .campus-cart-head h3 { margin: 4px 0 0; font-family: var(--store-display); font-size: 17px; }
        .campus-icon-btn { border: none; background: none; font-size: 16px; cursor: pointer; color: var(--store-ink); }
        .campus-cart-body { flex: 1; overflow-y: auto; padding: 6px 22px 22px; }
        .campus-cart-empty { padding: 40px 10px; text-align: center; color: var(--store-muted); }
        .campus-cart-row { display: flex; align-items: center; gap: 10px; padding: 12px 0; border-bottom: 1px dashed var(--store-line); }
        .campus-cart-row-info { flex: 1; min-width: 0; }
        .campus-cart-row-name { margin: 0; font-weight: 600; font-size: 13.5px; }
        .campus-cart-row-price { margin: 2px 0 0; font-size: 12px; color: var(--store-muted); font-family: var(--store-mono); }
        .campus-cart-row-remove { border: none; background: none; color: var(--store-muted); font-size: 13px; }
        .campus-delivery-picker { margin: 16px 0; }
        .campus-field-label { display: block; font-size: 12px; font-weight: 700; margin-bottom: 8px; color: var(--store-muted); }
        .campus-chip-row { display: flex; flex-wrap: wrap; gap: 8px; }
        .campus-chip { border: 1px solid var(--store-line); background: var(--store-card); border-radius: 999px; padding: 8px 14px; font-size: 12.5px; font-family: var(--store-mono); }
        .campus-chip.active { background: var(--store-accent); color: var(--store-accent-text); border-color: var(--store-accent); }
        .campus-chip-empty { font-size: 12.5px; color: var(--store-muted); }
        .campus-cart-totals { display: grid; gap: 6px; margin: 16px 0; }
        .campus-total-row { display: flex; justify-content: space-between; font-size: 13px; color: var(--store-muted); font-family: var(--store-mono); }
        .campus-total-row.grand { font-size: 16px; color: var(--store-ink); font-weight: 800; }
        .campus-checkout-form { display: grid; gap: 9px; }
        .campus-checkout-form input, .campus-checkout-form textarea { width: 100%; padding: 11px 13px; border: 1.5px solid var(--store-line); border-radius: 12px; background: var(--store-card); outline: none; font: inherit; color: inherit; }
        .campus-checkout-form textarea { resize: vertical; }
        .campus-cart-success { padding: 60px 24px; text-align: center; }
        .campus-cart-success-badge { font-size: 40px; display: block; margin-bottom: 10px; }
        .campus-cart-success h4 { font-family: var(--store-display); margin: 0 0 8px; }
        .campus-cart-success p { color: var(--store-muted); font-size: 13.5px; margin: 0 0 20px; }

        @media (max-width: 640px) {
          .campus-cart-panel { width: 100%; max-width: 100%; }
        }
      `}</style>

      <header className="campus-header">
        <div className="store-wrap campus-header-inner">
          <div className="campus-logo">
            {store.logoUrl ? <img src={store.logoUrl} alt="" /> : (store.businessName || 'C').charAt(0)}
          </div>
          <div className="campus-header-copy">
            <h1>{heroHeadline}</h1>
            <p>{heroEyebrow || heroSubtext}</p>
          </div>
          <button type="button" className="campus-cart-toggle" onClick={() => setCartOpen(true)}>
            🧾 {cartCount}
          </button>
        </div>
      </header>

      <div className="store-wrap campus-hub">
        <h2 className="campus-hub-title">Vendor route</h2>
        <p className="campus-hub-sub">Tap a stop to browse what they've got — everything orders straight to WhatsApp.</p>
        {activeVendors.length ? (
          <div className="campus-route">
            {activeVendors.map((vendor, index) => (
              <CampusVendorCard key={vendor.id} vendor={vendor} index={index} onOpen={() => setOpenVendorId(vendor.id)} />
            ))}
          </div>
        ) : (
          <div className="campus-hub-empty">This store is still setting up its vendors — check back soon.</div>
        )}
      </div>

      {openVendor && (
        <div className="campus-vendor-sheet">
          <div className="store-wrap campus-vendor-sheet-header">
            <button type="button" className="campus-back-pill" onClick={() => setOpenVendorId(null)}>← All vendors</button>
            <div className="campus-vendor-sheet-title">
              {openVendor.image?.url && <img src={openVendor.image.url} alt="" />}
              <div>
                <h2>{openVendor.name}</h2>
                {openVendor.description && <p>{openVendor.description}</p>}
              </div>
            </div>
          </div>
          <div className="store-wrap campus-manifest">
            <p className="campus-manifest-label">Manifest</p>
            {(openVendor.products || []).length ? (
              (openVendor.products || []).map((product, index) => (
                <CampusProductRow
                  key={product.id}
                  product={product}
                  index={index}
                  quantity={quantityFor(product.id)}
                  formatCurrency={formatCurrency}
                  onAdd={() => handleAddToCart(product, openVendor)}
                  onIncrement={() => handleAddToCart(product, openVendor)}
                  onDecrement={() => updateQuantity(product.id, quantityFor(product.id) - 1)}
                />
              ))
            ) : (
              <div className="campus-hub-empty">This vendor hasn't listed any products yet.</div>
            )}
          </div>
        </div>
      )}

      {vendorConflict && (
        <div className="campus-modal-overlay">
          <div className="campus-modal">
            <p>Your ticket has items from <b>{activeVendorName}</b>. Starting an order with <b>{vendorConflict.vendor.name}</b> will clear your current ticket.</p>
            <div className="campus-modal-actions">
              <button type="button" className="cancel" onClick={() => setVendorConflict(null)}>Cancel</button>
              <button type="button" className="confirm" onClick={confirmVendorSwitch}>Clear ticket &amp; continue</button>
            </div>
          </div>
        </div>
      )}

      <CampusCartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        vendorName={activeVendorName}
        cart={cart}
        cartCount={cartCount}
        cartSubtotal={cartSubtotal}
        deliveryLocations={deliveryLocations}
        selectedLocationId={selectedLocationId}
        onSelectLocation={setSelectedLocationId}
        updateQuantity={updateQuantity}
        removeItem={removeItem}
        customer={customer}
        onCustomerChange={updateCustomer}
        onSubmit={handleCheckout}
        submitting={submitting}
        orderPlaced={orderPlaced}
        onContinueShopping={() => { setOrderPlaced(false); setCartOpen(false); }}
        formatCurrency={formatCurrency}
      />

      <StoreFooter store={store} footerText={footerText} visibleSocialLinks={visibleSocialLinks} businessTypeLabel={businessTypeLabel} />

      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </main>
  );
}
