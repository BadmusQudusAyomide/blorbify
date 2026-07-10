import { StoreIcon } from './icons';
import { isProductAvailable } from './storefrontUtils';

export default function BoutiqueProductCard({ product, categoryLabel, isWished, addLabel, formatCurrency, onSelect, onAddToCart, onToggleWish }) {
  const stock = Number(product.stock || 0);
  const outOfStock = !isProductAvailable(product);
  const lowStock = stock > 0 && stock <= 5;

  return (
    <article className="boutique-card">
      <div className="boutique-card-media" onClick={onSelect} role="button" tabIndex={0} onKeyDown={(event) => event.key === 'Enter' && onSelect()}>
        <img src={product.imageUrl} alt={product.name} loading="lazy" />
        {outOfStock && <span className="boutique-badge out">Sold out</span>}
        {!outOfStock && lowStock && <span className="boutique-badge low">{stock} left</span>}
        <button
          type="button"
          className={`boutique-wish ${isWished ? 'active' : ''}`}
          onClick={(event) => { event.stopPropagation(); onToggleWish(); }}
          aria-label={isWished ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
        >
          <StoreIcon name="heart" size={15} />
        </button>
        <span className="boutique-card-overlay">
          <button type="button" className="boutique-card-add" onClick={(event) => { event.stopPropagation(); onAddToCart(); }} disabled={outOfStock}>
            {outOfStock ? 'Sold out' : addLabel}
          </button>
        </span>
      </div>
      <div className="boutique-card-body">
        <p className="boutique-card-cat">{product.category || categoryLabel}</p>
        <h3 className="boutique-card-name" onClick={onSelect} role="button" tabIndex={0} onKeyDown={(event) => event.key === 'Enter' && onSelect()}>{product.name}</h3>
        <span className="boutique-card-price">{formatCurrency(product.price)}</span>
      </div>
    </article>
  );
}
