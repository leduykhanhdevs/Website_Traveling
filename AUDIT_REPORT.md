# Traveling — Kiểm thử và cải thiện website, 08/09/2026

## Kết quả và giới hạn

Đã sửa các lỗi được xác nhận trong website Vite/React tại `D:/DuAn/Web Traveling`, xây dựng API tạo lịch trình server-side, UI lịch theo ngày, lưu cục bộ và xuất tệp. Đã đọc app `D:/DuAn/Traveling` để khớp `ItineraryRequest`/`ItineraryPlan` và đơn vị chi phí USD. Không sửa mã nguồn app.

**Chưa thể xác nhận AI thật tạo lịch thành công:** hai lần gọi live trong phiên cho thấy endpoint OpenAI trả HTTP 429; lần kiểm tra nguyên nhân trả `insufficient_quota` / `credit_balance_exhausted`. Người dùng yêu cầu giữ OpenAI và tự bổ sung số dư sau. Không dùng dữ liệu mẫu thay cho kết quả AI trong website.

**Chưa đồng bộ tài khoản app:** API `/api/v1/itineraries/generate` của app yêu cầu Clerk, hồ sơ người dùng và kiểm tra entitlement. Website hiện gọi AI độc lập và lưu một lịch gần nhất trên thiết bị. JSON xuất cùng cấu trúc không có nghĩa app đã hỗ trợ nhập. Tính năng đồng bộ cần hoàn thiện đăng nhập và nối API có ownership, không dùng tài khoản dịch vụ dùng chung để bỏ qua quyền truy cập.

Chưa deploy thay đổi lên website Vercel công khai. Bản xem trước đầy đủ API ở `http://127.0.0.1:5173/`. Bản static production được kiểm tra riêng qua Vite preview; preview static không chạy API Vercel.

## Lỗi xác nhận và xử lý

| Vấn đề trước sửa | Xử lý |
|---|---|
| Nút tạo lịch chỉ chạy timer, lịch luôn là ngày 1 | API gọi OpenAI; yêu cầu 1–7 ngày, ngân sách và sở thích; hiển thị từng ngày/giờ/chi phí |
| Nội dung thời tiết 24°C và tiết kiệm 1,8 km không có nguồn | Loại bỏ; ghi rõ lịch AI cần kiểm tra giá, giờ mở cửa và thời tiết |
| Không có chức năng lưu/xuất dù giao diện quảng bá | Lưu một lịch trên thiết bị, khôi phục khi tải lại, xuất TXT/JSON, mở tìm kiếm bản đồ |
| Thay lựa chọn trong lúc tạo có thể nhận kết quả cũ | Hủy request và bỏ response cũ; giữ lịch trước cho tới lần tạo mới thành công |
| Frontend báo gửi email thành công kể cả lỗi mạng/server | Chỉ thành công khi API xác nhận; có lỗi hiển thị và timeout |
| Backend email bỏ qua lỗi Resend, thiếu cấu hình vẫn báo thành công | Kiểm tra email, cấu hình, status và ID nhà cung cấp; không ghi email vào log |
| `.env.example` gợi ý đặt khóa email trong `VITE_` | Thay bằng biến server-only; kiểm tra khóa AI không có trong bundle |
| Lịch AI không có validation | Kiểm tra số ngày, điểm đến, budget, ID trùng, thời gian chồng lấn và tổng tiền |
| Chọn chi tiết điểm đến làm cuộn ngay xuống demo | Chỉ chuyển sau nút “Lên Lịch Trình Cho Điểm Này”; chọn đúng thành phố và mở tab lịch |
| Carousel cho bàn phím đi vào slide ngoài khung | Đặt aria-hidden và bỏ tab stop cho slide ngoài vùng hiển thị |
| Modal thiếu giữ focus/khóa cuộn | Hook dùng chung cho đăng ký, pháp lý và chi tiết điểm đến; Escape/khôi phục focus |
| Tab tính năng thiếu phím mũi tên/Home/End | Roving tabindex và điều hướng bằng bàn phím |
| Câu không hỗ trợ hiển thị như đang dịch vô hạn | Đổi thành sổ tay câu có sẵn; thông báo không có câu và tắt phát âm |
| Số tiền chia tròn khiến tổng không khớp | Chia phần nguyên và phân bổ phần lẻ; 30.000.000đ / 7 = 4.285.714đ, thêm 1đ cho 2 người |
| Tỷ giá fallback ghi như thời gian thực | Phân biệt ước tính/trực tuyến, xác thực tỷ giá hữu hạn dương, hiển thị thời điểm dữ liệu từ API |
| Định vị tự chạy lúc vào trang | Chỉ yêu cầu vị trí khi bấm “Tọa độ của tôi”; vị trí mặc định được ghi rõ |
| Carousel trên globe tự kéo vị trí cuộn dọc khi tải | Chỉ cuộn ngang dải nút thành phố |
| Render 3D vẫn chạy khi ra khỏi màn hình | Bỏ render khi ngoài viewport/tab ẩn; giảm chuyển động theo tùy chọn hệ thống |
| AnimatedCounter sửa trực tiếp textContent, gây React removeChild khi cập nhật | Chuyển cập nhật số sang state React |
| Vite/esbuild có 2 cảnh báo dependency, gồm mức high | Nâng Vite 7/plugin React tương thích; audit toàn bộ sau cập nhật không còn cảnh báo |
| Sitemap dùng fragment như trang độc lập | Chỉ giữ URL canonical thật |
| Schema có SearchAction không tồn tại, breadcrumb giả và feature claim chưa triển khai | Giữ WebSite/Organization đúng phạm vi hiện tại |
| Favicon ICO không tồn tại, Bing verification placeholder | Bỏ tham chiếu hỏng/placeholder; giữ favicon SVG và file Google verification hiện có |
| Nội dung SEO chủ yếu là bản HTML riêng dễ lệch React | Prerender nội dung React vào HTML production |
| Các số 98%, 3,5x, phản hồi 1,2s, server 100% chưa có đo lường | Thay bằng thông tin phạm vi tính năng; mô tả OCR/app sync/offline đúng thực tế |

