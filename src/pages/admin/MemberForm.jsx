import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ArrowLeft, Save, Camera, Zap, Star, Plus, Shield } from 'lucide-react';
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

const randomPassword = () => {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  const numbers = '23456789';
  const symbols = '!@#$%&*';
  const all = letters + numbers + symbols;
  
  const bytes = new Uint32Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (value) => all[value % all.length]).join('');
};

export const MemberForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { members, addMember, updateMember, user, locations, plans, selectedLocationId, groups, clubInfo, isStateReady } = useAdmin();
  const isAdmin = user?.role === 'admin';

  if (!isStateReady) return <PageLoader />;

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
    parentLogin: '',
    parentPassword: '',
    avatar: '',
    strength: 50,
    speed: 50,
    reaction: 50,
    endurance: 50,
    technique: 50,
    medicalNotes: '',
    balance: '0',
    subscriptionEndDate: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [activeTab, setActiveTab] = useState('general');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    if (isEditing && existingMember) {
      setFormData({
        ...initialFormState,
        ...existingMember,
        hasParent: !!(existingMember.parentName || existingMember.parentPhone || existingMember.parentLogin),
      });
    }
  }, [isEditing, existingMember]);

  // When a plan is selected, auto-fill the paid amount
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

  const generateCredentials = (first, last, isParent = false) => {
    if (!first) return;
    const login = translit(first) + (last ? '.' + translit(last) : '');
    const password = randomPassword();
    
    if (isParent) {
      setFormData(prev => ({ 
        ...prev, 
        parentLogin: prev.parentLogin || login, 
        parentPassword: prev.parentPassword || password 
      }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        login: prev.login || login, 
        password: prev.password || password 
      }));
    }
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

  const handleParentNameChange = (val) => {
    setFormData(prev => ({ ...prev, parentName: val }));
  };

  const handleCreateParent = () => {
    if (!formData.parentName) {
      alert('Сначала введите ФИО родителя');
      return;
    }
    const names = formData.parentName.split(' ');
    generateCredentials(names[0], names[1] || '', true);
    setFormData(prev => ({ ...prev, hasParent: true }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.firstName.length < 2 || formData.lastName.length < 2) {
      alert('Имя и Фамилия должны содержать минимум 2 буквы.');
      return;
    }
    
    const safeMemberData = { ...formData };
    // In a real app, passwords shouldn't be stored like this, but we follow the current pattern
    
    if (isEditing) {
      updateMember(id, safeMemberData);
    } else {
      const created = addMember(safeMemberData);
      if (created === false) return;
    }
    
    navigate('/admin/members');
  };

  const tabs = [
    { id: 'general', label: 'Общее', icon: '👤' },
    { id: 'physical', label: 'Характеристики', icon: '⚡' },
    { id: 'finances', label: 'Финансы', icon: '💳' },
    { id: 'parent', label: 'Родитель', icon: '👪' }
  ];

  const avgStats = Math.round((formData.strength + formData.speed + formData.reaction + formData.endurance + formData.technique) / 5);

  return (
    <div className="animate-fade-in pb-20">
      <div className="admin-page-header" style={{ marginBottom: 'var(--space-12)' }}>
        <div className="flex items-center gap-8">
          <button 
            onClick={() => navigate('/admin/members')} 
            className="w-14 h-14 flex items-center justify-center bg-white rounded-[20px] border border-slate-200 shadow-sm hover:shadow-md hover:bg-slate-50 transition-all cursor-pointer"
          >
            <ArrowLeft size={22} className="text-slate-600" />
          </button>
          <div>
            <div className="flex items-center gap-4 mb-3">
              <span className="px-4 py-1.5 bg-primary-soft text-primary text-[11px] font-black uppercase tracking-widest rounded-xl">База учеников</span>
              <h1 className="h1" style={{ margin: 0, fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
                {isEditing ? 'Профиль ученика' : 'Регистрация нового ученика'}
              </h1>
            </div>
            <p className="text-secondary text-lg font-medium opacity-60">Заполните данные для зачисления в {clubInfo?.name || 'Palestra'}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mb-16 bg-white/80 backdrop-blur-md p-2 rounded-[26px] w-full sm:w-fit border border-slate-100 shadow-sm overflow-x-auto max-w-full scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-8 py-3.5 rounded-[18px] text-[13px] font-black whitespace-nowrap transition-all border-none cursor-pointer flex items-center gap-3 ${
              activeTab === tab.id
                ? 'bg-primary text-white shadow-xl shadow-indigo-100 scale-[1.02]'
                : 'text-slate-500 hover:text-slate-800 hover:bg-white/80'
            }`}
          >
            <span className="text-xl leading-none">{tab.icon}</span>
            <span className="uppercase tracking-widest">{tab.label}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-10">
          {activeTab === 'general' && (
            <div className="flex flex-col gap-8 animate-fade-in">
              <Card className="border-none shadow-2xl shadow-slate-200/50 p-0 overflow-hidden" style={{ borderRadius: '40px' }}>
                <div className="p-10 border-b border-slate-50 bg-gradient-to-r from-slate-50/50 to-transparent">
                  <h3 className="text-[11px] font-black text-primary uppercase tracking-[0.4em] flex items-center gap-4">
                    <div className="w-10 h-[3px] bg-primary rounded-full"></div> Личные данные и филиал
                  </h3>
                </div>
                <div className="p-12" style={{ paddingTop: 'var(--space-16)' }}>
                  <div className="admin-form-grid" style={{ gap: 'var(--space-10)' }}>
                    <Input label="Имя" required minLength={2} placeholder="Имя ученика" value={formData.firstName} onChange={e => handleNameChange('firstName', e.target.value)} />
                    <Input label="Фамилия" required minLength={2} placeholder="Фамилия ученика" value={formData.lastName} onChange={e => handleNameChange('lastName', e.target.value)} />
                    <Input label="Дата рождения" type="date" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} />
                    <Input label="Телефон" type="tel" placeholder="+7 (777) 000 00 00" value={formData.phone} onChange={e => handleInputChange('phone', e.target.value)} />
                    
                    <div className="input-group">
                      <label className="input-label">Филиал / Клуб</label>
                      <select className="input-field" style={{ height: '58px' }} value={formData.locationId} onChange={e => handleInputChange('locationId', e.target.value)}>
                        {locations.length === 0 && <option value="1">Основной зал</option>}
                        {locations.map(loc => (
                          <option key={loc.id} value={loc.id}>{loc.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="input-group">
                      <label className="input-label">Фото профиля</label>
                      <div className="flex items-center gap-6 p-2 pr-6 bg-slate-50 rounded-[22px] border border-slate-100">
                        <div className="w-14 h-14 rounded-[18px] bg-white flex items-center justify-center overflow-hidden border border-slate-200 shadow-sm shrink-0">
                           {formData.avatar ? <img src={formData.avatar} className="w-full h-full object-cover" /> : <Camera size={22} className="text-slate-300" />}
                        </div>
                        <div className="flex-1">
                          <input className="hidden" id="avatar-input" type="file" accept="image/*" onChange={handleAvatarUpload} />
                          <label htmlFor="avatar-input" className="text-xs font-black text-primary hover:underline cursor-pointer">
                            {isUploadingAvatar ? 'Загрузка...' : 'Загрузить новое фото'}
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-12">
                    <div className="input-group">
                      <label className="input-label text-rose-600 font-black">Медицинские особенности / Аллергии</label>
                      <textarea 
                        className="input-field min-h-[100px] border-rose-100 focus:border-rose-300 bg-rose-50/10" 
                        style={{ padding: '20px' }}
                        value={formData.medicalNotes} 
                        onChange={e => setFormData({...formData, medicalNotes: e.target.value})}
                        placeholder="Например: аллергия на цитрусовые, проблемы с коленями, астма... Если особенностей нет, оставьте поле пустым."
                      />
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="border-none shadow-2xl shadow-slate-200/50 p-0 overflow-hidden" style={{ borderRadius: '40px' }}>
                <div className="p-10 border-b border-slate-50 bg-gradient-to-r from-slate-50/50 to-transparent">
                  <h3 className="text-[11px] font-black text-primary uppercase tracking-[0.4em] flex items-center gap-4">
                    <div className="w-10 h-[3px] bg-primary rounded-full"></div> Спортивный профиль
                  </h3>
                </div>
                <div className="p-12" style={{ paddingTop: 'var(--space-16)' }}>
                  <div className="admin-form-grid admin-form-grid--compact" style={{ gap: 'var(--space-10)' }}>
                    <Input label="Вес (кг)" type="number" placeholder="0" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} />
                    <Input label="Рост (см)" type="number" placeholder="0" value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} />
                    
                    <div className="input-group">
                      <label className="input-label">Уровень мастерства</label>
                      <select className="input-field" style={{ height: '58px' }} value={formData.skillLevel} onChange={e => setFormData({...formData, skillLevel: e.target.value})}>
                        <option>Начинающий</option>
                        <option>Средний</option>
                        <option>Продвинутый</option>
                        <option>Профессионал</option>
                      </select>
                    </div>

                    <div className="input-group">
                      <label className="input-label">Пояс / Ранг</label>
                      <select className="input-field" style={{ height: '58px' }} value={formData.beltColor} onChange={e => setFormData({...formData, beltColor: e.target.value})}>
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
              </Card>

              <div className="p-12 bg-white/40 backdrop-blur-xl rounded-[40px] border border-white shadow-xl shadow-indigo-100/20">
                <h3 className="text-[11px] font-black text-primary uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
                  <Shield size={18} /> Доступы в приложение
                </h3>
                <div className="admin-form-grid">
                  <Input label="Логин" placeholder="Создается автоматически" value={formData.login} onChange={e => setFormData({...formData, login: e.target.value})} />
                  <Input label="Пароль" type="text" placeholder="Создается автоматически" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>
                <p className="text-[10px] text-slate-400 font-bold mt-8 uppercase tracking-widest">Ученик сможет войти в Palestra App по этим данным сразу после сохранения</p>
              </div>
            </div>
          )}

          {activeTab === 'physical' && (
            <div className="animate-fade-in flex flex-col lg:flex-row gap-10">
              <Card className="flex-1 border-none shadow-2xl shadow-slate-200/50 p-12" style={{ borderRadius: '40px' }}>
                <h3 className="text-[11px] font-black text-primary uppercase tracking-[0.4em] mb-14 flex items-center gap-4">
                  <div className="w-10 h-[3px] bg-primary rounded-full"></div> Характеристики ученика (1-100)
                </h3>
                <div className="flex flex-col gap-12">
                  {[
                    { id: 'strength', label: 'Сила', icon: '💪', color: '#F87171' },
                    { id: 'speed', label: 'Скорость', icon: '⚡', color: '#FBBF24' },
                    { id: 'reaction', label: 'Реакция', icon: '👁️', color: '#34D399' },
                    { id: 'endurance', label: 'Выносливость', icon: '🫁', color: '#60A5FA' },
                    { id: 'technique', label: 'Техника', icon: '🥋', color: '#818CF8' }
                  ].map(stat => (
                    <div key={stat.id} className="flex flex-col gap-5">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-black flex items-center gap-4 uppercase tracking-wider text-slate-700">
                          <span className="w-12 h-12 bg-slate-50 rounded-[18px] flex items-center justify-center text-2xl shadow-sm border border-slate-100">{stat.icon}</span> 
                          {stat.label}
                        </label>
                        <div className="flex items-center gap-3">
                          <input 
                            type="number" 
                            className="w-20 h-12 text-center font-black bg-white border border-slate-200 rounded-[18px] outline-none focus:border-primary focus:ring-4 focus:ring-primary-soft transition-all text-lg shadow-sm"
                            value={formData[stat.id]} 
                            onChange={e => setFormData({...formData, [stat.id]: Math.min(100, Math.max(1, parseInt(e.target.value) || 1))})}
                          />
                        </div>
                      </div>
                      <input 
                        type="range" 
                        min="1" max="100" 
                        value={formData[stat.id]} 
                        onChange={e => setFormData({...formData, [stat.id]: parseInt(e.target.value)})}
                        style={{ accentColor: stat.color }}
                        className="w-full h-2.5 bg-slate-100 rounded-full appearance-none cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </Card>
              
              <div className="lg:w-96 flex flex-col gap-8">
                 <div className="p-10 bg-slate-950 rounded-[44px] text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-[-40px] right-[-40px] opacity-10 group-hover:scale-110 transition-transform duration-700"><Zap size={200} fill="white" /></div>
                    <div className="relative z-10">
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-4 opacity-50">Global Power Score</p>
                      <div className="text-7xl font-black mb-8 tracking-tighter flex items-end gap-2">
                        {avgStats} <span className="text-2xl opacity-40 mb-3">%</span>
                      </div>
                      
                      <div className="flex flex-col gap-6">
                         <div>
                            <div className="flex justify-between items-center text-xs mb-3">
                               <span className="opacity-60 uppercase tracking-widest font-bold">Physical Base</span>
                               <span className="font-black text-amber-400">{Math.round((formData.strength + formData.speed + formData.endurance) / 3)}%</span>
                            </div>
                            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                               <div className="h-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.5)] transition-all duration-500" style={{ width: `${(formData.strength + formData.speed + formData.endurance) / 3}%` }}></div>
                            </div>
                         </div>
                         <div>
                            <div className="flex justify-between items-center text-xs mb-3">
                               <span className="opacity-60 uppercase tracking-widest font-bold">Mental & Technical</span>
                               <span className="font-black text-indigo-400">{Math.round((formData.reaction + formData.technique) / 2)}%</span>
                            </div>
                            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                               <div className="h-full bg-indigo-400 shadow-[0_0_12px_rgba(129,140,248,0.5)] transition-all duration-500" style={{ width: `${(formData.reaction + formData.technique) / 2}%` }}></div>
                            </div>
                         </div>
                      </div>
                    </div>
                 </div>
                 
                 <div className="p-8 bg-white border border-slate-200 rounded-[40px] shadow-sm">
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
                      <Star size={16} fill="var(--color-primary)" fillOpacity={0.1} /> Анализ потенциала
                    </p>
                    <p className="text-sm text-slate-600 font-bold leading-relaxed">
                      {avgStats < 40 ? 'Ученик на стадии «Белого листа». Требуется интенсивная база ОФП и дисциплина.' : 
                       avgStats < 70 ? 'Стабильный ученик. Рекомендуется участие в турнирах для повышения стрессоустойчивости.' : 
                       'Потенциальный чемпион. Индивидуальный план подготовки к профессиональным лигам.'}
                    </p>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'finances' && (
            <Card className="animate-fade-in border-none shadow-2xl shadow-slate-200/50 p-12" style={{ borderRadius: '40px' }}>
              <h3 className="text-[11px] font-black text-primary uppercase tracking-[0.4em] mb-12 flex items-center gap-4">
                <div className="w-10 h-[3px] bg-primary rounded-full"></div> Финансовые настройки
              </h3>
              <div className="admin-form-grid" style={{ gap: 'var(--space-10)' }}>
                <div className="input-group">
                  <label className="input-label">Выбор тарифа</label>
                  <select className="input-field" style={{ height: '58px' }} value={formData.plan} onChange={e => setFormData({...formData, plan: e.target.value})}>
                    <option value="">Не выбран</option>
                    {plans.map(p => (
                      <option key={p.id} value={p.name}>{p.name} ({p.price.toLocaleString()} ₸)</option>
                    ))}
                  </select>
                </div>
                <Input label="К оплате сейчас (₸)" isCurrency value={formData.paidAmount} onChange={e => setFormData({...formData, paidAmount: e.target.value})} />
                <Input label="Баланс депозита (₸)" isCurrency value={formData.balance} onChange={e => setFormData({...formData, balance: e.target.value})} />
                <Input label="Абонемент до" type="date" value={formData.subscriptionEndDate} onChange={e => setFormData({...formData, subscriptionEndDate: e.target.value})} />
              </div>
              <div className="mt-12 p-8 bg-slate-50 rounded-[28px] border border-slate-100 flex gap-5 items-start">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">💳</div>
                <p className="text-xs text-slate-500 font-bold leading-relaxed">
                  При выборе тарифа сумма подставится автоматически. Депозит можно использовать для покупки товаров в магазине клуба или оплаты доп. тренировок.
                </p>
              </div>
            </Card>
          )}

          {activeTab === 'parent' && (
            <div className="flex flex-col gap-10 animate-fade-in">
              <Card className="border-none shadow-2xl shadow-slate-200/50 p-0 overflow-hidden" style={{ borderRadius: '40px' }}>
                 <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                   <div>
                     <h3 className="h4 mb-1">Представитель (Родитель)</h3>
                     <p className="text-xs text-secondary font-black uppercase tracking-widest opacity-60">Для учеников до 18 лет</p>
                   </div>
                   {!formData.parentLogin && (
                     <Button type="button" variant="secondary" className="gap-3 h-12 px-8 rounded-2xl shadow-sm border-slate-200" onClick={handleCreateParent}>
                       <Plus size={20} /> Создать доступ родителю
                     </Button>
                   )}
                 </div>
                
                <div className="p-12">
                  <div className="admin-form-grid" style={{ gap: 'var(--space-10)' }}>
                    <Input label="ФИО Родителя" value={formData.parentName} onChange={e => handleParentNameChange(e.target.value)} placeholder="Иванов Иван Иванович" />
                    <Input label="Телефон" type="tel" placeholder="+7 (777) 000 00 00" value={formData.parentPhone} onChange={e => handleInputChange('parentPhone', e.target.value)} />
                    <Input label="Заметка" value={formData.parentNote} onChange={e => setFormData({...formData, parentNote: e.target.value})} placeholder="Мама / Папа / Опекун" />
                  </div>

                  {(formData.hasParent || formData.parentLogin) && (
                    <div className="mt-12 p-10 bg-emerald-50/50 rounded-[36px] border border-emerald-100 animate-up">
                      <h4 className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.4em] mb-10 flex items-center gap-3">
                        <Shield size={18} /> Кабинет родителя активирован
                      </h4>
                      <div className="admin-form-grid">
                        <Input label="Логин (Email)" value={formData.parentLogin} onChange={e => setFormData({...formData, parentLogin: e.target.value})} />
                        <Input label="Пароль" value={formData.parentPassword} onChange={e => setFormData({...formData, parentPassword: e.target.value})} />
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>

        <div className="mt-16 flex flex-col sm:flex-row justify-between items-center gap-8 bg-white/80 backdrop-blur-md p-8 rounded-[40px] border border-white shadow-2xl">
          <button 
            type="button" 
            onClick={() => navigate('/admin/members')} 
            className="text-sm font-black text-slate-400 hover:text-rose-600 transition-colors border-none bg-transparent cursor-pointer uppercase tracking-widest px-6"
          >
            Отменить и выйти
          </button>
          <Button variant="primary" type="submit" className="gap-4 px-16 h-16 text-lg shadow-2xl shadow-primary/30 rounded-[24px] w-full sm:w-auto">
            <Save size={24} /> {isEditing ? 'Сохранить изменения' : 'Зачислить ученика в клуб'}
          </Button>
        </div>
      </form>

      <style>{`
        .admin-container {
          padding-top: var(--space-8);
        }
        input[type=range] {
          -webkit-appearance: none;
          background: #f1f5f9;
          height: 8px;
          border-radius: 4px;
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 24px;
          height: 24px;
          background: var(--color-primary);
          border-radius: 50%;
          cursor: pointer;
          border: 4px solid white;
          box-shadow: 0 4px 12px rgba(49, 70, 166, 0.25);
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};
