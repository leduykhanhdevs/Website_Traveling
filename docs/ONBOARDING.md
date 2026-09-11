# Sổ Tay Kỹ Sư Phát Triển & Hướng Dẫn Hội Nhập (Developer Onboarding)

> Chào mừng bạn gia nhập đội ngũ Kỹ thuật & AI của **Traveling Việt Nam**!  
> Tài liệu này được thiết kế để bạn có thể thiết lập môi trường, nắm vững kiến trúc mã nguồn và bắt đầu đóng góp dòng code đầu tiên một cách tự tin ngay trong **Ngày đầu tiên (Day-1 Ready)**.

---

## Mục Lục
1. [Triết Lý Kỹ Thuật Cốt Lõi](#1-triết-lý-kỹ-thuật-cốt-lõi)
2. [Bản Đồ Kiến Trúc Hệ Thống (Clean & Hexagonal Architecture)](#2-bản-đồ-kiến-trúc-hệ-thống-clean--hexagonal-architecture)
3. [Cài Đặt Môi Trường Trong 15 Phút (Day-1 Setup)](#3-cài-đặt-môi-trường-trong-15-phút-day-1-setup)
4. [Cấu Trúc Thư Mục Chuẩn](#4-cấu-trúc-thư-mục-chuẩn)
5. [Hướng Dẫn Thực Hành Nhanh (Step-by-Step How-To Guides)](#5-hướng-dẫn-thực-hành-nhanh-step-by-step-how-to-guides)
   - [How-To 1: Thêm một Use Case Nghiệp Vụ Mới](#how-to-1-thêm-một-use-case-nghiệp-vụ-mới)
   - [How-To 2: Cắm Thêm Một Nhà Cung Cấp AI Mới (Provider Adapter)](#how-to-2-cắm-thêm-một-nhà-cung-cấp-ai-mới-provider-adapter)
   - [How-To 3: Viết Unit Test Theo Mô Hình AAA](#how-to-3-viết-unit-test-theo-mô-hình-aaa)
6. [Quy Chuẩn Viết Code & Kiểm Soát Chất Lượng (Quality Gates)](#6-quy-chuẩn-viết-code--kiểm-soát-chất-lượng-quality-gates)
7. [Quy Trình Git, Commit & Code Review](#7-quy-trình-git-commit--code-review)

---

## 1. Triết Lý Kỹ Thuật Cốt Lõi

Tại Traveling, chúng tôi theo đuổi 4 nguyên tắc kỹ thuật bất biến:

1. **Độc Lập Nghiệp Vụ (Business Logic Independence)**:
   Mọi quy tắc tính toán chi phí, phân bổ nợ, kiểm tra lịch trình, chuẩn hóa món ăn nằm hoàn toàn trong tầng `core/domain` và `core/application`. Chúng **không được phụ thuộc** vào React, Cloudflare Worker, Prisma hay bất kỳ thư viện bên ngoài nào.
2. **Khả Năng Thay Thế Linh Hoạt (Swappable Infrastructure)**:
   Nếu ngày mai OpenAI ngừng dịch vụ hoặc tăng giá, hệ thống sẽ tự động chuyển sang Cloudflare Workers AI, DeepSeek hoặc Smart Fallback mà **không cần sửa đổi một dòng code nghiệp vụ nào**.
3. **Kỷ Luật TypeScript Không 'any' (Zero-Any Discipline)**:
   Mọi dữ liệu vào ra tại ranh giới hệ thống đều phải được kiểm định chặt chẽ bằng Zod Schemas hoặc TypeScript Strict Types.
4. **Không Dùng Gạch Ngang Dài**:
   Toàn bộ mã nguồn, ghi chú commit và tài liệu quy chuẩn không sử dụng ký tự gạch ngang dài (em-dash), luôn sử dụng dấu gạch nối (`-`) hoặc dấu hai chấm (`:`).

---

## 2. Bản Đồ Kiến Trúc Hệ Thống (Clean & Hexagonal Architecture)

Dự án tuân thủ nghiêm ngặt mô hình Kiến trúc Lục giác (Ports and Adapters). Mũi tên phụ thuộc luôn trỏ **vào phía trong**:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. INTERFACES & INFRASTRUCTURE (Bên ngoài)                                   │
│    ├── React UI Components (src/components)                                 │
│    ├── Presenter Hooks (src/hooks/useFoodScanner.ts, useTravelTranslator.ts)│
│    ├── Cloudflare Worker Gateway (worker/index.ts)                          │
│    └── External SDKs: OpenAI, Cloudflare Workers AI, Resend Email           │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ calls / implements
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 2. APPLICATION LAYER (src/core/application)                                 │
│    ├── Ports (Interfaces):                                                  │
│    │   ├── ItineraryAiPort, VisionAiPort, TranslationAiPort                 │
│    │   └── NotificationPort                                                 │
│    └── Use Cases (Pure Application Orchestration):                          │
│        ├── PlanItineraryUseCase                                             │
│        ├── RecognizeFoodUseCase                                             │
│        ├── TranslatePhraseUseCase                                           │
│        └── SimplifyDebtsUseCase                                             │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ uses & enforces rules
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 3. DOMAIN CORE (src/core/domain) - Pure TypeScript, Zero External Libs      │
│    ├── Entities: TravelPlan, DaySchedule, ActivitySlot                      │
│    ├── Value Objects: ExpenseRecord, FoodDish, TranslationResult            │
│    └── Business Errors: DomainValidationError, ResourceNotFoundError        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Cài Đặt Môi Trường Trong 15 Phút (Day-1 Setup)

### Bước 1: Yêu cầu môi trường
- **Node.js**: Phiên bản `>= 20.0.0` (Khuyến nghị LTS Node 20 hoặc 22).
- **Trình quản lý gói**: `npm` đi kèm Node.js.
- **Git**: Đã cấu hình email và họ tên công ty.

### Bước 2: Clone & Cài đặt dependencies
```bash
# Clone kho lưu trữ Web Traveling
git clone <repo-url> "Web Traveling"
cd "Web Traveling"

# Cài đặt toàn bộ thư viện cần thiết
npm install
```

### Bước 3: Cấu hình biến môi trường
Tạo file `.env.local` ở thư mục gốc (tham khảo từ `.env.example`):
```bash
# Biến cấu hình giao diện công khai
VITE_APP_NAME="Traveling"
VITE_API_BASE_URL="http://localhost:8787"

# Khóa bí mật máy chủ (chỉ dùng cho Worker / API)
OPENAI_API_KEY="sk-..."
RESEND_API_KEY="re_..."
RESEND_FROM="Traveling <support@traveling.vn>"
```

### Bước 4: Kiểm tra tính sẵn sàng của mã nguồn
Chạy 3 lệnh kiểm tra tiêu chuẩn trước khi bắt đầu làm việc:
```bash
# 1. Kiểm tra tĩnh kiểu dữ liệu TypeScript
npm run typecheck

# 2. Chạy toàn bộ bộ test tự động
npm run test

# 3. Khởi động môi trường phát triển cục bộ
npm run dev
```
Trang web sẽ chạy tại địa chỉ `http://localhost:5173`. Nếu cả 3 bước đều thành công, bạn đã hoàn tất 100% việc chuẩn bị môi trường.

---

## 4. Cấu Trúc Thư Mục Chuẩn

```text
Web Traveling/
├── api/                    # Vercel Serverless Function fallback (Legacy)
├── docs/                   # Tài liệu doanh nghiệp & kiến trúc
│   ├── ENTERPRISE_BLUEPRINT.md # Cẩm nang vận hành doanh nghiệp Việt Nam
│   ├── ONBOARDING.md           # Sổ tay lập trình viên (tài liệu này)
│   └── adr/                    # Architecture Decision Records
│       ├── ADR-001-clean-hexagonal-architecture.md
│       ├── ADR-002-edge-serverless-deployment.md
│       └── ADR-003-vietnam-enterprise-compliance.md
├── shared/                 # DTOs và Zod Schemas dùng chung giữa FE và BE
│   ├── itinerary.ts
│   └── types.ts
├── src/
│   ├── components/         # React UI Components (Presentation Layer)
│   │   ├── home/           # Hero, Features, Simulator, LegalModal
│   │   ├── layout/         # Header, Footer, Navbar
│   │   └── ui/             # Reusable UI Atoms (Button, Card, Input)
│   ├── core/               # TRÁI TIM NGHIỆP VỤ DOANH NGHIỆP (Hexagonal)
│   │   ├── domain/         # Thực thể nghiệp vụ, lỗi thuần túy
│   │   │   ├── entities/   # TravelPlan, FoodRecognition, DebtSettlement
│   │   │   └── errors/     # DomainError, ValidationError
│   │   ├── application/    # Luồng nghiệp vụ
│   │   │   ├── ports/      # Cổng giao tiếp (Interfaces)
│   │   │   └── use-cases/  # Kịch bản sử dụng (Use Cases)
│   │   └── infrastructure/ # Bộ chuyển đổi công nghệ ngoại vi (Adapters)
│   │       ├── ai/         # OpenAI, Cloudflare Workers AI, Smart Adapters
│   │       └── notification/ # Resend Email Adapter
│   ├── hooks/              # Custom React Hooks & Presenters
│   └── lib/                # Utilities tiện ích giao diện
├── tests/                  # Bộ kiểm thử đơn vị & tích hợp tự động
│   ├── api.test.ts         # Kiểm thử API Endpoints & Zod Validation
│   ├── planner-ui.test.ts  # Kiểm thử tương tác giao diện lập lịch
│   └── use-cases.test.ts   # Kiểm thử Use Cases nghiệp vụ Clean Architecture
└── worker/                 # Cloudflare Worker API Gateway (Edge Serverless)
    └── index.ts            # Dependency Injection Container & Router
```

---

## 5. Hướng Dẫn Thực Hành Nhanh (Step-by-Step How-To Guides)

### How-To 1: Thêm một Use Case Nghiệp Vụ Mới
Giả sử bạn cần xây dựng tính năng mới: **Tính toán chỉ số an toàn của điểm đến (CheckDestinationSafetyUseCase)**.

**Bước 1**: Khai báo Port tại `src/core/application/ports/safety-data.port.ts`:
```typescript
export interface SafetyScore {
  score: number; // 0 - 100
  level: 'safe' | 'caution' | 'warning';
  advisories: string[];
}

export interface SafetyDataPort {
  getDestinationSafety(city: string): Promise<SafetyScore>;
}
```

**Bước 2**: Viết Use Case tại `src/core/application/use-cases/check-destination-safety.use-case.ts`:
```typescript
import type { SafetyDataPort, SafetyScore } from '../ports/safety-data.port';

export class CheckDestinationSafetyUseCase {
  constructor(private readonly safetyProvider: SafetyDataPort) {}

  async execute(city: string): Promise<SafetyScore> {
    const normalizedCity = city.trim();
    if (normalizedCity.length < 2) {
      throw new Error('Tên thành phố không hợp lệ.');
    }
    return await this.safetyProvider.getDestinationSafety(normalizedCity);
  }
}
```

**Bước 3**: Viết Unit Test cho Use Case trong `tests/use-cases.test.ts`.

---

### How-To 2: Cắm Thêm Một Nhà Cung Cấp AI Mới (Provider Adapter)
Giả sử công ty muốn tích hợp thêm mô hình **DeepSeek AI** để tạo lịch trình:

**Bước 1**: Tạo Adapter tại `src/core/infrastructure/ai/deepseek-itinerary.adapter.ts`:
```typescript
import type { ItineraryAiPort } from '../../application/ports/itinerary-ai.port';
import type { TravelPlanInput, TravelPlan } from '../../domain/entities/travel-plan.entity';

export class DeepSeekItineraryAdapter implements ItineraryAiPort {
  readonly providerName = 'deepseek-v3';

  constructor(private readonly apiKey: string) {}

  async isAvailable(): Promise<boolean> {
    return Boolean(this.apiKey && this.apiKey.startsWith('sk-'));
  }

  async generate(input: TravelPlanInput): Promise<TravelPlan> {
    // Gọi DeepSeek API qua fetch chuẩn
    // Trả về TravelPlan đúng cấu trúc Domain
  }
}
```

**Bước 2**: Đăng ký Adapter vào chuỗi Fallback Chain tại `worker/index.ts`:
```typescript
const providers = [
  new DeepSeekItineraryAdapter(env.DEEPSEEK_API_KEY || ''),
  new OpenAiItineraryAdapter(env.OPENAI_API_KEY || ''),
  new CloudflareItineraryAdapter(env.AI),
  new SmartItineraryAdapter(), // Fallback an toàn cuối cùng
];
const useCase = new PlanItineraryUseCase(providers);
```
> **Điểm mấu chốt**: Bạn vừa tích hợp một nhà cung cấp AI mới 100% mà không hề phải sửa đổi bất kỳ dòng code giao diện hay logic nghiệp vụ nào!

---

### How-To 3: Viết Unit Test Theo Mô Hình AAA
Mọi file test trong `tests/` phải tuân theo cấu trúc **Arrange - Act - Assert (AAA)**:

```typescript
test('CheckDestinationSafetyUseCase: rejects empty city name', async () => {
  // Arrange (Chuẩn bị dữ liệu và mock)
  const mockPort: SafetyDataPort = {
    async getDestinationSafety() {
      return { score: 95, level: 'safe', advisories: [] };
    },
  };
  const useCase = new CheckDestinationSafetyUseCase(mockPort);

  // Act & Assert (Hành động và xác minh kết quả)
  await assert.rejects(
    () => useCase.execute(''),
    /Tên thành phố không hợp lệ/
  );
});
```

---

## 6. Quy Chuẩn Viết Code & Kiểm Soát Chất Lượng (Quality Gates)

Trước khi gửi Pull Request (PR), hãy bảo đảm mã nguồn của bạn vượt qua 4 tiêu chuẩn sau:

1. **Chuẩn Lỗi RFC 7807 (Problem Details)**:
   Mọi phản hồi lỗi từ API máy chủ phải trả về kiểu nội dung `application/problem+json`:
   ```json
   {
     "type": "about:blank",
     "title": "Bad Request",
     "status": 400,
     "detail": "Số ngày lịch trình phải từ 1 đến 7 ngày."
   }
   ```
2. **Kích Thước Hàm & Độ Phức Tạp (Cyclomatic Complexity)**:
   - Mỗi hàm không quá 40 dòng lệnh.
   - Không lồng `if/else` quá 3 tầng sâu. Sử dụng `guard clause` và `early return`.
3. **Quản Lý Trạng Thái UI**:
   - Trạng thái máy chủ (Server State) tách biệt với trạng thái giao diện cục bộ (Local UI State).
   - Sử dụng Custom Presenter Hooks (ví dụ: `useFoodScanner`, `useTravelTranslator`) để tách biệt hoàn toàn logic UI ra khỏi thẻ JSX.

---

## 7. Quy Trình Git, Commit & Code Review

### 7.1. Định Dạng Commit Chuẩn Conventional Commits 1.0.0
Mọi thông điệp commit phải tuân thủ nghiêm ngặt cú pháp:
```text
<loại>(<phạm vi>): <mô tả ngắn gọn bằng thể mệnh lệnh>
```

**Các loại commit hợp lệ**:
- `feat`: Tính năng mới cho người dùng.
- `fix`: Sửa lỗi phát sinh.
- `docs`: Bổ sung hoặc chỉnh sửa tài liệu.
- `refactor`: Tái cấu trúc mã nguồn mà không thay đổi chức năng.
- `perf`: Cải thiện hiệu năng hoặc tốc độ phản hồi.
- `test`: Bổ sung hoặc sửa đổi bộ kiểm thử tự động.
- `chore`: Cập nhật cấu hình, thư viện phụ trợ.

**Ví dụ đúng**:
- `feat(itinerary): add deepseek itinerary adapter`
- `fix(ocr): resolve camera aspect ratio distortion on mobile`
- `docs(onboarding): add developer setup guide`

**Ví dụ sai**:
- `added some code` (Không có loại, dùng thì quá khứ).
- `fix bug` (Không có phạm vi, mơ hồ).

### 7.2. Danh Mục Kiểm Tra Khi Code Review (PR Checklist)
- [ ] Không có kiểu dữ liệu `any`.
- [ ] Không có ký tự gạch ngang dài (em-dash).
- [ ] Đã bổ sung Unit Test bao quát các trường hợp biên (edge cases).
- [ ] Toàn bộ test suite chạy đạt 100% (`npm run test`).
- [ ] Lệnh biên dịch sản xuất hoàn thành không có cảnh báo (`npm run build`).

---
*Chúc bạn có những trải nghiệm lập trình xuất sắc và cùng nhau phát triển Traveling vươn tầm quốc tế!*
