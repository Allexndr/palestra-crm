import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '../test/test-utils';
import { Profile } from '../pages/profile/Profile';
import { QuestsMember } from '../pages/social/QuestsMember';
import { Feed } from '../pages/social/Feed';
import React from 'react';

// --- Student role tests ---
const mockStudent = { id: 'student-1', name: 'Ivan Student', role: 'student', login: 'ivan_s' };
const mockStudentState = {
  state: {
    members: [{
      id: 'student-1',
      firstName: 'Ivan',
      lastName: 'Student',
      points: 150,
      xp: 250,
      level: 'Warrior',
      groupId: 'g1',
      sport: 'MMA',
      plan: 'Base',
      login: 'ivan_s'
    }],
    quests: [
      { id: 'q1', title: 'First Training', rewardPoints: 50, type: 'training', description: 'Attend first session', completions: [] },
      { id: 'q2', title: 'Discipline Master', rewardPoints: 30, type: 'discipline', description: 'Be on time 5 days', completions: [{ studentId: 'student-1', status: 'approved' }] }
    ],
    groups: [{ id: 'g1', name: 'MMA Juniors', sport: 'MMA' }],
    schedule: [{ id: 's1', groupName: 'MMA Juniors', time: '16:00', day: 'Пн' }],
    attendance: [{ id: 'att1', memberIds: ['student-1'], date: new Date().toISOString() }],
    achievements: [{ id: 'ach1', title: 'First Steps', desc: 'Completed onboarding', icon: 'Trophy', color: '#EEF2FF', iconColor: '#4338ca' }],
    posts: [
      { id: 'post1', title: 'Welcome!', text: 'Welcome to the club!', author: 'Admin', authorRole: 'admin', date: new Date().toISOString(), likes: 3, likedBy: [], comments: [] }
    ],
    clubInfo: { name: 'Palestra Test', logo: '/palestra-logo-nav-full.png', activeLeagueTemplate: 'martial_arts' },
    studentDashboardPool: ['rpg_rank', 'physical_stats', 'rewards', 'quick_actions', 'club_events'],
    studentDashboardLayout: [
      { id: 'rpg_rank', visible: true },
      { id: 'physical_stats', visible: true },
      { id: 'rewards', visible: true },
      { id: 'quick_actions', visible: true },
    ],
    subscription: { plan: 'growth', features: {} },
    locations: [],
    coaches: [],
    leads: [],
    finances: { revenue: 0, transactions: [] },
    events: [{ id: 'e1', title: 'Tournament', date: '2026-06-01', status: 'open', participantIds: [] }],
    leagues: [],
    activities: [],
    feedbacks: [],
    automations: { fired: [] },
    messages: [],
    partners: [],
    plans: [],
    monthlyAward: { title: '', description: '', daysLeft: 10 },
    dashboardLayout: [],
  }
};

beforeEach(() => {
  vi.restoreAllMocks();
  global.fetch = vi.fn((url, opts) => {
    if (url.includes('/api/auth/me')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ user: mockStudent }),
        clone: () => ({ json: () => Promise.resolve({ user: mockStudent }) })
      });
    }
    if (url.includes('/api/app/state') && (!opts || opts.method !== 'PUT')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockStudentState),
        clone: () => ({ json: () => Promise.resolve(mockStudentState) })
      });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  });
});

describe('Student Pages', () => {
  it('renders Student Profile with RPG stats and level', async () => {
    render(<Profile />);
    await waitFor(() => {
      expect(screen.getByText('Ivan Student')).toBeInTheDocument();
    });
    expect(screen.getAllByText(/150\s*XP/)[0]).toBeInTheDocument();
  });

  it('renders Student Quests with completion button', async () => {
    render(<QuestsMember />);
    await waitFor(() => {
      expect(screen.getByText('First Training')).toBeInTheDocument();
    });
    expect(screen.getAllByText(/50 XP/)[0]).toBeInTheDocument();
    // Already completed quest should show completed status
    expect(screen.getByText('Discipline Master')).toBeInTheDocument();
  });

  it('renders Feed with posts', async () => {
    render(<Feed />);
    await waitFor(() => {
      expect(screen.getByText('Welcome to the club!')).toBeInTheDocument();
    });
  });
});

// --- Parent role tests ---
describe('Parent Pages', () => {
  const mockParent = { id: 'parent-1', name: 'Parent User', role: 'parent' };
  const mockParentState = {
    state: {
      ...mockStudentState.state,
      members: [
        {
          id: 'child-1',
          firstName: 'Misha',
          lastName: 'Petrov',
          parentId: 'parent-1',
          points: 200,
          xp: 300,
          groupId: 'g1',
          sport: 'Boxing',
          plan: 'Premium',
          level: 'Fighter'
        },
        {
          id: 'child-2',
          firstName: 'Anna',
          lastName: 'Petrova',
          parentId: 'parent-1',
          points: 80,
          xp: 120,
          groupId: 'g1',
          sport: 'Boxing',
          plan: 'Base'
        }
      ],
    }
  };

  beforeEach(() => {
    global.fetch = vi.fn((url, opts) => {
      if (url.includes('/api/auth/me')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ user: mockParent }),
          clone: () => ({ json: () => Promise.resolve({ user: mockParent }) })
        });
      }
      if (url.includes('/api/app/state') && (!opts || opts.method !== 'PUT')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockParentState),
          clone: () => ({ json: () => Promise.resolve(mockParentState) })
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
  });

  it('renders Parent Profile showing first child data', async () => {
    render(<Profile />);
    await waitFor(() => {
      expect(screen.getByText('Misha Petrov')).toBeInTheDocument();
    });
    expect(screen.getAllByText(/200\s*XP/)[0]).toBeInTheDocument();
  });

  it('renders Parent Quests for active child', async () => {
    render(<QuestsMember />);
    await waitFor(() => {
      expect(screen.getByText('First Training')).toBeInTheDocument();
    });
  });
});
