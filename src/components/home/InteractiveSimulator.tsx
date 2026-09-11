import { ItineraryPlanner } from './ItineraryPlanner';
import React, { useEffect, useState } from 'react';
import {
  Compass,
  Languages,
  Camera,
  Volume2,
  ArrowRight,
  Video,
  VideoOff,
  Upload,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ScanLine,
  Utensils,
  KeyRound,
  FileText,
} from 'lucide-react';
import { useFoodScanner } from '../../hooks/useFoodScanner';
import { useTravelTranslator } from '../../hooks/useTravelTranslator';
import { SUPPORTED_LANGUAGES } from '../../core/domain/translation/entity';

export const InteractiveSimulator = ({
  destinationId,
  onDestinationChange,
  openSignal,
}: {
  openSignal: number;
  destinationId: string;
  onDestinationChange: (id: string) => void;
}) => {
  const [activeTab, setActiveTab] = useState<'itinerary' | 'translate' | 'ocr'>('itinerary');

  useEffect(() => {
    setActiveTab('itinerary');
  }, [openSignal]);

  // Hook 1: Travel Translator (Clean Architecture Presenter Hook)
  const translator = useTravelTranslator();

  // Hook 2: Food & Menu Vision Scanner (Clean Architecture Presenter Hook)
  const scanner = useFoodScanner();

  // Clean up camera stream when switching away from OCR tab
  useEffect(() => {
    if (activeTab !== 'ocr') {
      scanner.stopCamera();
    }
  }, [activeTab, scanner]);

  return (
    <section id="demo" aria-labelledby="demo-heading" className="pt-12 pb-20 sm:pt-16 sm:pb-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 id="demo-heading" className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
            Trải Nghiệm Các Tính Năng Cốt Lõi
          </h2>
          <p className="text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Lên lịch trình với AI ngay trên trình duyệt, sổ tay dịch thuật đa ngôn ngữ và camera nhận diện món ăn thời gian thực.
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
              const next =
                event.key === 'Home'
                  ? 0
                  : event.key === 'End'
                  ? 2
                  : (current + (event.key === 'ArrowRight' ? 1 : 2)) % 3;
              setActiveTab(tabs[next]);
              document.getElementById('tab-' + tabs[next])?.focus();
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
              className={'flex-1 min-w-[165px] py-4 px-6 text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 transition-all border-b-2 focus-visible:ring-2 focus-visible:ring-primary focus:outline-none ' + (
                activeTab === 'itinerary'
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40'
              )}
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
              className={'flex-1 min-w-[165px] py-4 px-6 text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 transition-all border-b-2 focus-visible:ring-2 focus-visible:ring-primary focus:outline-none ' + (
                activeTab === 'translate'
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40'
              )}
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
              className={'flex-1 min-w-[165px] py-4 px-6 text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 transition-all border-b-2 focus-visible:ring-2 focus-visible:ring-primary focus:outline-none ' + (
                activeTab === 'ocr'
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40'
              )}
            >
              <Camera className="w-4 h-4" aria-hidden="true" />
              <span>Camera Nhận Diện Món Ăn</span>
            </button>
          </div>

          {/* Tab 1: Itinerary Planner */}
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
                    <span className="text-[11px] text-primary">Nguồn: Tiếng Việt</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {translator.samplePhrases.map((phrase) => (
                      <button
                        key={phrase}
                        onClick={() => {
                          translator.setSourceText(phrase);
                          translator.performTranslation(phrase, translator.targetLang);
                        }}
                        className={'text-xs px-3 py-1.5 rounded-xl border transition-all text-left focus-visible:ring-2 focus-visible:ring-primary focus:outline-none ' + (
                          translator.sourceText === phrase
                            ? 'bg-primary/10 border-primary text-primary'
                            : 'bg-surface-light border-border-subtle text-slate-300 hover:bg-slate-800'
                        )}
                      >
                        "{phrase}"
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <textarea
                      id="sim-source-text"
                      rows={2}
                      value={translator.sourceText}
                      onChange={(e) => translator.setSourceText(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-surface-light border border-border-subtle text-xs sm:text-sm text-white focus:outline-none focus:border-primary resize-none"
                      placeholder="Nhập câu tiếng Việt cần dịch..."
                    />
                    <button
                      type="button"
                      onClick={() => translator.performTranslation(translator.sourceText, translator.targetLang)}
                      disabled={translator.isTranslating || !translator.sourceText.trim()}
                      className="absolute right-2.5 bottom-3 px-3 py-1 bg-primary text-slate-950 rounded-lg text-xs font-bold hover:bg-primary-hover transition-colors flex items-center gap-1 disabled:opacity-50"
                    >
                      {translator.isTranslating ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                      )}
                      <span>Dịch AI</span>
                    </button>
                  </div>
                </div>

                {/* Target Language Toggle */}
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                  <span id="target-lang-label" className="text-xs font-semibold text-slate-300">
                    Dịch Sang:
                  </span>
                  <div role="group" aria-labelledby="target-lang-label" className="flex flex-wrap items-center gap-2">
                    {SUPPORTED_LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => {
                          translator.setTargetLang(l.code);
                          translator.performTranslation(translator.sourceText, l.code);
                        }}
                        aria-pressed={translator.targetLang === l.code}
                        className={'px-3 py-1.5 rounded-full text-xs font-semibold transition-all border focus-visible:ring-2 focus-visible:ring-indigo-400 focus:outline-none ' + (
                          translator.targetLang === l.code
                            ? 'bg-indigo-500 text-white border-indigo-500 shadow-md shadow-indigo-500/25'
                            : 'bg-surface-light text-slate-300 border-border-subtle hover:bg-slate-800'
                        )}
                      >
                        {l.label} ({l.nativeLabel})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Output Translation Box */}
                <div className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-indigo-400">Bản dịch sổ tay AI</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {translator.translateSource === 'cloudflare-workers-ai'
                          ? 'Cloudflare Workers AI'
                          : 'Sổ tay bản xứ'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={translator.handlePronounce}
                      disabled={!translator.translatedText}
                      aria-label="Phát âm câu dịch chuẩn giọng bản xứ"
                      className={'text-xs hover:text-white flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-indigo-400 focus:outline-none cursor-pointer transition-colors ' + (
                        translator.isSpeaking ? 'text-primary font-bold animate-pulse' : 'text-slate-400'
                      )}
                    >
                      <Volume2 className="w-4 h-4 text-indigo-400" aria-hidden="true" />
                      <span>{translator.isSpeaking ? 'Đang phát âm...' : 'Nghe phát âm'}</span>
                    </button>
                  </div>

                  {translator.isTranslating ? (
                    <div className="py-4 flex items-center gap-2 text-slate-400 text-sm">
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                      <span>Đang kết nối Cloudflare Workers AI để dịch...</span>
                    </div>
                  ) : (
                    <div>
                      <p className="text-base sm:text-lg font-bold text-white tracking-wide">
                        {translator.translatedText || 'Nhập câu để xem bản dịch.'}
                      </p>
                      {translator.pronunciation && (
                        <p className="text-xs sm:text-sm text-indigo-300/80 mt-1 italic font-mono">
                          Cách đọc: {translator.pronunciation}
                        </p>
                      )}
                    </div>
                  )}
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
              {/* Scan Mode Toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-light/60 p-2.5 rounded-2xl border border-border-subtle">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => scanner.setScanMode('dish')}
                    className={'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ' + (
                      scanner.scanMode === 'dish'
                        ? 'bg-primary text-slate-950 shadow-md shadow-primary/25'
                        : 'text-slate-400 hover:text-white'
                    )}
                  >
                    <Utensils className="w-3.5 h-3.5" />
                    <span>Quét Đĩa Thức Ăn Thực Tế</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => scanner.setScanMode('menu')}
                    className={'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ' + (
                      scanner.scanMode === 'menu'
                        ? 'bg-primary text-slate-950 shadow-md shadow-primary/25'
                        : 'text-slate-400 hover:text-white'
                    )}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Quét Thực Đơn / Biển Hiệu</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => scanner.setShowKeyInput(!scanner.showKeyInput)}
                    className="text-[11px] text-slate-400 hover:text-primary flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-slate-800"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>{scanner.userApiKey ? 'Đã nối OpenAI Key' : 'Tùy chọn OpenAI Key'}</span>
                  </button>
                </div>
              </div>

              {/* Custom API Key Form */}
              {scanner.showKeyInput && (
                <div className="p-3.5 bg-slate-900 border border-border-subtle rounded-2xl space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">Khóa OpenAI API (Tùy chọn, GPT-4o-mini Vision):</span>
                    <span className="text-[10px] text-slate-400">Lưu an toàn trên trình duyệt</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={scanner.userApiKey}
                      onChange={(e) => scanner.handleKeySave(e.target.value)}
                      placeholder="sk-proj-..."
                      className="flex-1 px-3 py-1.5 bg-surface-light border border-border-subtle rounded-xl text-xs text-white focus:outline-none focus:border-primary font-mono"
                    />
                    {scanner.userApiKey && (
                      <button
                        type="button"
                        onClick={() => scanner.handleKeySave('')}
                        className="px-2.5 py-1 text-xs text-rose-400 hover:bg-rose-950/40 rounded-lg"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Nếu để trống, hệ thống sử dụng Cloudflare Workers AI hoặc bộ thị giác thông minh Traveling Vision mặc định.
                  </p>
                </div>
              )}

              {/* Viewfinder Frame */}
              <div className="relative rounded-2xl overflow-hidden border-2 border-primary/50 bg-slate-950 min-h-[320px] flex flex-col justify-center items-center">
                {/* HUD Corner Reticles */}
                <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-primary pointer-events-none z-10" />
                <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-primary pointer-events-none z-10" />
                <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-primary pointer-events-none z-10" />
                <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-primary pointer-events-none z-10" />

                {/* Animated Scanner Laser */}
                {scanner.isScanning && (
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse shadow-[0_0_20px_#34d399] z-30" />
                )}

                {/* Video Stream Element */}
                <video
                  ref={scanner.videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={'w-full max-h-[400px] object-cover ' + (
                    scanner.isCameraActive ? 'block' : 'hidden'
                  )}
                />

                {/* Captured Image Preview */}
                {!scanner.isCameraActive && scanner.capturedImage && (
                  <div className="relative w-full max-h-[400px] overflow-hidden flex items-center justify-center bg-black/70">
                    <img
                      src={scanner.capturedImage}
                      alt="Ảnh thực phẩm hoặc thực đơn vừa nạp"
                      className="max-h-[380px] w-full object-contain"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-slate-900/90 border border-primary/30 rounded-lg text-[11px] text-white flex items-center gap-1.5 z-10">
                      <ScanLine className="w-3.5 h-3.5 text-primary" />
                      <span>{scanner.scanMode === 'dish' ? 'Ảnh món ăn đang phân tích' : 'Ảnh thực đơn đang phân tích'}</span>
                    </div>
                  </div>
                )}

                {/* Hidden Canvas for Frame Capture */}
                <canvas ref={scanner.canvasRef} className="hidden" />

                {/* Camera Inactive Placeholder */}
                {!scanner.isCameraActive && !scanner.capturedImage && (
                  <div className="p-8 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto text-primary">
                      <Camera className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-base">
                        {scanner.scanMode === 'dish' ? 'Ống Kính Nhận Diện Món Ăn Thực Tế' : 'Ống Kính Quét Thực Đơn & Biển Hiệu'}
                      </h4>
                      <p className="text-xs text-slate-400 max-w-md mt-1 mx-auto leading-relaxed">
                        Bật camera hướng vào đĩa thức ăn, tải ảnh chụp bất kỳ từ thiết bị, hoặc chọn các món mẫu bên dưới để xem AI phân tích thành phần và giá cả.
                      </p>
                    </div>
                  </div>
                )}

                {/* Floating Capture Button when Camera is Active */}
                {scanner.isCameraActive && (
                  <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-3 z-20 pointer-events-auto">
                    <button
                      type="button"
                      onClick={scanner.captureAndScan}
                      disabled={scanner.isScanning}
                      className="px-6 py-2.5 rounded-full bg-emerald-500 text-slate-950 font-extrabold text-sm hover:bg-emerald-400 transition-all flex items-center gap-2 shadow-xl shadow-emerald-500/40 border-2 border-white/40 active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      {scanner.isScanning ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4" />
                      )}
                      <span>{scanner.isScanning ? 'Đang phân tích...' : '📸 Chụp & Nhận Diện Món Này'}</span>
                    </button>
                  </div>
                )}

                {scanner.cameraError && (
                  <div className="absolute bottom-3 inset-x-3 bg-rose-950/90 border border-rose-500/50 rounded-xl p-3 text-xs text-rose-200 flex items-center gap-2 z-20">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{scanner.cameraError}</span>
                  </div>
                )}
              </div>

              {/* Action Toolbar */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {!scanner.isCameraActive ? (
                      <button
                        type="button"
                        onClick={scanner.startCamera}
                        className="px-4 py-2 rounded-xl bg-primary text-slate-950 text-xs font-bold hover:bg-primary-hover transition-all flex items-center gap-1.5 shadow-md shadow-primary/20"
                      >
                        <Video className="w-4 h-4" />
                        <span>Bật Camera Quét</span>
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={scanner.captureAndScan}
                          disabled={scanner.isScanning}
                          className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20 disabled:opacity-50"
                        >
                          {scanner.isScanning ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Camera className="w-4 h-4" />
                          )}
                          <span>{scanner.isScanning ? 'Đang quét...' : 'Chụp & Quét AI'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={scanner.stopCamera}
                          className="px-3 py-2 rounded-xl bg-surface-light border border-border-subtle text-xs text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
                        >
                          <VideoOff className="w-4 h-4 text-rose-400" />
                          <span>Tắt Camera</span>
                        </button>
                        <label className="flex items-center gap-1.5 text-xs text-slate-300 ml-1 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={scanner.autoScan}
                            onChange={(e) => scanner.setAutoScan(e.target.checked)}
                            className="rounded border-slate-700 text-primary focus:ring-primary h-3.5 w-3.5"
                          />
                          <span>Tự động quét mỗi 4s</span>
                        </label>
                      </>
                    )}

                    {/* Hidden File Input */}
                    <input
                      ref={scanner.fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={scanner.handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => scanner.fileInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl bg-surface-light border border-border-subtle text-xs text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
                    >
                      <Upload className="w-4 h-4 text-indigo-400" />
                      <span>Tải ảnh từ máy</span>
                    </button>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Nguồn: {scanner.ocrSource === 'openai-gpt-4o-mini-vision' ? 'OpenAI GPT-4o-mini Vision' : scanner.ocrSource === 'cloudflare-vision-ai' ? 'Cloudflare Vision AI' : 'Traveling Vision Engine'}</span>
                  </div>
                </div>

                {/* Quick Sample Presets */}
                <div className="pt-2 border-t border-border-subtle">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-300">
                      Chọn Nhanh Món Mẫu Để Trải Nghiệm Nhận Diện:
                    </span>
                    <span className="text-[11px] text-primary">{scanner.detectedLanguage}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => scanner.handleSampleMenuClick('japanese')}
                      className="px-3 py-1.5 rounded-xl border border-border-subtle bg-surface-light text-xs font-medium text-slate-300 hover:text-white hover:border-primary/50 transition-all flex items-center gap-1.5"
                    >
                      <span>🍜</span>
                      <span>Món Nhật Bản</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => scanner.handleSampleMenuClick('korean')}
                      className="px-3 py-1.5 rounded-xl border border-border-subtle bg-surface-light text-xs font-medium text-slate-300 hover:text-white hover:border-primary/50 transition-all flex items-center gap-1.5"
                    >
                      <span>🥩</span>
                      <span>Món Hàn Quốc</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => scanner.handleSampleMenuClick('western')}
                      className="px-3 py-1.5 rounded-xl border border-border-subtle bg-surface-light text-xs font-medium text-slate-300 hover:text-white hover:border-primary/50 transition-all flex items-center gap-1.5"
                    >
                      <span>🥐</span>
                      <span>Ẩm Thực Âu & Bistro</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => scanner.handleSampleMenuClick('vietnamese')}
                      className="px-3 py-1.5 rounded-xl border border-border-subtle bg-surface-light text-xs font-medium text-slate-300 hover:text-white hover:border-primary/50 transition-all flex items-center gap-1.5"
                    >
                      <span>🍲</span>
                      <span>Đặc Sản Việt Nam</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => scanner.handleSampleMenuClick('dessert')}
                      className="px-3 py-1.5 rounded-xl border border-border-subtle bg-surface-light text-xs font-medium text-slate-300 hover:text-white hover:border-primary/50 transition-all flex items-center gap-1.5"
                    >
                      <span>🍰</span>
                      <span>Tráng Miệng & Cà Phê</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Status Notice */}
              {scanner.scanMessage && (
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{scanner.scanMessage}</span>
                </div>
              )}

              {/* OCR Recognition Results */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span>KẾT QUẢ NHẬN DIỆN VÀ DỊCH NGHĨA ({scanner.ocrItems.length} MÓN):</span>
                  {scanner.isScanning && (
                    <span className="text-primary flex items-center gap-1">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Đang xử lý thị giác máy tính...
                    </span>
                  )}
                </div>

                <div className="grid gap-3">
                  {scanner.ocrItems.map((item, i) => (
                    <div
                      key={i}
                      className="relative p-4 rounded-xl border border-primary/30 bg-primary/5 backdrop-blur-sm flex flex-col justify-between gap-3 transition-all hover:bg-primary/10"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-primary text-slate-950 font-bold">
                              AI ĐÃ NHẬN DIỆN
                            </span>
                            {item.category && (
                              <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                                {item.category}
                              </span>
                            )}
                            <span className="text-sm font-bold text-slate-200">{item.original}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ArrowRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span className="text-sm font-semibold text-emerald-400">{item.translated}</span>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 shrink-0">
                          <span className="text-xs font-mono text-amber-400 font-bold">
                            {item.price}
                          </span>
                          {typeof item.confidence === 'number' && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              Độ tin cậy: {(item.confidence * 100).toFixed(0)}%
                            </span>
                          )}
                        </div>
                      </div>

                      {item.description && (
                        <div className="pt-2 border-t border-primary/10 text-xs text-slate-300/90 leading-relaxed italic">
                          "{item.description}"
                        </div>
                      )}
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
