import { productKey } from './useCart';
import { StoreIcon } from './icons';
import { sharedStorefrontStyles } from './sharedStorefrontStyles';
import BoutiqueProductCard from './BoutiqueProductCard';
import ProductDetail from './ProductDetail';
import CartDrawer from './CartDrawer';
import StoreFooter from './StoreFooter';
import { ToastStack } from './Toast';

export default function BoutiqueTemplate(props) {
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
    <main className="storefront boutique">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Jost:wght@400;500;600&display=swap');

        .storefront.boutique {
          --store-accent: ${theme.primaryColor};
          --store-accent-text: ${accentTextColor};
          --store-ink: ${theme.textColor};
          --store-surface: ${theme.backgroundColor};
          --store-card: ${theme.cardColor};
          --store-button: ${theme.buttonColor};
          --store-button-text: ${theme.buttonTextColor};
          --store-muted: color-mix(in srgb, var(--store-ink) 58%, transparent);
          --store-faint: color-mix(in srgb, var(--store-ink) 38%, transparent);
          --store-line: color-mix(in srgb, var(--store-ink) 13%, transparent);
          --store-display: 'Cormorant Garamond', Georgia, serif;
          min-height: 100vh;
          background: var(--store-surface);
          color: var(--store-ink);
          font-family: 'Jost', 'Inter', system-ui, sans-serif;
        }
        ${sharedStorefrontStyles}

        .boutique-announce { background: var(--store-ink); color: var(--store-surface); text-align: center; font-size: 11.5px; font-weight: 500; letter-spacing: .16em; text-transform: uppercase; padding: 10px 16px; }

        .boutique-header { position: sticky; top: 0; z-index: 60; background: color-mix(in srgb, var(--store-surface) 92%, transparent); backdrop-filter: blur(14px); border-bottom: 1px solid var(--store-line); }
        .boutique-header-inner { display: flex; align-items: center; gap: 22px; padding: 20px 0; }
        .boutique-brand { display: flex; flex-direction: column; align-items: center; margin: 0 auto; text-decoration: none; text-align: center; }
        .boutique-brand strong { font-family: var(--store-display); font-size: 24px; font-weight: 600; letter-spacing: .05em; text-transform: uppercase; overflow-wrap: anywhere; }
        .boutique-brand span { display: block; color: var(--store-muted); font-size: 10.5px; letter-spacing: .1em; text-transform: uppercase; margin-top: 2px; }
        .boutique-nav-links { display: flex; gap: 26px; font-size: 12.5px; font-weight: 500; letter-spacing: .06em; text-transform: uppercase; color: var(--store-muted); }
        .boutique-nav-links a:hover { color: var(--store-ink); }
        .boutique-header-actions { display: flex; align-items: center; gap: 4px; margin-left: auto; }
        .boutique-header-side { display: flex; align-items: center; gap: 4px; flex: 1 1 0; }
        .boutique-header-side.end { justify-content: flex-end; }
        .boutique-search { display: flex; align-items: center; gap: 8px; background: color-mix(in srgb, var(--store-ink) 5%, transparent); border-radius: 999px; padding: 9px 16px; width: 190px; }
        .boutique-search input { border: 0; outline: 0; background: transparent; width: 100%; font-size: 13px; }

        .mobile-menu { position: fixed; inset: 0; z-index: 90; pointer-events: none; }
        .mobile-menu-overlay { position: absolute; inset: 0; background: rgba(42,35,32,.34); opacity: 0; transition: opacity .25s ease; }
        .mobile-menu-panel { position: absolute; top: 0; left: 0; bottom: 0; width: 82%; max-width: 320px; background: var(--store-surface); padding: 20px; transform: translateX(-100%); transition: transform .3s cubic-bezier(.4,0,.2,1); display: flex; flex-direction: column; gap: 24px; }
        .mobile-menu.open { pointer-events: auto; }
        .mobile-menu.open .mobile-menu-overlay { opacity: 1; }
        .mobile-menu.open .mobile-menu-panel { transform: translateX(0); }
        .mobile-menu-panel nav { display: flex; flex-direction: column; gap: 18px; font-size: 15px; font-weight: 500; text-transform: uppercase; letter-spacing: .05em; }

        .boutique-hero { position: relative; padding: clamp(70px, 12vw, 130px) 0 clamp(56px, 9vw, 96px); overflow: hidden; text-align: center; }
        .boutique-hero-bg { position: absolute; inset: 0; z-index: 0; }
        .boutique-hero-bg img { width: 100%; height: 100%; object-fit: cover; }
        .boutique-hero-bg::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, color-mix(in srgb, var(--store-surface) 18%, transparent) 0%, color-mix(in srgb, var(--store-surface) 78%, transparent) 78%, var(--store-surface) 100%); }
        .boutique-hero-inner { position: relative; z-index: 1; max-width: 620px; margin: 0 auto; }
        .boutique-eyebrow { display: inline-flex; align-items: center; gap: 10px; font-size: 11.5px; font-weight: 500; letter-spacing: .22em; text-transform: uppercase; color: var(--store-accent); margin-bottom: 18px; }
        .boutique-eyebrow::before, .boutique-eyebrow::after { content: ''; width: 26px; height: 1px; background: var(--store-accent); }
        .boutique-hero h1 { color: inherit; margin: 0; font-family: var(--store-display); font-weight: 500; font-style: italic; font-size: clamp(38px, 6.5vw, 68px); line-height: 1.08; }
        .boutique-hero p { margin: 22px auto 0; color: var(--store-muted); font-size: 16px; line-height: 1.75; max-width: 440px; }
        .boutique-hero-ctas { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 32px; justify-content: center; }
        .store-cta { display: inline-flex; align-items: center; justify-content: center; gap: 8px; border: 1.5px solid var(--store-button); border-radius: 0; background: var(--store-button); color: var(--store-button-text); padding: 15px 30px; font-weight: 500; font-size: 12px; letter-spacing: .1em; text-transform: uppercase; text-decoration: none; transition: transform .2s cubic-bezier(.22,1,.36,1), opacity .2s ease; white-space: nowrap; }
        .store-cta:hover { opacity: .82; }
        .store-cta.secondary { background: transparent; color: var(--store-ink); border-color: var(--store-line); }
        .store-cta.secondary:hover { border-color: var(--store-ink); opacity: 1; }
        .store-cta.block { width: 100%; }
        .whatsapp-cta { background: #25D366; color: #fff; border-color: #25D366; margin-top: 4px; }
        .store-cta:disabled { opacity: .5; cursor: not-allowed; transform: none; }

        .boutique-strip { border-top: 1px solid var(--store-line); border-bottom: 1px solid var(--store-line); }
        .boutique-strip ul { width: min(1180px, calc(100% - 40px)); margin: 0 auto; padding: 20px 0; list-style: none; display: flex; justify-content: center; gap: 44px; flex-wrap: wrap; }
        .boutique-strip li { display: flex; align-items: center; gap: 9px; font-size: 11.5px; font-weight: 500; letter-spacing: .06em; text-transform: uppercase; color: var(--store-muted); }
        .boutique-strip svg { color: var(--store-accent); }

        .boutique-products { padding: clamp(48px, 7vw, 84px) 0 60px; }
        .boutique-section-head { text-align: center; max-width: 560px; margin: 0 auto 36px; }
        .boutique-section-head h2 { color: inherit; margin: 0; font-family: var(--store-display); font-size: clamp(28px, 4.5vw, 42px); font-weight: 500; font-style: italic; }
        .boutique-section-head p { margin: 10px 0 0; color: var(--store-muted); }
        .boutique-filters { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; margin-top: 22px; }
        .boutique-filter-pill { padding: 9px 18px; border-radius: 999px; font-size: 11.5px; font-weight: 500; letter-spacing: .06em; text-transform: uppercase; border: 1px solid var(--store-line); background: transparent; color: var(--store-muted); transition: all .15s ease; }
        .boutique-filter-pill:hover, .boutique-filter-pill.active { border-color: var(--store-ink); color: var(--store-ink); background: var(--store-card); }

        .boutique-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 30px 26px; }
        .boutique-card { min-width: 0; }
        .boutique-card-media { position: relative; aspect-ratio: 3 / 4; overflow: hidden; background: var(--store-card); cursor: pointer; }
        .boutique-card-media img { width: 100%; height: 100%; object-fit: cover; transition: transform .5s ease; }
        .boutique-card-media:hover img { transform: scale(1.04); }
        .boutique-badge { position: absolute; top: 12px; left: 12px; font-size: 10px; font-weight: 600; letter-spacing: .05em; text-transform: uppercase; padding: 5px 10px; background: var(--store-card); color: var(--store-ink); z-index: 2; }
        .boutique-badge.low { background: var(--store-accent); color: var(--store-accent-text); }
        .boutique-badge.out { background: color-mix(in srgb, var(--store-ink) 82%, transparent); color: var(--store-surface); }
        .boutique-wish { position: absolute; top: 12px; right: 12px; width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,.92); border: 0; display: flex; align-items: center; justify-content: center; color: var(--store-ink); z-index: 2; }
        .boutique-wish.active { color: #A8563D; }
        .boutique-wish.active svg { fill: #A8563D; }
        .boutique-card-overlay { position: absolute; left: 12px; right: 12px; bottom: 12px; z-index: 2; opacity: 0; transform: translateY(8px); transition: all .2s ease; }
        .boutique-card-media:hover .boutique-card-overlay { opacity: 1; transform: translateY(0); }
        .boutique-card-add { width: 100%; border: 0; background: var(--store-ink); color: var(--store-surface); padding: 12px; font-weight: 500; font-size: 11px; letter-spacing: .1em; text-transform: uppercase; }
        .boutique-card-add:disabled { opacity: .6; cursor: not-allowed; }
        .boutique-card-body { padding: 16px 2px 0; text-align: center; }
        .boutique-card-cat { margin: 0 0 6px; font-size: 10.5px; font-weight: 500; letter-spacing: .08em; text-transform: uppercase; color: var(--store-faint); }
        .boutique-card-name { margin: 0 0 8px; font-family: var(--store-display); font-size: 19px; font-weight: 500; cursor: pointer; overflow-wrap: anywhere; }
        .boutique-card-price { font-weight: 500; font-size: 14px; color: var(--store-muted); }
        .store-empty { grid-column: 1 / -1; border: 1px dashed var(--store-line); padding: 44px 18px; text-align: center; color: var(--store-muted); }

        .store-newsletter { padding: 20px 0 70px; }
        .store-newsletter-inner { background: var(--store-card); border: 1px solid var(--store-line); padding: clamp(30px, 5vw, 52px); display: flex; align-items: center; justify-content: space-between; gap: 28px; flex-wrap: wrap; text-align: left; }
        .store-newsletter-inner h2 { color: inherit; font-family: var(--store-display); font-style: italic; font-size: 28px; margin: 0 0 6px; font-weight: 500; }
        .store-newsletter-inner p { margin: 0; color: var(--store-muted); font-size: 14px; }
        .store-newsletter-form { display: flex; gap: 10px; flex-wrap: wrap; }
        .store-newsletter-form input { padding: 13px 16px; border: 1px solid var(--store-line); background: var(--store-surface); min-width: 220px; font-size: 14px; outline: none; }
        .store-newsletter-form input:focus { border-color: var(--store-accent); }
        .store-newsletter-form button { border: 1.5px solid var(--store-button); background: var(--store-button); color: var(--store-button-text); padding: 13px 24px; font-weight: 500; font-size: 12px; letter-spacing: .08em; text-transform: uppercase; }

        @media (max-width: 980px) {
          .boutique-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .store-footer-grid { grid-template-columns: 1fr 1fr; gap: 26px; }
          .pdetail-panel { grid-template-columns: 1fr; }
          .pdetail-media { min-height: 280px; }
        }
        @media (max-width: 680px) {
          .only-desktop { display: none !important; }
          .only-mobile { display: inline-flex; }
          .boutique-nav-links { display: none; }
          .boutique-header-side.start { flex: 0 0 auto; }
          .boutique-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px 14px; }
          .store-newsletter-inner { flex-direction: column; align-items: flex-start; }
          .store-newsletter-form { width: 100%; }
          .store-newsletter-form input { flex: 1; min-width: 0; }
          .store-footer-grid { grid-template-columns: 1fr; gap: 24px; }
        }
      `}</style>

      {copy.announcement && <div className="boutique-announce">{copy.announcement}</div>}

      <header className="boutique-header">
        <div className="store-wrap boutique-header-inner">
          <div className="boutique-header-side start">
            <button className="icon-btn only-mobile" type="button" onClick={() => setMobileMenuOpen(true)} aria-label="Open menu">
              <StoreIcon name="menu" size={20} />
            </button>
            <nav className="boutique-nav-links only-desktop" aria-label="Store navigation">
              <a href="#shop">Shop</a>
              <a href="#footer">Contact</a>
            </nav>
          </div>
          <a className="boutique-brand" href="#top">
            <strong>{store.businessName}</strong>
            <span>{[store.city, store.state].filter(Boolean).join(', ') || businessTypeLabel}</span>
          </a>
          <div className="boutique-header-side end">
            <label className="boutique-search only-desktop">
              <StoreIcon name="search" size={15} />
              <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search" />
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
          <label className="boutique-search">
            <StoreIcon name="search" size={15} />
            <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search products" />
          </label>
          <nav>
            <a href="#shop" onClick={() => setMobileMenuOpen(false)}>Shop</a>
            <a href="#footer" onClick={() => setMobileMenuOpen(false)}>Contact</a>
          </nav>
        </div>
      </div>

      <section className="boutique-hero" id="top">
        {featuredImage && (
          <div className="boutique-hero-bg" aria-hidden="true">
            <img src={featuredImage} alt="" />
          </div>
        )}
        <div className="store-wrap boutique-hero-inner">
          <span className="boutique-eyebrow">{heroEyebrow}</span>
          <h1>{heroHeadline}</h1>
          <p>{heroSubtext}</p>
          <div className="boutique-hero-ctas">
            <a className="store-cta" href="#shop">{copy.primaryButtonLabel}</a>
            {store.phone && <a className="store-cta secondary" href={`tel:${store.phone}`}>{copy.secondaryButtonLabel}</a>}
          </div>
        </div>
      </section>

      <section className="boutique-strip" aria-label="Store benefits">
        <ul>
          <li><StoreIcon name="truck" size={16} /> Local delivery</li>
          <li><StoreIcon name="shield" size={16} /> Secure checkout</li>
          <li><StoreIcon name="heart" size={16} /> Save your favorites</li>
        </ul>
      </section>

      <section className="boutique-products" id="shop">
        <div className="store-wrap">
          <div className="boutique-section-head">
            <h2>{copy.productsHeading}</h2>
            <p>{productsSubheading}</p>
            <div className="boutique-filters" aria-label="Product categories">
              {productCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`boutique-filter-pill ${activeCategory === category ? 'active' : ''}`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="boutique-grid">
            {filteredProducts.length ? filteredProducts.map((product) => (
              <BoutiqueProductCard
                key={productKey(product)}
                product={product}
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
            <h2>Join the list</h2>
            <p>New arrivals and private sales from {store.businessName}.</p>
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
