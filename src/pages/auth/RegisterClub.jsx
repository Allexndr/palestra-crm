import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Navbar } from '../../components/layout/Navbar';
import { Autocomplete } from '../../components/ui/Autocomplete';
import { MartialArtsSelector } from '../../components/ui/MartialArtsSelector';
import { simulateSendEmail } from '../../utils/sendpulse';
import { useAdmin } from '../../context/AdminContext';

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
  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const navigate = useNavigate();
  const { login: signIn } = useAdmin();
  const [searchParams] = useSearchParams();
  const pendingTariff = useMemo(() => {
    const tariff = searchParams.get('tariff');
    if (tariff) {
      const totalPrice = Number(searchParams.get('total')) || 9000;
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

  // Phone Masking (+7 (XXX) XXX-XX-XX)
  const handlePhoneChange = (e) => {
    let digits = e.target.value.replace(/\D/g, '');
    if (digits.startsWith('7') || digits.startsWith('8')) {
      digits = digits.substring(1);
    }

    let formatted = '+7';
    if (digits.length > 0) formatted += ' (' + digits.substring(0, 3);
    if (digits.length >= 4) formatted += ') ' + digits.substring(3, 6);
    if (digits.length >= 7) formatted += '-' + digits.substring(6, 8);
    if (digits.length >= 9) formatted += '-' + digits.substring(8, 10);
    handleInputChange('phone', formatted);
  };

  // Validation
  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = "Укажите имя";
    if (!formData.lastName) newErrors.lastName = "Укажите фамилию";
    
    if (!formData.phone || formData.phone.length < 18) {
      newErrors.phone = "Введите полный номер: +7 (XXX) XXX-XX-XX";
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

  const handleNext = () => {
    let isValid = false;
    if (step === 1) isValid = validateStep1();
    if (step === 2) isValid = validateStep2();
    if (step === 3) isValid = validateStep3();

    if (!isValid) return;

    if (step < 3) {
      setStep(step + 1);
    } else {
      submitForm();
    }
  };

  const submitForm = async () => {
    setIsLoading(true);
    try {
      const tempPassword = generateTemporaryPassword();
      const accountLogin = formData.email;

      const apiResponse = await fetch('/api/auth/register-club', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData, tariff: pendingTariff, password: tempPassword }),
      });
      const apiData = await apiResponse.json();
      if (!apiResponse.ok) {
        throw new Error(apiData.error || 'Ошибка создания клуба');
      }

      const res = await simulateSendEmail(formData.email, formData.clubName, accountLogin);
      
      if (res.success) {
        await signIn({ email: formData.email, password: tempPassword });
        setSuccessData({ login: accountLogin, password: tempPassword });
        setIsSuccess(true);
      } else {
        throw new Error(res.error || "Ошибка отправки email");
      }
    } catch (err) {
      setErrors({ form: "Произошла ошибка при создании клуба: " + err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main id="main-content" tabIndex={-1} className={`auth-page ${pendingTariff && !isSuccess ? 'auth-page--wide' : ''}`}>
        <div className="auth-page__inner">
          
          <Card style={{ flex: 1, padding: 'var(--space-8)', position: 'relative' }}>
            
            {isSuccess ? (
              <div className="text-center animate-up">
                <div style={{ 
                  width: '80px', height: '80px', borderRadius: '50%', 
                  backgroundColor: 'var(--color-success)', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto var(--space-6)', fontSize: '40px'
                }}>✓</div>
                <h2 className="h2 mb-4" style={{ fontFamily: 'var(--font-family-display)' }}>Клуб успешно создан!</h2>
                <p className="text-secondary mb-6">Мы отправили письмо с подтверждением и инструкциями на <strong style={{ color: 'var(--color-text-primary)' }}>{formData.email}</strong>.</p>
                
                <div style={{ backgroundColor: 'var(--color-bg)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', marginBottom: 'var(--space-8)', textAlign: 'left' }}>
                  <p className="text-sm text-muted mb-2 uppercase tracking-wide font-bold">Демо-доступ (для тестирования)</p>
                  <p className="mb-1"><span className="text-secondary">Логин:</span> <strong style={{ fontFamily: 'monospace' }}>{successData.login}</strong></p>
                  <p><span className="text-secondary">Пароль:</span> <strong style={{ fontFamily: 'monospace' }}>{successData.password}</strong></p>
                </div>

                <Button variant="primary" onClick={() => navigate('/admin')} style={{ width: '100%' }}>
                  Перейти в Панель Управления
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-8 text-center">
                  <h2 className="h2 mb-2" style={{ fontFamily: 'var(--font-family-display)' }}>Регистрация клуба</h2>
                  <p className="text-secondary text-sm font-medium">Шаг {step} из 3</p>
                  
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

                {step === 1 && (
                  <div className="flex flex-col gap-5 animate-fade-in">
                    <div className="flex gap-4 responsive-row">
                      <div className="flex-1">
                        <Input 
                          label="Имя владельца" placeholder="Иван" 
                          value={formData.firstName} onChange={(e) => handleInputChange('firstName', e.target.value)} 
                          error={errors.firstName}
                        />
                      </div>
                      <div className="flex-1">
                        <Input 
                          label="Фамилия" placeholder="Иванов" 
                          value={formData.lastName} onChange={(e) => handleInputChange('lastName', e.target.value)} 
                          error={errors.lastName}
                        />
                      </div>
                    </div>
                    <Input 
                      label="Телефон" 
                      placeholder="+7 (707) 000-00-00" 
                      value={formData.phone} 
                      onChange={handlePhoneChange} 
                      error={errors.phone}
                    />
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
                  <div className="flex flex-col gap-5 animate-fade-in" style={{ position: 'relative', zIndex: 20 }}>
                    <Input 
                      label="Название клуба" 
                      placeholder="Fight Club Almaty" 
                      value={formData.clubName} 
                      onChange={(e) => handleInputChange('clubName', e.target.value)} 
                      error={errors.clubName}
                    />
                    
                    <Autocomplete 
                      label="Город"
                      placeholder="Начните вводить город..."
                      options={KAZAKHSTAN_CITIES}
                      value={formData.city}
                      onChange={(val) => handleInputChange('city', val)}
                      error={errors.city}
                    />

                      <Input 
                        label="Адрес" 
                        placeholder={formData.city ? "Например: Жетысу 4 дом 22" : "Сначала выберите город"} 
                        value={formData.address} 
                        onChange={(e) => handleInputChange('address', e.target.value)} 
                        disabled={!formData.city}
                        error={errors.address}
                      />
                  </div>
                )}

                {step === 3 && (
                  <div className="flex flex-col gap-6 animate-fade-in">
                    <div>
                      <label className="text-sm font-medium mb-3 block">Направления (выберите одно или несколько)</label>
                      <div style={{ border: errors.martialArts ? '1px solid var(--color-danger)' : 'none', borderRadius: 'var(--radius-sm)', padding: errors.martialArts ? '2px' : '0' }}>
                        <MartialArtsSelector 
                          selected={formData.martialArts} 
                          onChange={(selected) => handleInputChange('martialArts', selected)} 
                        />
                      </div>
                      {errors.martialArts && <p className="text-xs text-danger mt-1">{errors.martialArts}</p>}
                    </div>

                    <Input 
                      label="Примерное количество учеников" 
                      placeholder="Например: 120" 
                      type="number" 
                      value={formData.studentsCount}
                      onChange={(e) => handleInputChange('studentsCount', e.target.value)}
                      error={errors.studentsCount}
                    />
                    
                    <div style={{ backgroundColor: 'var(--color-primary-soft)', padding: 'var(--space-4)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-primary)' }}>
                      <p className="text-sm font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-family-display)' }}>Готовы к запуску!</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>После нажатия мы создадим ваш аккаунт и вышлем пароль на {formData.email || 'указанную почту'}.</p>
                    </div>
                  </div>
                )}

                <div className="flex justify-between mt-8 pt-4" style={{ borderTop: '1px solid var(--color-border)', position: 'relative', zIndex: 1 }}>
                  <Button variant="ghost" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1 || isLoading}>
                    Назад
                  </Button>
                  <Button variant="primary" onClick={handleNext} disabled={isLoading} style={{ minWidth: '140px' }}>
                    {isLoading ? 'Загрузка...' : (step === 3 ? 'Создать клуб' : 'Далее')}
                  </Button>
                </div>
              </>
            )}
          </Card>

          {pendingTariff && !isSuccess && (
            <Card style={{ width: '320px', padding: 'var(--space-6)', backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-primary)' }} className="animate-fade-in hide-on-mobile">
               <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-4">Ваш выбор</h3>
               <div className="flex flex-col gap-3 mb-6">
                 <div className="flex justify-between text-xs font-bold">
                   <span>Базовая CRM</span>
                   <span>Включено</span>
                 </div>
                 {pendingTariff.selectedFeatures.filter(f => f !== 'core').map(f => (
                   <div key={f} className="flex justify-between text-xs font-medium text-secondary">
                     <span className="capitalize">{f === 'league' ? 'RPG Лига' : f === 'store' ? 'Магазин' : f === 'schedule' ? 'Расписание' : 'Родители'}</span>
                     <span>Активно</span>
                   </div>
                 ))}
               </div>
               <div className="pt-4 border-t border-slate-200">
                  <p className="text-[10px] font-bold text-muted uppercase mb-1">Итого в месяц</p>
                  <p className="h3 text-slate-900">{pendingTariff.totalPrice.toLocaleString()} ₸</p>
               </div>
               <p className="text-[9px] text-muted mt-4">Вы сможете изменить набор функций в любое время в настройках клуба.</p>
            </Card>
          )}

        </div>
      </main>
    </>
  );
};
