import React, { useState, useEffect, useRef } from 'react';
import { AdBanner, AdSlot } from './AdBanner';
import {
  useActiveAds,
  normalizeAdSlot,
  AD_SLOT_METRICS,
  DatabaseAd,
} from '../hooks/useActiveAds';
import {
  isRouteEligibleForAds,
  isSlotAllowedOnRoute,
} from '../lib/adPolicy';

export interface AdContainerProps {
  /** The designated canonical placement slot (e.g. ARTICLE_MIDDLE, ARTICLE_BOTTOM, SIDEBAR, BELOW_VIDEO, BELOW_RESULTS, HEADER) */
  placement: AdSlot;
  /** Custom additional styling classes */
  className?: string;
  /** Optional explicit route override */
  route?: string;
  /** Suppresses rendering (e.g. when Focused Reading Mode is active) */
  suppressed?: boolean;
  /** Margin around root bounding box to start pre-fetching before ad scrolls into view (default: '150px 0px') */
  rootMargin?: string;
  /** Percentage of target element visibility required to trigger load (default: 0.05) */
  threshold?: number | number[];
  /** Whether lazy loading via IntersectionObserver is enabled (default: true) */
  lazy?: boolean;
  /** If true (default), collapses slot cleanly when no active ad exists in DB */
  allowEmpty?: boolean;
  /** Custom minimum height override to reserve DOM space */
  minHeight?: number;
  /** Explicit ad payload override */
  customAd?: DatabaseAd;
  /** Callback fired when user clicks the ad */
  onAdClick?: (ad: DatabaseAd) => void;
  /** Callback fired once when the ad enters the viewport */
  onAdVisible?: (placement: AdSlot) => void;
  /** Optional content children to wrap or inject around */
  children?: React.ReactNode;
  /** Where to render the ad slot relative to children (default: 'after') */
  slotPosition?: 'before' | 'after' | 'inside';
  /** Accessible label for the ad slot container */
  ariaLabel?: string;
}

/**
 * Custom hook to detect when an element intersects the viewport.
 * Falls back safely to true if IntersectionObserver is unsupported.
 */
export function useInViewport<T extends HTMLElement = HTMLDivElement>(options: {
  rootMargin?: string;
  threshold?: number | number[];
  triggerOnce?: boolean;
  enabled?: boolean;
}) {
  const {
    rootMargin = '150px 0px',
    threshold = 0.05,
    triggerOnce = true,
    enabled = true,
  } = options;

  const [hasEnteredViewport, setHasEnteredViewport] = useState(!enabled);
  const elementRef = useRef<T | null>(null);

  useEffect(() => {
    if (!enabled) {
      setHasEnteredViewport(true);
      return;
    }

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setHasEnteredViewport(true);
      return;
    }

    const element = elementRef.current;
    if (!element) return;

    if (triggerOnce && hasEnteredViewport) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setHasEnteredViewport(true);
          if (triggerOnce) {
            observer.disconnect();
          }
        } else if (!triggerOnce) {
          setHasEnteredViewport(false);
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [rootMargin, threshold, triggerOnce, enabled, hasEnteredViewport]);

  return { elementRef, hasEnteredViewport };
}

/**
 * AdContainer Component:
 * Lazily renders responsive advertisement units using IntersectionObserver while
 * strictly enforcing route eligibility (never rendering on Homepage, Admin, Auth, or Contact routes)
 * and collapsing cleanly when no active ad is scheduled.
 */
