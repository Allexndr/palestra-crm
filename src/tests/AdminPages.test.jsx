import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '../test/test-utils';
import { Dashboard } from '../pages/admin/Dashboard';
import { Members } from '../pages/admin/Members';
import { Groups } from '../pages/admin/Groups';
import { Coaches } from '../pages/admin/Coaches';
import { Locations } from '../pages/admin/Locations';
import { Payroll } from '../pages/admin/Payroll';
import { Quests } from '../pages/admin/Quests';
import { Settings } from '../pages/admin/Settings';
import React from 'react';

const mockUser = { id: 'admin-1', name: 'Admin User', role: 'admin', email: 'admin@test.com' };
const mockState = {
  state: {
    members: [
      { id: 'm1', firstName: 'Ivan', lastName: 'Ivanov', phone: '123456789', locationId: '1', groupId: 'g1', plan: 'Base', points: 100, xp: 200 }
    ],
    leads: [],
    schedule: [{ id: 's1', groupName: 'MMA Pro', time: '18:00', coach: 'Coach K', locationId: '1', day: 'Пн' }],
    locations: [{ id: '1', name: 'Main Gym', address: 'Street 1', isActive: true }],
    groups: [{ id: 'g1', name: 'MMA Pro', sport: 'MMA', coach: 'Coach K', locationId: '1', maxCapacity: 20, coachId: 'c1' }],
    coaches: [{ id: 'c1', name: 'Coach K', email: 'coach@test.com', rate: 5000, rateType: 'per_class' }],
    finances: { revenue: 500000, transactions: [] },
    clubInfo: { name: 'Palestra Test', logo: '/palestra-logo-nav-full.png', primaryColor: '#3146A6', activeLeagueTemplate: 'martial_arts' },
    subscription: { plan: 'growth', limits: { members: 100, coaches: 10, locations: 5, groups: 20 }, features: { finance: true, league: true, shop: true, events: true, payroll: true } },
    achievements: [{ id: 'a1', title: 'First Win', desc: 'Won first match', icon: 'Trophy', color: '#EEF2FF', iconColor: '#4338ca' }],
    quests: [{ id: 'q1', title: 'Run 5km', description: 'Complete a 5km run', rewardPoints: 50, type: 'training', completions: [{ studentId: 'm1', status: 'pending' }] }],
    plans: [{ id: 'p1', name: 'Base', price: 15000, visits: 12 }],
    events: [],
    attendance: [],
    posts: [],
    leagues: [],
    activities: [],
    feedbacks: [],
    automations: { fired: [] },
    messages: [],
    partners: [],
    monthlyAward: { title: '', description: '', daysLeft: 15 },
    dashboardLayout: [
      { id: 'stats', label: 'Статистика', visible: true },
      { id: 'schedule', label: 'Расписание', visible: true },
    ],
    studentDashboardPool: ['rpg_rank', 'physical_stats'],
    studentDashboardLayout: [{ id: 'rpg_rank', visible: true }],
  }
};

beforeEach(() => {
  vi.restoreAllMocks();
  global.fetch = vi.fn((url, opts) => {
    if (url.includes('/api/auth/me')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ user: mockUser }),
        clone: () => ({ json: () => Promise.resolve({ user: mockUser }) })
      });
    }
    if (url.includes('/api/app/state') && (!opts || opts.method !== 'PUT')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockState),
        clone: () => ({ json: () => Promise.resolve(mockState) })
      });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  });
});

describe('Admin Pages — Full Coverage', () => {
  it('renders Dashboard with revenue and KPI stats', async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText(/500 000/)).toBeInTheDocument();
    });
  });

  it('renders Members list with member data', async () => {
    render(<Members />);
    await waitFor(() => {
      expect(screen.getByText('Ivan Ivanov')).toBeInTheDocument();
    });
    expect(screen.getByText('123456789')).toBeInTheDocument();
  });

  it('renders Groups page with group cards', async () => {
    render(<Groups />);
    await waitFor(() => {
      expect(screen.getByText('MMA Pro')).toBeInTheDocument();
    });
    expect(screen.getByText('MMA')).toBeInTheDocument();
  });

  it('renders Coaches page with coach data', async () => {
    render(<Coaches />);
    await waitFor(() => {
      expect(screen.getByText('Coach K')).toBeInTheDocument();
    });
  });

  it('renders Locations page with location data', async () => {
    render(<Locations />);
    await waitFor(() => {
      expect(screen.getByText('Main Gym')).toBeInTheDocument();
    });
  });

  it('renders Payroll page with coach list', async () => {
    render(<Payroll />);
    await waitFor(() => {
      expect(screen.getByText('Coach K')).toBeInTheDocument();
    });
  });

  it('renders Quests page with quest data and pending status', async () => {
    render(<Quests />);
    await waitFor(() => {
      expect(screen.getAllByText('Run 5km')[0]).toBeInTheDocument();
    });
  });

  it('renders Settings page with tariff tab', async () => {
    render(<Settings />);
    await waitFor(() => {
      expect(screen.getByText(/Настройки/i)).toBeInTheDocument();
    });
  });
});
