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

      {/* Photo Preview Card */}
      {previewUrl && !isUploading ? (
        <div className="relative inline-block">
          <div 
            className="relative rounded-xl overflow-hidden border border-slate-200 bg-white cursor-pointer hover:border-primary transition-colors"
            style={{ width: '200px', height: '200px' }}
            onClick={() => document.getElementById(inputId)?.click()}
          >
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
              <span className="text-white text-sm font-medium">Изменить</span>
            </div>
          </div>
          
          {/* Delete button - top right corner */}
          <button
            onClick={handleClear}
            className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors z-10"
            title="Удалить"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
          
          <p className="text-xs text-slate-500 mt-2 text-center">Нажмите на фото, чтобы изменить</p>
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
