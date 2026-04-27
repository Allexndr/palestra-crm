import { list } from '@vercel/blob';
import { sendJson } from '../_lib/http.js';
import { rateLimit } from '../_lib/rateLimit.js';
import { requireUser, safeError } from '../_lib/security.js';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }
  if (!rateLimit(req, res, { key: 'blob-read', limit: 300, windowMs: 60_000 })) {
    return sendJson(res, 429, { error: 'Too many requests' });
  }

  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return sendJson(res, 500, { error: 'Missing Blob token' });
    }

    const requestUser = await requireUser(req, res, { allowDemo: true });
    if (!requestUser) return;

    const pathname = String(req.query?.pathname || '').replace(/^\/+/, '');
    const clubPrefix = `clubs/${requestUser.profile.club_id}/`;
    if (!pathname || !pathname.startsWith(clubPrefix)) {
      return sendJson(res, 403, { error: 'Cannot read media outside current club' });
    }

    const result = await list({
      prefix: pathname,
      limit: 1,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    const blob = result.blobs?.find((item) => item.pathname === pathname);
    if (!blob?.url) return sendJson(res, 404, { error: 'File not found' });

    // Private stores are still resolved server-side; the browser only sees this
    // authenticated endpoint and receives a short redirect to the Blob URL.
    res.statusCode = 302;
    res.setHeader('Location', blob.url);
    res.setHeader('Cache-Control', 'private, max-age=300');
    res.end();
  } catch (error) {
    if (error.statusCode) return sendJson(res, error.statusCode, { error: error.message });
    return safeError(res, error, 'Unable to read file');
  }
}
