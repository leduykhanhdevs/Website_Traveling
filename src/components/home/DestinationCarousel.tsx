import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Calendar, DollarSign, Star, Compass, X } from 'lucide-react';
import { DESTINATIONS } from '../../data/destinations';
import { Destination } from '../../types';

export const DestinationCarousel: React.FC<{
  onSelectDestination?: (dest: Destination) => void;
}> = ({ onSelectDestination }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedRegion, setSelectedRegion] = useState<string>('Tất cả');
  const [selectedModalDest, setSelectedModalDest] = useState<Destination | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const startXRef = useRef<number>(0);
  const dragDistanceRef = useRef<number>(0);
  const hasDraggedRef = useRef<boolean>(false);

  // Responsive cards per view (1 on mobile, 2 on tablet, 3 on desktop)
  const [cardsPerView, setCardsPerView] = useState<number>(() => {
    if (typeof window === 'undefined') return 3;
    if (window.innerWidth < 640) return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  });

  useEffect(() => {
    const updateCardsPerView = () => {
      const w = window.innerWidth;
      if (w < 640) {
        setCardsPerView(1);
      } else if (w < 1024) {
        setCardsPerView(2);
      } else {
        setCardsPerView(3);
      }
    };

    updateCardsPerView();
    window.addEventListener('resize', updateCardsPerView);
    return () => window.removeEventListener('resize', updateCardsPerView);
  }, []);

  // Filter tabs: Added 'Việt Nam' for dedicated domestic spotlight
  const regions = ['Tất cả', 'Việt Nam', 'Đông Nam Á', 'Đông Á', 'Châu Âu'];

  const filteredDestinations = useMemo(() => {
    if (selectedRegion === 'Tất cả') return DESTINATIONS;
    if (selectedRegion === 'Việt Nam') return DESTINATIONS.filter((d) => d.country === 'Việt Nam');
    if (selectedRegion === 'Đông Nam Á') return DESTINATIONS.filter((d) => d.region === 'Đông Nam Á' && d.country !== 'Việt Nam');
    if (selectedRegion === 'Đông Á') return DESTINATIONS.filter((d) => d.region === 'Đông Á');
    if (selectedRegion === 'Châu Âu') return DESTINATIONS.filter((d) => d.region === 'Châu Âu');
    return DESTINATIONS;
  }, [selectedRegion]);

  // Max index ensures cards fill 100% of viewport without clipping or empty black slots
  const maxIndex = Math.max(0, filteredDestinations.length - cardsPerView);

  // Synchronize index when region or cardsPerView changes
  useEffect(() => {
    setCurrentIndex((prev) => Math.min(prev, maxIndex));
  }, [maxIndex]);

  const handlePrev = useCallback(() => {
    if (maxIndex <= 0) return;
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  const handleNext = useCallback(() => {
    if (maxIndex <= 0) return;
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const handleSelectRegion = (region: string) => {
    setSelectedRegion(region);
    setCurrentIndex(0);
  };

  // Auto-play timer with infinite loop
  useEffect(() => {
    if (isPaused || isDragging || maxIndex <= 0) return;

    autoPlayRef.current = setInterval(() => {
      handleNext();
    }, 4500);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isPaused, isDragging, maxIndex, handleNext]);

  // Touch & Mouse Drag Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    dragDistanceRef.current = 0;
    hasDraggedRef.current = false;
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const diff = e.clientX - startXRef.current;
    dragDistanceRef.current = diff;
    if (Math.abs(diff) > 8) {
      hasDraggedRef.current = true;
    }
    setDragOffset(diff);
  };

  const handlePointerUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);

    const diff = dragDistanceRef.current;
    setDragOffset(0);

    if (diff < -50) {
      handleNext();
    } else if (diff > 50) {
      handlePrev();
    }

    // Keep hasDraggedRef true momentarily so click events won't trigger modal
    setTimeout(() => {
      hasDraggedRef.current = false;
    }, 80);
  };

  const handlePointerCancel = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
    setDragOffset(0);
    setTimeout(() => {
      hasDraggedRef.current = false;
    }, 80);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrev();
    if (e.key === 'ArrowRight') handleNext();
  };

  // Accessible Escape key to close modal
  useEffect(() => {
    const handleModalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedModalDest(null);
    };
    if (selectedModalDest) {
      window.addEventListener('keydown', handleModalKeyDown);
    }
    return () => window.removeEventListener('keydown', handleModalKeyDown);
  }, [selectedModalDest]);

  // Dynamic card width calculation to perfectly fit viewport with 24px gap
  const cardWidthStyle = useMemo(() => {
    if (cardsPerView === 1) return { width: '100%' };
    if (cardsPerView === 2) return { width: 'calc((100% - 24px) / 2)' };
    return { width: 'calc((100% - 48px) / 3)' };
  }, [cardsPerView]);

  return (
    <section
      id="destinations"
      aria-labelledby="destinations-heading"
      className="py-24 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-4">
              <Compass className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Điểm Đến Hấp Dẫn Toàn Cầu</span>
            </div>
            <h2
              id="destinations-heading"
              className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white"
            >
              Khám Phá Các Tọa Độ Du Lịch Nổi Tiếng
            </h2>
            <p className="mt-3 text-base text-slate-400 max-w-2xl">
              Từ những đô thị phồn hoa ngập ánh đèn đến những bờ biển nhiệt đới thơ mộng: được tuyển chọn và tối ưu hóa cho mọi phong cách trải nghiệm.
            </p>
          </div>

          {/* Region Tabs: Clean, zero-scrollbar filter bar */}
          <div
            role="tablist"
            aria-label="Bộ lọc vùng miền du lịch"
            className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none no-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {regions.map((region) => {
              const isSelected = selectedRegion === region;
              return (
                <button
                  key={region}
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => handleSelectRegion(region)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap focus-visible:ring-2 focus-visible:ring-primary focus:outline-none ${
                    isSelected
                      ? 'bg-primary text-slate-950 shadow-md shadow-primary/25 font-bold'
                      : 'bg-surface text-slate-400 hover:text-white hover:bg-slate-800 border border-border-subtle'
                  }`}
                >
                  {region}
                </button>
              );
            })}
          </div>
        </div>

        {/* Carousel Viewport Container */}
        <div
          className="relative outline-none"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          aria-roledescription="carousel"
          aria-label="Danh sách các điểm đến du lịch"
        >
          {/* Main Slider Track */}
          <div
            className="overflow-hidden rounded-3xl py-3 cursor-grab active:cursor-grabbing select-none touch-pan-y"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
            onPointerLeave={handlePointerCancel}
          >
            <div
              className="flex gap-6 will-change-transform"
              style={{
                transform: `translateX(calc(-${currentIndex} * (100% + 24px) / ${cardsPerView} + ${dragOffset}px))`,
                transition: isDragging
                  ? 'none'
                  : 'transform 500ms cubic-bezier(0.25, 1, 0.5, 1)',
              }}
            >
              {filteredDestinations.map((dest) => (
                <div
                  key={dest.id}
                  onClick={() => {
                    if (hasDraggedRef.current) return;
                    setSelectedModalDest(dest);
                    if (onSelectDestination) onSelectDestination(dest);
                  }}
                  style={{
                    ...cardWidthStyle,
                    flexShrink: 0,
                  }}
                  className="rounded-2xl overflow-hidden glass-card cursor-pointer group transition-all duration-300 select-none border border-border-subtle/80 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/15 hover:-translate-y-1.5 flex flex-col justify-between"
                >
                  {/* Card Image Header with High Contrast Gradient */}
                  <div className="relative h-56 w-full overflow-hidden bg-slate-900">
                    <img
                      src={dest.image}
                      alt={`Khám phá điểm đến du lịch ${dest.name} tại ${dest.country}`}
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 pointer-events-none select-none"
                    />

                    {/* Gradient Overlay for Pristine Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/75 via-45% to-transparent/10 pointer-events-none" />

                    {/* Floating Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-slate-950/80 backdrop-blur-md text-white border border-white/15 shadow-sm">
                        {dest.country}
                      </span>
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/15 text-amber-400 text-xs font-bold shadow-sm">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{dest.rating}</span>
                      </div>
                    </div>

                    {/* City Name & Tagline */}
                    <div className="absolute bottom-3 left-4 right-4 pointer-events-none">
                      <h3 className="text-2xl font-black text-white group-hover:text-primary transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]">
                        {dest.name}
                      </h3>
                      <p className="text-xs text-slate-200 font-medium drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] line-clamp-1 mt-0.5">
                        {dest.tag}
                      </p>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex flex-col flex-grow justify-between">
                    <div>
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-4">
                        {dest.description}
                      </p>

                      <div className="space-y-2.5 pt-3 border-t border-border-subtle text-[11px] text-slate-400">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-primary" />
                            Thời điểm đẹp nhất
                          </span>
                          <span className="text-slate-200 font-medium">{dest.bestTime}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                            Ngân sách dự trù
                          </span>
                          <span className="text-emerald-400 font-semibold">
                            {dest.avgBudgetPerDay}/ngày
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (hasDraggedRef.current) return;
                        setSelectedModalDest(dest);
                        if (onSelectDestination) onSelectDestination(dest);
                      }}
                      className="mt-4 w-full py-2.5 rounded-xl bg-surface-light hover:bg-primary hover:text-slate-950 text-xs font-bold text-slate-200 hover:border-primary transition-all text-center border border-border-subtle focus-visible:ring-2 focus-visible:ring-primary focus:outline-none"
                    >
                      Xem Chi Tiết Điểm Đến
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-6 px-1">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-surface-light border border-border-subtle text-xs">
                <span className="font-mono text-primary font-bold">
                  {(currentIndex + 1).toString().padStart(2, '0')}
                </span>
                <span className="text-slate-500 font-mono">/</span>
                <span className="text-slate-400 font-mono">
                  {filteredDestinations.length.toString().padStart(2, '0')}
                </span>
              </div>

              {/* Progress Indicator */}
              <div className="w-24 sm:w-36 h-1.5 rounded-full bg-slate-800 overflow-hidden hidden sm:block">
                <div
                  className="h-full bg-primary transition-all duration-300 rounded-full"
                  style={{
                    width: `${Math.min(
                      100,
                      ((currentIndex + cardsPerView) / filteredDestinations.length) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Previous & Next Slide Controls */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handlePrev}
                disabled={maxIndex <= 0}
                className="w-11 h-11 rounded-full glass-panel flex items-center justify-center text-slate-300 hover:text-white hover:border-primary/50 hover:bg-slate-800 transition-all active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-primary focus:outline-none"
                aria-label="Điểm đến trước"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={maxIndex <= 0}
                className="w-11 h-11 rounded-full glass-panel flex items-center justify-center text-slate-300 hover:text-white hover:border-primary/50 hover:bg-slate-800 transition-all active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-primary focus:outline-none"
                aria-label="Điểm đến tiếp theo"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Destination Detail Modal */}
      {selectedModalDest && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-dest-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
        >
          <div className="relative w-full max-w-2xl bg-surface border border-border-subtle rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div className="relative h-64 w-full flex-shrink-0">
              <img
                src={selectedModalDest.image}
                alt={`Toàn cảnh danh thắng ${selectedModalDest.name}, ${selectedModalDest.country}`}
                width={672}
                height={256}
                decoding="async"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
              <button
                type="button"
                onClick={() => setSelectedModalDest(null)}
                aria-label="Đóng cửa sổ thông tin điểm đến"
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90 transition-all border border-white/20 focus-visible:ring-2 focus-visible:ring-primary focus:outline-none"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>

              <div className="absolute bottom-4 left-6 right-6">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary text-slate-950 mb-2 inline-block">
                  {selectedModalDest.region}
                </span>
                <h3 id="modal-dest-title" className="text-3xl font-black text-white drop-shadow-md">
                  {selectedModalDest.name}, {selectedModalDest.country}
                </h3>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              <div>
                <h4 className="text-xs uppercase font-bold text-primary tracking-wider mb-2">
                  Tổng Quan Điểm Đến
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {selectedModalDest.description}
                </p>
              </div>

              <div>
                <h4 className="text-xs uppercase font-bold text-primary tracking-wider mb-3">
                  Trải Nghiệm Tiêu Biểu Không Thể Bỏ Lỡ
                </h4>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {selectedModalDest.highlights.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-light border border-border-subtle text-xs text-slate-200"
                    >
                      <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-surface-light/60 border border-border-subtle">
                <div>
                  <span className="text-[11px] text-slate-400 block">Thời gian lý tưởng</span>
                  <span className="text-sm font-semibold text-white">{selectedModalDest.bestTime}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Ngân sách trung bình</span>
                  <span className="text-sm font-semibold text-emerald-400">
                    {selectedModalDest.avgBudgetPerDay}/ngày
                  </span>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedModalDest(null)}
                  className="flex-1 py-3 rounded-full bg-primary hover:bg-primary-hover text-slate-950 font-bold text-sm transition-all shadow-lg shadow-primary/20 text-center"
                >
                  Lên Lịch Trình Cho Điểm Này
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedModalDest(null)}
                  className="px-6 py-3 rounded-full bg-surface-light hover:bg-slate-800 text-slate-300 font-medium text-sm transition-all border border-border-subtle"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
