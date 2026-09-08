import { ItineraryPlanner } from './ItineraryPlanner';
import React, { useEffect, useState } from 'react';
import { Compass, Languages, Camera, Volume2, ArrowRight } from 'lucide-react';

export const InteractiveSimulator = ({ destinationId, onDestinationChange, openSignal }: { openSignal: number; destinationId: string; onDestinationChange: (id: string) => void }) => {
  const [activeTab, setActiveTab] = useState<'itinerary' | 'translate' | 'ocr'>('itinerary');

  useEffect(() => { setActiveTab('itinerary'); }, [openSignal]);

  // Simulator State: Translator
  const [sourceText, setSourceText] = useState<string>('Xin chào, cho tôi hỏi quán cà phê ngon gần đây nhất ở đâu?');
  const [targetLang, setTargetLang] = useState<string>('ja');

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

  useEffect(() => { window.speechSynthesis?.cancel(); setIsSpeaking(false); }, [sourceText, targetLang, activeTab]);
  useEffect(() => () => window.speechSynthesis?.cancel(), []);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const currentTranslation =
    sampleTranslations[sourceText]?.[targetLang] ||
    'Câu này chưa có trong sổ tay. Hãy chọn một câu mẫu bên trên.';

  const handlePronounce = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && currentTranslation) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentTranslation);
      const langMap: Record<string, string> = {
        ja: 'ja-JP',
        ko: 'ko-KR',
        en: 'en-US',
        fr: 'fr-FR',
      };
      utterance.lang = langMap[targetLang] || 'en-US';
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Sample OCR Menu items
  const ocrMenuItems = [
    { original: '特選 黒毛和牛ラーメン', translated: 'Ramen Thịt Bò Wagyu Hảo Hạng', price: '1,450 ¥' },
    { original: '自家製 焼き餃子 (6個)', translated: 'Há Cảo Áp Chảo Nhà Làm (6 cái)', price: '520 ¥' },
    { original: '宇治 抹茶アイスクリーム', translated: 'Kem Trà Xanh Matcha Uji', price: '380 ¥' },
  ];

  return (
    <section id="demo" aria-labelledby="demo-heading" className="pt-12 pb-20 sm:pt-16 sm:pb-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 id="demo-heading" className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
            Trải Nghiệm Các Tính Năng Cốt Lõi
          </h2>
          <p className="text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Lên lịch trình với AI ngay trên trình duyệt, lưu kế hoạch cho chuyến đi và khám phá sổ tay giao tiếp du lịch.
          </p>
        </div>

        {/* Simulator Box */}
        <div className="max-w-4xl mx-auto glass-card interactive-card rounded-3xl overflow-hidden border border-border-subtle shadow-2xl">
          {/* Tab Bar */}
          <div
            onKeyDown={(event) => {
              const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
              if (!keys.includes(event.key)) return;
              event.preventDefault();
              const tabs = ['itinerary', 'translate', 'ocr'] as const;
              const current = tabs.indexOf(activeTab);
              const next = event.key === 'Home' ? 0 : event.key === 'End' ? 2 : (current + (event.key === 'ArrowRight' ? 1 : 2)) % 3;
              setActiveTab(tabs[next]);
              document.getElementById(`tab-${tabs[next]}`)?.focus();
            }}
            role="tablist"
            aria-label="Bộ chọn tính năng mô phỏng trải nghiệm"
            className="flex border-b border-border-subtle bg-surface-light/40 overflow-x-auto scrollbar-none"
          >
            <button
              id="tab-itinerary"
              tabIndex={activeTab === 'itinerary' ? 0 : -1}
              role="tab"
              aria-selected={activeTab === 'itinerary'}
              aria-controls="panel-itinerary"
              onClick={() => setActiveTab('itinerary')}
              className={`flex-1 min-w-[165px] py-4 px-6 text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 transition-all border-b-2 focus-visible:ring-2 focus-visible:ring-primary focus:outline-none ${
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
              tabIndex={activeTab === 'translate' ? 0 : -1}
              role="tab"
              aria-selected={activeTab === 'translate'}
              aria-controls="panel-translate"
              onClick={() => setActiveTab('translate')}
              className={`flex-1 min-w-[165px] py-4 px-6 text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 transition-all border-b-2 focus-visible:ring-2 focus-visible:ring-primary focus:outline-none ${
                activeTab === 'translate'
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Languages className="w-4 h-4" aria-hidden="true" />
              <span>Sổ tay câu giao tiếp</span>
            </button>

            <button
              id="tab-ocr"
              tabIndex={activeTab === 'ocr' ? 0 : -1}
              role="tab"
              aria-selected={activeTab === 'ocr'}
              aria-controls="panel-ocr"
              onClick={() => setActiveTab('ocr')}
              className={`flex-1 min-w-[165px] py-4 px-6 text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 transition-all border-b-2 focus-visible:ring-2 focus-visible:ring-primary focus:outline-none ${
                activeTab === 'ocr'
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Camera className="w-4 h-4" aria-hidden="true" />
              <span>Minh họa OCR thực đơn</span>
            </button>
          </div>

          <div id="panel-itinerary" role="tabpanel" aria-labelledby="tab-itinerary" hidden={activeTab !== 'itinerary'}>
            <ItineraryPlanner destinationId={destinationId} onDestinationChange={onDestinationChange} />
          </div>

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
                    placeholder="Tìm câu trong sổ tay giao tiếp..."
                  />
                </div>

                {/* Target Language Toggle */}
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                  <span id="target-lang-label" className="text-xs font-semibold text-slate-300">Dịch Sang:</span>
                  <div role="group" aria-labelledby="target-lang-label" className="flex flex-wrap items-center gap-2">
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
                    <span className="text-xs font-bold text-indigo-400">Bản dịch trong sổ tay</span>
                    <button
                      type="button"
                      onClick={handlePronounce}
                      disabled={!sampleTranslations[sourceText]?.[targetLang]}
                      aria-label="Phát âm câu dịch chuẩn giọng bản xứ"
                      className={`text-xs hover:text-white flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-indigo-400 focus:outline-none cursor-pointer transition-colors ${
                        isSpeaking ? 'text-primary font-bold animate-pulse' : 'text-slate-400'
                      }`}
                    >
                      <Volume2 className="w-4 h-4 text-indigo-400" aria-hidden="true" />
                      <span>{isSpeaking ? 'Đang phát âm...' : 'Nghe phát âm'}</span>
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
