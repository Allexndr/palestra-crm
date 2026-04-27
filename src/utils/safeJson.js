export function parseJson(raw, fallback, isValid) {
  try {
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