## Kiểm thử đã thực hiện

- CI chuyển Node 18 sang Node 24 để tương thích Vite mới, thêm regression test và audit production dependency. Chưa chạy CI GitHub từ xa.
- `npm run typecheck`: frontend và server/API.
- `npm run build`: typecheck, bundle Vite và prerender React vào HTML.
- `npm test`: bốn bài kiểm thử cấp cao, nhiều assertion bên trong:
  1. Validation input và thuộc tính ngoài contract.
  2. Validation lịch, trùng giờ, tổng tiền, điểm đến và số ngày.
  3. HTTP thực tới server test, provider giả lập: method, origin, cấu hình, lỗi provider, response sai, thành công và rate limit; email không báo thành công sai.
  4. UI trong JSDOM: lịch 7 ngày, chuyển ngày, lưu/khôi phục, nội dung TXT/JSON, giữ lịch khi response sai/mạng lỗi, đăng ký lỗi không thành công.
- Trình duyệt thật: kiểm tra desktop/mobile, dropdown bàn phím, chọn ngày, chuyển tab, sổ tay câu không hỗ trợ, modal focus/Escape, bộ lọc và chuyển Hà Nội từ chi tiết vào planner, phép chia tiền 7 người.
- Production browser: đúng một H1; không phát hiện ảnh hỏng đã tải; không tràn ngang ở viewport đã đo; không có error console mới sau tải bản sửa bộ đếm.
- Kiểm tra HTML build: một H1, không trùng ID, không anchor nội bộ trỏ tới ID thiếu, JSON-LD parse được, không fragment sitemap. Kết quả máy đọc ở `artifacts/static-checks.json`.
- `npm audit`: không có vulnerability được registry báo tại thời điểm kiểm tra. Không phải bảo đảm phần mềm không còn lỗ hổng.
- Kiểm tra bundle không chứa giá trị khóa OpenAI hiện tại; `.env.local` được Git ignore.

Không tuyên bố đạt WCAG đầy đủ, điểm Lighthouse cụ thể, Core Web Vitals thực địa, mọi browser đều tương thích hay “hết toàn bộ lỗi”. Chưa kiểm tra live email, live lịch AI thành công, tải cao, Google indexing hoặc đồng bộ app. Không gửi email thật trong phiên.

## Thiết kế và nguồn tham chiếu

Hướng chủ đạo là ảnh Traveling người dùng cung cấp: nền gần đen, card xanh than, chữ sans, accent cyan cho hành động chính. Áp dụng hướng dẫn Refero Design `craft-details.md` về form/focus/touch và `motion.md` về chuyển động vừa phải. Không có Refero MCP live trong phiên.

