export default function CampusProductRow({ product, index, quantity, formatCurrency, onAdd, onIncrement, onDecrement }) {
  const lineNumber = String(index + 1).padStart(2, '0');

  return (
    <div className="campus-manifest-row">
      <span className="campus-manifest-line">{lineNumber}</span>
      <span className="campus-manifest-name">{product.name}</span>
      <span className="campus-manifest-price">{formatCurrency(product.price)}</span>
      {quantity > 0 ? (
        <span className="campus-qty-stepper">
          <button type="button" onClick={onDecrement} aria-label={`Reduce ${product.name}`}>−</button>
          <b>{quantity}</b>
          <button type="button" onClick={onIncrement} aria-label={`Increase ${product.name}`}>+</button>
        </span>
      ) : (
        <button type="button" className="campus-manifest-add" onClick={onAdd}>Add</button>
      )}
    </div>
  );
}
