import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { useTranslation } from '../../context/LanguageContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ArrowLeft, Save } from 'lucide-react';

export const GroupForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { groups, addGroup, updateGroup, locations, sports, coaches, selectedLocationId } = useAdmin();
  const { t } = useTranslation();

  const isEditing = !!id;
  const existingGroup = isEditing ? groups.find(g => g.id === id) : null;

  const [formData, setFormData] = useState({
    name: '', 
    sport: sports[0] || '', 
    locationId: locations[0]?.id || (selectedLocationId !== 'all' ? selectedLocationId : '1'),
    coachId: coaches[0]?.id || '',
    maxCapacity: '20'
  });

  useEffect(() => {
    if (isEditing && existingGroup) {
      setFormData(existingGroup);
    }
  }, [isEditing, existingGroup]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      updateGroup(id, formData);
    } else {
      const created = addGroup(formData);
      if (created === false) return;
    }
    navigate('/admin/groups');
  };

  return (
    <div className="animate-fade-in pb-12">
      <div className="admin-page-header admin-page-header--center">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/groups')} className="p-2 bg-white rounded-full border shadow-sm hover:bg-slate-50 transition-colors cursor-pointer">
            <ArrowLeft size={20} />
          </button>
          <div className="page-title-block page-title-block--row">
            <h1 className="h2">
              {isEditing ? t('groups.form.edit_title') : t('groups.form.new_title')}
            </h1>
            <p className="text-secondary">{t('groups.form.subtitle')}</p>
          </div>
        </div>
      </div>

      <Card style={{ padding: 'var(--space-8)' }}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div className="admin-form-grid">
            <Input label={t('groups.name_label')} placeholder={t('groups.name_placeholder')} required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            
            <div className="input-group">
              <label className="input-label">{t('groups.sport_label')}</label>
              <select className="input-field" value={formData.sport} onChange={e => setFormData({...formData, sport: e.target.value})}>
                {sports.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            
            <div className="input-group">
              <label className="input-label">{t('groups.location_label')}</label>
              <select className="input-field" value={formData.locationId} onChange={e => setFormData({...formData, locationId: e.target.value})}>
                {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">{t('groups.coach_label')}</label>
              <select className="input-field" value={formData.coachId || ''} onChange={e => setFormData({...formData, coachId: e.target.value})}>
                <option value="">{t('groups.form.no_coach')}</option>
                {coaches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <Input label={t('groups.capacity_label')} type="number" min="1" value={formData.maxCapacity} onChange={e => setFormData({...formData, maxCapacity: e.target.value})} />
          </div>
          
          <div className="flex justify-end gap-4 border-t pt-6" style={{ borderColor: 'var(--color-border)' }}>
            <Button variant="ghost" type="button" onClick={() => navigate('/admin/groups')}>{t('common.cancel')}</Button>
            <Button variant="primary" type="submit" className="gap-2">
              <Save size={18} /> {isEditing ? t('common.save') : t('common.create')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
