import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Shield } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';
import './tariff-constructor.css';

const BASE_PRICE = 0;
/** ~19 USD за базу 9000 ₸ (оценка для UI) */
const usdApprox = (kzt) => (kzt > 0 ? Math.max(1, Math.round((kzt / 9000) * 19)) : 0);

const getCoreFeature = (t) => ({
  id: 'core',
  label: t('tariff.core_crm'),
  icon: <Shield size={16} strokeWidth={2.25} />,
  desc: t('tariff.core_desc'),
});

const getIncludedItems = (t) => [
  t('tariff.included_item1'),
  t('tariff.included_item2'),
  t('tariff.included_item3'),
];

export const TariffConstructor = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const CORE_FEATURE = getCoreFeature(t);
  const INCLUDED_ITEMS = getIncludedItems(t);
  
  const basePrice = BASE_PRICE;
  const totalPrice = basePrice;
  const selectedFeatures = ['core'];

  const handleConnect = () => {
    const params = new URLSearchParams({
      tariff: 'base',
      features: selectedFeatures.join(','),
      total: String(totalPrice),
      base: String(basePrice),
    });
    navigate(`/auth/register?${params.toString()}`);
  };

  return (
    <article className="tariff-constructor" aria-labelledby="tariff-constructor-title">
      <div className="tariff-constructor__eyebrow">{t('tariff.eyebrow')}</div>

      <div className="tariff-constructor__top">
        <div className="tariff-constructor__intro">
          <h2 id="tariff-constructor-title" className="tariff-constructor__title">
            {t('tariff.title')}
          </h2>
          <p className="tariff-constructor__subtitle">
            {t('tariff.subtitle')}
          </p>
        </div>

        <div className="tariff-constructor__base-price" aria-label={`${totalPrice.toLocaleString('ru-RU')} тенге в месяц`}>
          <div className="tariff-constructor__price-kzt">
            {totalPrice.toLocaleString('ru-RU')} <span>₸/мес</span>
          </div>
          <div className="tariff-constructor__price-usd">{t('tariff.growth_from')}</div>
        </div>
      </div>

      <div className="tariff-constructor__included">
        <div className="tariff-constructor__base">
          <div className="tariff-constructor__base-badge" aria-hidden>
            {CORE_FEATURE.icon}
          </div>
          <div>
            <h3 className="tariff-constructor__base-name">{CORE_FEATURE.label}</h3>
            <p className="tariff-constructor__base-desc">{CORE_FEATURE.desc}</p>
          </div>
        </div>

        <ul className="tariff-constructor__list" aria-label={t('tariff.included_title')}>
          {INCLUDED_ITEMS.map((item) => (
            <li key={item} className="tariff-constructor__item">
              <CheckCircle2 size={18} strokeWidth={2.3} aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="tariff-constructor__footer">
        <button type="button" className="tariff-constructor__cta" onClick={handleConnect}>
          {t('landing.hero.cta_free')}
        </button>
        <p className="tariff-constructor__hint">{t('tariff.hint')}</p>
      </div>
    </article>
  );
};
