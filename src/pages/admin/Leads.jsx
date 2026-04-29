import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAdmin } from '../../context/AdminContext';
import { Plus, Trash2, ArrowRight, CheckCircle2, Phone, MessageSquare } from 'lucide-react';

const COLUMNS = [
  { id: 'new', title: 'Новые', color: 'var(--color-primary)', bg: 'var(--color-primary-soft)' },
  { id: 'trial', title: 'Пробная', color: 'var(--color-warning)', bg: '#fef3c7' },
  { id: 'contract', title: 'Договор', color: 'var(--color-accent)', bg: '#ffedd5' },
  { id: 'won', title: 'Ученик', color: 'var(--color-success)', bg: '#dcfce7' }
];

export const Leads = () => {
  const { leads, addLead, updateLeadStatus, removeLead, convertLeadToMember, selectedLocationId, locations, sports } = useAdmin();
  const [isAdding, setIsAdding] = useState(false);
  
  // Filter leads by location
  const filteredLeads = selectedLocationId === 'all' ? leads : leads.filter(l => l.locationId === selectedLocationId);

  const [newLead, setNewLead] = useState({ 
    name: '', 
    phone: '', 
    sport: sports[0] || 'Бокс',
    locationId: (selectedLocationId && selectedLocationId !== 'all') ? selectedLocationId : ((locations && locations.length > 0) ? locations[0].id : '1')
  });

  // Phone formatting is handled by Input type="tel"
  const handleInputChange = (field, value) => {
    setNewLead(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newLead.name || !newLead.phone) return;
    addLead(newLead);
    setNewLead({ 
      name: '', 
      phone: '', 
      sport: sports[0] || 'Бокс',
      locationId: selectedLocationId === 'all' ? (locations[0]?.id || '1') : selectedLocationId
    });
    setIsAdding(false);
  };

  const handleMove = (lead, currentColId) => {
    const nextIdx = COLUMNS.findIndex(c => c.id === currentColId) + 1;
    if (nextIdx < COLUMNS.length) {
      const nextColId = COLUMNS[nextIdx].id;
      if (nextColId === 'won') {
        if (window.confirm(`Превратить лида "${lead.name}" в ученика?`)) {
          convertLeadToMember(lead.id);
        }
      } else {
        updateLeadStatus(lead.id, nextColId);
      }
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="admin-page-header admin-page-header--center">
        <div className="page-title-block page-title-block--row">
          <h1 className="h2">Воронка лидов</h1>
          <p className="text-secondary text-lg">Управление новыми заявками и конверсией в учеников</p>
        </div>
        <Button variant="primary" onClick={() => setIsAdding(!isAdding)} style={{ gap: '8px' }}>
          {isAdding ? 'Отмена' : <><Plus size={18} /> Новая заявка</>}
        </Button>
      </div>

      {isAdding && (
        <Card className="admin-section-card animate-up" style={{ border: '1px solid var(--color-primary)' }}>
          <h4 className="h4 mb-8">Новый лид</h4>
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-6 items-end">
            <div style={{ flex: 2, width: '100%' }}>
              <Input label="Имя клиента" placeholder="Иван Иванов" required value={newLead.name} onChange={e => handleInputChange('name', e.target.value)} />
            </div>
            <div style={{ flex: 1, width: '100%' }}>
              <Input label="Телефон" type="tel" placeholder="7 777 000 00 00" required value={newLead.phone} onChange={e => handleInputChange('phone', e.target.value)} />
            </div>
            <div style={{ flex: 1, width: '100%' }} className="input-group">
              <label className="input-label">Спорт</label>
              <select className="input-field" value={newLead.sport} onChange={e => setNewLead({...newLead, sport: e.target.value})}>
                {sports.map(sport => (
                  <option key={sport} value={sport}>{sport}</option>
                ))}
              </select>
            </div>
            <Button variant="primary" type="submit" style={{ height: '48px', minWidth: '140px' }}>Создать лид</Button>
          </form>
        </Card>
      )}

      <div className="kanban-scroll-container">
        <div className="kanban-grid">
          {COLUMNS.map(col => (
            <div key={col.id} className="kanban-column">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px', marginBottom: '16px' }}>
                <h3 className="text-xs font-bold uppercase tracking-[0.15em] flex items-center gap-3" style={{ color: col.color }}>
                  <div style={{ width: 10, height: 10, borderRadius: '3px', backgroundColor: col.color }} />
                  {col.title}
                  <span style={{ backgroundColor: col.bg, color: col.color, padding: '2px 8px', borderRadius: '6px', fontSize: '10px', marginLeft: 4 }}>
                    {filteredLeads.filter(l => l.status === col.id).length}
                  </span>
                </h3>
              </div>

              <div className="kanban-cards">
                {filteredLeads.filter(l => l.status === col.id).map(lead => (
                  <Card key={lead.id} style={{ padding: '20px', cursor: 'grab', position: 'relative', overflow: 'hidden' }} className="hover:shadow-lg card-hover">
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: col.color }} />
                    <div className="flex justify-between items-start mb-4">
                      <p className="font-bold text-sm text-slate-800">{lead.name}</p>
                      <button onClick={() => removeLead(lead.id)} className="text-slate-300 hover:text-danger transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 mb-6">
                      <span style={{ padding: '2px 8px', backgroundColor: '#F1F5F9', color: '#64748B', borderRadius: '6px', fontWeight: 'bold', fontSize: '10px', textTransform: 'uppercase' }}>{lead.sport}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{new Date(lead.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <button className="p-2 bg-slate-50 text-slate-500 rounded-lg hover:bg-slate-100 transition-colors"><Phone size={14} /></button>
                        <button className="p-2 bg-slate-50 text-slate-500 rounded-lg hover:bg-slate-100 transition-colors"><MessageSquare size={14} /></button>
                      </div>
                      
                      {col.id !== 'won' ? (
                        <button onClick={() => handleMove(lead, col.id)} className="flex items-center gap-1.5 text-xs font-bold text-primary hover:gap-2 transition-all">
                          {col.id === 'contract' ? 'В ученики' : 'Далее'} <ArrowRight size={14} />
                        </button>
                      ) : (
                        <div className="text-success flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider">
                          <CheckCircle2 size={14} /> Сделка закрыта
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
                
                {filteredLeads.filter(l => l.status === col.id).length === 0 && (
                  <div style={{ border: '2px dashed #E2E8F0', borderRadius: '24px', padding: '40px 20px', textAlign: 'center', opacity: 0.5 }}>
                    <p className="text-[10px] text-muted font-bold uppercase tracking-widest">Нет карточек</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .kanban-scroll-container { overflow-x: auto; margin: 0 -24px; padding: 0 24px 40px; }
        .kanban-grid { display: grid; grid-template-columns: repeat(4, 300px); gap: 24px; align-items: start; }
        @media (min-width: 1280px) { .kanban-grid { grid-template-columns: repeat(4, 1fr); } }
        .kanban-column { display: flex; flex-direction: column; }
        .kanban-cards { background-color: rgba(248, 250, 252, 0.5); border-radius: 28px; padding: 12px; min-height: 600px; display: flex; flex-direction: column; gap: 16px; border: 1px solid rgba(0,0,0,0.02); }
      `}</style>
    </div>
  );
};
