import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { useTranslation } from '../../context/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { FilePicker } from '../../components/ui/FilePicker';
import { Settings as SettingsIcon, Globe, Lock, Save, Trophy, Trash2, ShieldAlert, CheckCircle, LayoutDashboard, Sparkles, Plus, ArrowLeft, ArrowRight, DatabaseBackup, RotateCcw, Clock } from 'lucide-react';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { uploadBlobFile, fixBlobUrl } from '../../lib/blobClient';
import { AdminTariffConstructor } from '../../components/admin/AdminTariffConstructor';
import { formatLimit } from '../../lib/tariff';
import { StudentDashboardTab } from '../../components/admin/settings/StudentDashboardTab';
import { DashboardConstructorTab } from '../../components/admin/settings/DashboardConstructorTab';
import { TeamTab } from '../../components/admin/settings/TeamTab';
import { NotificationsTab } from '../../components/admin/settings/NotificationsTab';

import { PageLoader } from '../../components/ui/PageLoader';

function BackupsTab({ showNotification, confirm }) {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/app/backups', { credentials: 'include' });
      const data = await res.json();
      setBackups(data.backups || []);
    } catch {
      setBackups([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRestore = async (backup) => {
    const ok = await confirm({
      title: 'Восстановить бэкап?',
      message: `Все текущие данные будут заменены состоянием от ${new Date(backup.created_at).toLocaleString('ru')}. Это действие нельзя отменить.`,
      confirmText: 'Восстановить',
      variant: 'danger',
    });
    if (!ok) return;
    setRestoring(backup.id);
    try {
      const res = await fetch('/api/app/backups', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backupId: backup.id }),
      });
      if (res.ok) {
        showNotification({ message: 'Бэкап восстановлен. Обновите страницу.', type: 'success' });
      } else {
        showNotification({ message: 'Ошибка восстановления', type: 'error' });
      }
    } catch {
      showNotification({ message: 'Ошибка восстановления', type: 'error' });
    } finally {
      setRestoring(null);
    }
  };

  return (
    <div className="animate-fade-in">
      <h3 className="h4 mb-2 flex items-center gap-3"><DatabaseBackup className="text-primary" /> Бэкапы данных</h3>
      <p className="text-secondary text-sm mb-8">Автоматически сохраняется один снимок в час. Хранится 30 дней. Можно восстановить любой.</p>

      {loading ? (
        <div className="text-center py-12 text-secondary text-sm">Загрузка...</div>
      ) : backups.length === 0 ? (
        <Card style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
          <div className="text-center py-10 text-secondary">
            <Clock size={32} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">Бэкапов пока нет</p>
            <p className="text-sm mt-1">Первый появится после следующего сохранения данных</p>
          </div>
        </Card>
      ) : (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div className="flex flex-col">
            {backups.map((b, i) => (
              <div key={b.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: i < backups.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--color-primary-soft)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Clock size={16} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text)', margin: 0 }}>
                      {new Date(b.created_at).toLocaleString('ru', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {i === 0 && <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Последний</span>}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  style={{ gap: 6, fontSize: '0.8rem', padding: '6px 12px' }}
                  disabled={restoring === b.id}
                  onClick={() => handleRestore(b)}
                >
                  <RotateCcw size={14} />
                  {restoring === b.id ? 'Восстановление...' : 'Восстановить'}
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

export const Settings = () => {
  const { 
    members, coaches, groups, subscription, usage, getLimitStatus, updateSubscription,
    achievements, addAchievement, removeAchievement, monthlyAward, updateMonthlyAward, resetData,
    dashboardLayout, toggleWidget, moveWidget, clubInfo, setClubInfo, setDashboardLayout,
    addLocation, removeLocation, updateLocation, locations,
    addPlan, removePlan, plans, isStateReady,
    studentDashboardPool, studentDashboardLayout, toggleStudentPoolWidget, moveStudentWidget, toggleStudentWidget, user,
    automations, updateAutomationConfig, deleteAccount
  } = useAdmin();
  const { showNotification, confirm } = useNotifications();
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('club');
  
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

  if (!isStateReady) return <PageLoader />;

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
      showNotification({ title: t('common.success'), message: t('settings.profile.logo_success'), type: 'success' });
    } catch (error) {
      showNotification({ title: t('common.error'), message: error.message || t('settings.profile.logo_error'), type: 'error' });
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
      showNotification({ title: t('common.error'), message: t('settings.security.pass_mismatch'), type: 'error' });
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

  const handleDeleteAccount = async () => {
    const isConfirmed = await confirm({
      title: t('settings.profile.delete_account_confirm_title'),
      message: t('settings.profile.delete_account_confirm_desc'),
      confirmText: t('settings.profile.delete_account_confirm_btn'),
      cancelText: t('common.cancel'),
      variant: 'danger'
    });

    if (isConfirmed) {
      const success = await deleteAccount();
      if (!success) {
        showNotification({ 
          title: t('common.error'), 
          message: t('settings.profile.delete_account_error'), 
          type: 'error' 
        });
      }
    }
  };
  const handleResetData = async () => {
    const isConfirmed = await confirm({
      title: t('settings.motivation.reset_confirm_title'),
      message: t('settings.motivation.reset_confirm_desc'),
      confirmText: t('settings.motivation.reset_btn'),
      cancelText: t('common.cancel'),
      variant: 'danger'
    });

    if (isConfirmed) {
      await resetData();
      showNotification({ 
        title: t('common.success'), 
        message: t('settings.motivation.reset_success'), 
        type: 'success' 
      });
    }
  };


  const TABS = [
    { id: 'club',             label: t('settings.tabs.club_profile'),      icon: <Globe size={18} /> },
    { id: 'locations',        label: t('settings.tabs.locations'),          icon: <SettingsIcon size={18} /> },
    { id: 'plans',            label: t('settings.tabs.plans'),              icon: <Save size={18} /> },
    { id: 'motivation',       label: t('settings.tabs.motivation'),         icon: <Trophy size={18} /> },
    { id: 'team',             label: t('settings.tabs.team'),               icon: <Users size={18} /> },
    { id: 'dashboard',        label: t('settings.tabs.admin_constructor'),  icon: <LayoutDashboard size={18} /> },
    { id: 'student_dashboard',label: t('settings.tabs.student_widgets'),    icon: <Sparkles size={18} /> },
    { id: 'notif',            label: t('settings.tabs.notifications'),      icon: <Bell size={18} /> },
    { id: 'security',         label: t('settings.tabs.security'),           icon: <Lock size={18} /> },
    { id: 'backups',          label: 'Бэкапы',                               icon: <DatabaseBackup size={18} /> },
  ];

  return (
    <div className="animate-fade-in">
      <div className="admin-page-header">
        <div className="page-title-block page-title-block--row">
          <h1 className="h2">{t('settings.title')}</h1>
          <p className="text-secondary text-lg">{t('settings.subtitle')}</p>
        </div>
      </div>

      {/* Mobile horizontal scrollable tab bar */}
      <div className="settings-mobile-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="settings-mobile-tab"
            data-active={activeTab === tab.id ? 'true' : 'false'}
          >
            <span className="settings-mobile-tab__icon">{tab.icon}</span>
            <span className="settings-mobile-tab__label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="settings-layout">
        {/* Desktop Sidebar Tabs */}
        <div className="settings-sidebar">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="settings-sidebar__btn"
              data-active={activeTab === tab.id ? 'true' : 'false'}
            >
              <span className="settings-sidebar__icon">{tab.icon}</span>
              <span className="settings-sidebar__label">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <Card style={{ padding: 'var(--space-8)' }}>
          {activeTab === 'club' && (
            <div className="animate-fade-in">
              <h3 className="h4 mb-8 flex items-center gap-3">
                <Globe className="text-primary" /> {t('settings.profile.title')}
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
                  <p className="font-bold text-lg mb-1">{t('settings.profile.club_info')}</p>
                  <p className="text-sm text-muted">{t('settings.profile.club_desc')}</p>
                </div>
              </div>

              <form className="flex flex-col gap-6" onSubmit={handleUpdateClubInfo}>
                <div className="admin-form-grid">
                  <Input 
                    label={t('settings.profile.club_name')} 
                    value={tempClubInfo.name} 
                    onChange={e => setTempClubInfo({...tempClubInfo, name: e.target.value})} 
                  />
                  <div className="input-group" style={{ maxWidth: '400px' }}>
                    <label className="input-label">{t('settings.profile.club_logo')}</label>
                    <FilePicker 
                      onChange={handleLogoUpload}
                      previewUrl={fixBlobUrl(tempClubInfo.logo)}
                      isUploading={isUploadingLogo}
                      iconType="image"
                      className="mt-2"
                    />
                  </div>
                </div>
                
                <div className="mt-8 pt-8 border-top" style={{ borderTop: '1px solid var(--color-border)' }}>
                  <Button variant="primary" type="submit" style={{ padding: 'var(--space-3) var(--space-8)' }}>
                    <Save size={18} /> {t('common.save')}
                  </Button>
                </div>
              </form>

              <div className="mt-16 pt-8 border-t border-rose-100">
                <h4 className="text-rose-600 font-black text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                  <ShieldAlert size={16} /> {t('settings.profile.danger_zone')}
                </h4>
                <div className="flex flex-col gap-4">
                  <div className="p-8 bg-rose-50/30 rounded-[32px] border border-rose-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex-1">
                      <p className="font-bold text-slate-800 mb-1">{t('settings.motivation.reset_title')}</p>
                      <p className="text-xs text-secondary leading-relaxed">{t('settings.motivation.reset_desc')}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      className="text-rose-600 hover:bg-rose-600 hover:text-white border-rose-200 transition-all px-8 shrink-0"
                      onClick={handleResetData}
                    >
                      <Sparkles size={18} /> {t('settings.motivation.reset_btn')}
                    </Button>
                  </div>

                  <div className="p-8 bg-rose-50/30 rounded-[32px] border border-rose-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex-1">
                      <p className="font-bold text-slate-800 mb-1">{t('settings.profile.delete_account_title')}</p>
                      <p className="text-xs text-secondary leading-relaxed">{t('settings.profile.delete_account_desc')}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      className="text-rose-600 hover:bg-rose-600 hover:text-white border-rose-200 transition-all px-8 shrink-0"
                      onClick={handleDeleteAccount}
                    >
                      <Trash2 size={18} /> {t('settings.profile.delete_account_btn')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'locations' && (
            <div className="animate-fade-in">
              <div className="flex justify-between items-center mb-8">
                <h3 className="h4 flex items-center gap-3"><Globe className="text-primary" /> {t('settings.locations.title')}</h3>
                <Button variant="secondary" size="sm" onClick={() => setIsAddingLoc(true)}>{t('settings.locations.add_btn')}</Button>
              </div>

              {isAddingLoc && (
                <Card style={{ marginBottom: 'var(--space-8)', border: '1px solid var(--color-primary-soft)' }}>
                  <form onSubmit={handleAddLocation} className="flex flex-col gap-4">
                    <Input label={t('settings.locations.name_label')} placeholder={t('settings.locations.name_placeholder')} value={newLoc.name} onChange={e => setNewLoc({...newLoc, name: e.target.value})} required />
                    <Input label={t('settings.locations.address_label')} placeholder={t('settings.locations.address_placeholder')} value={newLoc.address} onChange={e => setNewLoc({...newLoc, address: e.target.value})} required />
                    <Input label={t('settings.locations.phone_label')} type="tel" placeholder={t('common.phone_placeholder')} value={newLoc.phone} onChange={e => setNewLoc({...newLoc, phone: e.target.value})} />
                    <div className="flex gap-4 mt-6">
                      <Button type="submit" variant="primary" className="px-8">{t('common.save')}</Button>
                      <Button type="button" variant="ghost" onClick={() => setIsAddingLoc(false)}>{t('common.cancel')}</Button>
                    </div>
                  </form>
                </Card>
              )}

              <div className="flex flex-col gap-4">
                {(!Array.isArray(locations) || locations.length === 0) ? (
                   <p className="text-center p-8 text-muted border-2 border-dashed rounded-xl">{t('settings.locations.no_locations')}</p>
                ) : locations.map(loc => (
                  <div key={loc.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <p className="font-bold">{loc.name}</p>
                      <p className="text-sm text-secondary">{loc.address}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${loc.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'}`}>
                        {loc.isActive ? t('settings.locations.active') : t('settings.locations.inactive')}
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
                <h3 className="h4 flex items-center gap-3"><Save className="text-primary" /> {t('settings.plans.title')}</h3>
                <Button variant="secondary" size="sm" onClick={() => setIsAddingPlan(true)}>{t('settings.plans.create_btn')}</Button>
              </div>

              {isAddingPlan && (
                <Card style={{ marginBottom: 'var(--space-8)', border: '1px solid var(--color-primary-soft)' }}>
                  <form onSubmit={handleAddPlan} className="flex flex-col gap-4">
                    <div className="flex gap-4">
                      <div className="flex-1"><Input label={t('settings.plans.name_label')} placeholder={t('settings.plans.name_placeholder')} value={newPlan.name} onChange={e => setNewPlan({...newPlan, name: e.target.value})} required /></div>
                      <div className="flex-1"><Input label={t('settings.plans.price_label')} isCurrency value={newPlan.price} onChange={e => setNewPlan({...newPlan, price: e.target.value})} required /></div>
                    </div>
                    <Input label={t('settings.plans.visits_label')} type="number" placeholder={t('settings.plans.visits_placeholder')} value={newPlan.visits} onChange={e => setNewPlan({...newPlan, visits: e.target.value})} required />
                    <Input label={t('settings.plans.desc_label')} placeholder={t('settings.plans.desc_placeholder')} value={newPlan.description} onChange={e => setNewPlan({...newPlan, description: e.target.value})} />
                    <div className="flex gap-4 mt-2">
                      <Button type="submit" variant="primary">{t('common.save')}</Button>
                      <Button type="button" variant="ghost" onClick={() => setIsAddingPlan(false)}>{t('common.cancel')}</Button>
                    </div>
                  </form>
                </Card>
              )}

              <div className="admin-card-grid">
                {(!Array.isArray(plans) || plans.length === 0) ? (
                  <p className="text-center p-8 text-muted border-2 border-dashed rounded-xl" style={{ gridColumn: '1 / -1' }}>{t('settings.plans.no_plans')}</p>
                ) : plans.map(plan => (
                  <Card key={plan.id} style={{ borderBottom: '4px solid var(--color-primary)', position: 'relative' }}>
                    <button 
                      onClick={() => setPlanToDelete(plan)}
                      className="absolute top-4 right-4 text-muted hover:text-danger transition-colors p-2 hover:bg-red-50 rounded-lg"
                      title={t('settings.plans.delete_title')}
                    >
                      <Trash2 size={16} />
                    </button>
                    <h4 className="font-bold text-lg mb-1 pr-8">{plan.name}</h4>
                    <p className="text-caption mb-4">{plan.description}</p>
                    <div className="flex justify-between items-baseline mt-auto">
                      <span className="text-2xl font-bold text-primary">{plan.price.toLocaleString()} ₸</span>
                      <span className="text-sm font-bold text-muted">{t('settings.plans.visits_count', { count: plan.visits })}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'motivation' && (
            <div className="animate-fade-in">
              <h3 className="h4 mb-8 flex items-center gap-3"><Trophy className="text-primary" /> {t('settings.motivation.title')}</h3>
              
              <div className="flex flex-col gap-10">
                <Card style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                  <h5 className="font-bold mb-6">🏆 {t('settings.motivation.monthly_award')}</h5>
                  <div className="flex flex-col gap-4">
                    <Input label={t('settings.motivation.award_title')} value={monthlyAward.title} onChange={e => updateMonthlyAward({ title: e.target.value })} />
                    <div className="input-group">
                      <label className="input-label">{t('settings.motivation.award_desc')}</label>
                      <textarea 
                        className="input-field" rows={3} value={monthlyAward.description} 
                        onChange={e => updateMonthlyAward({ description: e.target.value })}
                        style={{ resize: 'none' }}
                      />
                    </div>
                    <Input label={t('settings.motivation.days_to_final')} type="number" value={monthlyAward.daysLeft} onChange={e => updateMonthlyAward({ daysLeft: parseInt(e.target.value) })} />
                  </div>
                </Card>

                <div>
                  <h5 className="font-bold mb-6 flex items-center justify-between">
                    🏅 {t('settings.motivation.achievements_system')}
                    <Button variant="ghost" size="sm" onClick={() => {
                       const title = prompt(t('settings.motivation.ach_name_prompt'));
                       const desc = prompt(t('settings.motivation.ach_desc_prompt'));
                       if (title && desc) {
                         addAchievement({ title, desc, icon: 'Trophy', color: 'var(--color-primary-soft)', iconColor: 'var(--color-primary)' });
                       }
                    }}>{t('settings.motivation.add_ach_btn')}</Button>
                  </h5>
                  <div className="flex flex-col gap-4">
                    {(!Array.isArray(achievements) || achievements.length === 0) ? (
                      <p className="text-center p-8 text-muted border-2 border-dashed rounded-xl">{t('settings.motivation.no_achievements')}</p>
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
                        }}>{t('common.delete')}</Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-12 mt-12 border-t">
                   <p className="text-sm text-secondary mb-6">{t('settings.motivation.reset_desc')}</p>
                   <Button variant="ghost" className="text-danger border-danger" onClick={async () => {
                     const ok = await confirm({
                       title: t('settings.motivation.reset_confirm_title') || t('common.are_you_sure'),
                       message: t('settings.motivation.reset_confirm'),
                       confirmText: t('common.delete'),
                       variant: 'danger'
                     });
                     if (ok) {
                       resetData();
                       showNotification({ message: t('common.success'), type: 'success' });
                     }
                   }}>{t('settings.motivation.reset_btn')}</Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <TeamTab user={user} coaches={coaches} navigate={navigate} setActiveTab={setActiveTab} />
          )}

          {activeTab === 'notif' && (
            <NotificationsTab automations={automations} updateAutomationConfig={updateAutomationConfig} />
          )}

          {activeTab === 'backups' && (
            <BackupsTab showNotification={showNotification} confirm={confirm} />
          )}

          {activeTab === 'security' && (
            <div className="animate-fade-in">
              <h3 className="h4 mb-8 flex items-center gap-3"><Lock className="text-primary" /> {t('settings.security.title')}</h3>
              <div className="flex flex-col gap-10">
                <Card style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                  <h5 className="font-bold mb-6">{t('settings.security.personal_info')}</h5>
                  <div className="flex flex-col gap-4 mb-10">
                    <Input label={t('settings.profile.name')} value={user?.name || ''} disabled />
                    <Input label={t('settings.profile.login_email')} value={user?.email || ''} disabled />
                    <Input label={language === 'ru' ? 'Номер телефона' : 'Телефон нөмірі'} value={user?.phone || '+7 (___) ___-__-__'} disabled />
                    <p className="text-[10px] text-muted mt-2">{t('settings.security.readonly_notice')}</p>
                  </div>

                  <h5 className="font-bold mb-6">{t('settings.security.change_pass')}</h5>
                  <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
                    <Input label={t('settings.security.old_pass')} type="password" value={passData.old} onChange={e => setPassData({...passData, old: e.target.value})} required />
                    <Input label={t('settings.security.new_pass')} type="password" value={passData.new} onChange={e => setPassData({...passData, new: e.target.value})} required />
                    <Input label={t('settings.security.confirm_pass')} type="password" value={passData.confirm} onChange={e => setPassData({...passData, confirm: e.target.value})} required />
                    <div className="mt-2 flex items-center gap-4">
                      <Button variant="primary" type="submit" disabled={passLoading} className="px-8">
                        {passLoading ? t('settings.security.updating') : t('settings.security.update_btn')}
                      </Button>
                      {passSuccess && (
                        <span className="text-xs font-bold text-emerald-600 animate-fade-in flex items-center gap-2">
                          <CheckCircle size={14} /> {t('settings.security.pass_success')}
                        </span>
                      )}
                    </div>
                  </form>
                </Card>

                <div>
                  <h5 className="font-bold mb-6">{t('settings.security.two_factor')}</h5>
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between opacity-50">
                    <div>
                      <p className="font-bold text-slate-800 mb-1">{t('settings.security.two_factor_desc')}</p>
                      <p className="text-xs text-secondary">{t('settings.profile.club_desc')}</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">{t('settings.security.two_factor_growth')}</span>
                  </div>
                </div>

                <div className="pt-8 border-t">
                  <h5 className="font-bold mb-6">{t('settings.security.active_sessions')}</h5>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
                          <Globe size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">Chrome on macOS ({t('settings.security.current_session')})</p>
                          <p className="text-[10px] text-secondary">Алматы, Казахстан · 192.168.1.1</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold uppercase text-green-600">{t('settings.security.active_status')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}



          {activeTab === 'student_dashboard' && (
            <StudentDashboardTab
              studentDashboardPool={studentDashboardPool}
              studentDashboardLayout={studentDashboardLayout}
              toggleStudentPoolWidget={toggleStudentPoolWidget}
              moveStudentWidget={moveStudentWidget}
              toggleStudentWidget={toggleStudentWidget}
              showNotification={showNotification}
            />
          )}

          {activeTab === 'dashboard' && (
            <DashboardConstructorTab
              dashboardLayout={dashboardLayout}
              setDashboardLayout={setDashboardLayout}
              toggleWidget={toggleWidget}
            />
          )}

        </Card>
      </div>
      <ConfirmModal 
        isOpen={!!planToDelete}
        onClose={() => setPlanToDelete(null)}
        onConfirm={() => {
          if (planToDelete) removePlan(planToDelete.id);
        }}
        title={t('settings.plans.delete_title')}
        message={t('settings.plans.delete_confirm', { name: planToDelete?.name })}
        confirmText={t('settings.plans.delete_btn')}
        variant="danger"
      />
    </div>
  );
};

