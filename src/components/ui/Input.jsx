import React from 'react';
import clsx from 'clsx';
import './ui.css';

export const Input = ({ label, helperText, error, className, ...props }) => {
  return (
    <div className={clsx('input-group', className)}>
      {label && <label className="input-label">{label}</label>}
      <input 
        className={clsx('input-field', error && 'input-error')} 
        {...props} 
      />
      {error && <span className="input-error-text">{error}</span>}
      {helperText && !error && <span className="input-helper-text">{helperText}</span>}
    </div>
  );
};
