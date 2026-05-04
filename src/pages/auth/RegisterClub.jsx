import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Send, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Navbar } from '../../components/layout/Navbar';
import { Autocomplete } from '../../components/ui/Autocomplete';
import { MartialArtsSelector } from '../../components/ui/MartialArtsSelector';
import { useAdmin } from '../../context/AdminContext';
import { useTranslation } from '../../context/LanguageContext';

const KAZAKHSTAN_CITIES = [
  'Алматы', 'Астана', 'Шымкент', 'Караганда', 'Актобе', 'Тараз', 
  'Павлодар', 'Оскемен', 'Семей', 'Атырау', 'Костанай', 'Кызылорда', 
  'Уральск', 'Петропавловск', 'Актау'
];

const generateTemporaryPassword = () => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
  const bytes = new Uint32Array(14);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (value) => alphabet[value % alphabet.length]).join('');
};

export const RegisterClub = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { login: signIn } = useAdmin();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (isSuccess && successData?.credentials?.tgCode) {
      const tgUrl = `https://t.me/palestra_platform_bot?start=${successData.credentials.tgCode}`;
      // Open in new tab or redirect
      window.open(tgUrl, '_blank');
    }
  }, [isSuccess, successData]);
  const pendingTariff = useMemo(() => {
    const tariff = searchParams.get('tariff');
    if (tariff) {
      const totalPrice = Number(searchParams.get('total')) || 0;
      return {
        selectedFeatures: (searchParams.get('features') || 'core').split(',').filter(Boolean),
        totalPrice,
        basePrice: Number(searchParams.get('base')) || totalPrice,
      };
    }
    return null;
  }, [searchParams]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    clubName: '',
    city: '',
    address: '',
    martialArts: [],
    studentsCount: ''
  });

  // --- Handlers ---
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Phone formatting is now handled by Input type="tel"

  // Validation
  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = "Укажите имя";
    if (!formData.lastName) newErrors.lastName = "Укажите фамилию";
    
    if (!formData.phone || formData.phone.length < 18) {
      newErrors.phone = "Введите полный номер: +7 (777) 000 00 00";
    }

    if (!formData.email) {
      newErrors.email = "Укажите email";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Введите корректный email (например: name@mail.ru)";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.clubName) newErrors.clubName = "Придумайте название клуба";
    if (!formData.city) newErrors.city = "Выберите город";
    if (!formData.address) newErrors.address = "Укажите адрес";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    if (formData.martialArts.length === 0) {
      newErrors.martialArts = "Выберите хотя бы одно направление";
    }
    if (!formData.studentsCount) {
      newErrors.studentsCount = "Укажите примерное количество";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    let isValid = false;
    if (step === 1) isValid = validateStep1();
    if (step === 2) isValid = validateStep2();
    if (step === 3) isValid = validateStep3();

    if (!isValid) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (step === 1) {
      setIsLoading(true);
      try {
        const response = await fetch('/api/auth/check-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, phone: formData.phone })
        });
        const data = await response.json();
        if (data.exists) {
          const fieldMap = { email: 'Email', phone: 'Телефон' };
          setErrors({ [data.field]: `Этот ${fieldMap[data.field] || data.field} уже зарегистрирован` });
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.error("Error checking data:", err);
      }
      setIsLoading(false);
    }

    if (step === 2) {
      setIsLoading(true);
      try {
        const response = await fetch('/api/auth/check-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clubName: formData.clubName })
        });
        const data = await response.json();
        if (data.exists) {
          setErrors({ clubName: "Клуб с таким названием уже существует" });
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.error("Error checking club name:", err);
      }
      setIsLoading(false);
    }

    if (step < 3) {
      setStep(step + 1);
    } else {
      submitForm();
    }
  };

  const submitForm = async () => {
    setIsLoading(true);
    setErrors({});
    try {
      const tempPassword = generateTemporaryPassword();

      const apiResponse = await fetch('/api/auth/register-club', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData, tariff: pendingTariff, password: tempPassword }),
      });
      
      let apiData;
      try {
        apiData = await apiResponse.json();
      } catch {
        throw new Error('Сервер вернул некорректный ответ. Попробуйте позже.');
      }

      if (!apiResponse.ok) {
        if (apiResponse.status === 400 && apiData.details?.fieldErrors) {
          const fieldStepMap = {
            firstName: 1, lastName: 1, phone: 1, email: 1,
            clubName: 2, city: 2, address: 2,
            martialArts: 3, studentsCount: 3
          };
          
          const newErrors = {};
          let targetStep = step;
          let firstErrorField = null;

          Object.keys(apiData.details.fieldErrors).forEach(path => {
            // Convert dot notation (formData.email) to simple field name (email)
            const field = path.startsWith('formData.') ? path.split('.')[1] : path;
            const message = apiData.details.fieldErrors[path][0];
            
            newErrors[field] = message;
            
            if (fieldStepMap[field]) {
              if (!firstErrorField) {
                firstErrorField = field;
                targetStep = fieldStepMap[field];
              } else {
                targetStep = Math.min(targetStep, fieldStepMap[field]);
              }
            }
          });

          if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setStep(targetStep);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
          }
        }
        
        const error = new Error(apiData.error || 'Ошибка создания клуба');
        error.details = apiData.details;
        throw error;
      }

      setSuccessData(apiData);
      setIsSuccess(true);
      
      try {
        await signIn({ email: formData.email, password: tempPassword });
      } catch (authErr) {
        console.warn("Auto-login failed, but registration was successful:", authErr);
      }
    } catch (err) {
      console.error("Registration error:", err);
      let errorMsg = err.message;
      setErrors(prev => ({ ...prev, form: errorMsg }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main id="main-content" tabIndex={-1} className="auth-page">
        <div className="auth-page__inner">
          
          <Card style={{ flex: 1, padding: 'var(--space-8)', position: 'relative' }}>
            
            {isSuccess ? (
              <div className="text-center animate-up">
              <div style={{ textAlign: 'center', animation: 'fadeIn 0.5s ease-out' }}>
                <div style={{ 
                  width: '72px', height: '72px', borderRadius: '50%', 
                  backgroundColor: 'rgba(34, 197, 94, 0.1)', color: 'var(--color-success)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto var(--space-6)', fontSize: '32px',
                  border: '2px solid var(--color-success)',
                  boxShadow: '0 0 20px rgba(34, 197, 94, 0.2)'
                }}>✓</div>
                
                <h2 className="h2 mb-4" style={{ 
                  fontFamily: 'var(--font-family-display)',
                  background: 'linear-gradient(135deg, var(--color-primary) 0%, #4f46e5 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 900
                }}>
                  {t('register.success_title')}
                </h2>
                
                <p className="text-secondary mb-8" style={{ fontSize: '16px', lineHeight: '1.6' }}>
                  {t('register.success_text')}
                </p>

                {successData?.credentials?.tgCode && (
                  <div style={{ marginBottom: 'var(--space-8)' }}>
                    <a 
                      href={`https://t.me/palestra_platform_bot?start=${successData.credentials.tgCode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="button"
                      style={{ 
                        width: '100%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '12px',
                        padding: '18px',
                        backgroundColor: '#0088cc',
                        color: '#ffffff',
                        borderRadius: '16px',
                        fontSize: '18px',
                        fontWeight: '600',
                        textDecoration: 'none',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 10px 20px rgba(0, 136, 204, 0.2)',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <Send size={22} color="white" />
                      {t('register.tg_btn')}
                    </a>
                    <div style={{ 
                      marginTop: '16px', 
                      padding: '12px', 
                      backgroundColor: 'rgba(0, 136, 204, 0.05)', 
                      borderRadius: '12px',
                      fontSize: '13px', 
                      color: '#006699',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}>
                      <span>ℹ️</span>
                      {t('register.tg_hint')}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/auth/login')} 
                    style={{ 
                      width: '100%', 
                      borderColor: 'var(--color-primary)', 
                      color: 'var(--color-primary)',
                      borderRadius: '16px'
                    }}
                  >
                    {t('register.login_btn')}
                    <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                  </Button>
                </div>

                <style dangerouslySetInnerHTML={{ __html: `
                  @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                  }
                `}} />
              </div>
              </div>
            ) : (
              <>
                <div className="mb-8 text-center">
                  <h2 className="h2 mb-2" style={{ fontFamily: 'var(--font-family-display)' }}>{t('register.title')}</h2>
                  <p className="text-secondary text-sm font-medium">{t('register.step', { step })}</p>
                  
                  {/* Progress Bar */}
                  <div style={{ display: 'flex', gap: '4px', marginTop: 'var(--space-4)' }}>
                    {[1, 2, 3].map(s => (
                      <div key={s} style={{ 
                        height: '4px', 
                        flex: 1, 
                        backgroundColor: s <= step ? 'var(--color-primary)' : 'var(--color-border)',
                        borderRadius: 'var(--radius-full)',
                        transition: 'background-color 0.3s ease'
                      }} />
                    ))}
                  </div>
                </div>

                {errors.form && (
                  <div style={{ backgroundColor: 'var(--color-danger)', color: 'white', padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-6)', fontSize: '0.875rem' }}>
                    {errors.form}
                  </div>
                )}

                <div>
                    {step === 1 && (
                      <div className="flex flex-col gap-5">
                        <div className="flex gap-4 responsive-row">
                          <div className="flex-1">
                            <Input 
                              label={t('register.owner_name')} placeholder="Иван" 
                              value={formData.firstName} onChange={(e) => handleInputChange('firstName', e.target.value)} 
                              error={errors.firstName}
                            />
                          </div>
                          <div className="flex-1">
                            <Input 
                              label={t('register.owner_last_name')} placeholder="Иванов" 
                              value={formData.lastName} onChange={(e) => handleInputChange('lastName', e.target.value)} 
                              error={errors.lastName}
                            />
                          </div>
                        </div>
                        <Input 
                          label={t('register.owner_phone')} 
                          type="tel"
                          placeholder="+7 (777) 000 00 00" 
                          value={formData.phone} 
                          onChange={(e) => handleInputChange('phone', e.target.value)} 
                          error={errors.phone}
                        />
                        <p style={{ fontSize: '11px', color: 'var(--color-primary)', marginTop: '-12px', marginBottom: '0', fontWeight: 500 }}>
                          {t('register.phone_hint')}
                        </p>
                        <Input 
                          label="Email" 
                          type="email" 
                          placeholder="ivan@example.com" 
                          value={formData.email} 
                          onChange={(e) => handleInputChange('email', e.target.value)} 
                          error={errors.email}
                        />
                      </div>
                    )}

                    {step === 2 && (
                      <div className="flex flex-col gap-5" style={{ position: 'relative', zIndex: 20 }}>
                        <Input 
                          label={t('register.club_name')} 
                          placeholder="Fight Club Almaty" 
                          value={formData.clubName} 
                          onChange={(e) => handleInputChange('clubName', e.target.value)} 
                          error={errors.clubName}
                        />
                        
                        <Autocomplete 
                          label={t('register.city')}
                          placeholder={t('register.city_placeholder')}
                          options={KAZAKHSTAN_CITIES}
                          value={formData.city}
                          onChange={(val) => handleInputChange('city', val)}
                          error={errors.city}
                        />

                        <Input 
                          label={t('register.address')} 
                          placeholder={formData.city ? t('register.address_placeholder') : t('register.address_city_first')} 
                          value={formData.address} 
                          onChange={(e) => handleInputChange('address', e.target.value)} 
                          disabled={!formData.city}
                          error={errors.address}
                        />
                      </div>
                    )}

                    {step === 3 && (
                      <div className="flex flex-col gap-6">
                        <div>
                          <label className="text-sm font-medium mb-3 block">{t('register.martial_arts')}</label>
                          <div style={{ border: errors.martialArts ? '1px solid var(--color-danger)' : 'none', borderRadius: 'var(--radius-sm)', padding: errors.martialArts ? '2px' : '0' }}>
                            <MartialArtsSelector 
                              selected={formData.martialArts} 
                              onChange={(selected) => handleInputChange('martialArts', selected)} 
                            />
                          </div>
                          {errors.martialArts && <p className="text-xs text-danger mt-1">{errors.martialArts}</p>}
                        </div>

                        <Input 
                          label={t('register.students_count')} 
                          placeholder={t('register.students_placeholder')} 
                          type="number" 
                          value={formData.studentsCount}
                          onChange={(e) => handleInputChange('studentsCount', e.target.value)}
                          error={errors.studentsCount}
                        />
                        
                        <div style={{ backgroundColor: 'var(--color-primary-soft)', padding: 'var(--space-4)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-primary)' }}>
                          <p className="text-sm" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-family-display)', fontWeight: 900 }}>{t('register.ready_title')}</p>
                          <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                            {t('register.ready_text')}<br/>
                            <strong style={{ color: 'var(--color-primary)' }}>{t('register.tg_access_info')}</strong>
                          </p>
                        </div>
                      </div>
                    )}
                </div>

                <div className="flex justify-between mt-8 pt-4" style={{ borderTop: '1px solid var(--color-border)', position: 'relative', zIndex: 1 }}>
                  <Button variant="ghost" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1 || isLoading}>
                    {t('common.back')}
                  </Button>
                  <Button variant="primary" onClick={handleNext} disabled={isLoading} style={{ minWidth: '140px' }}>
                    {isLoading ? t('common.loading') : (step === 3 ? t('register.create_btn') : t('register.next'))}
                  </Button>
                </div>
                
                {errors.form && (
                  <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-3)', backgroundColor: 'rgba(194, 65, 75, 0.1)', color: 'var(--color-error)', borderRadius: 'var(--radius-sm)', fontSize: '13px', textAlign: 'center', border: '1px solid var(--color-error)' }}>
                    {errors.form}
                  </div>
                )}
              </>
            )}
          </Card>

          {pendingTariff && !isSuccess && (
            <Card style={{ width: '320px', padding: 'var(--space-6)', backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-primary)' }} className="animate-fade-in hide-on-mobile">
               <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-4">{t('register.summary.starter_free')}</h3>
               <div className="flex flex-col gap-3 mb-6">
                 <div className="flex justify-between text-xs font-bold">
                   <span>{t('register.summary.limits')}</span>
                   <span>{t('register.summary.included')}</span>
                 </div>
                 {pendingTariff.selectedFeatures.filter(f => f !== 'core').map(f => (
                   <div key={f} className="flex justify-between text-xs font-medium text-secondary">
                     <span className="capitalize">{f === 'league' ? 'RPG Лига' : f === 'store' ? 'Магазин' : f === 'schedule' ? 'Расписание' : 'Родители'}</span>
                     <span>{t('register.summary.active')}</span>
                   </div>
                 ))}
               </div>
               <div className="pt-4 border-t border-slate-200">
                  <p className="text-[10px] font-bold text-muted uppercase mb-1">{t('register.summary.total_monthly')}</p>
                  <p className="h3 text-slate-900">{pendingTariff.totalPrice.toLocaleString()} ₸</p>
               </div>
               <p className="text-[9px] text-muted mt-4">{t('register.summary.growth_hint')}</p>
            </Card>
          )}

        </div>
      </main>
    </>
  );
};
