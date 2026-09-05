import React, { useState } from 'react';
import { Compass, Languages, Camera, Sparkles, MapPin, Check, RefreshCw, Volume2, ArrowRight } from 'lucide-react';
import { DESTINATIONS } from '../../data/destinations';
import { CustomSelect, SelectOption } from '../ui/CustomSelect';

export const InteractiveSimulator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'itinerary' | 'translate' | 'ocr'>('itinerary');

  // Simulator State: Itinerary
  const [selectedCity, setSelectedCity] = useState<string>('tokyo');
  const [travelStyle, setTravelStyle] = useState<string>('Văn hóa & Ẩm thực');
  const [tripDays, setTripDays] = useState<number>(3);
  const [isGeneratingItinerary, setIsGeneratingItinerary] = useState<boolean>(false);

  // Simulator State: Translator
  const [sourceText, setSourceText] = useState<string>('Xin chào, cho tôi hỏi quán cà phê ngon gần đây nhất ở đâu?');
  const [targetLang, setTargetLang] = useState<string>('ja');
  const [isTranslating, setIsTranslating] = useState<boolean>(false);

  // Translations dictionary for simulator demo
  const sampleTranslations: Record<string, Record<string, string>> = {
    'Xin chào, cho tôi hỏi quán cà phê ngon gần đây nhất ở đâu?': {
      ja: 'こんにちは、この近くで一番美味しいカフェはどこですか？',
      ko: '안녕하세요, 이 근처에서 가장 맛있는 카페가 어디인가요?',
      en: 'Hello, could you tell me where the best cafe nearby is?',
      fr: 'Bonjour, pourriez-vous me dire où se trouve le meilleur café à proximité ?',
    },
    'Món này có cay không? Tôi ăn chay': {
      ja: 'この料理は辛いですか？私はベジタリアンです。',
      ko: '이 음식은 맵나요? 저는 채식주의자입니다.',
      en: 'Is this dish spicy? I am a vegetarian.',
      fr: 'Ce plat est-il épicé ? Je suis végétarien.',
    },
    'Bao nhiêu tiền một vé vào cổng?': {
      ja: '入場券はいくらですか？',
      ko: '입장권은 얼마인가요?',
      en: 'How much is an entrance ticket?',
      fr: 'Combien coûte un billet d\'entrée ?',
    },
  };

  const currentTranslation =
    sampleTranslations[sourceText]?.[targetLang] ||
    'Dịch thuật tự động đang xử lý đa ngôn ngữ chuẩn xác...';

  // Sample OCR Menu items
  const ocrMenuItems = [
    { original: '特選 黒毛和牛ラーメン', translated: 'Ramen Thịt Bò Wagyu Hảo Hạng', price: '1,450 ¥' },
    { original: '自家製 焼き餃子 (6個)', translated: 'Há Cảo Áp Chảo Nhà Làm (6 cái)', price: '520 ¥' },
    { original: '宇治 抹茶アイスクリーム', translated: 'Kem Trà Xanh Matcha Uji', price: '380 ¥' },
  ];

  return (
    <section id="demo" aria-labelledby="demo-heading" className="py-24 relative overflow-hidden bg-surface/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 id="demo-heading" className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
            Trải Nghiệm Các Tính Năng Cốt Lõi
          </h2>
          <p className="text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Khám phá cách Traveling xử lý hành trình, chuyển ngữ văn hóa và phân tích thông tin du lịch thực tế ngay trên trình duyệt.
          </p>
        </div>

        {/* Simulator Box */}
        <div className="max-w-4xl mx-auto glass-card rounded-3xl overflow-hidden border border-border-subtle shadow-2xl">
          {/* Tab Bar */}
          <div
            role="tablist"
            aria-label="Bộ chọn tính năng mô phỏng trải nghiệm"
            className="flex border-b border-border-subtle bg-surface-light/40 overflow-x-auto scrollbar-none"
          >
            <button
              id="tab-itinerary"
              role="tab"
              aria-selected={activeTab === 'itinerary'}
              aria-controls="panel-itinerary"
              onClick={() => setActiveTab('itinerary')}
              className={`flex-1 min-w-[200px] py-4 px-6 text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 transition-all border-b-2 focus-visible:ring-2 focus-visible:ring-primary focus:outline-none ${
                activeTab === 'itinerary'
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Compass className="w-4 h-4" aria-hidden="true" />
              <span>Tạo Lịch Trình AI</span>
            </button>

            <button
              id="tab-translate"
              role="tab"
              aria-selected={activeTab === 'translate'}
              aria-controls="panel-translate"
              onClick={() => setActiveTab('translate')}
              className={`flex-1 min-w-[200px] py-4 px-6 text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 transition-all border-b-2 focus-visible:ring-2 focus-visible:ring-primary focus:outline-none ${
                activeTab === 'translate'
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Languages className="w-4 h-4" aria-hidden="true" />
              <span>Dịch Thuật Thời Gian Thực</span>
            </button>

            <button
              id="tab-ocr"
              role="tab"
              aria-selected={activeTab === 'ocr'}
              aria-controls="panel-ocr"
              onClick={() => setActiveTab('ocr')}
              className={`flex-1 min-w-[200px] py-4 px-6 text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 transition-all border-b-2 focus-visible:ring-2 focus-visible:ring-primary focus:outline-none ${
                activeTab === 'ocr'
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Camera className="w-4 h-4" aria-hidden="true" />
              <span>Camera OCR Quét Thực Đơn</span>
            </button>
          </div>

          {/* Tab 1: AI Itinerary Simulator */}
          {activeTab === 'itinerary' && (
            <div
              id="panel-itinerary"
              role="tabpanel"
              aria-labelledby="tab-itinerary"
              className="p-6 sm:p-8 space-y-6 animate-fade-in"
            >
              {/* Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <CustomSelect
                  id="sim-city-select"
                  label="Điểm Đến Mục Tiêu"
                  value={selectedCity}
                  onChange={(val) => setSelectedCity(val)}
                  options={DESTINATIONS.map((dest) => ({
                    value: dest.id,
                    label: dest.name,
                    subLabel: dest.country,
                  }))}
                />

                <CustomSelect
                  id="sim-style-select"
                  label="Gu Du Lịch"
                  value={travelStyle}
                  onChange={(val) => setTravelStyle(val)}
                  options={[
                    { value: 'Văn hóa & Ẩm thực', label: 'Văn hóa & Ẩm thực' },
                    { value: 'Thiên nhiên & Thám hiểm', label: 'Thiên nhiên & Thám hiểm' },
                    { value: 'Nghỉ dưỡng sang trọng', label: 'Nghỉ dưỡng sang trọng' },
                    { value: 'Tiết kiệm & Du lịch bụi', label: 'Tiết kiệm & Du lịch bụi' },
                  ]}
                />

                <div>
                  <label id="sim-days-label" className="text-xs font-semibold text-slate-300 mb-1.5 block">
                    Số Ngày Dự Kiến
                  </label>
                  <div role="group" aria-labelledby="sim-days-label" className="flex items-center gap-2">
                    {[1, 3, 5, 7].map((days) => (
                      <button
                        key={days}
                        onClick={() => setTripDays(days)}
                        aria-pressed={tripDays === days}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border focus-visible:ring-2 focus-visible:ring-primary focus:outline-none ${
                          tripDays === days
                            ? 'bg-primary text-slate-950 border-primary'
                            : 'bg-surface-light text-slate-300 border-border-subtle hover:bg-slate-800'
                        }`}
                      >
                        {days}N
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Simulated Generated Day Card */}
              <div className="rounded-2xl bg-surface-light/70 border border-border-subtle p-5">
                <div className="flex items-center justify-between border-b border-border-subtle pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" aria-hidden="true" />
                    <h3 className="text-sm font-bold text-white">
                      Lịch Trình Ngày 1: Tinh Hoa {DESTINATIONS.find((d) => d.id === selectedCity)?.name}
                    </h3>
                  </div>
                  <span className="text-xs text-primary font-mono">Thời tiết: Nắng ấm, 24°C</span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      1
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs">
                        <strong className="text-white">08:30 - Thưởng thức bữa sáng truyền thống địa phương</strong>
                        <span className="text-slate-400 text-[11px]">45 phút</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Khám phá hương vị cà phê và món điểm tâm nổi tiếng có hơn 30 năm tuổi nghề.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      2
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs">
                        <strong className="text-white">10:00 - Tham quan di tích lịch sử và bảo tàng kiến trúc</strong>
                        <span className="text-slate-400 text-[11px]">2 giờ</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Tuyến đường được AI tính toán giảm 1.8km tắc đường giờ cao điểm so với bản đồ thông thường.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      3
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs">
                        <strong className="text-white">14:30 - Check-in điểm ngắm hoàng hôn toàn cảnh thành phố</strong>
                        <span className="text-slate-400 text-[11px]">1.5 giờ</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Tự động điều phối thời gian trùng khớp khoảnh khắc ánh sáng đẹp nhất trong ngày.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Check className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                  <span>Lịch trình sẵn sàng lưu vào ứng dụng và xuất file offline</span>
                </div>
                <button
                  aria-label="Tạo thêm gợi ý lộ trình mới"
                  className="px-6 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-slate-950 font-bold text-xs transition-all shadow-md shadow-primary/20 flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-white focus:outline-none"
                >
                  <span>Tạo Thử Thêm Lộ Trình</span>
                  <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Translation Simulator */}
          {activeTab === 'translate' && (
            <div
              id="panel-translate"
              role="tabpanel"
              aria-labelledby="tab-translate"
              className="p-6 sm:p-8 space-y-6 animate-fade-in"
            >
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="sim-source-text" className="text-xs font-semibold text-slate-300">
                      Chọn Câu Mẫu Du Khách Thường Dùng:
                    </label>
                    <span className="text-[11px] text-primary">Ngôn ngữ nguồn: Tiếng Việt</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {Object.keys(sampleTranslations).map((phrase) => (
                      <button
                        key={phrase}
                        onClick={() => setSourceText(phrase)}
                        className={`text-xs px-3 py-1.5 rounded-xl border transition-all text-left focus-visible:ring-2 focus-visible:ring-primary focus:outline-none ${
                          sourceText === phrase
                            ? 'bg-primary/10 border-primary text-primary'
                            : 'bg-surface-light border-border-subtle text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        "{phrase}"
                      </button>
                    ))}
                  </div>

                  <textarea
                    id="sim-source-text"
                    rows={2}
                    value={sourceText}
                    onChange={(e) => setSourceText(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-surface-light border border-border-subtle text-xs sm:text-sm text-white focus:outline-none focus:border-primary resize-none"
                    placeholder="Nhập bất kỳ câu nào cần dịch..."
                  />
                </div>

                {/* Target Language Toggle */}
                <div className="flex items-center justify-between">
                  <span id="target-lang-label" className="text-xs font-semibold text-slate-300">Dịch Sang:</span>
                  <div role="group" aria-labelledby="target-lang-label" className="flex items-center gap-2">
                    {[
                      { code: 'ja', label: 'Tiếng Nhật (日本語)' },
                      { code: 'ko', label: 'Tiếng Hàn (한국어)' },
                      { code: 'en', label: 'Tiếng Anh (English)' },
                      { code: 'fr', label: 'Tiếng Pháp (Français)' },
                    ].map((l) => (
                      <button
                        key={l.code}
                        onClick={() => setTargetLang(l.code)}
                        aria-pressed={targetLang === l.code}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border focus-visible:ring-2 focus-visible:ring-indigo-400 focus:outline-none ${
                          targetLang === l.code
                            ? 'bg-indigo-500 text-white border-indigo-500 shadow-md shadow-indigo-500/25'
                            : 'bg-surface-light text-slate-300 border-border-subtle hover:bg-slate-800'
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Output Translation Box */}
                <div className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-indigo-400">Kết Quả Dịch Bản Xứ Chuẩn Sắc Thái</span>
                    <button
                      aria-label="Phát âm câu dịch chuẩn giọng bản xứ"
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-indigo-400 focus:outline-none"
                    >
                      <Volume2 className="w-4 h-4 text-indigo-400" aria-hidden="true" />
                      <span>Phát âm chuẩn</span>
                    </button>
                  </div>
                  <p className="text-base sm:text-lg font-bold text-white tracking-wide">
                    {currentTranslation}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: OCR Camera Scanner Simulator */}
          {activeTab === 'ocr' && (
            <div
              id="panel-ocr"
              role="tabpanel"
              aria-labelledby="tab-ocr"
              className="p-6 sm:p-8 space-y-6 animate-fade-in"
            >
              <div className="text-xs text-slate-400 mb-2">
                Mô phỏng ống kính camera di động nhận diện và dịch trực tiếp các ký tự trên thực đơn tiếng Nhật:
              </div>

              {/* Viewfinder Mockup */}
              <div className="relative rounded-2xl overflow-hidden border-2 border-primary/50 bg-slate-950 p-6">
                {/* Scanner Grid Lines */}
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />

                <div className="space-y-4">
                  {ocrMenuItems.map((item, i) => (
                    <div
                      key={i}
                      className="relative p-3.5 rounded-xl border border-primary/30 bg-primary/5 backdrop-blur-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-all hover:bg-primary/10"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-primary text-slate-950 font-bold">
                            OCR NHẬN DIỆN
                          </span>
                          <span className="text-sm font-bold text-slate-300">{item.original}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-sm font-semibold text-emerald-400">{item.translated}</span>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-amber-400 font-bold sm:text-right">
                        {item.price}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
