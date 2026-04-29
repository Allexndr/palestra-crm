import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Users, DollarSign, Calendar, Target, ArrowUpRight, Plus, Trophy, MessageSquare, TrendingUp, Activity, CheckCircle, AlertCircle, Info, ShoppingBag, Star } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { EventCarousel } from '../../components/features/EventCarousel';
import { formatKzt } from '../../utils/money';
import { scheduleTypeLabel, coachLine, firstGrapheme } from '../../utils/displayStrings';

export const Dashboard = () => {
  const { members, leads, schedule, finances, user, events, selectedLocationId, achievements, monthlyAward, activities, markAttendance, groups, removeActivity } = useAdmin();
  const isAdmin = user?.role === 'admin';
  const isCoach = user?.role === 'coach';
  const navigate = useNavigate();

  // Attendance state for Coach Dashboard
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [isAttendanceSuccess, setIsAttendanceSuccess] = useState(false);

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
      <div className="mb-12 flex flex-col gap-4 dashboard-hero">
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

      <div className="dashboard-stat-grid admin-kpi-grid">
        <Card className="flex items-center gap-4 card-hover shadow-slate-100 border-none" style={{ padding: 'var(--space-4) var(--space-6)' }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-indigo-50 text-primary" style={{ flexShrink: 0 }}>
            <Users size={24} />
          </div>
          <div>
            <p className="text-muted text-[10px] font-black uppercase tracking-widest mb-1">Ученики</p>
            <p className="text-xl font-black text-slate-900 leading-tight">{activeMembers}</p>
          </div>
        </Card>

        {isAdmin ? (
          <Card className="flex items-center gap-4 card-hover shadow-slate-100 border-none" style={{ padding: 'var(--space-4) var(--space-6)' }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-emerald-50 text-emerald-600" style={{ flexShrink: 0 }}>
              <DollarSign size={24} />
            </div>
            <div style={{ minWidth: 0 }}>
              <p className="text-muted text-[10px] font-black uppercase tracking-widest mb-1">Выручка (всего)</p>
              <p className="text-xl font-black text-slate-900 leading-tight" title={formatKzt(monthlyRevenue)}>{formatKzt(monthlyRevenue)}</p>
            </div>
          </Card>
        ) : (
          <Card className="flex items-center gap-4 card-hover shadow-slate-100 border-none" style={{ padding: 'var(--space-4) var(--space-6)' }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-amber-50 text-amber-600" style={{ flexShrink: 0 }}>
              <Star size={24} />
            </div>
            <div>
              <p className="text-muted text-[10px] font-black uppercase tracking-widest mb-1">Мой рейтинг</p>
              <p className="text-xl font-black text-slate-900 leading-tight">4.9</p>
            </div>
          </Card>
        )}

        <Card className="flex items-center gap-4 card-hover shadow-slate-100 border-none" style={{ padding: 'var(--space-4) var(--space-6)' }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-amber-50 text-amber-600" style={{ flexShrink: 0 }}>
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-muted text-[10px] font-black uppercase tracking-widest mb-1">{isCoach ? 'В расписании' : 'Все тренировки'}</p>
            <p className="text-xl font-black text-slate-900 leading-tight">{todayTrainings}</p>
          </div>
        </Card>

        {isAdmin && (
          <Card className="flex items-center gap-4 card-hover shadow-slate-100 border-none" style={{ padding: 'var(--space-4) var(--space-6)' }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-rose-50 text-rose-600" style={{ flexShrink: 0 }}>
              <Target size={24} />
            </div>
            <div>
              <p className="text-muted text-[10px] font-black uppercase tracking-widest mb-1">Новые лиды</p>
              <p className="text-xl font-black text-slate-900 leading-tight">+{newLeadsCount}</p>
            </div>
          </Card>
        )}
      </div>

      <div className="responsive-grid admin-dashboard-main" style={{ marginTop: '32px' }}>
        <div className="flex flex-col gap-8 min-w-0">
          <Card className="card-hover border-none shadow-xl shadow-slate-100 overflow-hidden" style={{ padding: 0 }}>
            <div className="p-8 flex justify-between items-center border-b border-slate-50">
              <h3 className="h4">{isCoach ? 'Мои занятия на сегодня' : 'Расписание клуба'}</h3>
              <button className="px-4 py-2 bg-indigo-50 text-primary text-xs font-bold rounded-xl hover:bg-indigo-100 transition-all border-none cursor-pointer" onClick={() => navigate('/admin/schedule')}>Открыть календарь</button>
            </div>
            <div className="p-0 overflow-x-auto">
              {coachSchedule.length === 0 ? (
                <div className="text-center py-24 px-4 text-slate-400 flex flex-col items-center justify-center min-h-[250px]">
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

          <div className="admin-card-grid">
             <EventCarousel isAdmin={isAdmin} />

             <Card className="card-hover border-none shadow-xl shadow-slate-100" style={{ minHeight: '200px' }}>
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
          </div>
        </div>

        <div className="flex flex-col gap-8 min-w-0">
          <Card className="card-hover border-none shadow-xl shadow-slate-100" style={{ padding: 0 }}>
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

          <Card className="card-hover border-none shadow-xl shadow-slate-100" style={{ minWidth: 0, overflow: 'hidden' }}>
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

          <Card
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
        </div>
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
                            <p className="font-bold text-sm text-slate-900 truncate">{member.firstName} {member.lastName}</p>
                            <p className="text-[10px] font-bold text-muted uppercase tracking-wider truncate">{groups.find(g => g.id === member.groupId)?.name || 'Индивидуально'}</p>
                          </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${selectedMemberIds.includes(member.id) ? 'bg-primary border-primary text-white' : 'border-slate-200'}`}>
                           {selectedMemberIds.includes(member.id) && <CheckCircle size={14} />}
                        </div>
                      </div>
                    ))}
                  </div>
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
        .responsive-grid.admin-dashboard-main {
          display: grid;
          grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
          gap: 24px;
          align-items: start;
        }
        @media (max-width: 1024px) {
          .responsive-grid.admin-dashboard-main {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
