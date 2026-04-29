import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ArrowLeft, Save } from 'lucide-react';
import { uploadBlobFile } from '../../lib/blobClient';

const translit = (str) => {
  const ru = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e', 'ж': 'j', 'з': 'z',
    'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r',
    'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
    'ы': 'y', 'э': 'e', 'ю': 'u', 'я': 'ya'
  };
  return str.toLowerCase().split('').map(char => ru[char] || char).join('').replace(/[^a-z0-9]/g, '');
};

const randomSuffix = () => {
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  return String(bytes[0] % 1000).padStart(3, '0');
};

const randomPassword = () => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
  const bytes = new Uint32Array(10);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (value) => alphabet[value % alphabet.length]).join('');
};

export const MemberForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { members, addMember, updateMember, user, locations, plans, selectedLocationId, groups } = useAdmin();
  const isAdmin = user?.role === 'admin';

  const isEditing = !!id;
  const existingMember = isEditing ? members.find(m => m.id === id) : null;

  const initialFormState = {
    firstName: '',
    lastName: '',
    phone: '',
    birthDate: '',
    weight: '',
    height: '',
    skillLevel: 'Начинающий',
    beltColor: 'Белый',
    groupId: (groups && groups.length > 0) ? groups[0].id : '',
    plan: (plans && plans.length > 0) ? plans[0].name : '',
    locationId: (selectedLocationId && selectedLocationId !== 'all') ? selectedLocationId : ((locations && locations.length > 0) ? locations[0].id : '1'),
    paidAmount: '0',
    login: '',
    password: '',
    hasParent: false,
    parentName: '',
    parentPhone: '',
    parentNote: '',
    avatar: '',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [activeTab, setActiveTab] = useState('general');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    if (isEditing && existingMember) {
      setFormData({
        ...existingMember,
        hasParent: !!(existingMember.parentName || existingMember.parentPhone),
        strength: existingMember.strength || 50,
        speed: existingMember.speed || 50,
        reaction: existingMember.reaction || 50,
        endurance: existingMember.endurance || 50,
        technique: existingMember.technique || 50
      });
    }
  }, [isEditing, existingMember]);

  // When a plan is selected, auto-fill the paid amount as a suggestion
  useEffect(() => {
    if (!isEditing && formData.plan) {
      const selectedPlan = plans.find(p => p.name === formData.plan);
      if (selectedPlan) {
        setFormData(prev => ({ ...prev, paidAmount: selectedPlan.price.toString() }));
      }
    }
  }, [formData.plan, isEditing, plans]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateCredentials = (first, last) => {
    if (!first && !last) return;
    const login = translit(first + (last ? '_' + last : '')) + randomSuffix();
    const password = randomPassword();
    setFormData(prev => ({ 
      ...prev, 
      login: prev.login || login, 
      password: prev.password || password 
    }));
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      const url = await uploadBlobFile(file, 'avatars');
      setFormData((prev) => ({ ...prev, avatar: url }));
    } catch (error) {
      alert(error.message || 'Не удалось загрузить аватар');
    } finally {
      setIsUploadingAvatar(false);
      event.target.value = '';
    }
  };

  const handleNameChange = (field, val) => {
    const updated = { ...formData, [field]: val };
    setFormData(updated);
    if (!isEditing) {
      generateCredentials(updated.firstName, updated.lastName);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.firstName.length < 2 || formData.lastName.length < 2) {
      alert('Имя и Фамилия должны содержать минимум 2 буквы.');
      return;
    }
    
    if (formData.birthDate) {
      const year = new Date(formData.birthDate).getFullYear();
      if (year < 1900 || year > new Date().getFullYear()) {
        alert('Пожалуйста, введите реалистичную дату рождения (с 1900 года).');
        return;
      }
    }

    const safeMemberData = { ...formData };
    delete safeMemberData.password;

    if (isEditing) {
      updateMember(id, safeMemberData);
    } else {
      const created = addMember(safeMemberData);
      if (created === false) return;
    }
    
    navigate('/admin/members');
  };

  const tabs = [
    { id: 'general', label: 'Общее' },
    { id: 'physical', label: 'Характеристики (RPG)' },
    { id: 'finances', label: 'Финансы' },
    { id: 'parent', label: 'Родитель' }
  ];

  return (
    <div className="animate-fade-in pb-12">
      <div className="admin-page-header admin-page-header--center">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/members')} className="p-2 bg-white rounded-full border shadow-sm hover:bg-slate-50 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="page-title-block page-title-block--row">
            <h1 className="h2">
              {isEditing ? 'Редактировать ученика' : 'Новый ученик'}
            </h1>
            <p className="text-secondary">Заполните анкету ученика</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
              activeTab === tab.id
                ? 'bg-primary text-white border-primary shadow-primary'
                : 'bg-white text-secondary border-slate-200 hover:border-slate-300'
            }`}
          >
            {tab.id === 'general' && '👤 '}
            {tab.id === 'physical' && '⚡ '}
            {tab.id === 'finances' && '💳 '}
            {tab.id === 'parent' && '👪 '}
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <Card style={{ padding: 'var(--space-8)' }}>
          {activeTab === 'general' && (
            <div className="flex flex-col gap-10 animate-fade-in">
              {/* Personal Info */}
              <div>
                <p className="text-[10px] font-bold text-muted uppercase tracking-[0.2em] mb-6 border-b pb-2">Личные данные</p>
                <div className="admin-form-grid">
                  <Input label="Имя" required minLength={2} value={formData.firstName} onChange={e => handleNameChange('firstName', e.target.value)} />
                  <Input label="Фамилия" required minLength={2} value={formData.lastName} onChange={e => handleNameChange('lastName', e.target.value)} />
                  <Input label="Дата рождения" type="date" min="1900-01-01" max={new Date().toISOString().split('T')[0]} value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} />
                  <Input label="Телефон" type="tel" placeholder="7 777 000 00 00" value={formData.phone} onChange={e => handleInputChange('phone', e.target.value)} />
                  <div className="input-group">
                    <label className="input-label">Фото ученика</label>
                    <input className="input-field" type="file" accept="image/*" onChange={handleAvatarUpload} />
                    {isUploadingAvatar && <p className="text-xs text-muted mt-2">Загрузка в Blob...</p>}
                    {formData.avatar && <p className="text-xs text-primary mt-2">Фото загружено</p>}
                  </div>
                </div>
              </div>

              {/* Athletic Info */}
              <div>
                <p className="text-[10px] font-bold text-muted uppercase tracking-[0.2em] mb-6 border-b pb-2">Спортивные показатели</p>
                <div className="admin-form-grid admin-form-grid--compact">
                  <Input label="Вес (кг)" type="number" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} />
                  <Input label="Рост (см)" type="number" value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} />
                  <div className="input-group">
                    <label className="input-label">Уровень</label>
                    <select className="input-field" value={formData.skillLevel} onChange={e => setFormData({...formData, skillLevel: e.target.value})}>
                      <option>Начинающий</option>
                      <option>Средний</option>
                      <option>Продвинутый</option>
                      <option>Профи</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Пояс / Ранг</label>
                    <select className="input-field" value={formData.beltColor} onChange={e => setFormData({...formData, beltColor: e.target.value})}>
                      <option value="Отсутствует">Отсутствует</option>
                      <option>Белый</option>
                      <option>Синий</option>
                      <option>Пурпурный</option>
                      <option>Коричневый</option>
                      <option>Черный</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Club Info */}
              <div>
                <p className="text-[10px] font-bold text-muted uppercase tracking-[0.2em] mb-6 border-b pb-2">Клубные настройки</p>
                <div className="admin-form-grid">
                  <div className="input-group">
                    <label className="input-label">Группа</label>
                    <select className="input-field" value={formData.groupId} onChange={e => setFormData({...formData, groupId: e.target.value})}>
                      <option value="">Без группы</option>
                      {groups.map(g => (
                        <option key={g.id} value={g.id}>{g.name} ({g.sport})</option>
                      ))}
                    </select>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Филиал</label>
                    <select className="input-field" value={formData.locationId} onChange={e => setFormData({...formData, locationId: e.target.value})}>
                      {locations.map(l => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <Card style={{ backgroundColor: 'var(--color-bg)', padding: 'var(--space-6)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--color-primary)' }}>
                <p className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-6">Доступы в личный кабинет</p>
                <div className="admin-form-grid">
                  <Input label="Логин" value={formData.login} onChange={e => setFormData({...formData, login: e.target.value})} />
                  <Input label="Пароль" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>
                {!isEditing && <p className="text-xs text-muted mt-2">Пароль сгенерирован автоматически для удобства. Вы можете изменить его.</p>}
              </Card>
            </div>
          )}

          {activeTab === 'physical' && (
            <div className="flex flex-col gap-10 animate-fade-in">
              <div>
                <p className="text-[10px] font-bold text-muted uppercase tracking-[0.2em] mb-8 border-b pb-2">Прокачка персонажа</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '600px' }}>
                  {[
                    { id: 'strength', label: 'Сила', icon: '💪' },
                    { id: 'speed', label: 'Скорость', icon: '⚡' },
                    { id: 'reaction', label: 'Реакция', icon: '👁️' },
                    { id: 'endurance', label: 'Выносливость', icon: '🫁' },
                    { id: 'technique', label: 'Техника', icon: '🥋' }
                  ].map(stat => (
                    <div key={stat.id}>
                      <div className="flex justify-between items-center mb-4">
                        <label className="text-sm font-bold flex items-center gap-2">
                          <span>{stat.icon}</span> {stat.label}
                        </label>
                        <span className="px-3 py-1 bg-primary text-white rounded-lg text-xs font-bold">{formData[stat.id] || 50} / 100</span>
                      </div>
                      <input 
                        type="range" 
                        min="1" max="100" 
                        value={formData[stat.id] || 50} 
                        onChange={e => setFormData({...formData, [stat.id]: parseInt(e.target.value)})}
                        style={{ 
                          width: '100%', 
                          height: '6px', 
                          borderRadius: '3px',
                          appearance: 'none',
                          backgroundColor: 'var(--color-border)',
                          cursor: 'pointer'
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'finances' && (
            <div className="flex flex-col gap-10 animate-fade-in">
              <div>
                <p className="text-[10px] font-bold text-muted uppercase tracking-[0.2em] mb-6 border-b pb-2">Финансовые настройки</p>
                <div className="admin-form-grid">
                  <div className="input-group">
                    <label className="input-label">Тариф (Шаблон)</label>
                    <select className="input-field" value={formData.plan} onChange={e => setFormData({...formData, plan: e.target.value})}>
                      <option value="">Не выбран</option>
                      {plans.map(p => (
                        <option key={p.id} value={p.name}>{p.name} ({p.price.toLocaleString()} ₸)</option>
                      ))}
                    </select>
                  </div>
                  {isAdmin && (
                    <Input 
                      label="Оплата (₸)" type="number" min="0"
                      value={formData.paidAmount} onChange={e => setFormData({...formData, paidAmount: e.target.value})} 
                    />
                  )}
                </div>
                <p className="text-xs text-muted mt-4 italic">
                  * Поле "Оплата" автоматически подтягивается из тарифа, но вы можете изменить его вручную для индивидуальных условий.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'parent' && (
            <div className="flex flex-col gap-10 animate-fade-in">
              <div>
                <label className="flex items-center gap-3 cursor-pointer mb-8 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200">
                  <input 
                    type="checkbox" 
                    style={{ width: '22px', height: '22px' }}
                    checked={formData.hasParent} 
                    onChange={e => setFormData({...formData, hasParent: e.target.checked})} 
                  />
                  <span className="text-sm font-bold text-slate-700">Ученик несовершеннолетний (требуется родитель)</span>
                </label>
                
                {formData.hasParent ? (
                  <div className="animate-up admin-form-grid admin-form-grid--wide" style={{ padding: 'var(--space-8)', backgroundColor: 'var(--color-bg)', borderRadius: '24px', border: '1px solid var(--color-border)' }}>
                    <Input label="ФИО Родителя" required={formData.hasParent} value={formData.parentName} onChange={e => setFormData({...formData, parentName: e.target.value})} />
                    <Input label="Телефон родителя" type="tel" required={formData.hasParent} placeholder="7 777 000 00 00" value={formData.parentPhone} onChange={e => handleInputChange('parentPhone', e.target.value)} />
                    <Input label="Заметка (доп. контакты)" value={formData.parentNote} onChange={e => setFormData({...formData, parentNote: e.target.value})} />
                  </div>
                ) : (
                  <div className="p-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <p className="text-secondary text-sm">Данные родителя не требуются для взрослого ученика.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-4 border-t mt-12 pt-8" style={{ borderColor: 'var(--color-border)' }}>
            <Button variant="ghost" type="button" onClick={() => navigate('/admin/members')}>Отмена</Button>
            <Button variant="primary" type="submit" className="gap-2 px-8">
              <Save size={18} /> {isEditing ? 'Сохранить изменения' : 'Создать ученика'}
            </Button>
          </div>
        </Card>
      </form>

      <style>{`
        input[type=range]::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: var(--color-primary);
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(30, 79, 134, 0.28);
          border: 3px solid white;
        }
      `}</style>
    </div>
  );
};
