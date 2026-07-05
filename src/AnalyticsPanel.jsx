import { useMemo, useState } from 'react';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAY_DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
const CATEGORY_COLORS = ['#4e7300', '#45B7D1', '#FFA07A', '#B983FF', '#FF6B9D', '#4ECDC4', '#F7B733', '#8698A6'];

const AIconBase = ({ children, size = 20, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" {...rest}>
    {children}
  </svg>
);

const IconRepeat = (props) => (
  <AIconBase {...props}>
    <path d="M4 12a8 8 0 0 1 13.6-5.7L20 8.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    <path d="M20 4.5v4h-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M20 12a8 8 0 0 1-13.6 5.7L4 15.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    <path d="M4 19.5v-4h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </AIconBase>
);

const IconBox = (props) => (
  <AIconBase {...props}>
    <path d="M12 3.5 20 8v8l-8 4.5L4 16V8l8-4.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    <path d="M4 8l8 4.5L20 8M12 12.5V21" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
  </AIconBase>
);

const IconCalendar = (props) => (
  <AIconBase {...props}>
    <rect x="4" y="5.5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.7" />
    <path d="M4 10h16M8 3.5v3M16 3.5v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </AIconBase>
);

const IconTicket = (props) => (
  <AIconBase {...props}>
    <path
      d="M4 9.5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1.2a1.7 1.7 0 0 0 0 3.2v1.6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1.6a1.7 1.7 0 0 0 0-3.2V9.5Z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
    <path d="M13 8v9" stroke="currentColor" strokeWidth="1.7" strokeDasharray="1.6 2" strokeLinecap="round" />
  </AIconBase>
);

function toDate(value) {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function niceCeil(value) {
  if (value <= 0) return 100;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const residual = value / magnitude;
  let niceResidual = 10;
  if (residual <= 1) niceResidual = 1;
  else if (residual <= 2) niceResidual = 2;
  else if (residual <= 5) niceResidual = 5;
  return niceResidual * magnitude;
}

function formatShort(value) {
  const amount = Number(value || 0);
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1).replace(/\.0$/, '')}k`;
  return `${Math.round(amount)}`;
}

function computeAnalytics(orders, products) {
  const validOrders = Array.isArray(orders) ? orders : [];
  if (!validOrders.length) {
    return { hasOrders: false };
  }

  const productCategoryById = new Map(
    (Array.isArray(products) ? products : []).map((product) => [product.id, product.category || 'Uncategorized'])
  );

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const dayBuckets = [];
  for (let i = 13; i >= 0; i -= 1) {
    const date = new Date(startOfToday);
    date.setDate(date.getDate() - i);
    dayBuckets.push({
      date,
      key: date.toDateString(),
      label: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      revenue: 0,
    });
  }
  const bucketByKey = new Map(dayBuckets.map((bucket) => [bucket.key, bucket]));

  let totalRevenue = 0;
  let itemsSold = 0;
  let last7Revenue = 0;
  let prev7Revenue = 0;

  const categoryTotals = new Map();
  const productTotals = new Map();
  const weekdayCounts = WEEKDAYS.map((day) => ({ day, count: 0 }));
  const customerOrderCounts = new Map();

  validOrders.forEach((order) => {
    const total = Number(order.total || order.amount || 0);
    totalRevenue += total;

    const date = toDate(order.createdAt);
    if (date) {
      const bucket = bucketByKey.get(date.toDateString());
      if (bucket) bucket.revenue += total;

      weekdayCounts[date.getDay()].count += 1;

      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const daysAgo = Math.floor((startOfToday - dayStart) / 86400000);
      if (daysAgo >= 0 && daysAgo < 7) last7Revenue += total;
      else if (daysAgo >= 7 && daysAgo < 14) prev7Revenue += total;
    }

    const customerKey = order.customerPhone || order.customerName || order.customerEmail;
    if (customerKey) {
      customerOrderCounts.set(customerKey, (customerOrderCounts.get(customerKey) || 0) + 1);
    }

    const items = Array.isArray(order.items) ? order.items : [];
    items.forEach((item) => {
      const quantity = Number(item.quantity || 0);
      const lineRevenue = Number(item.subtotal || Number(item.price || 0) * quantity || 0);
      itemsSold += quantity;

      const category = productCategoryById.get(item.productId) || 'Uncategorized';
      categoryTotals.set(category, (categoryTotals.get(category) || 0) + lineRevenue);

      const productKey = item.productId || item.name || 'product';
      const existing = productTotals.get(productKey) || { name: item.name || 'Product', revenue: 0, quantity: 0 };
      existing.revenue += lineRevenue;
      existing.quantity += quantity;
      productTotals.set(productKey, existing);
    });
  });

  const dailyRevenue = dayBuckets.map((bucket) => ({ label: bucket.label, value: bucket.revenue, date: bucket.date }));

  const sortedCategories = Array.from(categoryTotals.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  let categoryBreakdown = sortedCategories;
  if (sortedCategories.length > 6) {
    const top = sortedCategories.slice(0, 5);
    const otherValue = sortedCategories.slice(5).reduce((sum, entry) => sum + entry.value, 0);
    categoryBreakdown = [...top, { label: 'Other', value: otherValue }];
  }
  categoryBreakdown = categoryBreakdown.map((entry, index) => ({
    ...entry,
    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
  }));

  const topProducts = Array.from(productTotals.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const maxWeekdayCount = Math.max(...weekdayCounts.map((entry) => entry.count), 0);
  const weekdayData = weekdayCounts.map((entry) => ({ ...entry, isBest: maxWeekdayCount > 0 && entry.count === maxWeekdayCount }));
  const bestDayEntry = weekdayData.find((entry) => entry.isBest);
  const bestDayNames = { Sun: 'Sunday', Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday' };
  const bestDay = bestDayEntry ? bestDayNames[bestDayEntry.day] : null;

  const totalCustomers = customerOrderCounts.size;
  const repeatCustomers = Array.from(customerOrderCounts.values()).filter((count) => count > 1).length;
  const repeatRate = totalCustomers ? Math.round((repeatCustomers / totalCustomers) * 100) : 0;

  const avgOrderValue = validOrders.length ? Math.round(totalRevenue / validOrders.length) : 0;

  let trendDirection = 'flat';
  let trendLabel = 'No change vs last week';
  if (prev7Revenue > 0) {
    const change = ((last7Revenue - prev7Revenue) / prev7Revenue) * 100;
    trendDirection = change > 0.5 ? 'up' : change < -0.5 ? 'down' : 'flat';
    trendLabel = `${change > 0 ? '+' : ''}${Math.round(change)}% vs last week`;
  } else if (last7Revenue > 0) {
    trendDirection = 'up';
    trendLabel = 'New sales this week';
  }

  return {
    hasOrders: true,
    dailyRevenue,
    categoryBreakdown,
    topProducts,
    weekdayData,
    avgOrderValue,
    repeatRate,
    itemsSold,
    bestDay,
    trendDirection,
    trendLabel,
  };
}

function RevenueTrendChart({ data, formatCurrency }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const width = 700;
  const height = 240;
  const paddingLeft = 56;
  const paddingRight = 12;
  const paddingTop = 16;
  const paddingBottom = 30;
  const innerWidth = width - paddingLeft - paddingRight;
  const innerHeight = height - paddingTop - paddingBottom;

  const maxValue = Math.max(...data.map((point) => point.value), 0);
  const niceMax = niceCeil(maxValue || 1);
  const segmentWidth = innerWidth / Math.max(data.length - 1, 1);

  const points = data.map((point, index) => ({
    ...point,
    x: paddingLeft + segmentWidth * index,
    y: paddingTop + innerHeight - (point.value / niceMax) * innerHeight,
  }));

  const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${paddingTop + innerHeight} L ${points[0].x} ${paddingTop + innerHeight} Z`;
  const gridLines = [0, 0.5, 1];
  const active = activeIndex !== null ? points[activeIndex] : null;

  return (
    <div className="trend-chart-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} className="trend-chart-svg" preserveAspectRatio="none">
        <defs>
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#AFFF00" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#AFFF00" stopOpacity="0" />
          </linearGradient>
        </defs>

        {gridLines.map((fraction) => {
          const y = paddingTop + innerHeight * (1 - fraction);
          return (
            <g key={fraction}>
              <line x1={paddingLeft} x2={width - paddingRight} y1={y} y2={y} stroke="rgba(25,35,40,0.08)" strokeWidth="1.5" />
              <text x={paddingLeft - 10} y={y + 4} textAnchor="end" fontSize="17" fill="#728084">
                {formatShort(niceMax * fraction)}
              </text>
            </g>
          );
        })}

        <path d={areaPath} fill="url(#revenueFill)" stroke="none" />
        <path d={linePath} fill="none" stroke="#4e7300" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />

        {points.map((point, index) => (
          <g key={point.label + index}>
            <rect
              x={point.x - segmentWidth / 2}
              y={paddingTop}
              width={segmentWidth}
              height={innerHeight}
              fill="transparent"
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex((current) => (current === index ? null : current))}
            />
            {(index % 2 === 0 || index === points.length - 1) && (
              <text x={point.x} y={height - 8} textAnchor="middle" fontSize="15" fill="#728084">
                {point.label}
              </text>
            )}
          </g>
        ))}
      </svg>

      {active && (
        <>
          <div className="trend-dot" style={{ left: `${(active.x / width) * 100}%`, top: `${(active.y / height) * 100}%` }} />
          <div
            className="trend-tooltip"
            style={{ left: `${(active.x / width) * 100}%`, top: `${(active.y / height) * 100}%` }}
          >
            <strong>{formatCurrency(active.value)}</strong>
            <span>{active.label}</span>
          </div>
        </>
      )}
    </div>
  );
}

