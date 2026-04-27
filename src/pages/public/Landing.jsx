import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Navbar } from '../../components/layout/Navbar';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Database,
  LockKeyhole,
  ShieldCheck,
  Trophy,
  UserCheck,
  UsersRound,
} from 'lucide-react';
import { TariffConstructor } from '../../components/landing/TariffConstructor';

const OPERATIONS = [
  { label: 'Активных учеников', value: '128' },
  { label: 'Групп сегодня', value: '14' },
  { label: 'Оплаты за месяц', value: '3.2M ₸' },
];

const FEATURES = [
  {
    icon: UsersRound,
    title: 'Единая база клуба',
    text: 'Ученики, родители, абонементы и история посещений без таблиц и дублей.',
  },
  {
    icon: CalendarDays,
    title: 'Расписание и группы',
    text: 'Тренеры, филиалы, занятость залов и переносы тренировок в одном контуре.',
  },
  {
    icon: CreditCard,
    title: 'Оплаты и контроль',
    text: 'Владелец видит выручку, долги и активность групп без ручной сверки.',
  },
  {
    icon: Trophy,
    title: 'Лига и прогресс',
    text: 'Рейтинги, достижения и личные кабинеты помогают удерживать учеников.',
  },
];

const ROLE_CARDS = [
  {
    title: 'Администратор',
    text: 'Ведёт лиды, учеников, абонементы, расписание и переносы без ручной сверки в чатах.',
  },
  {
    title: 'Тренер',
    text: 'Понимает состав группы, посещаемость, прогресс учеников и ближайшие тренировки.',
  },
  {
    title: 'Родитель',
    text: 'Видит расписание ребёнка, посещаемость, достижения и важные сообщения от клуба.',
  },
  {
    title: 'Ученик',
    text: 'Следит за тренировками, прогрессом, рейтингом и личными достижениями в клубе.',
  },
];

const TRUST_ITEMS = [
  {
    icon: LockKeyhole,
    title: 'Роли и доступы',
    text: 'Владелец, администратор, тренер, родитель и ученик видят только свой рабочий контур.',
  },
  {
    icon: Database,
    title: 'Данные клуба',
    text: 'Клиентская база, посещения и финансовые события отделены от публичной части продукта.',
  },
  {
    icon: UserCheck,
    title: 'Семейные сценарии',
    text: 'Для несовершеннолетних акцент на родительский кабинет и контролируемую коммуникацию.',
  },
];

const IMPLEMENTATION_STEPS = [
  'Заводите клуб, филиалы и направления',
  'Переносите учеников, группы и тренеров',
  'Публикуете расписание и открываете кабинеты',
  'Контролируете оплаты, посещаемость и прогресс',
];

const FAQ_ITEMS = [
  {
    q: 'Palestra заменяет CRM или дополняет её?',
    a: 'Для небольшого и среднего клуба Palestra закрывает базовую CRM: ученики, группы, расписание, оплаты и личные кабинеты.',
  },
  {
    q: 'Подходит ли для сети филиалов?',
    a: 'Да. В продукте заложены филиалы, группы, тренеры и общий контроль владельца по всей структуре клуба.',
  },
  {
    q: 'Что получает родитель?',
    a: 'Родитель видит расписание, посещения, прогресс ребёнка и ключевые события клуба без лишних переписок.',
  },
  {
    q: 'Можно начать без долгого внедрения?',
    a: 'Да. Базовый сценарий рассчитан на быстрый запуск: структура клуба, база учеников, расписание и доступы.',
  },
];

