import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Navbar } from '../../components/layout/Navbar';
import { useAdmin } from '../../context/AdminContext';
import { Shield, Users, User, ArrowRight, Info, PlusCircle, HelpCircle, ShieldCheck } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = await login({ email, password });
      const role = user.role;
      setIsLoading(false);

      const dest =
        typeof from === 'string' && from && from !== '/auth/login'
          ? from
          : null;
      if (dest) {
        if (['admin', 'coach'].includes(role) && (dest === '/profile' || dest === '/feed' || dest === '/schedule' || dest === '/league')) {
          navigate('/admin');
        } else if (['parent', 'student'].includes(role) && dest.startsWith('/admin')) {
          navigate('/profile');
        } else {
          navigate(dest, { replace: true });
        }
      } else if (role === 'admin' || role === 'coach') {
        navigate('/admin');
      } else {
        navigate('/profile');
      }
    } catch (error) {
      setIsLoading(false);
      alert(error.message || 'Не удалось войти');
    }
  };

  return (
    <>
      <Navbar />
      <main id="main-content" tabIndex={-1} className="auth-page">
        <div className="auth-page__inner">
          <Card style={{ padding: 'var(--space-12)', boxShadow: 'var(--shadow-lg)' }}>
            <div className="text-center mb-12">
              <div style={{ 
                width: '72px', height: '72px', backgroundColor: 'var(--color-primary-soft)', 
                color: 'var(--color-primary)', borderRadius: '20px', margin: '0 auto 32px',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Shield size={36} />
              </div>
              <h1 className="h3 mb-4" style={{ fontFamily: 'var(--font-family-display)' }}>Вход в Palestra</h1>
              <p className="text-secondary text-sm">Управление вашим клубом в одном месте</p>
            </div>

            <form onSubmit={handleLogin} className="flex flex-col gap-8">
              <Input 
                label="Email" 
                type="email" 
                placeholder="example@mail.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="text-sm font-bold text-slate-700">Пароль</label>
                  <a href="#" className="text-xs text-primary font-bold hover:underline">Забыли пароль?</a>
                </div>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required
                  style={{ marginBottom: 0 }} 
                />
              </div>

              <Button variant="primary" type="submit" disabled={isLoading} style={{ width: '100%', marginTop: 'var(--space-4)' }}>
                {isLoading ? 'Загрузка...' : 'Войти в систему'}
              </Button>
            </form>
          </Card>

          <div style={{ 
            padding: 'var(--space-8)', 
            background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)', 
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-primary-soft)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-6)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ padding: '10px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', color: 'var(--color-primary)' }}>
                <PlusCircle size={24} />
              </div>
              <h4 className="text-sm font-bold text-slate-800">У вас еще нет клуба?</h4>
            </div>
            
            <div className="text-xs text-secondary leading-relaxed">
              <p className="font-bold text-slate-800 mb-2">Palestra — CRM для школ единоборств</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px 0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li>✅ <strong>Starter:</strong> 1 филиал, 15 учеников — <strong>Бесплатно</strong></li>
                <li>🚀 <strong>Growth:</strong> Подключите, когда клуб вырастет</li>
              </ul>
              <Link to="/auth/register" className="text-primary font-bold hover:underline">
                Зарегистрировать клуб за 2 минуты →
              </Link>
            </div>

            <div style={{ 
              marginTop: '8px', paddingTop: '20px', borderTop: '1px solid var(--color-primary-soft)',
              display: 'flex', gap: '12px', alignItems: 'center' 
            }}>
              <HelpCircle size={16} className="text-muted" />
              <p className="text-[10px] text-muted font-medium leading-relaxed">
                Тренерам и ученикам: попросите доступ у вашего администратора.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};
