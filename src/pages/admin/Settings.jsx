import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Settings as SettingsIcon, Globe, Lock, Bell, Users, Camera, Save, Trophy, Trash2 } from 'lucide-react';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

export const Settings = () => {
  const { 
    locations, addLocation, plans, addPlan, removePlan, clubInfo, setClubInfo, 
    achievements, setAchievements, monthlyAward, updateMonthlyAward, resetData 
  } = useAdmin();
  const [activeTab, setActiveTab] = useState('club');
  
  const [isAddingLoc, setIsAddingLoc] = useState(false);
  const [newLoc, setNewLoc] = useState({ name: '', address: '', phone: '', isActive: true });
  
  const [isAddingPlan, setIsAddingPlan] = useState(false);
  const [newPlan, setNewPlan] = useState({ name: '', price: '', visits: '12', description: '' });
  const [planToDelete, setPlanToDelete] = useState(null);
  const [tempClubInfo, setTempClubInfo] = useState(clubInfo);

  const handleUpdateClubInfo = (e) => {
    e.preventDefault();
    setClubInfo(tempClubInfo);
  };

  const handleAddLocation = (e) => {
    e.preventDefault();
    addLocation(newLoc);
    setNewLoc({ name: '', address: '', phone: '' });
    setIsAddingLoc(false);
  };

  const handleAddPlan = (e) => {
    e.preventDefault();
    addPlan({ ...newPlan, price: parseFloat(newPlan.price), visits: parseInt(newPlan.visits) });
    setNewPlan({ name: '', price: '', visits: '', description: '' });
    setIsAddingPlan(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-12">
        <h1 className="h2 mb-2" style={{ fontFamily: 'var(--font-family-display)' }}>Настройки</h1>
        <p className="text-secondary text-lg">Управление профилем клуба, персоналом и безопасностью</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: 'var(--space-8)' }}>
        {/* Sidebar Tabs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
          {[
            { id: 'club', label: 'Профиль клуба', icon: <Globe size={18} /> },
            { id: 'locations', label: 'Филиалы', icon: <Globe size={18} /> },
            { id: 'plans', label: 'Абонементы', icon: <Save size={18} /> },
            { id: 'motivation', label: 'Мотивация', icon: <Trophy size={18} /> },
            { id: 'team', label: 'Команда и роли', icon: <Users size={18} /> },
            { id: 'notif', label: 'Уведомления', icon: <Bell size={18} /> },
            { id: 'security', label: 'Безопасность', icon: <Lock size={18} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                backgroundColor: activeTab === tab.id ? 'var(--color-primary)' : 'transparent',
                color: activeTab === tab.id ? 'white' : 'var(--color-text-secondary)',
                fontWeight: 600,
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <Card style={{ padding: 'var(--space-8)' }}>
          {activeTab === 'club' && (
            <div className="animate-fade-in">
              <h3 className="h4 mb-8 flex items-center gap-3">
                <Globe className="text-primary" /> Основная информация
              </h3>
              
              <div className="mb-12 flex items-center gap-8">
                <div style={{ position: 'relative' }}>
                  <div style={{ width: 100, height: 100, borderRadius: '50%', backgroundColor: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--color-border)' }}>
                    <span style={{ fontSize: '40px' }}>{tempClubInfo.logo || '🥊'}</span>
                  </div>
                </div>
                <div>
                  <p className="font-bold text-lg mb-1">Информация о клубе</p>
                  <p className="text-sm text-muted">Настройте отображение вашего клуба для учеников</p>
                </div>
              </div>

              <form className="flex flex-col gap-6" onSubmit={handleUpdateClubInfo}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
                  <Input 
                    label="Название клуба" 
                    value={tempClubInfo.name} 
                    onChange={e => setTempClubInfo({...tempClubInfo, name: e.target.value})} 
                  />
                  <div className="input-group">
                    <label className="input-label">Эмодзи-логотип</label>
                    <Input 
                      value={tempClubInfo.logo} 
                      onChange={e => setTempClubInfo({...tempClubInfo, logo: e.target.value})} 
                    />
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
                    <Input label="Телефон" placeholder="+7 (___) ___ __ __" value={newLoc.phone} onChange={e => setNewLoc({...newLoc, phone: e.target.value})} />
                    <div className="flex gap-4 mt-2">
                      <Button type="submit" variant="primary">Сохранить</Button>
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
                      <div className="flex-1"><Input label="Цена (₸)" type="number" value={newPlan.price} onChange={e => setNewPlan({...newPlan, price: e.target.value})} required /></div>
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

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
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
                         setAchievements([...achievements, { id: Date.now().toString(), title, desc, icon: 'Trophy', color: 'var(--color-primary-soft)', iconColor: 'var(--color-primary)' }]);
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
                          setAchievements(achievements.filter(a => a.id !== ach.id));
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
            <div className="animate-fade-in text-center p-12">
              <Users size={48} className="text-muted mb-4 mx-auto" />
              <p className="font-bold mb-2">Управление командой</p>
              <p className="text-sm text-secondary mb-8">Здесь вы сможете добавлять тренеров и менеджеров, назначая им права доступа.</p>
              <Button variant="primary" style={{ margin: '0 auto' }}>Добавить сотрудника</Button>
            </div>
          ) || ['notif', 'security'].includes(activeTab) && (
            <div className="animate-fade-in text-center p-12 text-muted">
              Раздел в разработке
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

