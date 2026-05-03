import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ChevronRight, CreditCard, Medal, Shield, Trophy, TrendingUp, User, Zap, Settings, Eye, EyeOff, ArrowUp, ArrowDown, Layout, Save, X, BarChart3, Users } from 'lucide-react';
import { useAdmin, STUDENT_WIDGET_CATALOG } from '../../context/AdminContext';
import { EventCarousel } from '../../components/features/EventCarousel';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LEAGUE_TEMPLATES } from '../../lib/leagueTemplates';

export const Profile = () => {
  const { user, members, attendance, achievements, groups, schedule, activeChildId, clubInfo, studentDashboardPool, studentDashboardLayout, updateMemberProfile } = useAdmin();
  const [activeTab, setActiveTab] = useState('sports'); // 'sports' or 'rpg'
  const [isCustomizing, setIsCustomizing] = useState(false);
  
  const isParent = user?.role === 'parent';
  const isStudent = user?.role === 'student';

  const children = useMemo(
    () => (isParent ? members.filter((m) => m.parentId === user?.id) : []),
    [isParent, members, user?.id]
  );

  const profileData = (() => {
    if (isParent) {
      return members.find((m) => m.id === activeChildId) || children[0];
    }
    if (isStudent) {
      return (
        members.find((m) => m.id === user?.id) ||
        members.find((m) => m.login === user?.login) ||
        members[0]
      );
    }
    return members.find((m) => m.login === user?.login) || members[0];
  })();

  if (!profileData) {
    return (
      <main id="main-content" tabIndex={-1} className="member-content">
        <Card className="member-empty-state">
          <User size={48} />
          <h2 className="h2">Профиль не найден</h2>
          <p className="text-secondary">
            Демо-родитель и демо-ученик будут восстановлены автоматически после обновления страницы.
          </p>
        </Card>
      </main>
    );
  }

  const studentAttendance = attendance.filter(
    (a) => Array.isArray(a?.memberIds) && a.memberIds.includes(profileData.id)
  );
  const group = groups.find(g => g.id === profileData.groupId);
  const childSchedule = schedule.filter((s) => !group?.name || s.groupName === group.name);
  const memberAchievements = achievements.filter(
    (a) => !Array.isArray(a?.memberIds) || a.memberIds.includes(profileData.id)
  );
  const points = Number(profileData.points) || 0;
  const level = Math.floor(points / 100) + 1;
  const nextRankProgress = Math.min(100, Math.max(8, points % 500 === 0 ? 100 : Math.round(((points % 500) / 500) * 100)));

  const activeTemplate = LEAGUE_TEMPLATES[clubInfo?.activeLeagueTemplate || 'martial_arts'];
  const stats = (activeTemplate?.metrics || []).map(m => ({
    label: m.label,
    value: profileData.metrics?.[m.id] || profileData[m.id] || 50,
    color: m.color || 'bg-primary'
  }));

  // WIDGETS LOGIC
  const userLayout = profileData.dashboardLayout || studentDashboardLayout;
  const activeWidgets = userLayout.filter(w => studentDashboardPool.includes(w.id));

  const handleToggleWidget = (id) => {
    const newLayout = userLayout.map(w => w.id === id ? { ...w, visible: !w.visible } : w);
    updateMemberProfile(profileData.id, { dashboardLayout: newLayout });
  };

  const handleMoveWidget = (id, direction) => {
    const idx = userLayout.findIndex(w => w.id === id);
    if (idx === -1) return;
    const newLayout = [...userLayout];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= newLayout.length) return;
    [newLayout[idx], newLayout[targetIdx]] = [newLayout[targetIdx], newLayout[idx]];
    updateMemberProfile(profileData.id, { dashboardLayout: newLayout });
  };

  const renderWidget = (id) => {
    switch (id) {
      case 'physical_stats':
        return (
          <Card key={id} className="shadow-2xl shadow-slate-200/50 mb-8">
            <h3 className="member-card-title">
              <TrendingUp size={18} className="text-primary" /> Физические показатели
            </h3>
            <div className="member-stats-grid">
              {stats.map(stat => (
                <div key={stat.label} className="member-stat">
                  <div className="flex justify-between items-center mb-2">
                    <span>{stat.label}</span>
                    <strong>{stat.value}%</strong>
                  </div>
                  <div className="member-stat__bar">
                    <div style={{ width: `${stat.value}%`, backgroundColor: stat.color }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        );
      case 'last_activity':
        return (
          <Card key={id} className="mb-8">
            <h3 className="member-card-title"><Calendar size={18} className="text-primary" /> Последняя активность</h3>
            <div className="member-activity-list">
              {studentAttendance.length === 0 ? (
                <div className="member-empty-inline">
                  <Calendar size={36} />
                  <p>История тренировок пуста</p>
                </div>
              ) : (
                studentAttendance.slice(0, 6).map((a, i) => (
                  <div key={a.id || i} className="member-activity-row">
                    <div><Calendar size={18} /></div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800">Посещение занятия</p>
                      <p className="text-[11px] text-muted font-medium">{new Date(a.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}</p>
                    </div>
                    <span>+10 XP</span>
                  </div>
                ))
              )}
            </div>
          </Card>
        );
      case 'rpg_rank':
        return (
          <Card key={id} className="card-hover mb-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <p className="member-kicker">Текущий ранг</p>
                <h3 className="h4 text-primary">{profileData.level || 'Новичок'}</h3>
              </div>
              <div className="text-right">
                <p className="member-kicker">Прогресс</p>
                <h3 className="h4 text-slate-900">{nextRankProgress}%</h3>
              </div>
            </div>
            <div className="member-rank-bar">
              <div style={{ width: `${nextRankProgress}%` }} />
            </div>
            <div className="member-rank-footer">
              <span>Старт</span>
              <span>Следующий ранг <ChevronRight size={12}/></span>
            </div>
          </Card>
        );
      case 'rewards':
        return (
          <Card key={id} className="mb-8">
            <h3 className="member-card-title"><Trophy size={18} className="text-primary" /> Коллекция наград</h3>
            <div className="member-achievements-grid">
              {memberAchievements.length > 0 ? memberAchievements.map((ach) => (
                <div key={ach.id} className="member-achievement">
                  <div style={{ backgroundColor: ach.color || '#EEF2FF', color: ach.iconColor || 'var(--color-primary)' }}>
                    <Medal size={26} />
                  </div>
                  <span>{ach.title}</span>
                  <small>{ach.desc || 'Достижение клуба'}</small>
                </div>
              )) : (
                <div className="member-empty-inline">
                  <Trophy size={36} />
                  <p>Наград пока нет</p>
                </div>
              )}
            </div>
          </Card>
        );
      case 'quick_actions':
        return (
          <Card key={id} className="member-action-panel mb-8">
            <Link to="/schedule">
              <Calendar size={20} />
              <div>
                <strong>Расписание</strong>
                <span>{childSchedule.length || 1} занятий в неделю</span>
              </div>
              <ChevronRight size={16} />
            </Link>
            <button type="button">
              <CreditCard size={20} />
              <div>
                <strong>Оплата тарифа</strong>
                <span>{profileData.plan || 'Базовый тариф'}</span>
              </div>
              <ChevronRight size={16} />
            </button>
            <Link to="/league">
              <Shield size={20} />
              <div>
                <strong>Лига клуба</strong>
                <span>{points} рейтинговых очков</span>
              </div>
              <ChevronRight size={16} />
            </Link>
          </Card>
        );
      case 'club_events':
        return (
          <div key={id} className="mb-8">
            <EventCarousel isAdmin={false} />
          </div>
        );
      case 'attendance_chart':
        return (
          <Card key={id} className="mb-8">
            <h3 className="member-card-title"><BarChart3 size={18} className="text-primary" /> Посещаемость по месяцам</h3>
            <div className="flex items-end gap-3 h-32 px-4 mt-6">
              {[45, 70, 55, 90, 40, 85].map((val, i) => (
                <div key={i} className="flex-1 bg-slate-100 rounded-t-lg relative group">
                  <div 
                    style={{ height: `${val}%` }} 
                    className="bg-primary opacity-20 group-hover:opacity-100 transition-all rounded-t-lg"
                  />
                  <div className="absolute -bottom-6 left-0 right-0 text-[9px] text-center font-bold text-slate-400">М-{i+1}</div>
                </div>
              ))}
            </div>
          </Card>
        );
      case 'leaderboard_mini':
        return (
          <Card key={id} className="mb-8">
            <h3 className="member-card-title"><Users size={18} className="text-primary" /> Топ группы</h3>
            <div className="flex flex-col gap-3 mt-4">
              {members.slice(0, 3).map((m, i) => (
                <div key={m.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-black text-primary border shadow-sm">#{i+1}</div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-800">{m.firstName} {m.lastName}</p>
                    <p className="text-[10px] text-muted">{m.points || 0} XP</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <main id="main-content" tabIndex={-1} className="member-content member-profile-page">
      <section className="member-profile-hero">
        <div className="member-profile-hero__identity">
          <div className="member-profile-avatar">
            {profileData.avatar ? (
              <img src={profileData.avatar} alt="" />
            ) : (
              <User size={52} />
            )}
            <span><Zap size={18} fill="white" /></span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1>{profileData.firstName} {profileData.lastName}</h1>
              <Badge style={{ backgroundColor: 'rgba(255,255,255,0.18)', color: 'white', border: '1px solid rgba(255,255,255,0.25)' }}>
                LVL {level}
              </Badge>
            </div>
            <p>{group?.name || 'Индивидуально'} • {profileData.sport || 'Мультиспорт'}</p>
            <div className="member-profile-hero__chips">
              <span>{points} XP</span>
              <span>{profileData.plan || 'Базовый тариф'}</span>
              {isParent && <span>{children.length} ребёнка в клубе</span>}
            </div>
          </div>
        </div>

        <div className="member-profile-hero__summary" style={{ position: 'relative' }}>
          {!isCustomizing ? (
            <button 
              onClick={() => setIsCustomizing(true)}
              className="absolute -top-12 right-0 p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all border-none cursor-pointer flex items-center gap-2 text-xs font-bold"
            >
              <Settings size={16} /> Настроить дашборд
            </button>
          ) : (
            <button 
              onClick={() => setIsCustomizing(false)}
              className="absolute -top-12 right-0 p-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all border-none cursor-pointer flex items-center gap-2 text-xs font-bold shadow-lg"
            >
              <Save size={16} /> Сохранить
            </button>
          )}

          <div>
            <span>Посещаемость</span>
            <strong>{studentAttendance.length}</strong>
          </div>
          <div>
            <span>Расписание</span>
            <strong>{childSchedule.length || 1}</strong>
          </div>
          <div>
            <span>Ранг</span>
            <strong>{profileData.level || 'Новичок'}</strong>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-between border-b border-slate-100 mb-8 mx-auto px-4 md:px-0" style={{ maxWidth: '100%' }}>
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveTab('sports')} 
            className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all border-none bg-transparent cursor-pointer ${activeTab === 'sports' ? 'text-primary border-b-2 border-primary' : 'text-muted hover:text-slate-900'}`}
          >
            Спортивный паспорт
          </button>
          <button 
            onClick={() => setActiveTab('rpg')} 
            className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all border-none bg-transparent cursor-pointer ${activeTab === 'rpg' ? 'text-primary border-b-2 border-primary' : 'text-muted hover:text-slate-900'}`}
          >
            Геймификация
          </button>
        </div>

        {isCustomizing && (
          <div className="flex items-center gap-2 pb-4 text-primary animate-pulse">
            <Layout size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Режим настройки</span>
          </div>
        )}
      </section>

      <section className="member-profile-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 'var(--space-8)' }}>
        <div className="member-profile-main">
          {activeWidgets.map((widget, index) => {
            if (!widget.visible && !isCustomizing) return null;
            const catalogInfo = STUDENT_WIDGET_CATALOG.find(c => c.id === widget.id);
            
            return (
              <div key={widget.id} style={{ position: 'relative' }}>
                {isCustomizing && (
                  <div 
                    style={{ 
                      position: 'absolute', top: -10, left: -10, right: -10, bottom: 10, 
                      border: '2px dashed var(--color-primary)', borderRadius: '24px', 
                      zIndex: 20, pointerEvents: 'none', backgroundColor: 'rgba(49, 70, 166, 0.03)'
                    }}
                  />
                )}
                {isCustomizing && (
                  <div className="flex gap-2 mb-4" style={{ position: 'relative', zIndex: 30 }}>
                    <button 
                      onClick={() => handleToggleWidget(widget.id)}
                      className={`p-2 rounded-lg flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border-none cursor-pointer ${widget.visible ? 'bg-indigo-50 text-primary' : 'bg-slate-200 text-slate-500'}`}
                    >
                      {widget.visible ? <><Eye size={12} /> Виден</> : <><EyeOff size={12} /> Скрыт</>}
                    </button>
                    <button 
                      disabled={index === 0}
                      onClick={() => handleMoveWidget(widget.id, 'up')}
                      className="p-2 bg-white border border-slate-200 rounded-lg disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowUp size={12} />
                    </button>
                    <button 
                      disabled={index === activeWidgets.length - 1}
                      onClick={() => handleMoveWidget(widget.id, 'down')}
                      className="p-2 bg-white border border-slate-200 rounded-lg disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowDown size={12} />
                    </button>
                    <span className="ml-auto text-[10px] font-black text-slate-400 bg-slate-100 px-3 py-2 rounded-lg">
                      {catalogInfo?.label || widget.id}
                    </span>
                  </div>
                )}
                <div style={{ opacity: !widget.visible && isCustomizing ? 0.4 : 1 }}>
                  {renderWidget(widget.id)}
                </div>
              </div>
            );
          })}
        </div>

        <aside className="member-profile-side">
          <Card className="p-6 bg-primary text-white overflow-hidden relative group mb-8">
            <Sparkles size={120} className="absolute -right-8 -bottom-8 opacity-10 rotate-12 transition-transform group-hover:rotate-45" />
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-60">Мой статус</p>
              <h4 className="text-xl font-bold mb-4">Ученик месяца</h4>
              <p className="text-xs leading-relaxed opacity-80 mb-6">Вы входите в топ-5 клуба по посещаемости. Еще 2 занятия и вы получите секретное достижение!</p>
              <Button variant="secondary" size="sm" className="w-full bg-white text-primary border-none font-bold">Подробнее</Button>
            </div>
          </Card>
          
          <div className="sticky top-28">
             <Card className="mb-8">
                <h3 className="text-sm font-bold mb-4">Мои тренеры</h3>
                <div className="flex flex-col gap-4">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold">АК</div>
                      <div>
                        <p className="text-xs font-bold">А. Карелин</p>
                        <p className="text-[10px] text-muted">MMA · Pro Group</p>
                      </div>
                   </div>
                </div>
             </Card>
          </div>
        </aside>
      </section>
    </main>
  );
};
