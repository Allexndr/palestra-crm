import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Plus, Users, Search, Trash2, Edit2, Camera, Phone, Mail, Award, MapPin } from 'lucide-react';
import { uploadBlobFile } from '../../lib/blobClient';

export const Coaches = () => {
  const { coaches, addCoach, removeCoach, updateCoach, locations, sports } = useAdmin();
  const [isAdding, setIsAdding] = useState(false);
  const [editingCoachId, setEditingCoachId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const initialFormState = {
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    specialization: sports[0] || 'Бокс',
    experience: '',
    locationId: locations[0]?.id || '',
    bio: '',
    avatar: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName) return;

    if (editingCoachId) {
      updateCoach(editingCoachId, formData);
    } else {
      const created = addCoach(formData);
      if (created === false) return;
    }

    setFormData(initialFormState);
    setIsAdding(false);
    setEditingCoachId(null);
  };

  const handleEdit = (coach) => {
    setFormData(coach);
    setEditingCoachId(coach.id);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      const url = await uploadBlobFile(file, 'coach-avatars');
      setFormData((prev) => ({ ...prev, avatar: url }));
    } catch (error) {
      alert(error.message || 'Не удалось загрузить фото тренера');
    } finally {
      setIsUploadingAvatar(false);
      event.target.value = '';
    }
  };

  const filteredCoaches = coaches.filter(c => 
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="admin-page-header admin-page-header--center">
        <div className="page-title-block page-title-block--row">
          <h1 className="h2">Команда тренеров</h1>
          <p className="text-secondary text-lg">Управление тренерским составом и их специализациями</p>
        </div>
        <Button variant="primary" onClick={() => {
          if (isAdding) {
            setIsAdding(false);
            setEditingCoachId(null);
            setFormData(initialFormState);
          } else {
            setIsAdding(true);
          }
        }} style={{ gap: '8px' }}>
          <Plus size={18} /> {isAdding ? 'Отмена' : 'Добавить тренера'}
        </Button>
      </div>

      {isAdding && (
        <Card className="admin-section-card animate-up" style={{ border: '1px solid var(--color-primary)' }}>
          <h3 className="h4 mb-8">{editingCoachId ? 'Редактировать профиль тренера' : 'Новый тренер'}</h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-10">
            {/* Basic Info */}
            <div className="admin-form-grid">
              <Input label="Имя" required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
              <Input label="Фамилия" required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
              <Input label="Телефон" placeholder="+7 (707) 000-00-00" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              <Input label="Email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>

            {/* Professional Info */}
            <div className="admin-form-grid">
              <div className="input-group">
                <label className="input-label">Специализация</label>
                <select className="input-field" value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})}>
                  {sports.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <Input label="Стаж (лет)" type="number" value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} />
              <div className="input-group">
                <label className="input-label">Филиал</label>
                <select className="input-field" value={formData.locationId} onChange={e => setFormData({...formData, locationId: e.target.value})}>
                  <option value="">Все филиалы</option>
                  {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">О себе / Регалии</label>
              <textarea 
                className="input-field" rows="3" 
                value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})}
                placeholder="Мастер спорта, черный пояс..."
                style={{ resize: 'none' }}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Фото тренера</label>
              <input className="input-field" type="file" accept="image/*" onChange={handleAvatarUpload} />
              {isUploadingAvatar && <p className="text-xs text-muted mt-2">Загрузка в Blob...</p>}
              {formData.avatar && <p className="text-xs text-primary mt-2">Фото загружено</p>}
            </div>

            <div className="flex justify-end gap-4 border-t pt-8">
              <Button variant="ghost" type="button" onClick={() => { setIsAdding(false); setEditingCoachId(null); }}>Отмена</Button>
              <Button variant="primary" type="submit" style={{ minWidth: '180px' }}>
                {editingCoachId ? 'Сохранить изменения' : 'Создать профиль'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div className="mb-8 relative">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input 
            type="text" 
            placeholder="Поиск по имени или специализации..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '16px 16px 16px 48px', 
              borderRadius: '16px', 
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-ice-100)'
            }}
          />
        </div>

        <div className="admin-card-grid">
          {filteredCoaches.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }} className="text-muted">
              Список тренеров пуст.
            </div>
          ) : filteredCoaches.map(coach => (
            <Card key={coach.id} className="card-hover" style={{ padding: '24px', position: 'relative' }}>
              <div className="flex items-center gap-4 mb-6">
                <div style={{ 
                  width: 64, height: 64, borderRadius: '20px', 
                  backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '24px', fontWeight: 'bold'
                }}>
                  {coach.avatar ? (
                    <img src={coach.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 20 }} />
                  ) : (
                    coach.firstName[0]
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-lg">{coach.firstName} {coach.lastName}</h4>
                  <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-primary)', backgroundColor: 'var(--color-primary-soft)', padding: '2px 8px', borderRadius: '4px' }}>
                    {coach.specialization}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-secondary">
                  <Award size={14} className="text-muted" /> <span>Опыт: {coach.experience} лет</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-secondary">
                  <MapPin size={14} className="text-muted" /> <span>{locations.find(l => l.id === coach.locationId)?.name || 'Все филиалы'}</span>
                </div>
                {coach.phone && (
                  <div className="flex items-center gap-2 text-sm text-secondary">
                    <Phone size={14} className="text-muted" /> <span>{coach.phone}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 border-t pt-4">
                <button onClick={() => handleEdit(coach)} className="p-2 text-slate-400 hover:text-primary transition-colors bg-transparent border-none cursor-pointer"><Edit2 size={18} /></button>
                <button onClick={() => removeCoach(coach.id)} className="p-2 text-slate-400 hover:text-danger transition-colors bg-transparent border-none cursor-pointer"><Trash2 size={18} /></button>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
};
