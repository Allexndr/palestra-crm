import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ArrowLeft, Save } from 'lucide-react';

export const GroupForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { groups, addGroup, updateGroup, locations, sports, coaches } = useAdmin();

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
          <button onClick={() => navigate('/admin/groups')} className="p-2 bg-white rounded-full border shadow-sm hover:bg-slate-50 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="page-title-block page-title-block--row">
            <h1 className="h2">
              {isEditing ? 'Редактировать группу' : 'Новая группа'}
            </h1>
            <p className="text-secondary">Управление тренировочной группой</p>
          </div>
        </div>
      </div>

      <Card style={{ padding: 'var(--space-8)' }}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div className="admin-form-grid">
            <Input label="Название группы" placeholder="ММА Старшая" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            
            <div className="input-group">
              <label className="input-label">Дисциплина</label>
              <select className="input-field" value={formData.sport} onChange={e => setFormData({...formData, sport: e.target.value})}>
                {sports.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            
            <div className="input-group">
              <label className="input-label">Филиал</label>
              <select className="input-field" value={formData.locationId} onChange={e => setFormData({...formData, locationId: e.target.value})}>
                {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Тренер</label>
              <select className="input-field" value={formData.coachId || ''} onChange={e => setFormData({...formData, coachId: e.target.value})}>
                <option value="">Не назначен</option>
                {coaches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <Input label="Вместимость (чел)" type="number" min="1" value={formData.maxCapacity} onChange={e => setFormData({...formData, maxCapacity: e.target.value})} />
          </div>
          
          <div className="flex justify-end gap-4 border-t pt-6" style={{ borderColor: 'var(--color-border)' }}>
            <Button variant="ghost" type="button" onClick={() => navigate('/admin/groups')}>Отмена</Button>
            <Button variant="primary" type="submit" className="gap-2">
              <Save size={18} /> {isEditing ? 'Сохранить изменения' : 'Создать группу'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
