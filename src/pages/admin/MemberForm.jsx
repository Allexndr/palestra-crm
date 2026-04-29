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
    parentLogin: '',
    parentPassword: '',
    avatar: '',
    strength: 50,
    speed: 50,
    reaction: 50,
    endurance: 50,
    technique: 50
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
    { id: 'physical', label: 'RPG', icon: '⚡' },
    { id: 'finances', label: 'Деньги', icon: '💳' },
    { id: 'parent', label: 'Родитель', icon: '👪' }
  ];

  const avgStats = Math.round((formData.strength + formData.speed + formData.reaction + formData.endurance + formData.technique) / 5);

  return (
    <div className="animate-fade-in pb-12">
      <div className="admin-page-header">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/admin/members')} className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl border shadow-sm hover:bg-slate-50 transition-all">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="h2 mb-1">
              {isEditing ? 'Профиль ученика' : 'Новый атлет'}
            </h1>
            <p className="text-secondary font-medium">Система управления талантами Palestra</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-10 bg-slate-100/50 p-1.5 rounded-[22px] w-fit border border-slate-200/50">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-[18px] text-[13px] font-black whitespace-nowrap transition-all border-none cursor-pointer flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-white text-primary shadow-sm ring-1 ring-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="text-lg leading-none">{tab.icon}</span>
            <span className="uppercase tracking-wider">{tab.label}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <Card style={{ padding: '0', overflow: 'hidden', border: 'none', boxShadow: 'var(--shadow-lg)' }}>
          <div className="p-10">
            {activeTab === 'general' && (
              <div className="flex flex-col gap-12 animate-fade-in">
                {/* Personal Info */}
                <div>
                  <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                    <span className="w-8 h-[2px] bg-primary"></span> Личные данные
                  </h3>
                  <div className="admin-form-grid">
                    <Input label="Имя" required minLength={2} value={formData.firstName} onChange={e => handleNameChange('firstName', e.target.value)} />
                    <Input label="Фамилия" required minLength={2} value={formData.lastName} onChange={e => handleNameChange('lastName', e.target.value)} />
                    <Input label="Дата рождения" type="date" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} />
                    <Input label="Телефон" type="tel" placeholder="+7 (777) 000 00 00" value={formData.phone} onChange={e => handleInputChange('phone', e.target.value)} />
                    <div className="input-group">
                      <label className="input-label">Филиал / Клуб</label>
                      <select className="input-field" value={formData.locationId} onChange={e => handleInputChange('locationId', e.target.value)}>
                        {locations.length === 0 && <option value="1">Основной зал</option>}
                        {locations.map(loc => (
                          <option key={loc.id} value={loc.id}>{loc.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="input-group">
                      <label className="input-label">Фото атлета</label>
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                           {formData.avatar ? <img src={formData.avatar} className="w-full h-full object-cover" /> : <Camera size={20} className="text-slate-400" />}
                        </div>
                        <input className="hidden" id="avatar-input" type="file" accept="image/*" onChange={handleAvatarUpload} />
                        <label htmlFor="avatar-input" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-all">
                          {isUploadingAvatar ? 'Загрузка...' : 'Выбрать файл'}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Athletic Info */}
                <div>
                  <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                    <span className="w-8 h-[2px] bg-primary"></span> Спортивный профиль
                  </h3>
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

                {/* Credentials */}
                <div className="p-8 bg-indigo-50/50 rounded-3xl border border-indigo-100 shadow-inner">
                  <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <Shield size={14} /> Доступы ученика
                  </h3>
                  <div className="admin-form-grid">
                    <Input label="Логин" value={formData.login} onChange={e => setFormData({...formData, login: e.target.value})} />
                    <Input label="Пароль" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'physical' && (
              <div className="animate-fade-in">
                 <div className="flex flex-col lg:flex-row gap-12">
                    <div className="flex-1">
                      <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
                        <span className="w-8 h-[2px] bg-primary"></span> Характеристики атлета
                      </h3>
                      <div className="flex flex-col gap-10">
                        {[
                          { id: 'strength', label: 'Сила', icon: '💪' },
                          { id: 'speed', label: 'Скорость', icon: '⚡' },
                          { id: 'reaction', label: 'Реакция', icon: '👁️' },
                          { id: 'endurance', label: 'Выносливость', icon: '🫁' },
                          { id: 'technique', label: 'Техника', icon: '🥋' }
                        ].map(stat => (
                          <div key={stat.id} className="flex flex-col gap-4">
                            <div className="flex justify-between items-center">
                              <label className="text-sm font-black flex items-center gap-3 uppercase tracking-wider text-slate-700">
                                <span className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-xl shadow-sm">{stat.icon}</span> 
                                {stat.label}
                              </label>
                              <div className="flex items-center gap-3">
                                <input 
                                  type="number" 
                                  className="w-16 h-10 text-center font-black bg-white border border-slate-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary-soft transition-all"
                                  value={formData[stat.id]} 
                                  onChange={e => setFormData({...formData, [stat.id]: Math.min(100, Math.max(1, parseInt(e.target.value) || 1))})}
                                />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">/ 100</span>
                              </div>
                            </div>
                            <input 
                              type="range" 
                              min="1" max="100" 
                              value={formData[stat.id]} 
                              onChange={e => setFormData({...formData, [stat.id]: parseInt(e.target.value)})}
                              className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-primary"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="lg:w-80 flex flex-col gap-6">
                       <div className="p-8 bg-slate-900 rounded-[32px] text-white shadow-xl relative overflow-hidden">
                          <div className="absolute top-[-20px] right-[-20px] opacity-10"><Zap size={120} fill="white" /></div>
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 opacity-60">Общий уровень</p>
                          <div className="text-5xl font-black mb-6 tracking-tighter">{avgStats}%</div>
                          
                          <div className="flex flex-col gap-3">
                             <div className="flex justify-between items-center text-xs">
                                <span className="opacity-60">Физика</span>
                                <span className="font-bold">{Math.round((formData.strength + formData.speed + formData.endurance) / 3)}%</span>
                             </div>
                             <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-primary-soft" style={{ width: `${(formData.strength + formData.speed + formData.endurance) / 3}%` }}></div>
                             </div>
                             <div className="flex justify-between items-center text-xs mt-2">
                                <span className="opacity-60">Техника и IQ</span>
                                <span className="font-bold">{Math.round((formData.reaction + formData.technique) / 2)}%</span>
                             </div>
                             <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-400" style={{ width: `${(formData.reaction + formData.technique) / 2}%` }}></div>
                             </div>
                          </div>
                       </div>
                       
                       <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100">
                          <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Star size={14} fill="currentColor" /> Совет тренера
                          </p>
                          <p className="text-xs text-amber-800 font-medium leading-relaxed">
                            {avgStats < 40 ? 'Ученик только начинает путь. Сосредоточьтесь на базовой выносливости и технике.' : 
                             avgStats < 70 ? 'Хороший средний уровень. Время добавлять интенсивность и спарринги.' : 
                             'Элитный уровень. Подготовка к соревнованиям и работа над нюансами.'}
                          </p>
                       </div>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'finances' && (
              <div className="flex flex-col gap-10 animate-fade-in">
                <div>
                  <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
                    <span className="w-8 h-[2px] bg-primary"></span> Настройки абонемента
                  </h3>
                  <div className="admin-form-grid">
                    <div className="input-group">
                      <label className="input-label">Тарифный план</label>
                      <select className="input-field" value={formData.plan} onChange={e => setFormData({...formData, plan: e.target.value})}>
                        <option value="">Не выбран</option>
                        {plans.map(p => (
                          <option key={p.id} value={p.name}>{p.name} ({p.price.toLocaleString()} ₸)</option>
                        ))}
                      </select>
                    </div>
                    {isAdmin && (
                      <Input 
                        label="Стоимость к оплате (₸)" isCurrency
                        value={formData.paidAmount} onChange={e => setFormData({...formData, paidAmount: e.target.value})} 
                      />
                    )}
                  </div>
                  <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-xs text-slate-500 font-medium">
                      Система автоматически подставит цену из шаблона тарифа. Вы можете изменить её вручную, если предоставляете персональную скидку ученику.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'parent' && (
              <div className="flex flex-col gap-10 animate-fade-in">
                <div>
                   <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 border-b pb-8">
                     <div>
                       <h3 className="h4 mb-1">Представитель ученика</h3>
                       <p className="text-sm text-secondary font-medium">Данные родителя для связи и доступа в личный кабинет</p>
                     </div>
                     {!formData.parentLogin && (
                       <Button type="button" variant="secondary" className="gap-2" onClick={handleCreateParent}>
                         <Plus size={18} /> Создать кабинет родителя
                       </Button>
                     )}
                   </div>
                  
                  <div className="admin-form-grid">
                    <Input label="ФИО Родителя" value={formData.parentName} onChange={e => handleParentNameChange(e.target.value)} placeholder="Иванов Иван Иванович" />
                    <Input label="Телефон родителя" type="tel" placeholder="+7 (777) 000 00 00" value={formData.parentPhone} onChange={e => handleInputChange('parentPhone', e.target.value)} />
                    <Input label="Дополнительные контакты / Заметка" value={formData.parentNote} onChange={e => setFormData({...formData, parentNote: e.target.value})} placeholder="Мама / Бабушка" />
                  </div>

                  {(formData.hasParent || formData.parentLogin) && (
                    <div className="mt-12 p-8 bg-emerald-50 rounded-[32px] border border-emerald-100 animate-up">
                      <h4 className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                        <Shield size={16} /> Кабинет родителя активен
                      </h4>
                      <div className="admin-form-grid">
                        <Input label="Логин родителя" value={formData.parentLogin} onChange={e => setFormData({...formData, parentLogin: e.target.value})} />
                        <Input label="Пароль родителя" value={formData.parentPassword} onChange={e => setFormData({...formData, parentPassword: e.target.value})} />
                      </div>
                      <p className="text-[10px] text-emerald-600 font-bold mt-6 uppercase tracking-wider">Родитель сможет войти в приложение и видеть успехи своего ребенка</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="px-10 py-8 bg-slate-50 border-t flex justify-between items-center">
            <button type="button" onClick={() => navigate('/admin/members')} className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors border-none bg-transparent cursor-pointer">
              Отмена
            </button>
            <Button variant="primary" type="submit" className="gap-3 px-12 h-14 shadow-lg shadow-primary/20">
              <Save size={20} /> {isEditing ? 'Обновить анкету' : 'Зачислить в клуб'}
            </Button>
          </div>
        </Card>
      </form>

      <style>{`
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
      `}</style>
    </div>
  );
};
