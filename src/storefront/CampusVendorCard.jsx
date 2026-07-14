export default function CampusVendorCard({ vendor, index, onOpen }) {
  const stopNumber = String(index + 1).padStart(2, '0');
  const productCount = vendor.products?.length || 0;

  return (
    <button type="button" className="campus-stop" onClick={onOpen}>
      <span className="campus-stop-number">{stopNumber}</span>
      <span className="campus-stop-badge">
        {vendor.image?.url ? <img src={vendor.image.url} alt="" /> : <span className="campus-stop-badge-fallback">{vendor.name?.[0] || '?'}</span>}
      </span>
      <span className="campus-stop-info">
        <strong>{vendor.name}</strong>
        {vendor.description && <span className="campus-stop-desc">{vendor.description}</span>}
        <span className="campus-stop-meta">{productCount} item{productCount === 1 ? '' : 's'}</span>
      </span>
      <span className="campus-stop-arrow" aria-hidden="true">→</span>
    </button>
  );
}
