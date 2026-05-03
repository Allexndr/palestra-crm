import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAdmin } from '../../context/AdminContext';
import { Trophy, Medal, Target, TrendingUp, Award, Star, ArrowUpRight, Edit2, Trash2, X, Plus } from 'lucide-react';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { LockedFeature } from '../../components/admin/LockedFeature';

import { LEAGUE_TEMPLATES } from '../../lib/leagueTemplates';

export const League = () => {
  const { members, user, leagues, addLeague, removeLeague, updateLeague, sports, achievements, addAchievement, removeAchievement, monthlyAward, groups, updateMember, canUseFeature, getUpgradeMessage, activeChildId, clubInfo, updateClubInfo } = useAdmin();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';
  const isParent = user?.role === 'parent';
  const isStudent = user?.role === 'student';
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('ranking'); // ranking, results, table
  const [selectedLeagueId, setSelectedLeagueId] = useState(leagues[0]?.id || 'all');
  const [leagueToDelete, setLeagueToDelete] = useState(null);
  const [achievementToDelete, setAchievementToDelete] = useState(null);
  const [newLeague, setNewLeague] = useState({ 
    participantIds: [],
    groupIds: [],
    template: 'martial_arts'
  });

  const currentTemplate = LEAGUE_TEMPLATES[clubInfo?.activeLeagueTemplate || 'martial_arts'];
  
  const [resultPoints, setResultPoints] = useState({}); // memberId -> points
  const [resultDesc, setResultDesc] = useState('');

  if (!canUseFeature('league')) {
    return (
      <LockedFeature
        title="Лига и RPG-мотивация доступны как модуль роста"
        description={getUpgradeMessage('feature', 'Лига и RPG-геймификация')}
        onConfigure={() => navigate('/admin/settings')}
      />
    );
  }

  const currentLeague = leagues.find(l => l.id === selectedLeagueId) || null;
  
  const handleCreateLeague = (e) => {
    e.preventDefault();
    if (isEditing && selectedLeagueId !== 'all') {
      updateLeague(selectedLeagueId, newLeague);
      setIsEditing(false);
    } else {
      addLeague(newLeague);
    }
    setNewLeague({ name: '', sport: sports[0], startDate: '', endDate: '', participantIds: [], groupIds: [] });
    setIsAdding(false);
  };

  const handleEditLeague = (league) => {
    if (!league) return;
    setNewLeague({
      name: league.name || '',
      sport: league.sport || sports[0],
      startDate: league.startDate || '',
      endDate: league.endDate || '',
      participantIds: league.participantIds || [],
      groupIds: league.groupIds || []
    });
    setIsEditing(true);
    setIsAdding(true);
  };

  const handleAwardPoints = () => {
    Object.entries(resultPoints).forEach(([memberId, pts]) => {
      if (pts > 0) {
        const member = members.find(m => m.id === memberId);
        if (member) {
          updateMember(memberId, { points: (member.points || 0) + parseInt(pts) });
        }
      }
    });
    setResultPoints({});
    setResultDesc('');
    alert('Баллы успешно начислены!');
  };

  const toggleGroup = (groupId) => {
    setNewLeague(prev => ({
      ...prev,
      groupIds: prev.groupIds.includes(groupId) 
        ? prev.groupIds.filter(id => id !== groupId)
        : [...prev.groupIds, groupId]
    }));
  };

  // Filter members for the selected league
  const leagueMembers = members.filter(m => {
    if (selectedLeagueId === 'all') return true;
    if (!currentLeague) return false;
    return (currentLeague.participantIds?.includes(m.id)) || (currentLeague.groupIds?.includes(m.groupId));
  });

  // Sort members by points
  const sortedMembers = [...leagueMembers].sort((a, b) => (b.points || 0) - (a.points || 0));
  const top3 = sortedMembers.slice(0, 3);

  return (
    <div className="animate-fade-in pb-12">
      <div className="admin-page-header admin-page-header--center">
        <div className="page-title-block page-title-block--row">
          <h1 className="h1">Лига</h1>
          <p className="text-secondary font-medium uppercase tracking-widest text-[10px] opacity-60">Рейтинг и Геймификация</p>
        </div>
        {isAdmin && (
          <div className="admin-page-actions">
            {selectedLeagueId !== 'all' && (
              <>
                <button onClick={() => handleEditLeague(currentLeague)} className="p-3 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer">
                  <Edit2 size={18} />
                </button>
                <button onClick={() => setLeagueToDelete(currentLeague)} className="p-3 bg-white text-danger rounded-xl border border-slate-200 hover:bg-red-50 transition-all cursor-pointer">
                  <Trash2 size={18} />
                </button>
              </>
            )}
            <select 
              className="input-field" 
              style={{ width: 'auto', padding: '0 16px', height: '42px', borderRadius: '14px', fontSize: '14px', fontWeight: 'bold' }}
              value={clubInfo?.activeLeagueTemplate || 'martial_arts'}
              onChange={(e) => updateClubInfo({ activeLeagueTemplate: e.target.value })}
            >
              <optgroup label="Глобальный шаблон метрик">
                {Object.entries(LEAGUE_TEMPLATES).map(([id, t]) => (
                  <option key={id} value={id}>{t.name}</option>
                ))}
              </optgroup>
            </select>
            <Button variant="primary" onClick={() => {
              setIsAdding(!isAdding);
              setIsEditing(false);
              setNewLeague({ name: '', sport: sports[0], startDate: '', endDate: '', participantIds: [], groupIds: [] });
            }} style={{ borderRadius: '14px' }}>
              <Plus size={18} /> {isAdding ? 'Отмена' : 'Создать сезон'}
            </Button>
          </div>
        )}
      </div>

      {isAdding && isAdmin && (
        <Card className="admin-section-card animate-up shadow-2xl shadow-indigo-100 border-none overflow-hidden p-0">
          <div className="p-8 border-b border-slate-50">
             <h4 className="h4">{isEditing ? 'Редактировать параметры лиги' : 'Параметры новой лиги'}</h4>
          </div>
          <form onSubmit={handleCreateLeague} className="p-8 flex flex-col gap-8">
            <div className="admin-form-grid">
              <Input label="Название сезона" placeholder="Летний кубок 2026" required value={newLeague.name} onChange={e => setNewLeague({...newLeague, name: e.target.value})} />
              <div className="input-group">
                <label className="input-label">Дисциплина</label>
                <select className="input-field" value={newLeague.sport} onChange={e => setNewLeague({...newLeague, sport: e.target.value})}>
                  <option>Все виды</option>
                  {sports.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <Input label="Начало" type="date" required value={newLeague.startDate} onChange={e => setNewLeague({...newLeague, startDate: e.target.value})} />
              <Input label="Конец" type="date" required value={newLeague.endDate} onChange={e => setNewLeague({...newLeague, endDate: e.target.value})} />
            </div>

            <div className="admin-two-column">
              <div>
                <label className="text-[10px] font-black uppercase text-muted tracking-widest mb-4 block">Группы-участники</label>
                <div className="flex flex-wrap gap-2">
                  {groups.length === 0 ? (
                    <p className="text-xs text-muted">Нет созданных групп</p>
                  ) : groups.map(g => (
                    <button 
                      key={g.id} type="button" onClick={() => toggleGroup(g.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        newLeague.groupIds.includes(g.id) 
                          ? 'bg-primary text-white border-primary shadow-lg shadow-indigo-100' 
                          : 'bg-white text-secondary border-slate-200 hover:border-primary'
                      }`}
                    >
                      {newLeague.groupIds.includes(g.id) ? '✓ ' : '+ '} {g.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-muted tracking-widest mb-4 block">Индивидуально ({newLeague.participantIds.length})</label>
                <div className="bg-slate-50 rounded-2xl p-4 max-h-40 overflow-y-auto scrollbar-hide">
                   {members.map(m => (
                     <div 
                      key={m.id} 
                      onClick={() => {
                        setNewLeague(prev => ({
                          ...prev,
                          participantIds: prev.participantIds.includes(m.id) 
                            ? prev.participantIds.filter(id => id !== m.id)
                            : [...prev.participantIds, m.id]
                        }));
                      }}
                      className="flex items-center justify-between py-3 cursor-pointer border-b border-slate-100 last:border-0 hover:bg-slate-100/50 transition-all px-2 rounded-lg"
                    >
                       <span className="text-xs font-bold text-slate-700">{m.firstName} {m.lastName}</span>
                       <div className={`w-5 h-5 rounded-lg border-2 transition-all flex items-center justify-center ${newLeague.participantIds.includes(m.id) ? 'bg-primary border-primary' : 'border-slate-300'}`}>
                          {newLeague.participantIds.includes(m.id) && <Plus size={14} className="text-white" />}
                       </div>
                     </div>
                   ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 border-t border-slate-50 pt-8">
              <Button variant="primary" type="submit" style={{ borderRadius: '14px', padding: '12px 32px' }}>{isEditing ? 'Сохранить изменения' : 'Запустить сезон'}</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="flex gap-3 mb-10 overflow-x-auto pb-4 scrollbar-hide">
        <button 
          onClick={() => setSelectedLeagueId('all')}
          className={`px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all border cursor-pointer ${
            selectedLeagueId === 'all' 
              ? 'bg-primary text-white border-primary shadow-xl shadow-indigo-100' 
              : 'bg-white text-secondary border-slate-200 hover:border-slate-300'
          }`}
        >
          Общий рейтинг
        </button>
        {leagues.map(l => (
          <button 
            key={l.id} 
            onClick={() => setSelectedLeagueId(l.id)}
            className={`px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all border cursor-pointer ${
              selectedLeagueId === l.id 
                ? 'bg-primary text-white border-primary shadow-xl shadow-indigo-100' 
                : 'bg-white text-secondary border-slate-200 hover:border-slate-300'
            }`}
          >
            {l.name}
          </button>
        ))}
      </div>

      {selectedLeagueId !== 'all' && (
        <div className="flex gap-8 border-b border-slate-100 mb-10">
            <button onClick={() => setActiveTab('ranking')} className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all border-none bg-transparent cursor-pointer ${activeTab === 'ranking' ? 'text-primary border-b-2 border-primary' : 'text-muted hover:text-slate-900'}`}>Рейтинг</button>
            <button onClick={() => setActiveTab('table')} className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all border-none bg-transparent cursor-pointer ${activeTab === 'table' ? 'text-primary border-b-2 border-primary' : 'text-muted hover:text-slate-900'}`}>Таблица Лиги</button>
            {isAdmin && <button onClick={() => setActiveTab('results')} className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all border-none bg-transparent cursor-pointer ${activeTab === 'results' ? 'text-primary border-b-2 border-primary' : 'text-muted hover:text-slate-900'}`}>Внести результаты</button>}
        </div>
      )}

      {activeTab === 'table' ? (
        <Card className="animate-up border border-slate-100 shadow-sm overflow-hidden" style={{ borderRadius: '32px', padding: 0 }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 w-16">№</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 w-24">Возраст</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Боец (ФИО)</th>
                  {currentTemplate.metrics.map(m => (
                    <th key={m.id} className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">{m.label}</th>
                  ))}
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Итого</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Прогресс</th>
                </tr>
              </thead>
              <tbody>
                {sortedMembers.map((member, idx) => {
                  const age = member.birthDate ? new Date().getFullYear() - new Date(member.birthDate).getFullYear() : '-';
                  const total = Math.round(currentTemplate.metrics.reduce((acc, m) => acc + (member[m.id] || 0), 0) / currentTemplate.metrics.length);
                  return (
                    <tr key={member.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                      <td className="p-6">
                        <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-black text-xs text-slate-500">{idx + 1}</span>
                      </td>
                      <td className="p-6">
                        <span className="font-bold text-slate-600">{age}</span>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <img src={member.avatar || '/placeholder-avatar.png'} alt="" className="w-10 h-10 rounded-xl object-cover shadow-sm" />
                          <span className="font-black text-slate-900">{member.firstName} {member.lastName}</span>
                        </div>
                      </td>
                      {currentTemplate.metrics.map(m => (
                        <td key={m.id} className="p-6 text-center">
                          <div className={`w-12 h-12 rounded-xl bg-${m.color}-50 text-${m.color}-500 font-black flex items-center justify-center mx-auto shadow-sm border border-${m.color}-100/50`}>
                            {member[m.id] || 0}
                          </div>
                        </td>
                      ))}
                      <td className="p-6 text-center">
                        <span className="font-black text-primary text-xl">{total}</span>
                      </td>
                      <td className="p-6 text-center">
                        <div className="flex items-center justify-center gap-1 text-emerald-500">
                          <TrendingUp size={16} />
                          <span className="font-black text-xs">+{Math.floor(Math.random() * 5)}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : activeTab === 'ranking' ? (
        <>
          <div className="admin-stats-grid" style={{ alignItems: 'end' }}>
            {top3[1] && (
              <Card className="card-hover border-none shadow-xl shadow-slate-100 p-8 text-center" style={{ borderBottom: '6px solid #94A3B8', borderRadius: '32px' }}>
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <img src={top3[1].avatar} alt="" className="w-full h-full rounded-[30px] object-cover border-4 border-white shadow-xl" />
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-400 text-white px-4 py-1 rounded-xl text-xs font-black">#2</div>
                </div>
                <p className="font-black text-slate-900 text-lg mb-1">{top3[1].firstName}</p>
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{top3[1].points} XP</p>
              </Card>
            )}

            {top3[0] && (
              <Card className="card-hover border-none shadow-2xl shadow-indigo-100 p-10 text-center relative z-10" style={{ borderBottom: '8px solid var(--color-accent)', borderRadius: '40px', transform: 'scale(1.1)', background: 'linear-gradient(180deg, #FFFFFF 0%, #FFFBF5 100%)' }}>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-accent animate-bounce"><Trophy size={48} fill="currentColor" fillOpacity={0.1} /></div>
                <div className="relative w-32 h-32 mx-auto mb-8">
                  <img src={top3[0].avatar} alt="" className="w-full h-full rounded-[40px] object-cover border-4 border-white shadow-2xl" />
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-accent text-white px-6 py-1.5 rounded-2xl text-sm font-black shadow-lg shadow-orange-200">WINNER</div>
                </div>
                <p className="font-black text-slate-900 text-xl mb-1">{top3[0].firstName} {top3[0].lastName}</p>
                <p className="text-[10px] font-black text-accent uppercase tracking-[0.2em]">{top3[0].points} XP</p>
              </Card>
            )}

            {top3[2] && (
              <Card className="card-hover border-none shadow-xl shadow-slate-100 p-8 text-center" style={{ borderBottom: '6px solid #B45309', borderRadius: '32px' }}>
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <img src={top3[2].avatar} alt="" className="w-full h-full rounded-[30px] object-cover border-4 border-white shadow-xl" />
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-700 text-white px-4 py-1 rounded-xl text-xs font-black">#3</div>
                </div>
                <p className="font-black text-slate-900 text-lg mb-1">{top3[2].firstName}</p>
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{top3[2].points} XP</p>
              </Card>
            )}
          </div>

          <div className="admin-split-metrics">
            <div>
              <Card style={{ padding: 0 }} className="card-hover border-none shadow-xl shadow-slate-100 overflow-hidden bg-white">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                   <h3 className="h4">{selectedLeagueId === 'all' ? 'Мировой рейтинг' : `Результаты: ${currentLeague?.name}`}</h3>
                   <div className="p-2 bg-indigo-50 text-primary rounded-xl"><TrendingUp size={24} /></div>
                </div>
                <div className="p-4">
                  {sortedMembers.length === 0 ? (
                    <p className="text-center py-20 text-muted font-bold opacity-30 uppercase tracking-widest">Нет участников</p>
                  ) : sortedMembers.map((member, idx) => {
                    const isMe = (isParent && member.id === activeChildId) || (isStudent && member.id === user?.id);
                    return (
                    <div key={member.id} className={`flex items-center gap-6 p-4 rounded-2xl transition-all group cursor-pointer ${isMe ? 'bg-indigo-50 border border-primary' : 'hover:bg-slate-50 border border-transparent'}`}>
                      <span className={`w-8 font-black transition-all text-xl ${isMe ? 'text-primary' : 'text-slate-300 group-hover:text-primary'}`}>{idx + 1}</span>
                      <img src={member.avatar} alt="" className="w-14 h-14 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-all" />
                      <div className="flex-1">
                        <p className="font-black text-slate-900 mb-0.5">{member.firstName} {member.lastName}</p>
                        <p className="text-[10px] font-black text-muted uppercase tracking-widest">{member.level || 'Новичок'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-primary text-xl">{member.points || 0}</p>
                        <p className="text-[9px] font-black text-muted uppercase tracking-widest">баллов XP</p>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </Card>
            </div>

            <div className="flex flex-col gap-8">
              {monthlyAward.title && (
                <Card style={{ backgroundColor: 'var(--color-primary)', color: 'white', borderRadius: '32px', overflow: 'hidden' }} className="shadow-2xl shadow-indigo-100 relative">
                  <div className="absolute top-0 right-0 p-8 opacity-10"><Award size={140} /></div>
                  <div className="p-3 bg-white/20 rounded-2xl w-fit mb-8 border border-white/10 backdrop-blur-md"><Award size={28} /></div>
                  <h4 className="text-2xl font-black mb-4" style={{ fontFamily: 'var(--font-family-display)' }}>{monthlyAward.title}</h4>
                  <p className="text-sm opacity-90 leading-relaxed mb-10">{monthlyAward.description}</p>
                  <div className="p-4 bg-white/10 rounded-2xl font-black text-xs uppercase tracking-widest border border-white/10 flex justify-between items-center">
                    <span>Финал через:</span>
                    <span className="text-lg">{monthlyAward.daysLeft} дн.</span>
                  </div>
                </Card>
              )}

              <Card className="border-none shadow-xl shadow-slate-100">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-[10px] font-black uppercase text-muted tracking-widest">Коллекция наград</h3>
                  {isAdmin && (
                    <button 
                      onClick={() => {
                        const title = prompt('Название достижения:');
                        const desc = prompt('Описание достижения:');
                        if (title && desc) {
                          addAchievement({ title, desc });
                        }
                      }}
                      className="p-2 text-primary hover:bg-indigo-50 rounded-xl transition-all border-none bg-transparent cursor-pointer"
                    >
                      <Plus size={20} />
                    </button>
                  )}
                </div>
                <div className="flex flex-col gap-4">
                   {achievements.map((ach, i) => (
                      <div key={ach.id || i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group hover:translate-x-1 transition-all">
                          <div className="flex items-center gap-4">
                            <div style={{ backgroundColor: ach.color, color: ach.iconColor }} className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm shrink-0 border-2 border-white">
                              <Star size={20} fill="currentColor" />
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-900 mb-0.5 line-clamp-1">{ach.title}</p>
                              <p className="text-[10px] font-medium text-slate-400 line-clamp-1">{ach.desc}</p>
                            </div>
                          </div>
                          {isAdmin && (
                            <button onClick={() => removeAchievement(ach.id)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-danger transition-all border-none bg-transparent cursor-pointer">
                              <Trash2 size={16} />
                            </button>
                          )}
                      </div>
                   ))}
                </div>
              </Card>
            </div>
          </div>
        </>
      ) : (
        <Card className="animate-up shadow-2xl shadow-slate-100 border-none overflow-hidden p-0">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
             <div>
                <h4 className="h4 mb-1">Начисление баллов (XP)</h4>
                <p className="text-xs font-bold text-muted uppercase tracking-widest">За спортивные успехи и дисциплину</p>
             </div>
             <Button variant="primary" onClick={handleAwardPoints} disabled={Object.keys(resultPoints).length === 0} style={{ borderRadius: '12px' }}>
               Подтвердить и начислить
             </Button>
          </div>
          <div className="p-8">
             <div className="mb-8">
                <Input 
                  label="Повод / Событие" 
                  placeholder="Напр: Внутриклубный спарринг 15.04" 
                  value={resultDesc} 
                  onChange={e => setResultDesc(e.target.value)} 
                />
             </div>
             <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {leagueMembers.map(m => (
                  <div key={m.id} className="flex flex-col gap-6 p-8 bg-slate-50 rounded-[32px] border border-slate-100 group hover:bg-white hover:shadow-xl transition-all duration-300">
                     <div className="flex items-center gap-4">
                        <img src={m.avatar || '/placeholder-avatar.png'} alt="" className="w-12 h-12 rounded-2xl object-cover shadow-sm" />
                        <div className="flex-1">
                           <p className="text-base font-black text-slate-900">{m.firstName} {m.lastName}</p>
                           <p className="text-[10px] font-bold text-muted uppercase tracking-[0.2em]">Текущий уровень: {m.points || 0} XP</p>
                        </div>
                     </div>
                     
                     <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {currentTemplate.metrics.map(m => (
                          <div key={m.id} className="flex flex-col gap-2">
                             <label className={`text-[9px] font-black uppercase text-slate-400 tracking-widest ml-2`}>{m.label}</label>
                             <input 
                                type="number" className={`w-full h-12 text-center font-black bg-white border border-slate-100 rounded-xl outline-none focus:ring-4 focus:ring-${m.color}-100 text-${m.color}-500 shadow-sm`}
                                value={formData[m.id] || member[m.id] || 0}
                                onChange={e => updateMember(member.id, { [m.id]: parseInt(e.target.value) || 0 })}
                             />
                          </div>
                        ))}
                     </div>

                     <div className="flex items-center gap-4 pt-4 border-t border-slate-100/50">
                        <Input 
                          placeholder="Добавить XP" 
                          type="number"
                          value={resultPoints[m.id] || ''}
                          onChange={e => setResultPoints(prev => ({ ...prev, [m.id]: e.target.value }))}
                          className="flex-1"
                        />
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </Card>
      )}

      <ConfirmModal 
        isOpen={!!leagueToDelete} onClose={() => setLeagueToDelete(null)}
        onConfirm={() => { removeLeague(leagueToDelete.id); setLeagueToDelete(null); setSelectedLeagueId('all'); }}
        title="Удалить сезон" message={`Вы действительно хотите удалить лигу "${leagueToDelete?.name}"?`}
        confirmText="Удалить" variant="danger"
      />
    </div>
  );
};