| Quyết định | Nguồn | Mục đích |
|---|---|---|
| Giữ palette tối và nút cyan | Ảnh người dùng | Liên tục với thương hiệu hiện có |
| Form 2 cột desktop/1 cột mobile, nút tối thiểu 44px | Craft/forms/touch | Dễ chọn sở thích và thao tác chạm |
| Ảnh điểm đến trong trạng thái chưa tạo | Ảnh điểm đến sẵn có trong repo | Thêm cảm hứng mà không dùng lịch giả |
| Chọn ngày, timeline và chi phí | Contract lịch trình app | Trình bày dữ liệu phù hợp chuyến đi nhiều ngày |
| Card công cụ không nhảy khi hover | Craft/stable controls | Tránh xê dịch khi nhập và nhấn nút |
| Tắt hoạt ảnh không cần thiết ngoài màn hình | Craft/motion | Giảm tải đồ họa khi người dùng đang đọc lịch |

SEO tham chiếu tài liệu chính thức Google: [JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics), [structured data generated with JavaScript](https://developers.google.com/search/docs/appearance/structured-data/generate-structured-data-with-javascript). Nâng Vite tham chiếu [migration guide](https://v7.vite.dev/guide/migration).

## Hướng phát triển tiếp theo, theo thứ tự ưu tiên

1. **Hoàn tất AI và triển khai có kiểm soát.** Bổ sung số dư OpenAI, chạy live 1/3/7 ngày và nhiều điểm đến; cấu hình server env trên Vercel, distributed rate limit/firewall, chống bot và ngân sách provider. Limiter hiện tại chỉ theo instance, không đảm bảo quota toàn hệ thống.
2. **Đồng bộ tài khoản với app.** Clerk dùng đúng instance, token người dùng qua proxy cùng origin, API lịch trình sẵn có và kiểm thử ownership/entitlement. Cần thiết kế rõ chuyển lịch cục bộ sang tài khoản.
3. **Dữ liệu du lịch có căn cứ.** Places ID, vị trí và giờ mở cửa từ provider; khoảng cách/thời gian tuyến; ngày đi và thời tiết có thời hạn dự báo; hiển thị nguồn và ngày cập nhật. Kiểm tra tình trạng địa điểm thay vì coi truy vấn Maps là xác minh.
4. **Không gian lập kế hoạch đầy đủ.** Chỉnh sửa/đổi thứ tự hoạt động, bản đồ tuyến bên cạnh timeline, xuất lịch calendar/PDF tiếng Việt, chia sẻ có quyền truy cập và lịch sử chỉnh sửa. Cần kiểm tra múi giờ trước xuất calendar.
5. **Nội dung SEO riêng từng điểm đến.** URL thật `/diem-den/...`, bài hướng dẫn có tác giả/ngày cập nhật/nguồn, itinerary mẫu biên tập và metadata riêng; tránh tạo hàng loạt trang mỏng bằng AI. Đo Search Console và Core Web Vitals sau deploy.
6. **Dịch/OCR thật và ngoại tuyến.** Nối dịch vụ app, upload/camera với consent đúng ngữ cảnh; giới hạn tệp và thời gian xử lý. Chỉ công bố hỗ trợ offline toàn website sau khi có service worker và kiểm thử cache/versioning.
7. **Đánh giá người dùng và nội dung tin cậy.** Thay các điểm rating/tình huống biên tập bằng dữ liệu được xác minh; không chuyển số liệu minh họa thành social proof. Kiểm chứng nội dung gói giá, pháp lý và an toàn trước công bố thương mại.

## Cấu hình còn thiếu trước vận hành

- Người dùng bổ sung số dư OpenAI rồi thử tạo lại; không cần thay khóa nếu khóa hiện tại vẫn hợp lệ.
- `RESEND_API_KEY`, `RESEND_FROM` chưa cấu hình cho website; chưa có nơi lưu waitlist bền vững.
- Vercel cần các biến server trong `.env.example`; tệp `.env.local` không đi theo Git/deploy.
- `npm run preview` chỉ dành cho QA static. Dùng `npm run dev` để thử cả hai API cục bộ, hoặc Vercel để chạy functions production.
