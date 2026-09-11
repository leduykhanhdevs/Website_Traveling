# ADR-003: Tuân Thủ Khung Pháp Lý Thương Mại Điện Tử & Bảo Vệ Dữ Liệu Cá Nhân Việt Nam

- **Trạng thái**: Đã chấp thuận (Accepted)
- **Ngày quyết định**: 2026-09
- **Người đề xuất**: Ban Pháp Chế & Tuân Thủ Traveling Việt Nam
- **Phạm vi**: Toàn bộ hệ thống giao diện công khai, API và cơ chế lưu trữ dữ liệu du khách

---

## 1. Bối Cảnh (Context)
Tại Việt Nam, các nền tảng công nghệ số và ứng dụng du lịch phải tuân thủ nghiêm ngặt hai đạo luật trọng yếu:
1. **Nghị định 52/2013/NĐ-CP và Nghị định 85/2021/NĐ-CP**: Quy định về quản lý hoạt động thương mại điện tử, bảo đảm tính xác thực của thương nhân và quyền lợi của người tiêu dùng trực tuyến.
2. **Nghị định 13/2023/NĐ-CP (PDPD)**: Quy định về bảo vệ dữ liệu cá nhân, áp dụng cho mọi tổ chức xử lý dữ liệu của công dân Việt Nam.

Việc không tuân thủ có thể dẫn đến việc bị xử phạt hành chính từ vài chục triệu đến hàng tỷ đồng, bị thu hồi tên miền, hoặc đình chỉ hoạt động nền tảng tại Việt Nam.

---

## 2. Quyết Định Kiến Trúc (Decision)
Traveling thiết lập bộ giải pháp tuân thủ kỹ thuật và giao diện trực tiếp vào nền tảng:

1. **Hiển Thị Thông Tin Pháp Nhân Toàn Diện Tại Footer**:
   - Công khai đầy đủ tên công ty pháp nhân (`CÔNG TY CỔ PHẦN CÔNG NGHỆ VÀ DU LỊCH TRAVELING VIỆT NAM`), Mã số doanh nghiệp / Mã số thuế, người đại diện theo pháp luật, địa chỉ trụ sở và số hotline tổng đài 24/7.
   - Gắn huy hiệu "Đã Thông Báo Bộ Công Thương" đạt chuẩn quy cách của Cổng thông tin Quản lý Hoạt động TMĐT Việt Nam.
2. **Cơ Chế Bảo Vệ Dữ Liệu Cá Nhân (Decree 13 PDPD)**:
   - **Xác thực và phân quyền dữ liệu**: Dữ liệu định danh được bảo mật qua lớp xác thực Clerk Auth; lịch trình du lịch cá nhân được ưu tiên lưu trữ cục bộ (Local-First Storage) trên thiết bị của du khách.
   - **Quyền của chủ thể dữ liệu**: Giao diện và API cung cấp tùy chọn rõ ràng cho phép du khách:
     - Xem toàn bộ dữ liệu đang lưu trữ.
     - Rút lại sự đồng ý thu thập dữ liệu bất kỳ lúc nào.
     - Xóa vĩnh viễn dữ liệu tài khoản và lịch sử chuyến đi khỏi hệ thống.
3. **Minh Bạch Trong Thuật Toán Trí Tuệ Nhân Tạo (Responsible AI Transparency)**:
   - Mọi kết quả do AI gợi ý (lịch trình, bản dịch món ăn) đều có thông báo rõ ràng là dữ liệu gợi ý hỗ trợ, không thay thế cho quyết định y tế hoặc cảnh báo an toàn chính thức từ nhà chức trách.
   - Cung cấp danh bạ cứu hộ SOS khẩn cấp kết nối với Cục Lãnh sự - Bộ Ngoại giao Việt Nam (`+84 981 84 84 84`).

---

## 3. Hệ Quả & Lợi Ích (Consequences)

### Lợi ích:
- **An toàn pháp lý 100%**: Nền tảng đủ điều kiện nộp hồ sơ thẩm duyệt tại Bộ Công Thương và cơ quan chức năng.
- **Tạo dựng niềm tin bền vững với du khách**: Du khách an tâm khi biết rõ danh tính doanh nghiệp đứng sau nền tảng và thông tin cá nhân của mình được bảo vệ theo pháp luật.
- **Sẵn sàng hợp tác với các tập đoàn lữ hành & khách sạn lớn**: Các đối tác lớn luôn yêu cầu hồ sơ pháp nhân và tiêu chuẩn bảo vệ dữ liệu chặt chẽ trước khi ký kết hợp đồng.
