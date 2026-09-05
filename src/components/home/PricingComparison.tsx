import React, { useState } from 'react';
import { PRICING_PLANS } from '../../data/pricing';
import { CheckCircle2, X, Sparkles, ArrowRight } from 'lucide-react';

export const PricingComparison: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <section id="pricing" aria-labelledby="pricing-heading" className="py-24 relative overflow-hidden bg-surface/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 id="pricing-heading" className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
            Bảng Giá Minh Bạch, Không Chi Phí Ẩn
          </h2>
          <p className="text-base text-slate-400 leading-relaxed max-w-2xl mx-auto mb-8">
            Bắt đầu hoàn toàn miễn phí với các tính năng cơ bản. Nâng cấp bất kỳ lúc nào để mở khóa toàn bộ sức mạnh AI chuyên sâu.
          </p>

          {/* Billing Cycle Switch */}
          <div role="group" aria-label="Chu kỳ thanh toán" className="inline-flex items-center p-1.5 rounded-full bg-surface-light border border-border-subtle">
            <button
              onClick={() => setBillingCycle('monthly')}
              aria-pressed={billingCycle === 'monthly'}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all focus-visible:ring-2 focus-visible:ring-primary focus:outline-none ${
                billingCycle === 'monthly'
                  ? 'bg-primary text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Thanh Toán Theo Tháng
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              aria-pressed={billingCycle === 'yearly'}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-primary focus:outline-none ${
                billingCycle === 'yearly'
                  ? 'bg-primary text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Thanh Toán Theo Năm</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-extrabold">
                Tiết kiệm 25%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {PRICING_PLANS.map((plan) => {
            const priceDisplay =
              plan.id === 'free'
                ? '0đ'
                : billingCycle === 'monthly'
                ? '99.000đ'
                : '75.000đ';

            const periodDisplay =
              plan.id === 'free'
                ? 'Miễn phí trọn đời'
                : billingCycle === 'monthly'
                ? 'tháng (thanh toán hàng tháng)'
                : 'tháng (899.000đ trả theo năm)';

            return (
              <div
                key={plan.id}
                className={`glass-card p-8 rounded-3xl relative flex flex-col justify-between transition-all ${
                  plan.highlighted
                    ? 'border-2 border-primary shadow-2xl shadow-primary/20 scale-[1.02]'
                    : 'border border-border-subtle'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-primary to-secondary text-slate-950 font-black text-xs shadow-lg flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>LỰA CHỌN PHỔ BIẾN NHẤT</span>
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-xs text-slate-400 mb-6">{plan.description}</p>

                  <div className="flex items-baseline gap-1.5 mb-1">
                    <span className="text-4xl font-black text-white font-mono">{priceDisplay}</span>
                    <span className="text-xs text-slate-400">/{periodDisplay}</span>
                  </div>

                  <ul className="space-y-3 pt-6 border-t border-border-subtle my-6 text-xs">
                    {plan.features.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        {f.included ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                        )}
                        <span className={f.included ? 'text-slate-200' : 'text-slate-400 line-through'}>
                          {f.title}
                        </span>
                        {f.pill && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/20 text-primary border border-primary/30 ml-auto">
                            {f.pill}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  aria-label={`${plan.cta} gói hội viên ${plan.name}`}
                  className={`w-full py-3.5 rounded-full font-bold text-xs transition-all flex items-center justify-center gap-2 active:scale-95 focus-visible:ring-2 focus-visible:ring-primary focus:outline-none ${
                    plan.highlighted
                      ? 'bg-primary hover:bg-primary-hover text-slate-950 shadow-lg shadow-primary/25'
                      : 'bg-surface-light hover:bg-slate-800 text-white border border-border-subtle'
                  }`}
                >
                  <span>{plan.cta}</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
