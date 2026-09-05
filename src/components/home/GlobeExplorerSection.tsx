import React, { useState } from 'react';
import { InteractiveGlobe } from '../3d/InteractiveGlobe';
import { Destination } from '../../types';
import { DESTINATIONS } from '../../data/destinations';
import { Globe, Plane, ShieldCheck, Zap } from 'lucide-react';
import { AnimatedCounter } from '../ui/AnimatedCounter';

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
            Tương tác đa chiều với địa cầu số hóa: khám phá các hành lang bay quốc tế, các điểm nút văn hóa và dữ liệu du lịch thực tế theo thời gian thực.
          </p>
        </div>

        {/* 3D Globe Canvas Container */}
        <div className="mb-12">
          <InteractiveGlobe
            selectedCityId={activeCity.id}
            onSelectCity={(city) => setActiveCity(city)}
          />
        </div>

        {/* Global Telemetry Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-5 rounded-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary" aria-hidden="true">
                <Globe className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-medium text-slate-400">Độ Phủ Toàn Cầu</h3>
            </div>
            <p className="text-2xl font-black text-white">
              <AnimatedCounter end={50} suffix="+ Quốc Gia" />
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Dữ liệu địa lý chuẩn hóa</p>
          </div>

          <div className="glass-card p-5 rounded-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-400/10 flex items-center justify-center text-emerald-400" aria-hidden="true">
                <Plane className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-medium text-slate-400">Tuyến Bay Quốc Tế</h3>
            </div>
            <p className="text-2xl font-black text-white">
              <AnimatedCounter end={100} suffix="% Khép Kín" />
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Tối ưu thời gian quá cảnh</p>
          </div>

          <div className="glass-card p-5 rounded-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-400/10 flex items-center justify-center text-indigo-400" aria-hidden="true">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-medium text-slate-400">Tốc Độ Phản Hồi Hệ Thống</h3>
            </div>
            <p className="text-2xl font-black text-white">
              <AnimatedCounter end={1.2} decimals={1} prefix="< " suffix=" Giây" />
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Lập lộ trình tức thì</p>
          </div>

          <div className="glass-card p-5 rounded-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center text-amber-400" aria-hidden="true">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-medium text-slate-400">Bảo Mật Người Dùng</h3>
            </div>
            <p className="text-2xl font-black text-white">Chuẩn Clerk Auth</p>
            <p className="text-[11px] text-slate-400 mt-1">Mã hóa dữ liệu đầu cuối</p>
          </div>
        </div>
      </div>
    </section>
  );
};
