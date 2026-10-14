import React, { useEffect, useState, useMemo } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Tag,
  Compass,
  BookOpen,
  Sparkles,
  Share2,
  Check,
  Clock,
  User,
  HelpCircle,
  CheckCircle2,
  Search,
  ChevronRight,
  Send,
  Layers,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  ArticleTopAd,
  ArticleBottomAd,
  SidebarAd,
  ContentWithInjectedAds,
} from './AdContainer';
import { setPageSEO, resetSEO } from '../utils/seo';
import { PRAKARAN_ARTICLES, SHABD_KOSH_DATA } from '../data/vastuData';
import { useTheme } from '../context/ThemeContext';
import { EndOfReadingMarker } from './EndOfReadingMarker';

interface EntityRef {
  id: number | string;
  name: string;
  slug: string;
  sanskritName?: string | null;
  entityType?: string;
  summary?: string;
  shortDefinition?: string;
  imageUrl?: string | null;
}

interface RelatedArticle {
  id: number | string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage?: string;
  publishedAt?: string;
  readingTimeMinutes?: number;
  category?: {
    name: string;
    slug: string;
  };
}

interface ArticleDetail {
  id: number | string;
  title: string;
  sanskritTitle?: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  authorName?: string;
  keyTakeaway?: string;
  publishedAt?: string;
  readingTimeMinutes?: number;
  categoryName?: string;
  categorySlug?: string;
  category?: {
    id?: number;
    name: string;
    slug: string;
    description?: string;
  } | null;
  entities: EntityRef[];
  relatedArticles?: RelatedArticle[];
}

interface ArticleViewProps {
  slug: string;
  onNavigate: (path: string, subTab?: string) => void;
}

/**
 * Groups raw double-newline chunks into structural reading blocks so that
 * Markdown headings (## / ###) are always bound to their immediately following
 * paragraph/list/blockquote, ensuring an advertisement is NEVER injected between
 * a section heading and its first paragraph.
 */
function groupIntoStructuralBlocks(rawContent: string): string[] {
  const rawChunks = (rawContent || '')
    .split('\n\n')
    .map((c) => c.trim())
    .filter(Boolean);

  const grouped: string[] = [];
  let pendingHeading = '';

  for (const chunk of rawChunks) {
    if (/^#{1,6}\s/.test(chunk)) {
      pendingHeading = pendingHeading ? `${pendingHeading}\n\n${chunk}` : chunk;
    } else if (pendingHeading) {
      grouped.push(`${pendingHeading}\n\n${chunk}`);
      pendingHeading = '';
    } else {
      grouped.push(chunk);
    }
  }

  if (pendingHeading) {
    if (grouped.length > 0) {
      grouped[grouped.length - 1] = `${grouped[grouped.length - 1]}\n\n${pendingHeading}`;
    } else {
      grouped.push(pendingHeading);
    }
  }

  return grouped;
}

