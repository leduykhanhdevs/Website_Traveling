import { ItineraryPlanner } from './ItineraryPlanner';
import React, { useEffect, useRef, useState, useCallback } from 'react';
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
} from 'lucide-react';

interface OcrItem {
  original: string;
  translated: string;
  price: string;
  confidence?: number;
  category?: string;
}

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

  // ========================================================
  // TAB 2: TRANSLATOR STATE & API INTEGRATION
  // ========================================================
  const [sourceText, setSourceText] = useState<string>(
    'Xin chào, cho tôi hỏi quán cà phê ngon gần đây nhất ở đâu?'
  );
  const [targetLang, setTargetLang] = useState<string>('ja');
  const [translatedText, setTranslatedText] = useState<string>(
    'こんにちは、この近くで一番美味しいカフェはどこですか？'
  );
  const [pronunciation, setPronunciation] = useState<string>(
    'Konnichiwa, kono chikaku de ichiban oishii kafe wa doko desu ka?'
  );
  const [translateSource, setTranslateSource] = useState<string>('handbook-dictionary');
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const samplePhrases = [
    'Xin chào, cho tôi hỏi quán cà phê ngon gần đây nhất ở đâu?',
    'Món này có cay không? Tôi ăn chay',
    'Bao nhiêu tiền một vé vào cổng?',
    'Cho tôi xin hóa đơn thanh toán',
  ];

  // Perform translation via Cloudflare Workers AI API with fallback
  const performTranslation = useCallback(async (text: string, lang: string) => {
    if (!text.trim()) {
      setTranslatedText('');
      setPronunciation('');
      return;
    }

    setIsTranslating(true);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLang: lang }),
      });

      if (res.ok) {
        const data = await res.json();
        setTranslatedText(data.translatedText || '');
        setPronunciation(data.pronunciation || '');
        setTranslateSource(data.source || 'cloudflare-workers-ai');
      } else {
        throw new Error('API translate error');
      }
    } catch {
      // Fallback local dictionary if offline or preview
      const localDict: Record<string, Record<string, { trans: string; pron: string }>> = {
        'Xin chào, cho tôi hỏi quán cà phê ngon gần đây nhất ở đâu?': {
          ja: { trans: 'こんにちは、この近くで一番美味しいカフェはどこですか？', pron: 'Konnichiwa, kono chikaku de...' },
          ko: { trans: '안녕하세요, 이 근처에서 가장 맛있는 카페가 어디인가요?', pron: 'Annyeonghaseyo...' },
          en: { trans: 'Hello, could you tell me where the best cafe nearby is?', pron: 'He-loh...' },
          fr: { trans: 'Bonjour, pourriez-vous me dire où se trouve le meilleur café à proximité ?', pron: 'Bon-zhoor...' },
        },
        'Món này có cay không? Tôi ăn chay': {
          ja: { trans: 'この料理は辛いですか？私はベジタリアンです。', pron: 'Kono ryōri wa karai desu ka? Watashi wa bejitarian desu.' },
          ko: { trans: '이 음식은 맵나요? 저는 채식주의자입니다.', pron: 'I eumsig-eun maebnayo?' },
          en: { trans: 'Is this dish spicy? I am a vegetarian.', pron: 'Is this dish spicy?' },
          fr: { trans: 'Ce plat est-il épicé ? Je suis végétarien.', pron: 'Ce plat est-il épicé ?' },
        },
      };
      const found = localDict[text]?.[lang];
      if (found) {
        setTranslatedText(found.trans);
        setPronunciation(found.pron);
        setTranslateSource('handbook-dictionary');
      } else {
        setTranslatedText('[' + lang.toUpperCase() + '] ' + text);
        setPronunciation('');
        setTranslateSource('fallback');
      }
    } finally {
      setIsTranslating(false);
    }
  }, []);

  // Pronounce audio
  const handlePronounce = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && translatedText) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(translatedText);
      const langMap: Record<string, string> = {
        ja: 'ja-JP',
        ko: 'ko-KR',
        en: 'en-US',
        fr: 'fr-FR',
        zh: 'zh-CN',
      };
      utterance.lang = langMap[targetLang] || 'en-US';
      utterance.rate = 0.9;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, [sourceText, targetLang, activeTab]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // ========================================================
  // TAB 3: CAMERA OCR SCANNER STATE & VIDEO STREAM
  // ========================================================
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [ocrSource, setOcrSource] = useState<string>('traveling-vision-engine');
  const [ocrItems, setOcrItems] = useState<OcrItem[]>([
    {
      original: '特選 黒毛和牛ラーメン',
      translated: 'Ramen Thịt Bò Wagyu Hảo Hạng',
      price: '1,450 ¥ (~240.000 đ)',
      confidence: 0.98,
      category: 'Món chính',
    },
    {
      original: '自家製 焼き餃子 (6個)',
      translated: 'Há Cảo Áp Chảo Nhà Làm (6 cái)',
      price: '520 ¥ (~86.000 đ)',
      confidence: 0.96,
      category: 'Khai vị',
    },
    {
      original: '宇治 抹茶アイスクリーム',
      translated: 'Kem Trà Xanh Matcha Uji Đậm Vị',
      price: '380 ¥ (~63.000 đ)',
      confidence: 0.99,
      category: 'Tráng miệng',
    },
  ]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Turn off camera tracks
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  // Turn on camera stream
  const startCamera = async () => {
    setCameraError('');
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setCameraError('Trình duyệt hoặc thiết bị chưa hỗ trợ truy cập Camera trực tiếp.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setIsCameraActive(true);
      setCapturedImage(null);
    } catch (err: any) {
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        setCameraError('Bạn đã từ chối quyền truy cập Camera. Hãy cấp quyền hoặc tải ảnh lên.');
      } else {
        setCameraError('Không thể mở Camera trên thiết bị này. Bạn có thể tải ảnh từ máy.');
      }
      setIsCameraActive(false);
    }
  };

  // Run OCR on an image data URL
  const runOcr = async (imageDataUrl: string) => {
    setIsScanning(true);
    try {
      const res = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageDataUrl }),
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.items) && data.items.length > 0) {
          setOcrItems(data.items);
          setOcrSource(data.source || 'cloudflare-vision-ai');
        }
      }
    } catch {
      // Keep existing items if offline
    } finally {
      setIsScanning(false);
    }
  };

  // Capture current frame from camera video
  const captureAndScan = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(dataUrl);
    runOcr(dataUrl);
  };

  // Handle uploaded file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setCapturedImage(result);
      stopCamera();
      runOcr(result);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Cleanup camera stream when switching tabs or unmounting
  useEffect(() => {
    if (activeTab !== 'ocr') {
      stopCamera();
    }
  }, [activeTab, stopCamera]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <section id="demo" aria-labelledby="demo-heading" className="pt-12 pb-20 sm:pt-16 sm:pb-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 id="demo-heading" className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
            Trải Nghiệm Các Tính Năng Cốt Lõi
          </h2>
          <p className="text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Lên lịch trình với AI ngay trên trình duyệt, sổ tay dịch thuật đa ngôn ngữ và camera nhận diện thực đơn thời gian thực.
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
              <span>Camera OCR thực đơn</span>
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
                    {samplePhrases.map((phrase) => (
                      <button
                        key={phrase}
                        onClick={() => {
                          setSourceText(phrase);
                          performTranslation(phrase, targetLang);
                        }}
                        className={'text-xs px-3 py-1.5 rounded-xl border transition-all text-left focus-visible:ring-2 focus-visible:ring-primary focus:outline-none ' + (
                          sourceText === phrase
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
                      value={sourceText}
                      onChange={(e) => setSourceText(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-surface-light border border-border-subtle text-xs sm:text-sm text-white focus:outline-none focus:border-primary resize-none"
                      placeholder="Nhập câu tiếng Việt cần dịch..."
                    />
                    <button
                      type="button"
                      onClick={() => performTranslation(sourceText, targetLang)}
                      disabled={isTranslating || !sourceText.trim()}
                      className="absolute right-2.5 bottom-3 px-3 py-1 bg-primary text-slate-950 rounded-lg text-xs font-bold hover:bg-primary-hover transition-colors flex items-center gap-1 disabled:opacity-50"
                    >
                      {isTranslating ? (
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
                    {[
                      { code: 'ja', label: 'Tiếng Nhật (日本語)' },
                      { code: 'ko', label: 'Tiếng Hàn (한국어)' },
                      { code: 'en', label: 'Tiếng Anh (English)' },
                      { code: 'fr', label: 'Tiếng Pháp (Français)' },
                      { code: 'zh', label: 'Tiếng Trung (中文)' },
                    ].map((l) => (
                      <button
                        key={l.code}
                        onClick={() => {
                          setTargetLang(l.code);
                          performTranslation(sourceText, l.code);
                        }}
                        aria-pressed={targetLang === l.code}
                        className={'px-3 py-1.5 rounded-full text-xs font-semibold transition-all border focus-visible:ring-2 focus-visible:ring-indigo-400 focus:outline-none ' + (
                          targetLang === l.code
                            ? 'bg-indigo-500 text-white border-indigo-500 shadow-md shadow-indigo-500/25'
                            : 'bg-surface-light text-slate-300 border-border-subtle hover:bg-slate-800'
                        )}
                      >
                        {l.label}
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
                        {translateSource === 'cloudflare-workers-ai'
                          ? 'Cloudflare Workers AI'
                          : 'Sổ tay bản xứ'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handlePronounce}
                      disabled={!translatedText}
                      aria-label="Phát âm câu dịch chuẩn giọng bản xứ"
                      className={'text-xs hover:text-white flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-indigo-400 focus:outline-none cursor-pointer transition-colors ' + (
                        isSpeaking ? 'text-primary font-bold animate-pulse' : 'text-slate-400'
                      )}
                    >
                      <Volume2 className="w-4 h-4 text-indigo-400" aria-hidden="true" />
                      <span>{isSpeaking ? 'Đang phát âm...' : 'Nghe phát âm'}</span>
                    </button>
                  </div>

                  {isTranslating ? (
                    <div className="py-4 flex items-center gap-2 text-slate-400 text-sm">
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                      <span>Đang kết nối Cloudflare Workers AI để dịch...</span>
                    </div>
                  ) : (
                    <div>
                      <p className="text-base sm:text-lg font-bold text-white tracking-wide">
                        {translatedText || 'Nhập câu để xem bản dịch.'}
                      </p>
                      {pronunciation && (
                        <p className="text-xs sm:text-sm text-indigo-300/80 mt-1 italic font-mono">
                          Cách đọc: {pronunciation}
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
                <span>
                  Mô phỏng ống kính camera di động nhận diện và dịch trực tiếp các ký tự trên thực đơn tiếng Nhật / Hàn:
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-primary flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Cloudflare Vision Engine
                  </span>
                </div>
              </div>

              {/* Viewfinder Frame */}
              <div className="relative rounded-2xl overflow-hidden border-2 border-primary/50 bg-slate-950 min-h-[300px] flex flex-col justify-center items-center">
                {/* HUD Corner Reticles */}
                <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-primary pointer-events-none z-10" />
                <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-primary pointer-events-none z-10" />
                <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-primary pointer-events-none z-10" />
                <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-primary pointer-events-none z-10" />

                {/* Animated Scanner Laser */}
                {isScanning && (
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse shadow-[0_0_15px_#38bdf8] z-20" />
                )}

                {/* Video Stream Element */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={'w-full max-h-[380px] object-cover ' + (
                    isCameraActive ? 'block' : 'hidden'
                  )}
                />

                {/* Captured Image Preview */}
                {!isCameraActive && capturedImage && (
                  <div className="relative w-full max-h-[380px] overflow-hidden flex items-center justify-center bg-black/60">
                    <img
                      src={capturedImage}
                      alt="Ảnh thực đơn vừa chụp"
                      className="max-h-[380px] w-full object-contain"
                    />
                    <div className="absolute top-3 left-3 px-2 py-1 bg-slate-900/80 rounded text-[11px] text-white">
                      Ảnh đã nạp vào bộ nhận diện
                    </div>
                  </div>
                )}

                {/* Hidden Canvas for Frame Capture */}
                <canvas ref={canvasRef} className="hidden" />

                {/* Camera Inactive Placeholder */}
                {!isCameraActive && !capturedImage && (
                  <div className="p-8 text-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto text-primary">
                      <Camera className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-base">Ống kính OCR Du Lịch</h4>
                      <p className="text-xs text-slate-400 max-w-sm mt-1">
                        Bật camera để quét thực đơn món ăn trực tiếp, hoặc tải ảnh chụp bất kỳ từ thiết bị của bạn.
                      </p>
                    </div>
                  </div>
                )}

                {cameraError && (
                  <div className="absolute bottom-3 inset-x-3 bg-rose-950/90 border border-rose-500/50 rounded-xl p-3 text-xs text-rose-200 flex items-center gap-2 z-20">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{cameraError}</span>
                  </div>
                )}
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex flex-wrap items-center gap-2">
                  {!isCameraActive ? (
                    <button
                      type="button"
                      onClick={startCamera}
                      className="px-4 py-2 rounded-xl bg-primary text-slate-950 text-xs font-bold hover:bg-primary-hover transition-all flex items-center gap-1.5 shadow-md shadow-primary/20"
                    >
                      <Video className="w-4 h-4" />
                      <span>Bật Camera Quét</span>
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={captureAndScan}
                        disabled={isScanning}
                        className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20 disabled:opacity-50"
                      >
                        {isScanning ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Camera className="w-4 h-4" />
                        )}
                        <span>{isScanning ? 'Đang phân tích...' : 'Chụp & Quét AI'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="px-3 py-2 rounded-xl bg-surface-light border border-border-subtle text-xs text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
                      >
                        <VideoOff className="w-4 h-4 text-rose-400" />
                        <span>Tắt Camera</span>
                      </button>
                    </>
                  )}

                  {/* Hidden File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-surface-light border border-border-subtle text-xs text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
                  >
                    <Upload className="w-4 h-4 text-indigo-400" />
                    <span>Tải ảnh từ máy</span>
                  </button>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Nguồn: {ocrSource === 'cloudflare-vision-ai' ? 'Cloudflare Vision AI' : 'Bộ dữ liệu mô phỏng'}</span>
                </div>
              </div>

              {/* OCR Recognition Results */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span>KẾT QUẢ NHẬN DIỆN VÀ DỊCH NGHĨA ({ocrItems.length} MỤC):</span>
                  {isScanning && (
                    <span className="text-primary flex items-center gap-1">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Đang xử lý thị giác máy tính...
                    </span>
                  )}
                </div>

                <div className="grid gap-3">
                  {ocrItems.map((item, i) => (
                    <div
                      key={i}
                      className="relative p-3.5 rounded-xl border border-primary/30 bg-primary/5 backdrop-blur-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-all hover:bg-primary/10"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-primary text-slate-950 font-bold">
                            OCR ĐÃ QUÉT
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

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1">
                        <span className="text-xs font-mono text-amber-400 font-bold">
                          {item.price}
                        </span>
                        {typeof item.confidence === 'number' && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            Độ chính xác: {(item.confidence * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
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
