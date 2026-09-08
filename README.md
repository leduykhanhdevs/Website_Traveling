# Traveling - Nền Tảng Trải Nghiệm Du Lịch Toàn Cầu

Một website hiện đại, trưởng thành và tối ưu trải nghiệm người dùng dành cho hệ sinh thái **Traveling**. Được xây dựng với kiến trúc hướng chuẩn **SEO**, **AEO (AI Search Engine Optimization)**, **Accessibility (WCAG AA)**, tích hợp hiệu ứng đồ họa 3D tương tác với **Three.js** và chuyển động mượt mà với **GSAP**.

- **Trang web chính thức**: [https://travelingvn.vercel.app](https://travelingvn.vercel.app)
- **Tác giả & Liên hệ**: Lê Duy Khánh (`khanhdevs@gmail.com`)

---

## Tính Năng Nổi Bật

### 1. Quả Cầu Trái Đất 3D Thực Thụ (Photorealistic 3D Earth)
- Dựng hình hành tinh với kết cấu vệ tinh chất lượng cao (bản đồ địa hình ban ngày, tầng mây chuyển động độc lập và ánh sáng đô thị ban đêm).
- Tích hợp chuẩn Web Geolocation API định vị chính xác vị trí người dùng trên bề mặt Trái Đất bằng cột tín hiệu quang học và sóng radar phát quang.
- Điều khiển Zoom tương tác bằng chuột, cảm ứng và các nút HUD trong giới hạn an toàn.

### 2. Mô Hình 3D Header Celestial Astrolabe
- La bàn thiên thể đa chiều tại khu vực Hero tượng trưng cho khả năng định vị hành trình thông minh.
- Phản hồi thị sai theo tọa độ con trỏ chuột và xoay tự do với quán tính vật lý mượt mà.

### 3. Khám Phá 18 Điểm Đến Danh Tiếng Thế Giới
- Bộ sưu tập 18 tọa độ du lịch hàng đầu trải dài khắp Đông Nam Á, Đông Á và Châu Âu (Hà Nội, TP.HCM, Đà Nẵng, Hội An, Sa Pa, Phú Quốc, Tokyo, Kyoto, Hồng Kông, Seoul, Paris, Rome, Luân Đôn, Barcelona, Amsterdam...).
- Băng chuyền Carousel xoay vòng vô tận (Infinite Loop) với tiến trình `01 / 18` và bộ lọc vùng miền tinh gọn không con lăn.

### 4. Công Cụ Chia Tiền Du Lịch Nhóm Đa Ngoại Tệ
- Hỗ trợ hạn mức chi phí lên tới 500.000.000 đ với các mốc phím tắt nhanh.
- Cho phép tùy chọn quy mô đoàn tự do từ 1 đến 200+ thành viên bằng bộ nút tăng giảm và ô nhập trực tiếp.
- Quy đổi tỷ giá hối đoái trực tuyến thời gian thực cho 10 loại tiền tệ quốc tế (VND, USD, EUR, JPY, KRW, SGD, THB, GBP, AUD, CAD) qua API quốc tế.

### 5. Hệ Thống Dropdown Dark Luxury Đồng Bộ
- Toàn bộ menu xổ ra trên website được thay thế bằng thành phần `CustomSelect` kính mờ cao cấp với hiệu ứng ánh sáng viền và mũi tên Chevron xoay lật 180 độ.

---

## Công Nghệ Sử Dụng

- **Frontend Core**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Lucide Icons, Glassmorphism Design System
- **3D Graphics**: Three.js (WebGL, PBR Materials, Custom Shaders, Texture Mapping)
- **Animation Engine**: GSAP (GreenSock), ScrollTrigger
- **Standards**: WCAG AA Accessible, Semantic HTML5, Schema.org JSON-LD (WebSite, SoftwareApplication, FAQPage, BreadcrumbList)

---

## Hướng Dẫn Cài Đặt & Chạy Cục Bộ

### Yêu Cầu Hệ Thống
- Node.js 22.12+ trở lên
- npm hoặc pnpm / yarn

### Các Bước Thực Hiện

1. **Cài đặt thư viện**:
   ```bash
   npm install
   ```

2. **Khởi chạy môi trường phát triển**:
   ```bash
   npm run dev
   ```
   Truy cập vào `http://localhost:5173/` trên trình duyệt.

3. **Đóng gói sản phẩm (Production Build)**:
   ```bash
   npm run build
   ```

4. **Xem trước bản đóng gói (Preview)**:
   ```bash
   npm run preview
   ```


## Cập nhật kiểm thử 08/09/2026

- `npm run dev`: website và hai API chạy cùng cổng 5173. Chỉ bind localhost mặc định.
- `npm run typecheck`: kiểm tra cả frontend và API server.
- `npm test`: kiểm tra request, lịch trùng giờ/tổng tiền và HTTP thành công/thất bại bằng provider giả lập trong test; không gửi email thật.
- `npm run build`: kiểm tra kiểu, bundle và prerender nội dung React vào HTML cho crawler. `npm run preview` chỉ phục vụ static build, không chạy API Vercel.
- Sao chép `.env.example` thành `.env.local`, cấu hình khóa ở server. Không dùng `VITE_` cho khóa bí mật. Đã đọc cấu trúc lịch trình của app tại `D:/DuAn/Traveling/packages/shared/src/types/itinerary.ts`; số tiền trong contract là USD.
- Website hỗ trợ tạo lịch 1–7 ngày, lưu một lịch gần nhất trên thiết bị, xuất TXT/JSON và mở tìm kiếm bản đồ. JSON cùng cấu trúc app không đồng nghĩa app đã có tính năng nhập; chưa đồng bộ tài khoản.
- API `/api/itinerary` gọi OpenAI, hoặc endpoint tương thích khi `AI_PROVIDER=local`. Không có fallback giả thành công. Chưa xác minh địa điểm qua Places hoặc thời tiết trực tiếp.
- Khi triển khai trên Vercel, đặt lại các biến môi trường **server** của `.env.example` trong dự án Vercel. `.env.local` không được gửi lên Git.
- Email cần `RESEND_API_KEY` và `RESEND_FROM` thuộc domain đã xác minh. Endpoint chỉ xác nhận nhà cung cấp đã tiếp nhận thư, chưa có danh sách waitlist lưu bền vững.
- Giới hạn 5 lượt tạo lịch / giờ và 3 email / giờ là **theo instance**; trước khi mở API công khai quy mô lớn, cấu hình Vercel Firewall/distributed limiter, chống bot và ngân sách nhà cung cấp. Không coi limiter in-memory là giới hạn chi phí toàn hệ thống.
- Kiểm tra AI thực tế ngày 08/09/2026: OpenAI trả 429 `credit_balance_exhausted`. Người dùng chọn giữ OpenAI và bổ sung số dư sau. Chưa xác nhận tạo lịch thật thành công.

Xem `AUDIT_REPORT.md` để biết phạm vi, kết quả kiểm thử và hướng phát triển.
