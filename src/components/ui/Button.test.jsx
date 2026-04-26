// Vitest: classic JSX in tests needs React in scope
// eslint-disable-next-line no-unused-vars
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders children and handles click', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Действие</Button>);
    fireEvent.click(screen.getByRole('button', { name: /Действие/ }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('applies disabled state', () => {
    render(<Button disabled>Блок</Button>);
    expect(screen.getByRole('button', { name: /Блок/ })).toBeDisabled();
  });
});
