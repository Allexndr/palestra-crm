import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Plus, Trophy, GraduationCap, Users, Calendar, Info, X, CheckCircle, Edit2, Trash2 } from 'lucide-react';
import { LockedFeature } from '../../components/admin/LockedFeature';
import { useTranslation } from '../../context/LanguageContext';

export const Events = () => {
  const { events, addEvent, updateEvent, removeEvent, members, groups, canUseFeature, getUpgradeMessage } = useAdmin();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'tournament',
    date: '',
    description: '',
    participantIds: []
  });
  const [editingEventId, setEditingEventId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  if (!canUseFeature('events')) {
    return (
      <LockedFeature
        title={t('events_page.locked_title')}
        description={getUpgradeMessage('feature', t('events_page.locked_desc'))}
        onConfigure={() => navigate('/admin/settings')}
      />
    );
  }

  const getEventIcon = (type) => {
    switch (type) {
      case 'tournament': return <Trophy size={24} className="text-accent" />;
      case 'seminar': return <GraduationCap size={24} className="text-primary" />;
      default: return <Users size={24} className="text-success" />;
    }
  };

  const getEventTypeLabel = (type) => {
    switch (type) {
      case 'tournament': return t('events_page.type_tournament');
      case 'seminar': return t('events_page.type_seminar');
      case 'open_mat': return t('events_page.type_open_mat');
      default: return t('events_page.type_event');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.date) return;
    
    if (editingEventId) {
      updateEvent(editingEventId, formData);
    } else {
      addEvent(formData);
    }
    
    setFormData({ name: '', type: 'tournament', date: '', description: '', participantIds: [] });
    setIsAdding(false);
    setEditingEventId(null);
  };

  const handleSelectGroup = (groupId) => {
    const groupMemberIds = (Array.isArray(members) ? members : []).filter(m => m.groupId === groupId).map(m => m.id);
    setFormData(prev => ({
      ...prev,
      participantIds: [...new Set([...prev.participantIds, ...groupMemberIds])]
    }));
  };

  const toggleParticipant = (id) => {
    setFormData(prev => ({
      ...prev,
      participantIds: prev.participantIds.includes(id) 
        ? prev.participantIds.filter(pid => pid !== id)
        : [...prev.participantIds, id]
    }));
  };

  const handleEdit = (event) => {
    setFormData({
      name: event.name,
      type: event.type,
      date: event.date,
      description: event.description,
      participantIds: event.participantIds || []
    });
    setEditingEventId(event.id);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="animate-fade-in">
      <div className="admin-page-header admin-page-header--center">
        <div className="page-title-block page-title-block--row">
          <h1 className="h2">{t('events_page.title')}</h1>
          <p className="text-secondary text-lg">{t('events_page.subtitle')}</p>
        </div>
        <Button variant="primary" onClick={() => { setIsAdding(!isAdding); setEditingEventId(null); setFormData({ name: '', type: 'tournament', date: '', description: '', participantIds: [] }); }} style={{ gap: '8px' }}>
          <Plus size={18} /> {isAdding ? t('events_page.cancel_btn') : t('events_page.create_btn')}
        </Button>
      </div>

      {isAdding && (
        <Card className="admin-section-card animate-up" style={{ border: '1px solid var(--color-primary)' }}>
          <h4 className="h4 mb-8">{editingEventId ? t('events_page.edit_title') : t('events_page.new_title')}</h4>
          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            <div className="admin-form-grid">
              <Input 
                label={t('events_page.name_label')} 
                placeholder={t('events_page.name_placeholder')} 
                required
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} 
              />
              <div className="input-group">
                <label className="input-label">{t('events_page.type_label')}</label>
                <select className="input-field" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                  <option value="tournament">{t('events_page.type_tournament')}</option>
                  <option value="seminar">{t('events_page.type_seminar')}</option>
                  <option value="open_mat">{t('events_page.type_open_mat')}</option>
                </select>
              </div>
              <Input label={t('events_page.date_label')} type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>

            <div className="admin-two-column">
              <div className="input-group">
                <label className="input-label">{t('events_page.desc_label')}</label>
                <textarea 
                  className="input-field" rows="4" placeholder={t('events_page.desc_placeholder')}
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                  style={{ resize: 'none' }}
                ></textarea>
              </div>
              <div className="input-group">
                <label className="input-label">{t('events_page.participants_label')} ({formData.participantIds.length})</label>
                <div style={{ border: '1px solid var(--color-border)', borderRadius: '16px', padding: '16px', backgroundColor: 'var(--color-ice-100)' }}>
                  <div className="flex gap-2 mb-4">
                    <div className="p-2 bg-white rounded-lg border flex-1 flex items-center gap-2">
                       <input 
                         placeholder={t('events_page.search_student')} 
                         className="bg-transparent border-none text-xs outline-none w-full"
                         value={searchTerm}
                         onChange={e => setSearchTerm(e.target.value)}
                       />
                    </div>
                  </div>
                  <div style={{ maxHeight: '150px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <p className="text-[10px] font-bold text-muted uppercase mb-1">{t('events_page.add_group')}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {(Array.isArray(groups) ? groups : []).map(g => (
                        <button key={g.id} type="button" onClick={() => handleSelectGroup(g.id)} className="text-[10px] font-bold bg-white border px-2 py-1 rounded-lg hover:border-primary transition-all">
                          + {g.name}
                        </button>
                      ))}
                    </div>
                    {(Array.isArray(members) ? members : []).filter(m => `${m.firstName || ''} ${m.lastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase())).map(m => (
                      <div key={m.id} onClick={() => toggleParticipant(m.id)} className="flex items-center justify-between p-2 hover:bg-white rounded-lg cursor-pointer transition-all border border-transparent hover:border-slate-100">
                        <span className="text-xs font-medium">{m.firstName || t('events_page.student_default')} {m.lastName || ''}</span>
                        {formData.participantIds.includes(m.id) ? <CheckCircle size={14} className="text-primary" /> : <Plus size={14} className="text-muted" />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t" style={{ borderTop: '1px solid var(--color-border)' }}>
               <Button variant="ghost" type="button" onClick={() => { setIsAdding(false); setEditingEventId(null); }}>{t('events_page.cancel_btn')}</Button>
               <Button variant="primary" type="submit" style={{ minWidth: '200px' }}>{editingEventId ? t('events_page.save_btn') : t('events_page.publish_btn')}</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="admin-card-grid admin-card-grid--wide">
        {events.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px 0' }}>
            <Calendar size={64} className="text-muted mb-6" style={{ margin: '0 auto', opacity: 0.2 }} />
            <p className="text-secondary">{t('events_page.empty_text')}</p>
          </div>
        ) : (
          (Array.isArray(events) ? events : []).map(event => (
            <Card key={event.id} className="card-hover" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', padding: '32px', position: 'relative' }}>
              <div className="flex justify-between items-start">
                <div style={{ backgroundColor: 'var(--color-bg)', padding: '12px', borderRadius: '16px' }}>
                  {getEventIcon(event.type)}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div style={{ 
                    backgroundColor: event.status === 'open' ? 'var(--color-success-soft)' : 'var(--color-border)',
                    color: event.status === 'open' ? 'var(--color-success)' : 'var(--color-text-muted)',
                    padding: '4px 12px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase'
                  }}>
                    {event.status === 'open' ? t('events_page.status_open') : t('events_page.status_closed')}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(event)} className="p-1.5 text-muted hover:text-primary transition-colors bg-slate-50 rounded-lg border-none cursor-pointer"><Edit2 size={16} /></button>
                    <button onClick={() => removeEvent(event.id)} className="p-1.5 text-muted hover:text-danger transition-colors bg-slate-50 rounded-lg border-none cursor-pointer"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="h4 mb-2">{event.name}</h3>
                <p className="text-xs text-muted font-bold uppercase tracking-wider mb-4">
                  {getEventTypeLabel(event.type)} • {new Date(event.date).toLocaleDateString()}
                </p>
                <p className="text-sm text-secondary leading-relaxed mb-6">
                  {event.description}
                </p>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid rgba(0,0,0,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                      <div key={i} style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid white', backgroundColor: 'var(--color-primary-soft)' }}></div>
                    ))}
                  </div>
                  <span className="text-[11px] font-bold text-muted">{(event.participantIds?.length || 0)}+ {t('events_page.participants_count')}</span>
                </div>
                <Button variant="ghost" size="sm" style={{ padding: '4px 12px', fontSize: '12px' }}>{t('events_page.more_btn')}</Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
