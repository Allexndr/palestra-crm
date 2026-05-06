export function createSeedState() {
  return {
    members: [],
    leads: [],
    schedule: [],
    locations: [],
    groups: [],
    activities: [],
    leagues: [],
    plans: [],
    posts: [],
    coaches: [],
    events: [],
    attendance: [],
    finances: { revenue: 0, transactions: [] },
    achievements: [],
    monthlyAward: { title: '', description: '', daysLeft: 0 },
    selectedLocationId: 'all',
    clubInfo: { name: '', logo: '/palestra-logo-nav-full.png', primaryColor: '#3146A6' },
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