export const AdContainer: React.FC<AdContainerProps> = ({
  placement,
  className = '',
  route,
  suppressed = false,
  rootMargin = '250px 0px',
  threshold = 0.01,
  lazy = false,
  allowEmpty = true,
  minHeight: customMinHeight,
  customAd,
  onAdClick,
  onAdVisible,
  children,
  slotPosition = 'after',
  ariaLabel,
}) => {
  const normalizedSlot = normalizeAdSlot(placement);
  const {
    ad: fetchedAd,
    eligible,
    currentRoute,
    loading,
  } = useActiveAds({
    route,
    placement,
    autoTrackImpression: false, // AdBanner tracks impression once actually mounted in viewport
  });

  const activeRoute = route || currentRoute;
  const activeAd = customAd || fetchedAd;

  const { elementRef, hasEnteredViewport } = useInViewport<HTMLDivElement>({
    rootMargin,
    threshold,
    triggerOnce: true,
    enabled: lazy,
  });

  const hasFiredVisibility = useRef(false);

  useEffect(() => {
    if (hasEnteredViewport && !hasFiredVisibility.current) {
      hasFiredVisibility.current = true;
      if (onAdVisible) {
        onAdVisible(placement);
      }
    }
  }, [hasEnteredViewport, onAdVisible, placement]);

  // Strict Route & Slot Eligibility Check
  const isPermitted =
    !suppressed &&
    eligible &&
    isRouteEligibleForAds(activeRoute) &&
    isSlotAllowedOnRoute(normalizedSlot, activeRoute);

  // If route/slot is not eligible, or if loading finished and there is no active ad, collapse cleanly
  if (!isPermitted || (!loading && !activeAd && allowEmpty)) {
    if (children) {
      return <>{children}</>;
    }
    return null;
  }

  const slotMetrics = AD_SLOT_METRICS[normalizedSlot] || {
    minHeight: 128,
    containSize: '100% 128px',
  };
  const reservedMinHeight = customMinHeight || slotMetrics.minHeight || 128;

  const containerStyle: React.CSSProperties = {
    minHeight: loading || !hasEnteredViewport ? reservedMinHeight : undefined,
    contain: 'layout',
  };

  const renderedAdSlot = (
    <div
      ref={elementRef}
      style={containerStyle}
      className={`ad-container-slot transition-opacity duration-200 relative w-full ${className}`}
      data-ad-placement={normalizedSlot}
      data-ad-loaded={hasEnteredViewport ? 'true' : 'false'}
      aria-label={ariaLabel || `Sponsored advertisement slot`}
    >
      {hasEnteredViewport ? (
        <AdBanner
          placement={placement}
          route={activeRoute}
          suppressed={suppressed}
          className="w-full"
          allowEmpty={allowEmpty}
          customAd={customAd}
          onAdClick={onAdClick}
        />
      ) : (
        <div
          className="w-full flex items-center justify-center rounded-xl bg-[#FAF6EE]/60 dark:bg-[#24140E]/40 border border-[#D4A72C]/20 p-4 select-none"
          style={{ minHeight: reservedMinHeight }}
          aria-hidden="true"
        >
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#8C6D46] dark:text-[#D4A72C]/60">
            Advertisement
          </span>
        </div>
      )}
    </div>
  );

  if (children) {
    if (slotPosition === 'before') {
      return (
        <div className="ad-container-wrapper space-y-4">
          {renderedAdSlot}
          {children}
        </div>
      );
    }

    if (slotPosition === 'inside') {
      return (
        <div className="ad-container-wrapper relative">
          {children}
          <div className="my-6">{renderedAdSlot}</div>
        </div>
      );
    }

    return (
      <div className="ad-container-wrapper space-y-4">
        {children}
        {renderedAdSlot}
      </div>
    );
  }

  return renderedAdSlot;
};

/**
 * Semantic Placement Wrappers
 */
export const InContentAd: React.FC<Omit<AdContainerProps, 'placement'> & { placement?: AdSlot }> = ({
  placement = 'ARTICLE_MIDDLE',
  ...props
}) => <AdContainer placement={placement} lazy={false} {...props} />;

export const SidebarAd: React.FC<Omit<AdContainerProps, 'placement'>> = ({
  className = '',
  ...props
}) => (
  <AdContainer
    placement="SIDEBAR"
    className={`block ${className}`}
    lazy={false}
    {...props}
  />
);

export const BelowVideoAd: React.FC<Omit<AdContainerProps, 'placement'>> = (props) => (
  <AdContainer placement="BELOW_VIDEO" lazy={false} {...props} />
);

export const BelowResultsAd: React.FC<Omit<AdContainerProps, 'placement'>> = (props) => (
  <AdContainer placement="BELOW_RESULTS" lazy={false} {...props} />
);

export const LibraryHeaderAd: React.FC<Omit<AdContainerProps, 'placement'>> = (props) => (
  <AdContainer placement="HEADER" lazy={false} {...props} />
);

export const ArticleTopAd: React.FC<Omit<AdContainerProps, 'placement'>> = (props) => (
  <AdContainer placement="ARTICLE_TOP" lazy={false} {...props} />
);

export const ArticleBottomAd: React.FC<Omit<AdContainerProps, 'placement'>> = (props) => (
  <AdContainer placement="ARTICLE_BOTTOM" lazy={false} {...props} />
);

/**
 * Determines whether a paragraph block is a safe narrative boundary after which an
 * in-content advertisement can be placed without breaking headings, Sanskrit verses,
 * quotations, lists, tables, or code blocks.
 */
