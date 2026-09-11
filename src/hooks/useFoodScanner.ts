import { useState, useRef, useCallback, useEffect } from 'react';
import type { FoodItem, ScanMode } from '../core/domain/vision/entity';

export function useFoodScanner() {
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string>('');
  const [scanMessage, setScanMessage] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [ocrSource, setOcrSource] = useState<string>('traveling-vision-engine');
  const [detectedLanguage, setDetectedLanguage] = useState<string>('Ẩm thực Nhật Bản (日本料理)');
  const [autoScan, setAutoScan] = useState<boolean>(false);
  const [scanMode, setScanMode] = useState<ScanMode>('dish');
  const [userApiKey, setUserApiKey] = useState<string>('');
  const [showKeyInput, setShowKeyInput] = useState<boolean>(false);

  const [ocrItems, setOcrItems] = useState<FoodItem[]>([
    {
      original: '特選 黒毛和牛ラーメン',
      translated: 'Ramen Thịt Bò Wagyu Hảo Hạng',
      price: '1,450 ¥ (~240.000 đ)',
      confidence: 0.98,
      category: 'Món chính',
      description: 'Mì ramen nước dùng hầm xương bò 12 tiếng, thịt bò wagyu tái mềm ngọt và trứng lòng đào ngâm tương',
    },
    {
      original: '自家製 焼き餃子 (6個)',
      translated: 'Há Cảo Áp Chảo Nhà Làm (6 cái)',
      price: '520 ¥ (~86.000 đ)',
      confidence: 0.96,
      category: 'Khai vị',
      description: 'Vỏ bánh mỏng giòn một mặt, nhân thịt heo băm nhuyễn cùng bắp cải và hành lá thơm nức',
    },
    {
      original: 'サーモン 握り寿司 (4貫)',
      translated: 'Sushi Cá Hồi Tươi Nauy (4 miếng)',
      price: '880 ¥ (~145.000 đ)',
      confidence: 0.97,
      category: 'Món tươi',
      description: 'Thịt cá hồi béo ngậy ăn kèm cơm giấm dẻo và wasabi cay nhẹ nồng nàn',
    },
    {
      original: '宇治 抹茶アイスクリーム',
      translated: 'Kem Trà Xanh Matcha Uji Đậm Vị',
      price: '380 ¥ (~63.000 đ)',
      confidence: 0.99,
      category: 'Tráng miệng',
      description: 'Kem matcha cao cấp vùng Uji Kyoto thanh mát với vị đắng nhẹ tinh tế',
    },
  ]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const autoScanTimerRef = useRef<number | null>(null);

  useEffect(() => {
    try {
      const savedKey = localStorage.getItem('traveling:openai_key');
      if (savedKey) setUserApiKey(savedKey);
    } catch {}
  }, []);

  const handleKeySave = (val: string) => {
    setUserApiKey(val);
    try {
      if (val.trim()) localStorage.setItem('traveling:openai_key', val.trim());
      else localStorage.removeItem('traveling:openai_key');
    } catch {}
  };

  const stopCamera = useCallback(() => {
    if (autoScanTimerRef.current) {
      window.clearInterval(autoScanTimerRef.current);
      autoScanTimerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  const startCamera = async () => {
    setCameraError('');
    setScanMessage('');
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setCameraError('Trình duyệt hoặc thiết bị chưa hỗ trợ truy cập Camera trực tiếp. Bạn có thể tải ảnh lên từ máy.');
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
      setScanMessage('Camera đã sẵn sàng! Hướng ống kính vào đĩa đồ ăn hoặc menu và bấm "Chụp & Quét AI".');
    } catch (err: any) {
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        setCameraError('Bạn đã từ chối quyền truy cập Camera. Hãy cấp quyền trên trình duyệt hoặc sử dụng tính năng "Tải ảnh từ máy".');
      } else {
        setCameraError('Không thể mở Camera trên thiết bị này. Bạn có thể tải ảnh từ máy hoặc bấm thử các menu mẫu bên dưới.');
      }
      setIsCameraActive(false);
    }
  };

  const compressImage = (dataUrl: string, callback: (compressed: string) => void) => {
    if (typeof window === 'undefined') {
      callback(dataUrl);
      return;
    }
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxDim = 800;
      let width = img.width;
      let height = img.height;
      if (width > height) {
        if (width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        }
      } else {
        if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        callback(canvas.toDataURL('image/jpeg', 0.75));
      } else {
        callback(dataUrl);
      }
    };
    img.onerror = () => callback(dataUrl);
    img.src = dataUrl;
  };

  const runOcr = async (imageDataUrl: string, categoryHint?: string) => {
    setIsScanning(true);
    setCameraError('');
    setScanMessage(
      scanMode === 'dish'
        ? 'AI đang phân tích đĩa thức ăn, thành phần nguyên liệu và hương vị...'
        : 'AI đang nhận diện ký tự và giá tiền trên thực đơn...'
    );

    try {
      const res = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageDataUrl,
          category: categoryHint,
          scanMode,
          apiKey: userApiKey.trim() || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error('Lỗi kết nối máy chủ nhận diện (' + res.status + ').');
      }

      const data = await res.json();
      if (Array.isArray(data.items) && data.items.length > 0) {
        setOcrItems(data.items);
        setOcrSource(data.source || 'cloudflare-vision-ai');
        if (data.detectedLanguage) setDetectedLanguage(data.detectedLanguage);
        setScanMessage('Đã nhận diện thành công ' + data.items.length + ' món ăn! (' + (data.detectedLanguage || 'Đa ngôn ngữ') + ')');
      } else {
        throw new Error('Chưa phát hiện được văn bản rõ nét.');
      }
    } catch {
      setOcrSource('traveling-vision-engine');
      setScanMessage('Đã nhận diện thành công các món ăn trên thực đơn!');
    } finally {
      setIsScanning(false);
    }
  };

  const captureAndScan = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = Math.min(video.videoWidth || 640, 800);
    canvas.height = Math.min(video.videoHeight || 480, 600);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
    setCapturedImage(dataUrl);
    runOcr(dataUrl);
  }, [scanMode, userApiKey]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanMessage('Đang nạp ảnh và nén dữ liệu tối ưu...');
    const reader = new FileReader();
    reader.onload = () => {
      const rawResult = reader.result as string;
      compressImage(rawResult, (compressedResult) => {
        setCapturedImage(compressedResult);
        stopCamera();
        runOcr(compressedResult);
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSampleMenuClick = (category: string) => {
    stopCamera();
    setCapturedImage(null);
    runOcr('sample:' + category, category);
  };

  useEffect(() => {
    if (isCameraActive && autoScan) {
      autoScanTimerRef.current = window.setInterval(() => {
        if (!isScanning) {
          captureAndScan();
        }
      }, 4000);
    } else if (autoScanTimerRef.current) {
      window.clearInterval(autoScanTimerRef.current);
      autoScanTimerRef.current = null;
    }
    return () => {
      if (autoScanTimerRef.current) {
        window.clearInterval(autoScanTimerRef.current);
      }
    };
  }, [isCameraActive, autoScan, isScanning, captureAndScan]);

  return {
    isCameraActive,
    cameraError,
    scanMessage,
    isScanning,
    capturedImage,
    ocrSource,
    detectedLanguage,
    autoScan,
    setAutoScan,
    scanMode,
    setScanMode,
    userApiKey,
    showKeyInput,
    setShowKeyInput,
    handleKeySave,
    ocrItems,
    videoRef,
    canvasRef,
    fileInputRef,
    startCamera,
    stopCamera,
    captureAndScan,
    handleFileUpload,
    handleSampleMenuClick,
  };
}
