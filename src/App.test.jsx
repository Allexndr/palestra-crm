// eslint-disable-next-line no-unused-vars
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from './test/test-utils';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Landing } from './pages/public/Landing';
import { SkipToMain } from './components/layout/SkipToMain';

describe('App shell & landing', () => {
  it('renders skip link and landing hero', async () => {
    render(
      <>
        <SkipToMain />
        <Landing />
      </>
    );

    expect(screen.getByRole('link', { name: /Перейти к содержанию/i })).toBeInTheDocument();
    
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Перестаньте/i, level: 1 })
      ).toBeInTheDocument();
    });
  });
});
