import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Crown, LogOut, Users, TrendingUp, Building2, Activity,
  ChevronRight, RefreshCw, DollarSign, UserCheck,
  CalendarDays, Target, Circle, MapPin, Mail, Plus, Trash2, Edit2, ExternalLink
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

const fmt = (n) => Number(n || 0).toLocaleString('ru-RU');
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const StatBox = ({ label, value, sub, color = '#3146A6' }) => (
  <div style={{
    background: 'white', borderRadius: 16, padding: '20px 24px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)', border: '1px solid #f0f0f0',
  }}>
    <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</p>
    <p style={{ margin: '8px 0 0', fontSize: 28, fontWeight: 900, color: '#0f172a', fontFamily: 'Outfit, sans-serif' }}>{value}</p>
    {sub && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>{sub}</p>}
  </div>
);

const Badge = ({ active }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: '3px 10px', borderRadius: 99,
    fontSize: 11, fontWeight: 700,
    background: active ? '#dcfce7' : '#f1f5f9',
    color: active ? '#15803d' : '#64748b',
  }}>
    <Circle size={6} fill={active ? '#22c55e' : '#94a3b8'} color="transparent" />
    {active ? 'Активен' : 'Не активен'}
  </span>
);

export const SuperDashboard = () => {
  const [clubs, setClubs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState('clubs');
  const [showAddPartner, setShowAddPartner] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [search, setSearch] = useState('');
  const { logout, partners, addPartner, updatePartner, removePartner } = useAdmin();
  const navigate = useNavigate();

  const load = async () => {
    setIsLoading(true);
    setError('');
    sessionStorage.removeItem('palestra-impersonate-club-id');
    try {
      const res = await fetch('/api/superadmin/clubs', { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка загрузки');
      // filter out the HQ club
      const real = (data.clubs || []).filter(c => c.name !== 'Palestra HQ');
      setClubs(real);
      setFiltered(real);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!search.trim()) { setFiltered(clubs); return; }
    const q = search.toLowerCase();
    setFiltered(clubs.filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.city?.toLowerCase().includes(q) ||
      c.stats?.adminEmail?.toLowerCase().includes(q)
    ));
  }, [search, clubs]);

  const totalStudents = clubs.reduce((s, c) => s + (c.stats?.studentsCount || 0), 0);
  const totalRevenue = clubs.reduce((s, c) => s + (c.stats?.totalRevenue || 0), 0);
  const activeClubs = clubs.filter(c => c.isActive).length;

  const handleEnterClub = (clubId) => {
    sessionStorage.setItem('palestra-impersonate-club-id', clubId);
    window.location.href = '/admin';
  };

  const handleLogout = async () => { await logout(); navigate('/auth/login'); };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Outfit, sans-serif' }}>
      {/* Header */}
      <header style={{
        background: '#0f172a', padding: '0 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 64, position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #3146A6, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Crown size={18} color="white" />
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 900, color: 'white', fontSize: 15 }}>Palestra SuperAdmin</p>
            <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>murdasoft@gmail.com</p>
          </div>
        </div>
        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 8, padding: '7px 14px', color: '#f87171',
          fontWeight: 700, fontSize: 13, cursor: 'pointer',
        }}>
          <LogOut size={15} /> Выйти
        </button>
      </header>

      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px' }}>
        {/* Page title */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: '#0f172a' }}>Обзор платформы</h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 14 }}>
            Все клубы в реальном времени · {clubs.length} клубов зарегистрировано
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: 24, marginBottom: 32, borderBottom: '1px solid #e2e8f0' }}>
          <button 
            onClick={() => setView('clubs')}
            style={{ 
              padding: '12px 4px', fontSize: 14, fontWeight: 700, 
              color: view === 'clubs' ? '#3146A6' : '#94a3b8',
              borderBottom: `2px solid ${view === 'clubs' ? '#3146A6' : 'transparent'}`,
              background: 'none', border: 'none', cursor: 'pointer', outline: 'none'
            }}
          >
            Клубы
          </button>
          <button 
            onClick={() => setView('partners')}
            style={{ 
              padding: '12px 4px', fontSize: 14, fontWeight: 700, 
              color: view === 'partners' ? '#3146A6' : '#94a3b8',
              borderBottom: `2px solid ${view === 'partners' ? '#3146A6' : 'transparent'}`,
              background: 'none', border: 'none', cursor: 'pointer', outline: 'none'
            }}
          >
            С нами работают (Лендинг)
          </button>
        </div>

        {view === 'clubs' ? (
          <>
        {/* KPI Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 40 }}>
          <StatBox label="Всего клубов" value={clubs.length} sub="зарегистрировано" />
          <StatBox label="Активных (7д)" value={activeClubs} sub={`из ${clubs.length}`} color="#22c55e" />
          <StatBox label="Учеников" value={fmt(totalStudents)} sub="по всем клубам" />
          <StatBox label="Общая выручка" value={`${fmt(totalRevenue)} ₸`} sub="по всей платформе" />
        </div>

        {/* Search + Refresh */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск по клубу, городу, email..."
              style={{
                width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0',
                borderRadius: 10, fontSize: 14, outline: 'none', background: 'white',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <button onClick={load} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px',
            background: 'white', border: '1px solid #e2e8f0', borderRadius: 10,
            fontWeight: 600, fontSize: 13, cursor: 'pointer', color: '#475569',
          }}>
            <RefreshCw size={14} /> Обновить
          </button>
        </div>

        {error && (
          <div style={{ padding: 16, background: '#fef2f2', color: '#b91c1c', borderRadius: 10, marginBottom: 24, border: '1px solid #fca5a5' }}>
            {error}
          </div>
        )}

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 80, color: '#94a3b8', fontWeight: 600 }}>Загрузка клубов...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80, color: '#94a3b8', fontWeight: 600 }}>
            {clubs.length === 0 ? 'Нет зарегистрированных клубов.' : 'Ничего не найдено.'}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 20 }}>
            {filtered.map(club => (
              <div key={club.id} style={{
                background: 'white', borderRadius: 20, padding: 24,
                border: '1px solid #f0f0f0',
                boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                display: 'flex', flexDirection: 'column', gap: 16,
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: club.primary_color || '#3146A6',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 20, fontWeight: 900, color: 'white',
                      overflow: 'hidden',
                    }}>
                      {club.logo_blob_url && !club.logo_blob_url.includes('palestra-logo')
                        ? <img src={club.logo_blob_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : (club.name?.[0] || '?')}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 800, fontSize: 16, color: '#0f172a' }}>{club.name}</p>
                      <p style={{ margin: 0, fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <MapPin size={11} /> {club.city || 'Город не указан'}
                      </p>
                    </div>
                  </div>
                  <Badge active={club.isActive} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {[
                    { icon: Users, label: 'Учеников', val: club.stats?.studentsCount || 0 },
                    { icon: UserCheck, label: 'Тренеров', val: club.stats?.coachesCount || 0 },
                    { icon: Building2, label: 'Групп', val: club.stats?.groupsCount || 0 },
                    { icon: Target, label: 'Лидов', val: club.stats?.leadsCount || 0 },
                    { icon: CalendarDays, label: 'Тренировок', val: club.stats?.sessionsCount || 0 },
                    { icon: DollarSign, label: 'Выручка', val: `${fmt(club.stats?.totalRevenue)} ₸` },
                  ].map(({ icon: Icon, label, val }) => (
                    <div key={label} style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                        <Icon size={12} color="#94a3b8" />
                        <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
                      </div>
                      <p style={{ margin: 0, fontWeight: 800, fontSize: 15, color: '#0f172a' }}>{val}</p>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid #f1f5f9' }}>
                  <div>
                    <span style={{
                      padding: '4px 12px', borderRadius: 99,
                      background: club.stats?.tariff === 'Growth' ? '#eff6ff' : '#f0fdf4',
                      color: club.stats?.tariff === 'Growth' ? '#1d4ed8' : '#15803d',
                      fontWeight: 800, fontSize: 12,
                    }}>
                      {club.stats?.tariff || 'Starter'}
                    </span>
                  </div>
                  {club.stats?.adminEmail && (
                    <span style={{ fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Mail size={11} /> {club.stats.adminEmail}
                    </span>
                  )}
                </div>

                <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>
                  Активность: {fmtDate(club.lastActivity)} · Создан: {fmtDate(club.created_at)}
                </p>

                <div style={{ display: 'flex', gap: 8 }}>
                  <Link
                    to={`/superadmin/club/${club.id}`}
                    style={{
                      flex: 1, padding: '11px 0', textAlign: 'center',
                      background: '#f8fafc', border: '1px solid #e2e8f0',
                      borderRadius: 10, fontWeight: 700, fontSize: 13,
                      color: '#0f172a', textDecoration: 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}
                  >
                    Детали <ChevronRight size={14} />
                  </Link>
                  <button
                    onClick={() => handleEnterClub(club.id)}
                    style={{
                      flex: 1, padding: '11px 0',
                      background: '#0f172a', border: 'none',
                      borderRadius: 10, fontWeight: 700, fontSize: 13,
                      color: 'white', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}
                  >
                    <Activity size={14} /> Войти в клуб
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        </>
        ) : (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Управление партнерами</h2>
              <button 
                onClick={() => setShowAddPartner(true)}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px',
                  background: '#3146A6', color: 'white', border: 'none', borderRadius: 10,
                  fontWeight: 700, cursor: 'pointer'
                }}
              >
                <Plus size={18} /> Добавить логотип
              </button>
            </div>

            {(showAddPartner || editingPartner) && (
              <PartnerForm 
                initialData={editingPartner}
                onCancel={() => { setShowAddPartner(false); setEditingPartner(null); }}
                onSubmit={(data) => {
                  if (editingPartner) {
                    updatePartner(editingPartner.id, data);
                  } else {
                    addPartner(data);
                  }
                  setShowAddPartner(false);
                  setEditingPartner(null);
                }}
              />
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {partners.map(p => (
                <div key={p.id} style={{ background: 'white', padding: 20, borderRadius: 16, border: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 48, height: 48, background: '#f8fafc', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                      {p.logoUrl ? <img src={p.logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <Building2 size={24} color="#94a3b8" />}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 800, fontSize: 14 }}>{p.name}</p>
                      <a href={p.link} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: '#3146A6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                        {p.link?.replace(/^https?:\/\//, '')?.substring(0, 20)}... <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setEditingPartner(p)} style={{ padding: 8, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, color: '#475569', cursor: 'pointer' }}><Edit2 size={14} /></button>
                    <button onClick={() => removePartner(p.id)} style={{ padding: 8, background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 8, color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
              {partners.length === 0 && (
                <div style={{ gridColumn: '1/-1', padding: '60px', textAlign: 'center', color: '#94a3b8', background: 'white', borderRadius: 16, border: '2px dashed #e2e8f0' }}>
                  <Building2 size={40} style={{ margin: '0 auto 12px', display: 'block' }} />
                  <p style={{ fontWeight: 600 }}>Список партнеров пуст</p>
                  <p style={{ fontSize: 13 }}>Добавьте первый клуб для отображения на лендинге</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const PartnerForm = ({ onSubmit, onCancel, initialData }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [logoUrl, setLogoUrl] = useState(initialData?.logoUrl || '');
  const [link, setLink] = useState(initialData?.link || '');

  return (
    <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0', marginBottom: 32, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <h3 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 900 }}>{initialData ? 'Редактировать партнера' : 'Добавить партнера'}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.05em' }}>Название клуба</label>
          <input value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', outline: 'none' }} placeholder="Fight Club X" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.05em' }}>URL Логотипа</label>
          <input value={logoUrl} onChange={e => setLogoUrl(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', outline: 'none' }} placeholder="https://image-hosting.com/logo.png" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.05em' }}>Ссылка на сайт/инсту</label>
          <input value={link} onChange={e => setLink(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', outline: 'none' }} placeholder="https://instagram.com/..." />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <button onClick={() => onSubmit({ name, logoUrl, link })} style={{ padding: '12px 24px', background: '#3146A6', color: 'white', border: 'none', borderRadius: 10, fontWeight: 800, cursor: 'pointer' }}>
          {initialData ? 'Обновить данные' : 'Опубликовать'}
        </button>
        <button onClick={onCancel} style={{ padding: '12px 24px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 10, fontWeight: 800, cursor: 'pointer' }}>Отмена</button>
      </div>
    </div>
  );
};
