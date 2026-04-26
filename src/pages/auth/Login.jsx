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

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    let role = 'admin';
    if (email.includes('coach')) role = 'coach';
    if (email.includes('student')) role = 'student';
    if (email.includes('parent')) role = 'parent';

    setTimeout(() => {
      login(role);
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
    }, 800);
  };

  const fillDemo = (role) => {
    if (role === 'admin') {
      setEmail('admin@palestra.fit');
      setPassword('admin123');
    } else if (role === 'coach') {
      setEmail('coach@palestra.fit');
      setPassword('coach123');
    } else if (role === 'parent') {
      setEmail('parent@palestra.fit');
      setPassword('parent123');
    } else {
      setEmail('student@palestra.fit');
      setPassword('student123');
    }
  };

  return (
    <>
      <Navbar />
      <main id="main-content" tabIndex={-1} className="container flex justify-center items-center" style={{ minHeight: 'calc(100vh - 64px)', padding: 'var(--space-16) 0', outline: 'none' }}>
        <div style={{ width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
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

            <div className="mt-16 pt-12 border-t" style={{ borderTop: '1px solid var(--color-border)' }}>
              <p className="text-[10px] font-bold text-muted uppercase tracking-[0.25em] text-center mb-8">Быстрый доступ для тестов</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => fillDemo('admin')}
                  style={{ fontSize: '0.75rem', gap: '8px', background: '#F8FAFC', border: '1px solid var(--color-border)' }}
                >
                  <Shield size={14} className="text-primary" /> Админ
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => fillDemo('coach')}
                  style={{ fontSize: '0.75rem', gap: '8px', background: '#F8FAFC', border: '1px solid var(--color-border)' }}
                >
                  <Users size={14} className="text-success" /> Тренер
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => fillDemo('parent')}
                  style={{ fontSize: '0.75rem', gap: '8px', background: '#F8FAFC', border: '1px solid var(--color-border)' }}
                >
                  <ShieldCheck size={14} className="text-indigo-600" /> Родитель
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => fillDemo('student')}
                  style={{ fontSize: '0.75rem', gap: '8px', background: '#F8FAFC', border: '1px solid var(--color-border)' }}
                >
                  <User size={14} className="text-accent" /> Ученик
                </Button>
              </div>
            </div>
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
            
            <p className="text-xs text-secondary leading-loose">
              Palestra — это профессиональная CRM для школ единоборств. 
              <Link to="/auth/register" className="text-primary font-bold hover:underline mx-1">Зарегистрируйте свой клуб</Link> 
              за 2 минуты и начните управлять группами и финансами эффективно.
            </p>

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
