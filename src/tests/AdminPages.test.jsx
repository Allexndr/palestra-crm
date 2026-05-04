import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, waitFor } from '../test/test-utils';
import { Dashboard } from '../pages/admin/Dashboard';
import { Members } from '../pages/admin/Members';
import React from 'react';

// Mock fetch for API calls
const mockUser = { id: 'admin-1', name: 'Admin User', role: 'admin' };
const mockState = {
  state: {
    members: [{ id: 'm1', firstName: 'Ivan', lastName: 'Ivanov', phone: '123456789', locationId: 'all' }],
    leads: [],
    schedule: [],
    locations: [],
    groups: [],
    finances: { revenue: 500000, transactions: [] },
    clubInfo: { name: 'Palestra Test', logo: '', primaryColor: '#3146A6' },
    subscription: { plan: 'growth', limits: {}, features: { finance: true, league: true } }
  }
};

global.fetch = vi.fn((url) => {
  if (url.includes('/api/auth/me')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ user: mockUser })
    });
  }
  if (url.includes('/api/app/state')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockState)
    });
  }
  return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
});

describe('Admin Pages', () => {
  it('renders Admin Dashboard with revenue data', async () => {
    render(<Dashboard />);
    
    // Wait for state hydration
    await waitFor(() => {
      expect(screen.getByText(/500 000/)).toBeInTheDocument();
    });
    
    expect(screen.getByText(/Дашборд клуба/i)).toBeInTheDocument();
  });

  it('renders Members list with member data', async () => {
    render(<Members />);
    
    await waitFor(() => {
      expect(screen.getByText('Ivan Ivanov')).toBeInTheDocument();
    });
    
    expect(screen.getByText('123456789')).toBeInTheDocument();
  });
});
