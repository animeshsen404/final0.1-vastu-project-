/**
 * Centralized Route-Aware Advertising Policy & Frequency Governance
 * Single source of truth for Vastu Ritam advertising eligibility, route exclusions,
 * slot normalization, URL sanitization, and per-page frequency caps.
 */

export type CanonicalAdSlot =
  | 'HEADER'
  | 'ARTICLE_TOP'
  | 'ARTICLE_MIDDLE'
  | 'ARTICLE_BOTTOM'
  | 'SIDEBAR'
  | 'BELOW_VIDEO'
  | 'BELOW_RESULTS'
  | 'FOOTER'
  | 'STICKY_FOOTER'
  | 'MOBILE';

export type AdSlotAlias =
  | CanonicalAdSlot
  | 'library-top'
  | 'article-inline'
  | 'article-sidebar'
  | 'below-video'
  | 'below-results'
  | 'footer-banner';

export const ALLOWED_AD_SLOTS: ReadonlySet<CanonicalAdSlot> = new Set([
  'HEADER',
  'ARTICLE_TOP',
  'ARTICLE_MIDDLE',
  'ARTICLE_BOTTOM',
  'SIDEBAR',
  'BELOW_VIDEO',
  'BELOW_RESULTS',
  'FOOTER',
  'STICKY_FOOTER',
  'MOBILE',
]);

/**
 * Normalizes any slot identifier or legacy alias to its canonical uppercase slot name.
 */
export function normalizeAdSlot(slot: AdSlotAlias | string): CanonicalAdSlot {
  const s = String(slot || '').trim();
  const lower = s.toLowerCase();

  if (lower === 'library-top' || lower === 'header') return 'HEADER';
  if (lower === 'article-inline' || lower === 'article_middle' || lower === 'in-content') return 'ARTICLE_MIDDLE';
  if (lower === 'article-sidebar' || lower === 'sidebar') return 'SIDEBAR';
  if (lower === 'below-video' || lower === 'below_video') return 'BELOW_VIDEO';
  if (lower === 'below-results' || lower === 'below_results') return 'BELOW_RESULTS';
  if (lower === 'footer-banner' || lower === 'footer') return 'FOOTER';
  if (lower === 'article_top' || lower === 'article-top') return 'ARTICLE_TOP';
  if (lower === 'article_bottom' || lower === 'article-bottom') return 'ARTICLE_BOTTOM';
  if (lower === 'sticky_footer' || lower === 'sticky-footer') return 'STICKY_FOOTER';
  if (lower === 'mobile') return 'MOBILE';

  const upper = s.toUpperCase() as CanonicalAdSlot;
  if (ALLOWED_AD_SLOTS.has(upper)) {
    return upper;
  }
  return 'ARTICLE_MIDDLE';
}

/**
 * Normalizes a URL path or route identifier to a canonical pathname.
 * Strips query strings, hashes, and trailing slashes (except root '/').
 */
export function normalizeRoutePath(rawRoute?: string | null): string {
  if (!rawRoute || typeof rawRoute !== 'string') {
    return '/';
  }

  let path = rawRoute.trim();

  // Handle PageType identifiers passed directly (e.g., 'home', 'gyan-kosh')
  if (!path.startsWith('/') && !path.startsWith('http')) {
    const pageKey = path.toLowerCase();
    if (pageKey === 'home' || pageKey === 'index' || pageKey === 'index.html') {
      return '/';
    }
    if (pageKey === 'article-detail') return '/knowledge/article';
    if (pageKey === 'topic-detail') return '/topic/entity';
    if (pageKey === 'category-detail') return '/category/collection';
    path = `/${pageKey}`;
  }

  // Extract pathname if full URL was passed
  if (path.startsWith('http://') || path.startsWith('https://')) {
    try {
      const parsed = new URL(path);
      path = parsed.pathname;
    } catch {
      path = '/';
    }
  }

  // Strip query parameters and hash fragments
  const qIndex = path.indexOf('?');
  if (qIndex !== -1) path = path.slice(0, qIndex);
  const hIndex = path.indexOf('#');
  if (hIndex !== -1) path = path.slice(0, hIndex);

  // Collapse multiple slashes
  path = path.replace(/\/+/g, '/');

  // Remove trailing slash unless root
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1);
  }

  const lower = path.toLowerCase();

  // Canonicalize homepage aliases
  if (
    lower === '' ||
    lower === '/' ||
    lower === '/home' ||
    lower === '/index' ||
    lower === '/index.html' ||
    lower === '/index.htm'
  ) {
    return '/';
  }

  return lower;
}

/**
 * Known eligible public routes & route prefixes in Vastu Ritam.
 * Note: Any unrecognized route falls back to the Homepage in App.tsx (`setCurrentPage('home')`),
 * so unknown routes must also be treated as homepage/ineligible to guarantee 0 ads on fallback.
 */
