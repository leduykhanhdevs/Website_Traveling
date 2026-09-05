import React, { useRef, useEffect } from 'react';
import { ArrowRight, Compass, Sparkles, Shield, Zap } from 'lucide-react';
import { HeaderAstrolabe } from '../3d/HeaderAstrolabe';
import { gsap } from 'gsap';

export const HeroSection: React.FC<{
  onExploreClick: () => void;
  onDemoClick: () => void;
}> = ({ onExploreClick, onDemoClick }) => {
  const primaryBtnRef = useRef<HTMLButtonElement>(null);

  // Magnetic button hover effect with GSAP
  useEffect(() => {
    const btn = primaryBtnRef.current;
    if (!btn) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);
      gsap.to(btn, {
        x: x * 0.25,
        y: y * 0.25,
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    const handleMouseLeave = () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.4,
        ease: 'elastic.out(1, 0.4)',
      });
    };

    btn.addEventListener('mousemove', handleMouseMove);
    btn.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      btn.removeEventListener('mousemove', handleMouseMove);
      btn.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative min-h-[700px] lg:min-h-[820px] flex items-center justify-center pt-24 pb-14 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-primary/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[450px] h-[250px] bg-secondary/10 rounded-full blur-[110px] pointer-events-none" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto w-full z-10">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Semantic Headline, Copy, Actions */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            {/* 1. Single Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface border border-border-subtle text-xs font-semibold text-primary shadow-lg shadow-black/40">
              <Sparkles className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
              <span>Hệ Sinh Thái Du Lịch Trí Tuệ Nhân Tạo</span>
            </div>

            {/* 2. Primary H1 Headline */}
            <h1
              id="hero-heading"
              className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]"
            >
              Khám Phá Thế Giới Với{' '}
              <span className="bg-gradient-to-r from-primary via-sky-300 to-secondary bg-clip-text text-transparent">
                Trí Tuệ Nhân Tạo
              </span>
            </h1>

            {/* 3. Subtext */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
              Tối ưu hành trình du lịch với trợ lý AI: tự động lập lịch trình, dịch thuật đa phương thức và quản lý ngân sách thông minh.
            </p>

            {/* 4. Action CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                ref={primaryBtnRef}
                onClick={onExploreClick}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-primary hover:bg-primary-hover text-slate-950 font-bold text-sm transition-all duration-300 shadow-xl shadow-primary/25 hover:shadow-primary/40 flex items-center justify-center gap-2 active:scale-95 focus-visible:ring-2 focus-visible:ring-white focus:outline-none"
                aria-label="Bắt đầu khám phá các tính năng và điểm đến"
              >
                <span>Bắt Đầu Khám Phá</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>

              <button
                onClick={onDemoClick}
                className="w-full sm:w-auto px-7 py-4 rounded-full glass-panel hover:bg-surface-light text-slate-200 font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 border border-border-subtle hover:border-primary/40 active:scale-95 focus-visible:ring-2 focus-visible:ring-primary focus:outline-none"
                aria-label="Chuyển đến phần mô phỏng trực tiếp"
              >
                <Compass className="w-4 h-4 text-primary" aria-hidden="true" />
                <span>Trải Nghiệm Mô Phỏng</span>
              </button>
            </div>

            {/* Micro proof badges */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" aria-hidden="true" />
                <span>Xử lý &lt; 1.2s tức thì</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                <span>Bảo mật dữ liệu Clerk</span>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Celestial Astrolabe Scene */}
          <div className="lg:col-span-5 flex items-center justify-center relative">
            <div className="w-full max-w-[480px] aspect-square relative">
              <HeaderAstrolabe />
              {/* Floating ambient badge */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-surface/90 backdrop-blur-md border border-border-subtle text-[11px] text-slate-300 flex items-center gap-2 shadow-xl pointer-events-none">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span>Không gian định vị 3D tương tác</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
