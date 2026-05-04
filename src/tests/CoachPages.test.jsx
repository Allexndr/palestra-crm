import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '../test/test-utils';
import { Schedule } from '../pages/admin/Schedule';
import { Quests } from '../pages/admin/Quests';
import React from 'react';

const mockCoach = { id: 'coach-1', name: 'Coach K', role: 'coach', email: 'coach@test.com' };
const mockState = {
  state: {
    members: [
      { id: 'm1', firstName: 'Student', lastName: 'A', groupId: 'g1', points: 50, xp: 100 },
      { id: 'm2', firstName: 'Student', lastName: 'B', groupId: 'g1', points: 30, xp: 60 }
    ],
    schedule: [
      { id: 's1', groupName: 'MMA Pro', time: '18:00', coach: 'Coach K', locationId: '1', day: 'Пн' },
      { id: 's2', groupName: 'Boxing Juniors', time: '16:00', coach: 'Other Coach', locationId: '1', day: 'Вт' }
    ],
    groups: [
      { id: 'g1', name: 'MMA Pro', coachId: 'coach-1', sport: 'MMA' }
    ],
    coaches: [{ id: 'coach-1', name: 'Coach K', email: 'coach@test.com' }],
    locations: [{ id: '1', name: 'Main Gym' }],
    quests: [
      { id: 'q1', title: 'Push-up Challenge', rewardPoints: 30, type: 'training', description: '50 push-ups', completions: [{ studentId: 'm1', status: 'pending' }] }
    ],
    clubInfo: { name: 'Palestra Test', activeLeagueTemplate: 'martial_arts' },
    subscription: { plan: 'growth', limits: {}, features: { league: true, finance: true } },
    finances: { revenue: 0, transactions: [] },
    achievements: [],
    events: [],
    attendance: [],
    posts: [],
    leagues: [],
    activities: [],
    feedbacks: [],
    automations: { fired: [] },
    messages: [],
    partners: [],
    plans: [],
    monthlyAward: { title: '', description: '', daysLeft: 10 },
    dashboardLayout: [],
    studentDashboardPool: [],
    studentDashboardLayout: [],
  }
};

beforeEach(() => {
  vi.restoreAllMocks();
  global.fetch = vi.fn((url, opts) => {
    if (url.includes('/api/auth/me')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ user: mockCoach }),
        clone: () => ({ json: () => Promise.resolve({ user: mockCoach }) })
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

describe('Coach Pages', () => {
  it('renders Coach Schedule with assigned classes', async () => {
    render(<Schedule />);
    await waitFor(() => {
      expect(screen.getByText('MMA Pro')).toBeInTheDocument();
    });
    expect(screen.getAllByText('Coach K')[0]).toBeInTheDocument();
  });

  it('opens attendance modal on class click', async () => {
    render(<Schedule />);
    await waitFor(() => {
      const classItem = screen.getByText('MMA Pro');
      fireEvent.click(classItem);
    });
    // Modal should open with class or student info
    await waitFor(() => {
      expect(screen.getByText('Student A')).toBeInTheDocument();
    });
  });

  it('renders Quests page with quest data visible to coach', async () => {
    render(<Quests />);
    await waitFor(() => {
      expect(screen.getAllByText('Push-up Challenge')[0]).toBeInTheDocument();
    });
  });
});
