import React from 'react';
import { CORE_PILLARS } from '../../data/features';
import { Search, Compass, Languages, Wallet, CheckCircle2, Sparkles, ArrowUpRight } from 'lucide-react';
import { AnimatedCounter } from '../ui/AnimatedCounter';

export const CorePillarsBento: React.FC<{
  onLearnMore?: (pillarId: string) => void;
}> = ({ onLearnMore }) => {
  const p1 = CORE_PILLARS[0]; // Smart Discovery
  const p2 = CORE_PILLARS[1]; // AI Itinerary
  const p3 = CORE_PILLARS[2]; // Translation
  const p4 = CORE_PILLARS[3]; // Budget

  return (
    <section id="features" aria-labelledby="features-heading" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header (Vertical stack) */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 id="features-heading" className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
            Bốn Trụ Cột Đột Phá Của Traveling
          </h2>
          <p className="text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Hợp nhất tất cả các tác vụ du lịch phức tạp vào một giao diện thống nhất, mượt mà và thông minh vượt trội.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-12 gap-6">
          {/* Cell 1: Hero Large Cell (Span 7): AI Itinerary Planning */}
          <div className="lg:col-span-7 glass-card p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between group">
            {/* Background subtle imagery layer */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-primary/15 via-secondary/10 to-transparent rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center text-primary">
                  <Compass className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 border border-primary/20 text-primary">
                  {p2.badge}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 group-hover:text-primary transition-colors">
                {p2.title}
              </h3>
              <p className="text-sm text-primary font-medium mb-3">
                {p2.tagline}
              </p>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xl mb-6">
                {p2.description}
              </p>

              {/* Feature checklist */}
              <div className="grid sm:grid-cols-2 gap-3 mb-6">
                {p2.capabilities.map((cap, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{cap}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Metric pill footer */}
            <div className="relative z-10 pt-4 border-t border-border-subtle flex items-center justify-between">
              <div>
                <AnimatedCounter end={3.5} decimals={1} suffix="x" className="text-2xl font-black text-white" />
                <span className="text-xs text-slate-400 ml-2">{p2.statLabel}</span>
              </div>
              <button
                onClick={() => onLearnMore && onLearnMore(p2.id)}
                aria-label={`Tìm hiểu chi tiết tính năng ${p2.title}`}
                className="w-10 h-10 rounded-full bg-surface-light border border-border-subtle flex items-center justify-center text-slate-300 group-hover:text-primary group-hover:border-primary/40 transition-all focus-visible:ring-2 focus-visible:ring-primary focus:outline-none"
              >
                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Cell 2: Medium Cell (Span 5): Smart Discovery with Map Visual */}
          <div className="lg:col-span-5 glass-card p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between group">
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-400/15 border border-emerald-400/20 flex items-center justify-center text-emerald-400">
                  <Search className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-400/10 border border-emerald-400/20 text-emerald-400">
                  {p1.badge}
                </span>
              </div>

              <h3 className="text-2xl font-black text-white mb-2 group-hover:text-emerald-400 transition-colors">
                {p1.title}
              </h3>
              <p className="text-sm text-emerald-400 font-medium mb-3">
                {p1.tagline}
              </p>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                {p1.description}
              </p>

              {/* Visual simulated recommendation card */}
              <div className="p-4 rounded-2xl bg-surface-light/80 border border-border-subtle mb-6">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    Quán Cà Phê Vợt Di Sản
                  </span>
                  <span className="text-emerald-400 font-bold">Top 1 Phổ Biến</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  98% lượt đánh giá tích cực từ du khách quốc tế và địa phương
                </p>
              </div>
            </div>

            <div className="relative z-10 pt-4 border-t border-border-subtle flex items-center justify-between">
              <div>
                <AnimatedCounter end={98.4} decimals={1} suffix="%" className="text-2xl font-black text-white" />
                <span className="text-xs text-slate-400 ml-2">{p1.statLabel}</span>
              </div>
              <button
                onClick={() => onLearnMore && onLearnMore(p1.id)}
                aria-label={`Tìm hiểu chi tiết tính năng ${p1.title}`}
                className="w-10 h-10 rounded-full bg-surface-light border border-border-subtle flex items-center justify-center text-slate-300 group-hover:text-emerald-400 group-hover:border-emerald-400/40 transition-all focus-visible:ring-2 focus-visible:ring-emerald-400 focus:outline-none"
              >
                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Cell 3: Translation Suite (Span 6) */}
          <div className="lg:col-span-6 glass-card p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between group">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-400/15 border border-indigo-400/20 flex items-center justify-center text-indigo-400">
                  <Languages className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-400/10 border border-indigo-400/20 text-indigo-400">
                  {p3.badge}
                </span>
              </div>

              <h3 className="text-2xl font-black text-white mb-2 group-hover:text-indigo-400 transition-colors">
                {p3.title}
              </h3>
              <p className="text-sm text-indigo-400 font-medium mb-3">
                {p3.tagline}
              </p>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                {p3.description}
              </p>

              <div className="space-y-2 mb-6">
                {p3.capabilities.slice(0, 3).map((cap, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>{cap}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 pt-4 border-t border-border-subtle flex items-center justify-between">
              <div>
                <AnimatedCounter end={50} suffix="+" className="text-2xl font-black text-white" />
                <span className="text-xs text-slate-400 ml-2">{p3.statLabel}</span>
              </div>
              <button
                onClick={() => onLearnMore && onLearnMore(p3.id)}
                aria-label={`Tìm hiểu chi tiết tính năng ${p3.title}`}
                className="w-10 h-10 rounded-full bg-surface-light border border-border-subtle flex items-center justify-center text-slate-300 group-hover:text-indigo-400 group-hover:border-indigo-400/40 transition-all focus-visible:ring-2 focus-visible:ring-indigo-400 focus:outline-none"
              >
                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Cell 4: Budget Ledger & Splitter (Span 6) */}
          <div className="lg:col-span-6 glass-card p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between group">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-amber-400/15 border border-amber-400/20 flex items-center justify-center text-amber-400">
                  <Wallet className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400/10 border border-amber-400/20 text-amber-400">
                  {p4.badge}
                </span>
              </div>

              <h3 className="text-2xl font-black text-white mb-2 group-hover:text-amber-400 transition-colors">
                {p4.title}
              </h3>
              <p className="text-sm text-amber-400 font-medium mb-3">
                {p4.tagline}
              </p>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                {p4.description}
              </p>

              <div className="space-y-2 mb-6">
                {p4.capabilities.slice(0, 3).map((cap, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{cap}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 pt-4 border-t border-border-subtle flex items-center justify-between">
              <div>
                <AnimatedCounter end={0} suffix="$" className="text-2xl font-black text-white" />
                <span className="text-xs text-slate-400 ml-2">{p4.statLabel}</span>
              </div>
              <button
                onClick={() => onLearnMore && onLearnMore(p4.id)}
                aria-label={`Tìm hiểu chi tiết tính năng ${p4.title}`}
                className="w-10 h-10 rounded-full bg-surface-light border border-border-subtle flex items-center justify-center text-slate-300 group-hover:text-amber-400 group-hover:border-amber-400/40 transition-all focus-visible:ring-2 focus-visible:ring-amber-400 focus:outline-none"
              >
                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
