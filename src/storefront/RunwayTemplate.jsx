import { productKey } from './useCart';
import { StoreIcon } from './icons';
import { sharedStorefrontStyles } from './sharedStorefrontStyles';
import RunwayProductCard from './RunwayProductCard';
import ProductDetail from './ProductDetail';
import CartDrawer from './CartDrawer';
import StoreFooter from './StoreFooter';
import { ToastStack } from './Toast';

export default function RunwayTemplate(props) {
  const {
    store, theme, accentTextColor, copy, businessTypeLabel, visibleSocialLinks, footerText,
    filteredProducts, productCategories, activeCategory, setActiveCategory, searchTerm, setSearchTerm,
    featuredImage, heroHeadline, heroSubtext, heroEyebrow, productsSubheading, products,
    formatCurrency, wishlist, isWished, toggleWishlist, addToCart, selectedProduct, setSelectedProduct, productShareUrl,
    cart, cartCount, cartSubtotal, cartTotal, deliveryFee, freeShippingThreshold, updateQuantity, removeItem,
    cartOpen, setCartOpen, closeCart, mobileMenuOpen, setMobileMenuOpen,
    customer, updateCustomer, handleCheckout, submittingOrder, orderPlaced, digitalDelivery,
    whatsappEnabled, handleWhatsAppCheckout, couponCode, setCouponCode,
    newsletterEmail, setNewsletterEmail, handleNewsletterSubmit,
    toasts, dismiss,
  } = props;

  return (
    <main className="storefront runway">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700;800&display=swap');

        .storefront.runway {
          --store-accent: ${theme.primaryColor};
          --store-accent-text: ${accentTextColor};
          --store-ink: ${theme.textColor};
          --store-surface: ${theme.backgroundColor};
          --store-card: ${theme.cardColor};
          --store-button: ${theme.buttonColor};
          --store-button-text: ${theme.buttonTextColor};
          --store-muted: color-mix(in srgb, var(--store-ink) 62%, transparent);
          --store-faint: color-mix(in srgb, var(--store-ink) 42%, transparent);
          --store-line: color-mix(in srgb, var(--store-ink) 16%, transparent);
          --store-display: 'Anton', 'Inter', system-ui, sans-serif;
          min-height: 100vh;
          background: var(--store-surface);
          color: var(--store-ink);
          font-family: 'Inter', system-ui, sans-serif;
        }
        ${sharedStorefrontStyles}

        .runway-announce { background: var(--store-ink); color: var(--store-surface); text-align: center; font-size: 11.5px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; padding: 9px 16px; }

        .runway-header { position: sticky; top: 0; z-index: 60; background: var(--store-surface); border-bottom: 2px solid var(--store-ink); }
        .runway-header-inner { display: flex; align-items: center; gap: 20px; padding: 18px 0; }
        .runway-brand { display: flex; align-items: center; gap: 12px; margin-right: auto; min-width: 0; text-decoration: none; }
        .runway-logo { width: 40px; height: 40px; background: var(--store-ink); color: var(--store-surface); display: grid; place-items: center; font-family: var(--store-display); font-size: 16px; overflow: hidden; flex: 0 0 auto; }
        .runway-logo img { width: 100%; height: 100%; object-fit: cover; }
        .runway-brand strong { font-family: var(--store-display); font-size: 20px; letter-spacing: .01em; text-transform: uppercase; overflow-wrap: anywhere; }
        .runway-brand span { display: block; color: var(--store-muted); font-size: 11px; margin-top: 1px; font-weight: 600; }
        .runway-nav-links { display: flex; gap: 28px; font-size: 12.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; }
        .runway-nav-links a { position: relative; padding-bottom: 3px; }
        .runway-nav-links a::after { content: ''; position: absolute; left: 0; right: 100%; bottom: 0; height: 2px; background: var(--store-accent); transition: right .2s ease; }
        .runway-nav-links a:hover::after { right: 0; }
        .runway-header-actions { display: flex; align-items: center; gap: 6px; }
        .runway-search { display: flex; align-items: center; gap: 8px; background: color-mix(in srgb, var(--store-ink) 6%, transparent); padding: 9px 14px; width: 190px; }
        .runway-search input { border: 0; outline: 0; background: transparent; width: 100%; font-size: 13px; }

        .mobile-menu { position: fixed; inset: 0; z-index: 90; pointer-events: none; }
        .mobile-menu-overlay { position: absolute; inset: 0; background: rgba(0,0,0,.55); opacity: 0; transition: opacity .25s ease; }
        .mobile-menu-panel { position: absolute; top: 0; left: 0; bottom: 0; width: 82%; max-width: 320px; background: var(--store-surface); padding: 20px; transform: translateX(-100%); transition: transform .3s cubic-bezier(.4,0,.2,1); display: flex; flex-direction: column; gap: 24px; border-right: 2px solid var(--store-ink); }
        .mobile-menu.open { pointer-events: auto; }
        .mobile-menu.open .mobile-menu-overlay { opacity: 1; }
        .mobile-menu.open .mobile-menu-panel { transform: translateX(0); }
        .mobile-menu-panel nav { display: flex; flex-direction: column; gap: 18px; font-size: 16px; font-weight: 700; text-transform: uppercase; }

        .runway-hero { border-bottom: 2px solid var(--store-ink); }
        .runway-hero-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(300px, .9fr); align-items: stretch; min-height: clamp(360px, 52vw, 560px); }
        .runway-hero-copy { padding: clamp(28px, 5vw, 56px) clamp(20px, 4vw, 40px); display: flex; flex-direction: column; justify-content: center; border-right: 2px solid var(--store-ink); }
        .runway-issue { display: inline-flex; align-items: center; gap: 10px; font-size: 12px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: var(--store-accent); margin-bottom: 18px; }
        .runway-issue::before { content: ''; width: 30px; height: 2px; background: var(--store-accent); }
        .runway-hero h1 { color: inherit; margin: 0; font-family: var(--store-display); font-weight: 400; font-size: clamp(46px, 8vw, 92px); line-height: .92; text-transform: uppercase; letter-spacing: -.01em; }
        .runway-hero h1 em { font-style: normal; -webkit-text-stroke: 2px var(--store-ink); color: var(--store-surface); }
        .runway-hero p { margin: 24px 0 0; color: var(--store-muted); font-size: 15.5px; line-height: 1.65; max-width: 420px; font-weight: 500; }
        .runway-hero-ctas { display: flex; gap: 14px; flex-wrap: wrap; margin-top: 30px; }
        .store-cta { display: inline-flex; align-items: center; justify-content: center; gap: 8px; border: 2px solid var(--store-button); border-radius: 0; background: var(--store-button); color: var(--store-button-text); padding: 15px 28px; font-weight: 700; font-size: 12.5px; text-transform: uppercase; letter-spacing: .05em; text-decoration: none; transition: background .15s ease, color .15s ease; white-space: nowrap; }
        .store-cta:hover { background: var(--store-accent); border-color: var(--store-accent); color: var(--store-accent-text); }
        .store-cta.secondary { background: var(--store-surface); color: var(--store-ink); border-color: var(--store-ink); }
        .store-cta.secondary:hover { background: var(--store-ink); color: var(--store-surface); }
        .store-cta.block { width: 100%; }
        .whatsapp-cta { background: #25D366; color: #fff; border-color: #25D366; margin-top: 4px; }
        .store-cta:disabled { opacity: .5; cursor: not-allowed; }
        .runway-hero-art { position: relative; overflow: hidden; background: var(--store-card); }
        .runway-hero-art img { width: 100%; height: 100%; object-fit: cover; }
        .runway-hero-tag { position: absolute; top: 20px; right: 20px; background: var(--store-surface); border: 2px solid var(--store-ink); padding: 8px 14px; font-family: var(--store-display); font-size: 13px; text-transform: uppercase; letter-spacing: .04em; }

        .runway-products { padding: clamp(40px, 6vw, 68px) 0 60px; }
        .runway-section-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; margin-bottom: 30px; flex-wrap: wrap; padding-bottom: 20px; border-bottom: 2px solid var(--store-ink); }
        .runway-section-head h2 { color: inherit; margin: 0; font-family: var(--store-display); font-size: clamp(28px, 4.5vw, 44px); font-weight: 400; text-transform: uppercase; }
        .runway-section-head p { margin: 8px 0 0; color: var(--store-muted); font-weight: 500; }
        .runway-filters { display: flex; gap: 8px; flex-wrap: wrap; }
        .runway-filter-pill { padding: 9px 16px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .03em; border: 2px solid var(--store-ink); background: var(--store-surface); color: var(--store-ink); transition: all .15s ease; }
        .runway-filter-pill:hover, .runway-filter-pill.active { background: var(--store-ink); color: var(--store-surface); }

        .runway-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 2px; background: var(--store-ink); border: 2px solid var(--store-ink); }
        .runway-card { min-width: 0; background: var(--store-surface); }
        .runway-card-media { position: relative; aspect-ratio: 3 / 4; overflow: hidden; background: var(--store-card); cursor: pointer; }
        .runway-card-media img { width: 100%; height: 100%; object-fit: cover; transition: transform .4s ease; }
        .runway-card-media:hover img { transform: scale(1.05); }
        .runway-look { position: absolute; top: 10px; left: 10px; font-family: var(--store-display); font-size: 11px; letter-spacing: .05em; text-transform: uppercase; padding: 5px 10px; background: var(--store-surface); border: 1.5px solid var(--store-ink); z-index: 2; }
        .runway-badge { position: absolute; top: 10px; right: 10px; font-size: 10px; font-weight: 800; text-transform: uppercase; padding: 5px 9px; background: var(--store-accent); color: var(--store-accent-text); z-index: 2; }
        .runway-badge.out { background: color-mix(in srgb, var(--store-ink) 85%, transparent); color: var(--store-surface); }
        .runway-wish { position: absolute; bottom: 10px; right: 10px; width: 32px; height: 32px; border-radius: 50%; background: var(--store-surface); border: 1.5px solid var(--store-ink); display: flex; align-items: center; justify-content: center; color: var(--store-ink); z-index: 2; }
        .runway-wish.active { color: var(--store-accent); }
        .runway-wish.active svg { fill: var(--store-accent); }
        .runway-card-body { padding: 14px; }
        .runway-card-cat { margin: 0 0 5px; font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--store-faint); }
        .runway-card-name { margin: 0 0 10px; font-size: 15px; font-weight: 800; cursor: pointer; overflow-wrap: anywhere; text-transform: uppercase; }
        .runway-card-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
        .runway-card-price { font-weight: 800; font-size: 14.5px; }
        .runway-card-add { border: 2px solid var(--store-ink); background: transparent; color: var(--store-ink); padding: 8px 14px; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: .03em; }
        .runway-card-add:hover:not(:disabled) { background: var(--store-ink); color: var(--store-surface); }
        .runway-card-add:disabled { opacity: .5; cursor: not-allowed; }
        .store-empty { grid-column: 1 / -1; padding: 44px 18px; text-align: center; color: var(--store-muted); font-weight: 600; background: var(--store-surface); }

        .store-newsletter { padding: 0 0 66px; }
        .store-newsletter-inner { background: var(--store-ink); color: var(--store-surface); padding: clamp(30px, 5vw, 52px); display: flex; align-items: center; justify-content: space-between; gap: 28px; flex-wrap: wrap; }
        .store-newsletter-inner h2 { color: inherit; font-family: var(--store-display); font-size: 30px; margin: 0 0 6px; text-transform: uppercase; font-weight: 400; }
        .store-newsletter-inner p { margin: 0; color: color-mix(in srgb, var(--store-surface) 70%, transparent); font-size: 14px; font-weight: 500; }
        .store-newsletter-form { display: flex; gap: 10px; flex-wrap: wrap; }
        .store-newsletter-form input { padding: 13px 16px; border: 2px solid var(--store-surface); min-width: 220px; font-size: 14px; outline: none; background: var(--store-ink); color: var(--store-surface); }
        .store-newsletter-form input::placeholder { color: color-mix(in srgb, var(--store-surface) 60%, transparent); }
        .store-newsletter-form input:focus { border-color: var(--store-accent); }
        .store-newsletter-form button { border: 2px solid var(--store-accent); background: var(--store-accent); color: var(--store-accent-text); padding: 13px 22px; font-weight: 800; font-size: 12.5px; text-transform: uppercase; letter-spacing: .03em; }

        @media (max-width: 980px) {
          .runway-hero-grid { grid-template-columns: 1fr; min-height: 0; }
          .runway-hero-copy { border-right: none; border-bottom: 2px solid var(--store-ink); }
          .runway-hero-art { aspect-ratio: 16 / 10; }
          .runway-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .store-footer-grid { grid-template-columns: 1fr 1fr; gap: 26px; }
          .pdetail-panel { grid-template-columns: 1fr; }
          .pdetail-media { min-height: 280px; }
        }
        @media (max-width: 680px) {
          .only-desktop { display: none !important; }
          .only-mobile { display: inline-flex; }
          .runway-nav-links { display: none; }
          .runway-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .store-newsletter-inner { flex-direction: column; align-items: flex-start; }
          .store-newsletter-form { width: 100%; }
          .store-newsletter-form input { flex: 1; min-width: 0; }
          .store-footer-grid { grid-template-columns: 1fr; gap: 24px; }
        }
      `}</style>

      {copy.announcement && <div className="runway-announce">{copy.announcement}</div>}

      <header className="runway-header">
        <div className="store-wrap runway-header-inner">
          <button className="icon-btn only-mobile" type="button" onClick={() => setMobileMenuOpen(true)} aria-label="Open menu">
            <StoreIcon name="menu" size={20} />
          </button>
          <a className="runway-brand" href="#top">
            <span className="runway-logo">
              {store.logoUrl ? <img src={store.logoUrl} alt="" /> : store.businessName.charAt(0)}
            </span>
            <span>
              <strong>{store.businessName}</strong>
              <span>{[store.city, store.state].filter(Boolean).join(', ') || businessTypeLabel}</span>
            </span>
          </a>
          <nav className="runway-nav-links only-desktop" aria-label="Store navigation">
            <a href="#shop">Shop</a>
            <a href="#footer">Contact</a>
          </nav>
          <div className="runway-header-actions">
            <label className="runway-search only-desktop">
              <StoreIcon name="search" size={15} />
              <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search products" />
            </label>
            <button className="icon-btn" type="button" aria-label="Wishlist">
              <StoreIcon name="heart" size={19} />
              {wishlist.length > 0 && <span className="icon-dot">{wishlist.length}</span>}
            </button>
            <button className="icon-btn" type="button" aria-label="Open cart" onClick={() => setCartOpen(true)}>
              <StoreIcon name="bag" size={19} />
              {cartCount > 0 && <span className="icon-dot">{cartCount}</span>}
            </button>
          </div>
        </div>
      </header>

      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)} />
        <div className="mobile-menu-panel">
          <button className="icon-btn" type="button" onClick={() => setMobileMenuOpen(false)} aria-label="Close menu"><StoreIcon name="close" size={20} /></button>
          <label className="runway-search">
            <StoreIcon name="search" size={15} />
            <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search products" />
          </label>
          <nav>
            <a href="#shop" onClick={() => setMobileMenuOpen(false)}>Shop</a>
            <a href="#footer" onClick={() => setMobileMenuOpen(false)}>Contact</a>
          </nav>
        </div>
      </div>

      <section className="runway-hero" id="top">
        <div className="runway-hero-grid">
          <div className="runway-hero-copy">
            <span className="runway-issue">{heroEyebrow}</span>
            <h1>{heroHeadline}</h1>
            <p>{heroSubtext}</p>
            <div className="runway-hero-ctas">
              <a className="store-cta" href="#shop">{copy.primaryButtonLabel}</a>
              {store.phone && <a className="store-cta secondary" href={`tel:${store.phone}`}>{copy.secondaryButtonLabel}</a>}
            </div>
          </div>
          <div className="runway-hero-art">
            {featuredImage && <img src={featuredImage} alt={`${store.businessName} featured`} />}
            <span className="runway-hero-tag">New season</span>
          </div>
        </div>
      </section>

      <section className="runway-products" id="shop">
        <div className="store-wrap">
          <div className="runway-section-head">
            <div>
              <h2>{copy.productsHeading}</h2>
              <p>{productsSubheading}</p>
            </div>
            <div className="runway-filters" aria-label="Product categories">
              {productCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`runway-filter-pill ${activeCategory === category ? 'active' : ''}`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="runway-grid">
            {filteredProducts.length ? filteredProducts.map((product, index) => (
              <RunwayProductCard
                key={productKey(product)}
                product={product}
                index={index}
                categoryLabel={businessTypeLabel}
                isWished={isWished(product)}
                addLabel={copy.addToCartLabel}
                formatCurrency={formatCurrency}
                onSelect={() => setSelectedProduct(product)}
                onAddToCart={() => addToCart(product)}
                onToggleWish={() => toggleWishlist(product)}
              />
            )) : (
              <div className="store-empty">{products.length ? 'No products match this search yet.' : 'No products have been published yet.'}</div>
            )}
          </div>
        </div>
      </section>

      <section className="store-newsletter">
        <div className="store-wrap store-newsletter-inner">
          <div>
            <h2>Join the front row</h2>
            <p>Drops, lookbooks, and news from {store.businessName}.</p>
          </div>
          <form className="store-newsletter-form" onSubmit={handleNewsletterSubmit}>
            <input type="email" required value={newsletterEmail} onChange={(event) => setNewsletterEmail(event.target.value)} placeholder="you@example.com" />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </section>

      <div id="footer">
        <StoreFooter store={store} footerText={footerText} visibleSocialLinks={visibleSocialLinks} businessTypeLabel={businessTypeLabel} />
      </div>

      <CartDrawer
        open={cartOpen}
        onClose={closeCart}
        cart={cart}
        cartCount={cartCount}
        cartSubtotal={cartSubtotal}
        deliveryFee={deliveryFee}
        cartTotal={cartTotal}
        freeShippingThreshold={freeShippingThreshold}
        updateQuantity={updateQuantity}
        removeItem={removeItem}
        customer={customer}
        onCustomerChange={updateCustomer}
        onSubmit={handleCheckout}
        submitting={submittingOrder}
        orderPlaced={orderPlaced}
        digitalDelivery={digitalDelivery}
        onContinueShopping={closeCart}
        checkoutLabel={copy.checkoutLabel}
        formatCurrency={formatCurrency}
        whatsappEnabled={whatsappEnabled}
        onWhatsAppCheckout={handleWhatsAppCheckout}
        couponCode={couponCode}
        onCouponCodeChange={setCouponCode}
      />

      <ProductDetail
        product={selectedProduct}
        categoryLabel={businessTypeLabel}
        deliveryFee={deliveryFee}
        isWished={selectedProduct ? isWished(selectedProduct) : false}
        addLabel={copy.addToCartLabel}
        formatCurrency={formatCurrency}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(quantity) => addToCart(selectedProduct, quantity)}
        onToggleWish={() => toggleWishlist(selectedProduct)}
        shareUrl={productShareUrl}
        storeSlug={store.storeSlug}
      />

      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </main>
  );
}
