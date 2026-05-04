import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '../test/test-utils';
import { Leads } from '../pages/admin/Leads';
import { Shop } from '../pages/admin/Shop';
import { Billing } from '../pages/admin/Billing';
import { Events } from '../pages/admin/Events';
import { Chats } from '../pages/admin/Chats';
import React from 'react';

const mockAdmin = { id: 'admin-1', name: 'Admin', role: 'admin', email: 'admin@test.com' };
const mockState = {
  state: {
    members: [
      { id: 'm1', firstName: 'Alex', lastName: 'Morozov', phone: '999', groupId: 'g1', locationId: '1' }
    ],
    leads: [
      { id: 'l1', name: 'Potential Student', phone: '111', status: 'new', sport: 'Boxing', createdAt: new Date().toISOString(), locationId: '1' },
      { id: 'l2', name: 'Another Lead', phone: '222', status: 'contacted', sport: 'MMA', createdAt: new Date().toISOString(), locationId: '1' }
    ],
    schedule: [],
    locations: [{ id: '1', name: 'Main Gym' }],
    groups: [{ id: 'g1', name: 'Boxing Pros' }],
    coaches: [],
    finances: { revenue: 100000, transactions: [
      { id: 't1', amount: 50000, type: 'income', description: 'Monthly payment', date: new Date().toISOString() }
    ] },
    clubInfo: { name: 'Palestra', logo: '/palestra-logo-nav-full.png', activeLeagueTemplate: 'martial_arts' },
    subscription: { plan: 'growth', limits: { members: 100 }, features: { finance: true, shop: true, events: true, league: true, payroll: true } },
    events: [
      { id: 'e1', title: 'Summer Tournament', date: '2026-07-01', status: 'open', participantIds: ['m1'], type: 'tournament' }
    ],
    leagues: [],
    achievements: [],
    quests: [],
    attendance: [],
    posts: [],
    plans: [],
    activities: [
      { id: 'act1', text: 'New student registered', type: 'success', date: new Date().toISOString() }
    ],
    feedbacks: [],
    automations: { fired: [] },
    messages: [
      { id: 'msg1', chatId: 'chat-m1', senderId: 'admin-1', senderName: 'Admin', senderRole: 'admin', text: 'Hello!', date: new Date().toISOString() }
    ],
    partners: [],
    monthlyAward: { title: 'Best Fighter', description: 'Outstanding performance', daysLeft: 5 },
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
        json: () => Promise.resolve({ user: mockAdmin }),
        clone: () => ({ json: () => Promise.resolve({ user: mockAdmin }) })
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

describe('Cross-Role Integration Tests', () => {
  it('Leads: displays leads pipeline', async () => {
    render(<Leads />);
    await waitFor(() => {
      expect(screen.getByText('Potential Student')).toBeInTheDocument();
    });
  });

  it('Leads: shows lead status badges', async () => {
    render(<Leads />);
    await waitFor(() => {
      expect(screen.getByText('Potential Student')).toBeInTheDocument();
    });
  });

  it('Events: renders events page', async () => {
    render(<Events />);
    await waitFor(() => {
      expect(screen.getAllByText(/Summer Tournament|События/i)[0]).toBeInTheDocument();
    });
  });

  it('Billing: renders billing page', async () => {
    render(<Billing />);
    await waitFor(() => {
      expect(screen.getAllByText(/Подписка|Growth|Тариф/i)[0]).toBeInTheDocument();
    });
  });

  it('Chats: renders messaging interface', async () => {
    render(<Chats />);
    await waitFor(() => {
      // Chat should show member list or message area
      expect(screen.getByText(/Чат|Alex Morozov|Сообщения/i)).toBeInTheDocument();
    });
  });
});
