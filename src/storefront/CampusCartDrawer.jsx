import { SocialIcon } from './icons';

export default function CampusCartDrawer({
  open,
  onClose,
  vendorName,
  cart,
  cartCount,
  cartSubtotal,
  deliveryLocations,
  selectedLocationId,
  onSelectLocation,
  updateQuantity,
  removeItem,
  customer,
  onCustomerChange,
  onSubmit,
  submitting,
  orderPlaced,
  onContinueShopping,
  formatCurrency,
}) {
  const selectedLocation = deliveryLocations.find((location) => location.id === selectedLocationId) || null;
  const deliveryPrice = selectedLocation ? Number(selectedLocation.price || 0) : 0;
  const grandTotal = cartSubtotal + deliveryPrice;

  return (
    <div className={`campus-cart-drawer ${open ? 'open' : ''}`} aria-hidden={!open}>
      <div className="campus-cart-overlay" onClick={onClose} />
      <aside className="campus-cart-panel" aria-label="Your order ticket">
        <div className="campus-cart-head">
          <div>
            <span className="campus-cart-eyebrow">Order ticket</span>
            <h3>{vendorName || 'Your cart'}{cartCount > 0 ? ` · ${cartCount} item${cartCount === 1 ? '' : 's'}` : ''}</h3>
          </div>
          <button type="button" className="campus-icon-btn" onClick={onClose} aria-label="Close cart">✕</button>
        </div>

        {orderPlaced ? (
          <div className="campus-cart-success">
            <span className="campus-cart-success-badge">🛵</span>
            <h4>Order sent!</h4>
            <p>Your ticket was sent on WhatsApp — Campus Runs will confirm your delivery shortly.</p>
            <button type="button" className="campus-cta block" onClick={onContinueShopping}>Order from another vendor</button>
          </div>
        ) : (
          <div className="campus-cart-body">
            {cart.length ? (
              <div className="campus-cart-items">
                {cart.map((item) => (
                  <div className="campus-cart-row" key={item.id}>
                    <div className="campus-cart-row-info">
                      <p className="campus-cart-row-name">{item.name}</p>
                      <p className="campus-cart-row-price">{formatCurrency(item.price)} × {item.quantity}</p>
                    </div>
                    <div className="campus-qty-stepper">
                      <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label={`Reduce ${item.name}`}>−</button>
                      <b>{item.quantity}</b>
                      <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label={`Increase ${item.name}`}>+</button>
                    </div>
                    <button type="button" className="campus-cart-row-remove" onClick={() => removeItem(item.id)} aria-label={`Remove ${item.name}`}>✕</button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="campus-cart-empty">
                <p>Your ticket is empty — pick a vendor and add something to order.</p>
              </div>
            )}

            {cart.length > 0 && (
              <>
                <div className="campus-delivery-picker">
                  <span className="campus-field-label">Delivery location</span>
                  <div className="campus-chip-row">
                    {deliveryLocations.length ? deliveryLocations.map((location) => (
                      <button
                        type="button"
                        key={location.id}
                        className={`campus-chip ${selectedLocationId === location.id ? 'active' : ''}`}
                        onClick={() => onSelectLocation(location.id)}
                      >
                        {location.name} · {formatCurrency(location.price)}
                      </button>
                    )) : (
                      <span className="campus-chip-empty">No delivery locations set up yet — contact the store.</span>
                    )}
                  </div>
                </div>

                <div className="campus-cart-totals">
                  <div className="campus-total-row"><span>Items</span><span>{formatCurrency(cartSubtotal)}</span></div>
                  <div className="campus-total-row"><span>Delivery</span><span>{selectedLocation ? formatCurrency(deliveryPrice) : '—'}</span></div>
                  <div className="campus-total-row grand"><span>Total</span><span>{formatCurrency(grandTotal)}</span></div>
                </div>

                <form className="campus-checkout-form" onSubmit={onSubmit}>
                  <input value={customer.name} onChange={(event) => onCustomerChange('name', event.target.value)} placeholder="Your name" />
                  <input type="tel" value={customer.phone} onChange={(event) => onCustomerChange('phone', event.target.value)} placeholder="Phone number" />
                  <textarea value={customer.note} onChange={(event) => onCustomerChange('note', event.target.value)} placeholder="Room number / note for the rider (optional)" rows="2" />
                  <button type="submit" className="campus-cta block" disabled={submitting || !cart.length}>
                    <SocialIcon type="whatsapp" size={16} /> {submitting ? 'Opening WhatsApp...' : 'Send order on WhatsApp'}
                  </button>
                </form>
              </>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}
