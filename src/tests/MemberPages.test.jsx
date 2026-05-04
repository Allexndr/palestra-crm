import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '../test/test-utils';
import { Profile } from '../pages/profile/Profile';
import { QuestsMember } from '../pages/social/QuestsMember';
import React from 'react';

const mockStudent = { id: 'student-1', name: 'Ivan Student', role: 'student' };
const mockState = {
  state: {
    members: [{ 
      id: 'student-1', 
      firstName: 'Ivan', 
      lastName: 'Student', 
      points: 150, 
      level: 'Warrior',
      groupId: 'g1' 
    }],
    quests: [{ id: 'q1', title: 'First Training', rewardPoints: 50, completions: [] }],
    clubInfo: { name: 'Palestra Test' },
    studentDashboardLayout: [{ id: 'rpg_rank', visible: true }],
    subscription: { plan: 'growth' }
  }
};

global.fetch = vi.fn((url) => {
  if (url.includes('/api/auth/me')) {
    return Promise.resolve({ ok: true, json: () => Promise.resolve({ user: mockStudent }) });
  }
  if (url.includes('/api/app/state')) {
    return Promise.resolve({ ok: true, json: () => Promise.resolve(mockState) });
  }
  return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
});

describe('Member Pages', () => {
  it('renders Student Profile with RPG stats', async () => {
    render(<Profile />);
    
    await waitFor(() => {
      expect(screen.getByText('Ivan Student', { exact: true })).toBeInTheDocument();
    });
    
    expect(screen.getAllByText(/150\s*XP/)[0]).toBeInTheDocument();
  });

  it('renders Member Quests', async () => {
    render(<QuestsMember />);
    
    await waitFor(() => {
      expect(screen.getByText('First Training')).toBeInTheDocument();
    });
    
    expect(screen.getAllByText(/50 XP/)[0]).toBeInTheDocument();
  });
});
