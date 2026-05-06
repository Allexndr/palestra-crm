import React from 'react';
import { Upload, Camera, FileText, Image as ImageIcon } from 'lucide-react';

export const FilePicker = ({ 
  onChange, 
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
      case 'camera': return <Camera size={20} />;
      case 'image': return <ImageIcon size={20} />;
      case 'file': return <FileText size={20} />;
      default: return <Upload size={20} />;
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>}
      
      <div className="relative group">
        <input
          id={inputId}
          type="file"
          accept={accept}
          onChange={onChange}
          className="hidden"
          disabled={isUploading}
        />
        
        <label
          htmlFor={inputId}
          className={`
            flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer
            ${isUploading ? 'bg-slate-50 border-slate-200 cursor-wait' : 'bg-white border-slate-100 hover:border-primary hover:bg-primary-soft/30'}
          `}
        >
          <div className={`
            w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors
            ${isUploading ? 'bg-slate-100 text-slate-400' : 'bg-primary-soft text-primary group-hover:bg-primary group-hover:text-white'}
          `}>
            {isUploading ? (
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            ) : getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate">
              {isUploading ? 'Загрузка...' : (previewUrl ? 'Изменить файл' : 'Выберите файл')}
            </p>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              {accept.includes('image') ? 'JPG, PNG до 5MB' : 'Все форматы'}
            </p>
          </div>
          
          {previewUrl && !isUploading && (
            <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-100 shadow-sm">
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </label>
      </div>
    </div>
  );
};