const FOOTER_LINKS = [
  { label: 'Возможности', href: '#features' },
  { label: 'Роли', href: '#roles' },
  { label: 'Безопасность', href: '#security' },
  { label: 'Запуск', href: '#implementation' },
  { label: 'Тариф', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];

const FOOTER_PRODUCT_ITEMS = ['CRM клуба', 'Расписание', 'Оплаты', 'Личный кабинет', 'Лига и прогресс'];

export const Landing = () => {
  const heroCardRef = useRef(null);

  const handleHeroCardMove = (event) => {
    const card = heroCardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    card.style.setProperty('--hero-rotate-x', `${(-y * 11).toFixed(2)}deg`);
    card.style.setProperty('--hero-rotate-y', `${(x * 14).toFixed(2)}deg`);
    card.style.setProperty('--hero-shift-x', `${(x * 8).toFixed(2)}px`);
    card.style.setProperty('--hero-shift-y', `${(y * 8).toFixed(2)}px`);
    card.style.setProperty('--hero-glow-x', `${((x + 0.5) * 100).toFixed(1)}%`);
    card.style.setProperty('--hero-glow-y', `${((y + 0.5) * 100).toFixed(1)}%`);
  };

  const resetHeroCard = () => {
    const card = heroCardRef.current;
    if (!card) return;

    card.style.removeProperty('--hero-rotate-x');
    card.style.removeProperty('--hero-rotate-y');
    card.style.removeProperty('--hero-shift-x');
    card.style.removeProperty('--hero-shift-y');
    card.style.removeProperty('--hero-glow-x');
    card.style.removeProperty('--hero-glow-y');
  };

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', overflowX: 'hidden' }}>
      <div style={{ 
        position: 'absolute', top: '-20%', right: '-10%', width: '70vw', height: '70vw', 
        background: 'radial-gradient(circle, rgba(49, 70, 166, 0.08) 0%, rgba(245, 243, 239, 0) 60%)', 
        zIndex: 0, borderRadius: '50%' 
      }}></div>

      <Navbar />
      
      <main id="main-content" tabIndex={-1} style={{ position: 'relative', zIndex: 1, outline: 'none' }}>
        <section className="landing-hero" aria-label="Первый экран">
          <div className="container landing-hero-grid">
            
            <div className="animate-up">
              <h1 className="h1 mb-6" style={{ textTransform: 'uppercase', lineHeight: '0.95' }}>
                Управляйте <br />
                <span style={{ color: 'var(--color-primary)' }}>бойцовским <br/>клубом</span>
              </h1>
              
              <p className="text-body-lg mb-8" style={{ maxWidth: '480px' }}>
                Palestra собирает учеников, группы, расписание, оплаты и прогресс в одну рабочую систему для клуба единоборств.
              </p>
              <div className="landing-hero-points" aria-label="Ключевые преимущества">
                {['CRM', 'Расписание', 'Оплаты', 'Личный кабинет'].map((item) => (
                  <span key={item}>
                    <CheckCircle2 size={16} aria-hidden />
                    {item}
                  </span>
                ))}
              </div>
              
              <div className="flex gap-4">
                <Link to="/auth/register">
                  <Button variant="primary" size="lg" className="gap-2 text-lg">
                    Начать работу <ArrowRight size={24} />
                  </Button>
                </Link>
                <a href="#features" style={{ textDecoration: 'none' }}>
                  <Button variant="secondary" size="lg" className="text-lg">Возможности</Button>
                </a>
              </div>
            </div>

            <div className="animate-up delay-2" style={{ position: 'relative' }}>
              <div
                ref={heroCardRef}
                className="landing-mock-3d"
                onMouseMove={handleHeroCardMove}
                onMouseLeave={resetHeroCard}
                style={{ 
                  backgroundColor: 'var(--color-text-primary)',
                  borderRadius: '32px',
                  padding: 'var(--space-6)',
                  boxShadow: '0 25px 50px -12px rgba(49, 70, 166, 0.28)',
                  border: '1px solid rgba(255,255,255,0.12)'
              }}
              >
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 800 }}>Сегодня в клубе</p>
                    <h3 style={{ color: '#fff', fontFamily: 'var(--font-family-display)', fontSize: 28, lineHeight: 1.1, margin: 0 }}>Palestra Almaty</h3>
                  </div>
                  <ShieldCheck size={30} color="var(--color-success)" aria-hidden />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
                  {OPERATIONS.map((item) => (
                    <div key={item.label} style={{ backgroundColor: 'rgba(255,255,255,0.07)', padding: 'var(--space-4)', borderRadius: 18 }}>
                      <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, marginBottom: 8, textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.08em' }}>{item.label}</p>
                      <p style={{ color: 'white', fontSize: 24, fontFamily: 'var(--font-family-display)', fontWeight: 800, lineHeight: 1 }}>{item.value}</p>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gap: 12 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '64px 1fr auto', alignItems: 'center', gap: 14, padding: '14px 16px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 18 }}>
                    <span style={{ color: '#fff', fontWeight: 800 }}>18:00</span>
                    <div>
                      <p style={{ color: '#fff', fontWeight: 800, margin: 0 }}>MMA Junior</p>
                      <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, margin: 0 }}>Зал 2 · тренер А. Карелин</p>
                    </div>
                    <span style={{ color: 'var(--color-success)', fontWeight: 900 }}>24/28</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '64px 1fr auto', alignItems: 'center', gap: 14, padding: '14px 16px', backgroundColor: 'rgba(49, 70, 166, 0.76)', borderRadius: 18 }}>
                    <span style={{ color: '#fff', fontWeight: 800 }}>19:30</span>
                    <div>
                      <p style={{ color: '#fff', fontWeight: 800, margin: 0 }}>Boxing Pro</p>
                      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, margin: 0 }}>Зал 1 · спарринги</p>
                    </div>
                    <span style={{ color: '#fff', fontWeight: 900 }}>16/20</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        <section className="landing-stats-strip" aria-label="Преимущества">
          <div className="container">
            <div
              className="flex flex-wrap justify-center"
              style={{ gap: 'var(--space-8)', textAlign: 'center' }}
            >
              {[
                { k: 'CRM + расписание', v: 'без Excel и чатов' },
                { k: 'Оплаты', v: 'видимость денег и долгов' },
                { k: 'Семьи', v: 'родители видят прогресс' },
              ].map((item) => (
                <div key={item.k} className="flex flex-col gap-1" style={{ minWidth: 'min(200px, 100%)' }}>
                  <span className="text-caption text-primary font-bold" style={{ letterSpacing: '0.12em' }}>{item.k}</span>
                  <span className="text-sm font-medium text-secondary">{item.v}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="landing-section" aria-labelledby="features-heading">
          <div className="container">
            <div className="landing-section-head">
              <h2 id="features-heading" className="h2" style={{ textTransform: 'uppercase' }}>Операционный контур клуба</h2>
              <p className="text-body-lg">Не набор красивых экранов, а рабочие сценарии владельца, администратора, тренера и семьи ученика.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-6)' }}>
              {FEATURES.map(({ icon: Icon, title, text }) => (
                <div key={title} className="card" style={{ minHeight: 220 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 16, display: 'grid', placeItems: 'center', marginBottom: 'var(--space-6)', background: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}>
                    <Icon size={24} aria-hidden />
                  </div>
                  <h3 className="h4 mb-3">{title}</h3>
                  <p className="text-body">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="roles" className="landing-section landing-section--surface" aria-labelledby="roles-heading">
          <div className="container">
            <div className="landing-split">
              <div>
                <span className="landing-eyebrow">Для всей команды</span>
                <h2 id="roles-heading" className="h2 mb-4" style={{ textTransform: 'uppercase' }}>Каждая роль понимает, что делать</h2>
                <p className="text-body-lg">
                  Лендинг должен продавать не “фичи”, а порядок в клубе. Palestra показывает ценность для людей, которые каждый день ведут тренировки, продажи и коммуникацию с семьями.
                </p>
              </div>

              <div className="landing-role-grid">
                {ROLE_CARDS.map((role) => (
                  <article key={role.title} className="landing-role-card">
                    <h3>{role.title}</h3>
                    <p>{role.text}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="security" className="landing-section" aria-labelledby="security-heading">
          <div className="container">
            <div className="landing-split landing-split--reverse">
              <div className="landing-trust-panel">
                {TRUST_ITEMS.map(({ icon: Icon, title, text }) => (
                  <article key={title} className="landing-trust-item">
                    <div aria-hidden>
                      <Icon size={22} />
                    </div>
                    <section>
                      <h3>{title}</h3>
                      <p>{text}</p>
                    </section>
                  </article>
                ))}
              </div>

              <div>
                <span className="landing-eyebrow">Доверие</span>
                <h2 id="security-heading" className="h2 mb-4" style={{ textTransform: 'uppercase' }}>Безопасность не отдельным чеклистом, а частью продукта</h2>
                <p className="text-body-lg">
                  Для CRM клуба важны не громкие обещания, а базовая дисциплина: роли, приватность семейных данных, аккуратная работа с доступами и понятная зона ответственности.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="implementation" className="landing-section landing-section--dark" aria-labelledby="implementation-heading">
          <div className="container">
            <div className="landing-split">
              <div>
                <span className="landing-eyebrow landing-eyebrow--dark">Запуск</span>
                <h2 id="implementation-heading" className="h2 mb-4" style={{ textTransform: 'uppercase' }}>Переход без хаоса в клубе</h2>
                <p className="text-body-lg">
                  Внедрение разбито на понятные шаги: сначала структура клуба и расписание, затем база учеников, кабинеты и регулярный контроль показателей.
                </p>
              </div>

              <ol className="landing-steps">
                {IMPLEMENTATION_STEPS.map((step, index) => (
                  <li key={step}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <p>{step}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section id="pricing" className="landing-pricing" aria-label="Тариф">
          <div className="container">
            <TariffConstructor />
          </div>
        </section>

        <section id="faq" className="landing-section landing-section--surface" aria-labelledby="faq-heading">
          <div className="container">
            <div className="landing-section-head">
              <span className="landing-eyebrow" style={{ display: 'block', marginBottom: 'var(--space-3)' }}>Вопросы перед стартом</span>
              <h2 id="faq-heading" className="h2" style={{ textTransform: 'uppercase' }}>Что важно понять до запуска</h2>
            </div>

            <div className="landing-faq-grid">
              {FAQ_ITEMS.map((item) => (
                <article key={item.q} className="landing-faq-card">
                  <h3>{item.q}</h3>
                  <p>{item.a}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-cta" aria-label="Регистрация">
          <div className="container">
            <h2 className="landing-cta__title">Соберите клуб в одну систему</h2>
            <p className="landing-cta__lead">
              Начните с базы: ученики, расписание, оплаты и личные кабинеты. Дальше расширяйте клуб без потери контроля.
            </p>
            <Link to="/auth/register">
              <Button variant="primary" size="lg" className="text-xl px-12">Открыть Palestra</Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="container">
          <div className="landing-footer__grid">
            <section className="landing-footer__brand" aria-label="О продукте Palestra">
              <Link to="/" className="landing-footer__logo" aria-label="Palestra — на главную">
                <img src="/palestra-logo-nav-full.png" alt="" decoding="async" />
              </Link>
              <p>
                CRM-платформа для клубов единоборств: ученики, группы, расписание, оплаты и прогресс в одной системе.
              </p>
            </section>

            <nav className="landing-footer__nav" aria-label="Навигация в футере">
              <h2>Разделы</h2>
              {FOOTER_LINKS.map((link) => (
                <a key={link.href} href={link.href}>{link.label}</a>
              ))}
            </nav>

            <section className="landing-footer__nav" aria-label="Что входит в Palestra">
              <h2>Продукт</h2>
              {FOOTER_PRODUCT_ITEMS.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </section>

            <section className="landing-footer__cta" aria-label="Начать работу">
              <h2>Готовы собрать клуб в систему?</h2>
              <p>Начните с базового тарифа и подключайте команду без долгого внедрения.</p>
              <Link to="/auth/register">Запустить Palestra</Link>
            </section>
          </div>

          <div className="landing-footer__bottom">
            <span>© 2026 Palestra CRM</span>
            <a href="http://murdasoft.vercel.app/" target="_blank" rel="noreferrer">
              Made by MurdaSoft
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
