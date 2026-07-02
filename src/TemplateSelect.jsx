import { useState } from 'react';
import { IconPalette, IconArrowLeft, IconArrowRight } from './onboardingIcons';

export default function Step2_TemplateSelect({ formData, updateFormData, onNext, onPrev }) {
  const [selectedTemplate, setSelectedTemplate] = useState(formData.template || 'modern');
  const [primaryColor, setPrimaryColor] = useState(formData.primaryColor || '#AFFF00');
  
  const templates = [
    {
      id: 'modern',
      name: 'Modern',
      description: 'Clean, minimalist design perfect for any business',
      preview: 'https://loremflickr.com/400/300/modern,website,design?lock=1',
      colors: ['#AFFF00', '#192328', '#FFFFFF', '#F6F8F1'],
    },
    {
      id: 'elegant',
      name: 'Elegant',
      description: 'Sophisticated look for fashion, beauty, and luxury',
      preview: 'https://loremflickr.com/400/300/elegant,store,design?lock=2',
      colors: ['#D4AF37', '#1A1A1A', '#FFFFFF', '#F5F0E8'],
    },
    {
      id: 'bold',
      name: 'Bold',
      description: 'Vibrant and eye-catching for energetic brands',
      preview: 'https://loremflickr.com/400/300/vibrant,store,design?lock=3',
      colors: ['#FF6B35', '#0F1518', '#FFFFFF', '#FFF4F0'],
    },
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Simple, clean, and focused on your products',
      preview: 'https://loremflickr.com/400/300/minimal,store,design?lock=4',
      colors: ['#2C3E50', '#ECF0F1', '#FFFFFF', '#BDC3C7'],
    },
  ];

  const colorPresets = [
    '#AFFF00', '#FF6B6B', '#4ECDC4', '#45B7D1', 
    '#FFA07A', '#98D8C8', '#DDA0DD', '#F0E68C',
  ];

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
      primaryColor: primaryColor 
    });
    onNext();
  };

  return (
    <div className="step-card">
      <style>{`
        .template-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; margin: 18px 0 20px; }
        .template-card { border: 1px solid rgba(25,35,40,0.08); border-radius: 18px; overflow: hidden; cursor: pointer; transition: all 0.25s ease; background: #fff; box-shadow: 0 10px 24px rgba(0,0,0,0.04); }
        .template-card:hover { transform: translateY(-2px); box-shadow: 0 14px 28px rgba(0,0,0,0.08); }
        .template-card.selected { border-color: #AFFF00; box-shadow: 0 0 0 4px rgba(175,255,0,0.14); }
        .template-card img { width: 100%; height: 140px; object-fit: cover; }
        .template-info { padding: 12px 14px; }
        .template-info h4 { font-size: 15px; font-weight: 800; color: #192328; margin: 0 0 4px; }
        .template-info p { font-size: 13px; color: #5C6B6E; line-height: 1.5; margin: 0; }
        .color-picker-section { margin: 16px 0 18px; }
        .color-picker-section label { display: block; font-weight: 700; color: #192328; margin-bottom: 10px; font-size: 14px; }
        .color-grid { display: flex; gap: 10px; flex-wrap: wrap; }
        .color-option { width: 40px; height: 40px; border-radius: 50%; border: 3px solid transparent; cursor: pointer; transition: all 0.2s ease; position: relative; }
        .color-option:hover { transform: scale(1.08); }
        .color-option.selected { border-color: #192328; box-shadow: 0 0 0 3px white, 0 0 0 5px #192328; }
        .color-option .check { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-size: 15px; font-weight: bold; text-shadow: 0 1px 3px rgba(0,0,0,0.25); }
        .btn-group { display: flex; gap: 12px; margin-top: 8px; }
        .btn-back { background: transparent; border: 1px solid rgba(25,35,40,0.12); color: #5C6B6E; padding: 12px 20px; border-radius: 999px; font-weight: 700; font-size: 14px; cursor: pointer; transition: all 0.25s ease; font-family: 'Raleway', sans-serif; display: inline-flex; align-items: center; justify-content: center; gap: 8px; }
        .btn-back:hover { border-color: #192328; color: #192328; }
        .btn-next { min-width: 160px; }
        @media (max-width: 640px) { .template-grid { grid-template-columns: 1fr; } .template-card img { height: 120px; } .btn-group { flex-direction: column-reverse; } .btn-back, .btn-next { width: 100%; justify-content: center; } }
      `}</style>

      <div className="step-title"><IconPalette size={20} style={{ display: 'inline-block', marginRight: 8, verticalAlign: 'middle' }} /> Choose your store design</div>
      <p className="step-description">
        Pick a template that matches your brand. You can customize colors and change it later.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="template-grid">
          {templates.map(template => (
            <div
              key={template.id}
              className={`template-card ${selectedTemplate === template.id ? 'selected' : ''}`}
              onClick={() => handleTemplateSelect(template.id)}
            >
              <img src={template.preview} alt={template.name} />
              <div className="template-info">
                <h4>{template.name}</h4>
                <p>{template.description}</p>
                <div style={{ display: 'flex', gap: '6px', marginTop: 8 }}>
                  {template.colors.map((color, i) => (
                    <span 
                      key={i}
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: color,
                        border: '1px solid rgba(0,0,0,0.1)',
                        display: 'inline-block',
                      }}
                    />
                  ))}
                </div>
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
                  <span className="check">✓</span>
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
