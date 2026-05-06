import React from 'react';
import { Upload, Camera, FileText, Image as ImageIcon, X } from 'lucide-react';

export const FilePicker = ({ 
  onChange, 
  onClear,
  accept = "image/*", 
  label, 
  iconType = "upload", 
  previewUrl, 
  isUploading = false,
  className = "" 
}) => {
  const inputId = React.useId();

  const getIcon = () => {
    switch (iconType) {
      case 'camera': return <Camera size={16} />;
      case 'image': return <ImageIcon size={16} />;
      case 'file': return <FileText size={16} />;
      default: return <Upload size={16} />;
    }
  };

  const handleClear = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClear) onClear();
  };

  return (
    <div className={className}>
      {label && (
        <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
          {label}
        </label>
      )}

      <input
        id={inputId}
        type="file"
        accept={accept}
        onChange={onChange}
        style={{ display: 'none' }}
        disabled={isUploading}
      />

      {/* Photo Preview — compact inline */}
      {previewUrl && !isUploading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{ width: 56, height: 56, borderRadius: 12, border: '1px solid #e2e8f0', background: '#f8fafc', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <label
              htmlFor={inputId}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: 11, fontWeight: 700, color: '#374151' }}
            >
              <Camera size={13} /> Изменить
            </label>
            {onClear && (
              <button
                onClick={handleClear}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 8, border: '1px solid #fecaca', background: '#fff5f5', cursor: 'pointer', fontSize: 11, fontWeight: 700, color: '#dc2626' }}
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '8px 12px', borderRadius: '10px',
            border: '1px dashed #cbd5e1', background: '#fff',
            cursor: isUploading ? 'wait' : 'pointer',
            maxWidth: '280px',
          }}
        >
          <div style={{
            width: '28px', height: '28px', borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#eef2ff', color: '#4f46e5', flexShrink: 0,
          }}>
            {isUploading ? (
              <div style={{ width: '14px', height: '14px', border: '2px solid #4f46e5', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            ) : getIcon()}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#1e293b', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {isUploading ? 'Загрузка...' : 'Выберите файл'}
            </p>
            <p style={{ fontSize: '9px', fontWeight: 600, color: '#94a3b8', margin: 0, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              {accept.includes('image') ? 'JPG, PNG до 5MB' : 'Все форматы'}
            </p>
          </div>
        </label>
      )}
    </div>
  );
};
