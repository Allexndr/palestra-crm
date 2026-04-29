import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Shield, MapPin, Users, Activity, Crown } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export const SuperDashboard = () => {
  const [clubs, setClubs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { logout } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    // Clear any active impersonation on the dashboard
    localStorage.removeItem('palestra-impersonate-club-id');

    const fetchClubs = async () => {
      try {
        const res = await fetch('/api/superadmin/clubs', { credentials: 'include' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch clubs');
        setClubs(data.clubs || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchClubs();
  }, []);

  const handleEnterClub = (clubId) => {
    localStorage.setItem('palestra-impersonate-club-id', clubId);
    window.location.href = '/admin'; // Force full reload to reset context states
  };

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8fafc' }}>
        <p style={{ fontWeight: 'bold', color: '#64748b' }}>Загрузка системы...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '40px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', backgroundColor: '#4f46e5', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white' }}>
            <Crown size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', margin: 0, color: '#1e293b' }}>Super Admin</h1>
            <p style={{ margin: 0, color: '#64748b', fontSize: '14px', fontWeight: '500' }}>Глобальная панель управления платформой</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', 
            padding: '10px 16px', backgroundColor: 'white', border: '1px solid #e2e8f0', 
            borderRadius: '8px', color: '#ef4444', fontWeight: '600', cursor: 'pointer' 
          }}
        >
          <LogOut size={18} />
          Выйти
        </button>
      </header>

      {error && (
        <div style={{ padding: '16px', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: '8px', marginBottom: '24px', border: '1px solid #fca5a5' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
        {clubs.map((club) => (
          <div key={club.id} style={{ 
            backgroundColor: 'white', borderRadius: '16px', padding: '24px', 
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
            border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div style={{ 
                width: '48px', height: '48px', borderRadius: '50%', backgroundColor: club.primary_color || '#e2e8f0',
                display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden'
              }}>
                {club.logo_blob_url ? (
                  <img src={club.logo_blob_url} alt={club.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Shield size={24} color="white" />
                )}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>{club.name}</h3>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                  <MapPin size={12} /> {club.city || 'Не указан'}
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <p style={{ margin: 0, fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: '700' }}>Ученики</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                  <Users size={16} color="#4f46e5" />
                  <span style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b' }}>{club.stats?.studentsCount || 0}</span>
                </div>
              </div>
              <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <p style={{ margin: 0, fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: '700' }}>Тариф</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                  <Activity size={16} color="#10b981" />
                  <span style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b' }}>{club.stats?.tariff || 'Free'}</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => handleEnterClub(club.id)}
              style={{
                marginTop: 'auto', width: '100%', padding: '14px', backgroundColor: '#0f172a', 
                color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', 
                fontSize: '15px', cursor: 'pointer', transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1e293b'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0f172a'}
            >
              Войти в клуб
            </button>
          </div>
        ))}

        {clubs.length === 0 && !isLoading && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: '#64748b' }}>
            <p>Клубов пока нет.</p>
          </div>
        )}
      </div>
    </div>
  );
};
