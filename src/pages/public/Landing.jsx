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
import { useAdmin } from '../../context/AdminContext';
import { useTranslation } from '../../context/LanguageContext';
import { FloatingContact } from '../../components/ui/FloatingContact';

const getOperations = (t) => [
  { label: t('landing.mock.active_members'), value: '128' },
  { label: t('landing.mock.groups_today'), value: '14' },
  { label: t('landing.mock.monthly_payments'), value: '3.2M ₸' },
];

const getFeatures = (t) => [
  {
    id: 'crm',
    icon: UsersRound,
    title: t('landing.features.crm_title'),
    text: t('landing.features.crm_text'),
  },
  {
    id: 'schedule',
    icon: CalendarDays,
    title: t('landing.features.schedule_title'),
    text: t('landing.features.schedule_text'),
  },
  {
    id: 'payments',
    icon: CreditCard,
    title: t('landing.features.payments_title'),
    text: t('landing.features.payments_text'),
  },
  {
    id: 'league',
    icon: Trophy,
    title: t('landing.features.league_title'),
    text: t('landing.features.league_text'),
  },
];

const getRoleCards = (t) => [
  {
    title: t('landing.roles.owner_title'),
    text: t('landing.roles.owner_text'),
  },
  {
    title: t('landing.roles.admin_title'),
    text: t('landing.roles.admin_text'),
  },
  {
    title: t('landing.roles.coach_title'),
    text: t('landing.roles.coach_text'),
  },
  {
    title: t('landing.roles.parent_title'),
    text: t('landing.roles.parent_text'),
  },
];

const getTrustItems = (t) => [
  {
    icon: LockKeyhole,
    title: t('landing.security.roles_title'),
    text: t('landing.security.roles_text'),
  },
  {
    icon: Database,
    title: t('landing.security.data_title'),
    text: t('landing.security.data_text'),
  },
  {
    icon: UserCheck,
    title: t('landing.security.family_title'),
    text: t('landing.security.family_text'),
  },
];

const getImplementationSteps = (t) => [
  t('landing.implementation.step1'),
  t('landing.implementation.step2'),
  t('landing.implementation.step3'),
  t('landing.implementation.step4'),
];

const getFaqItems = (t) => [
  {
    q: t('landing.faq.q1'),
    a: t('landing.faq.a1'),
  },
  {
    q: t('landing.faq.q2'),
    a: t('landing.faq.a2'),
  },
  {
    q: t('landing.faq.q3'),
    a: t('landing.faq.a3'),
  },
  {
    q: t('landing.faq.q4'),
    a: t('landing.faq.a4'),
  },
];

const getFooterLinks = (t) => [
  { label: t('nav.features'), href: '#features' },
  { label: t('nav.roles'), href: '#roles' },
  { label: t('nav.security'), href: '#security' },
  { label: t('nav.launch'), href: '#implementation' },
  { label: t('nav.pricing'), href: '#pricing' },
  { label: t('nav.faq'), href: '#faq' },
];

const getFooterProductItems = (t) => [
  { label: t('landing.footer.crm'), href: '#crm' },
  { label: t('landing.footer.schedule'), href: '#schedule' },
  { label: t('landing.footer.payments'), href: '#payments' },
  { label: t('landing.footer.account'), href: '#roles' },
  { label: t('landing.footer.league'), href: '#league' }
];

