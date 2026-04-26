import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Trophy, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export const EventCarousel = ({ isAdmin = false }) => {
  const { events } = useAdmin();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (events.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % events.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [events.length]);

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % events.length);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + events.length) % events.length);
  };

  if (events.length === 0) {
    return (
      <Card
        className="card-hover"
        style={{
          minWidth: 0,
          backgroundColor: 'var(--color-primary)',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '200px',
          textAlign: 'center',
        }}
      >
        <div className="mb-4 p-3 bg-white/20 rounded-full">
          <Trophy size={32} />
        </div>
        <p className="font-bold mb-2">Нет ближайших событий</p>
        <p className="text-xs opacity-70 mb-6">Следите за обновлениями в клубе</p>
        {isAdmin && (
          <button 
            onClick={() => navigate('/admin/events')}
            style={{ padding: '10px 20px', backgroundColor: 'white', color: 'var(--color-primary)', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={16} /> Создать событие
          </button>
        )}
      </Card>
    );
  }

  const currentEvent = events[currentIndex];

  const name = (currentEvent.name && String(currentEvent.name).trim()) || 'Событие клуба';
  const desc = (currentEvent.description && String(currentEvent.description).trim()) || 'Подробности в разделе «События».';

  return (
    <Card
      className="card-hover"
      style={{
        minWidth: 0,
        backgroundColor: 'var(--color-primary)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '200px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-white/20 rounded-lg"><Trophy size={20}/></div>
          {isAdmin && (
            <button
              type="button"
              onClick={() => navigate('/admin/events')}
              style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', borderRadius: '8px', padding: '4px', cursor: 'pointer' }}
              className="hover:opacity-90 transition-opacity"
            >
              <Plus size={16} />
            </button>
          )}
        </div>
        <span className="text-[10px] font-bold uppercase bg-white/20 px-2 py-1 rounded">Событие</span>
      </div>

      {/* Content with Animation */}
      <div key={currentEvent.id} className="animate-fade-in" style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
        <h4 className="h4 mb-2" style={{ wordBreak: 'break-word' }}>{name}</h4>
        <p className="text-sm mb-4 opacity-90 leading-relaxed" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{desc}</p>
      </div>

      {/* Footer / Controls */}
      <div className="flex justify-between items-center mt-auto">
        <div className="flex gap-1">
          {events.map((_, idx) => (
            <div 
              key={idx} 
              style={{ 
                width: idx === currentIndex ? '16px' : '4px', 
                height: '4px', 
                backgroundColor: 'white', 
                borderRadius: '2px',
                opacity: idx === currentIndex ? 1 : 0.4,
                transition: 'all 0.3s'
              }} 
            />
          ))}
        </div>
        <button 
          onClick={() => navigate('/admin/events')}
          style={{ padding: '8px 16px', backgroundColor: 'white', color: 'var(--color-primary)', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}>
            Подробнее
        </button>
      </div>

      {/* Arrows (Hidden on mobile usually, but showing for now) */}
      {events.length > 1 && (
        <>
          <button 
            onClick={handlePrev}
            style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'transparent', color: 'white', border: 'none', opacity: 0.4, cursor: 'pointer' }}
            className="hover:opacity-100 transition-opacity"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={handleNext}
            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'transparent', color: 'white', border: 'none', opacity: 0.4, cursor: 'pointer' }}
            className="hover:opacity-100 transition-opacity"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}
    </Card>
  );
};