const ELIGIBLE_EXACT_ROUTES = new Set<string>([
  '/knowledge',
  '/topics',
  '/categories',
  '/search',
  '/discover',
  '/what-we-do',
  '/gyan-kosh',
  '/vastu-gyan-kosh',
  '/vastu-gyan-kosh/sabdkosh',
  '/vastu-gyan-kosh/prakaran',
  '/testimonials',
]);

const ELIGIBLE_PREFIX_ROUTES = [
  '/knowledge/',
  '/topic/',
  '/category/',
  '/vastu-gyan-kosh/sabdkosh/',
  '/vastu-gyan-kosh/prakaran/',
];

const EXCLUDED_EXACT_OR_PREFIX_ROUTES = [
  '/',
  '/home',
  '/index',
  '/index.html',
  '/admin',
  '/login',
  '/auth',
  '/signin',
  '/signup',
  '/register',
  '/logout',
  '/contact',
  '/api',
];

/**
 * Checks if a route is strictly the Homepage (including aliases or unknown fallback routes).
 */
export function isHomepageRoute(rawRoute?: string | null): boolean {
  const normalized = normalizeRoutePath(rawRoute);
  if (normalized === '/') return true;

  // Check if it is an excluded non-home route (admin, contact, auth)
  for (const prefix of EXCLUDED_EXACT_OR_PREFIX_ROUTES) {
    if (prefix !== '/' && (normalized === prefix || normalized.startsWith(`${prefix}/`))) {
      return false;
    }
  }

  // Check if it matches an eligible public route
  if (ELIGIBLE_EXACT_ROUTES.has(normalized)) return false;
  for (const prefix of ELIGIBLE_PREFIX_ROUTES) {
    if (normalized.startsWith(prefix) && normalized.length > prefix.length) {
      return false;
    }
  }

  // In App.tsx, any unmatched route renders HomeSection (`currentPage === 'home'`).
  // Therefore, any unrecognized route is effectively the homepage!
  return true;
}

/**
 * Determines whether advertisements are permitted on the given route.
 * Strictly excludes:
 * - Homepage (`/`, `/home`, `/index.html`, trailing slashes, unknown fallback routes)
 * - Admin CMS (`/admin`, `/admin/*`)
 * - Authentication & private workflows (`/login`, `/auth`, etc.)
 * - Contact & Consultation inquiry page (`/contact`)
 */
export function isRouteEligibleForAds(rawRoute?: string | null): boolean {
  const normalized = normalizeRoutePath(rawRoute);

  if (normalized === '/') {
    return false;
  }

  for (const excluded of EXCLUDED_EXACT_OR_PREFIX_ROUTES) {
    if (excluded !== '/' && (normalized === excluded || normalized.startsWith(`${excluded}/`))) {
      return false;
    }
  }

  if (ELIGIBLE_EXACT_ROUTES.has(normalized)) {
    return true;
  }

  for (const prefix of ELIGIBLE_PREFIX_ROUTES) {
    if (normalized.startsWith(prefix) && normalized.length > prefix.length) {
      return true;
    }
  }

  return false;
}

export interface RouteAdPolicyConfig {
  eligible: boolean;
  pageCategory:
    | 'excluded'
    | 'article-detail'
    | 'topic-detail'
    | 'category-hub'
    | 'knowledge-hub'
    | 'gyan-kosh'
    | 'search-results'
    | 'informational';
  allowedSlots: CanonicalAdSlot[];
  maxInContentAds: number;
  maxSidebarAds: number;
  maxTotalAds: number;
  allowStickyFooter: boolean;
}

/**
 * Returns the complete advertising policy and frequency caps for any given route.
 */
