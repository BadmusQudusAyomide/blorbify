import { useState } from 'react';
import { IconBriefcase, IconArrowRight, IconCheck } from './onboardingIcons';

function splitEmojiLabel(label) {
  const [emoji, ...rest] = label.split(' ');
  return { emoji, text: rest.join(' ') };
}

export default function Step1_BusinessInfo({ formData = {}, updateFormData, onNext }) {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const safeFormData = formData || {};

  const businessTypes = [
    { value: 'fashion', label: '👗 Fashion & Clothing' },
    { value: 'beauty', label: '💄 Beauty & Cosmetics' },
    { value: 'food', label: '🍔 Food & Beverages' },
    { value: 'electronics', label: '📱 Electronics & Gadgets' },
    { value: 'services', label: '💼 Services' },
    { value: 'handmade', label: '🎨 Handmade & Crafts' },
    { value: 'health', label: '💊 Health & Wellness' },
    { value: 'others', label: '📦 Others' },
  ];

  const states = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
    'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
    'FCT Abuja', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina',
    'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun',
    'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba',
    'Yobe', 'Zamfara'
  ];

  const validateField = (name, value) => {
    const normalizedValue = typeof value === 'string' ? value : '';

    switch (name) {
      case 'businessName':
        if (!normalizedValue.trim()) return 'Business name is required';
        if (normalizedValue.trim().length < 2) return 'Business name must be at least 2 characters';
        return '';
      case 'businessType':
        if (!normalizedValue) return 'Please select your business type';
        return '';
      case 'phone':
        if (!normalizedValue) return 'Phone number is required';
        if (!/^[0-9]{10,11}$/.test(normalizedValue.replace(/\D/g, ''))) 
          return 'Please enter a valid phone number (e.g., 08012345678)';
        return '';
      case 'city':
        if (!normalizedValue.trim()) return 'City is required';
        return '';
      case 'state':
        if (!normalizedValue) return 'Please select your state';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
    
    // Validate on change
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleTypeSelect = (value) => {
    updateFormData({ businessType: value });
    setTouched(prev => ({ ...prev, businessType: true }));
    setErrors(prev => ({ ...prev, businessType: validateField('businessType', value) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate all fields
    const fields = ['businessName', 'businessType', 'phone', 'city', 'state'];
    const newErrors = {};
    let hasError = false;

    fields.forEach(field => {
      const error = validateField(field, safeFormData[field]);
      if (error) {
        newErrors[field] = error;
        hasError = true;
      }
    });

    setErrors(newErrors);
    setTouched(fields.reduce((acc, field) => ({ ...acc, [field]: true }), {}));

    if (!hasError) {
      onNext();
    }
  };

  return (
    <div className="step-card">
      <style>{`
        .form-group { margin-bottom: 18px; }
        .form-label {
          display: block;
          color: var(--ink);
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 8px;
          letter-spacing: 0.01em;
        }
        .form-label .required { color: var(--danger); margin-left: 4px; }
        .form-input {
          width: 100%;
          padding: 14px 16px;
          border: 1px solid rgba(25,35,40,0.1);
          border-radius: 14px;
          font-size: 15px;
          font-family: 'Raleway', sans-serif;
          color: var(--ink);
          transition: all 0.25s ease;
          background: #fff;
          box-shadow: inset 0 1px 2px rgba(0,0,0,0.02);
        }
        .form-input:focus { outline: none; border-color: var(--signal); box-shadow: 0 0 0 4px rgba(175,255,0,0.14); }
        .form-input.error { border-color: var(--danger); }
        .form-input.error:focus { box-shadow: 0 0 0 4px rgba(255,107,107,0.12); }
        .form-input::placeholder { color: var(--slate-dark); }
        .form-select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M6 8L1 3h10z' fill='%235C6B6E'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 16px center; padding-right: 44px; cursor: pointer; }
        .form-select option { padding: 8px; }
        .form-error { color: var(--danger); font-size: 13px; font-weight: 600; margin-top: 6px; display: flex; align-items: center; gap: 6px; }
        .form-error::before { content: '•'; font-size: 16px; }
        .form-hint { color: var(--slate-dark); font-size: 13px; margin-top: 4px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

        .type-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 10px;
        }
        .type-card {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 16px 10px 12px;
          border-radius: 16px;
          border: 1px solid rgba(25,35,40,0.1);
          background: #fff;
          cursor: pointer;
          font-family: 'Raleway', sans-serif;
          transition: all var(--dur-fast) var(--ease-out-expo);
        }
        .type-card:hover { transform: translateY(-2px); box-shadow: 0 10px 22px rgba(0,0,0,0.07); }
        .type-card.selected {
          border-color: var(--signal);
          background: rgba(175,255,0,0.08);
          box-shadow: 0 0 0 3px rgba(175,255,0,0.16);
        }
        .type-card-emoji { font-size: 26px; line-height: 1; }
        .type-card-label { font-size: 12.5px; font-weight: 700; color: var(--ink); text-align: center; line-height: 1.3; }
        .type-card-check {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--signal);
          color: var(--ink);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: popIn 0.25s var(--ease-out-expo);
        }

        .btn-next {
          margin-top: 8px;
          min-width: 180px;
        }
        .next-row { display: flex; justify-content: flex-end; margin-top: 8px; }
        @media (max-width: 640px) {
          .form-row { grid-template-columns: 1fr; }
          .next-row { justify-content: stretch; }
          .btn-next { width: 100%; }
        }
      `}</style>

      <div className="step-title"><IconBriefcase size={20} style={{ display: 'inline-block', marginRight: 8, verticalAlign: 'middle' }} /> Tell us about your business</div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">
            Business Name <span className="required">*</span>
          </label>
          <input
            type="text"
            name="businessName"
            className={`form-input ${touched.businessName && errors.businessName ? 'error' : ''}`}
            placeholder="e.g., Chioma's Fashion Hub"
            value={safeFormData.businessName || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            maxLength="50"
          />
          {touched.businessName && errors.businessName && (
            <div className="form-error">{errors.businessName}</div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">
            Business Type <span className="required">*</span>
          </label>
          <div className="type-grid" role="radiogroup" aria-label="Business type">
            {businessTypes.map(type => {
              const { emoji, text } = splitEmojiLabel(type.label);
              const selected = safeFormData.businessType === type.value;
              return (
                <button
                  key={type.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  className={`type-card ${selected ? 'selected' : ''}`}
                  onClick={() => handleTypeSelect(type.value)}
                >
                  {selected && <span className="type-card-check"><IconCheck size={12} /></span>}
                  <span className="type-card-emoji">{emoji}</span>
                  <span className="type-card-label">{text}</span>
                </button>
              );
            })}
          </div>
          {touched.businessType && errors.businessType && (
            <div className="form-error">{errors.businessType}</div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Business Description</label>
          <textarea
            name="description"
            className="form-input"
            placeholder="What do you sell? What makes your business special?"
            value={safeFormData.description || ''}
            onChange={handleChange}
            rows="3"
            maxLength="200"
          />
          <div className="form-hint">
            {(safeFormData.description || '').length}/200 characters
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            Phone Number <span className="required">*</span>
          </label>
          <input
            type="tel"
            name="phone"
            className={`form-input ${touched.phone && errors.phone ? 'error' : ''}`}
            placeholder="08012345678"
            value={safeFormData.phone || ''}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {touched.phone && errors.phone && (
            <div className="form-error">{errors.phone}</div>
          )}
          <div className="form-hint">Used for delivery communication with your customers</div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">
              City <span className="required">*</span>
            </label>
            <input
              type="text"
              name="city"
              className={`form-input ${touched.city && errors.city ? 'error' : ''}`}
              placeholder="e.g., Lagos, Ibadan"
              value={safeFormData.city || ''}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.city && errors.city && (
              <div className="form-error">{errors.city}</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              State <span className="required">*</span>
            </label>
            <select
              name="state"
              className={`form-input form-select ${touched.state && errors.state ? 'error' : ''}`}
              value={safeFormData.state || ''}
              onChange={handleChange}
              onBlur={handleBlur}
            >
              <option value="">Select your state</option>
              {states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            {touched.state && errors.state && (
              <div className="form-error">{errors.state}</div>
            )}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Social Links (Optional)</label>
          <input
            type="text"
            name="instagram"
            className="form-input"
            placeholder="Instagram username (e.g., @yourbrand)"
            value={safeFormData.instagram || ''}
            onChange={handleChange}
          />
          <div className="form-hint" style={{ marginTop: 8 }}>
            This helps customers connect with you on social media
          </div>
        </div>

        <div className="next-row">
          <button type="submit" className="btn-next">
            Continue
            <IconArrowRight size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
