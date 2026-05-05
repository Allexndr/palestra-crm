export function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

export function methodNotAllowed(res) {
  sendJson(res, 405, { error: 'Method not allowed' });
}

export async function parseJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  return JSON.parse(raw);
}

export function parseCookies(req) {
  const header = req.headers.cookie || '';
  return header.split(';').reduce((acc, part) => {
    const [key, ...rest] = part.trim().split('=');
    if (!key) return acc;
    acc[key] = decodeURIComponent(rest.join('='));
    return acc;
  }, {});
}

export function setSessionCookies(res, session) {
  const secure = process.env.NODE_ENV === 'production' ? ' Secure;' : '';
  const maxAge = session?.expires_in || 60 * 60;
  res.setHeader('Set-Cookie', [
    `palestra-access-token=${encodeURIComponent(session.access_token)}; HttpOnly;${secure} SameSite=Lax; Path=/; Max-Age=${maxAge}`,
    `palestra-refresh-token=${encodeURIComponent(session.refresh_token)}; HttpOnly;${secure} SameSite=Lax; Path=/; Max-Age=${60 * 60 * 24 * 30}`,
  ]);
}

export function clearSessionCookies(res) {
  const secure = process.env.NODE_ENV === 'production' ? ' Secure;' : '';
  res.setHeader('Set-Cookie', [
    `palestra-access-token=; HttpOnly;${secure} SameSite=Lax; Path=/; Max-Age=0`,
    `palestra-refresh-token=; HttpOnly;${secure} SameSite=Lax; Path=/; Max-Age=0`,
    `palestra-demo-role=; HttpOnly;${secure} SameSite=Lax; Path=/; Max-Age=0`,
  ]);
}
