const STAR_PATH = 'm12 4 2.3 4.9 5.3.7-3.9 3.7.9 5.3L12 16l-4.6 2.6.9-5.3-3.9-3.7 5.3-.7Z';

// Renders as a button group when `onChange` is passed (rating input), or as a
// plain read-only display otherwise (average rating badge).
export default function StarRating({ value = 0, onChange, size = 16 }) {
  const stars = [1, 2, 3, 4, 5];
  const interactive = typeof onChange === 'function';
  const rounded = Math.round(value);

  return (
    <span className="star-rating" role={interactive ? 'radiogroup' : 'img'} aria-label={`${value} out of 5 stars`}>
      {stars.map((star) => {
        const filled = star <= rounded;
        const icon = (
          <svg viewBox="0 0 24 24" width={size} height={size} fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <path d={STAR_PATH} strokeLinejoin="round" />
          </svg>
        );

        if (!interactive) {
          return <span className={`star-rating-star ${filled ? 'filled' : ''}`} key={star}>{icon}</span>;
        }

        return (
          <button
            key={star}
            type="button"
            className={`star-rating-star ${filled ? 'filled' : ''}`}
            onClick={() => onChange(star)}
            aria-label={`${star} star${star === 1 ? '' : 's'}`}
          >
            {icon}
          </button>
        );
      })}
    </span>
  );
}
