import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ChevronRight, CreditCard, Medal, Shield, Trophy, TrendingUp, User, Zap } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { EventCarousel } from '../../components/features/EventCarousel';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export const Profile = () => {
  const { user, members, attendance, achievements, groups, schedule } = useAdmin();
  const [activeChildId, setActiveChildId] = useState(null);
  
  const isParent = user?.role === 'parent';
  const isStudent = user?.role === 'student';

  const children = useMemo(
    () => (isParent ? members.filter((m) => m.parentId === user?.id) : []),
    [isParent, members, user?.id]
  );
  
  useEffect(() => {
    if (isParent && children.length > 0 && !activeChildId) {
      setActiveChildId(children[0].id);
    }
  }, [activeChildId, children, isParent]);

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

  const stats = [
    { label: 'Сила', value: profileData.strength || 50, color: 'bg-rose-500' },
    { label: 'Скорость', value: profileData.speed || 50, color: 'bg-sky-500' },
    { label: 'Техника', value: profileData.technique || 50, color: 'bg-emerald-500' },
    { label: 'Выносливость', value: profileData.endurance || 50, color: 'bg-amber-500' },
  ];

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

        <div className="member-profile-hero__summary">
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

      {isParent && children.length > 1 && (
        <section className="member-child-switcher">
          {children.map((child) => (
            <button
              key={child.id}
              type="button"
              onClick={() => setActiveChildId(child.id)}
              className={activeChildId === child.id ? 'is-active' : ''}
            >
              <span>{child.firstName} {child.lastName}</span>
              <small>{child.points || 0} XP</small>
            </button>
          ))}
        </section>
      )}

      <section className="member-profile-grid">
        <div className="member-profile-main">
          <Card className="shadow-2xl shadow-slate-200/50">
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
                    <div className={stat.color} style={{ width: `${stat.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="card-hover">
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

          <Card>
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

          <Card>
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
                    <div>
                      <Calendar size={18} />
                    </div>
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
        </div>

        <aside className="member-profile-side">
          <Card className="member-action-panel">
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

          {isParent && (
            <Card>
              <h3 className="member-card-title"><User size={18} className="text-primary" /> Дети</h3>
              <div className="member-family-list">
                {children.map((child) => (
                  <button
                    key={child.id}
                    type="button"
                    className={activeChildId === child.id ? 'is-active' : ''}
                    onClick={() => setActiveChildId(child.id)}
                  >
                    <span>{child.firstName} {child.lastName}</span>
                    <small>{child.points || 0} XP • {child.sport || 'Спорт'}</small>
                  </button>
                ))}
              </div>
            </Card>
          )}

          <EventCarousel isAdmin={false} />
        </aside>
      </section>
    </main>
  );
};
