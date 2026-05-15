import React from 'react';
import { Camera, FileText, Image as ImageIcon, Upload, X } from 'lucide-react';

export const FilePicker = ({
  onChange,
  onClear,
  accept = 'image/*',
  label,
  iconType = 'upload',
  previewUrl,
  isUploading = false,
  className = '',
}) => {
  const inputId = React.useId();

  const getIcon = () => {
    switch (iconType) {
      case 'camera': return <Camera size={18} />;
      case 'image':  return <ImageIcon size={18} />;
      case 'file':   return <FileText size={18} />;
      default:       return <Upload size={18} />;
    }
  };

  const stopAndClear = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClear) onClear();
  };

  return (
    <div className={`filepicker-root${className ? ' ' + className : ''}`}>
      {label && <span className="input-label">{label}</span>}

      <input
        id={inputId}
        type="file"
        accept={accept}
        onChange={onChange}
        style={{ display: 'none' }}
        disabled={isUploading}
      />

      {/* Drop zone / trigger */}
      <label
        htmlFor={isUploading ? undefined : inputId}
        className={`filepicker-zone${isUploading ? ' uploading' : ''}${previewUrl ? ' has-preview' : ''}`}
      >
        {isUploading ? (
          <div className="filepicker-spinner" />
        ) : (
          <div className="filepicker-zone-icon">{getIcon()}</div>
        )}
        <div className="filepicker-zone-text">
          <span className="filepicker-zone-title">
            {isUploading ? 'Загрузка...' : previewUrl ? 'Заменить фото' : 'Выберите файл'}
          </span>
          {!isUploading && (
            <span className="filepicker-zone-hint">
              {accept.includes('image') ? 'JPG, PNG, WEBP · до 5 МБ' : 'Все форматы'}
            </span>
          )}
        </div>
      </label>

      {/* Preview card below */}
      {previewUrl && !isUploading && (
        <div className="filepicker-preview">
          <img src={previewUrl} alt="preview" className="filepicker-preview-img" />
          {onClear && (
            <button
              type="button"
              className="filepicker-preview-remove"
              onClick={stopAndClear}
              title="Удалить фото"
            >
              <X size={12} strokeWidth={3} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
