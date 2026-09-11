import { useState, useCallback, useEffect } from 'react';
import type { TargetLanguageCode } from '../core/domain/translation/entity';

export function useTravelTranslator() {
  const [sourceText, setSourceText] = useState<string>(
    'Xin chào, cho tôi hỏi quán cà phê ngon gần đây nhất ở đâu?'
  );
  const [targetLang, setTargetLang] = useState<TargetLanguageCode>('ja');
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

  const performTranslation = useCallback(async (text: string, lang: TargetLanguageCode) => {
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
      setTranslatedText('[' + lang.toUpperCase() + '] ' + text);
      setPronunciation('');
      setTranslateSource('fallback');
    } finally {
      setIsTranslating(false);
    }
  }, []);

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
  }, [sourceText, targetLang]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return {
    sourceText,
    setSourceText,
    targetLang,
    setTargetLang,
    translatedText,
    pronunciation,
    translateSource,
    isTranslating,
    isSpeaking,
    samplePhrases,
    performTranslation,
    handlePronounce,
  };
}
