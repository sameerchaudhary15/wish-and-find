// Site content (listings, reels, locality reports, site details) is one JSON
// document. Every publish saves a new copy; the newest is live and the last
// ten are kept as history.
import { put, list, del } from '@vercel/blob';

const PREFIX = 'content/';
const KEEP = 10;
const MAX_BYTES = 900 * 1024;

async function versions() {
  const { blobs } = await list({ prefix: PREFIX, limit: 1000 });
  return blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
}

export async function readContent() {
  const all = await versions();
  if (!all.length) return null;
  const res = await fetch(all[0].url, { cache: 'no-store' });
  if (!res.ok) throw new Error('content_unreadable');
  return res.json();
}

const text = (v, max) => typeof v === 'string' && v.length <= max;
const list_ = (v, max) => Array.isArray(v) && v.length <= max;

export function validateContent(c) {
  if (!c || typeof c !== 'object' || c.v !== 1) return 'Content is not in the expected format.';
  if (!list_(c.properties, 500) || !list_(c.reels, 200) || !list_(c.localities, 500)) return 'Too many items, or a list is missing.';
  if (!c.settings || typeof c.settings !== 'object' || Array.isArray(c.settings)) return 'Site details are missing.';
  for (const p of c.properties) {
    if (!p || !text(p.id, 60) || !text(p.title, 160) || !text(p.locality, 120)) return 'A property is missing its title or locality.';
    if (!(Number(p.price) > 0) || !(Number(p.area) > 0)) return `Property "${p.title}" needs a price and an area above zero.`;
  }
  for (const r of c.reels) {
    if (!r || !text(r.id, 60) || !text(r.title, 160)) return 'A reel is missing its title.';
    if (r.link && !/^https:\/\//i.test(r.link)) return `Reel "${r.title}" has a link that does not start with https://`;
  }
  for (const l of c.localities) {
    if (!l || !text(l.id, 60) || !text(l.name, 120) || !l.scores) return 'A locality report is missing its name or scores.';
  }
  return null;
}

export async function saveContent(content) {
  const body = JSON.stringify(content);
  if (Buffer.byteLength(body) > MAX_BYTES) return { error: 'too_large' };
  await put(`${PREFIX}${Date.now()}.json`, body, {
    access: 'public', addRandomSuffix: true, contentType: 'application/json', cacheControlMaxAge: 60
  });
  const old = (await versions()).slice(KEEP);
  if (old.length) await del(old.map((b) => b.url));
  return { ok: true };
}
