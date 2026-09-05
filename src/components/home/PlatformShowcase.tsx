import React from 'react';
import { Smartphone, Monitor, Cloud, Shield, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

export const PlatformShowcase: React.FC = () => {
  return (
    <section id="platform" aria-labelledby="platform-heading" className="py-24 relative overflow-hidden bg-surface/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 id="platform-heading" className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
            Đồng Bộ Hoàn Hảo Trên Mọi Thiết Bị
          </h2>
          <p className="text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Lên kế hoạch chi tiết trên máy tính bàn, sau đó mở ứng dụng di động để tra cứu ngoại tuyến và nhận hỗ trợ ngay trên từng nẻo đường.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Platform 1: Web Application */}
          <div className="glass-card p-8 rounded-3xl border border-border-subtle relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6">
              <Monitor className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
              Nền Tảng Web Toàn Năng
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Tối ưu cho màn hình lớn với khả năng nghiên cứu điểm đến, so sánh lịch trình nhiều ngày và quản lý ngân sách nhóm chuyên nghiệp.
            </p>

            <ul className="space-y-2.5 text-xs text-slate-300 border-t border-border-subtle pt-6">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Next.js App Router hiệu năng cao</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Bản đồ không gian 3D tương tác</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Xuất file PDF lịch trình đầy đủ</span>
              </li>
            </ul>
          </div>

          {/* Platform 2: Mobile App */}
          <div className="glass-card p-8 rounded-3xl border border-primary/40 relative overflow-hidden group shadow-xl shadow-primary/10">
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-bold bg-primary text-slate-950">
              ĐỒNG HÀNH MỌI NƠI
            </div>

            <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary mb-6">
              <Smartphone className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
              Ứng Dụng Di Động iOS & Android
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Trợ thủ đắc lực bỏ túi: quét máy ảnh dịch tức thì, nhận diện giọng nói hai chiều và kích hoạt nút báo động khẩn cấp SOS khi cần.
            </p>

            <ul className="space-y-2.5 text-xs text-slate-300 border-t border-border-subtle pt-6">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Camera OCR quét thực đơn nhanh chóng</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Chế độ ngoại tuyến tra cứu không cần mạng</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Định vị cứu hộ SOS một chạm</span>
              </li>
            </ul>
          </div>

          {/* Platform 3: Cloud Infrastructure */}
          <div className="glass-card p-8 rounded-3xl border border-border-subtle relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-400/10 border border-indigo-400/20 flex items-center justify-center text-indigo-400 mb-6">
              <Cloud className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">
              Hạ Tầng Đám Mây Tức Thời
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Toàn bộ ghi chú, hóa đơn thanh toán nhóm và địa điểm đã lưu được đồng bộ tự động theo thời gian thực với độ trễ dưới 200ms.
            </p>

            <ul className="space-y-2.5 text-xs text-slate-300 border-t border-border-subtle pt-6">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                <span>Cơ sở dữ liệu PostgreSQL + Prisma</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                <span>Bộ nhớ đệm Redis phân tán toàn cầu</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                <span>Xác thực danh tính an toàn qua Clerk</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
