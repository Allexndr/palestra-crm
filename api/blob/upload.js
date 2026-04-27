import { put } from '@vercel/blob';
import { randomUUID } from 'node:crypto';
import { sendJson } from '../_lib/http.js';
import { prepareUpload, readRequestBuffer, safeFileName, uploadLimits } from '../_lib/media.js';
import { rateLimit } from '../_lib/rateLimit.js';
import { assertSameOrigin, requireUser, safeError } from '../_lib/security.js';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });
  if (!assertSameOrigin(req, res)) return;
  if (!rateLimit(req, res, { key: 'blob-upload', limit: 20, windowMs: 60_000 })) {
    return sendJson(res, 429, { error: 'Too many uploads, try again later' });
  }

  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return sendJson(res, 500, { error: 'Missing Blob token' });
    }

    const requestUser = await requireUser(req, res, { allowDemo: true });
    if (!requestUser) return;

    const scope = safeFileName(req.headers['x-upload-scope'] || 'media');
    const raw = await readRequestBuffer(req, uploadLimits.fileMaxBytes);
    const prepared = await prepareUpload({
      buffer: raw,
      fileName: req.headers['x-file-name'],
      headerMime: req.headers['content-type'],
      scope,
    });

    const clubId = requestUser.profile.club_id;
    const objectId = randomUUID();
    const pathname = `clubs/${clubId}/${scope}/${objectId}-${prepared.fileName}`;

    const blob = await put(pathname, prepared.body, {
      access: 'public',
      addRandomSuffix: false,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      contentType: prepared.contentType,
    });

    return sendJson(res, 200, {
      url: `/api/blob/read?pathname=${encodeURIComponent(blob.pathname)}`,
      pathname: blob.pathname,
      blobUrl: blob.url,
      contentType: prepared.contentType,
      optimized: prepared.optimized,
      originalBytes: prepared.originalBytes,
      finalBytes: prepared.finalBytes,
    });
  } catch (error) {
    if (error.statusCode) return sendJson(res, error.statusCode, { error: error.message });
    return safeError(res, error, 'Unable to upload file');
  }
}
