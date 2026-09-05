import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Traveling có hoàn toàn miễn phí để sử dụng không?',
      a: 'Có, gói Khởi Hành hoàn toàn miễn phí trọn đời với đầy đủ tính năng: 20 lượt tìm kiếm AI, 50 lượt dịch thuật mỗi ngày, lập lịch trình cơ bản và theo dõi chi tiêu cá nhân.',
    },
    {
      q: 'Bộ dịch thuật hỗ trợ những ngôn ngữ quốc tế nào?',
      a: 'Hệ thống hỗ trợ hơn 50 ngôn ngữ phổ biến trên toàn cầu bao gồm tiếng Việt, Anh, Nhật Bản, Hàn Quốc, Pháp, Tây Ban Nha, Thái Lan, Trung Quốc và nhiều ngôn ngữ khác.',
    },
    {
      q: 'Tôi có thể sử dụng ứng dụng khi mất kết nối Internet không?',
      a: 'Có, các dữ liệu lịch trình đã lập, địa điểm đã lưu và sổ tay chi tiêu nhóm đều được lưu đệm ngoại tuyến giúp bạn tra cứu mượt mà ngay cả khi ở vùng núi hoặc không có SIM địa phương.',
    },
    {
      q: 'Tính năng tự động điều chỉnh lịch trình theo thời tiết hoạt động thế nào?',
      a: 'Traveling kết nối trực tiếp với cổng dữ liệu OpenWeather. Nếu phát hiện thời tiết xấu (mưa bão, nắng gắt), AI sẽ chủ động đề xuất đổi hoạt động ngoài trời sang bảo tàng, quán cà phê hoặc phòng triển lãm nghệ thuật.',
    },
    {
      q: 'Dữ liệu cá nhân và chi tiêu của tôi có được bảo mật không?',
      a: 'Chúng tôi cam kết bảo vệ quyền riêng tư tuyệt đối: mã hóa toàn bộ dữ liệu người dùng, xác thực doanh nghiệp qua Clerk và tuyệt đối không bao giờ chia sẻ hay bán thông tin cho bên thứ ba.',
    },
  ];

  return (
    <section id="faq" aria-labelledby="faq-heading" className="py-24 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 id="faq-heading" className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
            Câu Hỏi Thường Gặp
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Giải đáp chi tiết về các tính năng, phương thức đăng ký và bảo mật trên nền tảng Traveling.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="glass-card rounded-2xl border border-border-subtle overflow-hidden transition-all"
              >
                <button
                  id={`faq-btn-${idx}`}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${idx}`}
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 text-sm font-bold text-white hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary focus:outline-none"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-primary shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>

                {isOpen && (
                  <div
                    id={`faq-panel-${idx}`}
                    role="region"
                    aria-labelledby={`faq-btn-${idx}`}
                    className="px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-border-subtle/50 pt-3"
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
