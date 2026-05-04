import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '../test/test-utils';
import { Schedule } from '../pages/admin/Schedule';
import React from 'react';

const mockCoach = { id: 'coach-1', name: 'Coach K', role: 'coach' };
const mockState = {
  state: {
    members: [{ id: 'm1', firstName: 'Student', lastName: 'A', groupId: 'g1' }],
    schedule: [{ id: 's1', groupName: 'MMA Pro', time: '18:00', coach: 'Coach K', locationId: 'all', day: 'Пн' }],
    groups: [{ id: 'g1', name: 'MMA Pro', coachId: 'coach-1' }],
    coaches: [{ id: 'coach-1', name: 'Coach K', email: 'coach@test.com' }],
    clubInfo: { name: 'Palestra Test' },
    subscription: { plan: 'growth', features: { league: true } }
  }
};

global.fetch = vi.fn((url) => {
  if (url.includes('/api/auth/me')) {
    return Promise.resolve({ ok: true, json: () => Promise.resolve({ user: mockCoach }) });
  }
  if (url.includes('/api/app/state')) {
    return Promise.resolve({ ok: true, json: () => Promise.resolve(mockState) });
  }
  return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
});

describe('Coach Pages', () => {
  it('renders Coach Schedule with assigned classes', async () => {
    render(<Schedule />);
    
    await waitFor(() => {
      expect(screen.getByText('MMA Pro')).toBeInTheDocument();
    });
    
    expect(screen.getAllByText('Coach K')[0]).toBeInTheDocument();
  });
});
