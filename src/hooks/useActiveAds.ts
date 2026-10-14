import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CanonicalAdSlot,
  AdSlotAlias,
  normalizeAdSlot as policyNormalizeAdSlot,
  normalizeRoutePath,
  isRouteEligibleForAds,
  getRouteAdPolicy,
  isSlotAllowedOnRoute,
  RouteAdPolicyConfig,
} from '../lib/adPolicy';

export type AdSlot = CanonicalAdSlot | AdSlotAlias;

export interface DatabaseAd {
  id: number;
  title: string;
  clientName?: string;
  tagline?: string;
  description?: string;
  ctaText?: string;
  badge?: string;
  category?: string;
  imageUrl: string;
  destinationUrl: string;
  placement: string;
  adType?: 'BANNER' | 'ADSENSE' | 'CUSTOM_HTML' | string;
  adSenseSlot?: string | null;
  adSenseFormat?: string | null;
  customHtml?: string | null;
  priority?: number;
  impressions?: number;
  clicks?: number;
}

export interface UseActiveAdsOptions {
  /** Optional specific route pathname (e.g., '/knowledge', '/topic/brahmasthan'). Defaults to current browser path. */
  route?: string;
  /** Optional specific placement slot to target */
  placement?: AdSlot;
  /** Auto-record impressions when ad loads in viewport */
  autoTrackImpression?: boolean;
}

export interface UseActiveAdsResult {
  /** Map of active ads indexed by uppercase placement slot (e.g. HEADER, SIDEBAR) */
  ads: Record<string, DatabaseAd | null>;
  /** Specific ad for the requested placement slot (if options.placement was passed and eligible) */
  ad: DatabaseAd | null;
  /** Helper to get the active ad for any designated slot */
  getAdForSlot: (slot: AdSlot) => DatabaseAd | null;
  /** Whether the current route is eligible to display advertisements */
  eligible: boolean;
  /** Route-level ad policy configuration (allowed slots, max caps) */
  policy: RouteAdPolicyConfig;
  /** Normalized route pathname currently active */
  currentRoute: string;
  /** Loading state for initial route fetch */
  loading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Manually track a click on an ad */
  recordClick: (adId: number) => Promise<void>;
  /** Manually track an impression on an ad */
  recordImpression: (adId: number, placement: string) => Promise<void>;
  /** Refresh ads from database */
  refetch: () => Promise<void>;
  /** Returns reserved layout styles for designated slots to eliminate Cumulative Layout Shift (CLS) */
  getReservedSlotStyle: (slot: AdSlot) => React.CSSProperties;
}

/**
 * Standard slot normalization to match canonical database placement enum
 */
export const normalizeAdSlot = (slot: AdSlot | string): CanonicalAdSlot => {
  return policyNormalizeAdSlot(slot);
};

/**
 * Canonical dimensions and aspect constraints to preserve DOM layout
 * and guarantee 0.00 Cumulative Layout Shift (CLS) during article reading.
 */
export const AD_SLOT_METRICS: Record<
  string,
  { minHeight: number; containSize: string; defaultRatio?: string }
> = {
  HEADER: {
    minHeight: 44,
    containSize: '100% 44px',
  },
  ARTICLE_TOP: {
    minHeight: 136,
    containSize: '100% 136px',
  },
  ARTICLE_MIDDLE: {
    minHeight: 136,
    containSize: '100% 136px',
  },
  ARTICLE_BOTTOM: {
    minHeight: 136,
    containSize: '100% 136px',
  },
  BELOW_VIDEO: {
    minHeight: 128,
    containSize: '100% 128px',
  },
  BELOW_RESULTS: {
    minHeight: 128,
    containSize: '100% 128px',
  },
  SIDEBAR: {
    minHeight: 260,
    containSize: '100% 260px',
  },
  FOOTER: {
    minHeight: 68,
    containSize: '100% 68px',
  },
  STICKY_FOOTER: {
    minHeight: 80,
    containSize: '100% 80px',
  },
  MOBILE: {
    minHeight: 64,
    containSize: '100% 64px',
  },
};

