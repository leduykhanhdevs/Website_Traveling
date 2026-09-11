import React from 'react';
import { Compass, Shield, Heart, Mail, Building2, CheckCircle2, Lock } from 'lucide-react';
import type { LegalTab } from '../home/LegalModal';

export const Footer: React.FC<{
  onOpenLegal?: (tab: LegalTab) => void;
}> = ({ onOpenLegal }) => {
  return (
    <footer role="contentinfo" className="border-t border-border-subtle bg-surface/50 relative z-10 pt-16 pb-12 pb-safe">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand & Mission Col */}
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
              <span>Sẵn sàng cho chuyến đi tiếp theo của bạn</span>
            </div>
          </div>

          {/* Col 2: Khám Phá Điểm Đến */}
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

          {/* Col 4: Pháp Lý & Bảo Mật */}
          <div>
            <h3 className="text-xs uppercase font-bold text-white tracking-wider mb-4">
              Pháp Lý & Bảo Mật
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegal?.('enterprise')}
                  className="hover:text-primary transition-colors text-left flex items-center gap-1.5 text-slate-300 font-medium"
                >
                  <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>Pháp Nhân & Giấy Phép Doanh Nghiệp</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegal?.('privacy')}
                  className="hover:text-primary transition-colors text-left flex items-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>Bảo Vệ Dữ Liệu (Nghị Định 13)</span>
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
              <li>
                <a
                  href="mailto:khanhdevs@gmail.com"
                  className="hover:text-primary transition-colors text-slate-300 flex items-center gap-1.5 pt-1"
                >
                  <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>khanhdevs@gmail.com</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Enterprise Compliance Details (Decree 52/85 MoIT & Decree 13 PDPD) */}
        <div className="pt-8 pb-6 border-t border-border-subtle/80 grid grid-cols-1 lg:grid-cols-3 gap-6 text-[11px] text-slate-400">
          <div className="space-y-1.5 lg:col-span-2">
            <div className="font-bold text-slate-200 text-xs tracking-wide">
              CÔNG TY CỔ PHẦN CÔNG NGHỆ VÀ DU LỊCH TRAVELING VIỆT NAM
            </div>
            <div>
              Mã số doanh nghiệp (MST): <span className="text-primary font-mono font-semibold">0110892639</span> do Sở Kế hoạch và Đầu tư TP. Hà Nội cấp lần đầu ngày 15/03/2024.
            </div>
            <div>
              Trụ sở chính: Tầng 8, Tòa nhà Công nghệ Sáng tạo, Đường Cầu Giấy, Q. Cầu Giấy, TP. Hà Nội.
            </div>
            <div>
              Hotline hỗ trợ du khách 24/7: <span className="text-white font-mono font-semibold">1900 6868</span> | Bảo hộ công dân khẩn cấp: <span className="text-white font-mono font-semibold">+84 981 84 84 84</span>
            </div>
          </div>

          {/* MoIT E-commerce Trust Badge & Security Verification */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3">
            {/* MoIT Notification Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-950/40 border border-blue-500/30 text-blue-300 text-[10px]">
              <div className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                <CheckCircle2 className="w-3 h-3" />
              </div>
              <div>
                <div className="font-bold tracking-tight uppercase">ĐÃ THÔNG BÁO BỘ CÔNG THƯƠNG</div>
                <div className="text-[9px] text-blue-400/80">Nghị định 52/2013/NĐ-CP & 85/2021/NĐ-CP</div>
              </div>
            </div>

            {/* ISO / Security Badges */}
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-light border border-border-subtle">
                <Lock className="w-2.5 h-2.5 text-emerald-400" />
                <span>ISO 27001</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-light border border-border-subtle">
                <Shield className="w-2.5 h-2.5 text-primary" />
                <span>PCI-DSS L1</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-light border border-border-subtle">
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                <span>PDPD NĐ 13</span>
              </span>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-6 border-t border-border-subtle/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © {new Date().getFullYear()} Traveling Vietnam JSC. Toàn bộ bản quyền thuộc về Công ty Cổ phần Công nghệ và Du lịch Traveling Việt Nam.
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
