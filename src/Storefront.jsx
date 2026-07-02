import { useEffect, useMemo, useState } from 'react';
import { addDoc, collection, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { getReadableTextColor, getStoreTemplate } from './storeTemplates';
import { createStoreSlug } from './storeLinks';

function formatCurrency(value) {
  const amount = Number(value || 0);
  return `NGN ${amount.toLocaleString()}`;
}

export default function Storefront({ slug }) {
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '', note: '' });
  const [checkoutError, setCheckoutError] = useState('');
  const [checkoutSuccess, setCheckoutSuccess] = useState('');
  const [submittingOrder, setSubmittingOrder] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadStore() {
      setLoading(true);
      setNotFound(false);
      try {
        const storeSnap = await getDoc(doc(db, 'publicStores', createStoreSlug(slug)));
        if (!active) return;

        if (storeSnap.exists()) {
          setStore(storeSnap.data());
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error('Public storefront load failed:', error);
        if (active) setNotFound(true);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadStore();
    return () => {
      active = false;
    };
  }, [slug]);

  const template = useMemo(() => getStoreTemplate(store?.template), [store?.template]);
  const primaryColor = store?.primaryColor || template.accent;
  const accentTextColor = getReadableTextColor(primaryColor, template.ink);
  const products = Array.isArray(store?.products) ? store.products.filter((product) => product?.name && product?.imageUrl) : [];
  const deliveryFee = Number(store?.deliveryFee || 0);
  const cartSubtotal = cart.reduce((total, item) => total + Number(item.price || 0) * item.quantity, 0);
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartSubtotal + (cart.length ? deliveryFee : 0);

  const addToCart = (product) => {
    setCheckoutError('');
    setCheckoutSuccess('');
    setCart((current) => {
      const stock = Number(product.stock || 0);
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) => (
          item.id === product.id
            ? { ...item, quantity: stock ? Math.min(item.quantity + 1, stock) : item.quantity + 1 }
            : item
        ));
      }

      return [
        ...current,
        {
          id: product.id || product.imageUrl || product.name,
          name: product.name,
          price: Number(product.price || 0),
          imageUrl: product.imageUrl,
          stock,
          quantity: 1,
        },
      ];
    });
  };

  const updateCartQuantity = (productId, quantity) => {
    setCheckoutError('');
    setCheckoutSuccess('');
    setCart((current) => current
      .map((item) => {
        if (item.id !== productId) return item;
        const max = Number(item.stock || 0);
        const nextQuantity = Math.max(0, max ? Math.min(quantity, max) : quantity);
        return { ...item, quantity: nextQuantity };
      })
      .filter((item) => item.quantity > 0));
  };

  const removeFromCart = (productId) => {
    setCart((current) => current.filter((item) => item.id !== productId));
  };

  const updateCustomer = (field, value) => {
    setCustomer((current) => ({ ...current, [field]: value }));
    setCheckoutError('');
    setCheckoutSuccess('');
  };

  const handleCheckout = async (event) => {
    event.preventDefault();
    setCheckoutError('');
    setCheckoutSuccess('');

    if (!cart.length) {
      setCheckoutError('Add at least one product to your cart.');
      return;
    }

    const name = customer.name.trim();
    const phone = customer.phone.trim();
    const address = customer.address.trim();

    if (!name || !phone || !address) {
      setCheckoutError('Enter your name, phone number, and delivery address.');
      return;
    }

    setSubmittingOrder(true);
    try {
      const orderItems = cart.map((item) => ({
        productId: item.id,
        name: item.name,
        price: Number(item.price || 0),
        quantity: item.quantity,
        imageUrl: item.imageUrl || '',
        subtotal: Number(item.price || 0) * item.quantity,
      }));

      await addDoc(collection(db, 'orders'), {
        storeId: store.ownerId,
        storeSlug: store.storeSlug,
        storeName: store.businessName,
        customerName: name,
        customerPhone: phone,
        customerAddress: address,
        customerNote: customer.note.trim(),
        items: orderItems,
        subtotal: cartSubtotal,
        deliveryFee,
        total: cartTotal,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      setCart([]);
      setCustomer({ name: '', phone: '', address: '', note: '' });
      setCheckoutSuccess('Order placed. The seller will contact you shortly.');
    } catch (error) {
      console.error('Order creation failed:', error);
      setCheckoutError('Order could not be placed. Please try again or call the store.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="storefront-loading">
        <style>{`
          .storefront-loading { min-height: 100vh; display: grid; place-items: center; background: #f6f8f1; color: #192328; font-family: Raleway, system-ui, sans-serif; }
          .storefront-loader { width: 42px; height: 42px; border: 3px solid #e3e8d9; border-top-color: #192328; border-radius: 999px; animation: spin .8s linear infinite; margin: 0 auto 12px; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
        <div>
          <div className="storefront-loader" />
          <p>Loading store...</p>
        </div>
      </div>
    );
  }

  if (notFound || !store) {
    return (
      <div className="storefront-empty">
        <style>{`
          .storefront-empty { min-height: 100vh; display: grid; place-items: center; padding: 24px; background: #0f1518; color: #f6f8f1; font-family: Raleway, system-ui, sans-serif; text-align: center; }
          .storefront-empty h1 { margin: 0 0 8px; font-size: clamp(28px, 5vw, 44px); }
          .storefront-empty p { margin: 0; color: #93a2a6; }
        `}</style>
        <div>
          <h1>Store not found</h1>
          <p>This Blorbify store is not published yet.</p>
        </div>
      </div>
    );
  }

  return (
    <main className={`storefront storefront-${template.id}`}>
      <style>{`
        .storefront {
          --store-accent: ${primaryColor};
          --store-accent-text: ${accentTextColor};
          --store-ink: ${template.ink};
          --store-surface: ${template.surface};
          --store-card: #ffffff;
          --store-muted: color-mix(in srgb, var(--store-ink) 68%, #ffffff);
          min-height: 100vh;
          background: var(--store-surface);
          color: var(--store-ink);
          font-family: Raleway, system-ui, sans-serif;
        }
        .storefront * { box-sizing: border-box; }
        .store-wrap { width: min(1120px, calc(100% - 32px)); margin: 0 auto; }
        .store-hero { padding: 28px 0 34px; }
        .store-nav { display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 16px 0 28px; }
        .store-brand { display: flex; align-items: center; gap: 12px; min-width: 0; }
        .store-logo { width: 48px; height: 48px; border-radius: 8px; background: var(--store-accent); display: grid; place-items: center; overflow: hidden; color: var(--store-accent-text); font-weight: 900; flex: 0 0 auto; }
        .store-logo img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .store-brand strong { display: block; font-size: 18px; overflow-wrap: anywhere; }
        .store-brand span { display: block; color: var(--store-muted); font-size: 13px; margin-top: 2px; }
        .store-contact { border: 1px solid color-mix(in srgb, var(--store-ink) 13%, transparent); border-radius: 999px; color: var(--store-ink); text-decoration: none; padding: 10px 14px; font-weight: 800; font-size: 13px; background: rgba(255,255,255,.48); }
        .store-hero-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(280px, .75fr); gap: clamp(22px, 5vw, 64px); align-items: end; padding: clamp(24px, 5vw, 58px); border-radius: 8px; background: #fff; border: 1px solid color-mix(in srgb, var(--store-ink) 10%, transparent); background-position: center; background-size: cover; }
        .store-hero-grid.has-banner { color: #fff; min-height: clamp(440px, 58vh, 620px); border-color: rgba(255,255,255,.18); }
        .store-hero h1 { margin: 0; font-size: clamp(38px, 7vw, 78px); line-height: .95; letter-spacing: 0; max-width: 760px; }
        .store-hero p { color: var(--store-muted); line-height: 1.7; margin: 18px 0 0; max-width: 620px; }
        .store-hero-grid.has-banner .store-hero-copy p { color: rgba(255,255,255,.84); }
        .store-pill { display: inline-flex; width: fit-content; border-radius: 999px; background: var(--store-accent); color: var(--store-accent-text); padding: 8px 12px; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: .08em; margin-bottom: 16px; }
        .store-feature { border-radius: 8px; background: var(--store-ink); color: #fff; padding: 22px; }
        .store-feature span { color: color-mix(in srgb, var(--store-accent) 45%, white); font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: .08em; }
        .store-feature strong { display: block; font-size: 26px; margin-top: 10px; }
        .store-feature small { display: block; margin-top: 8px; color: rgba(255,255,255,.72); font-size: 13px; font-weight: 800; }
        .store-hero-grid.has-banner .store-feature { background: rgba(15,21,24,.72); border: 1px solid rgba(255,255,255,.14); }
        .store-products { padding: 18px 0 56px; }
        .store-section-head { display: flex; align-items: end; justify-content: space-between; gap: 18px; margin-bottom: 18px; }
        .store-section-head h2 { margin: 0; font-size: clamp(24px, 4vw, 38px); }
        .store-section-head p { margin: 0; color: var(--store-muted); }
        .store-shop-layout { display: grid; grid-template-columns: minmax(0, 1fr) 360px; gap: 18px; align-items: start; }
        .store-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
        .store-product { background: #fff; border: 1px solid color-mix(in srgb, var(--store-ink) 10%, transparent); border-radius: 8px; overflow: hidden; min-width: 0; }
        .store-product img { width: 100%; aspect-ratio: 1 / .82; object-fit: cover; display: block; background: #e8eddf; }
        .store-product-body { padding: 14px; display: grid; gap: 9px; }
        .store-product h3 { margin: 0; font-size: 17px; letter-spacing: 0; overflow-wrap: anywhere; }
        .store-product p { margin: 0; color: var(--store-muted); font-size: 13px; line-height: 1.5; }
        .store-product-footer { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
        .store-price { font-weight: 900; font-size: 16px; }
        .store-stock { color: var(--store-muted); font-size: 12px; font-weight: 800; }
        .store-add { width: 100%; border: 0; border-radius: 999px; background: var(--store-accent); color: var(--store-accent-text); display: inline-flex; align-items: center; justify-content: center; padding: 11px 14px; font: inherit; font-size: 13px; font-weight: 900; cursor: pointer; }
        .store-add:disabled { opacity: .55; cursor: not-allowed; }
        .store-cart { position: sticky; top: 16px; border: 1px solid color-mix(in srgb, var(--store-ink) 10%, transparent); border-radius: 8px; background: #fff; padding: 16px; display: grid; gap: 14px; min-width: 0; }
        .store-cart-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .store-cart h3 { margin: 0; font-size: 20px; }
        .store-cart-count { border-radius: 999px; background: color-mix(in srgb, var(--store-accent) 22%, #fff); color: var(--store-ink); padding: 5px 9px; font-size: 12px; font-weight: 900; }
        .store-cart-items { display: grid; gap: 10px; }
        .store-cart-item { display: grid; grid-template-columns: 54px minmax(0, 1fr); gap: 10px; align-items: center; }
        .store-cart-item img { width: 54px; height: 54px; border-radius: 8px; object-fit: cover; background: #e8eddf; }
        .store-cart-item strong { display: block; color: var(--store-ink); font-size: 13px; overflow-wrap: anywhere; }
        .store-cart-item span { color: var(--store-muted); font-size: 12px; }
        .store-cart-controls { display: flex; align-items: center; gap: 6px; margin-top: 7px; }
        .store-cart-controls button { width: 28px; height: 28px; border-radius: 999px; border: 1px solid color-mix(in srgb, var(--store-ink) 12%, transparent); background: #fff; color: var(--store-ink); font: inherit; font-weight: 900; cursor: pointer; }
        .store-cart-controls b { min-width: 20px; text-align: center; color: var(--store-ink); font-size: 13px; }
        .store-remove { margin-left: auto; width: auto !important; padding: 0 8px; color: #9d2525 !important; }
        .store-totals { border-top: 1px solid color-mix(in srgb, var(--store-ink) 10%, transparent); padding-top: 12px; display: grid; gap: 8px; }
        .store-total-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; color: var(--store-muted); font-size: 13px; font-weight: 800; }
        .store-total-row strong { color: var(--store-ink); font-size: 16px; }
        .store-checkout { display: grid; gap: 10px; }
        .store-checkout label { display: grid; gap: 6px; color: var(--store-muted); font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: .04em; }
        .store-checkout input, .store-checkout textarea { width: 100%; border: 1px solid color-mix(in srgb, var(--store-ink) 12%, transparent); border-radius: 8px; background: #fff; color: var(--store-ink); font: inherit; font-size: 14px; padding: 11px 12px; outline: none; }
        .store-checkout textarea { min-height: 72px; resize: vertical; }
        .store-checkout input:focus, .store-checkout textarea:focus { border-color: var(--store-accent); box-shadow: 0 0 0 4px color-mix(in srgb, var(--store-accent) 18%, transparent); }
        .store-checkout button { border: 0; border-radius: 999px; background: var(--store-ink); color: #fff; padding: 12px 15px; font: inherit; font-weight: 900; cursor: pointer; }
        .store-checkout button:disabled { opacity: .6; cursor: not-allowed; }
        .store-alert { border-radius: 8px; padding: 10px 11px; font-size: 12px; font-weight: 800; line-height: 1.45; }
        .store-alert.error { color: #9d2525; background: rgba(255,107,107,.1); border: 1px solid rgba(255,107,107,.24); }
        .store-alert.success { color: #3d5900; background: rgba(175,255,0,.18); border: 1px solid rgba(175,255,0,.32); }
        .store-empty { border: 1px dashed color-mix(in srgb, var(--store-ink) 18%, transparent); border-radius: 8px; padding: 34px 18px; text-align: center; color: color-mix(in srgb, var(--store-ink) 60%, transparent); background: rgba(255,255,255,.55); }
        .storefront-elegant .store-hero-grid { border-radius: 0; }
        .storefront-elegant .store-product, .storefront-elegant .store-logo { border-radius: 0; }
        .storefront-bold .store-hero-grid { background: var(--store-ink); color: #fff; }
        .storefront-bold .store-hero p { color: rgba(255,255,255,.72); }
        .storefront-bold .store-hero-grid.has-banner { background-position: center; background-size: cover; }
        .storefront-minimal .store-hero-grid { box-shadow: none; background: transparent; padding-left: 0; padding-right: 0; }
        @media (max-width: 820px) {
          .store-hero-grid, .store-grid, .store-shop-layout { grid-template-columns: 1fr; }
          .store-cart { position: static; }
          .store-section-head { display: block; }
          .store-section-head p { margin-top: 6px; }
        }
        @media (max-width: 560px) {
          .store-contact { display: none; }
          .store-hero-grid { padding: 22px; }
          .store-nav { align-items: flex-start; }
        }
      `}</style>

      <section className="store-hero">
        <div className="store-wrap">
          <nav className="store-nav">
            <div className="store-brand">
              <div className="store-logo">
                {store.logoUrl ? <img src={store.logoUrl} alt={`${store.businessName} logo`} /> : store.businessName.charAt(0)}
              </div>
              <div>
                <strong>{store.businessName}</strong>
                <span>{[store.city, store.state].filter(Boolean).join(', ') || store.businessType || 'Online store'}</span>
              </div>
            </div>
            {store.phone && <a className="store-contact" href={`tel:${store.phone}`}>Call store</a>}
          </nav>

          <div className={`store-hero-grid ${store.bannerUrl ? 'has-banner' : ''}`} style={store.bannerUrl ? { backgroundImage: `linear-gradient(rgba(15,21,24,.52), rgba(15,21,24,.52)), url("${store.bannerUrl}")` } : undefined}>
            <div className="store-hero-copy">
              <span className="store-pill">{store.businessType || 'Open online'}</span>
              <h1>{store.businessName}</h1>
              <p>{store.description || 'Browse our products and contact us to place your order.'}</p>
            </div>
            <div className="store-feature">
              <span>Products</span>
              <strong>{products.length || 'Coming soon'}</strong>
              <small>Delivery fee: {formatCurrency(deliveryFee)}</small>
            </div>
          </div>
        </div>
      </section>

      <section className="store-products">
        <div className="store-wrap">
          <div className="store-section-head">
            <h2>Shop products</h2>
            <p>{products.length ? 'Fresh picks from this seller.' : 'This seller is preparing their catalog.'}</p>
          </div>

          <div className="store-shop-layout">
            <div className="store-shop-main">
              {products.length ? (
                <div className="store-grid">
                  {products.map((product) => {
                    const stock = Number(product.stock || 0);
                    return (
                    <article className="store-product" key={product.id || product.imageUrl || product.name}>
                      <img src={product.imageUrl} alt={product.name} />
                      <div className="store-product-body">
                        <div>
                          <h3>{product.name}</h3>
                          {product.description && <p>{product.description}</p>}
                        </div>
                        <div className="store-product-footer">
                          <span className="store-price">{formatCurrency(product.price)}</span>
                          <span className="store-stock">{stock} in stock</span>
                        </div>
                        <button className="store-add" type="button" onClick={() => addToCart(product)} disabled={stock <= 0}>
                          {stock <= 0 ? 'Out of stock' : 'Add to cart'}
                        </button>
                      </div>
                    </article>
                    );
                  })}
                </div>
              ) : (
                <div className="store-empty">No products have been published yet.</div>
              )}
            </div>

            <aside className="store-cart" aria-label="Shopping cart">
              <div className="store-cart-head">
                <h3>Cart</h3>
                <span className="store-cart-count">{cartCount} item{cartCount === 1 ? '' : 's'}</span>
              </div>

              {cart.length ? (
                <div className="store-cart-items">
                  {cart.map((item) => (
                    <div className="store-cart-item" key={item.id}>
                      <img src={item.imageUrl} alt="" />
                      <div>
                        <strong>{item.name}</strong>
                        <span>{formatCurrency(item.price)}</span>
                        <div className="store-cart-controls">
                          <button type="button" onClick={() => updateCartQuantity(item.id, item.quantity - 1)} aria-label={`Reduce ${item.name}`}>-</button>
                          <b>{item.quantity}</b>
                          <button type="button" onClick={() => updateCartQuantity(item.id, item.quantity + 1)} aria-label={`Increase ${item.name}`}>+</button>
                          <button type="button" className="store-remove" onClick={() => removeFromCart(item.id)}>Remove</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="store-empty">Your cart is empty.</div>
              )}

              <div className="store-totals">
                <div className="store-total-row">
                  <span>Subtotal</span>
                  <b>{formatCurrency(cartSubtotal)}</b>
                </div>
                <div className="store-total-row">
                  <span>Delivery</span>
                  <b>{cart.length ? formatCurrency(deliveryFee) : formatCurrency(0)}</b>
                </div>
                <div className="store-total-row">
                  <span>Total</span>
                  <strong>{formatCurrency(cartTotal)}</strong>
                </div>
              </div>

              <form className="store-checkout" onSubmit={handleCheckout}>
                <label>
                  Name
                  <input value={customer.name} onChange={(event) => updateCustomer('name', event.target.value)} placeholder="Your name" />
                </label>
                <label>
                  Phone number
                  <input value={customer.phone} onChange={(event) => updateCustomer('phone', event.target.value)} placeholder="080..." />
                </label>
                <label>
                  Delivery address
                  <textarea value={customer.address} onChange={(event) => updateCustomer('address', event.target.value)} placeholder="Street, area, city" />
                </label>
                <label>
                  Note
                  <textarea value={customer.note} onChange={(event) => updateCustomer('note', event.target.value)} placeholder="Color, size, or delivery note" />
                </label>

                {checkoutError && <div className="store-alert error">{checkoutError}</div>}
                {checkoutSuccess && <div className="store-alert success">{checkoutSuccess}</div>}

                <button type="submit" disabled={submittingOrder || !cart.length}>
                  {submittingOrder ? 'Placing order...' : 'Checkout'}
                </button>
              </form>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
