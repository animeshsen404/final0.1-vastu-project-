import React, { useState, useEffect, useRef } from 'react';
import { ExternalLink, ArrowRight, X } from 'lucide-react';
import {
  useActiveAds,
  AdSlot,
  normalizeAdSlot,
  DatabaseAd,
} from '../hooks/useActiveAds';
import {
  isRouteEligibleForAds,
  isSlotAllowedOnRoute,
  sanitizeAdUrl,
  sanitizeAdCustomHtml,
} from '../lib/adPolicy';
import { useTheme } from '../context/ThemeContext';

export type { AdSlot };

export interface AdBannerProps {
  placement: AdSlot;
  className?: string;
  customAd?: DatabaseAd;
  /** Optional explicit route override */
  route?: string;
  /** Suppresses rendering (e.g., when reader is in Focus Mode) */
  suppressed?: boolean;
  /** If true (default), collapses slot cleanly when no active ad is available or on error */
  allowEmpty?: boolean;
  onAdClick?: (ad: DatabaseAd) => void;
}

/**
 * Centralized, Route-Aware AdBanner Component:
 * - Enforces route eligibility (never renders on Homepage, Admin, Auth, or Contact routes)
 * - Clearly labels every unit with "Advertisement · Sponsored"
 * - Reserves layout geometry during fetch to prevent Cumulative Layout Shift (CLS)
 * - Collapses cleanly when no active campaign is scheduled or on network failure
 */
