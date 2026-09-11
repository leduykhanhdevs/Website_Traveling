import React, { useState, lazy, Suspense } from 'react';
import { Destination } from '../../types';
import { DESTINATIONS } from '../../data/destinations';
import { Globe, Plane, ShieldCheck, Zap } from 'lucide-react';
import { AnimatedCounter } from '../ui/AnimatedCounter';

const InteractiveGlobe = lazy(() =>
  import('../3d/InteractiveGlobe').then((mod) => ({ default: mod.InteractiveGlobe }))
);

export const GlobeExplorerSection: React.FC = () => {
  const [activeCity, setActiveCity] = useState<Destination>(DESTINATIONS[0]);

  return (
    <section id="globe" aria-labelledby="globe-heading" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header (Vertical stack, no split header) */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 id="globe-heading" className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
            Bản Đồ Không Gian 3D Trực Quan
          </h2>
          <p className="text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Xoay địa cầu, chọn tọa độ và khám phá 18 điểm đến. Các đường nối thể hiện kết nối trực quan, không phải tuyến bay đang khai thác.
          </p>
        </div>

        {/* 3D Globe Canvas Container */}
        <div className="mb-12">
          <Suspense
            fallback={
              <div className="w-full h-[520px] rounded-3xl bg-surface/50 border border-border-subtle flex flex-col items-center justify-center gap-3 text-slate-400 animate-pulse">
                <Globe className="w-10 h-10 text-primary/60 animate-spin" />
                <span className="text-xs font-medium">Đang khởi tạo bản đồ địa cầu 3D tương tác...</span>
              </div>
            }
          >
            <InteractiveGlobe
              selectedCityId={activeCity.id}
              onSelectCity={(city) => setActiveCity(city)}
            />
          </Suspense>
        </div>

        {/* Global Telemetry Metrics */}
        <div id="globe-telemetry" className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 items-stretch">
          <div className="glass-card p-4 sm:p-5 rounded-2xl flex flex-col justify-between h-full min-h-[144px] border border-border-subtle hover:border-primary/40 transition-colors text-center sm:text-left items-center sm:items-start">
            <div className="w-full flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-2.5 mb-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0" aria-hidden="true">
                <Globe className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-semibold text-slate-300">Điểm Đến Tuyển Chọn</h3>
            </div>
            <p className="text-xl sm:text-2xl font-black text-white tracking-tight w-full">
              <AnimatedCounter end={18} suffix=" Điểm Đến" />
            </p>
            <p className="text-[11px] text-slate-400 mt-2 w-full">Dữ liệu địa lý chuẩn hóa</p>
          </div>

          <div className="glass-card p-4 sm:p-5 rounded-2xl flex flex-col justify-between h-full min-h-[144px] border border-border-subtle hover:border-emerald-500/40 transition-colors text-center sm:text-left items-center sm:items-start">
            <div className="w-full flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-2.5 mb-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-400/10 flex items-center justify-center text-emerald-400 shrink-0" aria-hidden="true">
                <Plane className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-semibold text-slate-300">Khu Vực Khám Phá</h3>
            </div>
            <p className="text-xl sm:text-2xl font-black text-white tracking-tight w-full">
              <AnimatedCounter end={3} suffix=" Khu Vực" />
            </p>
            <p className="text-[11px] text-slate-400 mt-2 w-full">Đông Nam Á, Đông Á, Châu Âu</p>
          </div>

          <div className="glass-card p-4 sm:p-5 rounded-2xl flex flex-col justify-between h-full min-h-[144px] border border-border-subtle hover:border-indigo-500/40 transition-colors text-center sm:text-left items-center sm:items-start">
            <div className="w-full flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-2.5 mb-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-400/10 flex items-center justify-center text-indigo-400 shrink-0" aria-hidden="true">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-semibold text-slate-300">Lịch Trình Linh Hoạt</h3>
            </div>
            <p className="text-xl sm:text-2xl font-black text-white tracking-tight w-full">
              <AnimatedCounter end={7} suffix=" Ngày" />
            </p>
            <p className="text-[11px] text-slate-400 mt-2 w-full">Tùy chọn thời gian chuyến đi</p>
          </div>

          <div className="glass-card p-4 sm:p-5 rounded-2xl flex flex-col justify-between h-full min-h-[144px] border border-border-subtle hover:border-amber-500/40 transition-colors text-center sm:text-left items-center sm:items-start">
            <div className="w-full flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-2.5 mb-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center text-amber-400 shrink-0" aria-hidden="true">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-semibold text-slate-300">Bảo Mật Người Dùng</h3>
            </div>
            <p className="text-xl sm:text-2xl font-black text-white tracking-tight w-full">Lưu Cục Bộ</p>
            <p className="text-[11px] text-slate-400 mt-2 w-full">Chủ động tải lịch về thiết bị</p>
          </div>
        </div>
      </div>
    </section>
  );
};
