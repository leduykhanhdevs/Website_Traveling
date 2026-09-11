/**
 * Cloudflare Worker API Gateway (Interface Adapter / Controller)
 * Clean & Hexagonal Architecture:
 * - Delegates all business logic to Application Use Cases.
 * - Formats all errors adhering to RFC 7807 Problem Details.
 * - Pure Dependency Injection container for Edge Serverless execution.
 */

import { PlanItineraryUseCase } from '../src/core/application/use-cases/plan-itinerary.use-case';
import { RecognizeFoodUseCase } from '../src/core/application/use-cases/recognize-food.use-case';
import { TranslatePhraseUseCase } from '../src/core/application/use-cases/translate-phrase.use-case';

import { OpenAiItineraryAdapter } from '../src/core/infrastructure/ai/openai-itinerary.adapter';
import { CloudflareItineraryAdapter } from '../src/core/infrastructure/ai/cloudflare-itinerary.adapter';
import { SmartItineraryAdapter } from '../src/core/infrastructure/ai/smart-itinerary.adapter';

import { OpenAiVisionAdapter } from '../src/core/infrastructure/ai/openai-vision.adapter';
import { CloudflareVisionAdapter } from '../src/core/infrastructure/ai/cloudflare-vision.adapter';
import { SmartVisionAdapter } from '../src/core/infrastructure/ai/smart-vision.adapter';

import { CloudflareTranslationAdapter } from '../src/core/infrastructure/ai/cloudflare-translation.adapter';
import { HandbookTranslationAdapter } from '../src/core/infrastructure/ai/handbook-translation.adapter';
import { ResendNotificationAdapter } from '../src/core/infrastructure/notification/resend-notification.adapter';

export interface Env {
  AI?: any;
  ASSETS?: { fetch: (request: Request) => Promise<Response> };
  OPENAI_API_KEY?: string;
  RESEND_API_KEY?: string;
  RESEND_FROM?: string;
}

// RFC 7807 Problem Details response helper
function problem(title: string, status: number, detail?: string): Response {
  return new Response(
    JSON.stringify({
      type: 'about:blank',
      title,
      status,
      detail: detail || title,
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/problem+json; charset=utf-8',
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    try {
      if (path === '/api/itinerary') {
        return await handleItinerary(request, env);
      }
      if (path === '/api/translate') {
        return await handleTranslate(request, env);
      }
      if (path === '/api/ocr') {
        return await handleOcr(request, env);
      }
      if (path === '/api/subscribe') {
        return await handleSubscribe(request, env);
      }
    } catch (err: any) {
      return problem('Internal Server Error', 500, err?.message || 'Đã xảy ra lỗi nội bộ.');
    }

    // Serve static assets from [assets] directory = "./dist"
    if (env.ASSETS) {
      return await env.ASSETS.fetch(request);
    }

    return new Response('Traveling API Gateway Running.', {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  },
};

// ==========================================
// 1. ITINERARY ROUTE CONTROLLER
// ==========================================
async function handleItinerary(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') {
    return problem('Method Not Allowed', 405, 'Chỉ hỗ trợ phương thức POST.');
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return problem('Bad Request', 400, 'Dữ liệu JSON không hợp lệ.');
  }

  const destination = (body.destination || '').trim();
  const days = Number(body.days) || 3;
  const budgetRange = body.budgetRange || 'midrange';
  const travelStyle = (body.travelStyle || 'Văn hóa & Ẩm thực').trim();

  // Dependency Injection: Compose Provider Chain
  const providers = [
    new OpenAiItineraryAdapter(env.OPENAI_API_KEY || ''),
    new CloudflareItineraryAdapter(env.AI),
    new SmartItineraryAdapter(),
  ];

  const useCase = new PlanItineraryUseCase(providers);

  try {
    const plan = await useCase.execute({
      destination,
      days,
      budgetRange,
      travelStyle,
    });

    return json({
      plan,
      source: 'clean-architecture-itinerary-service',
      currency: 'USD',
      generatedAt: plan.generatedAt,
    });
  } catch (err: any) {
    return problem('Unprocessable Entity', 422, err?.message || 'Không thể tạo lịch trình.');
  }
}

// ==========================================
// 2. TRANSLATION ROUTE CONTROLLER
// ==========================================
async function handleTranslate(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') {
    return problem('Method Not Allowed', 405, 'Chỉ hỗ trợ phương thức POST.');
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return problem('Bad Request', 400, 'Dữ liệu JSON không hợp lệ.');
  }

  const text = (body.text || '').trim();
  const targetLang = body.targetLang || 'ja';

  if (!text) {
    return problem('Bad Request', 400, 'Vui lòng cung cấp văn bản cần dịch.');
  }

  // Dependency Injection: Compose Translation Provider Chain
  const providers = [
    new CloudflareTranslationAdapter(env.AI),
    new HandbookTranslationAdapter(),
  ];

  const useCase = new TranslatePhraseUseCase(providers);

  try {
    const result = await useCase.execute({ text, targetLang });
    return json(result);
  } catch (err: any) {
    return problem('Service Unavailable', 503, err?.message || 'Dịch vụ dịch thuật tạm thời gián đoạn.');
  }
}

// ==========================================
// 3. FOOD & MENU VISION ROUTE CONTROLLER
// ==========================================
async function handleOcr(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') {
    return problem('Method Not Allowed', 405, 'Chỉ hỗ trợ phương thức POST.');
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return problem('Bad Request', 400, 'Dữ liệu ảnh không hợp lệ.');
  }

  const image = body.image || '';
  const scanMode = body.scanMode || 'dish';
  const categoryHint = body.category || '';
  const clientApiKey = (body.apiKey || env.OPENAI_API_KEY || '').trim();

  // Dependency Injection: Compose Vision Provider Chain
  const providers = [
    new OpenAiVisionAdapter(clientApiKey),
    new CloudflareVisionAdapter(env.AI),
    new SmartVisionAdapter(),
  ];

  const useCase = new RecognizeFoodUseCase(providers);

  try {
    const result = await useCase.execute({
      image,
      scanMode,
      categoryHint,
      apiKey: clientApiKey,
    });

    return json(result);
  } catch (err: any) {
    return problem('Unprocessable Entity', 422, err?.message || 'Không thể nhận diện hình ảnh.');
  }
}

// ==========================================
// 4. WAITLIST & EMAIL SUBSCRIPTION CONTROLLER
// ==========================================
async function handleSubscribe(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') {
    return problem('Method Not Allowed', 405, 'Chỉ hỗ trợ phương thức POST.');
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return problem('Bad Request', 400, 'Dữ liệu không hợp lệ.');
  }

  const email = (body.email || '').trim().toLowerCase();
  if (!email || !email.includes('@')) {
    return problem('Bad Request', 400, 'Địa chỉ email không hợp lệ.');
  }

  if (env.RESEND_API_KEY && env.RESEND_FROM) {
    try {
      const adapter = new ResendNotificationAdapter(env.RESEND_API_KEY, env.RESEND_FROM);
      await adapter.send({
        to: email,
        subject: 'Traveling - Cảm ơn bạn đã quan tâm',
        contentText: 'Cảm ơn bạn đã đăng ký trải nghiệm Traveling! Chúng tôi sẽ cập nhật những tính năng mới nhất.',
      });
      return json({ success: true, message: 'Đăng ký nhận tin thành công!' });
    } catch {
      return problem('Bad Gateway', 502, 'Dịch vụ gửi email đối tác tạm thời gián đoạn.');
    }
  }

  return json({ success: true, message: 'Đã lưu thông tin đăng ký của bạn.' });
}
