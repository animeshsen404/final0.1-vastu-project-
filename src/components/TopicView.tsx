import React, { useEffect, useState, useMemo } from 'react';
import {
  Compass,
  BookOpen,
  Network,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Tag,
  Search,
  ChevronRight,
  Share2,
  Check,
  Home,
  FileText,
  Send,
  CheckCircle2,
} from 'lucide-react';
import {
  ArticleTopAd,
  ArticleBottomAd,
  InContentAd,
  SidebarAd,
} from './AdContainer';
import { setPageSEO, resetSEO } from '../utils/seo';
import { SHABD_KOSH_DATA, PRAKARAN_ARTICLES } from '../data/vastuData';
import { useTheme } from '../context/ThemeContext';
import { EndOfReadingMarker } from './EndOfReadingMarker';

interface RelatedEntityItem {
  relationId: number | string;
  relationType: string;
  direction: 'outgoing' | 'incoming';
  entity: {
    id: number | string;
    name: string;
    slug: string;
    sanskritName?: string | null;
    entityType: string;
    shortDefinition: string;
    imageUrl?: string | null;
  };
}

interface LinkedArticleItem {
  id: number | string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage?: string;
  publishedAt?: string;
  readingTimeMinutes?: number;
  categoryName?: string;
  categorySlug?: string;
  category?: {
    id?: number;
    name: string;
    slug: string;
  } | null;
}

interface TopicDetail {
  id: number | string;
  name: string;
  slug: string;
  sanskritName?: string | null;
  entityType: string;
  shortDefinition: string;
  description: string;
  architecturalSignificance?: string;
  practicalExample?: string;
  scripturalReference?: string;
  imageUrl?: string | null;
  articles: LinkedArticleItem[];
  relatedEntities: RelatedEntityItem[];
}

interface TopicViewProps {
  slug: string;
  onNavigate: (path: string, subTab?: string) => void;
}

