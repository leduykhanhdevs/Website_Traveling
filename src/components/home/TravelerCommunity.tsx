import React from 'react';
import { TRAVELER_STORIES } from '../../data/pricing';
import { Star, MessageSquareQuote } from 'lucide-react';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export const TravelerCommunity: React.FC = () => {
  return (
    <section id="community" aria-labelledby="community-heading" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 id="community-heading" className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
            Kịch Bản Trải Nghiệm & Tình Huống Thực Tế
          </h2>
          <p className="text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Khám phá các tình huống du lịch thực tế minh họa cách Traveling hỗ trợ chuyến đi của bạn từ khâu chuẩn bị đến từng trải nghiệm bản địa.
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

              {/* Author Attribution with initials avatar block */}
              <div className="flex items-center gap-3.5 pt-4 border-t border-border-subtle">
                <div
                  className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-indigo-500/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0"
                  aria-hidden="true"
                >
                  {getInitials(story.author)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-white">{story.author}</h3>
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
