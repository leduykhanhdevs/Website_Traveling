import React from 'react';
import { TRAVELER_STORIES } from '../../data/pricing';
import { Star, MessageSquareQuote, CheckCircle2 } from 'lucide-react';

export const TravelerCommunity: React.FC = () => {
  return (
    <section id="community" aria-labelledby="community-heading" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 id="community-heading" className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
            Được Tin Dùng Bởi Du Khách Toàn Cầu
          </h2>
          <p className="text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Những chia sẻ thực tế và hành trình chân thật từ những người đã dùng Traveling để khám phá các miền đất mới.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {TRAVELER_STORIES.map((story) => (
            <div
              key={story.id}
              className="glass-card p-6 sm:p-8 rounded-3xl border border-border-subtle flex flex-col justify-between"
            >
              <div>
                {/* Rating stars & Quote Icon */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-amber-400" aria-label={`Đánh giá: ${story.rating} trên 5 sao`}>
                    {[...Array(story.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" aria-hidden="true" />
                    ))}
                  </div>
                  <MessageSquareQuote className="w-6 h-6 text-primary/40" aria-hidden="true" />
                </div>

                {/* Quote (Strictly <= 3 lines) */}
                <p className="text-sm text-slate-300 leading-relaxed italic mb-6 line-clamp-3">
                  "{story.comment}"
                </p>
              </div>

              {/* Author Attribution */}
              <div className="flex items-center gap-3.5 pt-4 border-t border-border-subtle">
                <img
                  src={story.avatar}
                  alt={`Chân dung du khách ${story.author}`}
                  width={44}
                  height={44}
                  loading="lazy"
                  decoding="async"
                  className="w-11 h-11 rounded-full object-cover border border-primary/30"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-white">{story.author}</h3>
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                  </div>
                  <span className="text-[11px] text-slate-400 block">{story.location}</span>
                  <span className="text-[10px] text-primary font-medium">{story.trip}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
