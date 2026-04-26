import { describe, it, expect, beforeEach } from 'vitest';
import { readJson, isObject } from './safeJson';

describe('readJson', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns fallback on missing key', () => {
    expect(readJson('missing', [1, 2], Array.isArray)).toEqual([1, 2]);
  });

  it('returns parsed value when valid', () => {
    localStorage.setItem('t', JSON.stringify([3, 4]));
    expect(readJson('t', [], Array.isArray)).toEqual([3, 4]);
  });

  it('returns fallback on invalid JSON', () => {
    localStorage.setItem('bad', '{not json');
    expect(readJson('bad', { ok: true }, isObject)).toEqual({ ok: true });
  });

  it('returns fallback when validator fails', () => {
    localStorage.setItem('t', JSON.stringify({ a: 1 }));
    expect(readJson('t', [], Array.isArray)).toEqual([]);
  });
});

describe('isObject', () => {
  it('rejects null and arrays', () => {
    expect(isObject(null)).toBe(false);
    expect(isObject([])).toBe(false);
  });

  it('accepts plain objects', () => {
    expect(isObject({})).toBe(true);
  });
});
