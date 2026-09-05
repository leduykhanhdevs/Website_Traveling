import React, { useState, useEffect } from 'react';
import { X, Compass, CheckCircle2, ArrowRight } from 'lucide-react';

export const AuthModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onOpenLegal?: (tab: 'terms' | 'privacy') => void;
}> = ({ isOpen, onClose, onOpenLegal }) => {
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
          aria-label="Đóng cửa sổ đăng ký danh sách chờ"
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-surface-light text-slate-400 hover:text-white flex items-center justify-center transition-all focus-visible:ring-2 focus-visible:ring-primary focus:outline-none"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-slate-950 mx-auto mb-4 shadow-lg shadow-primary/25">
            <Compass className="w-6 h-6 text-slate-950" aria-hidden="true" />
          </div>
          <h3 id="auth-modal-title" className="text-2xl font-black text-white">Đăng Ký Trải Nghiệm Sớm</h3>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Nhận lời mời ưu tiên trải nghiệm ứng dụng Traveling khi bản thử nghiệm phát hành chính thức.
          </p>
        </div>

        {isSubmitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white">Đã Ghi Nhận Danh Sách Chờ!</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Cảm ơn bạn đã quan tâm. Chúng tôi đã lưu địa chỉ <strong>{email}</strong> và sẽ gửi thông báo đến bạn ngay khi mở quyền truy cập sớm.
            </p>
            <button
              onClick={() => {
                setIsSubmitted(false);
                setEmail('');
                onClose();
              }}
              className="mt-4 px-6 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-slate-950 text-xs font-bold transition-all"
            >
              Hoàn Tất
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="auth-email" className="text-xs font-semibold text-slate-300 block mb-1.5">
                Địa Chỉ Email Nhận Thư Mời
              </label>
              <input
                id="auth-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tenban@email.com"
                className="w-full px-4 py-3 rounded-xl bg-surface-light border border-border-subtle text-xs sm:text-sm text-white focus:outline-none focus:border-primary placeholder:text-slate-400"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-full bg-primary hover:bg-primary-hover text-slate-950 font-bold text-xs transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 focus-visible:ring-2 focus-visible:ring-primary focus:outline-none"
            >
              <span>Tham Gia Danh Sách Chờ</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
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