export const AdBanner: React.FC<AdBannerProps> = ({
  placement,
  className = '',
  customAd,
  route,
  suppressed = false,
  allowEmpty = true,
  onAdClick,
}) => {
  const { isLight } = useTheme();
  const {
    ad: fetchedAd,
    eligible,
    currentRoute,
    loading,
    recordClick,
    getReservedSlotStyle,
  } = useActiveAds({
    route,
    placement,
    autoTrackImpression: !suppressed,
  });

  const [stickyDismissed, setStickyDismissed] = useState(false);
  const [adSenseFailed, setAdSenseFailed] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const adSenseRef = useRef<HTMLModElement | null>(null);

  const normalizedPlacement = normalizeAdSlot(placement);
  const activeRoute = route || currentRoute;

  // Reset image error state when ad changes
  const ad = customAd || fetchedAd;
  useEffect(() => {
    setImageFailed(false);
    setAdSenseFailed(false);
  }, [ad?.id, ad?.imageUrl]);

  // Dynamic Google AdSense Loader & Initializer
  useEffect(() => {
    if (
      !suppressed &&
      eligible &&
      isSlotAllowedOnRoute(normalizedPlacement, activeRoute) &&
      ad?.adType === 'ADSENSE'
    ) {
      const client = ad.destinationUrl?.startsWith('ca-pub-')
        ? ad.destinationUrl
        : 'ca-pub-9697854430800000';
      const existingScript = document.querySelector(
        `script[src*="googlesyndication.com"]`
      );
      if (!existingScript) {
        const script = document.createElement('script');
        script.async = true;
        script.crossOrigin = 'anonymous';
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
        script.onerror = () => {
          setAdSenseFailed(true);
        };
        document.head.appendChild(script);
      }

      try {
        const win = window as unknown as {
          adsbygoogle?: Array<Record<string, unknown>>;
        };
        win.adsbygoogle = win.adsbygoogle || [];
        win.adsbygoogle.push({});
      } catch {
        setAdSenseFailed(true);
      }
    }
  }, [ad, suppressed, eligible, normalizedPlacement, activeRoute]);

  // Strict Route & Slot Eligibility Guard:
  // Never render on Homepage (/), Admin, Auth, Contact, or disallowed slots
  if (
    suppressed ||
    !eligible ||
    !isRouteEligibleForAds(activeRoute) ||
    !isSlotAllowedOnRoute(normalizedPlacement, activeRoute)
  ) {
    return null;
  }

  const reservedStyle = getReservedSlotStyle(placement);
  const safeHref = sanitizeAdUrl(ad?.destinationUrl);
  const isExternalLink =
    safeHref.startsWith('http://') || safeHref.startsWith('https://');

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!ad) return;
    recordClick(ad.id);
    if (onAdClick) {
      onAdClick(ad);
    }
    // If internal path, navigate smoothly via History API
    if (!isExternalLink && safeHref.startsWith('/')) {
      e.preventDefault();
      window.history.pushState({}, '', safeHref);
      window.dispatchEvent(new PopStateEvent('popstate'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 1. Loading Skeleton: Preserves designated slot geometry while checking active inventory
  if (loading && !ad) {
    if (normalizedPlacement === 'HEADER') {
      return (
        <aside
          style={reservedStyle}
          className={`w-full bg-[#24130c]/90 border-b border-[#D4A72C]/20 py-2 px-4 flex items-center justify-between text-xs animate-pulse select-none ${className}`}
          aria-hidden="true"
        >
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="h-3.5 w-48 bg-[#D4A72C]/10 rounded" />
            <div className="h-3.5 w-20 bg-[#D4A72C]/10 rounded" />
          </div>
        </aside>
      );
    }

    if (normalizedPlacement === 'SIDEBAR') {
      return (
        <aside
          style={reservedStyle}
          className={`p-4 rounded-xl bg-[#FAF6EE] dark:bg-[#2D1B14]/40 border border-[#D4A72C]/20 animate-pulse flex flex-col justify-between ${className}`}
          aria-hidden="true"
        >
          <div className="h-3 w-28 bg-[#D4A72C]/15 rounded mb-3" />
          <div className="w-full h-28 bg-[#D4A72C]/10 rounded-lg mb-3" />
          <div className="h-4 w-3/4 bg-[#D4A72C]/15 rounded mb-2" />
          <div className="h-8 w-full bg-[#D4A72C]/10 rounded" />
        </aside>
      );
    }

    return (
      <aside
        style={reservedStyle}
        className={`my-6 p-4 sm:p-5 rounded-xl bg-[#FAF6EE] dark:bg-[#2D1B14]/40 border border-[#D4A72C]/20 animate-pulse select-none ${className}`}
        aria-hidden="true"
      >
        <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[#D4A72C]/15">
          <div className="h-3 w-36 bg-[#D4A72C]/15 rounded" />
          <div className="h-3 w-20 bg-[#D4A72C]/15 rounded" />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="w-full sm:w-32 h-20 bg-[#D4A72C]/10 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2 w-full">
            <div className="h-4 w-2/3 bg-[#D4A72C]/15 rounded" />
            <div className="h-3.5 w-5/6 bg-[#D4A72C]/10 rounded" />
          </div>
        </div>
      </aside>
    );
  }

  // 2. Empty / Error Handling: Collapse cleanly when no active ad is available
  if (!ad || adSenseFailed) {
    if (allowEmpty) {
      return null;
    }
    return null;
  }

  // 3. Google AdSense Renderer
  if (ad.adType === 'ADSENSE') {
    const slotId = ad.adSenseSlot || '1234567890';
    const format = ad.adSenseFormat || 'auto';
    const publisherId = ad.destinationUrl?.startsWith('ca-pub-')
      ? ad.destinationUrl
      : 'ca-pub-9697854430800000';

    return (
      <aside
        style={reservedStyle}
        aria-label="Advertisement"
        data-ad-slot={normalizedPlacement}
        className={`w-full overflow-hidden my-6 p-3 rounded-xl bg-[#FAF6EE] dark:bg-[#1D100B] border border-[#D4A72C]/30 text-center relative ${className}`}
      >
        <div className="flex items-center justify-between text-[10px] font-mono text-[#7C5D3F] dark:text-[#D4A72C]/70 uppercase tracking-widest mb-2 pb-1.5 border-b border-[#D4A72C]/15">
          <span>Advertisement</span>
          <span>Sponsored</span>
        </div>
        <ins
          ref={adSenseRef}
          className="adsbygoogle"
          style={{ display: 'block', minHeight: 90 }}
          data-ad-client={publisherId}
          data-ad-slot={slotId}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </aside>
    );
  }

  // 4. Custom HTML / Affiliate Embed Renderer (Sanitized)
  if (ad.adType === 'CUSTOM_HTML' && ad.customHtml) {
    const safeHtml = sanitizeAdCustomHtml(ad.customHtml);
    if (!safeHtml.trim()) return null;

    return (
      <aside
        style={reservedStyle}
        aria-label="Advertisement"
        data-ad-slot={normalizedPlacement}
        className={`w-full overflow-hidden my-6 p-4 rounded-xl bg-[#FAF6EE] dark:bg-[#1D100B] border border-[#D4A72C]/35 relative ${className}`}
      >
        <div className="flex items-center justify-between text-[10px] font-mono text-[#7C5D3F] dark:text-[#D4A72C]/70 uppercase tracking-widest mb-2 pb-1.5 border-b border-[#D4A72C]/15">
          <span>Advertisement</span>
          <span>Sponsored Partner</span>
        </div>
        <div dangerouslySetInnerHTML={{ __html: safeHtml }} />
      </aside>
    );
  }

  // 5. Sticky Footer (Only if explicitly permitted by route policy)
  if (normalizedPlacement === 'STICKY_FOOTER') {
    if (stickyDismissed) return null;

    return (
      <aside
        aria-label="Advertisement"
        data-ad-slot="STICKY_FOOTER"
        className="fixed bottom-0 inset-x-0 z-40 bg-[#1A0D0A]/95 border-t border-[#D4A72C]/40 shadow-xl p-2.5 backdrop-blur-md"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {ad.imageUrl && !imageFailed && (
              <img
                src={ad.imageUrl}
                alt={ad.title}
                onError={() => setImageFailed(true)}
                className="w-10 h-10 rounded-lg object-cover shrink-0 border border-[#D4A72C]/30"
              />
            )}
            <div className="min-w-0">
              <span className="text-[9px] uppercase font-mono tracking-widest text-[#D4A72C] font-semibold block">
                Advertisement · {ad.badge || 'Sponsored Partner'}
              </span>
              <p className="text-xs sm:text-sm font-['Cinzel',serif] text-[#FFF7ED] font-bold truncate">
                {ad.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={safeHref}
              target={isExternalLink ? '_blank' : undefined}
              rel={isExternalLink ? 'noopener noreferrer sponsored' : undefined}
              onClick={handleClick}
              className="px-3.5 py-1.5 rounded-lg bg-[#D4A72C] text-[#1A0608] font-serif font-bold text-xs flex items-center gap-1.5"
            >
              <span>{ad.ctaText || 'Learn More'}</span>
              {isExternalLink ? (
                <ExternalLink className="w-3 h-3" />
              ) : (
                <ArrowRight className="w-3 h-3" />
              )}
            </a>
            <button
              onClick={() => setStickyDismissed(true)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/10"
              aria-label="Dismiss advertisement"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    );
  }

  // 6A. HEADER Placement (Subtle Library / Directory Top Bar)
  if (normalizedPlacement === 'HEADER') {
    return (
      <aside
        style={reservedStyle}
        aria-label="Sponsored Advertisement"
        data-ad-slot="HEADER"
        className={`w-full border-b py-2 px-4 select-none relative z-20 transition-colors ${
          isLight
            ? 'bg-[#FAF3E6] text-[#2D1B14] border-[#D4A72C]/40'
            : 'bg-[#1C0F13] text-[#FFF6F7] border-[#5A333C]'
        } ${className}`}
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className={`px-2 py-0.5 rounded font-mono text-[10px] tracking-widest uppercase font-semibold shrink-0 border ${
              isLight
                ? 'bg-[#D4A72C]/20 border-[#D4A72C]/50 text-[#6B1F1F]'
                : 'bg-[#E88A16]/20 border-[#E88A16]/50 text-[#E8D3A8]'
            }`}>
              Advertisement · Sponsored
            </span>
            {ad.clientName && (
              <span className={`hidden md:inline font-serif text-xs shrink-0 font-semibold ${
                isLight ? 'text-[#5C4438]' : 'text-zinc-300'
              }`}>
                {ad.clientName}:
              </span>
            )}
            <span className={`font-['Marcellus',serif] font-medium truncate ${
              isLight ? 'text-[#2D1B14]' : 'text-[#FFF7ED]'
            }`}>
              {ad.title}
            </span>
          </div>

          <a
            href={safeHref}
            target={isExternalLink ? '_blank' : undefined}
            rel={isExternalLink ? 'noopener noreferrer sponsored' : undefined}
            onClick={handleClick}
            className="inline-flex items-center gap-1.5 text-[#6B1F1F] hover:text-[#B94E2C] font-serif font-bold text-xs transition-colors shrink-0 group cursor-pointer"
          >
            <span>{ad.ctaText || 'Explore Partner'}</span>
            {isExternalLink ? (
              <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            ) : (
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            )}
          </a>
        </div>
      </aside>
    );
  }

  // 6B. SIDEBAR Placement (Desktop Right Rail Card)
  if (normalizedPlacement === 'SIDEBAR') {
    return (
      <aside
        style={reservedStyle}
        aria-label="Sponsored Advertisement"
        data-ad-slot="SIDEBAR"
        className={`p-4 rounded-xl border shadow-xs relative overflow-hidden text-left transition-colors ${
          isLight
            ? 'bg-[#FFFDF9] text-[#2A1515] border-[#D4A72C]/50'
            : 'bg-[#1C0F13] text-[#FFF6F7] border-[#5A333C]'
        } ${className}`}
      >
        <div className={`flex items-center justify-between text-[10px] uppercase font-mono tracking-widest pb-2 mb-3 border-b ${
          isLight ? 'text-[#7C5D3F] border-[#D4A72C]/25' : 'text-zinc-400 border-[#5A333C]/40'
        }`}>
          <span className="font-semibold">Advertisement</span>
          <span className={isLight ? 'text-[#8C6D46]' : 'text-[#E8D3A8]'}>
            {ad.badge || 'Sponsored'}
          </span>
        </div>

        {ad.imageUrl && !imageFailed && (
          <div className={`w-full h-32 rounded-lg overflow-hidden border mb-3 relative ${
            isLight ? 'bg-[#FAF3E6] border-[#D4A72C]/35' : 'bg-[#180B0F] border-[#5A333C]/40'
          }`}>
            <img
              src={ad.imageUrl}
              alt={ad.title}
              loading="lazy"
              decoding="async"
              onError={() => setImageFailed(true)}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {ad.clientName && (
          <div className="text-[11px] font-serif uppercase tracking-wider text-[#B94E2C] font-semibold mb-1">
            {ad.clientName}
          </div>
        )}

        <h5 className={`font-['Cinzel',serif] text-sm font-bold leading-snug mb-1.5 ${
          isLight ? 'text-[#2A1515]' : 'text-[#FFF7ED]'
        }`}>
          {ad.title}
        </h5>

        {(ad.tagline || ad.description) && (
          <p className={`text-xs font-serif leading-relaxed line-clamp-3 mb-3.5 ${
            isLight ? 'text-[#5C4438]' : 'text-[#E8D3A8]'
          }`}>
            {ad.tagline || ad.description}
          </p>
        )}

        <a
          href={safeHref}
          target={isExternalLink ? '_blank' : undefined}
          rel={isExternalLink ? 'noopener noreferrer sponsored' : undefined}
          onClick={handleClick}
          className="w-full py-2 px-3 rounded-lg bg-[#0F5C55] hover:bg-[#167A68] text-[#FFF7ED] font-serif font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
        >
          <span>{ad.ctaText || 'Explore Service'}</span>
          {isExternalLink ? (
            <ExternalLink className="w-3.5 h-3.5 text-[#D4A72C]" />
          ) : (
            <ArrowRight className="w-3.5 h-3.5 text-[#D4A72C]" />
          )}
        </a>
      </aside>
    );
  }

  // 6C. BELOW_VIDEO & BELOW_RESULTS & IN-CONTENT (ARTICLE_TOP, ARTICLE_MIDDLE, ARTICLE_BOTTOM)
  const placementLabel =
    normalizedPlacement === 'BELOW_VIDEO'
      ? 'Advertisement · Video Learning Sponsor'
      : normalizedPlacement === 'BELOW_RESULTS'
      ? 'Advertisement · Featured Directory Partner'
      : `Advertisement · ${ad.badge || 'Sponsored Partner'}`;

  return (
    <aside
      style={reservedStyle}
      aria-label="Sponsored Advertisement"
      data-ad-slot={normalizedPlacement}
      className={`my-6 sm:my-8 p-4 sm:p-5 rounded-xl border shadow-xs select-none relative overflow-hidden transition-colors ${
        isLight
          ? 'bg-[#FFFDF9] text-[#2A1515] border-[#D4A72C]/50'
          : 'bg-[#1C0F13] text-[#FFF6F7] border-[#5A333C]'
      } ${className}`}
    >
      {/* Clear & Honest Disclosure Header */}
      <div className={`flex flex-wrap items-center justify-between gap-2 border-b pb-2.5 mb-3.5 ${
        isLight ? 'border-[#D4A72C]/25' : 'border-[#5A333C]/40'
      }`}>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] uppercase font-mono tracking-widest font-semibold px-2 py-0.5 rounded border ${
            isLight
              ? 'bg-[#FAF3E6] text-[#7C5D3F] border-[#D4A72C]/40'
              : 'bg-[#251519] text-[#E8D3A8] border-[#5A333C]'
          }`}>
            {placementLabel}
          </span>
          {ad.clientName && (
            <>
              <span className="text-xs font-serif text-[#D4A72C]/60">·</span>
              <span className={`text-xs font-serif font-semibold ${isLight ? 'text-[#5C4438]' : 'text-zinc-300'}`}>
                {ad.clientName}
              </span>
            </>
          )}
        </div>

        {ad.category && (
          <span className={`text-[10px] font-serif uppercase tracking-wider ${isLight ? 'text-[#8C6D46]' : 'text-[#E8D3A8]'}`}>
            {ad.category}
          </span>
        )}
      </div>

      {/* Main Ad Body */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
        {ad.imageUrl && !imageFailed && (
          <div className={`w-full sm:w-36 h-24 shrink-0 rounded-lg overflow-hidden border relative ${
            isLight ? 'bg-[#FAF3E6] border-[#D4A72C]/35' : 'bg-[#180B0F] border-[#5A333C]/40'
          }`}>
            <img
              src={ad.imageUrl}
              alt={ad.title}
              loading="lazy"
              decoding="async"
              onError={() => setImageFailed(true)}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex-1 space-y-1.5 min-w-0">
          <h4 className={`font-['Cinzel',serif] text-sm sm:text-base font-bold leading-snug ${
            isLight ? 'text-[#2A1515]' : 'text-[#FFF7ED]'
          }`}>
            {ad.title}
          </h4>

          {(ad.tagline || ad.description) && (
            <p className={`text-xs sm:text-sm font-serif leading-relaxed line-clamp-2 ${
              isLight ? 'text-[#5C4438]' : 'text-[#E8D3A8]'
            }`}>
              {ad.tagline || ad.description}
            </p>
          )}

          <div className="pt-1.5 flex flex-wrap items-center gap-3">
            <a
              href={safeHref}
              target={isExternalLink ? '_blank' : undefined}
              rel={isExternalLink ? 'noopener noreferrer sponsored' : undefined}
              onClick={handleClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0F5C55] hover:bg-[#167A68] text-[#FFF7ED] font-serif font-bold text-xs transition-colors cursor-pointer group"
            >
              <span>{ad.ctaText || 'Learn More'}</span>
              {isExternalLink ? (
                <ExternalLink className="w-3.5 h-3.5 text-[#D4A72C] group-hover:translate-x-0.5 transition-transform" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5 text-[#D4A72C] group-hover:translate-x-0.5 transition-transform" />
              )}
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
};

export const AdvertisementBanner = AdBanner;

export {
  AdContainer,
  ContentWithInjectedAds,
  InContentAd,
  SidebarAd,
  BelowVideoAd,
  BelowResultsAd,
  LibraryHeaderAd,
} from './AdContainer';
