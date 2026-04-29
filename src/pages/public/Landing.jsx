import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Navbar } from '../../components/layout/Navbar';
import {
  ArrowRight, CalendarDays, CheckCircle2, CreditCard,
  LockKeyhole, Trophy, UserCheck, UsersRound, Swords, Activity, BookOpen, Clock, HeartHandshake, BoxSelect
} from 'lucide-react';
import { TariffConstructor } from '../../components/landing/TariffConstructor';

// --- DATA ---
const TRUST_STRIP = ['Для MMA', 'Для бокса', 'Для борьбы', 'Для BJJ / grappling', 'Для детских групп', 'Для сетей филиалов'];

const PAIN_COMPARISON = [
  { pain: 'Ученики в Excel', outcome: 'Единая база клуба' },
  { pain: 'Расписание в чатах', outcome: 'Группы и слоты в одной системе' },
  { pain: 'Оплаты сверяют вручную', outcome: 'Видны выручка и долги' },
  { pain: 'Родители пишут в WhatsApp', outcome: 'Есть семейный кабинет' },
  { pain: 'Тренер не видит общую картину', outcome: 'У каждой роли свой рабочий контур' },
];

const CORE_OUTCOMES = [
  {
    icon: CalendarDays,
    title: 'Порядок в расписании',
    text: 'Тренеры, залы, группы и переносы больше не живут в разных местах.',
  },
  {
    icon: CreditCard,
    title: 'Контроль оплат',
    text: 'Владелец быстрее видит выручку, долги и загрузку по группам.',
  },
  {
    icon: HeartHandshake,
    title: 'Спокойствие для родителей',
    text: 'Родители видят посещаемость, прогресс и важные события без лишних переписок.',
  },
  {
    icon: UserCheck,
    title: 'Удержание учеников',
    text: 'Личный кабинет, достижения, рейтинги и прогресс помогают ученику оставаться в системе дольше.',
  },
];

const DIFFERENTIATION = [
  {
    icon: UsersRound,
    title: 'Семейный контур',
    text: 'Родительский кабинет, уведомления, контроль посещаемости ребёнка.',
  },
  {
    icon: Trophy,
    title: 'Лига и прогресс',
    text: 'Рейтинги, достижения, пояса, история роста ученика.',
  },
  {
    icon: Swords,
    title: 'Под клубы единоборств',
    text: 'Группы, спарринги, возрастные категории, направления.',
  },
  {
    icon: BoxSelect,
    title: 'Мультиклубный сценарий',
    text: 'Филиалы, роли, общая картина для владельца.',
  },
];

const ROLE_CARDS = [
  {
    title: 'Владелец',
    text: 'Видит филиалы, выручку, долги, загрузку групп и общую картину клуба.',
  },
  {
    title: 'Администратор',
    text: 'Ведёт лиды, учеников, абонементы, расписание и переносы без ручной путаницы.',
  },
  {
    title: 'Тренер',
    text: 'Видит состав группы, посещаемость, прогресс и ближайшие тренировки.',
  },
  {
    title: 'Родитель',
    text: 'Следит за расписанием ребёнка, посещаемостью, событиями и достижениями.',
  },
  {
    title: 'Ученик',
    text: 'Смотрит тренировки, прогресс, рейтинг и личные достижения.',
  },
];

const LAUNCH_STEPS = [
  {
    number: '01',
    title: 'Создаёте структуру клуба, филиалы и направления',
  },
  {
    number: '02',
    title: 'Переносите учеников, группы и тренеров',
  },
  {
    number: '03',
    title: 'Публикуете расписание и открываете кабинеты',
  },
  {
    number: '04',
    title: 'Контролируете оплаты, посещаемость и прогресс',
  },
];

const FAQ = [
  {
    q: 'Palestra заменяет CRM или дополняет её?',
    a: 'Для небольшого и среднего клуба Palestra закрывает базовую CRM: ученики, группы, расписание, оплаты и личные кабинеты. Вы можете полностью отказаться от таблиц.',
  },
  {
    q: 'Подходит ли для сети филиалов?',
    a: 'Да. В продукте заложены филиалы, группы, тренеры и общий контроль владельца по всей структуре клуба.',
  },
  {
    q: 'Что получает родитель?',
    a: 'Родитель видит расписание, посещения, прогресс ребёнка и ключевые события клуба без лишних переписок в WhatsApp.',
  },
  {
    q: 'Можно начать без долгого внедрения?',
    a: 'Да. Базовый сценарий рассчитан на быстрый запуск: структура клуба, база учеников, расписание и доступы. Базовый запуск можно пройти быстро: сначала порядок, потом расширение.',
  },
];

