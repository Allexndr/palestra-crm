import React, { useMemo, useState, useEffect } from 'react';
import { CheckCircle2, SlidersHorizontal, Zap } from 'lucide-react';
import { FEATURE_OPTIONS, PAID_BASE_PRICE, RESOURCE_OPTIONS, DEFAULT_SUBSCRIPTION, calculateTariff, formatLimit } from '../../lib/tariff';
import { useTranslation } from '../../context/LanguageContext';

const getFeatureNames = (t) => ({
  crm: t('settings.tabs.club_profile'),
  schedule: t('sidebar.schedule'),
  parentCabinet: t('settings.tabs.student_widgets'),
  feed: t('sidebar.feed'),
});

const ResourceCard = ({ option, status, selected, usage, updateLimit }) => {
  const { t } = useTranslation();
  const [localValue, setLocalValue] = useState(selected.toString());
  const isBillable = selected > option.paidIncluded;
  const extraCount = Math.max(0, selected - option.paidIncluded);
  const extraCost = extraCount * option.unitPrice;

  // Sync local value when selected changes externally (e.g. via slider)
  useEffect(() => {
    setLocalValue(selected.toString());
  }, [selected]);

  const handleTextChange = (val) => {
    const numeric = val.replace(/\D/g, '');
    setLocalValue(numeric);
    if (numeric !== '') {
      const num = parseInt(numeric, 10);
      updateLimit(option.key, Math.min(num, option.max));
    }
  };

  const handleBlur = () => {
    if (localValue === '' || parseInt(localValue, 10) < option.min) {
      updateLimit(option.key, option.min);
      setLocalValue(option.min.toString());
    }
  };

  return (
    <article className={`tariff-res-card ${isBillable ? 'is-premium' : ''}`}>
      <div className="tariff-res-card__head">
        <div className="tariff-res-card__info">
          <h5 className="tariff-res-card__label">{option.label}</h5>
          <p className="tariff-res-card__usage">
            {usage || 0} / {formatLimit(selected)} <span className="opacity-40">{t('settings.tariff.used')}</span>
          </p>
        </div>
        <div className="tariff-res-card__input-wrap">
          <input 
            type="text"
            inputMode="numeric"
            value={localValue}
            onChange={(e) => handleTextChange(e.target.value)}
            onBlur={handleBlur}
            className="tariff-res-card__input"
          />
        </div>
      </div>

      <div className="tariff-res-card__slider-wrap">
        <input
          type="range"
          min={option.min}
          max={option.max}
          step={option.step}
          value={selected}
          onChange={(e) => updateLimit(option.key, e.target.value)}
          className="tariff-res-card__slider"
        />
      </div>

        <div className="flex flex-col">
          <span className="tariff-res-card__price-label">{t('shop.product.price_kzt')}</span>
          <strong className={`tariff-res-card__price-val ${isBillable ? 'text-primary' : 'text-emerald-600'}`}>
            {isBillable ? `+ ${extraCost.toLocaleString()} ₸` : (selected <= option.included ? `${t('common.free')} (Starter)` : t('settings.tariff.growth'))}
          </strong>
        </div>
        <div className="tariff-res-card__badge">
          {status.percent}%
        </div>

    </article>
  );
};

