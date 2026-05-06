import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Users, UserCheck, Building2, CalendarDays,
  DollarSign, Target, Activity, Crown, MapPin, Mail,
  Phone, TrendingUp, TrendingDown, Circle, ChevronRight,
  Clock, Package, Trophy, ExternalLink, X, Settings
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

const fmt = (n) => Number(n || 0).toLocaleString('ru-RU');
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }) : '—';
const fmtTime = (d) => d ? new Date(d).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

const ModalAlert = ({ isOpen, onClose, title, message, isConfirm, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="animate-up" style={{ background: 'white', padding: 24, borderRadius: 20, width: 340, textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{title}</h3>
        <p style={{ margin: '0 0 24px', fontSize: 14, color: '#64748b', lineHeight: 1.5 }}>{message}</p>
        <div style={{ display: 'flex', gap: 8 }}>
          {isConfirm && <button onClick={onClose} style={{ flex: 1, padding: 12, background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}>Отмена</button>}
          <button onClick={() => { onConfirm ? onConfirm() : onClose(); }} style={{ flex: 1, padding: 12, background: '#3b82f6', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}>
            {isConfirm ? 'Подтвердить' : 'ОК, понятно'}
          </button>
        </div>
      </div>
    </div>
  );
};

const UserManagement = ({ clubId }) => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [modalData, setModalData] = useState({ isOpen: false });
  
  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/superadmin/club-users?clubId=${clubId}`);
      const data = await res.json();
      if (res.ok) setUsers(data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, [clubId]);

  const handleUpdateRole = async (user, newRole) => {
    setModalData({
      isOpen: true,
      title: 'Смена роли',
      message: `Вы действительно хотите изменить роль пользователя ${user.name} на ${newRole}?`,
      isConfirm: true,
      onConfirm: async () => {
        setModalData({ isOpen: false });
        try {
          const res = await fetch('/api/superadmin/club-users', {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, authUserId: user.auth_user_id, role: newRole })
          });
          if (res.ok) loadUsers();
          else throw new Error('Ошибка обновления роли');
        } catch (err) { setModalData({ isOpen: true, title: 'Ошибка', message: err.message }); }
      }
    });
  };

  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) return setModalData({ isOpen: true, title: 'Внимание', message: 'Длина пароля должна быть минимум 6 символов' });
    try {
      const res = await fetch('/api/superadmin/club-users', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: editingUser.id, authUserId: editingUser.auth_user_id, password: newPassword })
      });
      if (res.ok) {
        setModalData({ isOpen: true, title: 'Успех', message: 'Пароль успешно обновлен' });
        setEditingUser(null);
        setNewPassword('');
      } else {
        throw new Error('Ошибка обновления пароля');
      }
    } catch (err) { setModalData({ isOpen: true, title: 'Ошибка', message: err.message }); }
  };

  const handleDelete = async (user) => {
    setModalData({
      isOpen: true,
      title: 'Удаление пользователя',
      message: `Удалить пользователя ${user.name}? Действие необратимо!`,
      isConfirm: true,
      onConfirm: async () => {
        setModalData({ isOpen: false });
        try {
          const res = await fetch('/api/superadmin/club-users', {
            method: 'DELETE', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, authUserId: user.auth_user_id })
          });
          if (res.ok) loadUsers();
          else throw new Error('Ошибка удаления пользователя');
        } catch (err) { setModalData({ isOpen: true, title: 'Ошибка', message: err.message }); }
      }
    });
  };

  if (isLoading) return <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Загрузка пользователей...</div>;

  return (
    <div style={{ background: 'white', borderRadius: 20, border: '1px solid #f0f0f0', overflow: 'hidden' }}>
      <div style={{ padding: '18px 24px', borderBottom: '1px solid #f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontWeight: 800, fontSize: 15, color: '#0f172a' }}>Иерархия пользователей ({users.length})</h3>
      </div>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['Имя / Email', 'Роль', 'Дата регистрации', 'Действия'].map(h => (
                <th key={h} style={{ padding: '12px 24px', textAlign: 'left', fontWeight: 700, color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{u.name}</div>
                  <div style={{ color: '#94a3b8', fontSize: 12 }}>{u.email || u.phone || 'Нет контактов'}</div>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <select 
                    value={u.role} 
                    onChange={e => handleUpdateRole(u, e.target.value)}
                    style={{ 
                      padding: '4px 8px', borderRadius: 6, border: '1px solid #e2e8f0', 
                      background: u.role === 'admin' ? '#eff6ff' : '#f8fafc',
                      color: u.role === 'admin' ? '#1d4ed8' : '#475569',
                      fontWeight: 700, fontSize: 12, outline: 'none', cursor: 'pointer'
                    }}
                  >
                    <option value="admin">Admin</option>
                    <option value="coach">Coach</option>
                    <option value="student">Student</option>
                    <option value="parent">Parent</option>
                  </select>
                </td>
                <td style={{ padding: '16px 24px', color: '#94a3b8', fontSize: 12 }}>{fmtDate(u.created_at)}</td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setEditingUser(u)} style={{ padding: '6px 12px', background: '#f1f5f9', border: 'none', borderRadius: 6, color: '#475569', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>Пароль</button>
                    <button onClick={() => handleDelete(u)} style={{ padding: '6px 12px', background: '#fef2f2', border: 'none', borderRadius: 6, color: '#dc2626', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>Удалить</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', padding: 24, borderRadius: 16, width: 320 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>Сброс пароля</h3>
            <p style={{ margin: '0 0 12px', fontSize: 13, color: '#64748b' }}>Пользователь: <b>{editingUser.name}</b></p>
            <input type="text" placeholder="Новый пароль" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{ width: '100%', padding: 10, border: '1px solid #e2e8f0', borderRadius: 8, marginBottom: 16, boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button onClick={handleUpdatePassword} style={{ flex: 1, height: 48, borderRadius: 12, backgroundColor: '#4338ca', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>Сохранить</button>
              <button onClick={() => setEditingUser(null)} style={{ flex: 1, height: 48, borderRadius: 12, backgroundColor: '#f1f5f9', color: '#0f172a', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>Отмена</button>
            </div>
          </div>
        </div>
      )}
      <ModalAlert
        isOpen={modalData.isOpen}
        onClose={() => setModalData({ isOpen: false })}
        title={modalData.title}
        message={modalData.message}
        isConfirm={modalData.isConfirm}
        onConfirm={modalData.onConfirm}
      />
    </div>
  );
};

const ClubSettingsModal = ({ isOpen, onClose, club, appState, onSaved, onDelete }) => {
  const [formData, setFormData] = useState({
    name: club?.name || '',
    city: club?.city || '',
    address: club?.address || '',
    primary_color: club?.primary_color || '#3146A6',
    admin_email: appState?.admin_email || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [modalData, setModalData] = useState({ isOpen: false });

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/superadmin/club', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clubId: club.id, ...formData })
      });
      if (!res.ok) throw new Error('Ошибка сохранения клуба');
      onSaved(formData);
      onClose();
    } catch (err) { setModalData({ isOpen: true, title: 'Ошибка', message: err.message }); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async () => {
    if (deleteConfirmText !== 'УДАЛИТЬ') return setModalData({ isOpen: true, title: 'Ошибка', message: 'Введите УДАЛИТЬ для подтверждения удаления' });
    
    setModalData({
      isOpen: true,
      title: 'Полное удаление клуба',
      message: 'Вы абсолютно уверены? Это удалит клуб, всех его учеников, тренеров и историю навсегда! Это действие НЕОБРАТИМО!',
      isConfirm: true,
      onConfirm: async () => {
        setModalData({ isOpen: false });
        try {
          setIsSaving(true);
          const res = await fetch('/api/superadmin/club', {
            method: 'DELETE', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clubId: club.id })
          });
          if (!res.ok) throw new Error('Произошла ошибка при удалении');
          onDelete();
        } catch (err) { setModalData({ isOpen: true, title: 'Ошибка', message: err.message }); setIsSaving(false); }
      }
    });
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 480, padding: 24, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#0f172a' }}>Настройки клуба</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 4 }}>Название клуба</label>
            <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 10, boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 4 }}>Email владельца</label>
            <input type="text" value={formData.admin_email} onChange={e => setFormData({ ...formData, admin_email: e.target.value })} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 10, boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 4 }}>Город</label>
            <input type="text" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 10, boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 4 }}>Адрес</label>
            <input type="text" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 10, boxSizing: 'border-box' }} />
          </div>
        </div>

        <button onClick={handleSave} disabled={isSaving} style={{
          width: '100%', padding: 14, background: '#3146A6', color: 'white', border: 'none', borderRadius: 12,
          fontWeight: 800, fontSize: 15, cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.7 : 1, marginBottom: 32
        }}>
          {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
        </button>

        <div style={{ borderTop: '1px solid #fee2e2', paddingTop: 20 }}>
          <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 800, color: '#dc2626' }}>Опасная зона</h3>
          <p style={{ margin: '0 0 12px', fontSize: 12, color: '#991b1b' }}>Безвозвратное удаление клуба. Введите <b>УДАЛИТЬ</b> для подтверждения.</p>
          <div style={{ display: 'flex', gap: 10 }}>
            <input type="text" placeholder="УДАЛИТЬ" value={deleteConfirmText} onChange={e => setDeleteConfirmText(e.target.value)} style={{ flex: 1, padding: '10px 12px', border: '1px solid #fca5a5', borderRadius: 10, boxSizing: 'border-box' }} />
            <button onClick={handleDelete} disabled={isSaving} style={{ padding: '0 20px', background: '#dc2626', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}>Удалить клуб</button>
          </div>
        </div>
      </div>
      <ModalAlert
        isOpen={modalData.isOpen}
        onClose={() => setModalData({ isOpen: false })}
        title={modalData.title}
        message={modalData.message}
        isConfirm={modalData.isConfirm}
        onConfirm={modalData.onConfirm}
      />
    </div>
  );
};

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

const TariffModal = ({ isOpen, onClose, clubId, currentSubscription, onSaved }) => {
  const [plan, setPlan] = useState(currentSubscription?.plan || 'Starter');
  const [limits, setLimits] = useState(currentSubscription?.limits || { members: 15, coaches: 3, locations: 1 });
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/superadmin/club-tariff', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clubId,
          subscription: { plan, limits }
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update tariff');
      onSaved(data.subscription);
      onClose();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const setPreset = (p) => {
    setPlan(p);
    if (p === 'Starter') setLimits({ members: 15, coaches: 3, locations: 1 });
    if (p === 'Growth') setLimits({ members: 100, coaches: 10, locations: 5 });
    if (p === 'Enterprise' || p === 'Custom') setLimits({ members: 999999, coaches: 999999, locations: 999999 });
    if (p === 'Blocked') setLimits({ members: 0, coaches: 0, locations: 0 });
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 480, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#0f172a' }}>Управление тарифом</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
        </div>
        
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {['Starter', 'Growth', 'Enterprise', 'Custom', 'Blocked'].map(p => (
            <button key={p} onClick={() => setPreset(p)} style={{
              padding: '6px 12px', borderRadius: 99, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13,
              background: plan === p ? '#3146A6' : '#f1f5f9', color: plan === p ? 'white' : '#64748b'
            }}>
              {p}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 4 }}>Лимит учеников (999999 = безлимит)</label>
            <input type="number" value={limits.members} onChange={e => setLimits({ ...limits, members: Number(e.target.value) })} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 10, boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 4 }}>Лимит тренеров</label>
            <input type="number" value={limits.coaches} onChange={e => setLimits({ ...limits, coaches: Number(e.target.value) })} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 10, boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 4 }}>Лимит филиалов</label>
            <input type="number" value={limits.locations} onChange={e => setLimits({ ...limits, locations: Number(e.target.value) })} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 10, boxSizing: 'border-box' }} />
          </div>
        </div>

        {errorMsg && <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 12, textAlign: 'center' }}>{errorMsg}</p>}
        <button onClick={handleSave} disabled={isSaving} style={{
          width: '100%', padding: 14, background: '#3146A6', color: 'white', border: 'none', borderRadius: 12,
          fontWeight: 800, fontSize: 15, cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.7 : 1
        }}>
          {isSaving ? 'Сохранение...' : 'Применить тариф'}
        </button>
      </div>
    </div>
  );
};

export const ClubDetail = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const { logout } = useAdmin();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isTariffModalOpen, setIsTariffModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [modalData, setModalData] = useState({ isOpen: false });

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
    sessionStorage.setItem('palestra-impersonate-club-id', clubId);
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

  const tabs = ['overview', 'users', 'members', 'finances', 'schedule', 'leads'];
  const tabLabels = { overview: 'Обзор', users: 'Доступы', members: 'Студенты', finances: 'Финансы', schedule: 'Расписание', leads: 'Лиды' };

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
          <button onClick={() => setIsSettingsModalOpen(true)} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px',
            background: 'white', border: '1px solid #e2e8f0', borderRadius: 8,
            color: '#475569', fontWeight: 700, fontSize: 13, cursor: 'pointer',
          }}>
            <Settings size={13} /> Настройки клуба
          </button>
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
              <button onClick={() => setIsTariffModalOpen(true)} style={{
                padding: '6px 16px', borderRadius: 99, border: 'none', cursor: 'pointer',
                background: subscription.plan === 'Growth' ? '#eff6ff' : subscription.plan === 'Enterprise' || subscription.plan === 'Custom' ? '#f5f3ff' : '#f0fdf4',
                color: subscription.plan === 'Growth' ? '#1d4ed8' : subscription.plan === 'Enterprise' || subscription.plan === 'Custom' ? '#6d28d9' : '#15803d',
                fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6
              }}>
                <Settings size={13} /> {subscription.plan || 'Starter'}
              </button>
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

        {/* USERS / HIERARCHY */}
        {activeTab === 'users' && <UserManagement clubId={clubId} />}

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
      <TariffModal 
        isOpen={isTariffModalOpen} 
        onClose={() => setIsTariffModalOpen(false)} 
        clubId={clubId} 
        currentSubscription={subscription} 
        onSaved={(newSub) => setData({ ...data, appState: { ...data.appState, subscription: newSub } })}
      />

      <ClubSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        club={club}
        appState={appState}
        setModalData={setModalData}
        onSaved={(updated) => setData({
          ...data,
          club: { ...data.club, name: updated.name, city: updated.city, address: updated.address, primary_color: updated.primary_color },
          appState: { ...data.appState, admin_email: updated.admin_email }
        })}
        onDelete={() => navigate('/superadmin')}
      />

      <ModalAlert 
        {...modalData} 
        onClose={() => setModalData({ isOpen: false })} 
      />
    </div>
  );
};

