import { describe, it, expect } from 'vitest';
import { parseJson, isObject } from './safeJson';

describe('parseJson', () => {
  it('returns fallback on empty input', () => {
    expect(parseJson('', [1, 2], Array.isArray)).toEqual([1, 2]);
  });

  it('returns parsed value when valid', () => {
    expect(parseJson(JSON.stringify([3, 4]), [], Array.isArray)).toEqual([3, 4]);
  });

  it('returns fallback on invalid JSON', () => {
    expect(parseJson('{not json', { ok: true }, isObject)).toEqual({ ok: true });
  });

  it('returns fallback when validator fails', () => {
    expect(parseJson(JSON.stringify({ a: 1 }), [], Array.isArray)).toEqual([]);
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
