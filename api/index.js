// One function serves every /api route (see vercel.json).
import { handleUpload } from '@vercel/blob/client';
import {
  isConfigured, isSignedIn, passwordMatches, sessionCookie, clearCookie,
  clientIp, isLockedOut, recordFailure, clearFailures, sameOrigin
} from '../lib/auth.js';
import { readContent, saveContent, validateContent } from '../lib/content.js';

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const VIDEO_TYPES = ['video/mp4', 'video/webm'];
const MAX_UPLOAD = 20 * 1024 * 1024;

const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers } });
const fail = (status, error, message) => json({ error, message }, status);
const pause = (ms) => new Promise((r) => setTimeout(r, ms));

function routeOf(request) {
  const url = new URL(request.url);
  return url.searchParams.get('route') || url.pathname.replace(/^\/api\/?/, '').replace(/\/$/, '');
}
// Admin writes need a signed-in session and must come from this site's pages.
function guard(request) {
  if (!sameOrigin(request) || request.headers.get('x-requested-with') !== 'wf-admin') return fail(403, 'forbidden', 'This request did not come from the site.');
  if (!isSignedIn(request)) return fail(401, 'signed_out', 'Sign in again.');
  return null;
}

export default {
  async fetch(request) {
    const route = routeOf(request);
    const method = request.method;
    try {
      if (route === 'content' && method === 'GET') {
        let content = null, storage = true;
        try { content = await readContent(); } catch { storage = false; }
        return json({ api: true, configured: isConfigured(), storage, signedIn: isSignedIn(request), content });
      }

      if (route === 'login' && method === 'POST') {
        if (!sameOrigin(request)) return fail(403, 'forbidden', 'This request did not come from the site.');
        if (!isConfigured()) return fail(503, 'not_configured', 'The admin password has not been set on the host.');
        const ip = clientIp(request);
        if (isLockedOut(ip)) return fail(429, 'locked_out', 'Too many wrong attempts. Try again in 15 minutes.');
        const body = await request.json().catch(() => ({}));
        if (!passwordMatches(body.password)) {
          recordFailure(ip);
          await pause(700);
          return fail(401, 'wrong_password', 'Wrong password.');
        }
        clearFailures(ip);
        return json({ ok: true }, 200, { 'Set-Cookie': sessionCookie() });
      }

      if (route === 'logout' && method === 'POST') {
        return json({ ok: true }, 200, { 'Set-Cookie': clearCookie() });
      }

      if (route === 'content' && method === 'PUT') {
        const blocked = guard(request);
        if (blocked) return blocked;
        const body = await request.json().catch(() => null);
        const problem = validateContent(body && body.content);
        if (problem) return fail(422, 'invalid_content', problem);
        const result = await saveContent(body.content);
        if (result.error) return fail(413, result.error, 'The content is too large to publish.');
        return json({ ok: true });
      }

      if (route === 'upload' && method === 'POST') {
        const body = await request.json();
        if (body && body.type === 'blob.generate-client-token' && (!sameOrigin(request) || !isSignedIn(request))) return fail(401, 'signed_out', 'Sign in again.');
        const result = await handleUpload({
          body, request,
          onBeforeGenerateToken: async () => {
            if (!sameOrigin(request) || !isSignedIn(request)) throw new Error('signed_out');
            return { allowedContentTypes: [...IMAGE_TYPES, ...VIDEO_TYPES], maximumSizeInBytes: MAX_UPLOAD, addRandomSuffix: true };
          },
          onUploadCompleted: async () => {}
        });
        return json(result);
      }

      return fail(404, 'not_found', 'No such route.');
    } catch (err) {
      const signedOut = err && err.message === 'signed_out';
      if (!signedOut) console.error('api error', route, err);
      return signedOut ? fail(401, 'signed_out', 'Sign in again.') : fail(500, 'server_error', 'Something went wrong on the server.');
    }
  }
};
