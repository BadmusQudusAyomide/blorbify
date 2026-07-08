import { useState } from 'react';
import { IconRocket, IconArrowLeft, IconCheck } from './onboardingIcons';
import { createStoreSlug, getStoreUrl } from './storeLinks';
import { getStoreTemplate } from './storeTemplates';

export default function LaunchStore({ formData, onBack, onComplete, loading }) {
  const [agreed, setAgreed] = useState(false);
  const [checkboxError, setCheckboxError] = useState(false);
  const [toast, setToast] = useState(null);
  const slug = createStoreSlug(formData.businessName || formData.storeSlug || 'your-store');
  const storeUrl = getStoreUrl(slug);
  const templateName = getStoreTemplate(formData.template).name;

  const showToast = (message) => {
    setToast(message);
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(null), 3200);
  };

  const handleLaunchClick = () => {
    if (!agreed) {
      setCheckboxError(true);
      showToast('Please tick the checkbox to confirm before opening your dashboard.');
      return;
    }
    onComplete();
  };

  return (
    <div className="step-card">
      <style>{`
        .summary { background: rgba(25,35,40,0.03); border-radius: 16px; padding: 14px; margin-bottom: 14px; }
        .summary-item { display: flex; justify-content: space-between; gap: 12px; padding: 8px 0; border-bottom: 1px solid rgba(25,35,40,0.08); }
        .summary-item:last-child { border-bottom: none; }
        .summary-label { color: var(--slate-dark); }
        .summary-value { font-weight: 700; text-align: right; }
        .check-row { display: flex; align-items: flex-start; gap: 10px; margin: 16px 0; padding: 8px 10px; border-radius: 12px; color: var(--slate-dark); font-size: 14px; border: 1px solid transparent; transition: border-color 0.2s ease, background 0.2s ease; }
        .check-row input { margin-top: 2px; accent-color: var(--signal); }
        .check-row.error { border-color: rgba(220,53,69,0.4); background: rgba(220,53,69,0.06); animation: shake 0.32s ease; }
        .check-row.error span { color: #A52828; }
        .toast { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: var(--ink); color: var(--paper); padding: 12px 18px; border-radius: 999px; font-size: 13px; font-weight: 700; box-shadow: 0 12px 30px rgba(0,0,0,0.25); z-index: 50; animation: toastIn 0.25s ease; max-width: 90vw; text-align: center; }
        @keyframes toastIn { from { opacity: 0; transform: translate(-50%, -8px); } to { opacity: 1; transform: translate(-50%, 0); } }
        .btn-group { display: flex; gap: 12px; margin-top: 8px; }
        .btn-next { flex: 1; }
        .btn-next:hover:not(:disabled) svg { transform: scale(1.15); }
        .btn-next svg { transition: transform var(--dur-fast) var(--ease-out-expo); }
        .step-title .rocket-icon { display: inline-block; vertical-align: middle; margin-right: 8px; animation: popIn 0.5s var(--ease-out-expo); }
        @media (max-width: 640px) { .btn-group { flex-direction: column-reverse; } .btn-back, .btn-next { width: 100%; } }
      `}</style>

      {toast && <div className="toast" role="status">{toast}</div>}

      <div className="step-title"><IconRocket size={20} className="rocket-icon" /> You&rsquo;re ready to launch</div>
      <p className="step-description">Review your setup and save your store profile. You can add products later from your dashboard.</p>

      <div className="summary">
        <div className="summary-item">
          <span className="summary-label">Store name</span>
          <span className="summary-value">{formData.businessName || 'Not set'}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Store URL</span>
          <span className="summary-value">{storeUrl}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Design</span>
          <span className="summary-value">{templateName}</span>
        </div>
      </div>

      <label className={`check-row${checkboxError ? ' error' : ''}`}>
        <input
          type="checkbox"
          checked={agreed}
          onChange={(event) => {
            setAgreed(event.target.checked);
            if (event.target.checked) setCheckboxError(false);
          }}
        />
        <span>I&rsquo;m ready to save these onboarding details to Firestore and open my dashboard.</span>
      </label>

      <div className="btn-group">
        <button type="button" className="btn-back" onClick={onBack}>
          <IconArrowLeft size={16} />
          Back
        </button>
        <button type="button" className="btn-next" onClick={handleLaunchClick} disabled={loading}>
          {loading ? 'Saving...' : <><IconCheck size={16} /> Open dashboard</>}
        </button>
      </div>
    </div>
  );
}
