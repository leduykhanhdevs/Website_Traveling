import React, { useState, useEffect } from 'react';
import { X, Compass, CheckCircle2, ArrowRight } from 'lucide-react';

export const AuthModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-md bg-surface border border-border-subtle rounded-3xl p-8 shadow-2xl">
        <button
          onClick={onClose}
          aria-label="Đóng cửa sổ đăng ký tài khoản"
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-surface-light text-slate-400 hover:text-white flex items-center justify-center transition-all focus-visible:ring-2 focus-visible:ring-primary focus:outline-none"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-slate-950 mx-auto mb-4 shadow-lg shadow-primary/25">
            <Compass className="w-6 h-6 text-slate-950" aria-hidden="true" />
          </div>
          <h3 id="auth-modal-title" className="text-2xl font-black text-white">Khởi Hành Cùng Traveling</h3>
          <p className="text-xs text-slate-400 mt-1.5">
            Đăng ký tài khoản miễn phí để lưu lịch trình và đồng bộ chuyến đi đa thiết bị.
          </p>
        </div>

        {isSubmitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white">Chúc Mừng Bạn!</h4>
            <p className="text-xs text-slate-300">
              Liên kết kích hoạt tài khoản trải nghiệm đã được gửi tới <strong>{email}</strong>. Hãy kiểm tra hộp thư để bắt đầu hành trình.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2.5 rounded-full bg-primary text-slate-950 text-xs font-bold"
            >
              Hoàn Tất
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="auth-email" className="text-xs font-semibold text-slate-300 block mb-1.5">
                Địa Chỉ Email
              </label>
              <input
                id="auth-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tenban@email.com"
                className="w-full px-4 py-3 rounded-xl bg-surface-light border border-border-subtle text-xs sm:text-sm text-white focus:outline-none focus:border-primary placeholder:text-slate-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-full bg-primary hover:bg-primary-hover text-slate-950 font-bold text-xs transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 focus-visible:ring-2 focus-visible:ring-primary focus:outline-none"
            >
              <span>Tiếp Tục Với Email</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>

            <p className="text-[11px] text-center text-slate-500 pt-2">
              Bằng việc tiếp tục, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của Traveling.
            </p>
          </form>
        )}
      </div>
    </div>
  );
};