export function getRouteAdPolicy(rawRoute?: string | null): RouteAdPolicyConfig {
  const normalized = normalizeRoutePath(rawRoute);

  if (!isRouteEligibleForAds(normalized)) {
    return {
      eligible: false,
      pageCategory: 'excluded',
      allowedSlots: [],
      maxInContentAds: 0,
      maxSidebarAds: 0,
      maxTotalAds: 0,
      allowStickyFooter: false,
    };
  }

  // 1. Long-form Article Detail (/knowledge/:slug or /vastu-gyan-kosh/prakaran/:slug)
  if (
    normalized.startsWith('/knowledge/') ||
    normalized.startsWith('/vastu-gyan-kosh/prakaran/')
  ) {
    return {
      eligible: true,
      pageCategory: 'article-detail',
      allowedSlots: [
        'HEADER',
        'ARTICLE_TOP',
        'ARTICLE_MIDDLE',
        'ARTICLE_BOTTOM',
        'SIDEBAR',
        'BELOW_RESULTS',
      ],
      maxInContentAds: 3,
      maxSidebarAds: 1,
      maxTotalAds: 4,
      allowStickyFooter: false,
    };
  }

  // 2. Canonical Topic / Sabdkosh Detail (/topic/:slug or /vastu-gyan-kosh/sabdkosh/:slug)
  if (
    normalized.startsWith('/topic/') ||
    normalized.startsWith('/vastu-gyan-kosh/sabdkosh/')
  ) {
    return {
      eligible: true,
      pageCategory: 'topic-detail',
      allowedSlots: [
        'HEADER',
        'ARTICLE_TOP',
        'ARTICLE_MIDDLE',
        'ARTICLE_BOTTOM',
        'SIDEBAR',
        'BELOW_RESULTS',
      ],
      maxInContentAds: 3,
      maxSidebarAds: 1,
      maxTotalAds: 4,
      allowStickyFooter: false,
    };
  }

  // 3. Category Detail or Categories Index (/category/:slug, /categories)
  if (normalized === '/categories' || normalized.startsWith('/category/')) {
    return {
      eligible: true,
      pageCategory: 'category-hub',
      allowedSlots: ['HEADER', 'ARTICLE_TOP', 'BELOW_RESULTS', 'ARTICLE_BOTTOM'],
      maxInContentAds: 2,
      maxSidebarAds: 0,
      maxTotalAds: 3,
      allowStickyFooter: false,
    };
  }

  // 4. Knowledge Hub & Topics Directory (/knowledge, /topics)
  if (normalized === '/knowledge' || normalized === '/topics') {
    return {
      eligible: true,
      pageCategory: 'knowledge-hub',
      allowedSlots: ['HEADER', 'ARTICLE_TOP', 'BELOW_RESULTS', 'ARTICLE_BOTTOM'],
      maxInContentAds: 2,
      maxSidebarAds: 0,
      maxTotalAds: 3,
      allowStickyFooter: false,
    };
  }

  // 5. Gyan-Kosh Library (/gyan-kosh, /vastu-gyan-kosh, /vastu-gyan-kosh/sabdkosh, /vastu-gyan-kosh/prakaran)
  if (
    normalized === '/gyan-kosh' ||
    normalized === '/vastu-gyan-kosh' ||
    normalized === '/vastu-gyan-kosh/sabdkosh' ||
    normalized === '/vastu-gyan-kosh/prakaran'
  ) {
    return {
      eligible: true,
      pageCategory: 'gyan-kosh',
      allowedSlots: [
        'HEADER',
        'ARTICLE_TOP',
        'ARTICLE_MIDDLE',
        'ARTICLE_BOTTOM',
        'SIDEBAR',
        'BELOW_VIDEO',
        'BELOW_RESULTS',
      ],
      maxInContentAds: 2,
      maxSidebarAds: 1,
      maxTotalAds: 4,
      allowStickyFooter: false,
    };
  }

  // 6. Search Results (/search)
  if (normalized === '/search') {
    return {
      eligible: true,
      pageCategory: 'search-results',
      allowedSlots: ['HEADER', 'ARTICLE_TOP', 'BELOW_RESULTS', 'ARTICLE_BOTTOM'],
      maxInContentAds: 1,
      maxSidebarAds: 0,
      maxTotalAds: 2,
      allowStickyFooter: false,
    };
  }

  // 7. Public Informational & Interactive Tool Pages (/discover, /what-we-do, /testimonials)
  return {
    eligible: true,
    pageCategory: 'informational',
    allowedSlots: ['HEADER', 'ARTICLE_TOP', 'ARTICLE_MIDDLE', 'BELOW_RESULTS', 'ARTICLE_BOTTOM'],
    maxInContentAds: 1,
    maxSidebarAds: 0,
    maxTotalAds: 2,
    allowStickyFooter: false,
  };
}

/**
 * Checks whether a specific ad slot is permitted on a given route.
 */
export function isSlotAllowedOnRoute(
  slot: AdSlotAlias | string,
  rawRoute?: string | null
): boolean {
  const policy = getRouteAdPolicy(rawRoute);
  if (!policy.eligible) return false;

  const canonicalSlot = normalizeAdSlot(slot);
  if (canonicalSlot === 'STICKY_FOOTER' && !policy.allowStickyFooter) {
    return false;
  }

  return policy.allowedSlots.includes(canonicalSlot);
}

/**
 * Validates and sanitizes an advertisement destination URL.
 * Blocks `javascript:`, `data:`, `vbscript:`, and malformed URIs.
 */
export function sanitizeAdUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return '/knowledge';
  const trimmed = url.trim();
  if (!trimmed) return '/knowledge';

  // Allow AdSense publisher IDs where destinationUrl stores ca-pub-...
  if (trimmed.startsWith('ca-pub-')) {
    return trimmed;
  }

  // Allow safe internal relative paths
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
  } catch {
    // Fallback if invalid URL
  }

  return '/knowledge';
}

/**
 * Sanitizes custom HTML snippets for CUSTOM_HTML ads by stripping script tags and inline event handlers.
 */
export function sanitizeAdCustomHtml(html?: string | null): string {
  if (!html || typeof html !== 'string') return '';
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '');
}
