import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Users, DollarSign, Calendar, Target, ArrowUpRight, Plus, Trophy, MessageSquare, TrendingUp, Activity, CheckCircle, AlertCircle, Info, ShoppingBag, Star, X, Sparkles, Flame, ShieldAlert, HeartPulse, Zap } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { EventCarousel } from '../../components/features/EventCarousel';
import { formatKzt } from '../../utils/money';
import { scheduleTypeLabel, coachLine, firstGrapheme } from '../../utils/displayStrings';

export const Dashboard = () => {
  const { 
    members, leads, schedule, finances, user, events, selectedLocationId, 
    achievements, monthlyAward, activities, markAttendance, groups, 
    removeActivity, sendFeedback, dashboardLayout 
  } = useAdmin();
  const isAdmin = user?.role === 'admin';
  const isCoach = user?.role === 'coach';
  const navigate = useNavigate();

  // Attendance state for Coach Dashboard
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [isAttendanceSuccess, setIsAttendanceSuccess] = useState(false);
  const [feedbackTarget, setFeedbackTarget] = useState(null);

  // Filter data by location
  const filteredMembers = selectedLocationId === 'all' ? members : members.filter(m => m.locationId === selectedLocationId);
  const filteredLeads = selectedLocationId === 'all' ? leads : leads.filter(l => l.locationId === selectedLocationId);
  const filteredSchedule = selectedLocationId === 'all' ? schedule : schedule.filter(s => s.locationId === selectedLocationId);

  // Filter schedule for coaches (only their classes)
  const coachSchedule = isCoach ? filteredSchedule.filter(s => s.coach === user.name) : filteredSchedule;

  const activeMembers = filteredMembers.length;
  const monthlyRevenue = Number(finances?.revenue) || 0; 
  const todayTrainings = coachSchedule.length || 0; 
  const newLeadsCount = filteredLeads.filter(l => l.status === 'new').length;

  const handleSelectAll = () => {
    if (!selectedClass) return;
    const classGroup = groups.find(g => g.name === selectedClass.groupName);
    const groupMemberIds = members.filter(m => m.groupId === classGroup?.id).map(m => m.id);
    setSelectedMemberIds(groupMemberIds.length > 0 ? groupMemberIds : members.map(m => m.id));
  };

  const handleMarkAttendance = () => {
    markAttendance(selectedClass.id, selectedMemberIds);
    setIsAttendanceSuccess(true);
    setTimeout(() => {
      setIsAttendanceSuccess(false);
      setSelectedClass(null);
      setSelectedMemberIds([]);
    }, 1500);
  };

  const toggleMemberSelection = (id) => {
    setSelectedMemberIds(prev => 
      prev.includes(id) ? prev.filter(mId => mId !== id) : [...prev, id]
    );
  };
  
  return (
    <div className="animate-fade-in pb-12">
      <div className="mb-6 flex flex-col gap-4 dashboard-hero">
        <div className="page-title-block page-title-block--in-hero">
          <h1 className="h1 mb-2" style={{ fontFamily: 'var(--font-family-display)', fontSize: 'clamp(1.5rem, 2.5vw, 2.25rem)' }}>
            {isAdmin ? 'Дашборд клуба' : `Привет, ${user?.name || 'Тренер'}!`}
          </h1>
          <p className="text-secondary font-medium">
            {isAdmin ? 'Обзор ключевых показателей работы вашего клуба' : 'Ваше расписание и прогресс учеников на сегодня'}
          </p>
        </div>
        <div className="desktop-only">
           <Badge variant="primary" style={{ padding: '8px 16px', borderRadius: '12px' }}>
             {new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
           </Badge>
        </div>
      </div>



      <div className="dashboard-dynamic-grid" style={{ marginTop: '16px' }}>
        {dashboardLayout.filter(w => w.visible).map((widget) => {
          switch (widget.id) {
            case 'stats':
              return (
                <div key="stats" className="dashboard-stat-grid admin-kpi-grid" style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '8px' }}>
                  <Card style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', minWidth: 0 }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '16px', backgroundColor: '#EEF2FF', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Users size={24} />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ color: 'var(--color-text-muted)', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Ученики</p>
                      <p style={{ fontSize: '1.25rem', fontWeight: 900, lineHeight: 1.1, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{activeMembers}</p>
                    </div>
                  </Card>

                  {isAdmin ? (
                    <Card style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', minWidth: 0 }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '16px', backgroundColor: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <DollarSign size={24} />
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Выручка (всего)</p>
                        <p style={{ fontSize: '1.25rem', fontWeight: 900, lineHeight: 1.1, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={formatKzt(monthlyRevenue)}>{formatKzt(monthlyRevenue)}</p>
                      </div>
                    </Card>
                  ) : (
                    <Card style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', minWidth: 0 }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '16px', backgroundColor: '#FFFBEB', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Star size={24} />
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Мой рейтинг</p>
                        <p style={{ fontSize: '1.25rem', fontWeight: 900, lineHeight: 1.1, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>4.9</p>
                      </div>
                    </Card>
                  )}

                  <Card style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', minWidth: 0 }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '16px', backgroundColor: '#FFFBEB', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Calendar size={24} />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ color: 'var(--color-text-muted)', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{isCoach ? 'В расписании' : 'Все тренировки'}</p>
                      <p style={{ fontSize: '1.25rem', fontWeight: 900, lineHeight: 1.1, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{todayTrainings}</p>
                    </div>
                  </Card>

                  {isAdmin && (
                    <Card style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', minWidth: 0 }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '16px', backgroundColor: '#FFF1F2', color: '#E11D48', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Target size={24} />
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Новые лиды</p>
                        <p style={{ fontSize: '1.25rem', fontWeight: 900, lineHeight: 1.1, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>+{newLeadsCount}</p>
                      </div>
                    </Card>
                  )}
                </div>
              );
            case 'schedule':
              return (
                <Card key="schedule" className="card-hover border-none shadow-xl shadow-slate-100 overflow-hidden" style={{ padding: 0, gridColumn: '1 / -1' }}>
                  <div className="p-8 flex justify-between items-center border-b border-slate-50">
                    <h3 className="h4">{isCoach ? 'Мои занятия на сегодня' : 'Расписание клуба'}</h3>
                    <button className="px-4 py-2 bg-indigo-50 text-primary text-xs font-bold rounded-xl hover:bg-indigo-100 transition-all border-none cursor-pointer" onClick={() => navigate('/admin/schedule')}>Открыть календарь</button>
                  </div>
                  <div className="p-0 overflow-x-auto">
                    {coachSchedule.length === 0 ? (
                      <div className="text-center py-12 px-4 text-slate-400 flex flex-col items-center justify-center min-h-[200px]">
                         <Calendar size={56} className="mx-auto mb-6 text-slate-300" />
                         <p className="font-bold text-lg text-slate-500">Нет запланированных тренировок</p>
                      </div>
                    ) : (
                      <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '400px', tableLayout: 'fixed' }}>
                        <thead style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                          <tr>
                            <th style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'left', fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', width: '15%' }}>Время</th>
                            <th style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'left', fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Группа / дисциплина</th>
                            <th style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'left', fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', width: '30%' }}>Тренер</th>
                          </tr>
                        </thead>
                        <tbody>
                          {coachSchedule.slice(0, 5).map((item) => {
                            const coach = coachLine(item);
                            return (
                            <tr key={item.id} onClick={() => isCoach ? setSelectedClass(item) : null} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background-color 0.2s', cursor: isCoach ? 'pointer' : 'default' }}>
                              <td style={{ padding: 'var(--space-4)', fontWeight: 'bold', fontSize: '0.875rem', color: 'var(--color-text-primary)', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>{item.time || '—'}</td>
                              <td style={{ padding: 'var(--space-4)', verticalAlign: 'middle' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                                   <div
                                     style={{ width: '6px', height: '40px', borderRadius: '9999px', flexShrink: 0, backgroundColor: (typeof item.color === 'string' && item.color.trim().charAt(0) === '#') ? item.color : 'var(--color-primary)' }}
                                     aria-hidden
                                   />
                                   <div style={{ minWidth: 0 }}>
                                     <p style={{ fontWeight: 'bold', fontSize: '0.875rem', color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{item.groupName || '—'}</p>
                                     <p style={{ fontSize: '0.65rem', fontWeight: 'bold', color: 'var(--color-text-secondary)', letterSpacing: '0.02em', margin: 0, marginTop: '2px' }}>{scheduleTypeLabel(item.type)}</p>
                                   </div>
                                </div>
                              </td>
                              <td style={{ padding: 'var(--space-4)', verticalAlign: 'middle' }}>
                                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--color-bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', color: 'var(--color-text-secondary)', flexShrink: 0 }}>
                                      {firstGrapheme(coach)}
                                    </div>
                                    <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={coach}>{coach}</span>
                                 </div>
                              </td>
                            </tr>
                          );})}
                        </tbody>
                      </table>
                    )}
                  </div>
                </Card>
              );
            case 'events':
              return <EventCarousel key="events" isAdmin={isAdmin} />;
            case 'autopilot':
              return (
                <Card key="autopilot" className="card-hover border-none shadow-xl shadow-slate-100 overflow-hidden relative" style={{ backgroundColor: '#0f172a', color: 'white' }}>
                  <div className="absolute top-[-20px] right-[-20px] opacity-10 rotate-12"><MessageSquare size={120} fill="white" /></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg"><Zap size={20} fill="currentColor" /></div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Smart Triggers</p>
                        <h4 className="font-bold">Автопилот TG</h4>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                         <span className="text-xs font-medium opacity-80">День рождения (XP)</span>
                         <Badge variant="success" className="text-[9px] bg-emerald-500/20 text-emerald-400 border-none">ACTIVE</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                         <span className="text-xs font-medium opacity-80">Продление абонемента</span>
                         <Badge variant="success" className="text-[9px] bg-emerald-500/20 text-emerald-400 border-none">ACTIVE</Badge>
                      </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-white/10">
                       <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider mb-2">Последний запуск</p>
                       <p className="text-xs font-medium opacity-60 italic">Система проверила {members.length} атлетов • Сегодня 09:00</p>
                    </div>
                  </div>
                </Card>
              );
            case 'quickActions':
              return (
                <Card key="quickActions" className="card-hover border-none shadow-xl shadow-slate-100" style={{ minHeight: '200px' }}>
                  <p className="text-[10px] font-black uppercase mb-5 text-muted tracking-widest">Быстрые действия</p>
                  <div className="flex flex-col gap-2">
                    {isAdmin && (
                      <button type="button" className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl hover:bg-indigo-50 transition-all border-none cursor-pointer group text-left" onClick={() => navigate('/admin/members/new')}>
                        <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary group-hover:scale-105 transition-transform flex-shrink-0"><Plus size={18}/></div>
                        <span className="text-sm font-bold text-slate-800">Зачислить ученика</span>
                      </button>
                    )}
                    {isCoach && (
                      <button type="button" className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl hover:bg-indigo-50 transition-all border-none cursor-pointer group text-left" onClick={() => navigate('/admin/schedule')}>
                        <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary group-hover:scale-105 transition-transform flex-shrink-0"><Calendar size={18}/></div>
                        <span className="text-sm font-bold text-slate-800">Календарь и занятия</span>
                      </button>
                    )}
                    <button type="button" className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl hover:bg-amber-50 transition-all border-none cursor-pointer group text-left" onClick={() => navigate('/admin/shop')}>
                      <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center text-amber-600 group-hover:scale-105 transition-transform flex-shrink-0"><ShoppingBag size={18}/></div>
                      <span className="text-sm font-bold text-slate-800">Магазин клуба</span>
                    </button>
                    <button type="button" className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl hover:bg-emerald-50 transition-all border-none cursor-pointer group text-left" onClick={() => navigate('/admin/league')}>
                      <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform flex-shrink-0"><Trophy size={18}/></div>
                      <span className="text-sm font-bold text-slate-800">Лига и рейтинг</span>
                    </button>
                  </div>
                </Card>
              );
            case 'activity':
              return (
                <Card key="activity" className="card-hover border-none shadow-xl shadow-slate-100" style={{ padding: 0 }}>
                  <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                    <h3 className="font-bold">Живая лента событий</h3>
                    <div className="p-2 bg-indigo-50 text-primary rounded-lg"><Activity size={18} /></div>
                  </div>
                  <div className="p-4 flex flex-col gap-1 max-h-[400px] overflow-y-auto scrollbar-hide">
                     {activities.length === 0 ? (
                       <div className="py-12 text-center">
                          <MessageSquare size={48} className="mx-auto mb-4 text-slate-100" />
                          <p className="text-slate-400 text-sm font-medium">Событий пока нет</p>
                       </div>
                     ) : activities.slice(0, 4).map((act) => (
                       <div key={act.id} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all border-b border-slate-50 last:border-0 group relative">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            act.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 
                            act.type === 'warning' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-primary'
                          }`}>
                             {act.type === 'success' ? <CheckCircle size={18} /> : 
                              act.type === 'warning' ? <AlertCircle size={18} /> : <Info size={18} />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-slate-800 leading-snug">{act.text}</p>
                            <p className="text-[10px] font-medium text-slate-400 mt-1">
                              {new Date(act.date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })} • Сегодня
                            </p>
                          </div>
                          <button 
                            onClick={() => removeActivity(act.id)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-white rounded-lg transition-all border-none bg-transparent cursor-pointer text-slate-400 hover:text-rose-500 shadow-sm"
                            title="Удалить из ленты"
                          >
                            <X size={14} />
                          </button>
                       </div>
                     ))}
                  </div>
                </Card>
              );
            case 'achievements':
              return (
                <Card key="achievements" className="card-hover border-none shadow-xl shadow-slate-100" style={{ minWidth: 0, overflow: 'hidden' }}>
                  <div className="flex justify-between items-center mb-8">
                     <h3 className="text-[10px] font-black uppercase text-muted tracking-widest">Достижения клуба</h3>
                     {isAdmin && <button onClick={() => navigate('/admin/league')} className="p-2 hover:bg-slate-50 rounded-lg transition-all border-none bg-transparent cursor-pointer text-primary"><Plus size={16}/></button>}
                  </div>
                  <div className="flex flex-col gap-4">
                     {achievements.slice(0, 3).map((ach, i) => {
                       const IconComponent = ach.icon === 'Target' ? Target : ach.icon === 'TrendingUp' ? TrendingUp : Trophy;
                       return (
                        <div key={ach.id || i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:translate-x-1 transition-all cursor-pointer">
                            <div style={{ backgroundColor: ach.color, color: ach.iconColor }} className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm shrink-0">
                              <IconComponent size={20} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 line-clamp-1">{ach.title}</p>
                              <p className="text-[11px] text-slate-500 font-medium line-clamp-1">{ach.desc}</p>
                            </div>
                        </div>
                       );
                     })}
                     {achievements.length === 0 && (
                       <p className="text-xs text-slate-400 italic text-center py-4">Достижения пока не добавлены</p>
                     )}
                  </div>
                </Card>
              );
            case 'monthlyAward':
              return (
                <Card
                  key="monthlyAward"
                  className="shadow-2xl shadow-indigo-200"
                  style={{
                    minWidth: 0,
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: '32px',
                  }}
                >
                  <div style={{ position: 'absolute', top: -20, right: -20, opacity: 0.15, pointerEvents: 'none' }}>
                    <Trophy size={140} />
                  </div>
                  <div className="p-3 rounded-2xl w-fit mb-6 border" style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.15)' }}><Trophy size={24}/></div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-80">Награда месяца</p>
                  <h4 className="text-2xl font-black mb-2 pr-2" style={{ fontFamily: 'var(--font-family-display)', wordBreak: 'break-word' }}>{monthlyAward.title || 'Главный кубок'}</h4>
                  <p className="text-sm mb-6 opacity-90 leading-relaxed font-medium" style={{ wordBreak: 'break-word' }}>{monthlyAward.description || 'По итогам посещаемости и активности в лиге.'}</p>
                  <div className="p-4 rounded-2xl flex items-center justify-between gap-2" style={{ backgroundColor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.12)' }}>
                    <span className="text-[11px] font-black uppercase tracking-widest flex-shrink-0">До финала:</span>
                    <span className="text-xl font-black flex-shrink-0">{monthlyAward.daysLeft != null ? monthlyAward.daysLeft : 0} дн.</span>
                  </div>
                </Card>
              );
            default:
              return null;
          }
        })}
      </div>

      {selectedClass && isCoach && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)' }}>
          <Card className="animate-up" style={{ width: '100%', maxWidth: '540px', padding: 0, overflow: 'hidden', borderRadius: '32px', border: '1px solid var(--color-primary)' }}>
            {isAttendanceSuccess ? (
              <div style={{ padding: '80px 40px', textAlign: 'center' }} className="animate-fade-in">
                <div style={{ width: 100, height: 100, backgroundColor: 'var(--color-success)', color: 'white', borderRadius: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px' }}><CheckCircle size={64} /></div>
                <h3 className="h3 mb-2">Тренировка завершена!</h3>
                <p className="text-secondary font-medium">Статистика обновлена, опыт ученикам начислен.</p>
              </div>
            ) : (
              <>
                <div style={{ padding: 'clamp(20px, 5vw, 40px)', backgroundColor: selectedClass.color || 'var(--color-primary)', color: 'white', position: 'relative' }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest inline-block mb-4">Детали занятия</div>
                      <h3 className="h3 mb-2" style={{ color: 'white' }}>{selectedClass.groupName}</h3>
                      <div className="flex items-center gap-4 text-sm font-medium opacity-90">
                         <div className="flex items-center gap-2"><Calendar size={16} /> {selectedClass.time} ({selectedClass.duration || 60} мин)</div>
                      </div>
                    </div>
                    <button onClick={() => setSelectedClass(null)} className="touch-target bg-white/20 hover:bg-white/30 rounded-2xl border-none text-white cursor-pointer transition-all"><AlertCircle size={20} className="rotate-45" /></button>
                  </div>
                </div>
                <div style={{ padding: 'clamp(20px, 5vw, 40px)' }}>
                  <div className="flex justify-between items-center mb-8 gap-4">
                    <div>
                       <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Чек-ин</p>
                       <p className="text-sm font-bold text-slate-800">Кто присутствует?</p>
                    </div>
                    <button onClick={handleSelectAll} className="px-4 py-2 bg-indigo-50 text-primary text-xs font-bold rounded-xl hover:bg-indigo-100 transition-all border-none cursor-pointer flex-shrink-0">Выбрать всех</button>
                  </div>
                  <div style={{ maxHeight: 'min(400px, 50vh)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px', paddingRight: '4px' }} className="custom-scrollbar scrollbar-hide">
                    {members.map(member => (
                      <div key={member.id} onClick={() => toggleMemberSelection(member.id)} className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${selectedMemberIds.includes(member.id) ? 'border-primary bg-indigo-50/50' : 'border-slate-100 hover:border-slate-200 bg-white'}`}>
                        <div className="flex items-center gap-4 min-w-0">
                          <div style={{ width: 40, height: 40, borderRadius: '12px', backgroundColor: selectedMemberIds.includes(member.id) ? 'var(--color-primary)' : 'var(--color-bg)', color: selectedMemberIds.includes(member.id) ? 'white' : 'var(--color-text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '13px', flexShrink: 0 }}>
                            {member.firstName.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-sm text-slate-900 truncate">{member.firstName} {member.lastName}</p>
                              {member.medicalNotes && (
                                <div 
                                  onClick={(e) => { e.stopPropagation(); alert(`Медицинская заметка: ${member.medicalNotes}`); }}
                                  className="flex items-center justify-center w-5 h-5 bg-rose-50 text-rose-500 rounded-full cursor-help"
                                  title={member.medicalNotes}
                                >
                                  <HeartPulse size={12} />
                                </div>
                              )}
                            </div>
                            <p className="text-[10px] font-bold text-muted uppercase tracking-wider truncate">{groups.find(g => g.id === member.groupId)?.name || 'Индивидуально'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                           <button 
                             onClick={(e) => { e.stopPropagation(); setFeedbackTarget(member); }}
                             className="p-2 hover:bg-amber-50 text-amber-500 rounded-xl border-none bg-transparent cursor-pointer transition-all"
                             title="Похвалить"
                           >
                             <Star size={18} />
                           </button>
                           <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${selectedMemberIds.includes(member.id) ? 'bg-primary border-primary text-white' : 'border-slate-200'}`}>
                              {selectedMemberIds.includes(member.id) && <CheckCircle size={14} />}
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
      {feedbackTarget && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 110, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <Card className="animate-up" style={{ width: '100%', maxWidth: '400px', borderRadius: '32px' }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="h4">Похвалить {feedbackTarget.firstName}</h3>
              <button onClick={() => setFeedbackTarget(null)} className="p-2 hover:bg-slate-100 rounded-full border-none bg-transparent cursor-pointer"><X size={20}/></button>
            </div>
            <p className="text-secondary text-sm mb-8 font-medium">Выберите тип награды, которая отобразится в ленте и принесет ученику +20 XP.</p>
            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={() => { sendFeedback(feedbackTarget.id, 'fire', 'Проявил невероятную волю и энергию!'); setFeedbackTarget(null); }}
                className="flex items-center gap-4 p-4 bg-orange-50 hover:bg-orange-100 rounded-2xl border-none cursor-pointer transition-all text-left"
              >
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-orange-500 shadow-sm"><Flame size={24} /></div>
                <div>
                  <p className="font-bold text-slate-900">Огонь на тренировке</p>
                  <p className="text-xs text-orange-600 font-medium">За волю и энергию</p>
                </div>
              </button>
              <button 
                onClick={() => { sendFeedback(feedbackTarget.id, 'discipline', 'Образцовое выполнение всех указаний тренера.'); setFeedbackTarget(null); }}
                className="flex items-center gap-4 p-4 bg-emerald-50 hover:bg-emerald-100 rounded-2xl border-none cursor-pointer transition-all text-left"
              >
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm"><ShieldAlert size={24} /></div>
                <div>
                  <p className="font-bold text-slate-900">Дисциплина</p>
                  <p className="text-xs text-emerald-600 font-medium">За порядок и внимание</p>
                </div>
              </button>
              <button 
                onClick={() => { sendFeedback(feedbackTarget.id, 'technique', 'Великолепное исполнение приемов и техники.'); setFeedbackTarget(null); }}
                className="flex items-center gap-4 p-4 bg-indigo-50 hover:bg-indigo-100 rounded-2xl border-none cursor-pointer transition-all text-left"
              >
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm"><Target size={24} /></div>
                <div>
                  <p className="font-bold text-slate-900">Техника</p>
                  <p className="text-xs text-indigo-600 font-medium">За точность движений</p>
                </div>
              </button>
            </div>
          </Card>
        </div>
      )}
                  <button onClick={handleMarkAttendance} disabled={selectedMemberIds.length === 0} className="w-full h-14 bg-primary text-white rounded-2xl font-bold disabled:opacity-50 transition-all hover:opacity-90 cursor-pointer border-none text-base shadow-lg shadow-primary/20">
                    Отметить посещаемость
                  </button>
                </div>
              </>
            )}
          </Card>
        </div>
      )}

      <style>{`
        @media (min-width: 640px) {
          .dashboard-hero { flex-direction: row; align-items: flex-end; justify-content: space-between; }
        }
        .dashboard-dynamic-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 24px;
          align-items: stretch;
        }
        @media (max-width: 1024px) {
          .dashboard-dynamic-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
