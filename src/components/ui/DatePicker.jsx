import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';

const MONTHS_RU = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
const MONTHS_KZ = ['Қаңтар','Ақпан','Наурыз','Сәуір','Мамыр','Маусым','Шілде','Тамыз','Қыркүйек','Қазан','Қараша','Желтоқсан'];
const DAYS_RU = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
const DAYS_KZ = ['Дс','Сс','Ср','Бс','Жм','Сб','Жк'];

function parseDate(value) {
  if (!value) return null;
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDisplay(value) {
  if (!value) return '';
  const [y, m, d] = value.split('-');
  return `${d}.${m}.${y}`;
}

function toValue(date) {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function DatePicker({ label, value, onChange, min, max, language = 'ru', disabled }) {
  const MONTHS = language === 'kk' ? MONTHS_KZ : MONTHS_RU;
  const DAYS = language === 'kk' ? DAYS_KZ : DAYS_RU;

  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() => {
    const d = parseDate(value);
    return d ? d.getFullYear() : new Date().getFullYear();
  });
  const [viewMonth, setViewMonth] = useState(() => {
    const d = parseDate(value);
    return d ? d.getMonth() : new Date().getMonth();
  });
  const [mode, setMode] = useState('days'); // 'days' | 'months' | 'years'
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (open) {
      const d = parseDate(value);
      if (d) { setViewYear(d.getFullYear()); setViewMonth(d.getMonth()); }
      setMode('days');
    }
  }, [open]);

  const selected = parseDate(value);
  const today = new Date(); today.setHours(0,0,0,0);

  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfWeek = (y, m) => { const d = new Date(y, m, 1).getDay(); return d === 0 ? 6 : d - 1; };

  const handleDay = (day) => {
    const d = new Date(viewYear, viewMonth, day);
    const v = toValue(d);
    if (min && v < min) return;
    if (max && v > max) return;
    onChange({ target: { value: v } });
    setOpen(false);
  };

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };

  const days = getDaysInMonth(viewYear, viewMonth);
  const firstDow = getFirstDayOfWeek(viewYear, viewMonth);
  const prevDays = getDaysInMonth(viewYear, viewMonth === 0 ? 11 : viewMonth - 1);

  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push({ day: prevDays - firstDow + 1 + i, type: 'prev' });
  for (let i = 1; i <= days; i++) cells.push({ day: i, type: 'cur' });
  const remaining = 42 - cells.length;
  for (let i = 1; i <= remaining; i++) cells.push({ day: i, type: 'next' });

  const yearRange = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - 99 + i).reverse();

  return (
    <div className="input-group" ref={ref} style={{ position: 'relative' }}>
      {label && <label className="input-label">{label}</label>}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(o => !o)}
        className="datepicker-trigger"
      >
        <span className={value ? 'datepicker-value' : 'datepicker-placeholder'}>
          {value ? formatDisplay(value) : 'дд.мм.гггг'}
        </span>
        {value ? (
          <X size={16} className="datepicker-clear" onClick={e => { e.stopPropagation(); onChange({ target: { value: '' } }); }} />
        ) : (
          <Calendar size={16} className="datepicker-icon" />
        )}
      </button>

      {open && (
        <div className="datepicker-popup">
          {/* Header */}
          <div className="datepicker-header">
            <button type="button" className="datepicker-nav" onClick={prevMonth}><ChevronLeft size={16} /></button>
            <div className="datepicker-header-center">
              <button type="button" className="datepicker-month-btn" onClick={() => setMode(m => m === 'months' ? 'days' : 'months')}>
                {MONTHS[viewMonth]}
              </button>
              <button type="button" className="datepicker-year-btn" onClick={() => setMode(m => m === 'years' ? 'days' : 'years')}>
                {viewYear}
              </button>
            </div>
            <button type="button" className="datepicker-nav" onClick={nextMonth}><ChevronRight size={16} /></button>
          </div>

          {mode === 'days' && (
            <>
              {/* Day names */}
              <div className="datepicker-daynames">
                {DAYS.map(d => <span key={d}>{d}</span>)}
              </div>
              {/* Cells */}
              <div className="datepicker-grid">
                {cells.map((cell, i) => {
                  const cellDate = cell.type === 'cur'
                    ? new Date(viewYear, viewMonth, cell.day)
                    : cell.type === 'prev'
                      ? new Date(viewYear, viewMonth - 1, cell.day)
                      : new Date(viewYear, viewMonth + 1, cell.day);
                  const v = toValue(cellDate);
                  const isSelected = value === v;
                  const isToday = cellDate.getTime() === today.getTime();
                  const isDisabled = (min && v < min) || (max && v > max);
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => cell.type === 'cur' && handleDay(cell.day)}
                      className={[
                        'datepicker-cell',
                        cell.type !== 'cur' ? 'other-month' : '',
                        isSelected ? 'selected' : '',
                        isToday && !isSelected ? 'today' : '',
                        isDisabled ? 'disabled' : '',
                      ].filter(Boolean).join(' ')}
                    >
                      {cell.day}
                    </button>
                  );
                })}
              </div>
              {/* Footer */}
              <div className="datepicker-footer">
                <button type="button" className="datepicker-footer-btn" onClick={() => onChange({ target: { value: '' } })}>Очистить</button>
                <button type="button" className="datepicker-footer-btn primary" onClick={() => { onChange({ target: { value: toValue(today) } }); setOpen(false); }}>Сегодня</button>
              </div>
            </>
          )}

          {mode === 'months' && (
            <div className="datepicker-months">
              {MONTHS.map((m, i) => (
                <button key={i} type="button"
                  className={`datepicker-month-cell${viewMonth === i ? ' active' : ''}`}
                  onClick={() => { setViewMonth(i); setMode('days'); }}>
                  {m}
                </button>
              ))}
            </div>
          )}

          {mode === 'years' && (
            <div className="datepicker-years">
              {yearRange.map(y => (
                <button key={y} type="button"
                  className={`datepicker-year-cell${viewYear === y ? ' active' : ''}`}
                  onClick={() => { setViewYear(y); setMode('days'); }}>
                  {y}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
