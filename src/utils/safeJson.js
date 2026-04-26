/**
 * Safely read JSON from localStorage with validation fallback.
 * Prevents white-screen crashes from corrupted or migrated keys.
 */
export function readJson(key, fallback, isValid) {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null || raw === '') return fallback;
    const parsed = JSON.parse(raw);
    if (typeof isValid === 'function' && !isValid(parsed)) return fallback;
    return parsed;
  } catch {
    return fallback;
  }
}

export function isObject(v) {
  return v != null && typeof v === 'object' && !Array.isArray(v);
}