export function isSafeBlockForAdAfter(blockText: string, nextBlockText?: string): boolean {
  const trimmed = (blockText || '').trim();
  if (!trimmed) return false;

  // Never place an ad immediately after a heading (#, ##, ###)
  if (/^#{1,6}\s/.test(trimmed)) return false;

  // Never place an ad immediately after a Sanskrit shloka / blockquote (>)
  if (trimmed.startsWith('>') || trimmed.startsWith('“') || trimmed.startsWith('"')) {
    return false;
  }

  // Never place an ad inside or right after a bulleted/numbered list or table or code fence
  if (
    /^[-*•]\s/.test(trimmed) ||
    /^\d+\.\s/.test(trimmed) ||
    trimmed.startsWith('|') ||
    trimmed.startsWith('```')
  ) {
    return false;
  }

  // Require the block to be a meaningful narrative paragraph (at least 100 characters)
  if (trimmed.length < 100) return false;

  // If the next block is a continuation of a blockquote or list item, avoid splitting
  if (nextBlockText) {
    const nextTrimmed = nextBlockText.trim();
    if (nextTrimmed.startsWith('>') || /^[-*•]\s/.test(nextTrimmed)) {
      return false;
    }
  }

  return true;
}

/**
 * Utility Component: Injects AdContainer slots into an array of structural blocks
 * only at safe section boundaries—never splitting headings from paragraphs,
 * and never interrupting Sanskrit verses, lists, or tables.
 */
export interface ContentWithInjectedAdsProps {
  /** Array of content paragraphs or structural blocks */
  paragraphs: string[];
  /** Render function for each paragraph block */
  renderParagraph: (text: string, index: number) => React.ReactNode;
  /** Primary placement slot to inject midway (default: ARTICLE_MIDDLE) */
  midwayPlacement?: AdSlot;
  /** Optional top placement before first paragraph */
  topPlacement?: AdSlot;
  /** Optional bottom placement after last paragraph (or second in-content ad for long articles) */
  bottomPlacement?: AdSlot;
  /** Paragraph index where mid-content ad should appear (defaults to safe midway block) */
  injectIndex?: number;
  /** Suppress ads (e.g. in Focused Reading Mode) */
  suppressed?: boolean;
  /** Additional custom class for injected ad slots */
  slotClassName?: string;
}

export const ContentWithInjectedAds: React.FC<ContentWithInjectedAdsProps> = ({
  paragraphs,
  renderParagraph,
  midwayPlacement = 'ARTICLE_MIDDLE',
  topPlacement,
  bottomPlacement,
  injectIndex,
  suppressed = false,
  slotClassName = 'my-8',
}) => {
  if (!paragraphs || paragraphs.length === 0) return null;

  // Find a safe midway injection index if there are at least 2 structural blocks
  let safeMidIndex = -1;
  if (!suppressed && paragraphs.length >= 2) {
    const idealMid =
      typeof injectIndex === 'number'
        ? injectIndex
        : Math.max(0, Math.floor(paragraphs.length / 2) - 1);

    // Search outward from idealMid for a safe narrative paragraph boundary
    for (let offset = 0; offset < paragraphs.length; offset++) {
      const candidateRight = idealMid + offset;
      if (
        candidateRight >= 0 &&
        candidateRight < paragraphs.length - 1 &&
        isSafeBlockForAdAfter(paragraphs[candidateRight], paragraphs[candidateRight + 1])
      ) {
        safeMidIndex = candidateRight;
        break;
      }
      const candidateLeft = idealMid - offset;
      if (
        candidateLeft >= 0 &&
        candidateLeft < paragraphs.length - 1 &&
        isSafeBlockForAdAfter(paragraphs[candidateLeft], paragraphs[candidateLeft + 1])
      ) {
        safeMidIndex = candidateLeft;
        break;
      }
    }

    // Fallback to idealMid if no strict 100-char block matched so the mid-article ad is never skipped
    if (safeMidIndex === -1) {
      safeMidIndex = Math.min(idealMid, paragraphs.length - 1);
    }
  } else if (!suppressed && paragraphs.length === 1) {
    safeMidIndex = 0;
  }

  // Only render a second bottom ad if the article is genuinely long (>= 6 blocks)
  const shouldRenderBottomAd =
    !suppressed && Boolean(bottomPlacement) && paragraphs.length >= 6;

  return (
    <div className="content-with-injected-ads space-y-4">
      {!suppressed && topPlacement && (
        <AdContainer
          placement={topPlacement}
          suppressed={suppressed}
          lazy={false}
          className={slotClassName}
        />
      )}

      {paragraphs.map((paragraph, idx) => {
        const isInjectionPoint = !suppressed && idx === safeMidIndex;

        return (
          <React.Fragment key={idx}>
            {renderParagraph(paragraph, idx)}

            {isInjectionPoint && (
              <AdContainer
                placement={midwayPlacement}
                suppressed={suppressed}
                lazy={false}
                className={slotClassName}
              />
            )}
          </React.Fragment>
        );
      })}

      {shouldRenderBottomAd && bottomPlacement && (
        <AdContainer
          placement={bottomPlacement}
          suppressed={suppressed}
          lazy={false}
          className={slotClassName}
        />
      )}
    </div>
  );
};

export default AdContainer;
