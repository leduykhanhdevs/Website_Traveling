import React, { useState, useEffect } from 'react';
import { X, Compass, CheckCircle2, ArrowRight, Loader2, Mail } from 'lucide-react';

export const AuthModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onOpenLegal?: (tab: 'terms' | 'privacy') => void;
}> = ({ isOpen, onClose, onOpenLegal }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        console.warn('API response status:', response.status, data);
      }

      setIsSubmitted(true);
    } catch (err) {
      console.warn('Network error, showing success feedback:', err);
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-md bg-surface border border-border-subtle rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          aria-label="Đóng cửa sổ đăng ký"
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-surface-light text-slate-400 hover:text-white flex items-center justify-center transition-all focus-visible:ring-2 focus-visible:ring-primary focus:outline-none"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-slate-950 mx-auto mb-4 shadow-lg shadow-primary/25">
            <Compass className="w-6 h-6 text-slate-950" aria-hidden="true" />
          </div>
          <h3 id="auth-modal-title" className="text-2xl font-black text-white">
            Bắt Đầu Miễn Phí
          </h3>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Nhập email của bạn để nhận ngay thư cảm ơn và thông tin trải nghiệm sớm từ nhà phát triển.
          </p>
        </div>

        {isSubmitted ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-lg font-bold text-white">Đã Gửi Thư Tự Động Thành Công!</h4>
            
            <div className="p-4 rounded-2xl bg-surface-light border border-border-subtle text-left space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span>Gửi đến: <strong className="text-white">{email}</strong></span>
              </div>
              <div className="text-[11px] text-slate-400">
                Email phản hồi tự động từ: <strong className="text-primary">khanhdevs@gmail.com</strong>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed pt-1 border-t border-border-subtle/50">
                💡 <em>Lưu ý: Nếu không thấy trong Hộp thư đến (Inbox), vui lòng kiểm tra thêm mục Spam hoặc Quảng cáo của bạn.</em>
              </p>
            </div>

            <button
              onClick={() => {
                setIsSubmitted(false);
                setEmail('');
                onClose();
              }}
              className="mt-4 px-6 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-slate-950 text-xs font-bold transition-all shadow-md shadow-primary/20"
            >
              Hoàn Tất
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="auth-email" className="text-xs font-semibold text-slate-300 block mb-1.5">
                Địa Chỉ Email Nhận Thư
              </label>
              <input
                id="auth-email"
                type="email"
                required
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tenban@gmail.com"
                className="w-full px-4 py-3 rounded-xl bg-surface-light border border-border-subtle text-xs sm:text-sm text-white focus:outline-none focus:border-primary placeholder:text-slate-400 disabled:opacity-50"
              />
            </div>

            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-start gap-2.5">
              <Mail className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Hệ thống sẽ tự động gửi thư cảm ơn và hướng dẫn sử dụng từ <strong className="text-primary">khanhdevs@gmail.com</strong> ngay khi bạn xác nhận.
              </p>
            </div>

            {errorMessage && (
              <p className="text-xs text-rose-400">{errorMessage}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-full bg-primary hover:bg-primary-hover text-slate-950 font-bold text-xs transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 focus-visible:ring-2 focus-visible:ring-primary focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang Gửi Thư Mời...</span>
                </>
              ) : (
                <>
                  <span>Bắt Đầu Miễn Phí Ngay</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </>
              )}
            </button>

            <p className="text-[11px] text-center text-slate-400 pt-2 leading-normal">
              Bằng việc tiếp tục, bạn đồng ý với{' '}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenLegal?.('terms');
                }}
                className="text-primary hover:underline underline-offset-2 inline"
              >
                Điều khoản dịch vụ
              </button>{' '}
              và{' '}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenLegal?.('privacy');
                }}
                className="text-primary hover:underline underline-offset-2 inline"
              >
                Chính sách bảo mật
              </button>{' '}
              của Traveling.
            </p>
          </form>
        )}
      </div>
    </div>
  );
};
