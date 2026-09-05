import React from 'react';

export const TrustPartners: React.FC = () => {
  return (
    <section aria-labelledby="partners-heading" className="py-10 border-y border-border-subtle bg-surface/40 backdrop-blur-sm relative z-10">
      <h2 id="partners-heading" className="sr-only">
        Các Đối Tác & Nền Tảng Công Nghệ Tích Hợp
      </h2>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center md:justify-between gap-8 opacity-60 hover:opacity-85 transition-opacity">
          {/* OpenAI */}
          <div className="flex items-center gap-2 text-slate-300 font-semibold tracking-wider text-xs">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M22.28 9.37a5.55 5.55 0 0 0-.48-4.52 5.66 5.66 0 0 0-5.83-2.73 5.56 5.56 0 0 0-4.14-1.85 5.67 5.67 0 0 0-5.4 3.91 5.56 5.56 0 0 0-3.7 2.68 5.65 5.65 0 0 0 .73 6.36 5.57 5.57 0 0 0 .48 4.52 5.66 5.66 0 0 0 5.83 2.73 5.57 5.57 0 0 0 4.14 1.85 5.67 5.67 0 0 0 5.4-3.91 5.56 5.56 0 0 0 3.7-2.68 5.65 5.65 0 0 0-.73-6.36z" />
            </svg>
            <span>OPENAI GPT-4</span>
          </div>

          {/* DeepL */}
          <div className="flex items-center gap-2 text-slate-300 font-semibold tracking-wider text-xs">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M4 4h8a8 8 0 0 1 8 8v0a8 8 0 0 1-8 8H4z" />
            </svg>
            <span>DEEPL PRO</span>
          </div>

          {/* Google Places */}
          <div className="flex items-center gap-2 text-slate-300 font-semibold tracking-wider text-xs">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
            </svg>
            <span>GOOGLE PLACES</span>
          </div>

          {/* OpenWeather */}
          <div className="flex items-center gap-2 text-slate-300 font-semibold tracking-wider text-xs">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
            </svg>
            <span>OPENWEATHER</span>
          </div>

          {/* Clerk Auth */}
          <div className="flex items-center gap-2 text-slate-300 font-semibold tracking-wider text-xs">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
            </svg>
            <span>CLERK SECURITY</span>
          </div>

          {/* Redis */}
          <div className="flex items-center gap-2 text-slate-300 font-semibold tracking-wider text-xs">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M2 9l10-5 10 5-10 5L2 9zm0 6l10 5 10-5-10-5-10 5z" />
            </svg>
            <span>REDIS CLOUD</span>
          </div>
        </div>
      </div>
    </section>
  );
};
