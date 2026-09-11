# ADR-002: Triển Khai Hạ Tầng Máy Chủ Phân Tán Edge (Cloudflare Workers & Static Assets)

- **Trạng thái**: Đã chấp thuận (Accepted)
- **Ngày quyết định**: 2026-09
- **Người đề xuất**: Đội ngũ Vận hành Hạ tầng & SRE Traveling
- **Phạm vi**: Kiến trúc phân phối toàn cầu và API Gateway

---

## 1. Bối Cảnh (Context)
Ứng dụng du lịch Traveling phục vụ du khách cả khi ở Việt Nam lẫn khi đi du lịch nước ngoài (Nhật Bản, Hàn Quốc, Pháp, Mỹ, Đông Nam Á). Việc sử dụng máy chủ tập trung (Centralized Origin Server tại một vị trí địa lý duy nhất) dẫn đến:
- Độ trễ kết nối (RTT) cao đối với du khách đang ở nước ngoài khi cần tra cứu thực đơn hoặc dịch thuật khẩn cấp.
- Chi phí duy trì hạ tầng máy chủ ảo (VPS) cao khi lưu lượng truy cập biến động theo mùa du lịch cao điểm.
- Nguy cơ tắc nghẽn hoặc tấn công DDoS từ chối dịch vụ.

---

## 2. Quyết Định Kiến Trúc (Decision)
Traveling chuyển dịch toàn bộ kiến trúc phân phối sang **Hạ tầng phân tán biên (Global Edge Network) trên Cloudflare Workers**:

1. **Phân Phối Tệp Tĩnh (Static Assets Hosting)**:
   - Giao diện Single Page Application (SPA) của Vite/React được biên dịch trước và phân phối trực tiếp từ mạng lưới hơn 300 trung tâm dữ liệu toàn cầu của Cloudflare qua cấu hình `[assets] directory = "./dist"`.
   - Bật nén Brotli/Gzip và bộ nhớ đệm HTTP Caching tối ưu, giảm thời gian tải trang ban đầu xuống dưới 300ms ở mọi châu lục.
2. **API Gateway Biên (Edge API Gateway)**:
   - File `worker/index.ts` đóng vai trò là API Gateway nhẹ, phản hồi các route `/api/itinerary`, `/api/translate`, `/api/ocr`, `/api/subscribe` và `/api/health`.
   - Tích hợp trực tiếp với **Cloudflare Workers AI** tại rìa mạng, giảm thiểu tối đa quãng đường truyền tải gói tin.
3. **Tiêu Chuẩn Lỗi RFC 7807 (Problem Details)**:
   - Mọi lỗi xử lý API Gateway trả về định dạng chuẩn `application/problem+json`, giúp ứng dụng di động và trình duyệt nhận diện chính xác nguyên nhân lỗi.

---

## 3. Hệ Quả & Lợi Ích (Consequences)

### Lợi ích:
- **Tốc độ phản hồi cực nhanh**: Thời gian khởi động máy chủ (Cold start) xấp xỉ 0ms, thời gian định tuyến biên dưới 15ms.
- **Tiết kiệm chi phí**: Miễn phí băng thông truyền tải dữ liệu tĩnh và chỉ trả tiền theo số lượng request thực tế của du khách.
- **Bảo mật & Chống DDoS tích hợp sẵn**: Hệ thống được bảo vệ tự động bởi lớp lá chắn Cloudflare Edge Shield.

### Thách thức cần lưu ý:
- Runtime của Edge Worker dựa trên Web Standards (V8 engine), không hỗ trợ các thư viện Node.js nguyên bản cần hệ thống file cục bộ (như `fs`). Mã nguồn backend phải luôn tuân thủ chuẩn Web Fetch API.
