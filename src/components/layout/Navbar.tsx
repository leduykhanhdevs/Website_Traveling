import React, { useState, useEffect } from 'react';
import { Compass, Menu, X, ArrowRight } from 'lucide-react';

export const Navbar: React.FC<{
  onStartClick: () => void;
}> = ({ onStartClick }) => {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Điểm Đến', href: '#destinations' },
    { label: 'Địa Cầu 3D', href: '#globe' },
    { label: 'Tính Năng AI', href: '#features' },
    { label: 'Thử Nghiệm', href: '#demo' },
    { label: 'Chia Quỹ', href: '#budget' },
    { label: 'Bảng Giá', href: '#pricing' },
    { label: 'Cộng Đồng', href: '#community' },
  ];

  return (
    <header
      role="banner"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-16 sm:h-[72px] flex items-center ${
        isScrolled
          ? 'bg-background/80 backdrop-blur-xl border-b border-border-subtle shadow-lg shadow-black/30'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between">
        {/* Brand Logo */}
        <a
          href="#"
          className="flex items-center gap-2.5 group focus-visible:ring-2 focus-visible:ring-primary focus:outline-none rounded-xl"
          aria-label="Traveling - Trang chủ"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-slate-950 shadow-md shadow-primary/25 group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5 text-slate-950" aria-hidden="true" />
          </div>
          <span className="text-xl font-black tracking-tight text-white group-hover:text-primary transition-colors">
            Traveling
          </span>
        </a>

        {/* Desktop Navigation Links */}
        <nav
          role="navigation"
          aria-label="Điều hướng chính"
          className="hidden lg:flex items-center gap-7 text-xs font-semibold text-slate-300"
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="hover:text-primary transition-colors py-1 relative group focus-visible:ring-2 focus-visible:ring-primary focus:outline-none rounded"
            >
              <span>{link.label}</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        {/* Action Button & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onStartClick}
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-slate-950 font-bold text-xs transition-all shadow-md shadow-primary/20 active:scale-95 focus-visible:ring-2 focus-visible:ring-white focus:outline-none"
            aria-label="Mở hộp thoại đăng ký tài khoản miễn phí"
          >
            <span>Bắt Đầu Miễn Phí</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden w-10 h-10 rounded-xl glass-panel flex items-center justify-center text-slate-300 hover:text-white focus-visible:ring-2 focus-visible:ring-primary focus:outline-none"
            aria-label={isMobileMenuOpen ? 'Đóng menu' : 'Mở menu điều hướng'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-nav-drawer"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div
          id="mobile-nav-drawer"
          role="navigation"
          aria-label="Điều hướng trên thiết bị di động"
          className="lg:hidden fixed inset-x-0 top-16 sm:top-[72px] bg-surface/95 backdrop-blur-2xl border-b border-border-subtle p-6 shadow-2xl animate-fade-in"
        >
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-sm font-semibold text-slate-300 hover:text-primary py-2 border-b border-border-subtle/40"
              >
                {link.label}
              </a>
            ))}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onStartClick();
              }}
              className="mt-2 w-full py-3 rounded-full bg-primary text-slate-950 font-bold text-xs shadow-md"
            >
              Bắt Đầu Miễn Phí
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};
