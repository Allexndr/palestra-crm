// eslint-disable-next-line no-unused-vars
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Landing } from './pages/public/Landing';
import { SkipToMain } from './components/layout/SkipToMain';

describe('App shell & landing', () => {
  it('renders skip link and landing hero', () => {
    render(
      <MemoryRouter>
        <SkipToMain />
        <Routes>
          <Route path="/" element={<Landing />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: /Перейти к содержанию/i })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Управляйте/i, level: 1 })
    ).toBeInTheDocument();
  });
});
