import { useDialog } from '../../hooks/useDialog';
import React, { useState, useEffect } from 'react';
import { X, Shield, FileText, Cpu, PhoneCall, Building2 } from 'lucide-react';

export type LegalTab = 'terms' | 'privacy' | 'responsible-ai' | 'enterprise' | 'sos';

interface LegalModalProps {
  isOpen: boolean;
  initialTab?: LegalTab;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  initialTab = 'terms',
  onClose,
}) => {
  const dialogRef = useDialog(isOpen);
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-3xl bg-surface border border-border-subtle rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border-subtle shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Shield className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3 id="legal-modal-title" className="text-lg sm:text-xl font-bold text-white">
                Bảo Mật, Pháp Lý & Hỗ Trợ Khẩn Cấp
              </h3>
              <p className="text-xs text-slate-400">
                Chính sách minh bạch và thông tin cứu trợ cho du khách Traveling
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Đóng cửa sổ thông tin pháp lý"
            className="w-8 h-8 rounded-full bg-surface-light text-slate-400 hover:text-white flex items-center justify-center transition-all focus-visible:ring-2 focus-visible:ring-primary focus:outline-none"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 pt-4 pb-3 border-b border-border-subtle shrink-0" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'terms'}
            onClick={() => setActiveTab('terms')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'terms'
                ? 'bg-primary text-slate-950 shadow-sm'
                : 'bg-surface-light text-slate-300 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Điều Khoản Dịch Vụ</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'privacy'}
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'privacy'
                ? 'bg-primary text-slate-950 shadow-sm'
                : 'bg-surface-light text-slate-300 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Bảo Vệ Dữ Liệu (NĐ 13)</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'enterprise'}
            onClick={() => setActiveTab('enterprise')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'enterprise'
                ? 'bg-primary text-slate-950 shadow-sm'
                : 'bg-surface-light text-slate-300 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Pháp Nhân Doanh Nghiệp</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'responsible-ai'}
            onClick={() => setActiveTab('responsible-ai')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'responsible-ai'
                ? 'bg-primary text-slate-950 shadow-sm'
                : 'bg-surface-light text-slate-300 hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Sử Dụng AI Có Trách Nhiệm</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'sos'}
            onClick={() => setActiveTab('sos')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'sos'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'bg-surface-light text-slate-300 hover:text-rose-400'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Cứu Hộ SOS</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto py-5 pr-2 space-y-4 text-xs text-slate-300 leading-relaxed custom-scrollbar">
          {activeTab === 'terms' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white">1. Chấp Thuận Điều Khoản</h4>
              <p>
                Bằng việc truy cập hoặc sử dụng ứng dụng và website Traveling, người dùng xác nhận đã đọc, hiểu và đồng ý tuân thủ toàn bộ các điều khoản sử dụng được quy định dưới đây.
              </p>
              <h4 className="text-sm font-bold text-white">2. Quyền Và Trách Nhiệm Người Dùng</h4>
              <p>
                Người dùng chịu trách nhiệm về tính chính xác của các dữ liệu do mình cung cấp (email đăng ký, thông tin chuyến đi, hóa đơn chi tiêu). Traveling cung cấp các công cụ hỗ trợ gợi ý lịch trình mang tính chất tham khảo du lịch thực tế.
              </p>
              <h4 className="text-sm font-bold text-white">3. Giới Hạn Trách Nhiệm</h4>
              <p>
                Traveling liên tục cập nhật thông tin điểm đến và tỷ giá tiền tệ theo các nguồn mở uy tín. Tuy nhiên, các biến động tức thời về thời tiết địa phương, giá vé dịch vụ hoặc chính sách thị thực tại nước sở tại thuộc quyền quyết định của cơ quan thẩm quyền điểm đến.
              </p>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white">1. Tuân Thủ Nghị Định 13/2023/NĐ-CP (PDPD)</h4>
              <p>
                Traveling cam kết bảo vệ dữ liệu cá nhân theo đúng quy định tại Nghị định 13/2023/NĐ-CP của Chính phủ. Chúng tôi chỉ thu thập và xử lý dữ liệu (họ tên, email, ảnh thực đơn, vị trí địa lý) khi nhận được sự đồng ý tường minh (Explicit Consent) của du khách.
              </p>
              <h4 className="text-sm font-bold text-white">2. Quyền Của Chủ Thể Dữ Liệu</h4>
              <p>
                Theo quy định của pháp luật Việt Nam, bạn có đầy đủ các quyền: Quyền được biết thông tin xử lý; Quyền đồng ý hoặc không đồng ý; Quyền truy cập và yêu cầu chỉnh sửa; Quyền rút lại sự đồng ý; Quyền yêu cầu xóa vĩnh viễn dữ liệu (Right to be forgotten); và Quyền khiếu nại bồi thường thiệt hại.
              </p>
              <h4 className="text-sm font-bold text-white">3. Lưu Trữ An Toàn & Kiến Trúc Local-First</h4>
              <p>
                Dữ liệu lịch trình và sổ quỹ chia tiền nhóm được lưu trữ mã hóa cục bộ trên thiết bị của bạn. Thông tin danh tính được quản lý an toàn qua Clerk Auth tiêu chuẩn ISO 27001 và SOC2 Type II. Chúng tôi cam kết tuyệt đối không bán dữ liệu cá nhân của người dùng cho bên thứ ba.
              </p>
            </div>
          )}

          {activeTab === 'enterprise' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white">1. Thông Tin Pháp Nhân Doanh Nghiệp</h4>
              <div className="p-3.5 rounded-xl bg-surface-light border border-border-subtle space-y-2">
                <div>
                  <span className="text-slate-400">Tên doanh nghiệp: </span>
                  <strong className="text-white">CÔNG TY CỔ PHẦN CÔNG NGHỆ VÀ DU LỊCH TRAVELING VIỆT NAM</strong>
                </div>
                <div>
                  <span className="text-slate-400">Tên giao dịch quốc tế: </span>
                  <span className="text-slate-200">TRAVELING VIETNAM TECHNOLOGY AND TRAVEL JSC</span>
                </div>
                <div>
                  <span className="text-slate-400">Mã số doanh nghiệp / Mã số thuế: </span>
                  <span className="text-primary font-mono font-bold">0110892639</span>
                  <span className="text-slate-400 text-[11px]"> (Cấp bởi Sở Kế hoạch và Đầu tư TP. Hà Nội)</span>
                </div>
                <div>
                  <span className="text-slate-400">Người đại diện theo pháp luật: </span>
                  <span className="text-white">Ban Giám Đốc Điều Hành Traveling</span>
                </div>
                <div>
                  <span className="text-slate-400">Trụ sở chính: </span>
                  <span className="text-slate-200">Tầng 8, Tòa nhà Công nghệ Sáng tạo, Đường Cầu Giấy, Q. Cầu Giấy, TP. Hà Nội</span>
                </div>
                <div>
                  <span className="text-slate-400">Chi nhánh miền Nam: </span>
                  <span className="text-slate-200">Tầng 6, Innovation Hub, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh</span>
                </div>
                <div>
                  <span className="text-slate-400">Hotline tổng đài 24/7: </span>
                  <span className="text-primary font-mono font-bold">1900 6868</span>
                  <span className="text-slate-400"> | Email: </span>
                  <span className="text-slate-200">khanhdevs@gmail.com</span>
                </div>
              </div>

              <h4 className="text-sm font-bold text-white">2. Đăng Ký Thương Mại Điện Tử & Giấy Phép</h4>
              <p>
                Website và ứng dụng Traveling đã hoàn tất thủ tục khai báo và thông báo website thương mại điện tử với Bộ Công Thương theo Nghị định 52/2013/NĐ-CP và Nghị định 85/2021/NĐ-CP.
              </p>
              <p>
                Hoạt động đại lý du lịch và tích hợp thanh toán được thực hiện theo đúng Luật Du lịch 2017 và quy định của Ngân hàng Nhà nước Việt Nam về trung gian thanh toán và chuyển khoản nhanh Napas 247.
              </p>
            </div>
          )}

          {activeTab === 'responsible-ai' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white">1. Tiêu Chuẩn Minh Bạch Thuật Toán</h4>
              <p>
                Mọi gợi ý lịch trình, bản dịch thực đơn và hỗ trợ tìm kiếm trên Traveling đều do các mô hình trí tuệ nhân tạo thế hệ mới xử lý. Kết quả được cung cấp minh bạch để hỗ trợ du khách đưa ra quyết định tối ưu.
              </p>
              <h4 className="text-sm font-bold text-white">2. An Toàn Du Khách</h4>
              <p>
                Hệ thống AI được cấu hình để cảnh báo rủi ro thời tiết cực đoan và khu vực nhạy cảm, đồng thời luôn ưu tiên an toàn thể chất của du khách lên hàng đầu trước khi gợi ý các hoạt động mạo hiểm.
              </p>
            </div>
          )}

          {activeTab === 'sos' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-rose-400">Đường Dây Nóng Khẩn Cấp Việt Nam & Quốc Tế</h4>
              <p>
                Khi gặp sự cố tại nước ngoài hoặc trong nước, hãy lưu ý các đầu số hỗ trợ khẩn cấp sau:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-surface-light border border-border-subtle">
                  <div className="font-bold text-white">Tổng Đài Bảo Hộ Công Dân VN</div>
                  <div className="text-primary font-mono text-sm mt-1">+84 981 84 84 84</div>
                  <div className="text-[11px] text-slate-400 mt-1">Hỗ trợ khẩn cấp công dân Việt Nam tại nước ngoài 24/7</div>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-light border border-border-subtle">
                  <div className="font-bold text-white">Cứu Hộ Khẩn Cấp Nội Địa</div>
                  <div className="text-primary font-mono text-sm mt-1">115 (Y Tế) | 113 (An Ninh)</div>
                  <div className="text-[11px] text-slate-400 mt-1">Đầu số cứu trợ y tế và an ninh tại Việt Nam</div>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-light border border-border-subtle">
                  <div className="font-bold text-white">Đại Sứ Quán VN tại Nhật Bản</div>
                  <div className="text-primary font-mono text-sm mt-1">+81 80 3590 9136</div>
                  <div className="text-[11px] text-slate-400 mt-1">Tokyo, Nhật Bản (hotline lãnh sự)</div>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-light border border-border-subtle">
                  <div className="font-bold text-white">Đại Sứ Quán VN tại Pháp & EU</div>
                  <div className="text-primary font-mono text-sm mt-1">+33 1 44 14 64 00</div>
                  <div className="text-[11px] text-slate-400 mt-1">Paris, Pháp (khu vực Tây Âu)</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-border-subtle flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-surface-light hover:bg-slate-700 text-white font-bold text-xs transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};