// --- COMPONENTS ---
export const Landing = () => {
  const tariffRef = useRef(null);
  const scrollToTariff = () => {
    tariffRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: 'white', fontFamily: 'Outfit, sans-serif' }}>
      <Navbar onPricingClick={scrollToTariff} />

      {/* 1. HERO SECTION */}
      <header style={{ paddingTop: '140px', paddingBottom: '80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -200, right: -200, width: 600, height: 600, background: 'radial-gradient(circle, rgba(49, 70, 166, 0.4) 0%, rgba(15, 23, 42, 0) 70%)', borderRadius: '50%' }} />
        
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: 'min(56px, 12vw)', fontWeight: 900, lineHeight: 1.1, margin: '0 0 24px', letterSpacing: '-0.02em', maxWidth: 900 }}>
            Соберите клуб единоборств <br />
            <span style={{ color: '#3b82f6' }}>в одну систему</span>
          </h1>
          
          <p style={{ fontSize: 'min(20px, 5vw)', lineHeight: 1.5, color: '#cbd5e1', margin: '0 0 40px', maxWidth: 700 }}>
            Ученики, тренеры, расписание, оплаты, родители и прогресс — в одной CRM для MMA, бокса, борьбы и других клубов единоборств.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', marginBottom: 40, textAlign: 'left' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', color: '#94a3b8', fontSize: 14 }}>
              <CheckCircle2 size={16} color="#3b82f6" /> Без Excel, WhatsApp и ручной сверки
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', color: '#94a3b8', fontSize: 14 }}>
              <CheckCircle2 size={16} color="#3b82f6" /> Бесплатный старт для небольшого клуба
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', color: '#94a3b8', fontSize: 14 }}>
              <CheckCircle2 size={16} color="#3b82f6" /> Родители, тренеры и администраторы видят свой контур
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/auth/register-club" style={{ textDecoration: 'none' }}>
              <Button style={{ padding: '16px 32px', fontSize: 18 }}>Подключить бесплатно</Button>
            </Link>
            <Button variant="secondary" style={{ padding: '16px 32px', fontSize: 18, background: 'rgba(255,255,255,0.1)' }}>Посмотреть демо</Button>
          </div>
          <p style={{ marginTop: 16, fontSize: 13, color: '#64748b' }}>1 филиал, 15 учеников, 3 тренера — бесплатно. Без карты.</p>

          {/* Product Visual Mockup */}
          <div style={{ width: '100%', maxWidth: 1000, marginTop: 60, background: '#1e293b', borderRadius: 24, padding: 24, border: '1px solid #334155', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Сегодня в клубе</h3>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#94a3b8' }}>Palestra Almaty</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#eab308' }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#22c55e' }} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
              {[
                { label: 'Групп сегодня', value: '14' },
                { label: 'Ожидают оплаты', value: '6' },
                { label: 'Давно не были', value: '3' },
                { label: 'Выручка за месяц', value: '3.2M ₸' },
              ].map(o => (
                <div key={o.label} style={{ background: '#0f172a', padding: 16, borderRadius: 12, textAlign: 'left' }}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>{o.label}</div>
                  <div style={{ fontSize: 24, fontWeight: 800 }}>{o.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* 2. TRUST STRIP */}
      <section style={{ borderTop: '1px solid #1e293b', borderBottom: '1px solid #1e293b', padding: '32px 0', background: '#0f172a' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px' }}>
          <p style={{ textAlign: 'center', fontSize: 14, color: '#94a3b8', margin: '0 0 24px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Создано для клубов единоборств, а не для абстрактного фитнеса
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center', alignItems: 'center' }}>
            {TRUST_STRIP.map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#cbd5e1', fontWeight: 700, fontSize: 15 }}>
                <CheckCircle2 size={16} color="#3b82f6" /> {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. PAIN -> OUTCOME */}
      <section style={{ padding: '100px 0', background: '#0a0f1d' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 32px' }}>
          <h2 style={{ fontSize: 'min(40px, 8vw)', fontWeight: 900, textAlign: 'center', margin: '0 0 16px' }}>Когда клуб растёт, хаос тоже растёт</h2>
          <p style={{ textAlign: 'center', fontSize: 18, color: '#94a3b8', margin: '0 auto 60px', maxWidth: 700 }}>
            Palestra превращает разрозненные чаты, таблицы и устные договорённости в понятную систему, где у каждого есть свой рабочий экран.
          </p>
          
          <div style={{ background: '#1e293b', borderRadius: 24, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#334155', fontWeight: 800 }}>
              <div style={{ padding: '20px 32px', color: '#94a3b8' }}>Сейчас в клубе</div>
              <div style={{ padding: '20px 32px', color: '#fff', background: '#3b82f6' }}>С Palestra</div>
            </div>
            {PAIN_COMPARISON.map((row, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: i === PAIN_COMPARISON.length - 1 ? 'none' : '1px solid #334155' }}>
                <div style={{ padding: '20px 32px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }} /> {row.pain}
                </div>
                <div style={{ padding: '20px 32px', color: '#fff', display: 'flex', alignItems: 'center', gap: 12, fontWeight: 600 }}>
                  <CheckCircle2 size={18} color="#3b82f6" /> {row.outcome}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CORE OUTCOMES */}
      <section id="features" style={{ padding: '100px 0', background: '#0f172a' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px' }}>
          <h2 style={{ fontSize: 'min(40px, 8vw)', fontWeight: 900, textAlign: 'center', margin: '0 0 60px' }}>Что меняется после запуска</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {CORE_OUTCOMES.map((feature, idx) => (
              <div key={idx} style={{ background: '#1e293b', padding: 32, borderRadius: 24, border: '1px solid #334155' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <feature.icon size={24} color="#3b82f6" />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 12px' }}>{feature.title}</h3>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: '#94a3b8', margin: 0 }}>{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. DIFFERENTIATION */}
      <section style={{ padding: '100px 0', background: '#0a0f1d' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px' }}>
          <h2 style={{ fontSize: 'min(40px, 8vw)', fontWeight: 900, textAlign: 'center', margin: '0 0 60px' }}>Почему Palestra отличается от обычной CRM</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24 }}>
            {DIFFERENTIATION.map((diff, idx) => (
              <div key={idx} style={{ padding: 24, borderLeft: '2px solid #3b82f6' }}>
                <diff.icon size={32} color="#3b82f6" style={{ marginBottom: 16 }} />
                <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 8px' }}>{diff.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.5, color: '#94a3b8', margin: 0 }}>{diff.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. ROLES */}
      <section id="roles" style={{ padding: '100px 0', background: '#0f172a' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px' }}>
          <h2 style={{ fontSize: 'min(40px, 8vw)', fontWeight: 900, textAlign: 'center', margin: '0 0 60px' }}>Каждый видит свой рабочий контур</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {ROLE_CARDS.map((role, idx) => (
              <div key={idx} style={{ background: '#1e293b', padding: 32, borderRadius: 24, border: '1px solid #334155' }}>
                <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 12px', color: '#fff' }}>{role.title}</h3>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: '#94a3b8', margin: 0 }}>{role.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. HOW IT WORKS */}
      <section style={{ padding: '100px 0', background: '#0a0f1d' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 32px' }}>
          <h2 style={{ fontSize: 'min(40px, 8vw)', fontWeight: 900, textAlign: 'center', margin: '0 0 16px' }}>Запуск без остановки клуба</h2>
          <p style={{ textAlign: 'center', fontSize: 16, color: '#94a3b8', margin: '0 auto 60px' }}>Базовый запуск можно пройти быстро: сначала порядок, потом расширение.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {LAUNCH_STEPS.map((step, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 24, alignItems: 'center', background: '#1e293b', padding: 24, borderRadius: 20 }}>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#3b82f6', opacity: 0.5 }}>{step.number}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#f8fafc' }}>{step.title}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. PRICING */}
      <section id="pricing" ref={tariffRef} style={{ padding: '100px 0', background: '#0f172a' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px' }}>
          <h2 style={{ fontSize: 'min(40px, 8vw)', fontWeight: 900, textAlign: 'center', margin: '0 0 16px' }}>Простые тарифы</h2>
          <p style={{ textAlign: 'center', fontSize: 18, color: '#94a3b8', margin: '0 auto 60px', maxWidth: 600 }}>
            Начните бесплатно, а платите только когда клубу станет тесно.
          </p>
          <TariffConstructor />
        </div>
      </section>

      {/* 10. FAQ */}
      <section id="faq" style={{ padding: '100px 0', background: '#0a0f1d' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 32px' }}>
          <h2 style={{ fontSize: 'min(40px, 8vw)', fontWeight: 900, textAlign: 'center', margin: '0 0 60px' }}>Что важно понять до запуска</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {FAQ.map((item, idx) => (
              <div key={idx} style={{ background: '#1e293b', padding: 32, borderRadius: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 12px' }}>{item.q}</h3>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: '#94a3b8', margin: 0 }}>{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 11. FINAL CTA */}
      <section style={{ padding: '120px 0', background: '#3b82f6', textAlign: 'center' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 32px' }}>
          <h2 style={{ fontSize: 'min(40px, 8vw)', fontWeight: 900, margin: '0 0 24px', color: 'white' }}>
            Соберите клуб в одну систему
          </h2>
          <p style={{ fontSize: 18, margin: '0 0 40px', color: 'rgba(255,255,255,0.9)', lineHeight: 1.5 }}>
            Начните бесплатно: 1 филиал, 15 учеников и 3 тренера. Когда клуб вырастет — подключите Growth и нужные модули.
          </p>
          <Link to="/auth/register-club" style={{ textDecoration: 'none' }}>
            <Button style={{ background: '#0f172a', color: 'white', padding: '16px 40px', fontSize: 18 }}>
              Подключить бесплатно
            </Button>
          </Link>
          <p style={{ marginTop: 16, fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>Без карты. Быстрый старт.</p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px 32px', background: '#0f172a', borderTop: '1px solid #1e293b', textAlign: 'center', color: '#64748b', fontSize: 14 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ fontWeight: 800, color: 'white', fontSize: 18 }}>Palestra CRM</div>
          <div>CRM-платформа для клубов единоборств</div>
          <div>© 2026 Palestra CRM · Made by MurdaSoft</div>
        </div>
      </footer>
    </div>
  );
};
