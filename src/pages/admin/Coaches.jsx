import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useTranslation } from '../../context/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { FilePicker } from '../../components/ui/FilePicker';
import { Plus, Users, Trash2, Edit2, Camera, Phone, Mail, Award, MapPin, Copy } from 'lucide-react';
import { uploadBlobFile, fixBlobUrl } from '../../lib/blobClient';

const translit = (str) => {
  if (!str) return '';
  const ru = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e', 'ж': 'j', 'з': 'z',
    'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r',
    'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
    'ы': 'y', 'э': 'e', 'ю': 'u', 'я': 'ya'
  };
  return str.toLowerCase().split('').map(char => ru[char] || char).join('').replace(/[^a-z0-9]/g, '');
};

const randomPassword = () => {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  const numbers = '23456789';
  const symbols = '!@#$%&*';
  const all = letters + numbers + symbols;
  
  const bytes = new Uint32Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (value) => all[value % all.length]).join('');
};

export const Coaches = () => {
  const { coaches, addCoach, removeCoach, updateCoach, locations, sports, fixBlobUrl } = useAdmin();
  const { t } = useTranslation();
  const { showNotification, confirm } = useNotifications();
  const [isAdding, setIsAdding] = useState(false);
  const [editingCoachId, setEditingCoachId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const initialFormState = {
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    specialization: (sports || [])[0] || '',
    experience: '',
    locationId: (locations || [])[0]?.id || '',
    bio: '',
    avatar: '',
    salaryRate: '2000',
    salaryType: 'per_session',
    login: '',
    password: ''
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showNotification({ message: t('common.success'), type: 'success' });
  };

  const [formData, setFormData] = useState(initialFormState);

  const generateCredentials = (first, last) => {
    if (!first) return;
    const login = translit(first) + '.coach';
    const password = randomPassword();
    
    setFormData(prev => ({ 
      ...prev, 
      login: login, 
      password: password 
    }));
  };

  const handleNameChange = (field, val) => {
    const updated = { ...formData, [field]: val };
    setFormData(updated);
    if (!editingCoachId) {
      generateCredentials(updated.firstName, updated.lastName);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName) return;

    if (editingCoachId) {
      updateCoach(editingCoachId, formData);
      showNotification({ message: t('common.success'), type: 'success' });
    } else {
      const created = addCoach(formData);
      if (created === false) return;
      showNotification({ message: t('common.success'), type: 'success' });
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
      showNotification({ message: t('common.success'), type: 'success' });
    } catch (error) {
      showNotification({ message: error.message || t('coaches.form.photo_error'), type: 'error' });
    } finally {
      setIsUploadingAvatar(false);
      event.target.value = '';
    }
  };

  const filteredCoaches = (Array.isArray(coaches) ? coaches : []).filter(c => 
    `${c.firstName || ''} ${c.lastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.specialization || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="admin-page-header admin-page-header--center">
        <div className="page-title-block page-title-block--row">
          <h1 className="h2">{t('coaches.title')}</h1>
          <p className="text-secondary text-lg">{t('coaches.subtitle')}</p>
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
          <Plus size={18} /> {isAdding ? t('common.cancel') : t('coaches.add_btn')}
        </Button>
      </div>

      {isAdding && (
        <Card className="admin-section-card animate-up" style={{ border: '1px solid var(--color-primary)' }}>
          <h3 className="h4 mb-8">{editingCoachId ? t('coaches.form.edit_title') : t('coaches.form.new_title')}</h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-10">
            {/* Basic Info */}
            <div className="admin-form-grid">
              <Input label={t('coaches.form.first_name')} required value={formData.firstName} onChange={e => handleNameChange('firstName', e.target.value)} />
              <Input label={t('coaches.form.last_name')} required value={formData.lastName} onChange={e => handleNameChange('lastName', e.target.value)} />
              <Input label={t('coaches.form.phone')} type="tel" placeholder={t('common.phone_placeholder')} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              <Input label={t('coaches.form.email')} type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>

            <div className="admin-form-grid" style={{ backgroundColor: 'var(--color-primary-soft)', padding: '24px', borderRadius: '20px' }}>
              <div className="relative">
                <Input label={t('coaches.form.login')} placeholder={t('coaches.form.login_auto')} value={formData.login} onChange={e => setFormData({...formData, login: e.target.value})} />
                <button 
                  type="button"
                  onClick={() => copyToClipboard(`${formData.login} ${formData.password}`)}
                  className="absolute right-4 top-[42px] p-2 text-slate-400 hover:text-primary transition-colors bg-white/80 rounded-lg border border-slate-100 shadow-sm"
                  title={t('coaches.form.copy_creds')}
                >
                  <Copy size={16} />
                </button>
              </div>
              <Input label={t('coaches.form.password')} placeholder={t('coaches.form.login_auto')} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>

            {/* Professional Info */}
            <div className="admin-form-grid">
              <div className="input-group">
                <label className="input-label">{t('coaches.form.spec')}</label>
                <select className="input-field" value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})}>
                  {(sports || []).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <Input label={t('coaches.form.exp')} type="number" value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} />
              <div className="input-group">
                <label className="input-label">{t('coaches.form.location')}</label>
                <select className="input-field" value={formData.locationId} onChange={e => setFormData({...formData, locationId: e.target.value})}>
                  <option value="">{t('coaches.form.all_locations')}</option>
                  {(locations || []).map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
            </div>

            <div className="admin-form-grid">
              <Input label={t('coaches.form.salary')} type="number" value={formData.salaryRate} onChange={e => setFormData({...formData, salaryRate: e.target.value})} />
              <div className="input-group">
                <label className="input-label">{t('coaches.form.salary_type')}</label>
                <select className="input-field" value={formData.salaryType} onChange={e => setFormData({...formData, salaryType: e.target.value})}>
                  <option value="per_session">{t('coaches.form.salary_session')}</option>
                  <option value="per_student">{t('coaches.form.salary_student')}</option>
                  <option value="monthly">{t('coaches.form.salary_monthly')}</option>
                </select>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">{t('coaches.form.bio')}</label>
              <textarea 
                className="input-field" rows="3" 
                value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})}
                placeholder={t('coaches.form.bio_placeholder')}
                style={{ resize: 'none' }}
              />
            </div>

            <div className="input-group">
              <label className="input-label">{t('coaches.form.photo')}</label>
              <FilePicker 
                onChange={handleAvatarUpload}
                previewUrl={fixBlobUrl(formData.avatar)}
                isUploading={isUploadingAvatar}
                iconType="camera"
                className="mt-2"
              />
            </div>

            <div className="flex justify-end gap-4 border-t pt-8">
              <Button variant="ghost" type="button" onClick={() => { setIsAdding(false); setEditingCoachId(null); }}>{t('common.cancel')}</Button>
              <Button variant="primary" type="submit" style={{ minWidth: '180px' }}>
                {editingCoachId ? t('common.save') : t('common.create')}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div className="mb-8 relative">
          <input 
            type="text" 
            placeholder={t('coaches.list.search_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '16px', 
              borderRadius: '16px', 
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-ice-100)'
            }}
          />
        </div>

        <div className="admin-card-grid">
          {filteredCoaches.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }} className="text-muted">
              <p className="text-secondary">{t('coaches.list.empty')}</p>
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
                    <img src={fixBlobUrl(coach.avatar)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 20 }} />
                  ) : (
                    (coach.firstName || coach.name || '?')[0]
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-lg">{coach.firstName ? `${coach.firstName} ${coach.lastName || ''}` : coach.name}</h4>
                  <div className="flex gap-2 items-center">
                    <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-primary)', backgroundColor: 'var(--color-primary-soft)', padding: '2px 8px', borderRadius: '4px' }}>
                      {coach.specialization}
                    </span>
                    {coach.login && (
                      <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--color-slate-500)', backgroundColor: 'var(--color-slate-100)', padding: '2px 8px', borderRadius: '4px' }}>
                        {coach.login} : {coach.password}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-secondary">
                  <Award size={14} className="text-muted" /> <span>{t('coaches.list.exp_years', { count: coach.experience })}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-secondary">
                  <MapPin size={14} className="text-muted" /> <span>{(locations || []).find(l => l.id === coach.locationId)?.name || t('coaches.form.all_locations')}</span>
                </div>
                {coach.phone && (
                  <div className="flex items-center gap-2 text-sm text-secondary">
                    <Phone size={14} className="text-muted" /> <span>{coach.phone}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 border-t pt-4">
                <button onClick={() => handleEdit(coach)} className="p-2 text-slate-400 hover:text-primary transition-colors bg-transparent border-none cursor-pointer"><Edit2 size={18} /></button>
                <button onClick={async () => {
                  const ok = await confirm({
                    title: t('common.are_you_sure'),
                    message: t('coaches.list.delete_confirm', { name: `${coach.firstName} ${coach.lastName}` }),
                    confirmText: t('common.delete'),
                    variant: 'danger'
                  });
                  if (ok) {
                    removeCoach(coach.id);
                    showNotification({ message: t('common.success'), type: 'success' });
                  }
                }} className="p-2 text-slate-400 hover:text-danger transition-colors bg-transparent border-none cursor-pointer"><Trash2 size={18} /></button>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
};