export const Landing = () => {
  const { partners = [] } = useAdmin() || {};
  const { t } = useTranslation();
  const heroCardRef = useRef(null);

  const OPERATIONS = getOperations(t);
  const FEATURES = getFeatures(t);
  const ROLE_CARDS = getRoleCards(t);
  const TRUST_ITEMS = getTrustItems(t);
  const IMPLEMENTATION_STEPS = getImplementationSteps(t);
  const FAQ_ITEMS = getFaqItems(t);
  const FOOTER_LINKS = getFooterLinks(t);
  const FOOTER_PRODUCT_ITEMS = getFooterProductItems(t);

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
        <section className="landing-hero" aria-label="Первый экран" style={{ paddingTop: 'calc(var(--section-y) + 80px)' }}>
          <div className="container landing-hero-grid">
            
            <div className="animate-up">
              <h1 className="h1 mb-6" style={{ textTransform: 'uppercase', lineHeight: '1.05' }}>
                {t('landing.hero.title_part1')} <br />
                <span style={{ color: 'var(--color-primary)' }}>{t('landing.hero.title_part2')}</span>
              </h1>
              
              <p className="text-body-lg mb-8" style={{ maxWidth: '480px' }}>
                {t('landing.hero.subtitle')}
              </p>
              <div className="landing-hero-points" aria-label="Ключевые преимущества">
                {[t('landing.hero.check1'), t('landing.hero.check2'), t('landing.hero.check3'), t('landing.hero.check4')].map((item) => (
                  <span key={item}>
                    <CheckCircle2 size={16} aria-hidden />
                    {item}
                  </span>
                ))}
              </div>
              
              <div className="flex gap-4 responsive-row">
                <Link to="/auth/register" style={{ width: '100%' }}>
                  <Button variant="primary" size="lg" className="gap-2 text-lg w-full">
                    {t('landing.hero.cta_free')} <ArrowRight size={24} />
                  </Button>
                </Link>
                <a href="#features" style={{ textDecoration: 'none', width: '100%' }}>
                  <Button variant="secondary" size="lg" className="text-lg w-full">{t('landing.hero.cta_features')}</Button>
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
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 800 }}>{t('landing.mock.partner_case')}</p>
                    <h3 style={{ color: '#fff', fontFamily: 'var(--font-family-display)', fontSize: 28, fontWeight: 900, lineHeight: 1.1, margin: 0 }}>Palestra Almaty</h3>
                  </div>
                  <ShieldCheck size={30} color="var(--color-success)" aria-hidden />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
                  {OPERATIONS.map((item) => (
                    <div key={item.label} style={{ backgroundColor: 'rgba(255,255,255,0.07)', padding: 'var(--space-3)', borderRadius: 18 }}>
                      <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.65rem', marginBottom: 6, textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.08em' }}>{item.label}</p>
                      <p style={{ color: 'white', fontSize: '1.25rem', fontFamily: 'var(--font-family-display)', fontWeight: 900, lineHeight: 1 }}>{item.value}</p>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gap: 12 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: 14, padding: '14px 16px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 18 }}>
                    <span style={{ color: '#fff', fontWeight: 800, fontSize: '0.875rem' }}>18:00</span>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ color: '#fff', fontWeight: 800, margin: 0, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>MMA Junior</p>
                      <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.75rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t('landing.mock.gym_1')}</p>
                    </div>
                    <span style={{ color: 'var(--color-success)', fontWeight: 900, fontSize: '0.875rem' }}>24/28</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: 14, padding: '14px 16px', backgroundColor: 'rgba(49, 70, 166, 0.76)', borderRadius: 18 }}>
                    <span style={{ color: '#fff', fontWeight: 800, fontSize: '0.875rem' }}>19:30</span>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ color: '#fff', fontWeight: 800, margin: 0, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Boxing Pro</p>
                      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Зал 1 · спарринги</p>
                    </div>
                    <span style={{ color: '#fff', fontWeight: 900, fontSize: '0.875rem' }}>16/20</span>
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
                { k: t('landing.stats.leads_loss'), v: t('landing.stats.leads_loss_desc') },
                { k: t('landing.stats.time_saved'), v: t('landing.stats.time_saved_desc') },
                { k: t('landing.stats.ltv_boost'), v: t('landing.stats.ltv_boost_desc') },
              ].map((item) => (
                <div key={item.k} className="flex flex-col gap-1" style={{ minWidth: 'min(200px, 100%)' }}>
                  <span className="text-caption text-primary font-bold" style={{ letterSpacing: '0.12em' }}>{item.k}</span>
                  <span className="text-sm font-medium text-secondary">{item.v}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Problem Section - Designer's Insight */}
        <section className="landing-section" style={{ padding: '100px 0', backgroundColor: '#f8fafc' }}>
          <div className="container">
            <div className="landing-section-head">
              <span className="landing-eyebrow">{t('landing.problem.eyebrow')}</span>
              <h2 className="h2" style={{ textTransform: 'uppercase' }}>{t('landing.problem.title')}</h2>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-8)' }}>
              <div className="card shadow-none" style={{ border: 'none', backgroundColor: 'transparent', padding: 0 }}>
                <div style={{ color: 'var(--color-danger)', marginBottom: 16 }}>
                  <UsersRound size={32} />
                </div>
                <h3 className="h4 mb-4">{t('landing.problem.card1_title')}</h3>
                <p className="text-body">{t('landing.problem.card1_text')}</p>
              </div>
              
              <div className="card shadow-none" style={{ border: 'none', backgroundColor: 'transparent', padding: 0 }}>
                <div style={{ color: 'var(--color-danger)', marginBottom: 16 }}>
                  <CreditCard size={32} />
                </div>
                <h3 className="h4 mb-4">{t('landing.problem.card2_title')}</h3>
                <p className="text-body">{t('landing.problem.card2_text')}</p>
              </div>

              <div className="card shadow-none" style={{ border: 'none', backgroundColor: 'transparent', padding: 0 }}>
                <div style={{ color: 'var(--color-danger)', marginBottom: 16 }}>
                  <CalendarDays size={32} />
                </div>
                <h3 className="h4 mb-4">{t('landing.problem.card3_title')}</h3>
                <p className="text-body">{t('landing.problem.card3_text')}</p>
              </div>
            </div>
          </div>
        </section>

        {partners.length > 0 && (
          <section className="landing-partners-strip" style={{ padding: '60px 0', backgroundColor: '#fff', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
            <div className="container">
              <p style={{ textAlign: 'center', fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 40 }}>С нами работают:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '40px 60px' }}>
                {partners.map(p => (
                  <a key={p.id} href={p.link} target="_blank" rel="noreferrer" style={{ display: 'block', height: '36px', opacity: 0.5, transition: 'all 0.3s ease' }} className="partner-logo-link">
                    {p.logoUrl ? (
                      <img src={p.logoUrl} alt={p.name} style={{ height: '100%', width: 'auto', filter: 'grayscale(100%) brightness(0.8)' }} />
                    ) : (
                      <span style={{ fontSize: 16, fontWeight: 900, color: '#0f172a' }}>{p.name}</span>
                    )}
                  </a>
                ))}
              </div>
              <style dangerouslySetInnerHTML={{ __html: `
                .partner-logo-link:hover {
                  opacity: 1 !important;
                  transform: translateY(-2px);
                }
                .partner-logo-link img:hover {
                  filter: grayscale(0%) !important;
                }
              ` }} />
            </div>
          </section>
        )}

        <section id="features" className="landing-section" aria-labelledby="features-heading">
          <div className="container">
            <div className="landing-section-head">
              <h2 id="features-heading" className="h2" style={{ textTransform: 'uppercase' }}>{t('landing.features.title')}</h2>
              <p className="text-body-lg">{t('landing.features.subtitle')}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-6)' }}>
              {FEATURES.map(({ id, icon: Icon, title, text }) => (
                <div key={title} id={id} className="card" style={{ minHeight: 220 }}>
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
                <span className="landing-eyebrow">{t('landing.roles.eyebrow')}</span>
                <h2 id="roles-heading" className="h2 mb-4" style={{ textTransform: 'uppercase' }}>{t('landing.roles.title')}</h2>
                <p className="text-body-lg">
                  {t('landing.roles.subtitle')}
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
                <span className="landing-eyebrow">{t('landing.security.eyebrow')}</span>
                <h2 id="security-heading" className="h2 mb-4" style={{ textTransform: 'uppercase' }}>{t('landing.security.title')}</h2>
                <p className="text-body-lg">
                  {t('landing.security.subtitle')}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="implementation" className="landing-section landing-section--dark" aria-labelledby="implementation-heading">
          <div className="container">
            <div className="landing-split">
              <div>
                <span className="landing-eyebrow landing-eyebrow--dark">{t('landing.implementation.eyebrow')}</span>
                <h2 id="implementation-heading" className="h2 mb-4" style={{ textTransform: 'uppercase' }}>{t('landing.implementation.title')}</h2>
                <p className="text-body-lg">
                  {t('landing.implementation.subtitle')}
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
              <span className="landing-eyebrow" style={{ display: 'block', marginBottom: 'var(--space-3)' }}>{t('landing.faq.eyebrow')}</span>
              <h2 id="faq-heading" className="h2" style={{ textTransform: 'uppercase' }}>{t('landing.faq.title')}</h2>
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
            <h2 className="landing-cta__title">{t('landing.cta.title')}</h2>
            <p className="landing-cta__lead">
              {t('landing.cta.subtitle')}
            </p>
            <Link to="/auth/register">
              <Button variant="primary" size="lg" className="text-xl" style={{ fontWeight: 800 }}>{t('landing.hero.cta_free')}</Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="container">
          <div className="landing-footer__grid">
            <section className="landing-footer__brand" aria-label="О продукте Palestra">
              <Link to="/" className="landing-footer__logo" aria-label="Palestra — на главную" style={{ display: 'block', marginBottom: '24px' }}>
                <img src="/assets/logo-white.png" alt="Palestra Logo" style={{ height: '120px', width: 'auto', objectFit: 'contain' }} decoding="async" />
              </Link>
              <p>
                {t('landing.footer.cta_text')}
              </p>
            </section>

            <nav className="landing-footer__nav" aria-label="Навигация в футере">
              <h2>{t('landing.footer.nav_title')}</h2>
              {FOOTER_LINKS.map((link) => (
                <a key={link.href} href={link.href}>{link.label}</a>
              ))}
            </nav>

            <section className="landing-footer__nav" aria-label="Что входит в Palestra">
              <h2>{t('landing.footer.product_title')}</h2>
              {FOOTER_PRODUCT_ITEMS.map((item) => (
                <a key={item.label} href={item.href}>{item.label}</a>
              ))}
            </section>

            <section className="landing-footer__cta" aria-label="Начать работу">
              <h2>{t('landing.footer.cta_title')}</h2>
              <p>{t('landing.footer.cta_text')}</p>
              <Link to="/auth/register">{t('landing.hero.cta_free')}</Link>
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
      <FloatingContact />
    </div>
  );
};
