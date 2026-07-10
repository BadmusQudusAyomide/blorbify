import { StoreIcon } from './icons';
import { isProductAvailable } from './storefrontUtils';

export default function RunwayProductCard({ product, index, categoryLabel, isWished, addLabel, formatCurrency, onSelect, onAddToCart, onToggleWish }) {
  const stock = Number(product.stock || 0);
  const outOfStock = !isProductAvailable(product);
  const lowStock = stock > 0 && stock <= 5;
  const look = String(index + 1).padStart(2, '0');

  return (
    <article className="runway-card">
      <div className="runway-card-media" onClick={onSelect} role="button" tabIndex={0} onKeyDown={(event) => event.key === 'Enter' && onSelect()}>
        <span className="runway-look">Look {look}</span>
        <img src={product.imageUrl} alt={product.name} loading="lazy" />
        {outOfStock && <span className="runway-badge out">Sold out</span>}
        {!outOfStock && lowStock && <span className="runway-badge low">{stock} left</span>}
        <button
          type="button"
          className={`runway-wish ${isWished ? 'active' : ''}`}
          onClick={(event) => { event.stopPropagation(); onToggleWish(); }}
          aria-label={isWished ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
        >
          <StoreIcon name="heart" size={15} />
        </button>
      </div>
      <div className="runway-card-body">
        <p className="runway-card-cat">{product.category || categoryLabel}</p>
        <h3 className="runway-card-name" onClick={onSelect} role="button" tabIndex={0} onKeyDown={(event) => event.key === 'Enter' && onSelect()}>{product.name}</h3>
        <div className="runway-card-row">
          <span className="runway-card-price">{formatCurrency(product.price)}</span>
          <button type="button" className="runway-card-add" onClick={() => onAddToCart()} disabled={outOfStock}>
            {outOfStock ? 'Sold out' : addLabel}
          </button>
        </div>
      </div>
    </article>
  );
}