// Global in-memory cache to deduplicate simultaneous requests on the same route
const routeAdsCache = new Map<
  string,
  { ads: Record<string, DatabaseAd | null>; timestamp: number }
>();
const inFlightRequests = new Map<string, Promise<Record<string, DatabaseAd | null>>>();
const recordedImpressionsSession = new Set<string>();
const CACHE_TTL_MS = 30000; // 30 seconds
const FETCH_TIMEOUT_MS = 4000; // 4-second strict non-blocking timeout

// Hook into History API once so pushState/replaceState dispatch a route change event
if (typeof window !== 'undefined') {
  const win = window as unknown as { __vastuHistoryPatched?: boolean };
  if (!win.__vastuHistoryPatched) {
    win.__vastuHistoryPatched = true;
    const origPushState = window.history.pushState;
    const origReplaceState = window.history.replaceState;

    window.history.pushState = function (...args) {
      const result = origPushState.apply(this, args);
      window.dispatchEvent(new Event('vastu_ritam_route_change'));
      return result;
    };

    window.history.replaceState = function (...args) {
      const result = origReplaceState.apply(this, args);
      window.dispatchEvent(new Event('vastu_ritam_route_change'));
      return result;
    };
  }
}

/**
 * Hook that fetches active advertisements from the backend API
 * based on the current page's route, strictly enforces homepage & private route exclusions,
 * and prevents layout shift during reading.
 */
