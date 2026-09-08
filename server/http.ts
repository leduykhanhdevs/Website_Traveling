import type { IncomingMessage, ServerResponse } from 'node:http';
export type Request = IncomingMessage & { body?: unknown };
export function json(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}
export async function readBody(req: Request): Promise<unknown> {
  if (!req.headers['content-type']?.includes('application/json')) throw new Error('JSON required');
  if (req.body !== undefined) {
    if (Buffer.byteLength(JSON.stringify(req.body)) > 8192) throw new Error('Body too large');
    return typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  }
  let body = '';
  for await (const chunk of req) {
    body += chunk;
    if (Buffer.byteLength(body) > 8192) throw new Error('Body too large');
  }
  return JSON.parse(body);
}

// Per-instance protection. Configure host firewall rate limits for multi-instance production.
const buckets = new Map<string, { count: number; expires: number }>();
export function allowed(req: Request, scope: string, limit = 5) {
  const now = Date.now();
  for (const [key, value] of buckets) if (value.expires < now) buckets.delete(key);
  const ip = process.env.VERCEL ? req.headers['x-vercel-forwarded-for'] : req.socket.remoteAddress;
  const key = `${scope}:${ip || 'unknown'}`;
  const bucket = buckets.get(key) || { count: 0, expires: now + 3600000 };
  bucket.count++; buckets.set(key, bucket);
  return bucket.count <= limit;
}
export function sameOrigin(req: Request) {
  if (req.headers['sec-fetch-site'] === 'cross-site') return false;
  if (!req.headers.origin) return true;
  try { return new URL(req.headers.origin).host === req.headers.host; } catch { return false; }
}
