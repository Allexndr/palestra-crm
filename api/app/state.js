import { getAppState, saveAppState } from '../_lib/appState.js';
import { parseJsonBody, sendJson } from '../_lib/http.js';
import { rateLimit } from '../_lib/rateLimit.js';
import { assertSameOrigin, requireUser, safeError } from '../_lib/security.js';
import { appStateSchema, parseOrThrow } from '../_lib/validation.js';

export default async function handler(req, res) {
  if (!assertSameOrigin(req, res)) return;
  if (!rateLimit(req, res, { key: 'app-state', limit: 120, windowMs: 60_000 })) {
    return sendJson(res, 429, { error: 'Too many requests' });
  }

  try {
    const requestUser = await requireUser(req, res, { allowDemo: true });
    if (!requestUser) return;

    if (req.method === 'GET') {
      const state = await getAppState(requestUser);
      return sendJson(res, 200, { state });
    }

    if (req.method === 'PUT') {
      const { state } = parseOrThrow(appStateSchema, await parseJsonBody(req));
      const saved = await saveAppState(requestUser, state);
      return sendJson(res, 200, { state: saved });
    }

    return sendJson(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    console.error('[API/app/state] Error:', error);
    if (error.statusCode) return sendJson(res, error.statusCode, { error: error.message });
    return safeError(res, error, 'Unable to process app state');
  }
}
