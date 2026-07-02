import { useEffect, useMemo, useState } from 'react';
import { collection, doc, limit, onSnapshot, query, where } from 'firebase/firestore';
import { db } from './firebase';

const emptyStats = {
  revenue: 0,
  totalOrders: 0,
  totalCustomers: 0,
  totalProducts: 0,
};

const IconBase = ({ children, size = 20, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" {...rest}>
    {children}
  </svg>
);

const IconDashboard = (props) => (
  <IconBase {...props}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
  </IconBase>
);

const IconStore = (props) => (
  <IconBase {...props}>
    <path d="M4 9 5.4 4.5h13.2L20 9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 9v10.5h14V9" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    <path d="M9 19.5V14h6v5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    <path d="M4 9c.7 1.3 2.7 1.3 3.4 0 .7 1.3 2.7 1.3 3.4 0 .7 1.3 2.7 1.3 3.4 0 .7 1.3 2.7 1.3 3.4 0 .7 1.3 2.7 1.3 3.4 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </IconBase>
);

const IconOrders = (props) => (
  <IconBase {...props}>
    <path d="M6.5 4.5h11a1.5 1.5 0 0 1 1.5 1.5v14l-3-1.8-3 1.8-3-1.8-3 1.8V6a1.5 1.5 0 0 1 1.5-1.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    <path d="M9 9h6M9 12.5h6M9 16h3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </IconBase>
);

const IconPalette = (props) => (
  <IconBase {...props}>
    <path d="M12 3.5a8.5 8.5 0 0 0 0 17h1.3c1 0 1.4-1.2.7-1.9-.9-.9-.2-2.4 1.1-2.4H17A6.7 6.7 0 0 0 23 9.5c0-3.3-4.9-6-11-6Z" stroke="currentColor" strokeWidth="1.7" />
    <circle cx="8" cy="10" r="1" fill="currentColor" />
    <circle cx="12" cy="8" r="1" fill="currentColor" />
    <circle cx="16" cy="10" r="1" fill="currentColor" />
  </IconBase>
);

const IconUsers = (props) => (
  <IconBase {...props}>
    <path d="M16 20v-1.5c0-2.2-1.8-4-4-4H6c-2.2 0-4 1.8-4 4V20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    <circle cx="9" cy="7.5" r="3.5" stroke="currentColor" strokeWidth="1.7" />
    <path d="M22 20v-1.5c0-1.9-1.3-3.5-3-3.9M16 4.3a3.5 3.5 0 0 1 0 6.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </IconBase>
);

const IconMenu = (props) => (
  <IconBase {...props}>
    <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </IconBase>
);

const IconClose = (props) => (
  <IconBase {...props}>
    <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </IconBase>
);

const IconLogout = (props) => (
  <IconBase {...props}>
    <path d="M9.5 20H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    <path d="M15 7l5 5-5 5M20 12H9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </IconBase>
);

function formatCurrency(value) {
  const amount = Number(value || 0);
  return `NGN ${amount.toLocaleString()}`;
}

function titleCase(value) {
  if (!value) return 'Not set';
  return String(value)
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getDisplayName(user, profile) {
  const fullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ').trim();
  return profile?.displayName || fullName || user?.displayName || user?.email?.split('@')[0] || 'Merchant';
}

function StatCard({ label, value, icon: Icon, tone = 'lime' }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tone}`}>
        <Icon size={20} />
      </div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="detail-row">
      <span>{label}</span>
      <strong>{value || 'Not set'}</strong>
    </div>
  );
}

function OrderRow({ order }) {
  return (
    <div className="order-row">
      <div>
        <strong>{order.customerName || order.customer?.name || 'Customer'}</strong>
        <span>{order.id ? `#${order.id.slice(0, 8)}` : 'New order'}</span>
      </div>
      <div>
        <strong>{formatCurrency(order.total || order.amount)}</strong>
        <span className="status-pill">{order.status || 'pending'}</span>
      </div>
    </div>
  );
}

