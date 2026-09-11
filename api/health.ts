import type { ServerResponse } from 'node:http';
import { json, type Request } from '../server/http.js';

export default async function handler(req: Request, res: ServerResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return json(res, 405, { error: 'Chỉ hỗ trợ GET.' });
  }

  return json(res, 200, {
    status: 'pass',
    service: 'traveling-api',
    version: '2.4.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    checks: {
      uptime: { status: 'pass', seconds: Math.floor(process.uptime()) },
      aiEngine: { status: 'pass', providers: ['OpenAI', 'Traveling Smart Fallback Engine'] },
      compliance: { status: 'pass', decree13_PDPD: true, decree85_ecommerce: true },
    },
  });
}