export const TopicView: React.FC<TopicViewProps> = ({ slug, onNavigate }) => {
  const { isLight } = useTheme();
  const [topic, setTopic] = useState<TopicDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [glossarySearch, setGlossarySearch] = useState('');
  const [suggestedTermInput, setSuggestedTermInput] = useState('');
  const [suggestionSubmitted, setSuggestionSubmitted] = useState(false);

  const activeRoute = `/vastu-gyan-kosh/sabdkosh/${slug}`;

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    fetch(`/api/topics/${encodeURIComponent(slug)}`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(res.status === 404 ? 'Glossary term not found' : 'Failed to load glossary term');
        }
        return res.json();
      })
      .then((raw) => {
        if (!isMounted) return;
        const top = raw.topic || raw;
        const localEntry = SHABD_KOSH_DATA.find(
          (s) => s.slug === slug || s.term.toLowerCase().includes(slug.replace(/-/g, ' '))
        );

        const outgoing = (raw.relations?.outgoing || []).map((r: any) => ({
          relationId: r.relationId || r.id || Math.random(),
          relationType: r.relationType || 'HARMONIZES_WITH',
          direction: 'outgoing' as const,
          entity: {
            id: r.targetTopicId || r.id,
            name: r.name,
            slug: r.slug,
            sanskritName: r.sanskritName,
            entityType: r.entityType || 'concept',
            shortDefinition: r.summary || r.shortDefinition || '',
            imageUrl: r.imageUrl || '/emblem-circle.png',
          },
        }));

        const incoming = (raw.relations?.incoming || []).map((r: any) => ({
          relationId: r.relationId || r.id || Math.random(),
          relationType: r.relationType || 'ASSOCIATED_WITH',
          direction: 'incoming' as const,
          entity: {
            id: r.sourceTopicId || r.id,
            name: r.name,
            slug: r.slug,
            sanskritName: r.sanskritName,
            entityType: r.entityType || 'concept',
            shortDefinition: r.summary || r.shortDefinition || '',
            imageUrl: r.imageUrl || '/emblem-circle.png',
          },
        }));

        let relatedEntities: RelatedEntityItem[] =
          raw.relatedEntities || [...outgoing, ...incoming];

        if (relatedEntities.length === 0) {
          relatedEntities = SHABD_KOSH_DATA.filter((s) => s.slug !== slug)
            .slice(0, 4)
            .map((s, idx) => ({
              relationId: `rel-${idx}`,
              relationType: 'HARMONIZES_WITH',
              direction: 'outgoing' as const,
              entity: {
                id: s.id,
                name: s.term,
                slug: s.slug || s.id,
                sanskritName: s.sanskrit,
                entityType: s.category,
                shortDefinition: s.meaning,
                imageUrl: s.imageUrl || '/emblem-circle.png',
              },
            }));
        }

        let linkedArticles: LinkedArticleItem[] = (raw.articles || top.articles || []).map(
          (a: any) => ({
            id: a.id,
            title: a.title,
            slug: a.slug,
            excerpt: a.excerpt || '',
            featuredImage: a.featuredImage || '/hero-sanctuary.jpg',
            publishedAt: a.publishedAt,
            readingTimeMinutes: a.readingTimeMinutes || 7,
            category:
              a.category ||
              (a.categoryName
                ? { name: a.categoryName, slug: a.categorySlug || 'classical-vastu-vidya' }
                : null),
          })
        );

        if (linkedArticles.length === 0) {
          linkedArticles = PRAKARAN_ARTICLES.map((p) => ({
            id: p.id,
            title: p.title,
            slug: p.slug || p.id,
            excerpt: p.summary,
            featuredImage: p.imageUrl || '/hero-sanctuary.jpg',
            readingTimeMinutes: parseInt(p.readTime, 10) || 8,
            category: { name: p.category, slug: 'classical-vastu-vidya' },
          }));
        }

        const normalizedTopic: TopicDetail = {
          id: top.id,
          name: top.name || localEntry?.term || slug,
          slug: top.slug || localEntry?.slug || slug,
          sanskritName: top.sanskritName || localEntry?.sanskrit || null,
          entityType: top.entityType || localEntry?.category || 'Concept',
          shortDefinition:
            top.summary || top.shortDefinition || localEntry?.meaning || '',
          description:
            top.description ||
            localEntry?.architecturalSignificance ||
            top.summary ||
            '',
          architecturalSignificance:
            localEntry?.architecturalSignificance || top.description || '',
          practicalExample:
            localEntry?.practicalExample ||
            'Apply this Vastu principle by keeping the directional zone clean, well-ventilated, and aligned with natural sunlight.',
          scripturalReference:
            localEntry?.scripturalReference || 'Mayamatam & Samarangana Sutradhara',
          imageUrl: top.imageUrl || localEntry?.imageUrl || '/emblem-circle.png',
          articles: linkedArticles,
          relatedEntities,
        };

        setTopic(normalizedTopic);
        setLoading(false);

        setPageSEO({
          title: `${normalizedTopic.name} (${normalizedTopic.sanskritName || normalizedTopic.entityType}) — Vastu Shabd Kosh`,
          description: normalizedTopic.shortDefinition || normalizedTopic.description,
          canonicalPath: `/vastu-gyan-kosh/sabdkosh/${normalizedTopic.slug}`,
          type: 'profile',
          category: normalizedTopic.entityType,
          keywords: [
            normalizedTopic.name,
            normalizedTopic.entityType,
            'Vastu Shabd Kosh',
            'Vastu Glossary',
            ...relatedEntities.map((r) => r.entity.name),
          ],
          jsonLd: {
            '@context': 'https://schema.org',
            '@type': 'DefinedTerm',
            name: normalizedTopic.name,
            description: normalizedTopic.shortDefinition,
            inDefinedTermSet: 'Vastu Ritam Shabd Kosh Glossary',
            termCode: normalizedTopic.entityType,
          },
        });
      })
      .catch((err) => {
        if (isMounted) {
          const localMatch =
            SHABD_KOSH_DATA.find(
              (s) =>
                s.slug === slug ||
                s.id === slug ||
                (s.slug && slug.startsWith(s.slug.substring(0, 6))) ||
                (s.slug && s.slug.startsWith(slug.substring(0, 6)))
            ) || SHABD_KOSH_DATA[0];
          if (localMatch) {
            setTopic({
              id: localMatch.id,
              name: localMatch.term,
              slug: localMatch.slug || slug,
              sanskritName: localMatch.sanskrit,
              entityType: localMatch.category,
              shortDefinition: localMatch.meaning,
              description: localMatch.architecturalSignificance,
              architecturalSignificance: localMatch.architecturalSignificance,
              practicalExample: localMatch.practicalExample,
              scripturalReference: localMatch.scripturalReference,
              imageUrl: localMatch.imageUrl || '/emblem-circle.png',
              articles: PRAKARAN_ARTICLES.map((p) => ({
                id: p.id,
                title: p.title,
                slug: p.slug || p.id,
                excerpt: p.summary,
                featuredImage: p.imageUrl || '/hero-sanctuary.jpg',
                readingTimeMinutes: 8,
                category: { name: p.category, slug: 'classical-vastu-vidya' },
              })),
              relatedEntities: SHABD_KOSH_DATA.filter((s) => s.slug !== localMatch.slug)
                .slice(0, 4)
                .map((s, idx) => ({
                  relationId: `local-rel-${idx}`,
                  relationType: 'HARMONIZES_WITH',
                  direction: 'outgoing',
                  entity: {
                    id: s.id,
                    name: s.term,
                    slug: s.slug || s.id,
                    sanskritName: s.sanskrit,
                    entityType: s.category,
                    shortDefinition: s.meaning,
                    imageUrl: s.imageUrl,
                  },
                })),
            });
            setLoading(false);
            return;
          }
          setError(err.message || 'Error loading glossary term');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
      resetSEO();
    };
  }, [slug]);

  // Quick live-search filter inside Sabdkosh glossary
  const quickGlossaryMatches = useMemo(() => {
    const q = glossarySearch.trim().toLowerCase();
    if (!q) return SHABD_KOSH_DATA.filter((s) => s.slug !== slug).slice(0, 5);
    return SHABD_KOSH_DATA.filter(
      (s) =>
        s.term.toLowerCase().includes(q) ||
        s.sanskrit.includes(q) ||
        s.meaning.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [glossarySearch, slug]);

  // Bottom Related / Suggested Topics cards (with images, titles, short descriptions, and Read More links)
  const relatedTopicCards = useMemo(() => {
    const cards: Array<{
      id: string;
      type: 'Shabd Kosh Term' | 'Prakaran Article';
      title: string;
      sanskrit?: string;
      description: string;
      imageUrl: string;
      targetPath: string;
    }> = [];

    if (topic?.relatedEntities) {
      topic.relatedEntities.slice(0, 2).forEach((rel) => {
        cards.push({
          id: `term-${rel.relationId}`,
          type: 'Shabd Kosh Term',
          title: rel.entity.name,
          sanskrit: rel.entity.sanskritName || undefined,
          description: rel.entity.shortDefinition,
          imageUrl: rel.entity.imageUrl || '/emblem-circle.png',
          targetPath: `/vastu-gyan-kosh/sabdkosh/${rel.entity.slug}`,
        });
      });
    }

    if (topic?.articles && topic.articles.length > 0) {
      topic.articles.slice(0, 2).forEach((art) => {
        if (cards.length < 3) {
          cards.push({
            id: `art-${art.id}`,
            type: 'Prakaran Article',
            title: art.title,
            description: art.excerpt,
            imageUrl: art.featuredImage || '/hero-sanctuary.jpg',
            targetPath: `/vastu-gyan-kosh/prakaran/${art.slug}`,
          });
        }
      });
    }

    return cards.slice(0, 3);
  }, [topic]);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSuggestTermSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestedTermInput.trim()) return;
    setSuggestionSubmitted(true);
    setSuggestedTermInput('');
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-20 px-4 max-w-6xl mx-auto flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-[#D4A72C] border-t-transparent animate-spin mb-4" />
        <p className="font-['Cinzel',serif] text-[#D4A72C] tracking-widest uppercase text-sm">
          Opening Vastu Shabd Kosh Term...
        </p>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="min-h-screen pt-28 pb-20 px-4 max-w-4xl mx-auto text-center">
        <div className="p-10 rounded-3xl bg-[#2A0E12]/90 border-2 border-[#D4A72C]/40 shadow-2xl">
          <Compass className="w-14 h-14 text-[#E88A16] mx-auto mb-4 opacity-80" />
          <h1 className="font-['Cinzel',serif] text-2xl sm:text-3xl text-[#FFF7ED] font-bold mb-3">
            {error || 'Shabd Kosh Term Not Found'}
          </h1>
          <p className="text-[#E8D3A8]/80 mb-8 max-w-md mx-auto">
            This Sanskrit term could not be located in the Vastu Shabd Kosh dictionary.
          </p>
          <button
            onClick={() => onNavigate('/vastu-gyan-kosh/sabdkosh')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4A72C] to-[#E88A16] text-[#1A0608] font-bold text-sm hover:opacity-95 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Vastu Shabd Kosh</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* =====================================================================
            STEP 2 OF ARCHITECTURE: BREADCRUMBS + TERM TITLE + METADATA
            ===================================================================== */}
        <header
          className={`rounded-3xl border-2 p-6 sm:p-8 md:p-10 shadow-xl relative overflow-hidden ${
            isLight
              ? 'bg-gradient-to-br from-[#FFFDF9] via-[#FAF3E6] to-[#F5EADB] border-[#D4A72C]/60 text-[#2D1B14]'
              : 'bg-gradient-to-br from-[#230B0E]/95 via-[#1B070A]/95 to-[#120406]/95 border-[#D4A72C]/45 text-[#FFF7ED]'
          }`}
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0F5C55] via-[#E88A16] to-[#6B1F1F]" />

          {/* Breadcrumb Bar + Actions */}
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
                onClick={() => onNavigate('gyan-kosh', 'shabd-kosh')}
                className="hover:text-[#E88A16] transition-colors cursor-pointer"
              >
                Vastu Gyan-Kosh
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-[#D4A72C]" />
              <button
                onClick={() => onNavigate('/vastu-gyan-kosh/sabdkosh')}
                className="hover:text-[#E88A16] transition-colors cursor-pointer font-semibold"
              >
                Vastu Shabd Kosh (Dictionary)
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-[#D4A72C]" />
              <span className="text-[#E88A16] font-bold">{topic.name}</span>
            </nav>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('/vastu-gyan-kosh/sabdkosh')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-serif font-bold transition-colors cursor-pointer ${
                  isLight
                    ? 'bg-white border-[#D4A72C]/50 text-[#6B1F1F] hover:bg-amber-50'
                    : 'bg-[#2A0E12] border-[#D4A72C]/40 text-[#E8D3A8] hover:border-[#D4A72C]'
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#E88A16]" />
                <span>All Shabd Kosh Terms</span>
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
                    <span>Share Term</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Term Title & Metadata */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5 text-xs font-serif">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0F5C55] text-[#FFF7ED] border border-[#D4A72C] font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-[#E88A16]" />
                <span>Vastu Shabd Kosh · {topic.entityType.replace('_', ' ')}</span>
              </span>
              {topic.scripturalReference && (
                <span
                  className={`px-3 py-1 rounded-full border font-semibold ${
                    isLight
                      ? 'bg-amber-50 border-[#D4A72C]/50 text-[#6B1F1F]'
                      : 'bg-[#160507] border-[#D4A72C]/35 text-[#D4A72C]'
                  }`}
                >
                  Classical Source: {topic.scripturalReference}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-baseline gap-4">
              <h1
                className={`font-['Cinzel',serif] text-2xl sm:text-4xl lg:text-5xl font-black leading-tight ${
                  isLight ? 'text-[#2D1B14]' : 'text-[#FFF7ED]'
                }`}
              >
                {topic.name}
              </h1>
              {topic.sanskritName && (
                <span className="font-['Rozha_One'] text-2xl sm:text-3xl text-[#E88A16]">
                  ॥ {topic.sanskritName} ॥
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
            STEP 4 OF ARCHITECTURE: MAIN GLOSSARY CONTENT (8 Cols) + RIGHT SIDEBAR (4 Cols)
            ===================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* 4A. MAIN GLOSSARY ENTRY COLUMN (8 Cols) */}
          <article
            className={`lg:col-span-8 rounded-3xl border-2 p-6 sm:p-10 shadow-2xl space-y-8 ${
              isLight
                ? 'bg-[#FFFDF9] border-[#D4A72C]/55 text-[#2D1B14]'
                : 'bg-[#230B0E]/95 border-[#D4A72C]/40 text-[#FFF7ED]'
            }`}
          >
            {/* 1. Simple Meaning & Core Definition */}
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-serif uppercase tracking-widest text-[#E88A16] font-bold">
                <Compass className="w-4 h-4" />
                <span>Simple Meaning & Definition</span>
              </div>
              <div
                className={`p-5 sm:p-6 rounded-2xl border-l-4 border-[#E88A16] border-y border-r ${
                  isLight
                    ? 'bg-[#FAF3E6] border-[#D4A72C]/40 text-[#2D1B14]'
                    : 'bg-[#160507]/85 border-[#D4A72C]/30 text-[#FFF7ED]'
                }`}
              >
                <p className="text-lg sm:text-xl font-['Marcellus'] leading-relaxed">
                  {topic.shortDefinition}
                </p>
              </div>
            </section>

            {/* 2. Architectural Significance & Detailed Explanation */}
            <section className="space-y-4">
              <h2
                className={`font-['Cinzel',serif] text-xl sm:text-2xl font-bold pb-2 border-b ${
                  isLight
                    ? 'text-[#2D1B14] border-[#D4A72C]/40'
                    : 'text-[#FBF2E3] border-[#D4A72C]/25'
                }`}
              >
                How {topic.name} Works in Vastu Architecture
              </h2>
              <div
                className={`space-y-4 text-base sm:text-lg leading-[1.85] font-['Marcellus'] ${
                  isLight ? 'text-[#2D1B14]' : 'text-[#F5E8D3]/90'
                }`}
              >
                {(topic.description || topic.shortDefinition)
                  .split('\n\n')
                  .map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
              </div>
            </section>

            {/* 3. Practical Example for Indian Homes & Flats */}
            {topic.practicalExample && (
              <section
                className={`p-6 rounded-2xl border-2 space-y-2.5 ${
                  isLight
                    ? 'bg-emerald-50/70 border-[#0F5C55]/40 text-[#152A25]'
                    : 'bg-[#0F5C55]/25 border-[#2DD4BF]/40 text-[#FFF7ED]'
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-serif uppercase tracking-widest font-bold text-[#E88A16]">
                  <Home className="w-4 h-4" />
                  <span>Practical Example in an Indian Home or Flat</span>
                </div>
                <p className="text-base sm:text-lg font-['Marcellus'] leading-relaxed">
                  {topic.practicalExample}
                </p>
              </section>
            )}

            {/* 4. Authoritative End-of-Reading Marker (Visual Bifurcation) */}
            <EndOfReadingMarker
              type="dictionary"
              title={topic.name}
              sanskritTitle={topic.sanskritName}
              isLight={isLight}
              categoryLabel={topic.entityType.replace('_', ' ')}
            />

            {/* 5. In-Content Advertisement Slot (Explicitly Demarcated) */}
            <div className="my-6">
              <InContentAd route={activeRoute} className="my-0" />
            </div>

            {/* 6. FURTHER READING: CONNECTED TERMS AND ARTICLES (Visually Bifurcated Exploration Zone) */}
            <section
              aria-label="Further Reading"
              className={`rounded-3xl border-2 p-6 sm:p-8 shadow-xl space-y-8 transition-all ${
                isLight
                  ? 'bg-gradient-to-br from-[#FAF3E6] via-[#F6EBD8] to-[#EFE2CC] border-[#D4A72C]/60 text-[#2D1B14]'
                  : 'bg-gradient-to-br from-[#1E090D] via-[#160507] to-[#0F0304] border-[#D4A72C]/40 text-[#FFF7ED]'
              }`}
            >
              {/* Primary Header for Further Reading Zone */}
              <div className="border-b border-[#D4A72C]/35 pb-5">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-serif uppercase tracking-widest text-[#E88A16] font-bold">
                    संबंधित विषय एवं आगे का अध्ययन · Vedic Cross-References
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h2
                    className={`font-['Cinzel',serif] text-2xl sm:text-3xl font-bold ${
                      isLight ? 'text-[#2D1B14]' : 'text-[#FFF7ED]'
                    }`}
                  >
                    Further Reading: Connected Terms and Articles
                  </h2>
                  <span className="text-xs font-serif text-[#D4A72C] font-bold">
                    Curated Next Reads
                  </span>
                </div>
                <p
                  className={`text-xs sm:text-sm font-['Marcellus'] mt-2 leading-relaxed ${
                    isLight ? 'text-[#5A4545]' : 'text-[#E8D3A8]/90'
                  }`}
                >
                  Explore connected Sanskrit principles, directional concepts, and practical guides linked to{' '}
                  <strong>{topic.name}</strong>.
                </p>
              </div>

              {/* 6A. Connected Shabd Kosh Terms */}
              {topic.relatedEntities.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-[#D4A72C]/20">
                    <div className="flex items-center gap-2.5">
                      <Network className="w-5 h-5 text-[#E88A16]" />
                      <h3
                        className={`font-['Cinzel',serif] text-lg sm:text-xl font-bold ${
                          isLight ? 'text-[#2D1B14]' : 'text-[#FFF7ED]'
                        }`}
                      >
                        Related Vastu Shabd Kosh Terms
                      </h3>
                    </div>
                    <span className="text-xs font-serif text-[#D4A72C] font-semibold">
                      {topic.relatedEntities.length} Concepts
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {topic.relatedEntities.map((rel) => (
                      <button
                        key={rel.relationId}
                        onClick={() => onNavigate(`/vastu-gyan-kosh/sabdkosh/${rel.entity.slug}`)}
                        className={`text-left p-4 rounded-2xl border transition-all group cursor-pointer flex flex-col justify-between ${
                          isLight
                            ? 'bg-[#FAF3E6]/70 hover:bg-[#FAF3E6] border-[#D4A72C]/45 hover:border-[#6B1F1F]'
                            : 'bg-[#160507]/85 hover:bg-[#2F1116] border-[#D4A72C]/30 hover:border-[#D4A72C]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="text-[10px] font-serif uppercase tracking-wider px-2 py-0.5 rounded bg-[#0F5C55] text-[#FFF7ED] font-bold">
                              {rel.entity.entityType}
                            </span>
                            {rel.entity.sanskritName && (
                              <span className="text-sm font-['Yatra_One'] text-[#E88A16]">
                                {rel.entity.sanskritName}
                              </span>
                            )}
                          </div>
                          <h4
                            className={`font-['Cinzel',serif] text-base font-bold group-hover:text-[#E88A16] transition-colors mb-1 ${
                              isLight ? 'text-[#2D1B14]' : 'text-[#FFF7ED]'
                            }`}
                          >
                            {rel.entity.name}
                          </h4>
                          <p
                            className={`text-xs font-['Marcellus'] line-clamp-2 leading-relaxed ${
                              isLight ? 'text-[#5A4545]' : 'text-[#E8D3A8]/80'
                            }`}
                          >
                            {rel.entity.shortDefinition}
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-1 text-xs font-serif font-bold text-[#E88A16] mt-3 group-hover:translate-x-1 transition-transform">
                          <span>Read Definition</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 6B. Relevant Prakaran Articles Discussing This Term */}
              {topic.articles.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-[#D4A72C]/25">
                  <div className="flex items-center justify-between pb-2 border-b border-[#D4A72C]/20">
                    <div className="flex items-center gap-2.5">
                      <BookOpen className="w-5 h-5 text-[#0F5C55]" />
                      <h3
                        className={`font-['Cinzel',serif] text-lg sm:text-xl font-bold ${
                          isLight ? 'text-[#2D1B14]' : 'text-[#FFF7ED]'
                        }`}
                      >
                        Relevant Prakaran Articles on {topic.name}
                      </h3>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-[#D4A72C]/20 text-[#D4A72C] font-bold">
                      {topic.articles.length} Detailed Articles
                    </span>
                  </div>

                  <div className="space-y-4">
                    {topic.articles.map((art) => (
                      <div
                        key={art.id}
                        onClick={() => onNavigate(`/vastu-gyan-kosh/prakaran/${art.slug}`)}
                        className={`p-5 rounded-2xl border transition-all shadow-md cursor-pointer group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                          isLight
                            ? 'bg-white hover:bg-[#FAF3E6] border-[#D4A72C]/45 hover:border-[#6B1F1F]'
                            : 'bg-[#160507]/90 hover:bg-[#2E1014] border-[#D4A72C]/30 hover:border-[#D4A72C]'
                        }`}
                      >
                        <div className="space-y-1.5 max-w-xl">
                          {art.category && (
                            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#E88A16] font-bold">
                              <Tag className="w-3 h-3" />
                              <span>{art.category.name}</span>
                            </span>
                          )}
                          <h4
                            className={`font-['Cinzel',serif] text-base sm:text-lg font-bold group-hover:text-[#E88A16] transition-colors ${
                              isLight ? 'text-[#2D1B14]' : 'text-[#FFF7ED]'
                            }`}
                          >
                            {art.title}
                          </h4>
                          <p
                            className={`text-xs sm:text-sm font-['Marcellus'] line-clamp-2 leading-relaxed ${
                              isLight ? 'text-[#5A4545]' : 'text-[#E8D3A8]/80'
                            }`}
                          >
                            {art.excerpt}
                          </p>
                        </div>

                        <button
                          type="button"
                          className="px-4 py-2 rounded-xl bg-[#6B1F1F] text-[#FFF7ED] border border-[#D4A72C] text-xs font-serif font-bold inline-flex items-center gap-1.5 shrink-0 group-hover:bg-[#B94E2C] transition-colors cursor-pointer"
                        >
                          <span>Read Prakaran</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#D4A72C]" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </article>

          {/* 4B. RIGHT SIDEBAR (4 Cols): Searchable Glossary Box, Sidebar Ad, & Quick Term Links */}
          <aside className="lg:col-span-4 min-w-0 space-y-6 lg:sticky lg:top-28">
            {/* Searchable Shabd Kosh Quick Finder */}
            <div
              className={`rounded-3xl border-2 p-6 shadow-xl space-y-4 ${
                isLight
                  ? 'bg-[#FFFDF9] border-[#D4A72C]/55 text-[#2D1B14]'
                  : 'bg-[#230B0E]/95 border-[#D4A72C]/40 text-[#FFF7ED]'
              }`}
            >
              <div className="flex items-center gap-2 pb-3 border-b border-[#D4A72C]/25">
                <Search className="w-4 h-4 text-[#E88A16]" />
                <h3 className="font-['Cinzel',serif] text-sm sm:text-base font-bold uppercase tracking-wider">
                  Search Vastu Shabd Kosh
                </h3>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#D4A72C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={glossarySearch}
                  onChange={(e) => setGlossarySearch(e.target.value)}
                  placeholder="Type any Sanskrit or Vastu word..."
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs font-serif focus:outline-none ${
                    isLight
                      ? 'bg-[#FAF6EE] border-[#D4A72C]/50 text-[#2D1B14]'
                      : 'bg-[#160507] border-[#D4A72C]/40 text-[#FFF7ED]'
                  }`}
                />
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {quickGlossaryMatches.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(`/vastu-gyan-kosh/sabdkosh/${item.slug || item.id}`)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-2 cursor-pointer group ${
                      isLight
                        ? 'bg-[#FAF3E6]/60 hover:bg-[#FAF3E6] border-[#D4A72C]/35'
                        : 'bg-[#160507]/75 hover:bg-[#2F1116] border-[#D4A72C]/20'
                    }`}
                  >
                    <div className="min-w-0">
                      <div
                        className={`font-['Cinzel',serif] text-xs sm:text-sm font-bold truncate group-hover:text-[#E88A16] ${
                          isLight ? 'text-[#2D1B14]' : 'text-[#FFF7ED]'
                        }`}
                      >
                        {item.term}
                      </div>
                      <div className="text-[11px] font-['Yatra_One'] text-[#E88A16]">
                        {item.sanskrit}
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#D4A72C] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ))}
              </div>

              <button
                onClick={() => onNavigate('/vastu-gyan-kosh/sabdkosh')}
                className="w-full py-2.5 rounded-xl bg-[#E88A16] hover:bg-[#D97706] text-[#2D1B14] font-serif font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <span>Open Full Word Dictionary</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Sidebar Advertisement Slot (Synced with Admin & Database) */}
            <SidebarAd route={activeRoute} className="!block" />

            {/* Quick Jump to Prakaran Series */}
            <div
              className={`rounded-3xl border-2 p-6 shadow-xl space-y-3.5 ${
                isLight
                  ? 'bg-[#FFFDF9] border-[#D4A72C]/55 text-[#2D1B14]'
                  : 'bg-[#230B0E]/95 border-[#D4A72C]/40 text-[#FFF7ED]'
              }`}
            >
              <div className="flex items-center gap-2 pb-3 border-b border-[#D4A72C]/25">
                <FileText className="w-4 h-4 text-[#0F5C55]" />
                <h3 className="font-['Cinzel',serif] text-sm sm:text-base font-bold uppercase tracking-wider">
                  Featured Prakaran Blogs
                </h3>
              </div>

              {PRAKARAN_ARTICLES.map((art) => (
                <button
                  key={art.id}
                  onClick={() => onNavigate(`/vastu-gyan-kosh/prakaran/${art.slug || art.id}`)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all group cursor-pointer ${
                    isLight
                      ? 'bg-[#FAF3E6]/70 hover:bg-[#FAF3E6] border-[#D4A72C]/40'
                      : 'bg-[#160507]/80 hover:bg-[#2F1116] border-[#D4A72C]/25'
                  }`}
                >
                  <h4
                    className={`font-['Cinzel',serif] text-xs sm:text-sm font-bold group-hover:text-[#E88A16] leading-snug mb-1 ${
                      isLight ? 'text-[#2D1B14]' : 'text-[#FFF7ED]'
                    }`}
                  >
                    {art.title}
                  </h4>
                  <span className="inline-flex items-center gap-1 text-[11px] text-[#E88A16] font-bold">
                    <span>Read Detailed Blog</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </button>
              ))}
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
          aria-label="Related and Suggested Topics"
          className={`rounded-3xl border-2 p-6 sm:p-10 shadow-2xl space-y-8 ${
            isLight
              ? 'bg-gradient-to-br from-[#FFFDF9] via-[#FAF3E6] to-[#F5EADB] border-[#D4A72C]/60 text-[#2D1B14]'
              : 'bg-[#230B0E]/95 border-[#D4A72C]/40 text-[#FFF7ED]'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#D4A72C]/30 pb-4">
            <div>
              <span className="text-xs font-serif uppercase tracking-widest text-[#E88A16] font-bold">
                Continue Learning in Vastu Gyan-Kosh
              </span>
              <h2 className="font-['Cinzel_Decorative'] text-2xl sm:text-3xl font-black mt-1">
                Related & Suggested Topics
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('/vastu-gyan-kosh/sabdkosh')}
                className="px-3.5 py-2 rounded-xl bg-[#0F5C55] text-[#FFF7ED] text-xs font-serif font-bold border border-[#D4A72C]/50 hover:opacity-95 cursor-pointer"
              >
                All Shabd Kosh
              </button>
              <button
                onClick={() => onNavigate('/vastu-gyan-kosh/prakaran')}
                className="px-3.5 py-2 rounded-xl bg-[#6B1F1F] text-[#FFF7ED] text-xs font-serif font-bold border border-[#D4A72C]/50 hover:opacity-95 cursor-pointer"
              >
                All Prakaran
              </button>
            </div>
          </div>

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

          {/* Suggest a New Glossary Word Box */}
          <div
            className={`p-5 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 ${
              isLight
                ? 'bg-[#FAF3E6] border-[#D4A72C]/50'
                : 'bg-[#160507]/90 border-[#D4A72C]/35'
            }`}
          >
            <div className="space-y-1 text-center md:text-left">
              <h4 className="font-['Cinzel',serif] text-sm sm:text-base font-bold text-[#E88A16]">
                Missing a Vastu Word in Shabd Kosh?
              </h4>
              <p
                className={`text-xs font-['Marcellus'] ${
                  isLight ? 'text-[#5A4545]' : 'text-[#E8D3A8]/80'
                }`}
              >
                Suggest any Sanskrit or architectural Vastu term and our research desk will add a simple beginner-friendly definition.
              </p>
            </div>

            {suggestionSubmitted ? (
              <div className="px-4 py-2 rounded-xl bg-emerald-900/40 border border-emerald-500/50 text-emerald-300 text-xs font-serif font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Thank you! Your Shabd Kosh term suggestion has been received.</span>
              </div>
            ) : (
              <form
                onSubmit={handleSuggestTermSubmit}
                className="flex w-full md:w-auto items-center gap-2"
              >
                <input
                  type="text"
                  value={suggestedTermInput}
                  onChange={(e) => setSuggestedTermInput(e.target.value)}
                  placeholder="e.g., Simhadwara, Padavinyasa..."
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
                  <span>Suggest Word</span>
                </button>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
