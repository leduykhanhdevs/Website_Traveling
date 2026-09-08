import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import itinerary from '../api/itinerary';
import subscribe from '../api/subscribe';
import { planSchema, requestSchema, validateGeneratedPlan } from '../shared/itinerary';

const request = { destination: 'Tokyo, Nhật Bản', days: 1, budgetRange: 'midrange' as const, travelStyle: 'Văn hóa' };
const fixture = () => ({ id: 'test-plan', destination: request.destination, budgetRange: 'midrange', totalEstimatedSpend: 10, days: [{ day: 1, title: 'Asakusa', totalEstimatedSpend: 10, slots: [{ id: 'slot1', day: 1, startTime: '09:00', endTime: '10:00', title: 'Senso-ji', description: 'Test fixture', estimatedSpend: 10 }] }] });
test('request rejects excess days, injected fields and invalid budget', () => {
  for (const patch of [{ days: 0 }, { days: 8 }, { days: 1.5 }, { userId: 'other-user' }, { budgetRange: 'free' }, { destination: '' }]) assert.equal(requestSchema.safeParse({ ...request, ...patch }).success, false);
});
test('plan validates app contract, rejects overlap, wrong totals, wrong destination and day counts', () => {
  assert.ok(validateGeneratedPlan(fixture(), request));
  const wrongTotal = fixture(); wrongTotal.totalEstimatedSpend = 100; assert.equal(planSchema.safeParse(wrongTotal).success, false);
  const overlap = fixture(); overlap.days[0].slots.push({ ...overlap.days[0].slots[0], id: 'slot2' }); assert.equal(planSchema.safeParse(overlap).success, false);
  const reverse = fixture(); reverse.days[0].slots[0].endTime = '08:00'; assert.equal(planSchema.safeParse(reverse).success, false);
  assert.throws(() => validateGeneratedPlan(fixture(), { ...request, days: 3 }));
  assert.throws(() => validateGeneratedPlan(fixture(), { ...request, destination: 'Paris' }));
});
test('HTTP integration: methods, validation, configuration, provider failures, successful contract and rate limit', async () => {
  const originalFetch = globalThis.fetch;
  const originalEnv = { ...process.env };
  const server = createServer((req, res) => { void (req.url === '/api/subscribe' ? subscribe(req, res) : itinerary(req, res)); });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address() as { port: number };
  const url = `http://127.0.0.1:${address.port}`;
  const post = (body: unknown, path = '/api/itinerary', headers = {}) => originalFetch(url + path, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
  try {
    delete process.env.VERCEL;
    process.env.AI_PROVIDER = 'openai'; delete process.env.OPENAI_API_KEY;
    assert.equal((await originalFetch(url + '/api/itinerary')).status, 405);
    assert.equal((await post({ ...request, days: 99 })).status, 400);
    assert.equal((await post(request, '/api/itinerary', { Origin: 'https://untrusted.example' })).status, 403);
    assert.equal((await post(request)).status, 503);
    process.env.OPENAI_API_KEY = 'test-only-not-a-real-key';
    globalThis.fetch = async () => new Response('{}', { status: 429 });
    assert.equal((await post(request)).status, 503);
    globalThis.fetch = async () => new Response(JSON.stringify({ choices: [{ message: { content: '{invalid' } }] }));
    assert.equal((await post(request)).status, 502);
    globalThis.fetch = async () => new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(fixture()) } }] }));
    const ok = await post(request); assert.equal(ok.status, 200); assert.ok(planSchema.parse((await ok.json()).plan));
    await post(request); await post(request);
    assert.equal((await post(request)).status, 429);
    assert.equal((await post({ email: 'bad' }, '/api/subscribe')).status, 400);
    delete process.env.RESEND_API_KEY; delete process.env.RESEND_FROM;
    assert.equal((await post({ email: 'test@example.com' }, '/api/subscribe')).status, 503);
    process.env.RESEND_API_KEY = 'test-only'; process.env.RESEND_FROM = 'test@example.com';
    globalThis.fetch = async () => new Response('{}', { status: 500 });
    assert.equal((await post({ email: 'test@example.com' }, '/api/subscribe')).status, 502);
    globalThis.fetch = async () => new Response('{"id":"test-only"}');
    assert.equal((await post({ email: 'test@example.com' }, '/api/subscribe')).status, 200);
  } finally {
    globalThis.fetch = originalFetch;
    for (const key of Object.keys(process.env)) if (!(key in originalEnv)) delete process.env[key];
    Object.assign(process.env, originalEnv);
    await new Promise<void>(resolve => server.close(() => resolve()));
  }
});
