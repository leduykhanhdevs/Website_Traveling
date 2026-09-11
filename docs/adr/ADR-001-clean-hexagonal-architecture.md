# ADR-001: Áp Dụng Kiến Trúc Clean & Hexagonal Architecture Cho Lõi Nghiệp Vụ

- **Trạng thái**: Đã chấp thuận (Accepted)
- **Ngày quyết định**: 2026-09
- **Người đề xuất**: Ban Kiến Trúc Công Nghệ Traveling Việt Nam
- **Phạm vi**: Toàn bộ mã nguồn `Web Traveling` (thư mục `src/core/`)

---

## 1. Bối Cảnh (Context)
Ứng dụng Traveling ban đầu được phát triển với mô hình monolithic đơn giản, trong đó các thành phần React UI gọi trực tiếp API hoặc các hàm xử lý dữ liệu phức tạp. Khi hệ thống mở rộng:
- Việc phụ thuộc trực tiếp vào các dịch vụ AI bên ngoài (OpenAI, Cloudflare Workers AI) khiến ứng dụng dễ bị gián đoạn khi nhà cung cấp bị sự cố hoặc nghẽn mạng (rate limit).
- Kiểm thử đơn vị (Unit Test) gặp khó khăn do nghiệp vụ tính toán chi phí nhóm, chia nợ và lập lịch trình bị trộn lẫn với giao diện React.
- Đội ngũ kỹ sư mới gặp khó khăn trong việc mở rộng tính năng mà không gây ra tác dụng phụ (side-effects).

---

## 2. Quyết Định Kiến Trúc (Decision)
Chúng tôi quyết định tái cấu trúc toàn bộ mã nguồn nghiệp vụ của dự án Traveling sang mô hình **Kiến trúc Lục giác (Hexagonal Architecture / Ports and Adapters)** kết hợp với nguyên lý **Clean Architecture**:

1. **Tầng Domain (`src/core/domain`)**:
   - Chứa các thực thể cốt lõi (`TravelPlan`, `FoodItem`, `ExpenseRecord`) và lỗi nghiệp vụ thuần túy (`DomainValidationError`).
   - Hoàn toàn độc lập với các thư viện bên ngoài (Zero external dependencies, pure TypeScript).
2. **Tầng Application (`src/core/application`)**:
   - Định nghĩa các Ports (cổng giao tiếp dạng Interface): `ItineraryAiPort`, `VisionAiPort`, `TranslationAiPort`, `NotificationPort`.
   - Cung cấp các Use Cases thuần túy: `PlanItineraryUseCase`, `RecognizeFoodUseCase`, `TranslatePhraseUseCase`, `SimplifyDebtsUseCase`.
   - Hiện thực hóa cơ chế **Fallback Chain Pattern**: Nếu một nhà cung cấp AI gặp sự cố hoặc cạn hạn mức, hệ thống tự động chuyển tiếp sang nhà cung cấp kế tiếp một cách minh bạch.
3. **Tầng Infrastructure (`src/core/infrastructure`)**:
   - Hiện thực hóa các Ports thông qua các Adapters ngoại vi: OpenAI SDK, Cloudflare Workers AI binding, Resend Email SDK, và Smart Fallback Rules.
4. **Tầng Interfaces / Controllers (`worker/index.ts` và `src/hooks`)**:
   - Đóng vai trò làm Dependency Injection container và chuyển đổi tín hiệu HTTP/UI thành lệnh gọi Use Case.

---

## 3. Hệ Quả & Lợi Ích (Consequences)

### Lợi ích:
- **Khả năng kiểm thử tối đa (100% Testability)**: Có thể viết Unit Test cho toàn bộ nghiệp vụ lõi chỉ bằng In-Memory Fakes hoặc Mock Ports trong vài mili-giây mà không cần mở kết nối mạng thật.
- **Tính sẵn sàng cao (High Availability)**: Tự động dự phòng lỗi giữa các nhà cung cấp AI, du khách không bao giờ gặp màn hình trắng hoặc sập dịch vụ.
- **Khả năng mở rộng bền vững**: Bất kỳ kỹ sư nào cũng có thể cắm thêm nhà cung cấp AI mới hoặc cổng thanh toán mới mà không sợ làm hỏng logic cũ.

### Thách thức cần lưu ý:
- Số lượng file và interface tăng lên (yêu cầu lập trình viên mới đọc kỹ sổ tay `docs/ONBOARDING.md`).
- Cần duy trì kỷ luật không để mã UI React hoặc thư viện mạng lọt vào tầng Domain.
