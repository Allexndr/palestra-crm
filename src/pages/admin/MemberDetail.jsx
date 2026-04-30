import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, User, Phone, MapPin, Target, Calendar, Trophy, Zap, Shield, HeartPulse, Wallet } from 'lucide-react';

export const MemberDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { members, groups, locations, plans } = useAdmin();
  const [activeTab, setActiveTab] = React.useState('overview');
  
  const member = members.find(m => m.id === id);

  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="h3 mb-4">Ученик не найден</h2>
        <Button variant="primary" onClick={() => navigate('/admin/members')}>Вернуться к списку</Button>
      </div>
    );
  }

  const groupName = groups.find(g => g.id === member.groupId)?.name || 'Без группы';
  const locationName = locations.find(l => l.id === member.locationId)?.name || 'Основной филиал';
  const planInfo = plans.find(p => p.name === member.plan);

  const stats = [
    { id: 'strength', label: 'Сила', value: member.strength || 50, icon: '💪', color: 'bg-red-500' },
    { id: 'speed', label: 'Скорость', value: member.speed || 50, icon: '⚡', color: 'bg-yellow-500' },
    { id: 'reaction', label: 'Реакция', value: member.reaction || 50, icon: '👁️', color: 'bg-blue-500' },
    { id: 'endurance', label: 'Выносливость', value: member.endurance || 50, icon: '🫁', color: 'bg-green-500' },
    { id: 'technique', label: 'Техника', value: member.technique || 50, icon: '🥋', color: 'bg-purple-500' }
  ];

  return (
    <div className="animate-fade-in pb-12">
      <div className="admin-page-header admin-page-header--center">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/members')} className="p-2 bg-white rounded-full border shadow-sm hover:bg-slate-50 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="page-title-block page-title-block--row">
            <h1 className="h2">
              Профиль атлета
            </h1>
          </div>
        </div>
        <Link to={`/admin/members/${id}/edit`}>
          <Button variant="primary" style={{ borderRadius: '14px', gap: '8px' }}>
             <Zap size={16} fill="white" /> Редактировать
          </Button>
        </Link>
      </div>

      <div className="admin-detail-grid">
        <div className="flex flex-col gap-6">
          {/* Main Character Header */}
          <Card style={{ padding: '0', overflow: 'hidden', borderBottom: '6px solid var(--color-primary)' }}>
            <div style={{ 
              height: '140px', 
              background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-navy-900) 100%)',
              position: 'relative'
            }}>
               <div style={{ position: 'absolute', bottom: -50, left: 40, width: 140, height: 140, borderRadius: '40px', border: '8px solid white', overflow: 'hidden', backgroundColor: 'white', boxShadow: 'var(--shadow-lg)' }}>
                 {member.avatar ? (
                    <img src={member.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                      <User size={60} />
                    </div>
                  )}
               </div>
            </div>
            <div style={{ padding: '60px 40px 30px' }}>
               <div className="flex justify-between items-start">
                 <div>
                    <h2 className="h2 mb-2">{member.firstName} {member.lastName}</h2>
                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="px-3 py-1 bg-indigo-50 text-primary text-[10px] font-bold uppercase tracking-wider rounded-lg border border-indigo-100">{member.skillLevel}</span>
                      <span className="px-3 py-1 bg-slate-50 text-slate-700 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-slate-200">{member.beltColor} пояс</span>
                      <span className="px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-amber-100">{groupName}</span>
                    </div>
                 </div>
                 <div style={{ textAlign: 'right' }}>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Уровень опыта</p>
                    <p className="h3 text-primary">{Math.floor((member.points || 0) / 100) + 1}</p>
                 </div>
               </div>
            </div>
          </Card>

          {/* Navigation Tabs */}
          <div className="flex gap-4 border-b pb-1 mb-2">
            {[
              { id: 'overview', label: 'Обзор' },
              { id: 'stats', label: 'Характеристики' },
              { id: 'achievements', label: 'Достижения' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 px-2 text-sm font-bold transition-all relative ${
                  activeTab === tab.id ? 'text-primary' : 'text-muted hover:text-secondary'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full animate-fade-in" />
                )}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                <Card style={{ padding: '24px', textAlign: 'center' }} className="card-hover">
                   <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2">Возраст</p>
                   <p className="h3">{member.birthDate ? `${new Date().getFullYear() - new Date(member.birthDate).getFullYear()}` : '-'}</p>
                </Card>
                <Card style={{ padding: '24px', textAlign: 'center' }} className="card-hover">
                   <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2">Вес (кг)</p>
                   <p className="h3">{member.weight || '-'}</p>
                </Card>
                <Card style={{ padding: '24px', textAlign: 'center' }} className="card-hover">
                   <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2">Рост (см)</p>
                   <p className="h3">{member.height || '-'}</p>
                </Card>
              </div>

              <Card style={{ padding: '30px' }}>
                <h3 className="h5 mb-6 border-b pb-4">Контактная информация</h3>
                <div className="admin-form-grid">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><Phone size={18} /></div>
                       <div>
                         <p className="text-[10px] font-bold text-muted uppercase">Телефон</p>
                         <p className="text-sm font-medium">{member.phone || 'Не указан'}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><MapPin size={18} /></div>
                       <div>
                         <p className="text-[10px] font-bold text-muted uppercase">Филиал</p>
                         <p className="text-sm font-medium">{locationName}</p>
                       </div>
                    </div>
                  </div>
                  {member.hasParent && (
                    <div className="p-6 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                      <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mb-3 flex items-center gap-2"><Shield size={14} /> Родитель / Представитель</p>
                      <p className="text-sm font-bold mb-1">{member.parentName}</p>
                      <p className="text-sm text-secondary mb-3">{member.parentPhone}</p>
                      
                      {member.parentLogin && (
                        <div className="pt-3 border-t border-emerald-100 flex flex-col gap-2">
                          <p className="text-[10px] font-bold text-emerald-600 uppercase">Доступ родителя</p>
                          <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-emerald-100">
                            <span className="text-xs font-mono text-emerald-700">{member.parentLogin}</span>
                            <span className="text-[10px] font-bold text-emerald-400 uppercase">Логин</span>
                          </div>
                        </div>
                      )}
                      
                      {member.parentNote && <p className="text-[11px] text-muted italic mt-3">"{member.parentNote}"</p>}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'stats' && (
            <Card style={{ padding: '40px' }} className="animate-fade-in">
              <div className="flex justify-between items-center mb-10 border-b pb-4">
                <h3 className="h5">Анализ характеристик</h3>
                <div className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest">
                  Уровень: {Math.floor((member.points || 0) / 100) + 1}
                </div>
              </div>
              <div className="flex flex-col gap-8">
                {stats.map(stat => (
                  <div key={stat.id}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold flex items-center gap-2">
                        <span className="text-lg">{stat.icon}</span> {stat.label}
                      </span>
                      <span className="text-sm font-bold text-primary">{stat.value}%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${stat.color} transition-all duration-1000 ease-out`}
                        style={{ width: `${stat.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'achievements' && (
            <div className="flex flex-col gap-4 animate-fade-in">
               <Card style={{ padding: '60px', textAlign: 'center' }} className="bg-slate-50 border-2 border-dashed border-slate-200">
                 <Trophy size={48} className="mx-auto mb-4 text-slate-300" />
                 <p className="text-secondary font-medium">Здесь будут отображаться личные награды и кубки ученика.</p>
               </Card>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
            <div className="p-5 bg-indigo-50/50 rounded-2xl mb-6 border border-indigo-100">
               <p className="text-[10px] font-bold text-indigo-700 uppercase mb-2 flex items-center gap-2"><Wallet size={12}/> Баланс счета</p>
               <p className="text-2xl font-black text-indigo-900 mb-1">{member.balance ? `${Number(member.balance).toLocaleString()} ₸` : '0 ₸'}</p>
               <p className="text-[10px] text-indigo-600 font-medium">Для безналичных покупок в баре</p>
            </div>
            {member.subscriptionEndDate && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-6">
                <p className="text-[10px] font-bold text-muted uppercase mb-1">Абонемент до</p>
                <p className={`font-bold ${new Date(member.subscriptionEndDate) < new Date() ? 'text-rose-500' : 'text-slate-700'}`}>
                  {new Date(member.subscriptionEndDate).toLocaleDateString('ru-RU')}
                </p>
              </div>
            )}
            <Button variant="ghost" className="w-full text-xs font-bold" style={{ border: '1px solid var(--color-border)' }}>История платежей</Button>
          </Card>

          <Card style={{ padding: '24px' }} className={member.medicalNotes ? 'border-rose-200 bg-rose-50/30' : ''}>
            <h3 className="h5 mb-6 flex items-center gap-2">
              <HeartPulse size={20} className={member.medicalNotes ? 'text-rose-500' : 'text-slate-400'} /> 
              Медкарта
            </h3>
            {member.medicalNotes ? (
              <div className="p-4 bg-white rounded-2xl border border-rose-100 shadow-sm">
                <p className="text-sm font-bold text-rose-700 mb-2">Особые указания:</p>
                <p className="text-sm text-slate-700 leading-relaxed italic">"{member.medicalNotes}"</p>
              </div>
            ) : (
              <div className="py-6 text-center text-slate-400 text-xs font-medium bg-slate-50 rounded-2xl border border-dashed">
                Медицинских заметок нет
              </div>
            )}
          </Card>

          <Card style={{ padding: '24px' }}>
            <h3 className="h5 mb-6">Доступы</h3>
            <div className="flex flex-col gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl">
                 <p className="text-[10px] font-bold text-muted uppercase mb-1">Логин ученика</p>
                 <code className="text-sm font-bold text-primary">{member.login || '—'}</code>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl">
                 <p className="text-[10px] font-bold text-muted uppercase mb-1">Пароль</p>
                 <code className="text-xs font-bold text-primary opacity-60 italic">Хранится в зашифрованном виде</code>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
