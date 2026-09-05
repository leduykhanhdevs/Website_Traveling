import React, { useState, useEffect } from 'react';
import { Users, DollarSign, Plus, Minus, RefreshCw } from 'lucide-react';
import { CustomSelect, SelectOption } from '../ui/CustomSelect';

// Static fallback rates (relative to 1 VND)
const FALLBACK_RATES: Record<string, number> = {
  VND: 1,
  USD: 1 / 25450,
  EUR: 1 / 27600,
  JPY: 1 / 168,
  KRW: 1 / 18.8,
  SGD: 1 / 19100,
  THB: 1 / 730,
  GBP: 1 / 32400,
  AUD: 1 / 16600,
  CAD: 1 / 18400,
};

const CURRENCY_OPTIONS: SelectOption[] = [
  { value: 'VND', label: 'VND', subLabel: 'Việt Nam Đồng (đ)' },
  { value: 'USD', label: 'USD', subLabel: 'Đô la Mỹ ($)' },
  { value: 'EUR', label: 'EUR', subLabel: 'Euro Châu Âu (€)' },
  { value: 'JPY', label: 'JPY', subLabel: 'Yên Nhật (¥)' },
  { value: 'KRW', label: 'KRW', subLabel: 'Won Hàn Quốc (₩)' },
  { value: 'SGD', label: 'SGD', subLabel: 'Đô la Singapore (S$)' },
  { value: 'THB', label: 'THB', subLabel: 'Baht Thái Lan (฿)' },
  { value: 'GBP', label: 'GBP', subLabel: 'Bảng Anh (£)' },
  { value: 'AUD', label: 'AUD', subLabel: 'Đô la Úc (A$)' },
  { value: 'CAD', label: 'CAD', subLabel: 'Đô la Canada (C$)' },
];