export const AdminTariffConstructor = ({
  updateSubscription,
  clubInfo
}) => {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(subscription);
  const [isSaved, setIsSaved] = useState(false);
  const calculated = useMemo(() => calculateTariff(draft), [draft]);

  const isCurrentPlan = useMemo(() => {
    return JSON.stringify(draft.limits) === JSON.stringify(subscription.limits) &&
           JSON.stringify(draft.features) === JSON.stringify(subscription.features) &&
           draft.billingPeriod === subscription.billingPeriod;
  }, [draft, subscription]);
  
  // Sync draft if subscription changes externally
  useEffect(() => {
    setDraft(subscription);
  }, [subscription]);

  // Pre-fill from registration info if it's a new club on starter
  useEffect(() => {
    if (clubInfo?.estimatedStudents > draft.limits?.members && subscription?.plan === 'starter') {
      updateLimit('members', clubInfo.estimatedStudents);
    }
  }, [clubInfo?.estimatedStudents]);

  const yearlySaving = calculated.billingPeriod === 'yearly'
    ? Math.round((calculated.price / 0.85) - calculated.price)
    : 0;

  const breakdown = useMemo(() => {
    const items = [];
    if (calculated.plan === 'starter') return [];
    
    items.push({ label: t('settings.tariff.base_price_label'), price: PAID_BASE_PRICE });
    
    RESOURCE_OPTIONS.forEach(opt => {
      const selected = Number(draft.limits?.[opt.key] || opt.included);
      const extra = Math.max(0, selected - opt.paidIncluded);
      if (extra > 0) {
        items.push({ 
          label: t('settings.tariff.extra_resource_label', { label: opt.label.toLowerCase(), count: extra }), 
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

  const resetToStarter = () => {
    if (window.confirm(t('settings.tariff.reset_confirm'))) {
      setDraft(DEFAULT_SUBSCRIPTION);
      updateSubscription(DEFAULT_SUBSCRIPTION);
    }
  };

  return (
    <div className="admin-tariff animate-fade-in">
      {subscription.plan === 'starter' && (
        <section className="admin-tariff__hero">
          <div className="flex-1">
            <span className="admin-tariff__eyebrow">{t('settings.tariff.current_plan')}</span>
            <h2 className="text-4xl font-black mb-4">Starter</h2>
            <p className="text-white/60 text-lg leading-relaxed max-w-xl">
              {t('settings.tariff.starter_desc')}
            </p>
            <div className="admin-tariff__included">
              {Object.entries(getFeatureNames(t)).map(([key, label]) => (
                <span key={key} className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-wider">
                  <CheckCircle2 size={14} className="text-white" /> {label}
                </span>
              ))}
            </div>
          </div>
          <div className="admin-tariff__price-card bg-white/5 border border-white/10 backdrop-blur-xl">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3">{t('sidebar.status')}</span>
            <div className="flex items-baseline gap-2 mb-2">
              <strong className="text-5xl font-black">0</strong>
              <span className="text-xl font-black opacity-40">₸/{t('payroll.per_month')}</span>
            </div>
            <p className="text-white/40 font-bold text-xs uppercase tracking-widest">{t('settings.tariff.forever_free')}</p>
          </div>
        </section>
      )}

      <div className="flex justify-between items-end mb-12">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 text-white rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary)' }}>
              <SlidersHorizontal size={20} />
            </div>
            <div>
              <h3 className="text-2xl font-black m-0">{t('settings.tariff.scaling_title')}</h3>
              <p className="text-muted text-sm font-medium mt-1">{t('settings.tariff.scaling_subtitle')}</p>
            </div>
          </div>
        </div>
        {calculated.plan !== 'starter' && (
          <button 
            onClick={resetToStarter}
            className="px-6 py-3 border border-slate-200 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
          >
            {t('settings.tariff.reset_to_starter')}
          </button>
        )}
      </div>

      <section>
        <div className="tariff-res-grid">
          {RESOURCE_OPTIONS.map((option) => (
            <ResourceCard
              key={option.key}
              option={option}
              status={getLimitStatus(option.key)}
              selected={Number(draft.limits?.[option.key] || option.included)}
              usage={usage[option.key]}
              updateLimit={updateLimit}
            />
          ))}
        </div>
      </section>

      <section>
        <div className="admin-tariff__section-head">
          <div style={{ backgroundColor: '#fef3c7', color: '#d97706', padding: '10px', borderRadius: '12px' }}>
            <Zap size={22} />
          </div>
          <div>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 900 }}>{t('settings.tariff.growth_modules')}</h4>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{t('settings.tariff.growth_modules_desc')}</p>
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
                <span>{enabled ? `✓ ${t('settings.tariff.connected')}` : `+ ${feature.price.toLocaleString()} ₸`}</span>
                <strong>{feature.label}</strong>
                <small>{feature.desc}</small>
              </button>
            );
          })}
        </div>
      </section>

      <section className="admin-tariff__summary" style={{ minHeight: '400px', padding: '60px', alignItems: 'flex-start' }}>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="m-0 text-white">{calculated.plan === 'starter' ? `${t('settings.tariff.current_plan')}: Starter (0 ₸)` : t('settings.tariff.tariff_scaling')}</h4>
            {calculated.plan !== 'starter' && (
              <span className="text-[10px] font-black bg-white/10 text-white/60 px-2 py-0.5 rounded-md uppercase tracking-wider">{t('settings.tariff.customizable')}</span>
            )}
          </div>
          
          <div className="admin-tariff__billing">
            <button type="button" className={draft.billingPeriod !== 'yearly' ? 'is-active' : ''} onClick={() => setBillingPeriod('monthly')}>
              {t('settings.tariff.month')}
            </button>
            <button type="button" className={draft.billingPeriod === 'yearly' ? 'is-active' : ''} onClick={() => setBillingPeriod('yearly')}>
              {t('settings.tariff.year_discount')}
            </button>
          </div>
          
          {breakdown.length > 0 && (
            <div className="mt-10 pt-8 border-t border-white/10">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-6">{t('settings.tariff.plan_structure')}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4">
                {breakdown.map((item, i) => (
                  <div key={i} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--color-primary-rgb),0.5)]"></div>
                      <span className="text-sm font-black text-white/90 group-hover:text-white transition-colors">{item.label}</span>
                    </div>
                    <span className="text-xs font-black text-white/40 tabular-nums">{item.price.toLocaleString('ru-RU')} ₸</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {yearlySaving > 0 && <p className="text-emerald-400 text-sm font-bold mt-4">{t('settings.tariff.yearly_saving', { amount: yearlySaving.toLocaleString() })}</p>}
        </div>

        <div className="flex flex-col items-end gap-6">
          <div className="admin-tariff__total">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">{t('settings.tariff.next_payment')}</span>
              <strong>{calculated.price.toLocaleString()} ₸</strong>
              <span>/ {t('payroll.per_month')}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-3 w-full sm:w-auto">
            {isCurrentPlan ? (
              <Button variant="ghost" disabled className="h-14 px-10 border-slate-700 text-slate-400 w-full cursor-default opacity-80">
                {t('settings.tariff.current_plan')}
              </Button>
            ) : (
              <Button 
                variant={isSaved ? 'success' : 'primary'} 
                onClick={() => {
                  updateSubscription(calculated);
                  setIsSaved(true);
                  setTimeout(() => setIsSaved(false), 2000);
                }} 
                className={`h-14 px-10 shadow-xl transition-all duration-300 w-full ${isSaved ? 'shadow-emerald-100' : 'shadow-primary/20'}`}
                style={{ backgroundColor: isSaved ? '#10b981' : undefined }}
              >
                {isSaved ? `✓ ${t('settings.tariff.changes_applied')}` : t('settings.tariff.apply_changes')}
              </Button>
            )}
            <p className="text-[10px] text-white/30 text-right max-w-[240px] leading-relaxed">
              {t('settings.tariff.limits_notice')}
            </p>
          </div>
        </div>
        
      </section>

      <div className="mt-12 flex justify-center pb-8">
          <button 
            onClick={() => {
              if (window.confirm(t('settings.tariff.cancel_confirm'))) {
                resetToStarter();
              }
            }}
            className="text-[9px] font-medium text-slate-300 hover:text-red-400 transition-colors bg-transparent border-none cursor-pointer underline decoration-slate-200"
          >
            {t('settings.tariff.cancel_subscription')}
          </button>
      </div>
    </div>
  );
};