function CategoryDonutChart({ segments, formatCurrency }) {
  const total = segments.reduce((sum, entry) => sum + entry.value, 0) || 1;
  const radius = 70;
  const circumference = 2 * Math.PI * radius;

  const arcs = segments.reduce((acc, segment) => {
    const previous = acc.length ? acc[acc.length - 1] : null;
    const cumulative = previous ? previous.cumulative + previous.fraction : 0;
    const fraction = segment.value / total;
    acc.push({ ...segment, fraction, cumulative });
    return acc;
  }, []);

  return (
    <div className="donut-wrap">
      <svg viewBox="0 0 180 180" className="donut-svg">
        <circle cx="90" cy="90" r={radius} fill="none" stroke="rgba(25,35,40,0.06)" strokeWidth="26" />
        {arcs.map((segment) => {
          const dash = segment.fraction * circumference;
          const dashOffset = -segment.cumulative * circumference;
          return (
            <circle
              key={segment.label}
              cx="90"
              cy="90"
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth="26"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 90 90)"
            />
          );
        })}
        <text x="90" y="86" textAnchor="middle" fontSize="14" fill="#728084" fontWeight="700">
          Total
        </text>
        <text x="90" y="106" textAnchor="middle" fontSize="16" fill="#192328" fontWeight="900">
          NGN {formatShort(total)}
        </text>
      </svg>

      <ul className="donut-legend">
        {segments.map((segment) => (
          <li key={segment.label}>
            <span className="legend-dot" style={{ background: segment.color }} />
            <span className="legend-label">{segment.label}</span>
            <span className="legend-value">
              {Math.round((segment.value / total) * 100)}% · {formatCurrency(segment.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TopProductsLeaderboard({ products, formatCurrency }) {
  const maxRevenue = Math.max(...products.map((product) => product.revenue), 1);
  return (
    <ol className="leaderboard">
      {products.map((product, index) => (
        <li key={product.name + index} className="leaderboard-row">
          <span className="leaderboard-rank">{index + 1}</span>
          <div className="leaderboard-main">
            <div className="leaderboard-top">
              <strong>{product.name}</strong>
              <span>{formatCurrency(product.revenue)}</span>
            </div>
            <div className="leaderboard-track">
              <div className="leaderboard-fill" style={{ width: `${(product.revenue / maxRevenue) * 100}%` }} />
            </div>
            <span className="leaderboard-sub">{product.quantity} sold</span>
          </div>
        </li>
      ))}
    </ol>
  );
}

function WeekdayBarChart({ data }) {
  const ordered = WEEKDAY_DISPLAY_ORDER.map((index) => data[index]);
  const max = Math.max(...ordered.map((entry) => entry.count), 1);

  return (
    <div className="weekday-chart">
      {ordered.map((entry) => (
        <div className="weekday-col" key={entry.day}>
          <span className="weekday-count">{entry.count}</span>
          <div className="weekday-bar-track">
            <div
              className={`weekday-bar-fill ${entry.isBest ? 'best' : ''}`}
              style={{ height: `${Math.max((entry.count / max) * 100, entry.count > 0 ? 6 : 0)}%` }}
            />
          </div>
          <span className="weekday-label">{entry.day}</span>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPanel({ orders, products, formatCurrency }) {
  const analytics = useMemo(() => computeAnalytics(orders, products), [orders, products]);

  if (!analytics.hasOrders) {
    return (
      <div className="content-card full-span">
        <div className="card-header">
          <h3>Sales Analytics</h3>
        </div>
        <div className="empty-state">
          <strong>No sales yet.</strong>
          <br />
          Your revenue trends, top products, and customer insights will appear here as soon as you get your first order.
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .trend-chart-wrap { position: relative; }
        .trend-chart-svg { width: 100%; height: 240px; display: block; }
        .trend-dot {
          position: absolute;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #4e7300;
          border: 2px solid #fff;
          box-shadow: 0 2px 6px rgba(25,35,40,.25);
          transform: translate(-50%, -50%);
          pointer-events: none;
        }
        .trend-tooltip {
          position: absolute;
          transform: translate(-50%, calc(-100% - 14px));
          background: var(--ink-deep);
          color: #f6f8f1;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 12px;
          white-space: nowrap;
          pointer-events: none;
          box-shadow: 0 12px 24px rgba(15,21,24,.25);
        }
        .trend-tooltip strong { display: block; font-size: 13px; }
        .trend-tooltip span { color: #93a2a6; }
        .trend-badge {
          font-size: 12px;
          font-weight: 800;
          padding: 6px 12px;
          border-radius: 999px;
          white-space: nowrap;
        }
        .trend-badge.up { background: rgba(175,255,0,.22); color: #4e7300; }
        .trend-badge.down { background: rgba(255,107,107,.15); color: #9d2525; }
        .trend-badge.flat { background: rgba(25,35,40,.06); color: var(--slate); }

        .donut-wrap { display: flex; flex-direction: column; align-items: center; gap: 16px; }
        .donut-svg { width: 100%; max-width: 200px; height: auto; }
        .donut-legend { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; width: 100%; }
        .donut-legend li { display: flex; align-items: center; gap: 9px; font-size: 13px; }
        .legend-dot { width: 10px; height: 10px; border-radius: 3px; flex: 0 0 auto; }
        .legend-label { color: var(--ink); font-weight: 700; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .legend-value { color: var(--slate); font-size: 12px; white-space: nowrap; }

        .leaderboard { list-style: none; margin: 0; padding: 0; display: grid; gap: 16px; }
        .leaderboard-row { display: flex; align-items: flex-start; gap: 12px; }
        .leaderboard-rank {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: rgba(25,35,40,.06);
          color: var(--ink);
          font-weight: 900;
          font-size: 12px;
          display: grid;
          place-items: center;
          flex: 0 0 auto;
        }
        .leaderboard-main { flex: 1; min-width: 0; display: grid; gap: 6px; }
        .leaderboard-top { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
        .leaderboard-top strong { font-size: 14px; color: var(--ink); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .leaderboard-top span { font-size: 13px; font-weight: 800; color: var(--ink); white-space: nowrap; }
        .leaderboard-track { height: 7px; border-radius: 999px; background: rgba(25,35,40,.06); overflow: hidden; }
        .leaderboard-fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, #afff00, #7fc700); }
        .leaderboard-sub { font-size: 12px; color: var(--slate); font-weight: 600; }

        .weekday-chart { display: flex; align-items: flex-end; gap: 10px; padding-top: 18px; }
        .weekday-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px; }
        .weekday-count { font-size: 12px; font-weight: 800; color: var(--ink); }
        .weekday-bar-track {
          width: 100%;
          max-width: 34px;
          height: 130px;
          background: rgba(25,35,40,.05);
          border-radius: 8px;
          display: flex;
          align-items: flex-end;
          overflow: hidden;
        }
        .weekday-bar-fill { width: 100%; background: var(--slate); border-radius: 8px 8px 0 0; opacity: .55; }
        .weekday-bar-fill.best { background: linear-gradient(180deg, #afff00, #7fc700); opacity: 1; }
        .weekday-label { font-size: 12px; font-weight: 700; color: var(--slate); }

        .chart-empty { color: var(--slate); font-size: 13px; }

        @media (max-width: 560px) {
          .trend-chart-svg { height: 190px; }
          .weekday-bar-track { height: 90px; }
          .leaderboard-top strong { max-width: 140px; }
        }
      `}</style>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon lime">
            <IconTicket size={20} />
          </div>
          <span>Avg. order value</span>
          <strong>{formatCurrency(analytics.avgOrderValue)}</strong>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">
            <IconRepeat size={20} />
          </div>
          <span>Repeat customers</span>
          <strong>{analytics.repeatRate}%</strong>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">
            <IconBox size={20} />
          </div>
          <span>Items sold</span>
          <strong>{analytics.itemsSold}</strong>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <IconCalendar size={20} />
          </div>
          <span>Best day</span>
          <strong>{analytics.bestDay || '—'}</strong>
        </div>
      </div>

      <div className="content-card full-span">
        <div className="card-header">
          <h3>Revenue trend — last 14 days</h3>
          <span className={`trend-badge ${analytics.trendDirection}`}>{analytics.trendLabel}</span>
        </div>
        <RevenueTrendChart data={analytics.dailyRevenue} formatCurrency={formatCurrency} />
      </div>

      <div className="content-card">
        <div className="card-header">
          <h3>Top products</h3>
        </div>
        {analytics.topProducts.length > 0 ? (
          <TopProductsLeaderboard products={analytics.topProducts} formatCurrency={formatCurrency} />
        ) : (
          <p className="chart-empty">No product sales recorded yet.</p>
        )}
      </div>

      <div className="content-card">
        <div className="card-header">
          <h3>Sales by category</h3>
        </div>
        {analytics.categoryBreakdown.length > 0 ? (
          <CategoryDonutChart segments={analytics.categoryBreakdown} formatCurrency={formatCurrency} />
        ) : (
          <p className="chart-empty">No category data yet.</p>
        )}
      </div>

      <div className="content-card full-span">
        <div className="card-header">
          <h3>Orders by day of week</h3>
        </div>
        <WeekdayBarChart data={analytics.weekdayData} />
      </div>
    </>
  );
}
