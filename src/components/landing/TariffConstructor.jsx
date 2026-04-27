import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Shield } from 'lucide-react';
import './tariff-constructor.css';

const BASE_PRICE = 0;
/** ~19 USD за базу 9000 ₸ (оценка для UI) */
const usdApprox = (kzt) => (kzt > 0 ? Math.max(1, Math.round((kzt / 9000) * 19)) : 0);

const CORE_FEATURE = {
  id: 'core',
  label: 'Базовая CRM',
  icon: <Shield size={16} strokeWidth={2.25} />,
  desc: 'Учёт учеников, филиалов и групп',
};

const INCLUDED_ITEMS = [
  '1 филиал, 15 учеников и 3 тренера включены',
  'Расписание, посещаемость и база клиентов',
  'Личный кабинет для родителей и учеников',
];

export const TariffConstructor = () => {
  const navigate = useNavigate();
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
      <div className="tariff-constructor__eyebrow">Подключение бесплатно</div>

      <div className="tariff-constructor__top">
        <div className="tariff-constructor__intro">
          <h2 id="tariff-constructor-title" className="tariff-constructor__title">
            Palestra Starter
          </h2>
          <p className="tariff-constructor__subtitle">
            Соберите базу бесплатно: 1 филиал, 15 учеников, 3 тренера и базовая CRM. Когда клуб вырастет, включите Growth от 9 000 ₸ и нужные модули.
          </p>
        </div>

        <div className="tariff-constructor__base-price" aria-label={`${totalPrice.toLocaleString('ru-RU')} тенге в месяц`}>
          <div className="tariff-constructor__price-kzt">
            {totalPrice.toLocaleString('ru-RU')} <span>₸/мес</span>
          </div>
          <div className="tariff-constructor__price-usd">Growth от 9 000 ₸/мес</div>
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

        <ul className="tariff-constructor__list" aria-label="Что входит в тариф">
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
          Подключить бесплатно
        </button>
        <p className="tariff-constructor__hint">Дальше тариф собирается под ваш клуб: ученики, тренеры, филиалы и модули.</p>
      </div>
    </article>
  );
};
