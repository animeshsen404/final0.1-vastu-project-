import React from 'react';
import { CheckCircle2, BookmarkCheck, ArrowDown, Sparkles } from 'lucide-react';

interface EndOfReadingMarkerProps {
  type: 'dictionary' | 'article' | 'myth';
  title: string;
  sanskritTitle?: string | null;
  isLight: boolean;
  categoryLabel?: string;
}

export const EndOfReadingMarker: React.FC<EndOfReadingMarkerProps> = ({
  type,
  title,
  sanskritTitle,
  isLight,
  categoryLabel,
}) => {
  const isDict = type === 'dictionary';
  const isMyth = type === 'myth';
  const sanskritEndTag = isDict
    ? '॥ समाप्तम् ॥'
    : isMyth
    ? '॥ भ्रान्ति-निवारण समाप्त ॥'
    : '॥ लेख समाप्त ॥';
  const englishEndTag = isDict
    ? 'End of Dictionary Definition'
    : isMyth
    ? 'End of Vastu Myth Analysis'
    : 'End of Prakaran Article';
  const completionText = isDict
    ? 'You have reached the conclusion of this Vastu Shabd Kosh definition and practical home guidance.'
    : isMyth
    ? 'You have reached the conclusion of this Vastu myth clarification, classical scriptural evidence, and practical guidance.'
    : 'You have reached the end of this comprehensive Vastu Prakaran guide.';

  return (
    <div className="my-8 sm:my-10 space-y-4" aria-label="End of Content Marker">
      {/* 1. Ornamental Vedic Divider Line */}
      <div className="flex items-center justify-center gap-3 py-2">
        <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-[#D4A72C]/40 to-[#D4A72C]" />
        <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-[#D4A72C]/60 bg-[#D4A72C]/10 text-[#D4A72C] text-xs font-serif font-bold tracking-widest shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#E88A16]" />
          <span>❖ ॐ ❖</span>
          <Sparkles className="w-3.5 h-3.5 text-[#E88A16]" />
        </div>
        <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent via-[#D4A72C]/40 to-[#D4A72C]" />
      </div>

      {/* 2. Distinct End of Content Card */}
      <div
        className={`relative overflow-hidden rounded-3xl border-2 p-5 sm:p-7 shadow-lg transition-all ${
          isLight
            ? 'bg-gradient-to-br from-[#FFFDF9] via-[#FAF4E8] to-[#F5EAD4] border-[#D4A72C]/70 text-[#2D1B14]'
            : 'bg-gradient-to-br from-[#290E13] via-[#1E080C] to-[#140406] border-[#D4A72C]/50 text-[#FFF7ED]'
        }`}
      >
        {/* Subtle decorative background watermark */}
        <div className="absolute right-3 top-3 text-[#D4A72C]/10 font-serif font-black text-6xl sm:text-7xl pointer-events-none select-none">
          ॐ
        </div>

        <div className="relative z-10 space-y-3">
          {/* Top Status Bar: Completion Pill & Sanskrit Seal */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-[#D4A72C]/30">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800 text-emerald-100 text-xs font-serif font-bold tracking-wide shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
              <span>100% Reading Completed</span>
            </div>

            <div className="flex items-center gap-2 text-xs font-serif font-bold text-[#E88A16]">
              <span className="font-['Yatra_One'] text-sm sm:text-base text-[#D4A72C]">
                {sanskritEndTag}
              </span>
              <span className="opacity-80">·</span>
              <span className="uppercase tracking-wider text-[11px] text-[#D4A72C]">
                {englishEndTag}
              </span>
            </div>
          </div>

          {/* Heading and Completion Message */}
          <div>
            <h3
              className={`font-['Cinzel',serif] text-lg sm:text-xl font-bold flex items-center gap-2 ${
                isLight ? 'text-[#2D1B14]' : 'text-[#FFF7ED]'
              }`}
            >
              <BookmarkCheck className="w-5 h-5 text-[#E88A16] shrink-0" />
              <span>
                {isDict ? 'Definition Concluded' : 'Guide Concluded'}:{' '}
                <span className="text-[#E88A16]">{title}</span>
              </span>
              {sanskritTitle && (
                <span className="hidden sm:inline text-xs font-['Yatra_One'] text-[#D4A72C]">
                  ({sanskritTitle})
                </span>
              )}
            </h3>
            <p
              className={`mt-1.5 text-xs sm:text-sm font-['Marcellus'] leading-relaxed ${
                isLight ? 'text-[#5A4545]' : 'text-[#E8D3A8]/90'
              }`}
            >
              {completionText} {categoryLabel && `Category: ${categoryLabel}.`}
            </p>
          </div>

          {/* Layman Guidance Banner for Downstream Content */}
          <div
            className={`mt-2 p-3 sm:p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
              isLight
                ? 'bg-[#EFE3CF]/80 border-[#D4A72C]/50 text-[#3A2218]'
                : 'bg-[#180608]/90 border-[#D4A72C]/30 text-[#F0DEBD]'
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-serif">
              <span className="w-2 h-2 rounded-full bg-[#E88A16] shrink-0 animate-pulse" />
              <span>
                <strong>Next Step:</strong> Explore interconnected concepts, articles, and recommendations below.
              </span>
            </div>

            <span className="inline-flex items-center gap-1.5 text-[11px] font-serif font-bold text-[#E88A16] shrink-0">
              <span>Scroll down for Further Reading</span>
              <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
