import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    { q: 'Tôi tạo lịch trình AI trên website như thế nào?', a: 'Chọn điểm đến, phong cách, mức chi tiêu và số ngày rồi nhấn Tạo lịch trình AI. Dịch vụ cần kết nối Internet và nhà cung cấp AI còn khả dụng; nếu không, website sẽ hiển thị lỗi để bạn thử lại.' },
    { q: 'Lịch trên website có tự đồng bộ vào app không?', a: 'Chưa. Lịch hiện được lưu trên thiết bị khi bạn bấm Lưu trên thiết bị. Bạn có thể xuất JSON theo cấu trúc lịch trình của app, nhưng app chưa có luồng nhập và đồng bộ trực tiếp từ website này.' },
    { q: 'Có thể xem lịch khi mất mạng không?', a: 'Bạn có thể tải lịch dưới dạng tệp văn bản để đọc ngoại tuyến. Website cần mạng để tải lần đầu và để tạo lịch mới; hiện chưa có chế độ cài đặt offline toàn bộ website.' },
    { q: 'Chi phí và giờ tham quan có được xác minh không?', a: 'Chi phí là ước tính USD mỗi người, chưa bao gồm vé máy bay và lưu trú. Bạn cần kiểm tra giá, giờ mở cửa và thời tiết trước khi đi; AI chưa sử dụng dữ liệu thời tiết trực tiếp trên website.' },
    { q: 'Dịch thuật và camera OCR trên website hoạt động thế nào?', a: 'Sổ tay có ba câu giao tiếp với bản dịch sang bốn ngôn ngữ và phát âm bằng trình duyệt. Tab OCR là minh họa thực đơn, chưa mở camera hoặc xử lý ảnh của bạn.' },
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
