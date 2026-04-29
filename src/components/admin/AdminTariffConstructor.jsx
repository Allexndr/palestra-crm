import React, { useMemo, useState } from 'react';
import { CheckCircle2, SlidersHorizontal, Zap } from 'lucide-react';
import { Button } from '../ui/Button';
import { FEATURE_OPTIONS, PAID_BASE_PRICE, RESOURCE_OPTIONS, calculateTariff, formatLimit } from '../../lib/tariff';

const FEATURE_NAMES = {
  crm: 'CRM клуба',
  schedule: 'Расписание',
  parentCabinet: 'Кабинет родителей',
  feed: 'Лента клуба',
};

export const AdminTariffConstructor = ({
  subscription,
  usage,
  getLimitStatus,
  updateSubscription,
}) => {
  const [draft, setDraft] = useState(subscription);
  const calculated = useMemo(() => calculateTariff(draft), [draft]);
  const yearlySaving = calculated.billingPeriod === 'yearly'
    ? Math.round((calculated.price / 0.85) - calculated.price)
    : 0;

  const updateLimit = (key, value) => {
    setDraft((prev) => ({
      ...prev,
      limits: { ...prev.limits, [key]: Number(value) },
    }));
  };

  const toggleFeature = (key) => {
    setDraft((prev) => ({
      ...prev,
      features: { ...prev.features, [key]: !prev.features?.[key] },
    }));
  };

  const setBillingPeriod = (billingPeriod) => {
    setDraft((prev) => ({ ...prev, billingPeriod }));
  };

  return (
    <div className="admin-tariff">
      <section className="admin-tariff__hero">
        <div>
          <span className="admin-tariff__eyebrow">Подключение бесплатно</span>
          <h3>Starter собирает базу, Growth продаёт рост</h3>
          <p>
            Starter даёт клубу начать без риска: 1 филиал, 15 учеников, 3 тренера,
            CRM, расписание и кабинеты. Когда клуб вырос — включается Growth от 9 000 ₸
            и нужные модули.
          </p>
          <div className="admin-tariff__included">
            {Object.entries(FEATURE_NAMES).map(([key, label]) => (
              <span key={key}><CheckCircle2 size={16} /> {label}</span>
            ))}
          </div>
        </div>
        <div className="admin-tariff__price-card">
          <span>Сейчас</span>
          <strong>{subscription.price ? `${subscription.price.toLocaleString('ru-RU')} ₸` : '0 ₸'}</strong>
          <p>{subscription.plan === 'starter' ? 'Starter бесплатно' : 'Growth'} / месяц</p>
        </div>
      </section>

      <section className="admin-tariff__growth-note">
        <strong>Growth стартует с {PAID_BASE_PRICE.toLocaleString('ru-RU')} ₸/мес</strong>
        <p>
          В базу Growth входят до 50 учеников, 5 тренеров, 1 филиал и 8 групп.
          Всё сверх этого считается по ресурсам, а модули подключаются отдельно.
        </p>
      </section>

      <section>
        <div className="admin-tariff__section-head">
          <div style={{ backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)', padding: '10px', borderRadius: '12px' }}>
            <SlidersHorizontal size={22} />
          </div>
          <div>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 900 }}>Ресурсы клуба</h4>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Масштабируйте количество учеников и тренеров под ваш рост</p>
          </div>
        </div>
        <div className="admin-tariff__resources">
          {RESOURCE_OPTIONS.map((option) => {
            const status = getLimitStatus(option.key);
            const selected = Number(draft.limits?.[option.key] || option.included);
            return (
              <article key={option.key} className="admin-tariff__resource">
                <div className="flex justify-between items-start">
                  <div>
                    <h5>{option.label}</h5>
                    <p>
                      {usage[option.key] || 0} из {formatLimit(subscription.limits?.[option.key])} занято
                    </p>
                  </div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--color-primary)', backgroundColor: 'var(--color-primary-soft)', padding: '4px 8px', borderRadius: '6px' }}>
                    {status.percent}%
                  </div>
                </div>
                
                <input
                  type="range"
                  min={option.min}
                  max={option.max}
                  step={option.step}
                  value={selected}
                  onChange={(event) => updateLimit(option.key, event.target.value)}
                />

                <div className="admin-tariff__resource-bottom">
                  <strong>{selected.toLocaleString('ru-RU')}</strong>
                  <span>Лимит Growth</span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section>
        <div className="admin-tariff__section-head">
          <div style={{ backgroundColor: '#fef3c7', color: '#d97706', padding: '10px', borderRadius: '12px' }}>
            <Zap size={22} />
          </div>
          <div>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 900 }}>Модули роста</h4>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Подключайте дополнительные инструменты по мере необходимости</p>
          </div>
        </div>
        <div className="admin-tariff__features">
          {FEATURE_OPTIONS.map((feature) => {
            const enabled = Boolean(draft.features?.[feature.key]);
            return (
              <button
                type="button"
                key={feature.key}
                className={`admin-tariff__feature ${enabled ? 'is-selected' : ''}`}
                onClick={() => toggleFeature(feature.key)}
              >
                <span>{enabled ? '✓ Подключено' : `+ ${feature.price.toLocaleString('ru-RU')} ₸`}</span>
                <strong>{feature.label}</strong>
                <small>{feature.desc}</small>
              </button>
            );
          })}
        </div>
      </section>

      <section className="admin-tariff__summary">
        <div>
          <h4>{calculated.plan === 'starter' ? 'Starter бесплатно' : 'Growth'}</h4>
          <div className="admin-tariff__billing">
            <button type="button" className={draft.billingPeriod !== 'yearly' ? 'is-active' : ''} onClick={() => setBillingPeriod('monthly')}>
              Месяц
            </button>
            <button type="button" className={draft.billingPeriod === 'yearly' ? 'is-active' : ''} onClick={() => setBillingPeriod('yearly')}>
              Год -15%
            </button>
          </div>
          {yearlySaving > 0 && <p className="text-success text-sm font-bold">Экономия {yearlySaving.toLocaleString('ru-RU')} ₸/мес</p>}
        </div>
        <div className="admin-tariff__total">
          <strong>{calculated.price.toLocaleString('ru-RU')} ₸</strong>
          <span>/ месяц</span>
        </div>
        <Button variant="primary" onClick={() => updateSubscription(calculated)}>
          {calculated.plan === 'starter' ? 'Оставить Starter' : 'Применить Growth'}
        </Button>
      </section>
    </div>
  );
};
