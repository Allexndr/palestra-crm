import React, { useState } from 'react';
import { useMatch } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Plus, ChevronLeft, ChevronRight, Clock, User, X, CheckCircle2, Edit2, Trash2, Zap, Search } from 'lucide-react';

const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

function sessionOnDay(session, day) {
  if (session.day) return session.day === day;
  if (Array.isArray(session.days)) return session.days.includes(day);
  return false;
}

export const Schedule = () => {
  const { schedule, addScheduleItem, updateScheduleItem, removeScheduleItem, members, markAttendance, user, selectedLocationId, groups, sports, coaches, activeChildId } = useAdmin();
  const isAdmin = user?.role === 'admin';
  const isCoach = user?.role === 'coach';
  const isParent = user?.role === 'parent';
  const isStudent = user?.role === 'student';
  const memberView = useMatch({ path: '/schedule', end: true }) != null;
  const currentCoach = coaches.find(c => c.name === user?.name || c.email === user?.email);
  const myGroupIds = groups.filter(g => g.coachId === currentCoach?.id).map(g => g.id);
  const myGroupNames = groups.filter(g => g.coachId === currentCoach?.id).map(g => g.name);
  const canTakeAttendance = (isAdmin || isCoach) && !memberView;

  // Filters state
  const [filterSport, setFilterSport] = useState('all');
  const [filterCoach, setFilterCoach] = useState('all');
  const [calendarSearch, setCalendarSearch] = useState('');

  const filteredSchedule = schedule.filter(s => {
    const locMatch = selectedLocationId === 'all' || s.locationId === selectedLocationId;
    const sportMatch = filterSport === 'all' || s.type === filterSport;
    const coachMatch = filterCoach === 'all' || s.coach === filterCoach;
    const searchMatch = !calendarSearch || 
      s.groupName.toLowerCase().includes(calendarSearch.toLowerCase()) ||
      (s.coach && s.coach.toLowerCase().includes(calendarSearch.toLowerCase()));
    
    if (isCoach) {
      // Coach only sees their own schedule (by coach name match or by group name match)
      const isMyClass = s.coach === user?.name || myGroupNames.includes(s.groupName);
      return locMatch && sportMatch && coachMatch && searchMatch && isMyClass;
    }
    
    if (memberView) {
      let targetMember = null;
      if (isParent && activeChildId) {
        targetMember = members.find(m => m.id === activeChildId);
      } else if (isStudent) {
        targetMember = members.find(m => m.id === user?.id || m.login === user?.login);
      }
      
      if (targetMember && targetMember.groupId) {
        const group = groups.find(g => g.id === targetMember.groupId);
        if (group && s.groupName !== group.name) {
          return false; // Filter out classes that don't belong to the member's group
        }
      }
    }
    
    return locMatch && sportMatch && coachMatch && searchMatch;
  });

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ 
    time: '10:00', 
    duration: 60,
    groupName: '', 
    coach: '', 
    day: 'Пн', 
    type: 'boxing',
    color: '#4338ca',
    locationId: selectedLocationId === 'all' ? '1' : selectedLocationId
  });
  
  // Attendance State
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [isAttendanceSuccess, setIsAttendanceSuccess] = useState(false);

  // Dynamic Time Range
  const getEarliestTime = () => {
    if (filteredSchedule.length === 0) return 8; // Default 8 AM
    const hours = filteredSchedule.map(s => parseInt(s.time.split(':')[0]));
    const min = Math.min(...hours);
    return min < 8 ? 6 : 8; // If events at 7 or 6, start at 6 AM. Else 8 AM.
  };

  const startHour = getEarliestTime();
  const endHour = 22;
  const timeBlocks = [];
  for (let h = startHour; h < endHour; h++) {
    timeBlocks.push(`${h.toString().padStart(2, '0')}:00`);
    timeBlocks.push(`${h.toString().padStart(2, '0')}:30`);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.time || !formData.groupName) return;
    
    if (editingId) {
      updateScheduleItem(editingId, formData);
    } else {
      addScheduleItem(formData);
    }
    
    setFormData({ 
      time: '10:00', 
      duration: 60,
      groupName: '', 
      coach: '', 
      day: 'Пн', 
      type: 'boxing',
      color: '#4338ca',
      locationId: selectedLocationId === 'all' ? '1' : selectedLocationId
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleEditClass = (session) => {
    setFormData({ ...session, duration: session.duration || 60 });
    setEditingId(session.id);
    setIsAdding(true);
    setSelectedClass(null);
  };

  const handleRemoveClass = (id) => {
    if (window.confirm('Удалить эту тренировку из расписания?')) {
      removeScheduleItem(id);
      setSelectedClass(null);
    }
  };

  const handleSelectAll = () => {
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

  const [weekOffset, setWeekOffset] = useState(0);

  // Calculate dates for current week
  const getWeekDates = () => {
    const start = new Date();
    start.setDate(start.getDate() + (weekOffset * 7));
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(start.setDate(diff));
    
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  };

  const weekDates = getWeekDates();

  const getSessionStyle = (session) => {
    const [h, m] = session.time.split(':').map(Number);
    const startMinutes = (h - startHour) * 60 + m;
    const duration = session.duration || 60;
    
    return {
      top: `${(startMinutes / 30) * 60}px`, // 60px height per 30 mins
      height: `${(duration / 30) * 60 - 4}px`, // -4 for spacing
      backgroundColor: session.color || 'var(--color-primary)',
      zIndex: 10
    };
  };

  return (
    <div className="animate-fade-in pb-12">
      <div className="admin-page-header">
        <div className="page-title-block page-title-block--row" style={{ flex: 1 }}>
          <div className="flex flex-wrap items-center gap-6 mb-4">
            <h1 className="h2 mb-0">Расписание</h1>
            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl shadow-inner border border-slate-200">
              <button onClick={() => setWeekOffset(prev => prev - 1)} className="p-1.5 hover:bg-white rounded-xl transition-all border-none bg-transparent cursor-pointer shadow-sm"><ChevronLeft size={18}/></button>
              <span className="text-xs font-bold px-4">
                {weekDates[0].toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} - {weekDates[6].toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
              </span>
              <button onClick={() => setWeekOffset(prev => prev + 1)} className="p-1.5 hover:bg-white rounded-xl transition-all border-none bg-transparent cursor-pointer shadow-sm"><ChevronRight size={18}/></button>
            </div>
            <div className="relative group flex-1 max-w-md">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Поиск по группе или тренеру..." 
                value={calendarSearch}
                onChange={(e) => setCalendarSearch(e.target.value)}
                className="w-full bg-white border border-slate-200 pl-11 pr-4 py-2.5 rounded-2xl text-sm font-medium outline-none focus:border-primary focus:shadow-lg focus:shadow-primary/5 transition-all"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-6 items-center">
             <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Дисциплина</span>
                <select className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-primary shadow-sm outline-none" value={filterSport} onChange={e => setFilterSport(e.target.value)}>
                   <option value="all">Все дисциплины</option>
                   {sports.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
             </div>
             <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Тренер</span>
                <select className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-primary shadow-sm outline-none" value={filterCoach} onChange={e => setFilterCoach(e.target.value)}>
                   <option value="all">Все тренеры</option>
                   {[...new Set(schedule.map(s => s.coach))].filter(Boolean).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
             </div>
          </div>
        </div>
        <div className="admin-page-actions">
          {isAdmin && (
            <Button variant="primary" onClick={() => { setIsAdding(!isAdding); setEditingId(null); }} style={{ gap: '10px', padding: '12px 24px', borderRadius: '16px' }}>
              <Plus size={20} /> Запланировать занятие
            </Button>
          )}
        </div>
      </div>

      {isAdding && isAdmin && (
        <Card className="mb-12 animate-up" style={{ border: '1px solid var(--color-primary-soft)', boxShadow: '0 20px 40px rgba(99, 102, 241, 0.05)', borderRadius: '32px', overflow: 'hidden', padding: 0 }}>
          <div style={{ backgroundColor: 'var(--color-primary-soft)', padding: '24px 40px', borderBottom: '1px solid var(--color-primary-soft)' }}>
             <h4 className="h4 mb-0 flex items-center gap-3">
               <div style={{ padding: '8px', backgroundColor: 'white', borderRadius: '10px', color: 'var(--color-primary)' }}>
                 <Plus size={20} />
               </div>
               {editingId ? 'Редактировать тренировку' : 'Новое занятие в расписании'}
             </h4>
          </div>
          <form onSubmit={handleSubmit} style={{ padding: '40px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '32px' }}>
              <div className="input-group">
                <label className="input-label">День недели</label>
                <select className="input-field" value={formData.day} onChange={e => setFormData({...formData, day: e.target.value})}>
                  {DAYS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <Input label="Время начала" type="time" required value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
              <div className="input-group">
                <label className="input-label">Длительность</label>
                <select className="input-field" value={formData.duration} onChange={e => setFormData({...formData, duration: parseInt(e.target.value)})}>
                  {[30, 45, 60, 75, 90, 120, 150, 180].map(m => <option key={m} value={m}>{m} минут</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Филиал / Зал</label>
                <select className="input-field" value={formData.locationId} onChange={e => setFormData({...formData, locationId: e.target.value})}>
                  <option value="1">Главный зал</option>
                  <option value="2">Малый зал</option>
                  <option value="3">РИНГ</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
              <Input label="Название группы" placeholder="Напр: Boxing PRO (Вечер)" required value={formData.groupName} onChange={e => setFormData({...formData, groupName: e.target.value})} />
              <Input label="Тренер" placeholder="А. Карелин" value={formData.coach} onChange={e => setFormData({...formData, coach: e.target.value})} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', marginBottom: '32px' }}>
              <div className="input-group">
                <label className="input-label">Цветовая метка</label>
                <div className="flex flex-wrap gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 w-fit">
                  {['#4338ca', '#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#ec4899', '#8b5cf6'].map(c => (
                    <div 
                      key={c} 
                      onClick={() => setFormData({...formData, color: c})}
                      style={{ 
                        width: 36, height: 36, borderRadius: '12px', backgroundColor: c, 
                        cursor: 'pointer', border: formData.color === c ? '3px solid white' : 'none',
                        boxShadow: formData.color === c ? '0 0 0 2px ' + c : 'none',
                        transition: 'all 0.2s',
                        transform: formData.color === c ? 'scale(1.1)' : 'scale(1)'
                      }} 
                    />
                  ))}
                  
                  {/* Custom Color Picker */}
                  <div style={{ position: 'relative', width: 36, height: 36 }}>
                    <div 
                      style={{ 
                        width: '100%', height: '100%', borderRadius: '12px', 
                        background: 'linear-gradient(45deg, #f06, #f90, #0f9, #09f, #60f)',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: !['#4338ca', '#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#ec4899', '#8b5cf6'].includes(formData.color) ? '3px solid white' : 'none',
                        boxShadow: !['#4338ca', '#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#ec4899', '#8b5cf6'].includes(formData.color) ? '0 0 0 2px var(--color-primary)' : 'none',
                      }}
                    >
                      <Zap size={16} color="white" />
                    </div>
                    <input 
                      type="color" 
                      value={formData.color}
                      onChange={(e) => setFormData({...formData, color: e.target.value})}
                      style={{ 
                        position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' 
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
               <Button variant="ghost" type="button" onClick={() => { setIsAdding(false); setEditingId(null); }} style={{ borderRadius: '16px' }}>Отмена</Button>
               <Button variant="primary" type="submit" style={{ padding: '16px 40px', borderRadius: '16px', fontSize: '1rem', boxShadow: 'var(--shadow-primary)' }}>
                 {editingId ? 'Сохранить изменения' : 'Добавить в расписание'}
               </Button>
            </div>
          </form>
        </Card>
      )}

      <Card style={{ padding: 0, overflow: 'auto', borderRadius: '32px', border: '1px solid var(--color-border)' }} className="shadow-2xl">
        <div style={{ minWidth: '1000px', position: 'relative' }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '120px repeat(7, 1fr)', backgroundColor: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, zIndex: 50 }}>
            <div style={{ padding: 'var(--space-4)', borderRight: '1px solid var(--color-border)', backgroundColor: '#F8FAFC' }}></div>
            {weekDates.map((date, idx) => (
              <div key={idx} style={{ padding: '24px 16px', textAlign: 'center', borderRight: '1px solid var(--color-border)', backgroundColor: date.toDateString() === new Date().toDateString() ? 'var(--color-primary-soft)' : 'transparent' }}>
                <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">{DAYS[idx]}</p>
                <p className={`text-xl font-bold ${date.toDateString() === new Date().toDateString() ? 'text-primary' : ''}`}>{date.getDate()}</p>
              </div>
            ))}
          </div>

          {/* Grid */}
          <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '120px repeat(7, 1fr)' }}>
            {/* Time Column */}
            <div style={{ backgroundColor: '#F8FAFC', borderRight: '1px solid var(--color-border)' }}>
              {timeBlocks.map((time, i) => (
                <div key={i} style={{ height: '60px', padding: '12px 16px', textAlign: 'right', borderBottom: i % 2 === 1 ? '1px solid var(--color-border)' : '1px dashed var(--color-border-soft)' }}>
                  {time.endsWith(':00') && <span className="text-[11px] font-black text-slate-400">{time}</span>}
                </div>
              ))}
            </div>

            {/* Day Columns */}
            {DAYS.map((day, dayIdx) => (
              <div key={day} style={{ position: 'relative', borderRight: '1px solid var(--color-border)' }}>
                {/* Horizontal grid lines */}
                {timeBlocks.map((_, i) => (
                  <div key={i} style={{ height: '60px', borderBottom: i % 2 === 1 ? '1px solid var(--color-border)' : '1px dashed var(--color-border-soft)' }} />
                ))}

                {/* Sessions Overlay */}
                {filteredSchedule
                  .filter((s) => sessionOnDay(s, day))
                  .map(session => (
                    <div 
                      key={session.id}
                      onClick={() => setSelectedClass(session)}
                      className="absolute left-1 right-1 p-3 rounded-2xl text-white shadow-xl cursor-pointer transition-all hover:scale-[1.02] hover:z-[20] overflow-hidden group"
                      style={getSessionStyle(session)}
                    >
                      <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition-opacity">
                         <Zap size={14} fill="white" />
                      </div>
                      <p className="font-bold text-xs mb-1 line-clamp-1">{session.groupName}</p>
                      <div className="flex items-center gap-1.5 opacity-80 text-[10px] font-bold uppercase tracking-wider">
                        <Clock size={10} /> {session.time}
                      </div>
                      <div className="flex items-center gap-1.5 mt-2 opacity-90 text-[10px] font-bold">
                        <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
                           <User size={8} />
                        </div>
                        {session.coach}
                      </div>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </div>
      </Card>
      
      {/* Attendance Modal */}
      {selectedClass && (
        <div style={{ 
          position: 'fixed', inset: 0, zIndex: 100, 
          backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)'
        }}>
          <Card className="animate-up" style={{ width: '100%', maxWidth: '540px', padding: 0, overflow: 'hidden', borderRadius: '32px', border: '1px solid var(--color-primary)' }}>
            {isAttendanceSuccess ? (
              <div style={{ padding: '80px 40px', textAlign: 'center' }} className="animate-fade-in">
                <div style={{ width: 100, height: 100, backgroundColor: 'var(--color-success)', color: 'white', borderRadius: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px' }}>
                   <CheckCircle2 size={64} />
                </div>
                <h3 className="h3 mb-2">Тренировка завершена!</h3>
                <p className="text-secondary font-medium">Статистика обновлена, опыт ученикам начислен.</p>
              </div>
            ) : (
              <>
                <div style={{ padding: '40px', backgroundColor: selectedClass.color || 'var(--color-primary)', color: 'white', position: 'relative' }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest inline-block mb-4">Детали занятия</div>
                      <h3 className="h2 mb-2" style={{ color: 'white' }}>{selectedClass.groupName}</h3>
                      <div className="flex items-center gap-4 text-sm font-medium opacity-90">
                         <div className="flex items-center gap-2"><Clock size={16} /> {selectedClass.time} ({selectedClass.duration || 60} мин)</div>
                         <div className="flex items-center gap-2"><User size={16} /> {selectedClass.coach}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {isAdmin && (
                        <>
                          <button onClick={() => handleEditClass(selectedClass)} className="p-3 bg-white/20 hover:bg-white/30 rounded-2xl border-none text-white cursor-pointer transition-all"><Edit2 size={18}/></button>
                          <button onClick={() => handleRemoveClass(selectedClass.id)} className="p-3 bg-white/20 hover:bg-white/30 rounded-2xl border-none text-white cursor-pointer transition-all"><Trash2 size={18}/></button>
                        </>
                      )}
                      <button onClick={() => setSelectedClass(null)} className="p-3 bg-white/20 hover:bg-white/30 rounded-2xl border-none text-white cursor-pointer transition-all"><X size={20} /></button>
                    </div>
                  </div>
                </div>
                {canTakeAttendance ? (
                <div style={{ padding: '40px' }}>
                  <div className="flex justify-between items-center mb-8">
                    <div>
                       <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Группа</p>
                       <p className="text-sm font-bold text-slate-800">Список участников ({selectedMemberIds.length})</p>
                    </div>
                    <button 
                      onClick={handleSelectAll}
                      className="px-4 py-2 bg-indigo-50 text-primary text-xs font-bold rounded-xl hover:bg-indigo-100 transition-all border-none cursor-pointer"
                    >
                      Выбрать всех
                    </button>
                  </div>
                  <div style={{ maxHeight: '320px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '40px', paddingRight: '4px' }} className="custom-scrollbar">
                    {members.map(member => (
                      <div 
                        key={member.id} 
                        onClick={() => toggleMemberSelection(member.id)}
                        className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${selectedMemberIds.includes(member.id) ? 'border-primary bg-indigo-50/50' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                      >
                        <div className="flex items-center gap-4">
                          <div style={{ width: 44, height: 44, borderRadius: '14px', backgroundColor: selectedMemberIds.includes(member.id) ? 'var(--color-primary)' : 'var(--color-bg)', color: selectedMemberIds.includes(member.id) ? 'white' : 'var(--color-text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', transition: 'all 0.3s' }}>
                            {member.avatar ? <img src={member.avatar} style={{ width: '100%', height: '100%', borderRadius: '14px', objectFit: 'cover' }} alt=""/> : member.firstName?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-slate-900">{member.firstName} {member.lastName}</p>
                            <p className="text-[10px] font-bold text-muted uppercase tracking-wider">
                              {groups.find(g => g.id === member.groupId)?.name || 'Индивидуально'}
                            </p>
                          </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedMemberIds.includes(member.id) ? 'bg-primary border-primary text-white' : 'border-slate-200'}`}>
                           {selectedMemberIds.includes(member.id) && <CheckCircle2 size={14} />}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="primary" style={{ width: '100%', height: '60px', borderRadius: '20px', fontSize: '16px' }} onClick={handleMarkAttendance} disabled={selectedMemberIds.length === 0}>
                    Отметить посещаемость
                  </Button>
                </div>
                ) : (
                <div style={{ padding: '40px' }} className="text-center">
                  <p className="text-secondary font-medium mb-6" style={{ maxWidth: '400px', margin: '0 auto' }}>
                    Просмотр расписания. Добавление занятий и отметка посещаемости доступны в панели клуба для администратора и тренера.
                  </p>
                  <Button variant="primary" type="button" onClick={() => setSelectedClass(null)} style={{ borderRadius: '16px', padding: '12px 32px' }}>
                    Закрыть
                  </Button>
                </div>
                )}
              </>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};