export default function Dashboard({ user, userProfile, onLogout }) {
  const [profile, setProfile] = useState(userProfile || null);
  const [store, setStore] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(Boolean(user?.uid));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [ordersError, setOrdersError] = useState('');

  useEffect(() => {
    if (!user?.uid) {
      return undefined;
    }

    const userRef = doc(db, 'users', user.uid);
    const storeRef = doc(db, 'stores', user.uid);
    const ordersQuery = query(collection(db, 'orders'), where('storeId', '==', user.uid), limit(8));

    const unsubscribeUser = onSnapshot(
      userRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setProfile((current) => ({ ...(current || {}), ...snapshot.data() }));
        }
      },
      (error) => {
        console.error('Dashboard user profile load failed:', error);
      }
    );

    const unsubscribeStore = onSnapshot(
      storeRef,
      (snapshot) => {
        setStore(snapshot.exists() ? snapshot.data() : null);
        setLoading(false);
      },
      (error) => {
        console.error('Dashboard store load failed:', error);
        setStore(null);
        setLoading(false);
      }
    );

    const unsubscribeOrders = onSnapshot(
      ordersQuery,
      (snapshot) => {
        setOrders(snapshot.docs.map((orderDoc) => ({ id: orderDoc.id, ...orderDoc.data() })));
        setOrdersError('');
      },
      (error) => {
        console.error('Dashboard orders load failed:', error);
        setOrders([]);
        setOrdersError('Orders will appear here after Firestore access is enabled for your store orders.');
      }
    );

    return () => {
      unsubscribeUser();
      unsubscribeStore();
      unsubscribeOrders();
    };
  }, [user?.uid]);

  const storeInfo = useMemo(() => {
    return store || profile?.onboardingData || profile?.onboardingDraft || {};
  }, [profile, store]);

  const stats = useMemo(() => {
    const uniqueCustomers = new Set(
      orders
        .map((order) => order.customerId || order.customerEmail || order.customer?.email || order.customerName)
        .filter(Boolean)
    );
    const revenue = orders.reduce((total, order) => total + Number(order.total || order.amount || 0), 0);
    const products = Array.isArray(storeInfo.products) ? storeInfo.products.filter((product) => product?.name) : [];

    return {
      ...emptyStats,
      ...(storeInfo.stats || {}),
      revenue: storeInfo.stats?.revenue || revenue,
      totalOrders: storeInfo.stats?.totalOrders || orders.length,
      totalCustomers: storeInfo.stats?.totalCustomers || uniqueCustomers.size,
      totalProducts: storeInfo.stats?.totalProducts || products.length,
    };
  }, [orders, storeInfo]);

  const displayName = getDisplayName(user, profile);
  const businessName = storeInfo.businessName || profile?.businessName || 'Your store';
  const storeSlug = storeInfo.storeSlug || profile?.storeSlug || 'your-store';
  const storeUrl = `https://${storeSlug}.blorbify.com`;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: IconDashboard },
    { id: 'business', label: 'Business Info', icon: IconStore },
    { id: 'orders', label: 'Orders', icon: IconOrders },
    { id: 'appearance', label: 'Appearance', icon: IconPalette },
  ];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <style>{`
          .dashboard-loading {
            min-height: 100vh;
            display: grid;
            place-items: center;
            background: #f6f8f1;
            color: #192328;
            font-family: Raleway, system-ui, sans-serif;
          }
          .dashboard-loader {
            width: 44px;
            height: 44px;
            border-radius: 999px;
            border: 3px solid #e3e8d9;
            border-top-color: #192328;
            animation: dashSpin .75s linear infinite;
            margin: 0 auto 14px;
          }
          @keyframes dashSpin { to { transform: rotate(360deg); } }
        `}</style>
        <div>
          <div className="dashboard-loader" />
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap');

        .dashboard-root {
          --ink: #192328;
          --ink-deep: #0f1518;
          --ink-soft: #233038;
          --signal: #afff00;
          --paper: #f6f8f1;
          --paper-dim: #e8eddf;
          --slate: #728084;
          --line: rgba(25,35,40,0.1);
          min-height: 100vh;
          background: var(--paper);
          color: var(--ink);
          display: flex;
          font-family: Raleway, system-ui, sans-serif;
          text-align: left;
        }
        .dashboard-root * { box-sizing: border-box; }
        .dashboard-sidebar {
          width: 270px;
          background: var(--ink-deep);
          color: #f6f8f1;
          position: fixed;
          inset: 0 auto 0 0;
          padding: 22px 16px;
          display: flex;
          flex-direction: column;
          z-index: 20;
          transition: transform .25s ease;
        }
        .dashboard-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 8px 20px;
          border-bottom: 1px solid rgba(255,255,255,.1);
          margin-bottom: 18px;
        }
        .brand-dot {
          width: 11px;
          height: 11px;
          border-radius: 4px;
          background: var(--signal);
          box-shadow: 0 0 18px rgba(175,255,0,.5);
        }
        .brand-name { font-size: 21px; font-weight: 900; letter-spacing: -0.02em; }
        .brand-sub {
          color: #93a2a6;
          font-family: "JetBrains Mono", monospace;
          font-size: 10px;
          letter-spacing: .1em;
          text-transform: uppercase;
        }
        .dashboard-nav {
          display: grid;
          gap: 6px;
          flex: 1;
          align-content: start;
        }
        .nav-item {
          width: 100%;
          border: 0;
          background: transparent;
          color: #93a2a6;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 12px;
          cursor: pointer;
          font: inherit;
          font-size: 14px;
          font-weight: 700;
          text-align: left;
        }
        .nav-item:hover { background: var(--ink-soft); color: #fff; }
        .nav-item.active { background: var(--signal); color: var(--ink); }
        .dashboard-user {
          border-top: 1px solid rgba(255,255,255,.1);
          padding-top: 14px;
        }
        .user-chip {
          display: flex;
          gap: 11px;
          align-items: center;
          padding: 10px 8px 14px;
          min-width: 0;
        }
        .avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: var(--signal);
          color: var(--ink);
          font-weight: 900;
          flex: 0 0 auto;
        }
        .user-chip strong, .user-chip span {
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .user-chip strong { color: #fff; font-size: 14px; }
        .user-chip span { color: #93a2a6; font-size: 12px; }
        .logout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          border: 1px solid rgba(255,255,255,.1);
          background: rgba(255,255,255,.04);
          color: #f6f8f1;
          border-radius: 12px;
          padding: 11px 12px;
          cursor: pointer;
          font: inherit;
          font-weight: 800;
        }
        .dashboard-main {
          width: 100%;
          min-width: 0;
          margin-left: 270px;
          padding: 24px clamp(16px, 3vw, 36px) 36px;
        }
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 22px;
        }
        .mobile-toggle {
          display: none;
          width: 42px;
          height: 42px;
          border: 1px solid var(--line);
          border-radius: 12px;
          background: #fff;
          color: var(--ink);
          place-items: center;
          cursor: pointer;
        }
        .headline h1 {
          font-size: clamp(26px, 4vw, 38px);
          line-height: 1.05;
          margin: 0 0 6px;
          color: var(--ink);
          font-weight: 900;
          letter-spacing: 0;
        }
        .headline p {
          color: var(--slate);
          margin: 0;
          font-size: 15px;
        }
        .store-link {
          display: inline-flex;
          align-items: center;
          max-width: 100%;
          border: 1px solid var(--line);
          background: #fff;
          color: var(--ink);
          border-radius: 999px;
          padding: 11px 15px;
          font-family: "JetBrains Mono", monospace;
          font-size: 12px;
          text-decoration: none;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .hero-panel {
          background: linear-gradient(135deg, #192328 0%, #0f1518 100%);
          color: #f6f8f1;
          border-radius: 8px;
          padding: clamp(18px, 3vw, 28px);
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 18px;
          align-items: center;
          margin-bottom: 18px;
          overflow: hidden;
        }
        .hero-panel h2 {
          color: #f6f8f1;
          margin: 0 0 8px;
          font-size: clamp(22px, 3vw, 30px);
          line-height: 1.1;
          letter-spacing: 0;
        }
        .hero-panel p {
          color: #b9c4c7;
          max-width: 680px;
          line-height: 1.6;
          margin: 0;
        }
        .hero-badge {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          min-width: 130px;
          border-radius: 999px;
          background: var(--signal);
          color: var(--ink);
          padding: 12px 16px;
          font-weight: 900;
          text-transform: uppercase;
          font-size: 12px;
          letter-spacing: .08em;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 18px;
        }
        .stat-card, .content-card {
          background: #fff;
          border: 1px solid var(--line);
          border-radius: 8px;
          box-shadow: 0 12px 30px rgba(25,35,40,.05);
        }
        .stat-card {
          padding: 18px;
          display: grid;
          gap: 10px;
          min-width: 0;
        }
        .stat-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: grid;
          place-items: center;
        }
        .stat-icon.lime { background: rgba(175,255,0,.22); color: #4e7300; }
        .stat-icon.blue { background: rgba(69,183,209,.16); color: #12708a; }
        .stat-icon.orange { background: rgba(255,160,122,.18); color: #a84c22; }
        .stat-icon.green { background: rgba(25,35,40,.08); color: var(--ink); }
        .stat-card span {
          color: var(--slate);
          font-size: 13px;
          font-weight: 700;
        }
        .stat-card strong {
          color: var(--ink);
          font-size: clamp(22px, 3vw, 29px);
          line-height: 1;
          overflow-wrap: anywhere;
        }
        .content-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.25fr) minmax(280px, .75fr);
          gap: 18px;
        }
        .content-card { padding: 20px; min-width: 0; }
        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 14px;
        }
        .card-header h3 {
          margin: 0;
          color: var(--ink);
          font-size: 18px;
          font-weight: 900;
          letter-spacing: 0;
        }
        .detail-list { display: grid; gap: 0; }
        .detail-row {
          display: grid;
          grid-template-columns: 150px minmax(0, 1fr);
          gap: 14px;
          padding: 13px 0;
          border-bottom: 1px solid var(--paper-dim);
        }
        .detail-row:last-child { border-bottom: 0; }
        .detail-row span {
          color: var(--slate);
          font-size: 13px;
          font-weight: 800;
        }
        .detail-row strong {
          color: var(--ink);
          font-size: 14px;
          overflow-wrap: anywhere;
        }
        .appearance-preview {
          min-height: 170px;
          border-radius: 8px;
          border: 1px solid var(--line);
          background: ${storeInfo.primaryColor || '#afff00'};
          display: grid;
          place-items: center;
          padding: 18px;
          text-align: center;
        }
        .appearance-preview div {
          background: rgba(255,255,255,.9);
          border-radius: 8px;
          padding: 18px;
          width: min(100%, 320px);
          box-shadow: 0 16px 36px rgba(0,0,0,.12);
        }
        .appearance-preview strong { display: block; color: var(--ink); font-size: 18px; margin-bottom: 4px; }
        .appearance-preview span { color: var(--slate); font-size: 13px; }
        .orders-list { display: grid; gap: 10px; }
        .order-row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          border: 1px solid var(--paper-dim);
          border-radius: 8px;
          padding: 13px;
        }
        .order-row div {
          display: grid;
          gap: 4px;
          min-width: 0;
        }
        .order-row div:last-child { text-align: right; }
        .order-row strong {
          color: var(--ink);
          font-size: 14px;
          overflow-wrap: anywhere;
        }
        .order-row span {
          color: var(--slate);
          font-size: 12px;
        }
        .status-pill {
          justify-self: end;
          width: fit-content;
          border-radius: 999px;
          background: rgba(175,255,0,.22);
          color: var(--ink) !important;
          padding: 4px 9px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .05em;
        }
        .empty-state {
          border: 1px dashed var(--line);
          border-radius: 8px;
          padding: 30px 18px;
          text-align: center;
          color: var(--slate);
          line-height: 1.6;
        }
        .sidebar-backdrop {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(15,21,24,.45);
          z-index: 10;
        }
        @media (max-width: 1100px) {
          .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .content-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 780px) {
          .dashboard-sidebar { transform: translateX(-100%); }
          .dashboard-sidebar.open { transform: translateX(0); }
          .sidebar-backdrop.open { display: block; }
          .dashboard-main { margin-left: 0; padding: 16px; }
          .mobile-toggle { display: grid; }
          .topbar { align-items: flex-start; }
          .hero-panel { grid-template-columns: 1fr; }
          .hero-badge { width: fit-content; }
          .store-link { width: 100%; justify-content: center; }
        }
        @media (max-width: 560px) {
          .stats-grid { grid-template-columns: 1fr; }
          .topbar { flex-direction: column; }
          .detail-row { grid-template-columns: 1fr; gap: 4px; }
          .order-row { flex-direction: column; }
          .order-row div:last-child { text-align: left; }
          .status-pill { justify-self: start; }
        }
      `}</style>

      <div className={`sidebar-backdrop ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="dashboard-brand">
          <span className="brand-dot" />
          <div>
            <div className="brand-name">Blorbify</div>
            <div className="brand-sub">by Blorbmart</div>
          </div>
        </div>

        <nav className="dashboard-nav" aria-label="Dashboard sections">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(tab.id);
                setSidebarOpen(false);
              }}
            >
              <tab.icon size={19} />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="dashboard-user">
          <div className="user-chip">
            <div className="avatar">{displayName.charAt(0).toUpperCase()}</div>
            <div>
              <strong>{displayName}</strong>
              <span>{user?.email}</span>
            </div>
          </div>
          <button type="button" className="logout-btn" onClick={onLogout}>
            <IconLogout size={18} />
            Logout
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="topbar">
          <button
            type="button"
            className="mobile-toggle"
            onClick={() => setSidebarOpen((value) => !value)}
            aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
          >
            {sidebarOpen ? <IconClose size={22} /> : <IconMenu size={22} />}
          </button>
          <div className="headline">
            <h1>Dashboard</h1>
            <p>Welcome back, {displayName}. Your store setup is synced from Firestore.</p>
          </div>
          <a className="store-link" href={storeUrl} target="_blank" rel="noreferrer">
            {storeUrl}
          </a>
        </header>

        <section className="hero-panel">
          <div>
            <h2>{businessName}</h2>
            <p>
              {storeInfo.description ||
                'Your store profile is ready. Add products whenever you are prepared to start taking orders.'}
            </p>
          </div>
          <div className="hero-badge">Onboarded</div>
        </section>

        <section className="stats-grid" aria-label="Store stats">
          <StatCard label="Revenue" value={formatCurrency(stats.revenue)} icon={IconDashboard} tone="lime" />
          <StatCard label="Orders" value={stats.totalOrders} icon={IconOrders} tone="blue" />
          <StatCard label="Customers" value={stats.totalCustomers} icon={IconUsers} tone="orange" />
          <StatCard label="Products" value={stats.totalProducts} icon={IconStore} tone="green" />
        </section>

        <section className="content-grid">
          {(activeTab === 'overview' || activeTab === 'business') && (
            <div className="content-card">
              <div className="card-header">
                <h3>Business Information</h3>
              </div>
              <div className="detail-list">
                <DetailRow label="Business name" value={businessName} />
                <DetailRow label="Business type" value={titleCase(storeInfo.businessType || profile?.businessType)} />
                <DetailRow label="Phone" value={storeInfo.phone || profile?.phone} />
                <DetailRow label="Location" value={[storeInfo.city || profile?.city, storeInfo.state || profile?.state].filter(Boolean).join(', ')} />
                <DetailRow label="Instagram" value={storeInfo.instagram || profile?.instagram} />
                <DetailRow label="Store slug" value={storeSlug} />
              </div>
            </div>
          )}

          {(activeTab === 'overview' || activeTab === 'appearance') && (
            <div className="content-card">
              <div className="card-header">
                <h3>Appearance</h3>
              </div>
              <div className="appearance-preview">
                <div>
                  <strong>{titleCase(storeInfo.template || profile?.template || 'minimal')}</strong>
                  <span>Primary color {storeInfo.primaryColor || profile?.primaryColor || '#AFFF00'}</span>
                </div>
              </div>
            </div>
          )}

          {(activeTab === 'overview' || activeTab === 'orders') && (
            <div className="content-card">
              <div className="card-header">
                <h3>Recent Orders</h3>
              </div>
              {orders.length > 0 ? (
                <div className="orders-list">
                  {orders.map((order) => (
                    <OrderRow key={order.id} order={order} />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <strong>No orders yet.</strong>
                  <br />
                  {ordersError || 'Your orders will show here as soon as customers start buying.'}
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