export function useActiveAds(options: UseActiveAdsOptions = {}): UseActiveAdsResult {
  const { route: explicitRoute, placement, autoTrackImpression = true } = options;

  const [browserPath, setBrowserPath] = useState<string>(() =>
    typeof window !== 'undefined' ? window.location.pathname : '/'
  );

  // Listen to browser navigation (Back/Forward popstate + pushState/replaceState)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleRouteChange = () => {
      setBrowserPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('vastu_ritam_route_change', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('vastu_ritam_route_change', handleRouteChange);
    };
  }, []);

  const effectiveRoute = useMemo(
    () => normalizeRoutePath(explicitRoute || browserPath),
    [explicitRoute, browserPath]
  );

  const policy = useMemo(() => getRouteAdPolicy(effectiveRoute), [effectiveRoute]);
  const eligible = policy.eligible;

  const [ads, setAds] = useState<Record<string, DatabaseAd | null>>(() => {
    if (!isRouteEligibleForAds(effectiveRoute)) {
      return {};
    }
    const cached = routeAdsCache.get(effectiveRoute);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.ads;
    }
    return {};
  });

  const [loading, setLoading] = useState<boolean>(() => {
    if (!isRouteEligibleForAds(effectiveRoute)) {
      return false;
    }
    const cached = routeAdsCache.get(effectiveRoute);
    return !(cached && Date.now() - cached.timestamp < CACHE_TTL_MS);
  });

  const [error, setError] = useState<string | null>(null);

  const fetchAds = useCallback(
    async (forceRefresh = false) => {
      // Strictly never fetch or display ads on homepage, admin, auth, or contact routes
      if (!isRouteEligibleForAds(effectiveRoute)) {
        setAds({});
        setLoading(false);
        setError(null);
        return;
      }

      try {
        setError(null);

        if (!forceRefresh) {
          const cached = routeAdsCache.get(effectiveRoute);
          if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
            setAds(cached.ads);
            setLoading(false);
            return;
          }
        }

        setLoading(true);

        let requestPromise = inFlightRequests.get(effectiveRoute);
        if (!requestPromise || forceRefresh) {
          requestPromise = (async () => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

            try {
              const res = await fetch(
                `/api/ads?route=${encodeURIComponent(effectiveRoute)}`,
                { signal: controller.signal }
              );
              if (!res.ok) {
                throw new Error(`Failed to fetch active ads: HTTP ${res.status}`);
              }
              const data = await res.json();
              if (data.eligible === false) {
                return {};
              }
              return (data.adsBySlot || {}) as Record<string, DatabaseAd | null>;
            } finally {
              clearTimeout(timeoutId);
            }
          })();

          inFlightRequests.set(effectiveRoute, requestPromise);
        }

        const adsBySlot = await requestPromise;
        inFlightRequests.delete(effectiveRoute);

        routeAdsCache.set(effectiveRoute, {
          ads: adsBySlot,
          timestamp: Date.now(),
        });

        setAds(adsBySlot);
      } catch (err: any) {
        inFlightRequests.delete(effectiveRoute);
        setError(err?.message || 'Error loading ads');
        setAds({});
      } finally {
        setLoading(false);
      }
    },
    [effectiveRoute]
  );

  // Fetch when route changes
  useEffect(() => {
    fetchAds(false);
  }, [fetchAds]);

  // Listen for admin updates via custom event dispatched on ad creation/edit
  useEffect(() => {
    const handleAdsUpdated = () => {
      routeAdsCache.clear();
      inFlightRequests.clear();
      fetchAds(true);
    };

    window.addEventListener('vastu_ritam_ads_updated', handleAdsUpdated);
    return () => {
      window.removeEventListener('vastu_ritam_ads_updated', handleAdsUpdated);
    };
  }, [fetchAds]);

  // Click tracking (non-blocking)
  const recordClick = useCallback(async (adId: number) => {
    if (!adId) return;
    try {
      await fetch(`/api/ads/${adId}/click`, { method: 'POST' });
    } catch {
      // Non-blocking fire and forget
    }
  }, []);

  // Deduplicated Impression tracking per (route, slot, adId) within session
  const recordImpression = useCallback(
    async (adId: number, placementSlot: string) => {
      if (!adId || !eligible) return;
      const normalizedSlot = normalizeAdSlot(placementSlot);
      const dedupeKey = `${effectiveRoute}:${normalizedSlot}:${adId}`;
      if (recordedImpressionsSession.has(dedupeKey)) return;
      recordedImpressionsSession.add(dedupeKey);

      try {
        await fetch(`/api/ads/${adId}/impression`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            placement: normalizedSlot,
            route: effectiveRoute,
          }),
        });
      } catch {
        // Non-blocking
      }
    },
    [effectiveRoute, eligible]
  );

  const getAdForSlot = useCallback(
    (slot: AdSlot): DatabaseAd | null => {
      if (!eligible) return null;
      const normalized = normalizeAdSlot(slot);
      if (!isSlotAllowedOnRoute(normalized, effectiveRoute)) {
        return null;
      }
      return ads[normalized] || null;
    },
    [ads, eligible, effectiveRoute]
  );

  const targetNormalizedSlot = placement ? normalizeAdSlot(placement) : null;
  const specificAd = useMemo(() => {
    if (!eligible || !targetNormalizedSlot) return null;
    if (!isSlotAllowedOnRoute(targetNormalizedSlot, effectiveRoute)) {
      return null;
    }
    return ads[targetNormalizedSlot] || null;
  }, [eligible, targetNormalizedSlot, effectiveRoute, ads]);

  // Auto-record impression for target ad if present and autoTrackImpression enabled
  useEffect(() => {
    if (autoTrackImpression && eligible && specificAd && targetNormalizedSlot) {
      recordImpression(specificAd.id, targetNormalizedSlot);
    }
  }, [autoTrackImpression, eligible, specificAd, targetNormalizedSlot, recordImpression]);

  // Zero CLS style helper
  const getReservedSlotStyle = useCallback((slot: AdSlot): React.CSSProperties => {
    const norm = normalizeAdSlot(slot);
    const metrics = AD_SLOT_METRICS[norm] || { minHeight: 120, containSize: '100% 120px' };

    return {
      minHeight: `${metrics.minHeight}px`,
      containIntrinsicSize: metrics.containSize,
      contentVisibility: 'auto',
      transition: 'opacity 250ms ease, border-color 200ms ease',
    };
  }, []);

  return {
    ads,
    ad: specificAd,
    getAdForSlot,
    eligible,
    policy,
    currentRoute: effectiveRoute,
    loading,
    error,
    recordClick,
    recordImpression,
    refetch: () => fetchAds(true),
    getReservedSlotStyle,
  };
}

/** Alias export for semantic clarity */
export const useRouteAdvertisements = useActiveAds;
