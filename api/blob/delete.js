import { del, list } from '@vercel/blob';
import { parseJsonBody, sendJson } from '../_lib/http.js';
import { rateLimit } from '../_lib/rateLimit.js';
import { assertSameOrigin, requireUser, safeError } from '../_lib/security.js';
import { deleteBlobSchema, parseOrThrow } from '../_lib/validation.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });
  if (!assertSameOrigin(req, res)) return;
  if (!rateLimit(req, res, { key: 'blob-delete', limit: 60, windowMs: 60_000 })) {
    return sendJson(res, 429, { error: 'Too many requests' });
  }

  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return sendJson(res, 500, { error: 'Missing Blob token' });
    }

    const requestUser = await requireUser(req, res, { allowDemo: true });
    if (!requestUser) return;

    const { url } = parseOrThrow(deleteBlobSchema, await parseJsonBody(req));
    const clubPathPrefix = `clubs/${requestUser.profile.club_id}/`;
    let pathname = '';
    let deleteUrl = url;

    if (url.startsWith('/api/blob/read?')) {
      const parsedApiUrl = new URL(url, `https://${req.headers.host || 'palestra.local'}`);
      pathname = String(parsedApiUrl.searchParams.get('pathname') || '').replace(/^\/+/, '');
    } else {
      const parsedUrl = new URL(url);
      pathname = parsedUrl.pathname.replace(/^\/+/, '');
    }

    if (!pathname.startsWith(clubPathPrefix)) {
      return sendJson(res, 403, { error: 'Cannot delete media outside current club' });
    }

    if (url.startsWith('/api/blob/read?')) {
      const result = await list({ prefix: pathname, limit: 1, token: process.env.BLOB_READ_WRITE_TOKEN });
      deleteUrl = result.blobs?.find((item) => item.pathname === pathname)?.url;
      if (!deleteUrl) return sendJson(res, 404, { error: 'File not found' });
    }

    await del(deleteUrl, { token: process.env.BLOB_READ_WRITE_TOKEN });
    return sendJson(res, 200, { ok: true });
  } catch (error) {
    if (error.statusCode) return sendJson(res, error.statusCode, { error: error.message });
    return safeError(res, error, 'Unable to delete file');
  }
}
