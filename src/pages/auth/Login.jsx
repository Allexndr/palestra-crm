import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { AlertModal } from '../../components/ui/AlertModal';
import { useAlertModal } from '../../hooks/useModal';
import { useAdmin } from '../../context/AdminContext';
import { useTranslation } from '../../context/LanguageContext';
import { Shield, PlusCircle, HelpCircle, ChevronDown } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const { isOpen, modalProps, closeModal, error: showError } = useAlertModal();
  const { login } = useAdmin();
  const { t } = useTranslation();
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
      } else if (role === 'superadmin' || user.email === 'murdasoft@gmail.com') {
        navigate('/superadmin');
      } else if (role === 'admin' || role === 'coach') {
        navigate('/admin');
      } else {
        navigate('/profile');
      }
    } catch (error) {
      setIsLoading(false);
      showError(error.message || 'Не удалось войти');
    }
  };

  return (
    <>
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
              <h1 className="h3 mb-4" style={{ fontFamily: 'var(--font-family-display)' }}>{t('auth.login_title')}</h1>
              <p className="text-secondary text-sm">{t('auth.login_subtitle')}</p>
            </div>

            <form onSubmit={handleLogin} className="flex flex-col gap-8">
              <Input 
                label={t('auth.login_or_email')} 
                type="text" 
                placeholder="ваш_логин или mail@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="text-sm font-bold text-slate-700">{t('auth.password')}</label>
                  <button
                    type="button"
                    onClick={() => setShowForgot(v => !v)}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontSize: 12, fontWeight: 700, padding: 0 }}
                  >
                    {t('auth.forgot_password')} <ChevronDown size={13} style={{ transform: showForgot ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                  </button>
                </div>
                {showForgot && (
                  <div style={{ background: '#f0f4ff', border: '1px solid #c7d2fe', borderRadius: 12, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
                    <p style={{ margin: 0, fontSize: 12, color: '#374151', lineHeight: 1.5 }}>
                      Восстановите доступ через нашего Telegram-бота — он найдёт ваш логин и пароль по номеру телефона.
                    </p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <a
                        href="https://t.me/palestra_platform_bot"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#229ED9', color: 'white', borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: 'none' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z"/></svg>
                        Восстановить через бота
                      </a>
                    </div>
                    <p style={{ margin: 0, fontSize: 11, color: '#6b7280' }}>
                      Напишите боту и нажмите «Восстановить доступ»
                    </p>
                  </div>
                )}
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
                {isLoading ? t('common.loading') : t('auth.login_btn')}
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
              <h4 className="text-sm font-bold text-slate-800">{t('promo.no_club')}</h4>
            </div>
            
            <div className="text-xs text-secondary leading-relaxed">
              <p className="font-bold text-slate-800 mb-2">{t('promo.desc')}</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px 0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li>✅ <strong>Starter:</strong> {t('promo.starter')} <strong>{t('promo.free')}</strong></li>
                <li>🚀 <strong>Growth:</strong> {t('promo.growth')}</li>
              </ul>
              <Link to="/auth/register" className="text-primary font-bold hover:underline">
                {t('promo.register')}
              </Link>
            </div>

            <div style={{ 
              marginTop: '8px', paddingTop: '20px', borderTop: '1px solid var(--color-primary-soft)',
              display: 'flex', gap: '12px', alignItems: 'center' 
            }}>
              <HelpCircle size={16} className="text-muted" />
              <p className="text-[10px] text-muted font-medium leading-relaxed">
                {t('promo.ask_admin')}
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <AlertModal isOpen={isOpen} onClose={closeModal} {...modalProps} />
    </>
  );
};
