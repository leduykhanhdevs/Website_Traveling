import { test } from 'node:test';
import assert from 'node:assert/strict';

import { PlanItineraryUseCase } from '../src/core/application/use-cases/plan-itinerary.use-case';
import { RecognizeFoodUseCase } from '../src/core/application/use-cases/recognize-food.use-case';
import { TranslatePhraseUseCase } from '../src/core/application/use-cases/translate-phrase.use-case';
import { SimplifyDebtsUseCase } from '../src/core/application/use-cases/simplify-debts.use-case';

import { SmartItineraryAdapter } from '../src/core/infrastructure/ai/smart-itinerary.adapter';
import { SmartVisionAdapter } from '../src/core/infrastructure/ai/smart-vision.adapter';
import { HandbookTranslationAdapter } from '../src/core/infrastructure/ai/handbook-translation.adapter';

import type { ItineraryAiPort } from '../src/core/application/ports/itinerary-ai.port';
import type { VisionAiPort } from '../src/core/application/ports/vision-ai.port';

test('Clean Architecture: PlanItineraryUseCase with fallback chain and domain validation', async () => {
  // Mock failing primary provider
  const failingProvider: ItineraryAiPort = {
    providerName: 'mock-failing-ai',
    async isAvailable() { return true; },
    async generate() { throw new Error('Primary AI rate limit exceeded (429)'); },
  };

  // Smart fallback provider
  const fallbackProvider = new SmartItineraryAdapter();

  const useCase = new PlanItineraryUseCase([failingProvider, fallbackProvider]);

  // Test domain validation
  await assert.rejects(
    () => useCase.execute({ destination: '', days: 3, budgetRange: 'midrange', travelStyle: 'Food' }),
    /Điểm đến phải có ít nhất 2 ký tự/
  );

  await assert.rejects(
    () => useCase.execute({ destination: 'Kyoto', days: 10, budgetRange: 'midrange', travelStyle: 'Food' }),
    /Số ngày lịch trình phải từ 1 đến 7 ngày/
  );

  // Test successful fallback execution
  const plan = await useCase.execute({
    destination: 'Tokyo, Japan',
    days: 3,
    budgetRange: 'premium',
    travelStyle: 'Văn hóa & Nghệ thuật',
  });

  assert.equal(plan.days.length, 3);
  assert.equal(plan.destination, 'Tokyo, Japan');
  assert.ok(plan.totalEstimatedSpend > 0);
  assert.equal(plan.days[0].slots.length, 3);
});

test('Clean Architecture: RecognizeFoodUseCase with Vision AI fallback', async () => {
  const failingVisionProvider: VisionAiPort = {
    providerName: 'mock-failing-vision',
    async isAvailable() { return true; },
    async analyze() { throw new Error('Network timeout'); },
  };

  const smartVision = new SmartVisionAdapter();
  const useCase = new RecognizeFoodUseCase([failingVisionProvider, smartVision]);

  // Test empty parameters rejection
  await assert.rejects(
    () => useCase.execute({ image: '', scanMode: 'dish' }),
    /Vui lòng cung cấp hình ảnh hoặc chủ đề thực đơn/
  );

  // Test fallback execution with category hint
  const result = await useCase.execute({
    image: 'data:image/jpeg;base64,test-image-payload',
    scanMode: 'dish',
    categoryHint: 'korean',
  });

  assert.ok(result.items.length > 0);
  assert.ok(result.items.some(item => item.original.includes('삼겹살')));
  assert.equal(result.source, 'traveling-vision-engine');
});

test('Clean Architecture: TranslatePhraseUseCase with Handbook dictionary', async () => {
  const handbookAdapter = new HandbookTranslationAdapter();
  const useCase = new TranslatePhraseUseCase([handbookAdapter]);

  // Empty text test
  const emptyRes = await useCase.execute({ text: '  ', targetLang: 'ja' });
  assert.equal(emptyRes.translatedText, '');

  // Exact handbook translation
  const res = await useCase.execute({
    text: 'Xin chào, cho tôi hỏi quán cà phê ngon gần đây nhất ở đâu?',
    targetLang: 'ja',
  });
  assert.ok(res.translatedText.includes('こんにちは'));
  assert.ok(res.pronunciation?.includes('Konnichiwa'));
});

test('Clean Architecture: SimplifyDebtsUseCase with multi-member expense graph', () => {
  const useCase = new SimplifyDebtsUseCase();

  const members = [
    { id: 'u1', name: 'Alice' },
    { id: 'u2', name: 'Bob' },
    { id: 'u3', name: 'Charlie' },
  ];

  // Alice pays 90 for all 3 members (30 each)
  // Bob pays 30 for Alice and Bob (15 each)
  const expenses = [
    {
      id: 'e1',
      description: 'Bữa trưa',
      amount: 90,
      currency: 'VND',
      paidById: 'u1',
      splitAmongIds: ['u1', 'u2', 'u3'],
    },
    {
      id: 'e2',
      description: 'Cà phê',
      amount: 30,
      currency: 'VND',
      paidById: 'u2',
      splitAmongIds: ['u1', 'u2'],
    },
  ];

  const settlements = useCase.execute(members, expenses);
  assert.ok(settlements.length > 0);

  // Net balance verification:
  // Alice: +90 - 30 - 15 = +45
  // Bob: +30 - 30 - 15 = -15
  // Charlie: -30 = -30
  // Total debtors (45) == Total creditors (45)
  const totalSettlementAmount = settlements.reduce((sum, s) => sum + s.amount, 0);
  assert.equal(Math.round(totalSettlementAmount), 45);
});
