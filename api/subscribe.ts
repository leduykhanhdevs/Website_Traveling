import type { ServerResponse } from 'node:http';
import { z } from 'zod';
import { allowed, json, readBody, sameOrigin, type Request } from '../server/http.js';
const schema = z.object({ email: z.email().max(254) }).strict();
export default async function handler(req: Request, res: ServerResponse) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return json(res, 405, { error: 'Chỉ hỗ trợ POST.' }); }
  if (!sameOrigin(req)) return json(res, 403, { error: 'Nguồn yêu cầu không hợp lệ.' });
  let email;
  try { email = schema.parse(await readBody(req)).email.toLowerCase(); }
  catch { return json(res, 400, { error: 'Địa chỉ email không hợp lệ.' }); }
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM) return json(res, 503, { error: 'Dịch vụ đăng ký chưa sẵn sàng. Vui lòng thử lại sau.' });
  if (!allowed(req, 'subscribe', 3)) { res.setHeader('Retry-After', '3600'); return json(res, 429, { error: 'Bạn đã gửi nhiều yêu cầu. Vui lòng thử lại sau.' }); }
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST', signal: AbortSignal.timeout(10000),
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: process.env.RESEND_FROM, to: [email], reply_to: 'khanhdevs@gmail.com',
        subject: 'Traveling - Cảm ơn bạn đã quan tâm',
        text: 'Cảm ơn bạn đã quan tâm đến Traveling! Bạn có thể trải nghiệm website tại https://travelingvn.vercel.app. Phản hồi email này để trao đổi với đội ngũ phát triển. Đây là thư xác nhận yêu cầu nhận thông tin; chưa tạo tài khoản ứng dụng.',
      }),
    });
    const result = await response.json();
    if (!response.ok || !result.id) throw new Error('Provider rejected');
    return json(res, 200, { success: true });
  } catch { return json(res, 502, { error: 'Chưa thể gửi thư xác nhận. Vui lòng thử lại sau.' }); }
}
