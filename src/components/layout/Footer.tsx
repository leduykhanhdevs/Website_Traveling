import React from 'react';
import { Compass, Shield, Globe, Heart } from 'lucide-react';

export const Footer: React.FC<{
  onOpenLegal?: (tab: 'terms' | 'privacy' | 'responsible-ai' | 'sos') => void;
}> = ({ onOpenLegal }) => {
  return (
    <footer role="contentinfo" className="border-t border-border-subtle bg-surface/50 relative z-10 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-slate-950">
                <Compass className="w-4 h-4 text-slate-950" />
              </div>
              <span className="text-lg font-black text-white">Traveling</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Nền tảng trợ lý du lịch tích hợp trí tuệ nhân tạo thế hệ mới, mang lại trải nghiệm khám phá thế giới an tâm, trọn vẹn và thông minh.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Hệ thống máy chủ vận hành 100% ổn định</span>
            </div>
          </div>

          {/* Col 2: Khám Phá */}
          <div>
            <h3 className="text-xs uppercase font-bold text-white tracking-wider mb-4">
              Khám Phá Điểm Đến
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#destinations" className="hover:text-primary transition-colors">TP. Hồ Chí Minh & Hà Nội</a></li>
              <li><a href="#destinations" className="hover:text-primary transition-colors">Đà Nẵng & Hội An</a></li>
              <li><a href="#destinations" className="hover:text-primary transition-colors">Tokyo & Kyoto (Nhật Bản)</a></li>
              <li><a href="#destinations" className="hover:text-primary transition-colors">Seoul & Busan (Hàn Quốc)</a></li>
              <li><a href="#destinations" className="hover:text-primary transition-colors">Paris & Riviera (Pháp)</a></li>
              <li><a href="#destinations" className="hover:text-primary transition-colors">Thiên Đường Biển Bali</a></li>
            </ul>
          </div>

          {/* Col 3: Công Nghệ Cốt Lõi */}
          <div>
            <h3 className="text-xs uppercase font-bold text-white tracking-wider mb-4">
              Công Nghệ & Tính Năng
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#features" className="hover:text-primary transition-colors">AI Lập Lịch Trình Tự Động</a></li>
              <li><a href="#features" className="hover:text-primary transition-colors">Dịch Thuật Văn Bản & Giọng Nói</a></li>
              <li><a href="#features" className="hover:text-primary transition-colors">Camera OCR Nhận Diện Thực Đơn</a></li>
              <li><a href="#budget" className="hover:text-primary transition-colors">Sổ Quỹ Chia Tiền Nhóm VietQR</a></li>
              <li><a href="#globe" className="hover:text-primary transition-colors">Bản Đồ Không Gian Địa Cầu 3D</a></li>
              <li><a href="#pricing" className="hover:text-primary transition-colors">Gói Hội Viên Thám Hiểm Premium</a></li>
            </ul>
          </div>

          {/* Col 4: An Toàn & Bảo Mật */}
          <div>
            <h3 className="text-xs uppercase font-bold text-white tracking-wider mb-4">
              Bảo Mật & Pháp Lý
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-primary" />
                <span>Mã hóa tài khoản Clerk Auth</span>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegal?.('privacy')}
                  className="hover:text-primary transition-colors text-left"
                >
                  Chính Sách Bảo Vệ Dữ Liệu
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegal?.('terms')}
                  className="hover:text-primary transition-colors text-left"
                >
                  Điều Khoản Dịch Vụ Người Dùng
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegal?.('responsible-ai')}
                  className="hover:text-primary transition-colors text-left"
                >
                  Quy Định Sử Dụng AI Có Trách Nhiệm
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegal?.('sos')}
                  className="hover:text-primary text-rose-400/90 transition-colors text-left"
                >
                  Danh Bạ Cứu Hộ SOS Khẩn Cấp
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © {new Date().getFullYear()} Traveling Platform. Bản quyền thuộc về dự án Traveling.
          </div>
          <div className="flex items-center gap-1">
            <span>Thiết kế chuyên sâu cho cộng đồng du khách</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500 mx-1" />
            <span>Việt Nam & Toàn Cầu</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
