import { useState } from 'react';
import { IconPalette, IconArrowLeft, IconArrowRight } from './onboardingIcons';
import { colorPresets, getReadableTextColor, storeTemplates } from './storeTemplates';

export default function Step2_TemplateSelect({ formData, updateFormData, onNext, onPrev }) {
  const [selectedTemplate, setSelectedTemplate] = useState(formData.template || 'signature');
  const [primaryColor, setPrimaryColor] = useState(formData.primaryColor || '#AFFF00');

  const handleTemplateSelect = (templateId) => {
    setSelectedTemplate(templateId);
    updateFormData({ template: templateId });
  };

  const handleColorChange = (color) => {
    setPrimaryColor(color);
    updateFormData({ primaryColor: color });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateFormData({
      template: selectedTemplate,
      primaryColor: primaryColor,
    });
    onNext();
  };

  return (
    <div className="step-card">
      <style>{`
        .template-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; margin: 18px 0 22px; }
        .template-card {
          position: relative;
          border: 2px solid transparent;
          border-radius: 20px;
          overflow: hidden;
          cursor: pointer;
          transition: transform var(--dur-fast) var(--ease-out-expo), box-shadow var(--dur-fast) var(--ease-out-expo), border-color var(--dur-fast) ease;
          background: #fff;
          box-shadow: 0 10px 24px rgba(0,0,0,0.05);
          animation: cardIn var(--dur-med) var(--ease-out-expo) both;
          animation-delay: calc(var(--card-index, 0) * 60ms);
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .template-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%);
          transform: translateX(-120%);
          transition: transform 0.6s ease;
          pointer-events: none;
        }
        .template-card:hover { transform: translateY(-4px) rotate(-0.4deg); box-shadow: 0 14px 28px rgba(0,0,0,0.09); }
        .template-card:hover::after { transform: translateX(120%); }
        .template-card.selected {
          border-color: var(--tc-accent, var(--signal));
          animation: cardIn var(--dur-med) var(--ease-out-expo) both, pulseRing 2.4s ease-in-out infinite;
        }
        .template-preview-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          padding: 4px 10px;
          border-radius: 999px;
          background: rgba(15,21,24,0.72);
          color: var(--paper);
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          opacity: 0;
          transform: translateY(-4px);
          transition: all var(--dur-fast) ease;
        }
        .template-card:hover .template-preview-badge { opacity: 1; transform: translateY(0); }
        .template-preview { height: 150px; padding: 16px; display: grid; align-content: end; gap: 8px; background: var(--tc-surface); }
        .template-preview .swatch { width: 40px; height: 40px; border-radius: 10px; background: var(--tc-accent); }
        .template-preview .line-lg { width: 82%; height: 13px; border-radius: 999px; background: var(--tc-ink); }
        .template-preview .line-sm { width: 55%; height: 9px; border-radius: 999px; background: color-mix(in srgb, var(--tc-ink) 30%, transparent); }
        .preview-noir { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr auto auto; align-content: stretch; gap: 8px; }
        .preview-noir .swatch { grid-row: 1 / 4; width: auto; height: auto; border-radius: 4px; background: linear-gradient(150deg, color-mix(in srgb, var(--tc-accent) 30%, var(--tc-ink)), var(--tc-ink)); }
        .preview-noir .line-lg { align-self: end; border-radius: 4px; text-transform: uppercase; }
        .preview-noir .line-sm { border-radius: 4px; background: var(--tc-accent); height: 7px; width: 40%; }
        .preview-bloom { background: color-mix(in srgb, var(--tc-accent) 14%, var(--tc-surface)); justify-items: center; text-align: center; }
        .preview-bloom .swatch { width: 52px; height: 52px; border-radius: 50%; }
        .preview-bloom .line-lg, .preview-bloom .line-sm { justify-self: center; }
        .preview-kitchen { grid-template-rows: auto auto auto; align-content: center; gap: 6px; }
        .preview-kitchen .swatch { width: 100%; height: 14px; border-radius: 4px; }
        .preview-kitchen .line-lg { height: 10px; border-radius: 3px; }
        .preview-kitchen .line-sm { height: 8px; border-radius: 3px; background: var(--tc-accent); }
        .preview-atelier { background: color-mix(in srgb, var(--tc-accent) 10%, var(--tc-surface)); }
        .preview-atelier .swatch { transform: rotate(-4deg); border-radius: 2px; box-shadow: 0 8px 14px -8px rgba(0,0,0,.3); }
        .preview-atelier .line-lg { border-radius: 2px; }
        .preview-atelier .line-sm { border-radius: 2px; }
        .preview-volt { border: 3px solid var(--tc-ink); box-sizing: border-box; gap: 8px; }
        .preview-volt .swatch { width: 36px; height: 36px; border-radius: 4px; transform: rotate(-6deg); box-shadow: 4px 4px 0 var(--tc-accent); }
        .preview-volt .line-lg { border-radius: 3px; transform: rotate(-1deg); transform-origin: left center; }
        .preview-volt .line-sm { border-radius: 3px; background: var(--tc-accent); height: 7px; width: 45%; }
        .preview-nova { border: 1px solid color-mix(in srgb, var(--tc-ink) 15%, transparent); box-sizing: border-box; grid-template-rows: auto auto auto; align-content: center; gap: 7px; }
        .preview-nova .swatch { width: 34px; height: 34px; border-radius: 8px; background: var(--tc-ink); }
        .preview-nova .line-lg { border-radius: 4px; height: 11px; }
        .preview-nova .line-sm { border-radius: 4px; background: var(--tc-accent); height: 7px; width: 35%; }
        .preview-boutique { justify-items: center; text-align: center; background: color-mix(in srgb, var(--tc-accent) 8%, var(--tc-surface)); }
        .preview-boutique .swatch { width: 44px; height: 56px; border-radius: 0; background: color-mix(in srgb, var(--tc-accent) 35%, var(--tc-surface)); }
        .preview-boutique .line-lg, .preview-boutique .line-sm { justify-self: center; border-radius: 0; }
        .preview-runway { border: 2px solid var(--tc-ink); box-sizing: border-box; grid-template-columns: 1fr 1fr; gap: 8px; }
        .preview-runway .swatch { grid-row: 1 / 4; width: auto; height: auto; border-radius: 0; background: var(--tc-ink); }
        .preview-runway .line-lg { border-radius: 0; text-transform: uppercase; }
        .preview-runway .line-sm { border-radius: 0; background: var(--tc-accent); height: 7px; width: 45%; }
        .preview-campus-runs {
          background: radial-gradient(circle, color-mix(in srgb, var(--tc-accent) 18%, transparent) 1px, var(--tc-ink) 1px) 0 0/12px 12px, var(--tc-ink);
          grid-template-rows: auto auto auto;
          align-content: center;
          gap: 8px;
          position: relative;
        }
        .preview-campus-runs::before {
          content: '';
          position: absolute;
          left: 24px;
          top: 12px;
          bottom: 12px;
          width: 2px;
          background: repeating-linear-gradient(to bottom, var(--tc-accent) 0 4px, transparent 4px 8px);
        }
        .preview-campus-runs .swatch { width: 34px; height: 34px; border-radius: 50%; border: 2px solid var(--tc-accent); background: color-mix(in srgb, var(--tc-accent) 35%, var(--tc-ink)); }
        .preview-campus-runs .line-lg { border-radius: 4px; background: var(--tc-surface); height: 10px; }
        .preview-campus-runs .line-sm { border-radius: 4px; background: var(--tc-accent); height: 7px; width: 40%; }
        .template-info { padding: 13px 15px; }
        .template-info h4 { font-size: 15px; font-weight: 800; color: var(--ink); margin: 0 0 4px; }
        .template-info p { font-size: 12.5px; color: var(--slate-dark); line-height: 1.45; margin: 0; }
        .color-picker-section { margin: 16px 0 18px; }
        .color-picker-section label { display: block; font-weight: 700; color: var(--ink); margin-bottom: 10px; font-size: 14px; }
        .color-grid { display: flex; gap: 10px; flex-wrap: wrap; }
        .color-option { width: 40px; height: 40px; border-radius: 50%; border: 3px solid transparent; cursor: pointer; transition: all 0.2s ease; position: relative; }
        .color-option:hover { transform: scale(1.08); }
        .color-option.selected { border-color: var(--ink); box-shadow: 0 0 0 3px white, 0 0 0 5px var(--ink); }
        .color-option .check { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 15px; font-weight: 900; text-shadow: 0 1px 3px rgba(0,0,0,0.2); }
        .btn-group { display: flex; gap: 12px; margin-top: 8px; }
        .btn-next { min-width: 160px; }
        @media (max-width: 780px) { .template-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (max-width: 480px) { .template-grid { grid-template-columns: 1fr; } .btn-group { flex-direction: column-reverse; } .btn-back, .btn-next { width: 100%; justify-content: center; } }
      `}</style>

      <div className="step-title"><IconPalette size={20} style={{ display: 'inline-block', marginRight: 8, verticalAlign: 'middle' }} /> Choose your store design</div>
      <p className="step-description">
        Pick a design that matches your brand. You can fine-tune colors, copy, and media later from your dashboard.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="template-grid">
          {storeTemplates.map((template, index) => (
            <div
              key={template.id}
              className={`template-card ${selectedTemplate === template.id ? 'selected' : ''}`}
              style={{ '--tc-accent': template.accent, '--tc-ink': template.ink, '--tc-surface': template.surface, '--card-index': index }}
              onClick={() => handleTemplateSelect(template.id)}
            >
              <span className="template-preview-badge">Preview</span>
              <div className={`template-preview preview-${template.id}`}>
                <div className="swatch" />
                <div className="line-lg" />
                <div className="line-sm" />
              </div>
              <div className="template-info">
                <h4>{template.name}</h4>
                <p>{template.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="color-picker-section">
          <label>Pick your primary color</label>
          <div className="color-grid">
            {colorPresets.map(color => (
              <div
                key={color}
                className={`color-option ${primaryColor === color ? 'selected' : ''}`}
                style={{ background: color }}
                onClick={() => handleColorChange(color)}
              >
                {primaryColor === color && (
                  <span className="check" style={{ color: getReadableTextColor(color) }}>✓</span>
                )}
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => handleColorChange(e.target.value)}
                style={{
                  width: 44,
                  height: 44,
                  border: 'none',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  padding: 0,
                }}
              />
              <span style={{ fontSize: 12, color: 'var(--slate-dark)' }}>Custom</span>
            </div>
          </div>
        </div>

        <div className="btn-group">
          <button type="button" className="btn-back" onClick={onPrev}>
            <IconArrowLeft size={16} />
            Back
          </button>
          <button type="submit" className="btn-next" style={{ flex: 1, justifyContent: 'center' }}>
            Continue
            <IconArrowRight size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
