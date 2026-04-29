import React, { useState } from 'react';
import clsx from 'clsx';
import { Eye, EyeOff } from 'lucide-react';
import './ui.css';
import { formatPhone, formatCurrency, stripCurrency } from '../../utils/formatters';

export const Input = ({ label, helperText, error, className, type = 'text', onChange, value, isCurrency, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const isPhone = type === 'tel';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : (isCurrency ? 'text' : type);

  const handleInputChange = (e) => {
    let rawValue = e.target.value;

    // Prevent negative numbers for all numeric/currency inputs
    if (type === 'number' || isCurrency) {
      if (rawValue.includes('-')) {
        rawValue = rawValue.replace(/-/g, '');
      }
    }

    if (isPhone && onChange) {
      const formatted = formatPhone(rawValue);
      onChange({
        ...e,
        target: { ...e.target, value: formatted, name: props.name }
      });
    } else if (isCurrency && onChange) {
      const formatted = formatCurrency(rawValue);
      const numericValue = stripCurrency(formatted);
      onChange({
        ...e,
        target: { ...e.target, value: numericValue, name: props.name, formattedValue: formatted }
      });
    } else if (onChange) {
      onChange(e);
    }
  };

  // If currency, show formatted value in the input field
  const displayValue = isCurrency ? formatCurrency(value) : value;

  return (
    <div className={clsx('input-group', className)}>
      {label && <label className="input-label">{label}</label>}
      <div className="input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input 
          type={inputType}
          className={clsx('input-field', error && 'input-error')} 
          style={{ paddingRight: isPassword ? '40px' : undefined, width: '100%' }}
          value={displayValue}
          onChange={handleInputChange}
          min={type === 'number' ? 0 : props.min}
          {...props} 
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="password-toggle-btn"
            style={{
              position: 'absolute',
              right: '12px',
              background: 'none',
              border: 'none',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              outline: 'none'
            }}
            aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
          >
            <div style={{ position: 'relative', width: 20, height: 20 }}>
              <Eye 
                size={20} 
                style={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
                  opacity: showPassword ? 1 : 0, 
                  transform: showPassword ? 'scale(1) rotate(0deg)' : 'scale(0.5) rotate(-45deg)' 
                }} 
              />
              <EyeOff 
                size={20} 
                style={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
                  opacity: !showPassword ? 1 : 0, 
                  transform: !showPassword ? 'scale(1) rotate(0deg)' : 'scale(0.5) rotate(45deg)' 
                }} 
              />
            </div>
          </button>
        )}
      </div>
      {error && <span className="input-error-text">{error}</span>}
      {helperText && !error && <span className="input-helper-text">{helperText}</span>}
    </div>
  );
};
