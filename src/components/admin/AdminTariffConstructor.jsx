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

  const breakdown = useMemo(() => {
    const items = [];
    if (calculated.plan === 'starter') return [];
    
    items.push({ label: 'База Growth', price: PAID_BASE_PRICE });
    
    RESOURCE_OPTIONS.forEach(opt => {
      const selected = Number(draft.limits?.[opt.key] || opt.included);
      const extra = Math.max(0, selected - opt.paidIncluded);
      if (extra > 0) {
        items.push({ 
          label: `Доп. ${opt.label.toLowerCase()} (+${extra})`, 
          price: extra * opt.unitPrice 
        });
      }
    });
    
    FEATURE_OPTIONS.forEach(opt => {
      if (draft.features?.[opt.key]) {
        items.push({ label: opt.label, price: opt.price });
      }
    });
    
    return items;
  }, [draft, calculated.plan]);

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
      {subscription.plan === 'starter' && (
        <section className="admin-tariff__hero">
          <div>
            <span className="admin-tariff__eyebrow">Бесплатный старт</span>
            <h3>Starter собирает базу бесплатно</h3>
            <p>
              Вам доступен базовый функционал для начала работы: 1 филиал, до 15 учеников и 3 тренера. 
              Все основные модули CRM (расписание, кабинет родителей, лента) уже включены и работают.
            </p>
            <div className="admin-tariff__included">
              {Object.entries(FEATURE_NAMES).map(([key, label]) => (
                <span key={key}><CheckCircle2 size={16} /> {label}</span>
              ))}
            </div>
          </div>
          <div className="admin-tariff__price-card" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Ваш статус</span>
            <strong style={{ fontSize: '1.5rem' }}>Starter</strong>
            <p style={{ color: 'var(--color-success)', fontWeight: '800' }}>Всегда бесплатно</p>
          </div>
        </section>
      )}

      <section className="admin-tariff__growth-note">
        <strong>Growth от {PAID_BASE_PRICE.toLocaleString('ru-RU')} ₸/мес</strong>
        <p>
          В базовый Growth включены расширенные лимиты и все CRM-функции. 
          Дополнительные ученики (+500 ₸) и тренеры (+1 000 ₸) засчитываются автоматически при создании.
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
            const isBillable = selected > option.paidIncluded;
            const extraCount = Math.max(0, selected - option.paidIncluded);
            const extraCost = extraCount * option.unitPrice;

            return (
              <article key={option.key} className="admin-tariff__resource">
                <input
                  type="range"
                  min={option.min}
                  max={option.max}
                  step={option.step}
                  value={selected}
                  onChange={(event) => updateLimit(option.key, event.target.value)}
                  className="mb-4"
                />

                <div className="flex justify-between items-center mb-4">
                  <div>
                      <h5 className="flex items-center gap-2 m-0">
                        {option.label}
                        <span className="text-[10px] font-black px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md">
                          {option.unitPrice} ₸/ед.
                        </span>
                      </h5>
                    <p style={{ fontSize: '0.7rem' }}>
                      {usage[option.key] || 0} занято из {formatLimit(draft.limits?.[option.key])}
                    </p>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="text"
                      inputMode="numeric"
                      value={selected === 0 ? '' : selected.toLocaleString('ru-RU').replace(/\s/g, '')}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        if (val === '') {
                          updateLimit(option.key, 0);
                        } else {
                          const num = parseInt(val, 10);
                          updateLimit(option.key, Math.min(num, option.max));
                        }
                      }}
                      onBlur={() => {
                        if (selected < option.min) {
                          updateLimit(option.key, option.min);
                        }
                      }}
                      style={{
                        width: '80px',
                        padding: '6px 10px',
                        borderRadius: '12px',
                        border: '2px solid var(--color-primary)',
                        fontWeight: '800',
                        textAlign: 'center',
                        fontSize: '1rem',
                        color: 'var(--color-primary)',
                        backgroundColor: 'white'
                      }}
                    />
                  </div>
                </div>

                <div className="admin-tariff__resource-bottom" style={{ borderTop: '1px dashed var(--color-border)', paddingTop: '12px', marginTop: 'auto' }}>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Составляющая цены</span>
                    <strong className={isBillable ? 'text-primary' : 'text-slate-400'}>
                      {isBillable ? `+ ${extraCost.toLocaleString('ru-RU')} ₸` : 'Включено в базу'}
                    </strong>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)' }}>{status.percent}% занято</span>
                  </div>
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
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="m-0 text-white">{calculated.plan === 'starter' ? 'Starter бесплатно' : 'Growth План'}</h4>
            {calculated.plan !== 'starter' && (
              <span className="text-[10px] font-black bg-white/10 text-white/60 px-2 py-0.5 rounded-md uppercase tracking-wider">Настраиваемый</span>
            )}
          </div>
          
          <div className="admin-tariff__billing">
            <button type="button" className={draft.billingPeriod !== 'yearly' ? 'is-active' : ''} onClick={() => setBillingPeriod('monthly')}>
              Месяц
            </button>
            <button type="button" className={draft.billingPeriod === 'yearly' ? 'is-active' : ''} onClick={() => setBillingPeriod('yearly')}>
              Год -15%
            </button>
          </div>
          
          {breakdown.length > 0 && (
            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-4">Состав вашего плана:</p>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {breakdown.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-primary-soft"></div>
                    <span className="text-xs font-bold text-white/70">{item.label}</span>
                    <span className="text-[10px] font-black text-white/30">{item.price.toLocaleString('ru-RU')} ₸</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {yearlySaving > 0 && <p className="text-emerald-400 text-sm font-bold mt-4">Экономия {yearlySaving.toLocaleString('ru-RU')} ₸/мес при оплате за год</p>}
        </div>

        <div className="flex flex-col items-end gap-6">
          <div className="admin-tariff__total">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Следующий платеж</span>
              <strong>{calculated.price.toLocaleString('ru-RU')} ₸</strong>
              <span>/ месяц</span>
            </div>
          </div>
          <Button variant="primary" onClick={() => {
            if (window.confirm(`Вы подключаете дополнительные ресурсы. Лимиты увеличатся сразу, а оплата за них будет включена в следующий счет (${calculated.price.toLocaleString('ru-RU')} ₸). Продолжить?`)) {
              updateSubscription(calculated);
            }
          }} className="h-14 px-10 shadow-xl shadow-primary/20">
            {calculated.plan === 'starter' ? 'Оставить Starter' : 'Подключить и пользоваться'}
          </Button>
        </div>
      </section>
    </div>
  );
};