export const ArticleView: React.FC<ArticleViewProps> = ({ slug, onNavigate }) => {
  const { isLight } = useTheme();
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [suggestedTopicInput, setSuggestedTopicInput] = useState('');
  const [suggestionSubmitted, setSuggestionSubmitted] = useState(false);
  const [focusMode, setFocusMode] = useState(false);

  const activeRoute = `/vastu-gyan-kosh/prakaran/${slug}`;

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    fetch(`/api/articles/${encodeURIComponent(slug)}`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(res.status === 404 ? 'Article not found' : 'Failed to load article');
        }
        return res.json();
      })
      .then((raw) => {
        if (!isMounted) return;
        const art = raw.article || raw;
        const fallbackLocal = PRAKARAN_ARTICLES.find(
          (p) =>
            p.slug === slug ||
            p.id === String(art.id) ||
            (p.slug && slug.startsWith(p.slug.substring(0, 12))) ||
            (p.slug && p.slug.startsWith(slug.substring(0, 12)))
        );

        const entities: EntityRef[] = (art.topics || art.entities || []).map((t: any) => {
          const localTerm = SHABD_KOSH_DATA.find((s) => s.slug === t.slug);
          return {
            id: t.id,
            name: t.name,
            slug: t.slug,
            sanskritName: t.sanskritName || localTerm?.sanskrit || '',
            entityType: t.entityType || localTerm?.category || 'Concept',
            shortDefinition:
              t.summary ||
              t.shortDefinition ||
              localTerm?.meaning ||
              'Key Vastu Shastra architectural concept.',
            imageUrl: t.imageUrl || localTerm?.imageUrl || '/emblem-circle.png',
          };
        });

        // Ensure at least 3 linked Shabd Kosh terms are available for cross-linking
        if (entities.length === 0) {
          SHABD_KOSH_DATA.slice(0, 3).forEach((s, idx) => {
            entities.push({
              id: s.id || idx + 1,
              name: s.term,
              slug: s.slug || s.term.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              sanskritName: s.sanskrit,
              entityType: s.category,
              shortDefinition: s.meaning,
              imageUrl: s.imageUrl || '/emblem-circle.png',
            });
          });
        }

        const category =
          art.category ||
          (art.categoryName
            ? { name: art.categoryName, slug: art.categorySlug || 'classical-vastu-vidya' }
            : {
                name: fallbackLocal?.category || 'Classical Vastu Vidya',
                slug: 'classical-vastu-vidya',
              });

        const relatedList: RelatedArticle[] = (
          raw.relatedArticles ||
          art.relatedArticles ||
          []
        ).map((r: any) => ({
          id: r.id,
          title: r.title,
          slug: r.slug,
          excerpt: r.excerpt || '',
          featuredImage: r.featuredImage || '/hero-sanctuary.jpg',
          readingTimeMinutes: r.readingTimeMinutes || 7,
          category: r.category || (r.categoryName ? { name: r.categoryName, slug: r.categorySlug } : undefined),
        }));

        const normalizedArticle: ArticleDetail = {
          id: art.id,
          title: art.title,
          sanskritTitle: art.sanskritTitle || fallbackLocal?.sanskritTitle,
          slug: art.slug,
          excerpt: art.excerpt || fallbackLocal?.summary || '',
          content: art.content || fallbackLocal?.content || '',
          featuredImage: art.featuredImage || fallbackLocal?.imageUrl || '/hero-sanctuary.jpg',
          authorName: art.authorName || fallbackLocal?.author || 'Vastu Ritam Research Desk',
          keyTakeaway:
            art.keyTakeaway ||
            fallbackLocal?.keyTakeaway ||
            'We do not begin with remedies. We begin with clear spatial understanding.',
          publishedAt: art.publishedAt || new Date().toISOString(),
          readingTimeMinutes: art.readingTimeMinutes || 7,
          category,
          entities,
          relatedArticles: relatedList,
        };

        setArticle(normalizedArticle);
        setLoading(false);

        setPageSEO({
          title: `${normalizedArticle.title} | Prakaran — Vastu Ritam`,
          description:
            normalizedArticle.excerpt ||
            `Read ${normalizedArticle.title} in the Vastu Ritam Prakaran Knowledge Repository.`,
          canonicalPath: `/vastu-gyan-kosh/prakaran/${normalizedArticle.slug}`,
          type: 'article',
          publishedAt: normalizedArticle.publishedAt,
          category: normalizedArticle.category?.name,
          keywords: entities.map((e) => e.name),
          jsonLd: {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: normalizedArticle.title,
            description: normalizedArticle.excerpt,
            image: normalizedArticle.featuredImage,
            datePublished: normalizedArticle.publishedAt,
            author: {
              '@type': 'Organization',
              name: normalizedArticle.authorName || 'Vastu Ritam Research Foundation',
            },
            publisher: {
              '@type': 'Organization',
              name: 'Vastu Ritam',
            },
          },
        });
      })
      .catch((err) => {
        if (isMounted) {
          // Check local PRAKARAN_ARTICLES if network/API failed
          const localMatch =
            PRAKARAN_ARTICLES.find(
              (p) =>
                p.slug === slug ||
                p.id === slug ||
                (p.slug && slug.startsWith(p.slug.substring(0, 12))) ||
                (p.slug && p.slug.startsWith(slug.substring(0, 12)))
            ) || PRAKARAN_ARTICLES[0];
          if (localMatch) {
            setArticle({
              id: localMatch.id,
              title: localMatch.title,
              sanskritTitle: localMatch.sanskritTitle,
              slug: localMatch.slug || slug,
              excerpt: localMatch.summary,
              content: localMatch.content,
              featuredImage: localMatch.imageUrl || '/hero-sanctuary.jpg',
              authorName: localMatch.author,
              keyTakeaway: localMatch.keyTakeaway,
              publishedAt: new Date().toISOString(),
              readingTimeMinutes: parseInt(localMatch.readTime, 10) || 7,
              category: { name: localMatch.category, slug: 'classical-vastu-vidya' },
              entities: SHABD_KOSH_DATA.slice(0, 4).map((s) => ({
                id: s.id,
                name: s.term,
                slug: s.slug || s.id,
                sanskritName: s.sanskrit,
                entityType: s.category,
                shortDefinition: s.meaning,
                imageUrl: s.imageUrl,
              })),
              relatedArticles: PRAKARAN_ARTICLES.filter((p) => p.slug !== localMatch.slug).map((p) => ({
                id: p.id,
                title: p.title,
                slug: p.slug || p.id,
                excerpt: p.summary,
                featuredImage: p.imageUrl || '/heaven-portal.jpg',
                readingTimeMinutes: parseInt(p.readTime, 10) || 8,
              })),
            });
            setLoading(false);
            return;
          }
          setError(err.message || 'Error loading article');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
      resetSEO();
    };
  }, [slug]);

  const sortedEntities = useMemo(() => {
    if (!article?.entities) return [];
    return [...article.entities].sort((a, b) => b.name.length - a.name.length);
  }, [article]);

  const structuralBlocks = useMemo(() => {
    if (!article?.content) return [];
    return groupIntoStructuralBlocks(article.content);
  }, [article?.content]);

  // Extract H2 headings for table of contents / quick jump
  const articleHeadings = useMemo(() => {
    if (!article?.content) return [];
    const lines = article.content.split('\n');
    return lines
      .filter((line) => line.trim().startsWith('## '))
      .map((line) => line.trim().replace('## ', ''));
  }, [article?.content]);

  // Dynamic beginner-friendly FAQs tailored to the article
  const articleFaqs = useMemo(() => {
    const title = article?.title || 'this Vastu topic';
    return [
      {
        q: `Do I need to break walls or do heavy renovation to apply the principles in "${title}"?`,
        a: `No. Authentic Vastu Shastra focuses first on natural sunlight, airflow, room usage, and keeping the center (Brahmasthana) clutter-free. Over 90% of flat and house adjustments can be done simply by organizing room functions, lighting, and furniture placement without breaking a single wall.`,
      },
      {
        q: `How does this principle apply to a modern 2BHK or 3BHK city apartment?`,
        a: `In multi-storey apartments, we evaluate the floor plan from the exact center (Brahmasthana) and the 8 directional zones. Even if you cannot change the building structure, keeping the North-East clean and well-lit while maintaining stability in the South-West creates immediate balance.`,
      },
      {
        q: `Should I buy metallic pyramids or yantras for this zone?`,
        a: `At Vastu Ritam, our core principle is "Understanding before remedies." Commercial trinkets cannot replace fresh air, hygiene, and directional balance. Understand how energy and sunlight move in your home first before introducing any external symbol.`,
      },
    ];
  }, [article?.title]);

  // Combined Related Topics Cards (Prakaran + Sabdkosh with images, short descriptions, and Read More links)
  const relatedTopicCards = useMemo(() => {
    const cards: Array<{
      id: string;
      type: 'Prakaran Article' | 'Shabd Kosh Term';
      title: string;
      sanskrit?: string;
      description: string;
      imageUrl: string;
      targetPath: string;
    }> = [];

    if (article?.relatedArticles && article.relatedArticles.length > 0) {
      article.relatedArticles.forEach((rel) => {
        cards.push({
          id: `art-${rel.id}`,
          type: 'Prakaran Article',
          title: rel.title,
          description: rel.excerpt,
          imageUrl: rel.featuredImage || '/heaven-portal.jpg',
          targetPath: `/vastu-gyan-kosh/prakaran/${rel.slug}`,
        });
      });
    } else {
      PRAKARAN_ARTICLES.filter((p) => p.slug !== slug)
        .slice(0, 2)
        .forEach((p) => {
          cards.push({
            id: `local-art-${p.id}`,
            type: 'Prakaran Article',
            title: p.title,
            sanskrit: p.sanskritTitle,
            description: p.summary,
            imageUrl: p.imageUrl || '/heaven-portal.jpg',
            targetPath: `/vastu-gyan-kosh/prakaran/${p.slug}`,
          });
        });
    }

    if (article?.entities && article.entities.length > 0) {
      article.entities.slice(0, 3).forEach((ent) => {
        if (cards.length < 3) {
          cards.push({
            id: `ent-${ent.id}`,
            type: 'Shabd Kosh Term',
            title: ent.name,
            sanskrit: ent.sanskritName || undefined,
            description: ent.shortDefinition || 'Explore the simple meaning and home example of this Vastu term.',
            imageUrl: ent.imageUrl || '/emblem-circle.png',
            targetPath: `/vastu-gyan-kosh/sabdkosh/${ent.slug}`,
          });
        }
      });
    }

    return cards.slice(0, 3);
  }, [article, slug]);

  const renderTextWithEntityLinks = (text: string) => {
    const mdLinkRegex = /\[([^\]]+)\]\(\/topic\/([a-z0-9-]+)\)/gi;
    if (mdLinkRegex.test(text)) {
      const segments: React.ReactNode[] = [];
      let lastIndex = 0;
      text.replace(mdLinkRegex, (match, label, targetSlug, offset) => {
        if (offset > lastIndex) {
          segments.push(text.slice(lastIndex, offset));
        }
        segments.push(
          <button
            key={`md-${offset}`}
            type="button"
            onClick={() => onNavigate(`/vastu-gyan-kosh/sabdkosh/${targetSlug}`)}
            className={`inline-flex items-center gap-0.5 font-semibold underline underline-offset-4 transition-colors cursor-pointer ${
              isLight
                ? 'text-[#6B1F1F] hover:text-[#B94E2C] decoration-[#D4A72C]'
                : 'text-[#D4A72C] hover:text-[#FFF7ED] decoration-[#D4A72C]/50'
            }`}
          >
            <span>{label}</span>
            <Sparkles className="w-3 h-3 text-[#E88A16] inline" />
          </button>
        );
        lastIndex = offset + match.length;
        return match;
      });
      if (lastIndex < text.length) {
        segments.push(text.slice(lastIndex));
      }
      return segments;
    }

    if (!sortedEntities.length) return text;

    const escapedNames = sortedEntities.map((e) =>
      e.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    );
    const regex = new RegExp(`\\b(${escapedNames.join('|')})\\b`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, idx) => {
      const matchedEntity = sortedEntities.find(
        (e) => e.name.toLowerCase() === part.toLowerCase()
      );
      if (matchedEntity) {
        return (
          <button
            key={idx}
            type="button"
            onClick={() => onNavigate(`/vastu-gyan-kosh/sabdkosh/${matchedEntity.slug}`)}
            title={`${matchedEntity.name}: ${matchedEntity.shortDefinition || ''}`}
            className={`font-semibold underline underline-offset-4 transition-colors cursor-pointer ${
              isLight
                ? 'text-[#6B1F1F] hover:text-[#B94E2C] decoration-[#D4A72C]'
                : 'text-[#D4A72C] hover:text-[#FFF7ED] decoration-[#D4A72C]/50'
            }`}
          >
            {part}
          </button>
        );
      }
      return <React.Fragment key={idx}>{part}</React.Fragment>;
    });
  };

  const renderSingleChunk = (trimmed: string, keyPrefix: string | number) => {
    if (trimmed.startsWith('## ')) {
      return (
        <h2
          key={keyPrefix}
          className={`font-['Cinzel',serif] text-xl sm:text-2xl md:text-3xl font-bold mt-10 mb-4 pb-2.5 border-b tracking-wide ${
            isLight
              ? 'text-[#2D1B14] border-[#D4A72C]/40'
              : 'text-[#FBF2E3] border-[#D4A72C]/25'
          }`}
        >
          {trimmed.replace('## ', '')}
        </h2>
      );
    }

    if (trimmed.startsWith('### ')) {
      return (
        <h3
          key={keyPrefix}
          className={`font-['Cinzel',serif] text-lg sm:text-xl font-bold mt-7 mb-3 ${
            isLight ? 'text-[#6B1F1F]' : 'text-[#E88A16]'
          }`}
        >
          {trimmed.replace('### ', '')}
        </h3>
      );
    }

    if (trimmed.startsWith('> ')) {
      return (
        <blockquote
          key={keyPrefix}
          className={`my-6 pl-5 border-l-4 border-[#E88A16] py-4 pr-5 rounded-r-2xl italic font-serif text-base sm:text-lg shadow-sm ${
            isLight
              ? 'bg-[#FAF3E6] text-[#2D1B14] border-y border-r border-[#D4A72C]/30'
              : 'bg-[#160507]/80 text-[#FFF7ED]/95 border-y border-r border-[#D4A72C]/20'
          }`}
        >
          {renderTextWithEntityLinks(trimmed.replace(/^>\s*/gm, ''))}
        </blockquote>
      );
    }

    if (trimmed.includes('\n- ') || trimmed.startsWith('- ')) {
      const items = trimmed
        .split('\n')
        .map((line) => line.replace(/^-\s*/, '').trim())
        .filter(Boolean);
      return (
        <ul
          key={keyPrefix}
          className="my-5 space-y-2.5 pl-6 list-disc marker:text-[#E88A16]"
        >
          {items.map((item, i) => (
            <li
              key={i}
              className={`leading-relaxed text-base sm:text-lg ${
                isLight ? 'text-[#2D1B14]' : 'text-[#F5E8D3]/90'
              }`}
            >
              {renderTextWithEntityLinks(item)}
            </li>
          ))}
        </ul>
      );
    }

    return (
      <p
        key={keyPrefix}
        className={`leading-[1.95] text-base sm:text-lg mb-6 font-['Marcellus',serif] max-w-[70ch] ${
          isLight ? 'text-[#2D1B14]' : 'text-[#F5E8D3]/90'
        }`}
      >
        {renderTextWithEntityLinks(trimmed)}
      </p>
    );
  };

  const renderStructuralBlock = (block: string, index: number) => {
    const subChunks = block
      .split('\n\n')
      .map((c) => c.trim())
      .filter(Boolean);

    return (
      <div key={index} className="structural-article-section">
        {subChunks.map((sub, subIdx) => renderSingleChunk(sub, `${index}-${subIdx}`))}
      </div>
    );
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSidebarSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sidebarSearch.trim()) {
      onNavigate(`/search?q=${encodeURIComponent(sidebarSearch.trim())}`);
    }
  };

  const handleSuggestTopicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestedTopicInput.trim()) return;
    setSuggestionSubmitted(true);
    setSuggestedTopicInput('');
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-20 px-4 max-w-6xl mx-auto flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-[#D4A72C] border-t-transparent animate-spin mb-4" />
        <p className="font-['Cinzel',serif] text-[#D4A72C] tracking-widest uppercase text-sm">
          Opening Prakaran Article...
        </p>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen pt-28 pb-20 px-4 max-w-4xl mx-auto text-center">
        <div className="p-10 rounded-3xl bg-[#2A0E12]/90 border-2 border-[#D4A72C]/40 shadow-2xl">
          <Compass className="w-14 h-14 text-[#E88A16] mx-auto mb-4 opacity-80" />
          <h1 className="font-['Cinzel',serif] text-2xl sm:text-3xl text-[#FFF7ED] font-bold mb-3">
            {error || 'Prakaran Article Not Found'}
          </h1>
          <p className="text-[#E8D3A8]/80 mb-8 max-w-md mx-auto">
            The requested article could not be found in Vastu Gyan-Kosh.
          </p>
          <button
            onClick={() => onNavigate('/vastu-gyan-kosh/prakaran')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4A72C] to-[#E88A16] text-[#1A0608] font-bold text-sm hover:opacity-95 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Prakaran Articles</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* =====================================================================
            STEP 2 OF ARCHITECTURE: BREADCRUMBS + ARTICLE TITLE + METADATA
            ===================================================================== */}
        <header
          className={`rounded-3xl border-2 p-6 sm:p-8 md:p-10 shadow-xl relative overflow-hidden ${
            isLight
              ? 'bg-gradient-to-br from-[#FFFDF9] via-[#FAF3E6] to-[#F5EADB] border-[#D4A72C]/60 text-[#2D1B14]'
              : 'bg-gradient-to-br from-[#230B0E]/95 via-[#1B070A]/95 to-[#120406]/95 border-[#D4A72C]/45 text-[#FFF7ED]'
          }`}
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#6B1F1F] via-[#E88A16] to-[#0F5C55]" />

          {/* Breadcrumb Bar + Share Button */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-5 mb-5 border-b border-[#D4A72C]/30">
            <nav
              aria-label="Breadcrumb"
              className={`flex flex-wrap items-center gap-1.5 text-xs sm:text-sm font-serif ${
                isLight ? 'text-[#5A4545]' : 'text-[#E8D3A8]/85'
              }`}
            >
              <button
                onClick={() => onNavigate('/')}
                className="hover:text-[#E88A16] transition-colors cursor-pointer"
              >
                Home
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-[#D4A72C]" />
              <button
                onClick={() => onNavigate('gyan-kosh', 'prakaran')}
                className="hover:text-[#E88A16] transition-colors cursor-pointer"
              >
                Vastu Gyan-Kosh
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-[#D4A72C]" />
              <button
                onClick={() => onNavigate('/vastu-gyan-kosh/prakaran')}
                className="hover:text-[#E88A16] transition-colors cursor-pointer font-semibold"
              >
                Prakaran (Articles)
              </button>
              {article.category && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-[#D4A72C]" />
                  <button
                    onClick={() => onNavigate(`/category/${article.category!.slug}`)}
                    className="text-[#E88A16] hover:underline cursor-pointer font-bold"
                  >
                    {article.category.name}
                  </button>
                </>
              )}
            </nav>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('/vastu-gyan-kosh/prakaran')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-serif font-bold transition-colors cursor-pointer ${
                  isLight
                    ? 'bg-white border-[#D4A72C]/50 text-[#6B1F1F] hover:bg-amber-50'
                    : 'bg-[#2A0E12] border-[#D4A72C]/40 text-[#E8D3A8] hover:border-[#D4A72C]'
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#E88A16]" />
                <span>All Prakaran</span>
              </button>

              <button
                type="button"
                onClick={() => setFocusMode(!focusMode)}
                title={focusMode ? 'Exit Distraction-Free Reading' : 'Enable Distraction-Free Reading Mode'}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-serif font-bold transition-all cursor-pointer ${
                  focusMode
                    ? 'bg-[#E88A16] text-[#2D1B14] border-[#B94E2C] shadow-sm font-black'
                    : isLight
                    ? 'bg-white border-[#D4A72C]/50 text-[#2D1B14] hover:bg-amber-50'
                    : 'bg-[#2A0E12] border-[#D4A72C]/40 text-[#E8D3A8] hover:border-[#D4A72C]'
                }`}
              >
                {focusMode ? (
                  <>
                    <Eye className="w-3.5 h-3.5 text-[#6B1F1F]" />
                    <span>Focus Mode ON</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3.5 h-3.5 text-[#E88A16]" />
                    <span>Reading Focus</span>
                  </>
                )}
              </button>

              <button
                onClick={handleShare}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-serif font-bold transition-colors cursor-pointer ${
                  isLight
                    ? 'bg-[#6B1F1F] text-[#FFF7ED] border-[#D4A72C]'
                    : 'bg-[#2A0E12] border-[#D4A72C]/40 text-[#E8D3A8] hover:border-[#D4A72C]'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Link Copied</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-[#D4A72C]" />
                    <span>Share Article</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Article Title & Sanskrit Subtitle */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5 text-xs font-serif">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6B1F1F] text-[#FFF7ED] border border-[#D4A72C] font-bold uppercase tracking-wider">
                <BookOpen className="w-3 h-3 text-[#E88A16]" />
                <span>Prakaran Detailed Article</span>
              </span>

              {article.category && (
                <button
                  onClick={() => onNavigate(`/category/${article.category!.slug}`)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0F5C55] text-[#FFF7ED] border border-[#D4A72C]/50 font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                >
                  <Tag className="w-3 h-3 text-[#D4A72C]" />
                  <span>{article.category.name}</span>
                </button>
              )}
            </div>

            <h1
              className={`font-['Cinzel',serif] text-2xl sm:text-4xl lg:text-[2.6rem] font-black leading-tight break-words ${
                isLight ? 'text-[#2D1B14]' : 'text-[#FFF7ED]'
              }`}
            >
              {article.title}
            </h1>

            {article.sanskritTitle && (
              <div
                className={`text-lg sm:text-xl font-['Yatra_One'] ${
                  isLight ? 'text-[#6B1F1F]' : 'text-[#E88A16]'
                }`}
              >
                ॥ {article.sanskritTitle} ॥
              </div>
            )}

            {/* Metadata Row: Author, Reading Time, Published Date */}
            <div
              className={`flex flex-wrap items-center gap-4 pt-2 text-xs sm:text-sm font-serif ${
                isLight ? 'text-[#5A4545]' : 'text-[#E8D3A8]/85'
              }`}
            >
              {article.authorName && (
                <span className="inline-flex items-center gap-1.5 font-semibold">
                  <User className="w-4 h-4 text-[#E88A16]" />
                  <span>By {article.authorName}</span>
                </span>
              )}

              {article.readingTimeMinutes && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#D4A72C]" />
                  <span>{article.readingTimeMinutes} min read</span>
                </span>
              )}

              {article.publishedAt && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#D4A72C]" />
                  <span>
                    {new Date(article.publishedAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </span>
              )}
            </div>
          </div>
        </header>

        {/* =====================================================================
            STEP 3 OF ARCHITECTURE: TOP AD SLOT (Full-Width Banner Synced with DB)
            ===================================================================== */}
        <ArticleTopAd route={activeRoute} className="!my-0" />

        {/* =====================================================================
            STEP 4 OF ARCHITECTURE: MAIN ARTICLE (Left 8 Cols) + RIGHT SIDEBAR (4 Cols)
            ===================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* 4A. MAIN ARTICLE COLUMN (8 Cols) */}
          <article
            className={`lg:col-span-8 min-w-0 rounded-3xl border-2 p-5 sm:p-8 lg:p-10 shadow-2xl space-y-8 overflow-hidden ${
              isLight
                ? 'bg-[#FFFDF9] border-[#D4A72C]/55 text-[#2D1B14]'
                : 'bg-[#230B0E]/95 border-[#D4A72C]/40 text-[#FFF7ED]'
            }`}
          >
            {/* Introduction / Lead Summary Box */}
            {article.excerpt && (
              <div
                className={`p-5 sm:p-6 rounded-2xl border-l-4 border-[#E88A16] border-y border-r ${
                  isLight
                    ? 'bg-[#FAF3E6] border-[#D4A72C]/40 text-[#2D1B14]'
                    : 'bg-[#160507]/85 border-[#D4A72C]/30 text-[#E8D3A8]'
                }`}
              >
                <div className="text-xs font-serif uppercase tracking-widest font-bold text-[#E88A16] mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Article Introduction & Simple Summary</span>
                </div>
                <p className="text-base sm:text-lg leading-relaxed font-['Marcellus']">
                  {article.excerpt}
                </p>
              </div>
            )}

            {/* Featured Architectural Illustration / Visual Diagram */}
            {article.featuredImage && (
              <figure className="rounded-2xl overflow-hidden border-2 border-[#D4A72C]/40 bg-[#160507] shadow-lg">
                <div className="aspect-video w-full overflow-hidden relative">
                  <img
                    src={article.featuredImage}
                    alt={article.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/hero-sanctuary.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-[#FFF7ED] font-serif">
                    <span className="bg-[#6B1F1F]/90 px-3 py-1 rounded-lg border border-[#D4A72C]/50 font-bold">
                      ✦ Architectural Spatial Reference
                    </span>
                    <span className="hidden sm:inline text-[#E8D3A8]">
                      Vastu Ritam Research Visual
                    </span>
                  </div>
                </div>
              </figure>
            )}

            {/* Quick Section Overview (H2 Headings) */}
            {articleHeadings.length > 0 && (
              <div
                className={`p-4 sm:p-5 rounded-2xl border ${
                  isLight
                    ? 'bg-white border-[#D4A72C]/40'
                    : 'bg-[#160507]/60 border-[#D4A72C]/25'
                }`}
              >
                <div className="text-xs font-['Cinzel',serif] uppercase tracking-wider font-bold text-[#E88A16] mb-2.5 flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  <span>What You Will Learn in This Prakaran</span>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm font-serif">
                  {articleHeadings.map((h, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#D4A72C] font-bold">0{i + 1}.</span>
                      <span className={isLight ? 'text-[#2D1B14] font-medium' : 'text-[#E8D3A8]'}>
                        {h}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Main Article Body with In-Content Ad Slot (ARTICLE_MIDDLE) */}
            <div className="prose max-w-none">
              <ContentWithInjectedAds
                paragraphs={structuralBlocks}
                renderParagraph={(block, index) => renderStructuralBlock(block, index)}
                midwayPlacement="ARTICLE_MIDDLE"
                slotClassName="my-8"
              />
            </div>

            {/* Key Conclusion Box */}
            {article.keyTakeaway && (
              <div className="p-6 rounded-2xl bg-gradient-to-r from-[#2D1B14] to-[#3B1111] border-2 border-[#D4A72C] text-[#FFF7ED] shadow-xl space-y-2">
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#D4A72C] font-bold font-serif">
                  <CheckCircle2 className="w-4 h-4 text-[#E88A16]" />
                  <span>Conclusion & Key Takeaway for Your Home</span>
                </div>
                <p className="text-base sm:text-lg font-['Marcellus'] text-[#FFF7ED] leading-relaxed">
                  {article.keyTakeaway}
                </p>
              </div>
            )}

            {/* Beginner-Friendly FAQ Section */}
            <section
              aria-label="Frequently Asked Questions"
              className={`pt-6 border-t-2 border-[#D4A72C]/30 space-y-4`}
            >
              <div className="flex items-center gap-2.5">
                <HelpCircle className="w-5 h-5 text-[#E88A16]" />
                <h2
                  className={`font-['Cinzel',serif] text-xl sm:text-2xl font-bold ${
                    isLight ? 'text-[#2D1B14]' : 'text-[#FFF7ED]'
                  }`}
                >
                  Common Questions (Beginner FAQ)
                </h2>
              </div>

              <div className="space-y-3">
                {articleFaqs.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div
                      key={idx}
                      className={`rounded-2xl border transition-all overflow-hidden ${
                        isLight
                          ? 'bg-[#FAF3E6]/70 border-[#D4A72C]/40'
                          : 'bg-[#160507]/80 border-[#D4A72C]/30'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full p-4 text-left flex items-center justify-between gap-3 cursor-pointer"
                      >
                        <span
                          className={`font-serif font-bold text-sm sm:text-base ${
                            isLight ? 'text-[#2D1B14]' : 'text-[#FFF7ED]'
                          }`}
                        >
                          Q{idx + 1}: {faq.q}
                        </span>
                        <span className="w-6 h-6 rounded-full bg-[#E88A16] text-[#2D1B14] font-bold text-xs flex items-center justify-center shrink-0">
                          {isOpen ? '−' : '+'}
                        </span>
                      </button>
                      {isOpen && (
                        <div
                          className={`px-4 pb-4 pt-1 text-sm sm:text-base leading-relaxed border-t ${
                            isLight
                              ? 'text-[#5A4545] border-[#D4A72C]/20'
                              : 'text-[#E8D3A8] border-[#D4A72C]/20'
                          }`}
                        >
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Authoritative End-of-Reading Marker (Visual Bifurcation) */}
            <EndOfReadingMarker
              type="article"
              title={article.title}
              isLight={isLight}
              categoryLabel={article.category?.name}
            />
          </article>

          {/* 4B. RIGHT SIDEBAR (4 Cols): Search, Related Prakaran, Related Sabdkosh Terms, & Sidebar Ad */}
          <aside className="lg:col-span-4 min-w-0 space-y-6 lg:sticky lg:top-28">
            {/* Quick Search Box */}
            <div
              className={`rounded-3xl border-2 p-5 shadow-xl ${
                isLight
                  ? 'bg-[#FFFDF9] border-[#D4A72C]/55 text-[#2D1B14]'
                  : 'bg-[#230B0E]/95 border-[#D4A72C]/40 text-[#FFF7ED]'
              }`}
            >
              <h3 className="font-['Cinzel',serif] text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2 text-[#E88A16]">
                <Search className="w-4 h-4" />
                <span>Search Gyan-Kosh</span>
              </h3>
              <form onSubmit={handleSidebarSearchSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={sidebarSearch}
                  onChange={(e) => setSidebarSearch(e.target.value)}
                  placeholder="Search articles or terms..."
                  className={`flex-1 px-3.5 py-2 rounded-xl border text-xs font-serif focus:outline-none ${
                    isLight
                      ? 'bg-[#FAF6EE] border-[#D4A72C]/50 text-[#2D1B14]'
                      : 'bg-[#160507] border-[#D4A72C]/40 text-[#FFF7ED]'
                  }`}
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-xl bg-[#E88A16] hover:bg-[#D97706] text-[#2D1B14] font-serif font-bold text-xs cursor-pointer shrink-0"
                >
                  Find
                </button>
              </form>
            </div>

            {/* Sidebar Advertisement Slot (Synced with Admin & Database) */}
            <SidebarAd route={activeRoute} className="!block" />

            {/* Related Vastu Shabd Kosh (Glossary Terms Mentioned) */}
            <div
              className={`rounded-3xl border-2 p-6 shadow-xl ${
                isLight
                  ? 'bg-[#FFFDF9] border-[#D4A72C]/55 text-[#2D1B14]'
                  : 'bg-[#230B0E]/95 border-[#D4A72C]/40 text-[#FFF7ED]'
              }`}
            >
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#D4A72C]/25">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-[#E88A16]" />
                  <h3 className="font-['Cinzel',serif] text-sm sm:text-base font-bold uppercase tracking-wider">
                    Related Shabd Kosh Terms
                  </h3>
                </div>
              </div>

              <div className="space-y-3">
                {article.entities.map((entity) => (
                  <button
                    key={entity.id}
                    onClick={() => onNavigate(`/vastu-gyan-kosh/sabdkosh/${entity.slug}`)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all group cursor-pointer ${
                      isLight
                        ? 'bg-[#FAF3E6]/70 hover:bg-[#FAF3E6] border-[#D4A72C]/40 hover:border-[#6B1F1F]'
                        : 'bg-[#160507]/80 hover:bg-[#2F1116] border-[#D4A72C]/25 hover:border-[#D4A72C]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span
                        className={`font-['Cinzel',serif] font-bold text-sm group-hover:text-[#E88A16] transition-colors ${
                          isLight ? 'text-[#2D1B14]' : 'text-[#FFF7ED]'
                        }`}
                      >
                        {entity.name}
                      </span>
                      {entity.sanskritName && (
                        <span className="text-xs font-['Yatra_One'] text-[#E88A16]">
                          {entity.sanskritName}
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-xs line-clamp-2 leading-relaxed ${
                        isLight ? 'text-[#5A4545]' : 'text-[#E8D3A8]/80'
                      }`}
                    >
                      {entity.shortDefinition}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[11px] text-[#E88A16] font-bold mt-1.5">
                      <span>Read Meaning</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Related Prakaran Articles in Sidebar */}
            <div
              className={`rounded-3xl border-2 p-6 shadow-xl ${
                isLight
                  ? 'bg-[#FFFDF9] border-[#D4A72C]/55 text-[#2D1B14]'
                  : 'bg-[#230B0E]/95 border-[#D4A72C]/40 text-[#FFF7ED]'
              }`}
            >
              <div className="flex items-center gap-2 pb-3.5 mb-4 border-b border-[#D4A72C]/25">
                <BookOpen className="w-5 h-5 text-[#0F5C55]" />
                <h3 className="font-['Cinzel',serif] text-sm sm:text-base font-bold uppercase tracking-wider">
                  More Prakaran Articles
                </h3>
              </div>

              <div className="space-y-3">
                {(article.relatedArticles && article.relatedArticles.length > 0
                  ? article.relatedArticles
                  : PRAKARAN_ARTICLES.filter((p) => p.slug !== slug).map((p) => ({
                      id: p.id,
                      title: p.title,
                      slug: p.slug || p.id,
                      excerpt: p.summary,
                    }))
                ).map((rel) => (
                  <button
                    key={rel.id}
                    onClick={() => onNavigate(`/vastu-gyan-kosh/prakaran/${rel.slug}`)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all group cursor-pointer ${
                      isLight
                        ? 'bg-[#FAF3E6]/70 hover:bg-[#FAF3E6] border-[#D4A72C]/40 hover:border-[#6B1F1F]'
                        : 'bg-[#160507]/80 hover:bg-[#2F1116] border-[#D4A72C]/25 hover:border-[#D4A72C]'
                    }`}
                  >
                    <h4
                      className={`font-['Cinzel',serif] text-sm font-bold group-hover:text-[#E88A16] transition-colors leading-snug mb-1 ${
                        isLight ? 'text-[#2D1B14]' : 'text-[#FFF7ED]'
                      }`}
                    >
                      {rel.title}
                    </h4>
                    <p
                      className={`text-xs line-clamp-2 ${
                        isLight ? 'text-[#5A4545]' : 'text-[#E8D3A8]/75'
                      }`}
                    >
                      {rel.excerpt}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[11px] text-[#E88A16] mt-2 font-bold">
                      <span>Read Full Article</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* =====================================================================
            STEP 5 OF ARCHITECTURE: BOTTOM AD SLOT (Full-Width Banner Before Related Topics)
            ===================================================================== */}
        <ArticleBottomAd route={activeRoute} className="!my-2" />

        {/* =====================================================================
            STEP 6 OF ARCHITECTURE: RELATED / SUGGESTED TOPICS (Cards with Image, Title, Short Description & Clickable Link)
            ===================================================================== */}
        <section
          aria-label="Further Reading"
          className={`rounded-3xl border-2 p-6 sm:p-10 shadow-2xl space-y-8 ${
            isLight
              ? 'bg-gradient-to-br from-[#FAF3E6] via-[#F6EBD8] to-[#EFE2CC] border-[#D4A72C]/60 text-[#2D1B14]'
              : 'bg-[#230B0E]/95 border-[#D4A72C]/40 text-[#FFF7ED]'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#D4A72C]/30 pb-4">
            <div>
              <span className="text-xs font-serif uppercase tracking-widest text-[#E88A16] font-bold">
                संबंधित विषय एवं आगे का अध्ययन · Vedic Cross-References
              </span>
              <h2 className="font-['Cinzel',serif] text-2xl sm:text-3xl font-bold mt-1">
                Further Reading: Connected Terms and Articles
              </h2>
              <p
                className={`text-xs sm:text-sm font-['Marcellus'] mt-1.5 leading-relaxed ${
                  isLight ? 'text-[#5A4545]' : 'text-[#E8D3A8]/90'
                }`}
              >
                Curated Sanskrit dictionary terms and related Prakaran guides to deepen your understanding.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('/vastu-gyan-kosh/sabdkosh')}
                className="px-3.5 py-2 rounded-xl bg-[#0F5C55] text-[#FFF7ED] text-xs font-serif font-bold border border-[#D4A72C]/50 hover:opacity-95 cursor-pointer"
              >
                Explore Shabd Kosh
              </button>
              <button
                onClick={() => onNavigate('/vastu-gyan-kosh/prakaran')}
                className="px-3.5 py-2 rounded-xl bg-[#6B1F1F] text-[#FFF7ED] text-xs font-serif font-bold border border-[#D4A72C]/50 hover:opacity-95 cursor-pointer"
              >
                All Prakaran
              </button>
            </div>
          </div>

          {/* 3-Column Visual Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedTopicCards.map((card) => (
              <div
                key={card.id}
                onClick={() => onNavigate(card.targetPath)}
                className={`rounded-2xl border-2 overflow-hidden shadow-lg hover:shadow-2xl transition-all group cursor-pointer flex flex-col justify-between ${
                  isLight
                    ? 'bg-white border-[#D4A72C]/50 hover:border-[#6B1F1F]'
                    : 'bg-[#160507]/90 border-[#D4A72C]/35 hover:border-[#D4A72C]'
                }`}
              >
                <div>
                  <div className="aspect-video w-full overflow-hidden bg-[#1A0F0A] relative">
                    <img
                      src={card.imageUrl}
                      alt={card.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/hero-sanctuary.jpg';
                      }}
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[#2D1B14]/90 text-[#D4A72C] border border-[#D4A72C]/50 text-[10px] font-serif uppercase tracking-wider font-bold">
                      {card.type}
                    </span>
                  </div>

                  <div className="p-5 space-y-2">
                    <h3
                      className={`font-['Cinzel',serif] text-base sm:text-lg font-bold group-hover:text-[#E88A16] transition-colors line-clamp-2 ${
                        isLight ? 'text-[#2D1B14]' : 'text-[#FFF7ED]'
                      }`}
                    >
                      {card.title}
                    </h3>
                    {card.sanskrit && (
                      <div className="text-xs font-['Yatra_One'] text-[#E88A16]">
                        {card.sanskrit}
                      </div>
                    )}
                    <p
                      className={`text-xs sm:text-sm font-['Marcellus'] line-clamp-3 leading-relaxed ${
                        isLight ? 'text-[#5A4545]' : 'text-[#E8D3A8]/85'
                      }`}
                    >
                      {card.description}
                    </p>
                  </div>
                </div>

                <div
                  className={`px-5 py-3.5 border-t flex items-center justify-between text-xs font-serif font-bold ${
                    isLight
                      ? 'border-[#D4A72C]/25 text-[#6B1F1F]'
                      : 'border-[#D4A72C]/20 text-[#D4A72C]'
                  }`}
                >
                  <span>Read More</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#E88A16]" />
                </div>
              </div>
            ))}
          </div>

          {/* Suggest a New Topic Bar */}
          <div
            className={`p-5 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 ${
              isLight
                ? 'bg-[#FAF3E6] border-[#D4A72C]/50'
                : 'bg-[#160507]/90 border-[#D4A72C]/35'
            }`}
          >
            <div className="space-y-1 text-center md:text-left">
              <h4 className="font-['Cinzel',serif] text-sm sm:text-base font-bold text-[#E88A16]">
                Have a Vastu Question or Topic Suggestion?
              </h4>
              <p
                className={`text-xs font-['Marcellus'] ${
                  isLight ? 'text-[#5A4545]' : 'text-[#E8D3A8]/80'
                }`}
              >
                Suggest a new Prakaran article or Vastu Shabd Kosh word you would like our research team to explain in simple English.
              </p>
            </div>

            {suggestionSubmitted ? (
              <div className="px-4 py-2 rounded-xl bg-emerald-900/40 border border-emerald-500/50 text-emerald-300 text-xs font-serif font-bold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Thank you! Your topic suggestion has been recorded.</span>
              </div>
            ) : (
              <form
                onSubmit={handleSuggestTopicSubmit}
                className="flex w-full md:w-auto items-center gap-2"
              >
                <input
                  type="text"
                  value={suggestedTopicInput}
                  onChange={(e) => setSuggestedTopicInput(e.target.value)}
                  placeholder="e.g., Best direction for study table..."
                  className={`w-full md:w-64 px-3.5 py-2 rounded-xl border text-xs font-serif focus:outline-none ${
                    isLight
                      ? 'bg-white border-[#D4A72C]/60 text-[#2D1B14]'
                      : 'bg-[#230B0E] border-[#D4A72C]/40 text-[#FFF7ED]'
                  }`}
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#E88A16] hover:bg-[#D97706] text-[#2D1B14] font-serif font-bold text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Suggest Topic</span>
                </button>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
