import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Settings as SettingsIcon, Globe, Lock, Bell, Users, Camera, Save, Trophy, Trash2, LayoutList, CheckCircle, LayoutDashboard, Sparkles } from 'lucide-react';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { uploadBlobFile } from '../../lib/blobClient';
import { AdminTariffConstructor } from '../../components/admin/AdminTariffConstructor';
import { formatLimit } from '../../lib/tariff';

export const Settings = () => {
  const { 
    members, coaches, groups, subscription, usage, getLimitStatus, updateSubscription,
    achievements, addAchievement, removeAchievement, monthlyAward, updateMonthlyAward, resetData,
    dashboardLayout, toggleWidget, moveWidget
  } = useAdmin();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('palestra-tariff');
  
  const [isAddingLoc, setIsAddingLoc] = useState(false);
  const [newLoc, setNewLoc] = useState({ name: '', address: '', phone: '', isActive: true });
  
  const [isAddingPlan, setIsAddingPlan] = useState(false);
  const [newPlan, setNewPlan] = useState({ name: '', price: '', visits: '12', description: '' });
  const [planToDelete, setPlanToDelete] = useState(null);
  const [tempClubInfo, setTempClubInfo] = useState(clubInfo);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  
  const [passData, setPassData] = useState({ old: '', new: '', confirm: '' });
  const [passLoading, setPassLoading] = useState(false);
  const [passSuccess, setPassSuccess] = useState(false);

  // Sync temp state with actual clubInfo once it loads/changes
  React.useEffect(() => {
    setTempClubInfo(clubInfo);
  }, [clubInfo]);

  const handleUpdateClubInfo = (e) => {
    e.preventDefault();
    setClubInfo(tempClubInfo);
  };

  const handleLogoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    try {
      const url = await uploadBlobFile(file, 'club-logo');
      setTempClubInfo((prev) => ({ ...prev, logo: url }));
    } catch (error) {
      alert(error.message || 'Не удалось загрузить логотип');
    } finally {
      setIsUploadingLogo(false);
      event.target.value = '';
    }
  };

  const handleAddLocation = (e) => {
    e.preventDefault();
    const created = addLocation(newLoc);
    if (created === false) return;
    setNewLoc({ name: '', address: '', phone: '' });
    setIsAddingLoc(false);
  };

  const handleAddPlan = (e) => {
    e.preventDefault();
    addPlan({ ...newPlan, price: parseFloat(newPlan.price), visits: parseInt(newPlan.visits) });
    setNewPlan({ name: '', price: '', visits: '', description: '' });
    setIsAddingPlan(false);
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (!passData.new || passData.new !== passData.confirm) {
      alert('Пароли не совпадают');
      return;
    }
    setPassLoading(true);
    // Simulate API call
    setTimeout(() => {
      setPassLoading(false);
      setPassSuccess(true);
      setPassData({ old: '', new: '', confirm: '' });
      setTimeout(() => setPassSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="animate-fade-in">
      <div className="admin-page-header">
        <div className="page-title-block page-title-block--row">
          <h1 className="h2">Настройки</h1>
          <p className="text-secondary text-lg">Управление профилем клуба, персоналом и безопасностью</p>
        </div>
      </div>

      <div className="settings-layout">
        {/* Sidebar Tabs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
          {[
            { id: 'palestra-tariff', label: 'Тариф Palestra', icon: <SettingsIcon size={18} /> },
            { id: 'club', label: 'Профиль клуба', icon: <Globe size={18} /> },
            { id: 'locations', label: 'Филиалы', icon: <Globe size={18} /> },
            { id: 'plans', label: 'Абонементы', icon: <Save size={18} /> },
            { id: 'motivation', label: 'Мотивация', icon: <Trophy size={18} /> },
            { id: 'team', label: 'Команда и роли', icon: <Users size={18} /> },
            { id: 'dashboard', label: 'Конструктор', icon: <LayoutDashboard size={18} /> },
            { id: 'notif', label: 'Уведомления', icon: <Bell size={18} /> },
            { id: 'security', label: 'Безопасность', icon: <Lock size={18} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-5 px-8 py-4 rounded-[22px] transition-all border-none cursor-pointer text-left w-full group"
              style={{
                backgroundColor: activeTab === tab.id ? 'var(--color-primary)' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#666',
                fontWeight: activeTab === tab.id ? '900' : '600',
                fontSize: '13px',
                border: activeTab === tab.id ? '2.5px solid rgba(255,255,255,0.4)' : '1px solid transparent',
                boxShadow: activeTab === tab.id ? '0 8px 20px -4px rgba(49, 70, 166, 0.3)' : 'none'
              }}
            >
              <div className={`transition-transform duration-300 ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                {tab.icon}
              </div>
              <span className="uppercase tracking-[0.15em] text-[10px]">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <Card style={{ padding: 'var(--space-8)' }}>
          {activeTab === 'palestra-tariff' && (
            <div className="animate-fade-in">
              <div className="flex justify-between items-start gap-6 mb-8">
                <div>
                  <h3 className="h4 mb-2">Тариф Palestra</h3>
                  <p className="text-secondary admin-readable">
                    Подключение бесплатное: Starter помогает собрать базу и начать работу. Платный Growth от 9 000 ₸ включается только когда клубу стало мало лимитов или нужны модули роста.
                  </p>
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-primary bg-indigo-50 px-4 py-2 rounded-full">
                  {subscription.plan === 'starter' ? 'Starter бесплатно' : 'Growth'}
                </span>
              </div>

              <div className="tariff-res-grid">
                {[
                  ['members', 'Ученики', members.length],
                  ['coaches', 'Тренеры', coaches.length],
                  ['locations', 'Филиалы', locations.length],
                  ['groups', 'Группы', groups.length],
                ].map(([key, label, count]) => {
                  const status = getLimitStatus(key);
                  return (
                    <div key={key} className={`tariff-res-card ${status.isReached ? 'border-primary' : ''}`}>
                      <div className="tariff-res-card__head">
                        <div className="tariff-res-card__info">
                          <h5 className="tariff-res-card__label">{label}</h5>
                          <p className="tariff-res-card__usage">
                            {count} / {formatLimit(status.limit)} <span className="opacity-40">использовано</span>
                          </p>
                        </div>
                        {status.isReached && (
                          <span className="text-[9px] font-black uppercase px-2 py-1 text-white rounded-md" style={{ backgroundColor: 'var(--color-primary)' }}>Limit</span>
                        )}
                      </div>
                      <div className="usage-limit-card__bar h-1 bg-slate-100 rounded-full overflow-hidden mt-4">
                        <div style={{ 
                          width: `${status.percent}%`, 
                          height: '100%',
                          transition: 'width 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
                          backgroundColor: status.isReached ? 'var(--color-primary)' : status.isWarning ? 'var(--color-primary)' : 'var(--color-primary)' 
                        }} />
                      </div>
                      <div className="mt-4 flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase text-slate-300 tracking-wider">
                          {status.isReached ? 'Лимит исчерпан' : `${status.remaining} доступно`}
                        </span>
                        <span className="text-[11px] font-black">{status.percent}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <AdminTariffConstructor
                subscription={subscription}
                usage={usage}
                getLimitStatus={getLimitStatus}
                updateSubscription={updateSubscription}
              />
            </div>
          )}

          {activeTab === 'club' && (
            <div className="animate-fade-in">
              <h3 className="h4 mb-8 flex items-center gap-3">
                <Globe className="text-primary" /> Основная информация
              </h3>
              
              <div className="settings-profile-head">
                <div style={{ position: 'relative' }}>
                  <div style={{ width: 100, height: 100, borderRadius: '50%', backgroundColor: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--color-border)' }}>
                    {tempClubInfo.logo ? (
                      <img src={tempClubInfo.logo} alt="" style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                    ) : (
                      <span style={{ fontSize: '40px' }}>🥊</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="font-bold text-lg mb-1">Информация о клубе</p>
                  <p className="text-sm text-muted">Настройте отображение вашего клуба для учеников</p>
                </div>
              </div>

              <form className="flex flex-col gap-6" onSubmit={handleUpdateClubInfo}>
                <div className="admin-form-grid">
                  <Input 
                    label="Название клуба" 
                    value={tempClubInfo.name} 
                    onChange={e => setTempClubInfo({...tempClubInfo, name: e.target.value})} 
                  />
                  <div className="input-group">
                    <label className="input-label">Логотип клуба</label>
                    <input className="input-field" type="file" accept="image/*" onChange={handleLogoUpload} />
                    {isUploadingLogo && <p className="text-xs text-muted mt-2">Загрузка в Blob...</p>}
                    {tempClubInfo.logo && <p className="text-xs text-primary mt-2">Логотип загружен</p>}
                  </div>
                </div>
                
                <div className="mt-8 pt-8 border-top" style={{ borderTop: '1px solid var(--color-border)' }}>
                  <Button variant="primary" type="submit" style={{ padding: 'var(--space-3) var(--space-8)' }}>
                    <Save size={18} /> Сохранить изменения
                  </Button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'locations' && (
            <div className="animate-fade-in">
              <div className="flex justify-between items-center mb-8">
                <h3 className="h4 flex items-center gap-3"><Globe className="text-primary" /> Филиалы и адреса</h3>
                <Button variant="secondary" size="sm" onClick={() => setIsAddingLoc(true)}>+ Добавить филиал</Button>
              </div>

              {isAddingLoc && (
                <Card style={{ marginBottom: 'var(--space-8)', border: '1px solid var(--color-primary-soft)' }}>
                  <form onSubmit={handleAddLocation} className="flex flex-col gap-4">
                    <Input label="Название" placeholder="Напр: Филиал на Абая" value={newLoc.name} onChange={e => setNewLoc({...newLoc, name: e.target.value})} required />
                    <Input label="Адрес" placeholder="ул. Примерная 10" value={newLoc.address} onChange={e => setNewLoc({...newLoc, address: e.target.value})} required />
                    <Input label="Телефон" type="tel" placeholder="7 777 000 00 00" value={newLoc.phone} onChange={e => setNewLoc({...newLoc, phone: e.target.value})} />
                    <div className="flex gap-4 mt-6">
                      <Button type="submit" variant="primary" className="px-8">Сохранить</Button>
                      <Button type="button" variant="ghost" onClick={() => setIsAddingLoc(false)}>Отмена</Button>
                    </div>
                  </form>
                </Card>
              )}

              <div className="flex flex-col gap-4">
                {locations.length === 0 ? (
                   <p className="text-center p-8 text-muted border-2 border-dashed rounded-xl">Филиалы не добавлены</p>
                ) : locations.map(loc => (
                  <div key={loc.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <p className="font-bold">{loc.name}</p>
                      <p className="text-sm text-secondary">{loc.address}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${loc.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'}`}>
                        {loc.isActive ? 'Активен' : 'Неактивен'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'plans' && (
            <div className="animate-fade-in">
              <div className="flex justify-between items-center mb-8">
                <h3 className="h4 flex items-center gap-3"><Save className="text-primary" /> Тарифные планы</h3>
                <Button variant="secondary" size="sm" onClick={() => setIsAddingPlan(true)}>+ Создать план</Button>
              </div>

              {isAddingPlan && (
                <Card style={{ marginBottom: 'var(--space-8)', border: '1px solid var(--color-primary-soft)' }}>
                  <form onSubmit={handleAddPlan} className="flex flex-col gap-4">
                    <div className="flex gap-4">
                      <div className="flex-1"><Input label="Название" placeholder="Напр: 12 занятий" value={newPlan.name} onChange={e => setNewPlan({...newPlan, name: e.target.value})} required /></div>
                      <div className="flex-1"><Input label="Цена (₸)" isCurrency value={newPlan.price} onChange={e => setNewPlan({...newPlan, price: e.target.value})} required /></div>
                    </div>
                    <Input label="Кол-во посещений" type="number" placeholder="Напр: 12" value={newPlan.visits} onChange={e => setNewPlan({...newPlan, visits: e.target.value})} required />
                    <Input label="Описание" placeholder="Краткое описание" value={newPlan.description} onChange={e => setNewPlan({...newPlan, description: e.target.value})} />
                    <div className="flex gap-4 mt-2">
                      <Button type="submit" variant="primary">Создать</Button>
                      <Button type="button" variant="ghost" onClick={() => setIsAddingPlan(false)}>Отмена</Button>
                    </div>
                  </form>
                </Card>
              )}

              <div className="admin-card-grid">
                {plans.length === 0 ? (
                  <p className="text-center p-8 text-muted border-2 border-dashed rounded-xl" style={{ gridColumn: '1 / -1' }}>Абонементы не созданы</p>
                ) : plans.map(plan => (
                  <Card key={plan.id} style={{ borderBottom: '4px solid var(--color-primary)', position: 'relative' }}>
                    <button 
                      onClick={() => setPlanToDelete(plan)}
                      className="absolute top-4 right-4 text-muted hover:text-danger transition-colors p-2 hover:bg-red-50 rounded-lg"
                      title="Удалить тариф"
                    >
                      <Trash2 size={16} />
                    </button>
                    <h4 className="font-bold text-lg mb-1 pr-8">{plan.name}</h4>
                    <p className="text-caption mb-4">{plan.description}</p>
                    <div className="flex justify-between items-baseline mt-auto">
                      <span className="text-2xl font-bold text-primary">{plan.price.toLocaleString()} ₸</span>
                      <span className="text-sm font-bold text-muted">{plan.visits} зан.</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'motivation' && (
            <div className="animate-fade-in">
              <h3 className="h4 mb-8 flex items-center gap-3"><Trophy className="text-primary" /> Награды и мотивация</h3>
              
              <div className="flex flex-col gap-10">
                <Card style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                  <h5 className="font-bold mb-6">🏆 Награда месяца</h5>
                  <div className="flex flex-col gap-4">
                    <Input label="Заголовок" value={monthlyAward.title} onChange={e => updateMonthlyAward({ title: e.target.value })} />
                    <div className="input-group">
                      <label className="input-label">Описание награды</label>
                      <textarea 
                        className="input-field" rows={3} value={monthlyAward.description} 
                        onChange={e => updateMonthlyAward({ description: e.target.value })}
                        style={{ resize: 'none' }}
                      />
                    </div>
                    <Input label="Дней до финала" type="number" value={monthlyAward.daysLeft} onChange={e => updateMonthlyAward({ daysLeft: parseInt(e.target.value) })} />
                  </div>
                </Card>

                <div>
                  <h5 className="font-bold mb-6 flex items-center justify-between">
                    🏅 Система достижений
                    <Button variant="ghost" size="sm" onClick={() => {
                       const title = prompt('Название достижения:');
                       const desc = prompt('Описание достижения:');
                       if (title && desc) {
                         addAchievement({ title, desc, icon: 'Trophy', color: 'var(--color-primary-soft)', iconColor: 'var(--color-primary)' });
                       }
                    }}>+ Добавить</Button>
                  </h5>
                  <div className="flex flex-col gap-4">
                    {achievements.length === 0 ? (
                      <p className="text-center p-8 text-muted border-2 border-dashed rounded-xl">Достижения не добавлены</p>
                    ) : achievements.map((ach, i) => (
                      <div key={ach.id || i} className="flex items-center justify-between p-4 bg-white rounded-xl border">
                        <div className="flex items-center gap-4">
                          <div style={{ backgroundColor: ach.color, color: ach.iconColor }} className="w-10 h-10 rounded-lg flex items-center justify-center">
                            <Trophy size={18} />
                          </div>
                          <div>
                            <p className="font-bold text-sm">{ach.title}</p>
                            <p className="text-xs text-secondary">{ach.desc}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-danger" onClick={() => {
                          removeAchievement(ach.id);
                        }}>Удалить</Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-12 mt-12 border-t">
                   <h5 className="font-bold text-danger mb-4">Опасная зона</h5>
                   <p className="text-sm text-secondary mb-6">Очистка всех данных клуба (ученики, лиды, расписание) и сброс до заводских настроек.</p>
                   <Button variant="ghost" className="text-danger border-danger" onClick={() => {
                     if (window.confirm('Вы уверены? Все данные будут безвозвратно удалены!')) {
                       resetData();
                     }
                   }}>Сбросить все данные</Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="animate-fade-in">
              <div className="flex justify-between items-center mb-8">
                <h3 className="h4 flex items-center gap-3"><Users className="text-primary" /> Команда и роли</h3>
                <Button variant="secondary" size="sm" onClick={() => setActiveTab('team_add')}>+ Добавить сотрудника</Button>
              </div>
              
              <div className="flex flex-col gap-4">
                {/* Current User */}
                <div className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div style={{ width: 48, height: 48, borderRadius: '14px', backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
                      {user?.name?.charAt(0) || 'A'}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{user?.name || 'Администратор'} <span className="ml-2 text-[10px] bg-primary text-white px-2 py-0.5 rounded-full">ВЫ</span></p>
                      <p className="text-xs text-secondary">{user?.email}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-primary">Админ</span>
                </div>

                {/* Coaches as staff */}
                {Array.isArray(coaches) && coaches.map(coach => (
                  <div key={coach.id} className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div style={{ width: 48, height: 48, borderRadius: '14px', backgroundColor: '#f1f5f9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
                        {coach.firstName ? coach.firstName.charAt(0) : (coach.name ? coach.name.charAt(0) : 'T')}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">
                          {coach.firstName ? `${coach.firstName} ${coach.lastName || ''}` : (coach.name || 'Тренер')}
                        </p>
                        <p className="text-xs text-secondary">{coach.email || coach.phone || 'Нет контактов'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Тренер</span>
                      <Button variant="ghost" size="sm" className="text-slate-400" onClick={() => navigate('/admin/coaches')}>Настроить</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'notif' && (
            <div className="animate-fade-in">
              <h3 className="h4 mb-8 flex items-center gap-3"><Bell className="text-primary" /> Уведомления</h3>
              <div className="flex flex-col gap-4">
                {[
                  { id: 'n1', title: 'Новые заявки (Лиды)', desc: 'Мгновенное уведомление о новых заявках в Telegram', checked: true },
                  { id: 'n2', title: 'Оплата абонементов', desc: 'Уведомлять, когда ученик оплачивает тариф', checked: true },
                  { id: 'n3', title: 'Запись на пробное', desc: 'Уведомления о записях на пробные тренировки', checked: false },
                  { id: 'n4', title: 'Системные отчеты', desc: 'Еженедельный отчет по выручке и посещаемости', checked: true },
                ].map(item => (
                  <label key={item.id} className="flex items-center justify-between p-6 bg-white rounded-[24px] border border-slate-100 hover:border-primary/30 hover:shadow-xl hover:shadow-slate-100 transition-all cursor-pointer group">
                    <div className="flex-1">
                      <p className="font-bold text-slate-800 mb-1 group-hover:text-primary transition-colors">{item.title}</p>
                      <p className="text-xs text-secondary">{item.desc}</p>
                    </div>
                    <div className={`w-14 h-7 rounded-full p-1 transition-all duration-500 ${item.checked ? 'bg-primary shadow-lg shadow-indigo-100' : 'bg-slate-100'}`}>
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-500 shadow-md flex items-center justify-center ${item.checked ? 'translate-x-7' : 'translate-x-0'}`}>
                        {item.checked && <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />}
                      </div>
                    </div>
                    <input type="checkbox" className="hidden" defaultChecked={item.checked} />
                  </label>
                ))}
              </div>
              <div className="mt-16 p-8 bg-slate-900 text-white rounded-[32px] border-none flex items-center justify-between overflow-hidden relative group">
                <div className="absolute top-[-20px] right-[-20px] opacity-10 rotate-12 transition-transform group-hover:rotate-45 duration-700">
                   <MessageSquare size={160} fill="white" />
                </div>
                <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-2">Интеграция</p>
                  <h4 className="font-bold text-xl mb-2">Привязать Telegram</h4>
                  <p className="text-sm opacity-60">Получайте все важные события прямо в мессенджер</p>
                </div>
                <Button variant="primary" className="relative z-10 bg-indigo-500 border-none hover:bg-indigo-400 px-8 h-12 rounded-xl font-bold">Подключить бота</Button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="animate-fade-in">
              <h3 className="h4 mb-8 flex items-center gap-3"><Lock className="text-primary" /> Безопасность</h3>
              <div className="flex flex-col gap-10">
                <Card style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                  <h5 className="font-bold mb-6">Смена пароля</h5>
                  <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
                    <Input label="Старый пароль" type="password" value={passData.old} onChange={e => setPassData({...passData, old: e.target.value})} required />
                    <Input label="Новый пароль" type="password" value={passData.new} onChange={e => setPassData({...passData, new: e.target.value})} required />
                    <Input label="Подтвердите пароль" type="password" value={passData.confirm} onChange={e => setPassData({...passData, confirm: e.target.value})} required />
                    <div className="mt-2 flex items-center gap-4">
                      <Button variant="primary" type="submit" disabled={passLoading} className="px-8">
                        {passLoading ? 'Обновление...' : 'Обновить пароль'}
                      </Button>
                      {passSuccess && (
                        <span className="text-xs font-bold text-emerald-600 animate-fade-in flex items-center gap-2">
                          <CheckCircle size={14} /> Пароль успешно изменен!
                        </span>
                      )}
                    </div>
                  </form>
                </Card>

                <div>
                  <h5 className="font-bold mb-6">Двухфакторная аутентификация</h5>
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between opacity-50">
                    <div>
                      <p className="font-bold text-slate-800 mb-1">Защита через SMS / Telegram</p>
                      <p className="text-xs text-secondary">Повысьте уровень безопасности вашего аккаунта</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">Доступно в Growth</span>
                  </div>
                </div>

                <div className="pt-8 border-t">
                  <h5 className="font-bold mb-6">Активные сессии</h5>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
                          <Globe size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">Chrome on macOS (Текущая)</p>
                          <p className="text-[10px] text-secondary">Алматы, Казахстан · 192.168.1.1</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold uppercase text-green-600">Активно</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}



          {activeTab === 'dashboard' && (
            <div className="animate-fade-in">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="h4 flex items-center gap-3"><LayoutDashboard className="text-primary" /> Конструктор дашборда</h3>
                  <p className="text-secondary text-sm mt-1">Настройте порядок и видимость блоков на главной странице</p>
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                {dashboardLayout.map((widget, index) => (
                  <div key={widget.id} className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${widget.visible ? 'bg-white border-slate-100 shadow-sm' : 'bg-slate-50 border-dashed border-slate-200 opacity-60'}`}>
                    <div className="flex items-center gap-5">
                      <div className="flex flex-col gap-1">
                        <button 
                          disabled={index === 0}
                          onClick={() => moveWidget(widget.id, 'up')}
                          className="p-1 hover:bg-slate-100 rounded text-slate-400 disabled:opacity-20 border-none bg-transparent cursor-pointer"
                        >
                          <Plus size={14} className="rotate-0" />
                        </button>
                        <button 
                          disabled={index === dashboardLayout.length - 1}
                          onClick={() => moveWidget(widget.id, 'down')}
                          className="p-1 hover:bg-slate-100 rounded text-slate-400 disabled:opacity-20 border-none bg-transparent cursor-pointer"
                        >
                          <Plus size={14} className="rotate-180" />
                        </button>
                      </div>
                      <div>
                        <p className={`font-bold ${widget.visible ? 'text-slate-800' : 'text-slate-400'}`}>{widget.label}</p>
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-black">Блок #{index + 1}</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => toggleWidget(widget.id)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-none cursor-pointer ${widget.visible ? 'bg-indigo-50 text-primary' : 'bg-slate-200 text-slate-500'}`}
                    >
                      {widget.visible ? 'Активен' : 'Скрыт'}
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-12 p-8 bg-indigo-50 rounded-[32px] border border-indigo-100/50">
                 <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm"><Sparkles size={24} /></div>
                    <h5 className="font-bold text-slate-800">Персональный дашборд</h5>
                 </div>
                 <p className="text-sm text-slate-600 leading-relaxed">
                   Вы можете адаптировать главную страницу под свои задачи. Скройте ненужные блоки или переместите важные (например, Расписание) на самый верх для быстрого доступа.
                 </p>
              </div>
            </div>
          )}

        </Card>
      </div>
      <ConfirmModal 
        isOpen={!!planToDelete}
        onClose={() => setPlanToDelete(null)}
        onConfirm={() => {
          if (planToDelete) removePlan(planToDelete.id);
        }}
        title="Удалить тариф"
        message={`Вы действительно хотите удалить тарифный план "${planToDelete?.name}"? Это действие нельзя отменить.`}
        confirmText="Удалить навсегда"
        variant="danger"
      />
    </div>
  );
};

