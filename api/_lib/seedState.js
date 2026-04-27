const now = () => new Date().toISOString();
const daysAgo = (days) => new Date(Date.parse(now()) - 86400000 * days).toISOString();

export function createSeedState(empty = false) {
  const members = empty ? [] : [
    { id: 'm1', firstName: 'Артем', lastName: 'Иванов', login: 'student', parentId: 'p1', groupId: 'g1', points: 450, level: 'Опытный', sport: 'Бокс', plan: 'Стандарт', strength: 75, speed: 80, technique: 65, endurance: 90, avatar: '' },
    { id: 'm2', firstName: 'Кирилл', lastName: 'Петров', login: 'kirill', parentId: 'p1', groupId: 'g1', points: 120, level: 'Новичок', sport: 'Бокс', plan: 'Стандарт', strength: 40, speed: 55, technique: 30, endurance: 45, avatar: '' },
  ];

  const schedule = empty ? [] : [{
    id: 's1',
    groupName: 'Младшая группа (Бокс)',
    time: '15:00',
    day: 'Пн',
    days: ['Пн', 'Ср', 'Пт'],
    coach: 'Тренер',
    coachName: 'Тренер',
    type: 'Бокс',
    color: '#3146A6',
    locationId: '1',
  }];

  return {
    members,
    leads: empty ? [] : [{ id: 'l1', name: 'Марина Соколова', phone: '+7 707 123 4567', sport: 'MMA', status: 'new', createdAt: now() }],
    schedule,
    locations: [{ id: '1', name: 'Центральный зал', address: 'ул. Абая, 10', isActive: true }],
    groups: empty ? [] : [{ id: 'g1', name: 'Младшая группа (Бокс)', coachId: 'c1', sport: 'Бокс', locationId: '1' }],
    activities: empty ? [] : [
      { id: 'a1', text: 'Артем Иванов получил ачивку "Первая кровь"', type: 'success', date: now() },
      { id: 'a2', text: 'Новая оплата от Марина С.', type: 'info', date: now() },
    ],
    leagues: [],
    plans: [],
    posts: [],
    coaches: [],
    events: [],
    attendance: empty ? [] : [
      { id: 'att1', sessionId: 's1', memberIds: ['m1', 'm2'], date: now() },
      { id: 'att2', sessionId: 's1', memberIds: ['m1'], date: daysAgo(3) },
      { id: 'att3', sessionId: 's1', memberIds: ['m2'], date: daysAgo(5) },
    ],
    finances: { revenue: 0, transactions: [] },
    achievements: empty ? [] : [
      { id: 'ach1', title: 'Железный кулак', desc: '10 тренировок подряд', color: '#E8ECFA', iconColor: '#3146A6', memberIds: ['m1'] },
      { id: 'ach2', title: 'Вечный двигатель', desc: 'Лучшая выносливость месяца', color: '#ECFDF5', iconColor: '#159A74', memberIds: ['m1', 'm2'] },
    ],
    monthlyAward: { title: '', description: '', daysLeft: 0 },
    selectedLocationId: 'all',
    clubInfo: { name: 'Palestra Fight Club', logo: '/palestra-logo-nav-full.png', primaryColor: '#3146A6' },
    subscription: {
      plan: 'starter',
      status: 'active',
      billingPeriod: 'monthly',
      price: 0,
      limits: { members: 15, coaches: 3, locations: 1, groups: 3 },
      features: {
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
        whiteLabel: false
      }
    },
    shop: {
      products: [],
      orders: [],
    },
  };
}
