import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { useTranslation } from '../../context/LanguageContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { FilePicker } from '../../components/ui/FilePicker';
import { AlertModal } from '../../components/ui/AlertModal';
import { useAlertModal } from '../../hooks/useModal';
import { CopyToast } from '../../components/ui/CopyToast';
import { useCopyToast } from '../../hooks/useCopyToast';
import { ArrowLeft, Save, Camera, Zap, Star, Plus, Shield, Copy, Check } from 'lucide-react';
import { uploadBlobFile, fixBlobUrl } from '../../lib/blobClient';
import { useNotifications } from '../../context/NotificationContext';
import { LEAGUE_TEMPLATES } from '../../lib/leagueTemplates';
import { isValidBirthDate, getBirthDateError } from '../../utils/dateValidation';

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
  const { members, addMember, updateMember, user, locations, plans, selectedLocationId, groups, clubInfo, isStateReady, fixBlobUrl } = useAdmin();
  const { t } = useTranslation();
  const { showNotification } = useNotifications();
  const { isOpen, modalProps, closeModal, error: showError } = useAlertModal();
  const { toast, copyWithToast } = useCopyToast();
  const [birthDateError, setBirthDateError] = useState('');
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
    skillLevel: 'beginner',
    beltColor: 'none',
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
    metrics: {},
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
        metrics: existingMember.metrics || {
          strength: existingMember.strength || 50,
          speed: existingMember.speed || 50,
          reaction: existingMember.reaction || 50,
          endurance: existingMember.endurance || 50,
          technique: existingMember.technique || 50,
          discipline: existingMember.discipline || 50
        },
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
    const base = translit(first) + (last ? translit(last) : '');
    const login = isParent ? base + '.parent' : base + '.student';
    const password = randomPassword();
    
    if (isParent) {
      setFormData(prev => ({ 
        ...prev, 
        parentLogin: login, 
        parentPassword: password 
      }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        login: login, 
        password: password 
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
      showNotification({ title: t('common.success'), type: 'success' });
    } catch (error) {
      showNotification({ title: t('common.error'), message: error.message || t('members.upload_error'), type: 'error' });
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
      showNotification({ message: t('members.parent_name_required'), type: 'warning' });
      return;
    }
    const names = formData.parentName.split(' ');
    generateCredentials(names[0], names[1] || '', true);
    setFormData(prev => ({ ...prev, hasParent: true }));
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      showNotification({ message: t('common.success'), type: 'success' });
    });
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.firstName.length < 2 || formData.lastName.length < 2) {
      showNotification({ message: t('members.name_min_length'), type: 'warning' });
      return;
    }
    
    setIsSaving(true);
    try {
      const safeMemberData = { ...formData };
      
      let success = false;
      if (isEditing) {
        success = await updateMember(id, safeMemberData);
      } else {
        success = await addMember(safeMemberData);
      }
      
      if (success) {
        showNotification({ message: t('common.success'), type: 'success' });
        navigate('/admin/members');
      } else {
        showNotification({ message: t('common.error_saving') || 'Ошибка при сохранении данных', type: 'error' });
      }
    } catch (error) {
      console.error('Submit error:', error);
      showError(error.message || 'Произошла непредвиденная ошибка');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'general', label: t('members.general_tab'), icon: '👤' },
    { id: 'physical', label: t('members.physical_tab'), icon: '⚡' },
    { id: 'finances', label: t('members.finance_tab'), icon: '💳' },
    { id: 'parent', label: t('members.parent_tab'), icon: '👪' }
  ];

  const avgStats = Math.round((formData.strength + formData.speed + formData.reaction + formData.endurance + formData.technique) / 5);

  return (
    <div className="animate-fade-in pb-20">
      <div className="admin-page-header" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="member-form-header">
          <button 
            onClick={() => navigate('/admin/members')} 
            className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:bg-slate-50 transition-all cursor-pointer"
          >
            <ArrowLeft size={18} className="text-slate-600" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="px-3 py-1 bg-primary-soft text-primary text-[10px] font-black uppercase tracking-widest rounded-lg flex-shrink-0">{t('members.title')}</span>
              <h1 className="member-form-title">
                {isEditing ? t('members.edit_member') : t('members.new_member')}
              </h1>
            </div>
            <p className="text-secondary text-sm font-medium opacity-60 truncate">{t('members.registration_subtitle', { club: clubInfo?.name || 'Palestra' })}</p>
          </div>
        </div>
      </div>

      <div className="chrome-tabs-container">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`chrome-tab ${activeTab === tab.id ? 'active' : ''}`}
          >
            <div className="chrome-tab-content">
              <span className="chrome-tab-icon">{tab.icon}</span>
              <span className="chrome-tab-label">{tab.label}</span>
            </div>
            <div className="chrome-tab-curve-left"></div>
            <div className="chrome-tab-curve-right"></div>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-8">
          {activeTab === 'general' && (
            <div className="flex flex-col gap-8 animate-fade-in">
              <Card className="border border-slate-100 shadow-sm p-0 overflow-hidden" style={{ borderRadius: '40px' }}>
                <div className="mform-card-header">
                  <h3 className="text-[11px] font-black text-primary uppercase tracking-[0.4em] flex items-center gap-4">
                    <div className="w-10 h-[3px] bg-primary rounded-full"></div> {t('members.personal_data')}
                  </h3>
                </div>
                <div className="mform-card-body">
                  <div className="admin-form-grid">
                    <Input label={t('members.first_name')} required minLength={2} placeholder={t('members.first_name')} value={formData.firstName} onChange={e => handleNameChange('firstName', e.target.value)} />
                    <Input label={t('members.last_name')} required minLength={2} placeholder={t('members.last_name')} value={formData.lastName} onChange={e => handleNameChange('lastName', e.target.value)} />
                    <Input 
                      label={t('members.birth_date')} 
                      type="date" 
                      value={formData.birthDate} 
                      onChange={e => {
                        const value = e.target.value;
                        setFormData({...formData, birthDate: value});
                        const error = getBirthDateError(value);
                        setBirthDateError(error);
                      }}
                      min="1900-01-01"
                      max={new Date().toISOString().split('T')[0]}
                    />
                    {birthDateError && (
                      <p className="text-red-500 text-xs mt-1">{birthDateError}</p>
                    )}
                    <Input label={t('members.phone')} type="tel" placeholder="+7 (777) 000 00 00" value={formData.phone} onChange={e => handleInputChange('phone', e.target.value)} />
                    
                    <div className="input-group">
                      <label className="input-label">{t('members.branch')}</label>
                      <select className="input-field" style={{ height: '58px' }} value={formData.locationId} onChange={e => handleInputChange('locationId', e.target.value)}>
                        {(!Array.isArray(locations) || locations.length === 0) && <option value="1">{t('settings.locations.main_hall')}</option>}
                        {(Array.isArray(locations) ? locations : []).map(loc => (
                          <option key={loc.id} value={loc.id}>{loc.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="input-group">
                      <label className="input-label">{t('members.avatar')}</label>
                      <FilePicker 
                        onChange={handleAvatarUpload}
                        previewUrl={fixBlobUrl(formData.avatar)}
                        isUploading={isUploadingAvatar}
                        iconType="camera"
                        className="mt-2"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-12">
                    <div className="input-group">
                      <label className="input-label text-rose-600 font-black">{t('members.medical_notes')}</label>
                      <textarea 
                        className="input-field min-h-[100px] border-rose-100 focus:border-rose-300 bg-rose-50/10" 
                        style={{ padding: '20px' }}
                        value={formData.medicalNotes} 
                        onChange={e => setFormData({...formData, medicalNotes: e.target.value})}
                        placeholder={t('members.medical_placeholder')}
                      />
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="border border-slate-100 shadow-sm p-0 overflow-hidden" style={{ borderRadius: '40px' }}>
                <div className="px-8 py-6 border-b border-slate-50 bg-gradient-to-r from-slate-50/50 to-transparent">
                  <h3 className="text-[11px] font-black text-primary uppercase tracking-[0.4em] flex items-center gap-4">
                    <div className="w-10 h-[3px] bg-primary rounded-full"></div> {t('members.sport_profile')}
                  </h3>
                </div>
                <div className="px-8 py-12">
                  <div className="admin-form-grid admin-form-grid--compact">
                    <Input label={t('members.weight')} type="number" placeholder="0" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} />
                    <Input label={t('members.height')} type="number" placeholder="0" value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} />
                    
                    <div className="input-group">
                      <label className="input-label">{t('members.skill_level')}</label>
                      <select className="input-field" style={{ height: '58px' }} value={formData.skillLevel} onChange={e => setFormData({...formData, skillLevel: e.target.value})}>
                        <option value="beginner">{t('members.skills.beginner')}</option>
                        <option value="intermediate">{t('members.skills.intermediate')}</option>
                        <option value="advanced">{t('members.skills.advanced')}</option>
                        <option value="pro">{t('members.skills.pro')}</option>
                      </select>
                    </div>

                    <div className="input-group">
                      <label className="input-label">{t('members.belt')}</label>
                      <select className="input-field" style={{ height: '58px' }} value={formData.beltColor} onChange={e => setFormData({...formData, beltColor: e.target.value})}>
                        <option value="none">{t('members.skills.none')}</option>
                        <option value="white">{t('members.skills.white')}</option>
                        <option value="blue">{t('members.skills.blue')}</option>
                        <option value="purple">{t('members.skills.purple')}</option>
                        <option value="brown">{t('members.skills.brown')}</option>
                        <option value="black">{t('members.skills.black')}</option>
                      </select>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="border border-slate-100 shadow-sm p-0 overflow-hidden" style={{ borderRadius: '40px' }}>
                <div className="p-10 border-b border-slate-50 bg-gradient-to-r from-slate-50/50 to-transparent">
                  <h3 className="text-[11px] font-black text-primary uppercase tracking-[0.4em] flex items-center gap-4">
                    <Shield size={18} className="text-primary" /> {t('members.app_access')}
                  </h3>
                </div>
                <div className="p-12" style={{ paddingTop: 'var(--space-16)' }}>
                  <div className="admin-form-grid">
                    <div className="relative">
                      <Input label={t('members.login')} placeholder={t('members.login_auto')} value={formData.login} onChange={e => setFormData({...formData, login: e.target.value})} />
                      <button 
                        type="button"
                        onClick={() => copyToClipboard(`${formData.login} ${formData.password}`)}
                        className="absolute right-4 top-[42px] p-2 text-slate-400 hover:text-primary transition-colors bg-white/80 rounded-lg border border-slate-100 shadow-sm"
                        title={t('common.copy')}
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                    <Input label={t('members.password')} type="text" placeholder={t('members.login_auto')} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold mt-12 uppercase tracking-widest border-t border-slate-100 pt-8">{t('members.access_ready')}</p>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'physical' && (
            <div className="animate-fade-in">
              <Card className="border border-slate-100 shadow-sm mform-card-body" style={{ borderRadius: '40px' }}>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(LEAGUE_TEMPLATES[clubInfo?.activeLeagueTemplate || 'martial_arts']?.metrics || []).map(stat => (
                      <div 
                        key={stat.id} 
                        className="stat-card bg-slate-50/50 rounded-[24px] border border-slate-100/60 hover:bg-white hover:shadow-lg transition-all duration-300 group relative overflow-hidden"
                      >
                        {/* Subtle background glow */}
                        <div 
                          className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                          style={{ backgroundColor: stat.color }}
                        ></div>

                        <div className="flex justify-between items-center mb-4 relative z-10">
                          <div className="flex items-center gap-4">
                            <div 
                              className="w-14 h-14 rounded-[20px] bg-white flex items-center justify-center shadow-sm text-3xl group-hover:scale-110 transition-transform duration-500"
                              style={{ borderBottom: `4px solid ${stat.color}20` }}
                            >
                              {/* Using a generic emoji if none provided in template */}
                              {stat.id === 'strength' ? '💪' : 
                               stat.id === 'speed' ? '⚡' : 
                               stat.id === 'endurance' ? '🫁' : 
                               stat.id === 'discipline' ? '📋' : 
                               stat.id === 'technique' ? '🥋' : 
                               stat.id === 'reaction' ? '👁️' : '📊'}
                            </div>
                            <span className="font-black text-slate-800 uppercase tracking-[0.15em] text-[13px]">{t(stat.label)}</span>
                          </div>
                          <div className="relative">
                            <input 
                              type="number" 
                              className="w-16 h-12 text-center font-black bg-white border-none rounded-2xl outline-none shadow-sm text-xl text-primary focus:ring-4 focus:ring-primary/10 transition-all"
                              value={formData.metrics?.[stat.id] || 50} 
                              onChange={e => setFormData({
                                ...formData, 
                                metrics: {
                                  ...formData.metrics,
                                  [stat.id]: Math.min(100, Math.max(1, parseInt(e.target.value) || 1))
                                }
                              })}
                            />
                            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: stat.color }}></div>
                          </div>
                        </div>

                        <div className="space-y-3 relative z-10">
                          <input 
                            type="range" 
                            min="1" max="100" 
                            value={formData.metrics?.[stat.id] || 50} 
                            onChange={e => setFormData({
                              ...formData, 
                              metrics: {
                                ...formData.metrics,
                                [stat.id]: parseInt(e.target.value)
                              }
                            })}
                            style={{ '--thumb-color': stat.color }}
                            className="custom-range w-full h-3 bg-slate-200/60 rounded-full appearance-none cursor-pointer"
                          />
                          <div className="flex justify-between px-1 text-[10px] font-black text-slate-400 tracking-widest uppercase">
                            <span>{stat.id === 'points' || stat.id === 'level' ? 'Min' : t('members.skills.beginner')}</span>
                            <span>{stat.id === 'points' || stat.id === 'level' ? 'Max' : t('members.skills.pro')}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
              
              <div className="lg:w-96 flex flex-col gap-8">
                 <div className="p-10 bg-slate-950 rounded-3xl text-white shadow-2xl relative overflow-hidden group">
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
                 
                 <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm">
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
                      <Star size={16} fill="var(--color-primary)" fillOpacity={0.1} /> {t('members.potential_analysis')}
                    </p>
                    <p className="text-sm text-slate-600 font-bold leading-relaxed">
                      {avgStats < 40 ? t('members.potential.low') : 
                       avgStats < 70 ? t('members.potential.mid') : 
                       t('members.potential.high')}
                    </p>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'finances' && (
            <Card className="animate-fade-in border border-slate-100 shadow-sm mform-card-body" style={{ borderRadius: '40px' }}>
              <h3 className="text-[11px] font-black text-primary uppercase tracking-[0.4em] mb-12 flex items-center gap-4">
                <div className="w-10 h-[3px] bg-primary rounded-full"></div> {t('members.finance_settings')}
              </h3>
              <div className="admin-form-grid">
                <div className="input-group">
                  <label className="input-label">{t('members.plan_select')}</label>
                  <select className="input-field" style={{ height: '58px' }} value={formData.plan} onChange={e => setFormData({...formData, plan: e.target.value})}>
                    <option value="">{t('members.no_plan')}</option>
                    {(Array.isArray(plans) ? plans : []).map(p => (
                      <option key={p.id} value={p.name}>{p.name} ({p.price.toLocaleString()} ₸)</option>
                    ))}
                  </select>
                </div>
                <Input label={t('members.to_pay_now')} isCurrency value={formData.paidAmount} onChange={e => setFormData({...formData, paidAmount: e.target.value})} />
                <Input label={t('members.deposit_balance')} isCurrency value={formData.balance} onChange={e => setFormData({...formData, balance: e.target.value})} />
                <Input label={t('members.sub_end_date')} type="date" value={formData.subscriptionEndDate} onChange={e => setFormData({...formData, subscriptionEndDate: e.target.value})} />
              </div>
              <div className="mt-12 p-8 bg-slate-50 rounded-3xl border border-slate-100 flex gap-5 items-start">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">💳</div>
                <p className="text-xs text-slate-500 font-bold leading-relaxed">
                  {t('members.finance_info')}
                </p>
              </div>
            </Card>
          )}

          {activeTab === 'parent' && (
            <div className="flex flex-col gap-10 animate-fade-in">
              <Card className="border border-slate-100 shadow-sm p-0 overflow-hidden" style={{ borderRadius: '40px' }}>
                 <div className="px-6 py-4 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                   <div>
                     <h3 className="h4 mb-1">{t('members.parent_rep')}</h3>
                     <p className="text-xs text-secondary font-black uppercase tracking-widest opacity-60">{t('members.parent_minor')}</p>
                   </div>
                   {!formData.parentLogin && (
                     <Button type="button" variant="secondary" className="gap-3 h-12 px-8 rounded-2xl shadow-sm border-slate-200" onClick={handleCreateParent}>
                       <Plus size={20} /> {t('members.parent_create_btn')}
                     </Button>
                   )}
                 </div>
                
                <div className="p-6">
                  <div className="admin-form-grid">
                    <Input label="ФИО Родителя" value={formData.parentName} onChange={e => handleParentNameChange(e.target.value)} placeholder="Иванов Иван Иванович" />
                    <Input label="Телефон" type="tel" placeholder="+7 (777) 000 00 00" value={formData.parentPhone} onChange={e => handleInputChange('parentPhone', e.target.value)} />
                    <div className="input-group">
                      <label className="input-label">Кем приходится</label>
                      <select className="input-field" value={formData.parentNote} onChange={e => setFormData({...formData, parentNote: e.target.value})}>
                        <option value="">Выберите статус</option>
                        <option value="Мама">Мама</option>
                        <option value="Папа">Папа</option>
                        <option value="Опекун">Опекун</option>
                      </select>
                    </div>
                  </div>

                  {(formData.hasParent || formData.parentLogin) && (
                    <div className="mt-6 p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100 animate-up">
                      <h4 className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.4em] mb-4 flex items-center gap-3">
                        <Shield size={18} /> {t('members.parent_active')}
                      </h4>
                      <div className="admin-form-grid">
                        <div className="relative">
                          <Input label={t('members.login')} value={formData.parentLogin} onChange={e => setFormData({...formData, parentLogin: e.target.value})} />
                          <button 
                            type="button"
                            onClick={() => copyToClipboard(`${formData.parentLogin} ${formData.parentPassword}`)}
                            className="absolute right-4 top-[42px] p-2 text-slate-400 hover:text-primary transition-colors bg-white/80 rounded-lg border border-slate-100 shadow-sm"
                            title={t('common.copy')}
                          >
                            <Copy size={16} />
                          </button>
                        </div>
                        <Input label={t('members.password')} value={formData.parentPassword} onChange={e => setFormData({...formData, parentPassword: e.target.value})} />
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>

        <Card className="mt-24 flex flex-col sm:flex-row justify-between items-center gap-8 border border-slate-100 shadow-sm p-8" style={{ borderRadius: '40px' }}>
          <button 
            type="button" 
            onClick={() => navigate('/admin/members')} 
            className="text-sm font-black text-slate-400 hover:text-rose-600 transition-colors border-none bg-transparent cursor-pointer uppercase tracking-widest px-6"
          >
            {t('members.save_and_exit')}
          </button>
          <Button variant="primary" type="submit" disabled={isSaving} className="gap-4 px-16 h-16 text-lg shadow-2xl shadow-primary/30 rounded-3xl w-full sm:w-auto">
            {isSaving ? <Zap size={24} className="animate-pulse" /> : <Save size={24} />} 
            {isSaving ? t('common.saving') || 'Сохранение...' : (isEditing ? t('common.save') : t('members.enroll_btn'))}
          </Button>
        </Card>
      </form>

      <style>{`
        .chrome-tabs-container {
          display: flex;
          align-items: flex-end;
          padding: 0 10px;
          margin-bottom: 40px;
          border-bottom: 2px solid white;
          gap: 4px;
        }

        .chrome-tab {
          position: relative;
          padding: 14px 24px;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          color: #94a3b8;
          z-index: 1;
          white-space: nowrap;
          flex-shrink: 0;
        }

        /* Mobile: replace chrome tabs with 2×2 grid pills */
        @media (max-width: 640px) {
          .chrome-tabs-container {
            display: grid !important;
            grid-template-columns: 1fr 1fr;
            border-bottom: none;
            padding: 0;
            margin-bottom: 20px;
            gap: 8px;
          }
          .chrome-tab {
            padding: 12px 10px;
            border-radius: 16px;
            background: #f8fafc;
            border: 1.5px solid #e2e8f0 !important;
            white-space: normal;
            flex-shrink: unset;
            text-align: center;
          }
          .chrome-tab.active {
            background: var(--color-primary-soft) !important;
            border-color: var(--color-primary) !important;
          }
          .chrome-tab.active::before { display: none; }
          .chrome-tab-curve-left,
          .chrome-tab-curve-right { display: none; }
          .chrome-tab-content { justify-content: center; gap: 6px; }
          .chrome-tab-icon { font-size: 18px; }
          .chrome-tab-label { font-size: 11px; letter-spacing: 0.06em; }
        }

        .stat-card { padding: 20px; }
        @media (max-width: 640px) {
          .stat-card { padding: 14px; }
        }

        .chrome-tab.active {
          color: var(--color-primary);
          z-index: 10;
        }

        .chrome-tab.active::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: white;
          border-radius: 24px 24px 0 0;
          z-index: -1;
          box-shadow: 0 -10px 25px -5px rgba(0, 0, 0, 0.05);
        }

        .chrome-tab-content {
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
          z-index: 2;
        }

        .chrome-tab-icon {
          font-size: 24px;
          transition: transform 0.3s;
        }

        .chrome-tab:hover .chrome-tab-icon {
          transform: scale(1.1);
        }

        .chrome-tab-label {
          font-size: 14px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.15em;
        }

        .chrome-tab.active .chrome-tab-curve-left,
        .chrome-tab.active .chrome-tab-curve-right {
          position: absolute;
          bottom: 0;
          width: 24px;
          height: 24px;
          background: transparent;
          display: block;
        }

        .chrome-tab.active .chrome-tab-curve-left {
          left: -24px;
          border-bottom-right-radius: 24px;
          box-shadow: 8px 0 0 0 white;
        }

        .chrome-tab.active .chrome-tab-curve-right {
          right: -24px;
          border-bottom-left-radius: 24px;
          box-shadow: -8px 0 0 0 white;
        }

        .chrome-tab:not(.active):hover::before {
          content: '';
          position: absolute;
          top: 6px;
          left: 6px;
          right: 6px;
          bottom: 0;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 20px 20px 0 0;
          z-index: -1;
        }

        .mform-card-header {
          padding: 28px 40px;
          border-bottom: 1px solid var(--color-border-soft, #f1f5f9);
          background: linear-gradient(to right, rgba(248,250,252,0.5), transparent);
        }
        .mform-card-body {
          padding: 40px;
        }
        @media (max-width: 640px) {
          .mform-card-header { padding: 16px 20px; }
          .mform-card-body   { padding: 20px; }
        }
        .admin-container {
          padding-top: var(--space-8);
        }
        .member-form-header {
          display: flex;
          align-items: center;
          gap: 16px;
          min-width: 0;
        }
        .member-form-title {
          margin: 0;
          font-size: clamp(1.2rem, 5vw, 2rem);
          font-weight: 800;
          line-height: 1.2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        @media (max-width: 480px) {
          .member-form-title { font-size: 1.2rem; }
        }
        .custom-range {
          -webkit-appearance: none;
          background: #f1f5f9;
          height: 12px;
          border-radius: 6px;
        }
        .custom-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 28px;
          height: 28px;
          background: var(--thumb-color, var(--color-primary));
          border-radius: 50%;
          cursor: pointer;
          border: 4px solid white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .custom-range::-moz-range-thumb {
          width: 28px;
          height: 28px;
          background: var(--thumb-color, var(--color-primary));
          border-radius: 50%;
          cursor: pointer;
          border: 4px solid white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      
      <AlertModal isOpen={isOpen} onClose={closeModal} {...modalProps} />
    </div>
  );
};
