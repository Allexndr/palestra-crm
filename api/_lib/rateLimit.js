const buckets = new Map();

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}

export function rateLimit(req, res, { key = 'default', limit = 20, windowMs = 60_000 } = {}) {
  const bucketKey = `${key}:${getClientIp(req)}`;
  const now = Date.now();
  const bucket = buckets.get(bucketKey);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(bucketKey, { count: 1, resetAt: now + windowMs });
    return true;
  }

  bucket.count += 1;
  if (bucket.count <= limit) return true;

  const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
  res.setHeader('Retry-After', String(Math.max(1, retryAfter)));
  return false;
}
