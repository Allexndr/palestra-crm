import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from './Input';

const MARTIAL_ARTS = [
  {
    id: 'mma',
    name: 'MMA',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a8 8 0 0 0-8 8c0 5.4 3.6 10 8 12 4.4-2 8-6.6 8-12a8 8 0 0 0-8-8z"/>
        <path d="M12 8v4l3 3"/>
      </svg>
    ) // Represented with a shield-like octagon
  },
  {
    id: 'boxing',
    name: 'Бокс',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 10c0-2.21 1.79-4 4-4h4c2.21 0 4 1.79 4 4v5c0 3.87-3.13 7-7 7h-1c-2.21 0-4-1.79-4-4v-8z"/>
        <path d="M6 15c-2.21 0-4-1.79-4-4V8c0-1.1.9-2 2-2h2"/>
        <path d="M10 6V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2"/>
      </svg>
    ) // Glove
  },
  {
    id: 'bjj',
    name: 'BJJ',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
        <path d="M15 2H9c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1z"/>
        <path d="M12 12v6"/>
        <path d="M8 15h8"/>
      </svg>
    ) // Clipboard / Certificate (belt rank representation)
  },
  {
    id: 'muaythai',
    name: 'Муай Тай',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
        <path d="M12 8L8 12h8l-4 4"/>
      </svg>
    )
  },
  {
    id: 'wrestling',
    name: 'Борьба',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="5" r="3"/>
        <line x1="12" y1="22" x2="12" y2="8"/>
        <path d="M5 11l7-3 7 3"/>
      </svg>
    )
  },
  {
    id: 'karate',
    name: 'Каратэ',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z"/>
        <path d="M20.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z"/>
        <path d="M9.5 14c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5z"/>
        <path d="M3.5 14c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5z"/>
        <path d="M14 14l-4-4"/>
        <path d="M10 14l4-4"/>
      </svg>
    )
  }
];

export const MartialArtsSelector = ({ selected = [], onChange }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const toggleSelection = (id) => {
    if (selected.includes(id)) {
      onChange(selected.filter(item => item !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const filteredArts = MARTIAL_ARTS.filter(art => 
    art.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div style={{ position: 'relative', marginBottom: 'var(--space-4)' }}>
        <input
          type="text"
          placeholder="Поиск направления (например: Бокс)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ 
            width: '100%', 
            padding: 'var(--space-2) var(--space-3) var(--space-2) 36px', 
            borderRadius: 'var(--radius-md)', 
            border: '1px solid var(--color-border)',
            fontSize: '0.9rem'
          }}
        />
        <Search size={16} className="text-muted" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', maxHeight: '250px', overflowY: 'auto', paddingRight: '4px' }}>
        {filteredArts.length > 0 ? filteredArts.map(art => {
          const isSelected = selected.includes(art.id);
          return (
            <button
              key={art.id}
              type="button"
              onClick={() => toggleSelection(art.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-sm)',
                border: isSelected ? '2px solid var(--color-primary)' : '2px solid var(--color-border)',
                backgroundColor: isSelected ? 'var(--color-primary-soft)' : 'var(--color-bg)',
                color: isSelected ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left'
              }}
            >
              <div style={{ 
                width: 32, height: 32, 
                borderRadius: '50%', 
                backgroundColor: isSelected ? 'var(--color-primary)' : 'var(--color-bg-secondary)',
                color: isSelected ? 'white' : 'var(--color-text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
              }}>
                {art.icon}
              </div>
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{art.name}</span>
            </button>
          );
        }) : (
          <div className="col-span-2 text-center text-muted text-sm py-4">
            Направление не найдено
          </div>
        )}
      </div>
    </div>
  );
};
