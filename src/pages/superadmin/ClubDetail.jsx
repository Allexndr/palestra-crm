import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Users, UserCheck, Building2, CalendarDays,
  DollarSign, Target, Activity, Crown, MapPin, Mail,
  Phone, TrendingUp, TrendingDown, Circle, ChevronRight,
  Clock, Package, Trophy, ExternalLink
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

const fmt = (n) => Number(n || 0).toLocaleString('ru-RU');
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }) : '—';
const fmtTime = (d) => d ? new Date(d).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

const Section = ({ title, children }) => (
  <div style={{ background: 'white', borderRadius: 20, border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden', marginBottom: 20 }}>
    <div style={{ padding: '18px 24px', borderBottom: '1px solid #f8fafc' }}>
      <h3 style={{ margin: 0, fontWeight: 800, fontSize: 15, color: '#0f172a' }}>{title}</h3>
    </div>
    <div style={{ padding: 24 }}>{children}</div>
  </div>
);

const KpiCard = ({ icon: Icon, label, value, color = '#3146A6' }) => (
  <div style={{ background: '#f8fafc', borderRadius: 14, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={18} color={color} />
    </div>
    <div>
      <p style={{ margin: 0, fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
      <p style={{ margin: '2px 0 0', fontSize: 20, fontWeight: 900, color: '#0f172a' }}>{value}</p>
    </div>
  </div>
);

const Row = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f8fafc' }}>
    <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>{label}</span>
    <span style={{ fontSize: 13, color: '#0f172a', fontWeight: 700 }}>{value || '—'}</span>
  </div>
);

export const ClubDetail = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const { logout } = useAdmin();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/superadmin/club-detail?clubId=${clubId}`, { credentials: 'include' });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Ошибка');
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [clubId]);

  const handleEnterClub = () => {
    localStorage.setItem('palestra-impersonate-club-id', clubId);
    window.location.href = '/admin';
  };

  const handleLogout = async () => { await logout(); navigate('/auth/login'); };

  if (isLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f8fafc' }}>
      <p style={{ color: '#94a3b8', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>Загрузка данных клуба...</p>
    </div>
  );

  if (error || !data) return (
    <div style={{ padding: 40, fontFamily: 'Outfit, sans-serif' }}>
      <Link to="/superadmin" style={{ color: '#3146A6', fontWeight: 700, textDecoration: 'none' }}>← Назад</Link>
      <p style={{ color: '#ef4444', marginTop: 20 }}>{error || 'Клуб не найден'}</p>
    </div>
  );

  const { club, appState, lastActivity } = data;
  const members = Array.isArray(appState.members) ? appState.members : [];
  const coaches = Array.isArray(appState.coaches) ? appState.coaches : [];
  const groups = Array.isArray(appState.groups) ? appState.groups : [];
  const leads = Array.isArray(appState.leads) ? appState.leads : [];
  const schedule = Array.isArray(appState.schedule) ? appState.schedule : [];
  const locations = Array.isArray(appState.locations) ? appState.locations : [];
  const finances = appState.finances || {};
  const transactions = Array.isArray(finances.transactions) ? finances.transactions : [];
  const subscription = appState.subscription || {};
  const monthlyAward = appState.monthlyAward || {};
  const leagues = Array.isArray(appState.leagues) ? appState.leagues : [];

  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const expenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + (Number(t.amount) || 0), 0);

  const tabs = ['overview', 'members', 'finances', 'schedule', 'leads'];
  const tabLabels = { overview: 'Обзор', members: 'Ученики', finances: 'Финансы', schedule: 'Расписание', leads: 'Лиды' };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Outfit, sans-serif' }}>
      {/* Header */}
      <header style={{
        background: '#0f172a', padding: '0 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 64, position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link to="/superadmin" style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
            <ArrowLeft size={15} /> Все клубы
          </Link>
          <span style={{ color: '#334155', fontSize: 20 }}>·</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: club.primary_color || '#3146A6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: 13 }}>
              {club.name?.[0]}
            </div>
            <span style={{ color: 'white', fontWeight: 800, fontSize: 15 }}>{club.name}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleEnterClub} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px',
            background: '#3146A6', border: 'none', borderRadius: 8,
            color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer',
          }}>
            <ExternalLink size={13} /> Войти в клуб
          </button>
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 8, color: '#f87171', fontWeight: 700, fontSize: 13, cursor: 'pointer',
          }}>
            Выйти
          </button>
        </div>
      </header>

      {/* Club hero */}
      <div style={{ background: 'white', borderBottom: '1px solid #f0f0f0', padding: '24px 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: '#0f172a' }}>{club.name}</h1>
              <div style={{ display: 'flex', gap: 20, marginTop: 6, flexWrap: 'wrap' }}>
                {club.city && <span style={{ fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={13} /> {club.city}</span>}
                {appState.admin_email && <span style={{ fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}><Mail size={13} /> {appState.admin_email}</span>}
                <span style={{ fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={13} /> {fmtTime(lastActivity)}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{
                padding: '6px 16px', borderRadius: 99,
                background: subscription.plan === 'Growth' ? '#eff6ff' : '#f0fdf4',
                color: subscription.plan === 'Growth' ? '#1d4ed8' : '#15803d',
                fontWeight: 800, fontSize: 13,
              }}>
                {subscription.plan || 'Starter'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: 99, background: '#f1f5f9', fontSize: 12, fontWeight: 700, color: '#475569' }}>
                <Circle size={6} fill="#22c55e" color="transparent" /> Активен
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: 'white', borderBottom: '1px solid #f0f0f0', padding: '0 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 4 }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '14px 18px', border: 'none', background: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: 13, fontFamily: 'Outfit, sans-serif',
              color: activeTab === tab ? '#3146A6' : '#64748b',
              borderBottom: activeTab === tab ? '2px solid #3146A6' : '2px solid transparent',
            }}>
              {tabLabels[tab]}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 32px' }}>

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
              <KpiCard icon={Users} label="Учеников" value={members.length} color="#3146A6" />
              <KpiCard icon={UserCheck} label="Тренеров" value={coaches.length} color="#7c3aed" />
              <KpiCard icon={Building2} label="Групп" value={groups.length} color="#0891b2" />
              <KpiCard icon={CalendarDays} label="Тренировок" value={schedule.length} color="#059669" />
              <KpiCard icon={Target} label="Лидов" value={leads.length} color="#d97706" />
              <KpiCard icon={TrendingUp} label="Доход" value={`${fmt(income)} ₸`} color="#16a34a" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <Section title="Информация о клубе">
                <Row label="Название" value={club.name} />
                <Row label="Город" value={club.city} />
                <Row label="Адрес" value={club.address} />
                <Row label="Тариф" value={subscription.plan || 'Starter'} />
                <Row label="Email админа" value={appState.admin_email} />
                <Row label="Дата создания" value={fmtDate(club.created_at)} />
                <Row label="Последняя активность" value={fmtTime(lastActivity)} />
              </Section>

              <Section title="Лимиты тарифа">
                {subscription.limits ? (
                  Object.entries(subscription.limits).map(([k, v]) => (
                    <Row key={k} label={k} value={v === 999999 ? 'Безлимит' : v} />
                  ))
                ) : (
                  <>
                    <Row label="Ученики" value="15 (Starter)" />
                    <Row label="Тренеры" value="3 (Starter)" />
                    <Row label="Филиалы" value="1 (Starter)" />
                  </>
                )}
              </Section>

              {locations.length > 0 && (
                <Section title={`Филиалы (${locations.length})`}>
                  {locations.map(loc => (
                    <Row key={loc.id} label={loc.name} value={loc.address || '—'} />
                  ))}
                </Section>
              )}

              {monthlyAward?.title && (
                <Section title="Награда месяца">
                  <Row label="Название" value={monthlyAward.title} />
                  <Row label="Описание" value={monthlyAward.description} />
                  <Row label="Дней до конца" value={monthlyAward.daysLeft} />
                </Section>
              )}
            </div>
          </>
        )}

        {/* MEMBERS */}
        {activeTab === 'members' && (
          <Section title={`Ученики · ${members.length}`}>
            {members.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0', margin: 0 }}>Учеников нет</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      {['Имя', 'Вид спорта', 'Группа', 'Абонемент', 'Уровень', 'Очки', 'Добавлен'].map(h => (
                        <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((m, i) => (
                      <tr key={m.id} style={{ borderTop: '1px solid #f1f5f9', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                        <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a' }}>{m.firstName} {m.lastName}</td>
                        <td style={{ padding: '12px 14px', color: '#475569' }}>{m.sport || '—'}</td>
                        <td style={{ padding: '12px 14px', color: '#475569' }}>
                          {m.groupId ? (groups.find(g => g.id === m.groupId)?.name || m.groupId.slice(0, 8)) : '—'}
                        </td>
                        <td style={{ padding: '12px 14px', color: '#475569' }}>{m.plan || '—'}</td>
                        <td style={{ padding: '12px 14px', color: '#475569' }}>{m.level || '—'}</td>
                        <td style={{ padding: '12px 14px', fontWeight: 700, color: '#3146A6' }}>{m.points || 0}</td>
                        <td style={{ padding: '12px 14px', color: '#94a3b8', fontSize: 12 }}>{fmtDate(m.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>
        )}

        {/* FINANCES */}
        {activeTab === 'finances' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
              <KpiCard icon={TrendingUp} label="Доход" value={`${fmt(income)} ₸`} color="#16a34a" />
              <KpiCard icon={TrendingDown} label="Расходы" value={`${fmt(expenses)} ₸`} color="#dc2626" />
              <KpiCard icon={DollarSign} label="Баланс" value={`${fmt(income - expenses)} ₸`} color="#3146A6" />
              <KpiCard icon={Activity} label="Транзакций" value={transactions.length} color="#7c3aed" />
            </div>
            <Section title={`Транзакции · ${transactions.length}`}>
              {transactions.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0', margin: 0 }}>Транзакций нет</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        {['Дата', 'Описание', 'Тип', 'Сумма'].map(h => (
                          <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).map((t, i) => (
                        <tr key={t.id || i} style={{ borderTop: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px 14px', color: '#94a3b8', fontSize: 12 }}>{fmtTime(t.date)}</td>
                          <td style={{ padding: '12px 14px', color: '#475569' }}>{t.description || '—'}</td>
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: t.type === 'income' ? '#f0fdf4' : '#fef2f2', color: t.type === 'income' ? '#15803d' : '#dc2626' }}>
                              {t.type === 'income' ? 'Доход' : 'Расход'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px', fontWeight: 800, color: t.type === 'income' ? '#16a34a' : '#dc2626' }}>
                            {t.type === 'income' ? '+' : '-'}{fmt(t.amount)} ₸
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Section>
          </>
        )}

        {/* SCHEDULE */}
        {activeTab === 'schedule' && (
          <Section title={`Расписание · ${schedule.length} тренировок`}>
            {schedule.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0', margin: 0 }}>Расписание пусто</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
                {schedule.map((s, i) => (
                  <div key={s.id || i} style={{ background: '#f8fafc', borderRadius: 12, padding: '14px 16px', borderLeft: `4px solid ${s.color || '#3146A6'}` }}>
                    <p style={{ margin: 0, fontWeight: 800, color: '#0f172a', fontSize: 14 }}>{s.groupName}</p>
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>{Array.isArray(s.days) ? s.days.join(', ') : (s.day || '—')} · {s.time}</p>
                    {s.coachName && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#94a3b8' }}>{s.coachName}</p>}
                  </div>
                ))}
              </div>
            )}
          </Section>
        )}

        {/* LEADS */}
        {activeTab === 'leads' && (
          <Section title={`Лиды · ${leads.length}`}>
            {leads.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0', margin: 0 }}>Лидов нет</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      {['Имя', 'Телефон', 'Вид спорта', 'Статус', 'Добавлен'].map(h => (
                        <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((l, i) => (
                      <tr key={l.id || i} style={{ borderTop: '1px solid #f1f5f9', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                        <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a' }}>{l.name}</td>
                        <td style={{ padding: '12px 14px', color: '#475569' }}>{l.phone || '—'}</td>
                        <td style={{ padding: '12px 14px', color: '#475569' }}>{l.sport || '—'}</td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: l.status === 'converted' ? '#f0fdf4' : '#fef9c3', color: l.status === 'converted' ? '#15803d' : '#92400e' }}>
                            {l.status === 'new' ? 'Новый' : l.status === 'converted' ? 'Конвертирован' : l.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', color: '#94a3b8', fontSize: 12 }}>{fmtDate(l.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>
        )}
      </div>
    </div>
  );
};
