import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { Search } from 'lucide-react';
import './ui.css';

export const Autocomplete = ({ 
  label, 
  options, 
  value, 
  onChange, 
  placeholder, 
  error,
  className 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value || '');
  const wrapperRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update local search term if value changes externally
  useEffect(() => {
    setSearchTerm(value || '');
  }, [value]);

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (option) => {
    setSearchTerm(option);
    onChange(option);
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    setIsOpen(true);
    // If they clear the input, clear the actual value too
    if (val === '') {
      onChange('');
    }
  };

  return (
    <div className={clsx('input-group', className)} ref={wrapperRef} style={{ zIndex: isOpen ? 110 : 'auto', position: 'relative' }}>
      {label && <label className="input-label">{label}</label>}
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          className={clsx('input-field', error && 'input-error')}
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          style={{ paddingRight: 'var(--space-8)' }}
        />
        <Search 
          size={16} 
          className="text-muted" 
          style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}
        />
        
        {isOpen && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            backgroundColor: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-md)',
            maxHeight: '200px',
            overflowY: 'auto',
            zIndex: 100
          }}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelect(opt)}
                  style={{
                    padding: 'var(--space-2) var(--space-3)',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    borderBottom: idx === filteredOptions.length - 1 ? 'none' : '1px solid var(--color-border-subtle)'
                  }}
                  className="hover:bg-slate-50 transition-colors"
                >
                  {opt}
                </div>
              ))
            ) : (
              <div style={{ padding: 'var(--space-3)', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                Ничего не найдено
              </div>
            )}
          </div>
        )}
      </div>
      {error && <span className="input-error-text">{error}</span>}
    </div>
  );
};
