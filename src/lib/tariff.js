export const STARTER_LIMITS = {
  members: 15,
  coaches: 3,
  locations: 1,
  groups: 3,
};

export const STARTER_FEATURES = {
  crm: true,
  schedule: true,
  parentCabinet: true,
  feed: true,
  shop: false,
  league: false,
  events: false,
  finance: false,
  analytics: false,
  automations: false,
  whiteLabel: false,
};

export const DEFAULT_SUBSCRIPTION = {
  plan: 'starter',
  status: 'active',
  billingPeriod: 'monthly',
  limits: STARTER_LIMITS,
  features: STARTER_FEATURES,
  price: 0,
  configuredAt: null,
};

export const RESOURCE_OPTIONS = [
  { key: 'members', label: 'Ученики', min: 15, max: 2000, step: 1, included: 15, paidIncluded: 30, unitPrice: 500 },
  { key: 'coaches', label: 'Тренеры', min: 3, max: 100, step: 1, included: 3, paidIncluded: 5, unitPrice: 500 },
  { key: 'locations', label: 'Филиалы / клубы', min: 1, max: 50, step: 1, included: 1, paidIncluded: 1, unitPrice: 2000 },
  { key: 'groups', label: 'Группы', min: 3, max: 300, step: 1, included: 3, paidIncluded: 5, unitPrice: 500 },
];

export const FEATURE_OPTIONS = [
  { key: 'shop', label: 'Магазин клуба', price: 4000, desc: 'Товары, заказы, статусы и витрина для родителей.' },
  { key: 'league', label: 'Лига и RPG-геймификация', price: 3500, desc: 'Рейтинги, сезоны, очки, награды и удержание учеников.' },
  { key: 'events', label: 'События и турниры', price: 2500, desc: 'Турниры, аттестации, семинары и участники.' },
  { key: 'finance', label: 'Финансы и платежи', price: 3000, desc: 'Доходы, расходы, задолженности и отчёты.' },
  { key: 'analytics', label: 'Аналитика владельца', price: 4500, desc: 'Метрики роста, удержание, загрузка филиалов и тренеров.' },
  { key: 'automations', label: 'Автоматизации', price: 5000, desc: 'Напоминания, автосообщения, сценарии оплат и посещений.' },
  { key: 'whiteLabel', label: 'White label', price: 7000, desc: 'Брендинг клуба без упоминания Palestra.' },
];

export const PAID_BASE_PRICE = 9000;

export function normalizeSubscription(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return DEFAULT_SUBSCRIPTION;
  return {
    ...DEFAULT_SUBSCRIPTION,
    ...value,
    limits: { ...STARTER_LIMITS, ...(value.limits || {}) },
    features: { ...STARTER_FEATURES, ...(value.features || {}) },
    price: Number.isFinite(Number(value.price)) ? Number(value.price) : 0,
  };
}

export function calculateTariff(config) {
  const limits = { ...STARTER_LIMITS, ...(config?.limits || {}) };
  const features = { ...STARTER_FEATURES, ...(config?.features || {}) };
  const isPaid = Object.keys(limits).some((key) => limits[key] > STARTER_LIMITS[key])
    || FEATURE_OPTIONS.some((feature) => features[feature.key]);

  if (!isPaid) {
    return normalizeSubscription({ plan: 'starter', limits, features, price: 0 });
  }

  const resourcesTotal = RESOURCE_OPTIONS.reduce((sum, option) => {
    const selected = Number(limits[option.key]) || option.included;
    const billable = Math.max(0, selected - option.paidIncluded);
    return sum + billable * option.unitPrice;
  }, 0);
  const featuresTotal = FEATURE_OPTIONS.reduce((sum, option) => (
    features[option.key] ? sum + option.price : sum
  ), 0);
  const monthly = PAID_BASE_PRICE + resourcesTotal + featuresTotal;
  const discount = config?.billingPeriod === 'yearly' ? 0.85 : 1;

  return normalizeSubscription({
    plan: 'configured',
    status: 'configured',
    billingPeriod: config?.billingPeriod || 'monthly',
    limits,
    features: {
      ...features,
      crm: true,
      schedule: true,
      parentCabinet: true,
      feed: true,
    },
    price: Math.round(monthly * discount),
    configuredAt: new Date().toISOString(),
  });
}

export function formatLimit(value) {
  if (value === Infinity) return 'без лимита';
  return Number(value || 0).toLocaleString('ru-RU');
}
