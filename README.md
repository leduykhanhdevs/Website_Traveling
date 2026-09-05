# Traveling - Nền Tảng Trải Nghiệm Du Lịch Toàn Cầu

Một website hiện đại, trưởng thành và tối ưu trải nghiệm người dùng dành cho hệ sinh thái **Traveling**. Được xây dựng với kiến trúc hướng chuẩn **CEO**, **AEO (AI Search Engine Optimization)**, **Accessibility (WCAG AA)**, tích hợp hiệu ứng đồ họa 3D tương tác với **Three.js** và chuyển động mượt mà với **GSAP**.

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
- Node.js 18+ trở lên
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