export const BudgetSplitDemo: React.FC = () => {
  // Total expense in VND, up to 500,000,000 VND (500 million VND)
  const [totalExpense, setTotalExpense] = useState<number>(30000000);
  const [memberCount, setMemberCount] = useState<number>(5);
  const [currency, setCurrency] = useState<string>('VND');
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>(FALLBACK_RATES);
  const [lastUpdated, setLastUpdated] = useState<string>('Thời gian thực');
  const [isLiveRate, setIsLiveRate] = useState<boolean>(false);

  // Fetch real-time live currency rates
  useEffect(() => {
    let isMounted = true;
    fetch('https://open.er-api.com/v6/latest/VND')
      .then((res) => {
        if (!res.ok) throw new Error('Network error');
        return res.json();
      })
      .then((data) => {
        if (isMounted && data && data.rates) {
          setExchangeRates((prev) => ({
            ...prev,
            ...data.rates,
          }));
          setIsLiveRate(true);
          const now = new Date();
          setLastUpdated(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
        }
      })
      .catch(() => {
        // Silently retain fallback rates
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Format currency amount based on selected currency
  const formatCurrency = (amountInVND: number, cur: string): string => {
    const rate = exchangeRates[cur] || FALLBACK_RATES[cur] || 1;
    const converted = amountInVND * rate;

    switch (cur) {
      case 'VND':
        return `${Math.round(converted).toLocaleString('vi-VN')} đ`;
      case 'USD':
        return `$${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      case 'EUR':
        return `€${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      case 'JPY':
        return `¥${Math.round(converted).toLocaleString()}`;
      case 'KRW':
        return `₩${Math.round(converted).toLocaleString()}`;
      case 'SGD':
        return `S$${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      case 'THB':
        return `฿${Math.round(converted).toLocaleString()}`;
      case 'GBP':
        return `£${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      case 'AUD':
        return `A$${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      case 'CAD':
        return `C$${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      default:
        return `${converted.toFixed(2)} ${cur}`;
    }
  };

  const perPersonShare = Math.round(totalExpense / Math.max(1, memberCount));

  // Quick expense presets up to 500 million VND
  const expensePresets = [
    { label: '10 Triệu', value: 10000000 },
    { label: '50 Triệu', value: 50000000 },
    { label: '100 Triệu', value: 100000000 },
    { label: '250 Triệu', value: 250000000 },
    { label: '500 Triệu', value: 500000000 },
  ];

  // Category percentage allocations
  const categories = [
    { name: 'Lưu trú khách sạn & Resort', percent: 38, color: 'bg-primary' },
    { name: 'Ẩm thực & Cà phê địa phương', percent: 32, color: 'bg-emerald-400' },
    { name: 'Vé máy bay & Di chuyển', percent: 20, color: 'bg-indigo-400' },
    { name: 'Vé tham quan & Trải nghiệm', percent: 10, color: 'bg-amber-400' },
  ];

  return (
    <section id="budget" aria-labelledby="budget-heading" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Context & Value proposition */}
          <div className="lg:col-span-5 space-y-6">
            <h2 id="budget-heading" className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Chia Tiền Du Lịch Nhóm Minh Bạch, Không Sai Sót
            </h2>

            <p className="text-base text-slate-400 leading-relaxed">
              Xóa tan mọi băn khoăn về tài chính khi đi du lịch cùng bạn bè, gia đình hay đoàn đông người. Thuật toán cân bằng nợ tự động tính toán bù trừ tối giản số lần chuyển khoản giữa các thành viên.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <div className="w-5 h-5 rounded-full bg-emerald-400/20 text-emerald-400 flex items-center justify-center text-xs font-bold" aria-hidden="true">
                  ✓
                </div>
                <span>Tự động cập nhật tỷ giá hối đoái 10 ngoại tệ theo thời gian thực</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <div className="w-5 h-5 rounded-full bg-emerald-400/20 text-emerald-400 flex items-center justify-center text-xs font-bold" aria-hidden="true">
                  ✓
                </div>
                <span>Hỗ trợ ngân sách đoàn lớn lên đến 500 triệu đồng và 100+ thành viên</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <div className="w-5 h-5 rounded-full bg-emerald-400/20 text-emerald-400 flex items-center justify-center text-xs font-bold" aria-hidden="true">
                  ✓
                </div>
                <span>Hỗ trợ xuất mã QR VietQR chuyển khoản trực tiếp bù trừ tức thì</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive Calculator Card */}
          <div className="lg:col-span-7 glass-card p-6 sm:p-8 rounded-3xl border border-border-subtle shadow-2xl relative">
            {/* Header: Title & Luxury Currency Dropdown */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border-subtle pb-4 mb-6 gap-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary flex-shrink-0" aria-hidden="true" />
                <h3 className="text-sm font-bold text-white">Bảng Tính Toán Bù Trừ Nợ Trực Tiếp</h3>
              </div>

              {/* Currency Selector with CustomSelect */}
              <div className="w-full sm:w-56">
                <CustomSelect
                  id="currency-select"
                  value={currency}
                  onChange={(val) => setCurrency(val)}
                  options={CURRENCY_OPTIONS}
                />
              </div>
            </div>

            {/* Total Expense Slider (Up to 500M VND) */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
                  <label htmlFor="expense-range">Tổng Chi Phí Chuyến Đi:</label>
                  <span className="text-xl font-black text-white font-mono">
                    {formatCurrency(totalExpense, currency)}
                  </span>
                </div>

                <input
                  id="expense-range"
                  type="range"
                  aria-label="Tổng chi phí chuyến đi"
                  aria-valuemin={1000000}
                  aria-valuemax={500000000}
                  aria-valuenow={totalExpense}
                  min={1000000}
                  max={500000000}
                  step={1000000}
                  value={totalExpense}
                  onChange={(e) => setTotalExpense(Number(e.target.value))}
                  className="w-full h-2 rounded-lg bg-surface-light appearance-none cursor-pointer accent-primary"
                />

                {/* Quick Presets: 10M, 50M, 100M, 250M, 500M */}
                <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
                  {expensePresets.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => setTotalExpense(preset.value)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
                        totalExpense === preset.value
                          ? 'bg-primary text-slate-950 font-bold'
                          : 'bg-surface-light text-slate-400 hover:text-white hover:bg-slate-800 border border-border-subtle'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Members Selection (Arbitrary count with stepper & input) */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
                  <span id="member-count-label">Số Lượng Thành Viên Đồng Hành:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-primary">{memberCount} người</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Stepper buttons */}
                  <button
                    onClick={() => setMemberCount((prev) => Math.max(1, prev - 1))}
                    disabled={memberCount <= 1}
                    className="w-9 h-9 rounded-xl glass-panel flex items-center justify-center text-slate-300 hover:text-white hover:border-primary/50 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex-shrink-0"
                    aria-label="Giảm 1 thành viên"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  {/* Direct input for arbitrary number */}
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={memberCount}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val) && val >= 1) setMemberCount(Math.min(200, val));
                    }}
                    className="w-16 py-2 px-2 rounded-xl bg-surface-light border border-border-subtle text-center text-xs font-bold text-white focus:outline-none focus:border-primary"
                    aria-label="Nhập số người tham gia"
                  />

                  <button
                    onClick={() => setMemberCount((prev) => Math.min(200, prev + 1))}
                    disabled={memberCount >= 200}
                    className="w-9 h-9 rounded-xl glass-panel flex items-center justify-center text-slate-300 hover:text-white hover:border-primary/50 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex-shrink-0"
                    aria-label="Tăng 1 thành viên"
                  >
                    <Plus className="w-4 h-4" />
                  </button>

                  {/* Quick Member Preset Chips */}
                  <div role="group" aria-labelledby="member-count-label" className="flex items-center gap-1.5 overflow-x-auto scrollbar-none no-scrollbar flex-1 pl-1">
                    {[2, 4, 6, 8, 10, 15, 20].map((count) => (
                      <button
                        key={count}
                        onClick={() => setMemberCount(count)}
                        aria-pressed={memberCount === count}
                        className={`px-2.5 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus:outline-none ${
                          memberCount === count
                            ? 'bg-primary text-slate-950 border-primary shadow-md shadow-primary/25'
                            : 'bg-surface-light text-slate-300 border-border-subtle hover:bg-slate-800'
                        }`}
                      >
                        {count} người
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Calculated Split Output Box */}
              <div className="p-5 rounded-2xl bg-surface-light border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-slate-400 block mb-1">
                    Mỗi thành viên cần đóng góp ({memberCount} người):
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                    {formatCurrency(perPersonShare, currency)}
                  </div>
                  {currency !== 'VND' && (
                    <div className="text-xs text-slate-400 font-mono mt-1">
                      Tương đương {Math.round(perPersonShare).toLocaleString('vi-VN')} đ
                    </div>
                  )}
                </div>

                <div className="text-xs text-slate-300 border-l border-border-subtle pl-4 space-y-1">
                  <div>Tự động tối ưu số lượt chuyển</div>
                  <div className="text-emerald-400 font-medium">Chỉ cần 1 lượt thanh toán</div>
                </div>
              </div>

              {/* Live Rate Indicator Footnote */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isLiveRate ? 'bg-emerald-400 animate-pulse' : 'bg-primary'}`} />
                  <span>
                    {isLiveRate ? 'Tỷ giá hối đoái trực tuyến' : 'Tỷ giá tham chiếu chuẩn'}
                  </span>
                  {currency !== 'VND' && (
                    <span className="text-slate-300 font-mono">
                      (1 {currency} ≈ {Math.round(1 / (exchangeRates[currency] || FALLBACK_RATES[currency])).toLocaleString('vi-VN')} đ)
                    </span>
                  )}
                </div>

                <span className="text-slate-500 font-mono">
                  {lastUpdated}
                </span>
              </div>

              {/* Category Breakdown Bar */}
              <div>
                <span className="text-xs font-semibold text-slate-300 block mb-2">
                  Phân Bổ Chi Tiêu Dự Kiến Theo Hạng Mục:
                </span>
                <div className="h-3 rounded-full overflow-hidden flex gap-0.5 mb-3">
                  {categories.map((cat, i) => (
                    <div
                      key={i}
                      style={{ width: `${cat.percent}%` }}
                      className={`${cat.color} h-full transition-all`}
                      title={`${cat.name}: ${formatCurrency((totalExpense * cat.percent) / 100, currency)}`}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-400">
                  {categories.map((cat, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${cat.color}`} />
                      <span>{cat.name} ({cat.percent}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
