import React, { useState, useEffect, useMemo } from 'react';
import { LibraryCategory, DictionaryTerm, Article, Handbook, MythItem, PageType } from '../types';
import { SHABD_KOSH_DATA, PRAKARAN_ARTICLES, HANDBOOKS_DATA, MYTHS_DATA } from '../data/vastuData';
import { FolioReveal } from './FolioReveal';
import { HandbookAccessModal, HandbookItem } from './HandbookAccessModal';
import { HandbookViewerModal } from './HandbookViewerModal';
import {
  BookOpen,
  Search,
  Filter,
  Sparkles,
  BookMarked,
  Video,
  HelpCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Play,
  FileText,
  ChevronRight,
  ChevronLeft,
  Sliders,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Type,
  X,
  ArrowLeft,
  Clock,
  User,
  Share2,
  ExternalLink,
  Compass,
  FolderOpen,
  AlertCircle,
  RefreshCw,
  Home,
  Send,
  Layers,
  Tag,
} from 'lucide-react';
import {
  LibraryHeaderAd,
  ArticleTopAd,
  InContentAd,
  SidebarAd,
  ArticleBottomAd,
  BelowVideoAd,
  BelowResultsAd,
} from './AdContainer';
import { useTheme } from '../context/ThemeContext';
import { EndOfReadingMarker } from './EndOfReadingMarker';

interface GyanKoshSectionProps {
  initialCategory?: LibraryCategory;
  onNavigate?: (page: PageType, subTab?: string) => void;
}

const ITEMS_PER_PAGE = 6;

const DEFAULT_FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=900&q=80',
];

function slugifyTerm(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export const GyanKoshSection: React.FC<GyanKoshSectionProps> = ({
  initialCategory = 'shabd-kosh',
  onNavigate,
}) => {
  const { isLight } = useTheme();
  const [activeCategory, setActiveCategory] = useState<LibraryCategory>(initialCategory);

  // Sabdkosh state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDictFilter, setSelectedDictFilter] = useState<string>('All');
  const [sabdkoshPage, setSabdkoshPage] = useState<number>(1);
  const [dbTopics, setDbTopics] = useState<any[]>([]);

  // Prakaran state
  const [prakaranSearch, setPrakaranSearch] = useState('');
  const [selectedPrakaranCategory, setSelectedPrakaranCategory] = useState<string>('All');
  const [prakaranPage, setPrakaranPage] = useState<number>(1);
  const [dbArticles, setDbArticles] = useState<any[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Myths state
  const [activeMythId, setActiveMythId] = useState<string>('1');

  // Topic suggestion state
  const [suggestionInput, setSuggestionInput] = useState('');
  const [suggestionSubmitted, setSuggestionSubmitted] = useState(false);

  // Reading Mode State & Typography Controls
  const [isReadingMode, setIsReadingMode] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');

  // Database-Driven Video Learning State
  const [dbVideos, setDbVideos] = useState<any[]>([]);
  const [loadingVideos, setLoadingVideos] = useState<boolean>(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [activeVideoModal, setActiveVideoModal] = useState<any | null>(null);
  const [videoSearchQuery, setVideoSearchQuery] = useState<string>('');

  // Database-Driven Handbooks & Client Reading Vault State
  const [dbHandbooks, setDbHandbooks] = useState<HandbookItem[]>(HANDBOOKS_DATA as any);
  const [selectedHandbookForAccess, setSelectedHandbookForAccess] = useState<HandbookItem | null>(null);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [activeReadingHandbook, setActiveReadingHandbook] = useState<HandbookItem | null>(null);
  const [readingToken, setReadingToken] = useState<string | null>(null);
  const [isViewerModalOpen, setIsViewerModalOpen] = useState(false);

  // Sync live topics and articles from backend API (synced with Admin & Database)
  useEffect(() => {
    fetch('/api/topics')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.topics && Array.isArray(data.topics)) {
          setDbTopics(data.topics);
        }
      })
      .catch(() => {});

    fetch('/api/articles?limit=50')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.articles && Array.isArray(data.articles)) {
          setDbArticles(data.articles);
        }
      })
      .catch(() => {});
  }, []);

  const fetchDatabaseHandbooks = async () => {
    try {
      const res = await fetch('/api/handbooks');
      if (res.ok) {
        const data = await res.json();
        if (data.handbooks && data.handbooks.length > 0) {
          setDbHandbooks(data.handbooks);
        }
      }
    } catch (err) {
      console.warn('Using fallback handbooks:', err);
    }
  };

  const handleReadHandbookClick = (hb: HandbookItem) => {
    let savedToken: string | null = null;
    try {
      savedToken = sessionStorage.getItem(`vr_hb_token_${hb.id}`);
    } catch {}

    if (savedToken) {
      setActiveReadingHandbook(hb);
      setReadingToken(savedToken);
      setIsViewerModalOpen(true);
    } else {
      setSelectedHandbookForAccess(hb);
      setIsAccessModalOpen(true);
    }
  };

  const handleAccessGranted = (token: string, hb: HandbookItem) => {
    setIsAccessModalOpen(false);
    setSelectedHandbookForAccess(null);
    setActiveReadingHandbook(hb);
    setReadingToken(token);
    setIsViewerModalOpen(true);
  };

  useEffect(() => {
    if (activeCategory === 'handbooks') {
      fetchDatabaseHandbooks();
    }
  }, [activeCategory]);

  const fetchDatabaseVideos = async () => {
    try {
      setLoadingVideos(true);
      setVideoError(null);
      const res = await fetch('/api/videos');
      if (!res.ok) throw new Error('Failed to load video library');
      const data = await res.json();
      const rawVideos = Array.isArray(data.videos) ? data.videos : [];
      const normalized = rawVideos.map((v: any) => {
        let safeEmbed = v.embedUrl || null;
        if (!safeEmbed && v.videoUrl) {
          const ytMatch = String(v.videoUrl).match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
          const vimeoMatch = String(v.videoUrl).match(/vimeo\.com\/(?:video\/)?(\d+)/);
          if (ytMatch) safeEmbed = `https://www.youtube.com/embed/${ytMatch[1]}?rel=0`;
          else if (vimeoMatch) safeEmbed = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
        }
        return {
          ...v,
          videoProvider: v.videoProvider || v.videoPlatform || 'youtube',
          embedUrl: safeEmbed,
          thumbnailUrl: v.thumbnailUrl || '/hero-sanctuary.jpg',
        };
      });
      setDbVideos(normalized);
    } catch (err: any) {
      console.error('Error loading database videos:', err);
      setVideoError('Unable to load video archives. Please try again.');
    } finally {
      setLoadingVideos(false);
    }
  };

  useEffect(() => {
    if (activeCategory === 'videos') {
      fetchDatabaseVideos();
    }
  }, [activeCategory]);

  useEffect(() => {
    if (initialCategory) {
      setActiveCategory(initialCategory);
    }
  }, [initialCategory]);

  // Reset pagination when filters change
  useEffect(() => {
    setSabdkoshPage(1);
  }, [searchTerm, selectedDictFilter]);

  useEffect(() => {
    setPrakaranPage(1);
  }, [prakaranSearch, selectedPrakaranCategory]);

  // Merge static SHABD_KOSH_DATA with DB topics so every glossary term has a slug, image, and simple meaning
  const combinedTerms: DictionaryTerm[] = useMemo(() => {
    const list: DictionaryTerm[] = SHABD_KOSH_DATA.map((item, idx) => ({
      ...item,
      slug: item.slug || slugifyTerm(item.term),
      imageUrl: item.imageUrl || DEFAULT_FALLBACK_IMAGES[idx % DEFAULT_FALLBACK_IMAGES.length],
    }));

    dbTopics.forEach((t, idx) => {
      const slug = t.slug || slugifyTerm(t.name);
      const existingIdx = list.findIndex(
        (item) =>
          item.slug === slug ||
          item.term.toLowerCase() === (t.name || '').toLowerCase() ||
          (item.slug && slug.startsWith(item.slug.substring(0, 8))) ||
          (item.slug && item.slug.startsWith(slug.substring(0, 8)))
      );
      if (existingIdx >= 0) {
        const existing = list[existingIdx];
        list[existingIdx] = {
          ...existing,
          meaning: t.summary || t.shortDescription || existing.meaning,
          imageUrl: existing.imageUrl || t.imageUrl,
        };
      } else {
        list.push({
          id: String(t.id || list.length + 1),
          slug,
          term: t.name,
          sanskrit: t.sanskritName || 'वास्तु तत्त्वम्',
          category: 'Architecture',
          meaning: t.summary || t.shortDescription || 'Simple Vastu principle for balanced Indian homes.',
          architecturalSignificance: t.detailedDescription || t.summary || '',
          scripturalReference: 'Classical Vastu Shastra',
          imageUrl: t.imageUrl || DEFAULT_FALLBACK_IMAGES[idx % DEFAULT_FALLBACK_IMAGES.length],
        });
      }
    });

    return list;
  }, [dbTopics]);

  // Merge static PRAKARAN_ARTICLES with DB articles
  const combinedArticles: Article[] = useMemo(() => {
    const list: Article[] = PRAKARAN_ARTICLES.map((art, idx) => ({
      ...art,
      slug: art.slug || slugifyTerm(art.title),
      imageUrl: art.imageUrl || DEFAULT_FALLBACK_IMAGES[idx % DEFAULT_FALLBACK_IMAGES.length],
    }));

    dbArticles.forEach((a, idx) => {
      const slug = a.slug || slugifyTerm(a.title);
      const existingIdx = list.findIndex(
        (item) =>
          item.slug === slug ||
          item.title.toLowerCase() === (a.title || '').toLowerCase() ||
          (item.slug && slug.startsWith(item.slug.substring(0, 12))) ||
          (item.slug && item.slug.startsWith(slug.substring(0, 12)))
      );
      if (existingIdx >= 0) {
        const existing = list[existingIdx];
        list[existingIdx] = {
          ...existing,
          slug: a.slug || existing.slug,
          title: a.title || existing.title,
          summary: a.excerpt || existing.summary,
          imageUrl: a.featuredImage || a.imageUrl || existing.imageUrl,
        };
      } else {
        list.push({
          id: String(a.id || list.length + 1),
          slug,
          title: a.title,
          sanskritTitle: a.sanskritTitle || 'वास्तु प्रकरणम्',
          category: a.categoryName || 'Home & Flat Vastu',
          readTime: a.readingTimeMinutes ? `${a.readingTimeMinutes} min read` : a.readTime || '7 min read',
          author: a.authorName || a.author || 'Vastu Ritam Research Team',
          summary: a.excerpt || 'Practical, step-by-step Vastu guidance for modern Indian homes.',
          keyTakeaway: a.excerpt || 'Balanced sunlight, ventilation, and room placement create a peaceful home.',
          content: a.content || a.excerpt || '',
          imageUrl: a.featuredImage || a.imageUrl || DEFAULT_FALLBACK_IMAGES[idx % DEFAULT_FALLBACK_IMAGES.length],
        });
      }
    });

    return list;
  }, [dbArticles]);

  const libraryTabs: { id: LibraryCategory; label: string; sanskrit: string }[] = [
    { id: 'shabd-kosh', label: 'Vastu Shabd Kosh (Dictionary)', sanskrit: 'वास्तु शब्दकोशः' },
    { id: 'prakaran', label: 'Prakaran (Detailed Articles)', sanskrit: 'प्रकरणानि' },
    { id: 'handbooks', label: 'Handbooks & Guides', sanskrit: 'हस्तपुस्तिका' },
    { id: 'videos', label: 'Videos', sanskrit: 'दृश्य-माध्यम' },
    { id: 'myths', label: 'Vastu Myths & Facts', sanskrit: 'भ्रान्ति-निवारणम्' },
  ];

  // Sabdkosh categories
  const sabdkoshCategories = useMemo(() => {
    const cats = new Set<string>(['All']);
    combinedTerms.forEach((t) => {
      if (t.category) cats.add(t.category);
    });
    return Array.from(cats);
  }, [combinedTerms]);

  // Filter dictionary terms
  const filteredTerms = useMemo(() => {
    return combinedTerms.filter((item) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.term.toLowerCase().includes(q) ||
        item.sanskrit.includes(searchTerm) ||
        item.meaning.toLowerCase().includes(q) ||
        item.architecturalSignificance.toLowerCase().includes(q);
      const matchesCategory =
        selectedDictFilter === 'All' || item.category === selectedDictFilter;
      return matchesSearch && matchesCategory;
    });
  }, [combinedTerms, searchTerm, selectedDictFilter]);

  const totalSabdkoshPages = Math.max(1, Math.ceil(filteredTerms.length / ITEMS_PER_PAGE));
  const paginatedTerms = useMemo(() => {
    const start = (sabdkoshPage - 1) * ITEMS_PER_PAGE;
    return filteredTerms.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTerms, sabdkoshPage]);

  // Prakaran categories
  const prakaranCategories = useMemo(() => {
    const cats = new Set<string>(['All']);
    combinedArticles.forEach((a) => {
      if (a.category) cats.add(a.category);
    });
    return Array.from(cats);
  }, [combinedArticles]);

  // Filter Prakaran articles
  const filteredArticles = useMemo(() => {
    return combinedArticles.filter((art) => {
      const q = prakaranSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        art.title.toLowerCase().includes(q) ||
        art.summary.toLowerCase().includes(q) ||
        art.category.toLowerCase().includes(q);
      const matchesCategory =
        selectedPrakaranCategory === 'All' || art.category === selectedPrakaranCategory;
      return matchesSearch && matchesCategory;
    });
  }, [combinedArticles, prakaranSearch, selectedPrakaranCategory]);

  const totalPrakaranPages = Math.max(1, Math.ceil(filteredArticles.length / ITEMS_PER_PAGE));
  const paginatedArticles = useMemo(() => {
    const start = (prakaranPage - 1) * ITEMS_PER_PAGE;
    return filteredArticles.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredArticles, prakaranPage]);

  // Active route for AdContainer policy matching
  const currentAdRoute =
    activeCategory === 'prakaran'
      ? '/vastu-gyan-kosh/prakaran'
      : activeCategory === 'shabd-kosh'
      ? '/vastu-gyan-kosh/sabdkosh'
      : '/gyan-kosh';

  const handleTabSwitch = (tabId: LibraryCategory) => {
    setActiveCategory(tabId);
    setSelectedArticle(null);
    if (onNavigate) {
      if (tabId === 'shabd-kosh') {
        onNavigate('gyan-kosh', 'shabd-kosh');
      } else if (tabId === 'prakaran') {
        onNavigate('gyan-kosh', 'prakaran');
      } else {
        onNavigate('gyan-kosh', tabId);
      }
    }
  };

  const handleOpenSabdkoshTerm = (term: DictionaryTerm) => {
    const slug = term.slug || slugifyTerm(term.term);
    if (onNavigate) {
      onNavigate(`/vastu-gyan-kosh/sabdkosh/${slug}` as PageType, slug);
    }
  };

  const handleOpenPrakaranArticle = (article: Article) => {
    const slug = article.slug || slugifyTerm(article.title);
    if (onNavigate) {
      onNavigate(`/vastu-gyan-kosh/prakaran/${slug}` as PageType, slug);
    } else {
      setSelectedArticle(article);
    }
  };

  const handleSuggestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestionInput.trim()) return;
    setSuggestionSubmitted(true);
    setSuggestionInput('');
    setTimeout(() => setSuggestionSubmitted(false), 4500);
  };

  // Typography font size class helper
  const getFontSizeClasses = () => {
    switch (fontSize) {
      case 'large':
        return 'text-lg sm:text-xl leading-relaxed sm:leading-[2.1]';
      case 'xlarge':
        return 'text-xl sm:text-2xl leading-loose sm:leading-[2.3]';
      default:
        return 'text-base sm:text-lg leading-relaxed sm:leading-[1.9]';
    }
  };

  const renderArticleContentWithAds = (content: string) => {
    const rawParagraphs = content.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
    const paragraphs =
      rawParagraphs.length === 1 && rawParagraphs[0].includes('\n')
        ? rawParagraphs[0].split(/\n/).map((p) => p.trim()).filter(Boolean)
        : rawParagraphs;

    const breakpointIndex = paragraphs.length > 2 ? 2 : 1;
    const firstBlock = paragraphs.slice(0, breakpointIndex);
    const secondBlock = paragraphs.slice(breakpointIndex);

    return (
      <div className={`space-y-6 ${getFontSizeClasses()} font-['Marcellus'] text-[#2D1B14]`}>
        {firstBlock.map((para, idx) => (
          <p
            key={`p-start-${idx}`}
            className={`text-[#2D1B14] leading-relaxed ${
              idx === 0
                ? 'first-letter:text-4xl sm:first-letter:text-5xl first-letter:font-black first-letter:text-[#6B1F1F] first-letter:mr-2.5 first-letter:float-left first-letter:leading-none'
                : ''
            }`}
          >
            {para}
          </p>
        ))}

        {!isReadingMode && (
          <div className="my-8 py-2 not-prose select-none">
            <InContentAd route={currentAdRoute} suppressed={isReadingMode} />
          </div>
        )}

        {secondBlock.map((para, idx) => (
          <p key={`p-end-${idx}`} className="text-[#2D1B14] leading-relaxed">
            {para}
          </p>
        ))}
      </div>
    );
  };

  const renderArticleReader = (isModal: boolean = false) => {
    if (!selectedArticle) return null;

    return (
      <article
        className={`w-full bg-[#F4E5C7] text-[#2D1B14] rounded-3xl border-2 border-[#D4A72C] shadow-2xl golden-aura-strong p-6 sm:p-10 md:p-12 text-left relative overflow-hidden transition-all ${
          isModal ? 'max-w-3xl my-auto animate-in zoom-in-95 duration-200' : 'max-w-4xl mx-auto'
        }`}
      >
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#6B1F1F] via-[#E88A16] to-[#0F5C55]" />

        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#D4A72C]/60 pb-4 mb-6">
          <button
            onClick={() => {
              if (isModal) {
                setIsReadingMode(false);
              }
              setSelectedArticle(null);
            }}
            className="text-xs font-serif font-bold text-[#FFF7ED] bg-[#6B1F1F] hover:bg-[#B94E2C] flex items-center gap-1.5 cursor-pointer px-3.5 py-1.5 rounded-xl border border-[#D4A72C] shadow-md transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#D4A72C]" />
            <span>Back to Prakaran List</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#2D1B14] rounded-xl border border-[#D4A72C] p-0.5 text-xs font-serif text-[#FFF7ED] shadow-sm">
              <span className="px-2 text-[#E8D3A8] text-[10px] uppercase font-bold flex items-center gap-1">
                <Type className="w-3 h-3 text-[#D4A72C]" />
                <span className="hidden sm:inline">Text</span>
              </span>
              <button
                onClick={() => setFontSize('normal')}
                className={`px-2 py-0.5 rounded-lg text-xs cursor-pointer ${
                  fontSize === 'normal' ? 'bg-[#E88A16] text-[#2D1B14] font-bold' : 'text-[#E8D3A8]'
                }`}
              >
                A
              </button>
              <button
                onClick={() => setFontSize('large')}
                className={`px-2 py-0.5 rounded-lg text-xs cursor-pointer ${
                  fontSize === 'large' ? 'bg-[#E88A16] text-[#2D1B14] font-bold' : 'text-[#E8D3A8]'
                }`}
              >
                A+
              </button>
              <button
                onClick={() => setFontSize('xlarge')}
                className={`px-2 py-0.5 rounded-lg text-xs cursor-pointer ${
                  fontSize === 'xlarge' ? 'bg-[#E88A16] text-[#2D1B14] font-bold' : 'text-[#E8D3A8]'
                }`}
              >
                A++
              </button>
            </div>

            {isModal && (
              <button
                onClick={() => {
                  setIsReadingMode(false);
                  setSelectedArticle(null);
                }}
                className="p-1.5 rounded-xl bg-[#2D1B14] hover:bg-[#6B1F1F] text-[#D4A72C] border border-[#D4A72C] transition-colors cursor-pointer"
                title="Close Focus View"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-2 mb-6">
          <div className="flex flex-wrap items-center gap-2 text-xs font-serif">
            <span className="bg-[#6B1F1F] text-[#FFF7ED] font-bold px-3 py-1 rounded-full border border-[#D4A72C]">
              {selectedArticle.category}
            </span>
            <span className="text-[#6B1F1F]">·</span>
            <span className="flex items-center gap-1 text-[#2D1B14] font-semibold">
              <Clock className="w-3.5 h-3.5 text-[#B94E2C]" />
              <span>{selectedArticle.readTime}</span>
            </span>
            <span className="text-[#6B1F1F]">·</span>
            <span className="flex items-center gap-1 text-[#0F5C55] font-bold">
              <User className="w-3.5 h-3.5 text-[#0F5C55]" />
              <span>{selectedArticle.author}</span>
            </span>
          </div>

          <h2 className="font-['Cinzel_Decorative'] text-2xl sm:text-3xl lg:text-4xl font-black text-[#2D1B14] leading-tight">
            {selectedArticle.title}
          </h2>

          {selectedArticle.sanskritTitle && (
            <div className="text-lg sm:text-xl font-['Yatra_One'] text-[#6B1F1F] pt-0.5">
              ॥ {selectedArticle.sanskritTitle} ॥
            </div>
          )}
        </div>

        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#2D1B14] to-[#3B1111] rounded-2xl border-l-4 border-[#E88A16] border-y border-r border-[#D4A72C] mb-8 font-['Marcellus'] text-sm sm:text-base text-[#FFF7ED] shadow-xl">
          <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#D4A72C] font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#E88A16]" />
            <span>Key Takeaway:</span>
          </div>
          <p className="italic leading-relaxed text-[#E8D3A8]">{selectedArticle.keyTakeaway}</p>
        </div>

        <div className="border-t-2 border-[#D4A72C]/40 pt-6">
          {renderArticleContentWithAds(selectedArticle.content)}
        </div>

        <div className="mt-10 pt-6 border-t-2 border-[#D4A72C]/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={() => {
              setIsReadingMode(false);
              handleOpenPrakaranArticle(selectedArticle);
            }}
            className="px-5 py-2.5 rounded-xl bg-[#0F5C55] hover:bg-[#0B4640] text-[#FFF7ED] font-serif text-xs font-bold border border-[#D4A72C] shadow-md transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>Open Full Dedicated Article Page</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#D4A72C]" />
          </button>

          <button
            onClick={() => {
              if (isModal) {
                setIsReadingMode(false);
              }
              setSelectedArticle(null);
            }}
            className="px-6 py-2.5 rounded-xl bg-[#6B1F1F] hover:bg-[#B94E2C] text-[#FFF7ED] font-serif text-xs font-bold border border-[#D4A72C] shadow-md transition-all cursor-pointer"
          >
            Close Preview
          </button>
        </div>
      </article>
    );
  };

  return (
    <div className="space-y-8 transition-colors duration-300 py-4 sm:py-6">
      {/* Dimmed Background Overlay when Reading Mode is Active on an Open Article */}
      {selectedArticle && isReadingMode && (
        <div
          className="fixed inset-0 z-50 bg-[#1A0F0A]/90 backdrop-blur-md overflow-y-auto p-3 sm:p-6 md:p-8 flex justify-center items-start animate-in fade-in duration-300"
          aria-modal="true"
          role="dialog"
        >
          {renderArticleReader(true)}
        </div>
      )}

      {/* =====================================================================
          STEP 2: BREADCRUMBS + REPOSITORY TITLE + METADATA HEADER
      ====================================================================== */}
      <FolioReveal>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`rounded-3xl border-2 p-6 sm:p-8 md:p-10 shadow-xl relative overflow-hidden transition-colors ${
              isLight
                ? 'bg-gradient-to-br from-[#FFFDF9] via-[#FAF3E6] to-[#F3E5D0] border-[#D4A72C]/70 text-[#2D1B14]'
                : 'bg-gradient-to-br from-[#1C0F13] via-[#241318] to-[#160B0E] border-[#5A333C] text-[#FFF6F7] shadow-black/80'
            }`}
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#6B1F1F] via-[#E88A16] to-[#0F5C55]" />

            {/* Breadcrumbs */}
            <nav
              aria-label="Breadcrumb"
              className="flex flex-wrap items-center gap-1.5 text-xs font-serif mb-4"
            >
              <button
                onClick={() => onNavigate?.('home')}
                className={`flex items-center gap-1 hover:underline cursor-pointer ${
                  isLight ? 'text-stone-600 hover:text-[#6B1F1F]' : 'text-[#E8D3A8]/80 hover:text-[#D4A72C]'
                }`}
              >
                <Home className="w-3.5 h-3.5 text-[#E88A16]" />
                <span>Home</span>
              </button>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              <button
                onClick={() => handleTabSwitch('shabd-kosh')}
                className={`hover:underline cursor-pointer ${
                  isLight ? 'text-stone-600 hover:text-[#6B1F1F]' : 'text-[#E8D3A8]/80 hover:text-[#D4A72C]'
                }`}
              >
                Vastu Gyan-Kosh
              </button>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              <span className="font-bold text-[#E88A16]">
                {activeCategory === 'shabd-kosh'
                  ? 'Vastu Shabd Kosh (Dictionary)'
                  : activeCategory === 'prakaran'
                  ? 'Prakaran (Detailed Articles)'
                  : activeCategory === 'handbooks'
                  ? 'Handbooks & Guides'
                  : activeCategory === 'videos'
                  ? 'Video Lessons'
                  : 'Myths & Facts'}
              </span>
            </nav>

            {/* Title & Beginner-Friendly Description */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="space-y-2.5 max-w-3xl text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E88A16]/15 border border-[#E88A16]/40 text-xs font-serif font-bold text-[#E88A16]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {activeCategory === 'shabd-kosh'
                      ? 'Searchable Vastu Dictionary · Simple Word Definitions'
                      : activeCategory === 'prakaran'
                      ? 'Detailed Step-by-Step Vastu Articles & Home Guides'
                      : 'Authentic Vastu Knowledge Library'}
                  </span>
                </div>

                <h1
                  className={`font-['Cinzel_Decorative'] font-black text-2xl sm:text-4xl md:text-5xl tracking-wide leading-tight ${
                    isLight ? 'text-[#2D1B14]' : 'text-[#FFF7ED]'
                  }`}
                >
                  {activeCategory === 'shabd-kosh'
                    ? 'Vastu Shabd Kosh (Dictionary)'
                    : activeCategory === 'prakaran'
                    ? 'Prakaran (Vastu Articles)'
                    : 'Vastu Gyan-Kosh (Library)'}
                </h1>

                <p
                  className={`font-['Marcellus'] text-sm sm:text-base leading-relaxed ${
                    isLight ? 'text-stone-700' : 'text-[#E8D3A8]'
                  }`}
                >
                  {activeCategory === 'shabd-kosh'
                    ? 'Explore important Vastu words, 8 directions, and home zoning terms explained in clear, simple Indian English—with practical home examples and links to full Prakaran guides.'
                    : activeCategory === 'prakaran'
                    ? 'Read practical, in-depth Vastu articles with clear headings, room-by-room diagrams, conclusions, and beginner FAQs for modern Indian apartments and independent homes.'
                    : 'Explore Vastu Shabd Kosh (dictionary), Prakaran (detailed blog articles), handbooks, video lessons, and myth-busting guides.'}
                </p>
              </div>

              {/* Metadata Pills */}
              <div className="flex flex-wrap items-center gap-2.5 text-xs font-serif shrink-0">
                <span
                  className={`px-3.5 py-2 rounded-xl border font-bold flex items-center gap-1.5 ${
                    isLight
                      ? 'bg-white border-[#D4A72C]/60 text-[#6B1F1F]'
                      : 'bg-[#1A0F0A]/90 border-[#D4A72C]/50 text-[#D4A72C]'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#E88A16]" />
                  <span>{combinedTerms.length} Vastu Words</span>
                </span>
                <span
                  className={`px-3.5 py-2 rounded-xl border font-bold flex items-center gap-1.5 ${
                    isLight
                      ? 'bg-white border-[#D4A72C]/60 text-[#0F5C55]'
                      : 'bg-[#1A0F0A]/90 border-[#D4A72C]/50 text-[#E8D3A8]'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-[#E88A16]" />
                  <span>{combinedArticles.length} Prakaran Articles</span>
                </span>
              </div>
            </div>

            {/* Section Navigation Tabs */}
            <div className="mt-6 pt-5 border-t border-[#D4A72C]/30 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {libraryTabs.map((tab) => {
                  const isActive = activeCategory === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabSwitch(tab.id)}
                      className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all cursor-pointer font-serif flex items-center gap-2 shadow-sm ${
                        isActive
                          ? 'bg-[#E88A16] text-[#2D1B14] border-2 border-[#6B1F1F] font-black shadow-md'
                          : isLight
                          ? 'bg-white border border-[#D4A72C]/60 text-[#2D1B14] hover:bg-amber-50'
                          : 'bg-[#1A0F0A]/80 border border-[#D4A72C]/50 text-[#E8D3A8] hover:bg-[#6B1F1F] hover:text-[#FFF7ED]'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-[#6B1F1F]' : 'bg-[#D4A72C]'}`} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setIsReadingMode(!isReadingMode)}
                title={isReadingMode ? 'Disable Reading Mode' : 'Enable Distraction-Free Reading Mode'}
                className={`px-3.5 py-2 rounded-xl font-serif text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                  isReadingMode
                    ? 'bg-[#B94E2C] text-[#FFF7ED] border-[#D4A72C]'
                    : isLight
                    ? 'bg-white hover:bg-stone-100 text-[#2D1B14] border-[#D4A72C]/60'
                    : 'bg-[#1A0F0A] hover:bg-[#6B1F1F] text-[#E8D3A8] border-[#D4A72C]/60'
                }`}
              >
                {isReadingMode ? (
                  <>
                    <Eye className="w-3.5 h-3.5 text-[#D4A72C]" />
                    <span>Reading Mode ON</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3.5 h-3.5 text-[#E88A16]" />
                    <span>Reading Mode</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </FolioReveal>

      {/* =====================================================================
          STEP 3: TOP AD SLOT (Synced with Database & Admin Panel)
      ====================================================================== */}
      <FolioReveal>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ArticleTopAd route={currentAdRoute} suppressed={isReadingMode} />
        </div>
      </FolioReveal>

      {/* =====================================================================
          STEP 4: MAIN CONTENT COLUMN (8 COLS) + RIGHT SIDEBAR (4 COLS)
          Applies to both Vastu Shabd Kosh and Prakaran tabs
      ====================================================================== */}
      {(activeCategory === 'shabd-kosh' || activeCategory === 'prakaran') && (
        <FolioReveal>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* LEFT 8 COLUMNS: MAIN DIRECTORY / GLOSSARY OR PRAKARAN LIST */}
              <div className="lg:col-span-8 space-y-6">
                {/* TAB 1: VASTU SHABD KOSH (SEARCHABLE GLOSSARY) */}
                {activeCategory === 'shabd-kosh' && (
                  <div
                    className={`rounded-3xl border-2 p-6 sm:p-8 shadow-xl space-y-6 text-left ${
                      isLight ? 'bg-[#FFFDF9] border-[#D4A72C]/70 text-[#2D1B14]' : 'bg-[#1E0F14] border-[#44262E] text-[#FFF6F7]'
                    }`}
                  >
                    {/* Search & Category Filter Bar */}
                    <div className="space-y-4 border-b border-[#D4A72C]/30 pb-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <span className="text-xs font-serif uppercase tracking-wider font-bold text-[#E88A16]">
                            वास्तु शब्दकोशः · Simple Word Dictionary
                          </span>
                          <h2 className={`font-['Cinzel_Decorative'] text-xl sm:text-2xl font-bold mt-0.5 ${
                            isLight ? 'text-[#2D1B14]' : 'text-[#FFF6F7]'
                          }`}>
                            Search Vastu Words & Meanings
                          </h2>
                        </div>

                        <div className="relative w-full sm:w-72">
                          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E88A16]" />
                          <input
                            type="text"
                            placeholder="Search term (e.g. Brahmasthan, Ishanya)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`w-full pl-10 pr-8 py-2.5 rounded-xl border-2 text-xs font-['Marcellus'] transition-colors focus:outline-none ${
                              isLight
                                ? 'bg-[#FAF3E6] text-[#2D1B14] placeholder:text-stone-500 border-[#D4A72C]/70 focus:border-[#6B1F1F]'
                                : 'bg-[#28141B] text-[#FFF6F7] placeholder:text-stone-400 border-[#44262E] focus:border-[var(--color-primary)]'
                            }`}
                          />
                          {searchTerm && (
                            <button
                              onClick={() => setSearchTerm('')}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#E88A16] cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Category Filter Chips */}
                      <div className="flex flex-wrap items-center gap-2">
                        {sabdkoshCategories.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setSelectedDictFilter(cat)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-serif transition-all cursor-pointer border ${
                              selectedDictFilter === cat
                                ? 'bg-[#6B1F1F] text-[#FFF7ED] font-bold border-[#D4A72C] shadow-sm'
                                : isLight
                                ? 'bg-[#FAF3E6] border-[#D4A72C]/50 text-[#2D1B14] hover:bg-amber-100/70'
                                : 'bg-[#28141B] border-[#44262E] text-[#D1BBA2] hover:bg-[#351A24]'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Glossary Cards Grid (Paginated - 6 per page) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {paginatedTerms.map((item, idx) => {
                        const slug = item.slug || slugifyTerm(item.term);
                        const thumb =
                          item.imageUrl ||
                          DEFAULT_FALLBACK_IMAGES[idx % DEFAULT_FALLBACK_IMAGES.length];

                        return (
                          <article
                            key={item.id || slug}
                            onClick={() => handleOpenSabdkoshTerm(item)}
                            className={`group rounded-2xl border-2 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                              isLight
                                ? 'bg-[#FFFDF9] border-[#D4A72C]/60 hover:border-[#6B1F1F]'
                                : 'bg-[#28141B] border-[#44262E] hover:border-[var(--color-primary)]'
                            }`}
                          >
                            <div>
                              {/* Card Image Header */}
                              <div className={`relative h-40 w-full overflow-hidden ${isLight ? 'bg-[#FAF3E6]' : 'bg-[#1E0F14]'}`}>
                                <img
                                  src={thumb}
                                  alt={item.term}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  loading="lazy"
                                />
                                <div className={`absolute inset-0 bg-gradient-to-t ${
                                  isLight
                                    ? 'from-[#FAF3E6]/95 via-[#FAF3E6]/20 to-transparent'
                                    : 'from-[#28141B]/95 via-[#28141B]/20 to-transparent'
                                }`} />
                                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-[#6B1F1F]/95 text-[#FFF7ED] border border-[#D4A72C]/70 text-[10px] font-serif uppercase tracking-wider font-bold">
                                  {item.category}
                                </span>
                                <span className="absolute bottom-2.5 left-3 font-['Yatra_One'] text-base text-[#D4A72C] font-bold drop-shadow-xs">
                                  {item.sanskrit}
                                </span>
                              </div>

                              {/* Card Text Body */}
                              <div className="p-5 space-y-2.5">
                                <h3
                                  className={`font-['Cinzel_Decorative'] text-lg font-bold leading-snug group-hover:text-[#E88A16] transition-colors ${
                                    isLight ? 'text-[#2D1B14]' : 'text-[#FFF6F7]'
                                  }`}
                                >
                                  {item.term}
                                </h3>
                                <p
                                  className={`font-['Marcellus'] text-xs sm:text-sm leading-relaxed line-clamp-3 ${
                                    isLight ? 'text-stone-700' : 'text-[#D1BBA2]'
                                  }`}
                                >
                                  {item.meaning}
                                </p>
                              </div>
                            </div>

                            {/* Card Footer with Read More Link */}
                            <div
                              className="px-5 py-3.5 border-t flex items-center justify-between text-xs font-serif border-stone-200 bg-[#FAF3E6] text-[#6B1F1F]"
                            >
                              <span className="italic truncate max-w-[170px] opacity-85">
                                {item.scripturalReference || 'Vastu Shastra'}
                              </span>
                              <span className="inline-flex items-center gap-1 font-bold group-hover:translate-x-1 transition-transform text-[#B94E2C]">
                                <span>Read More</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </span>
                            </div>
                          </article>
                        );
                      })}
                    </div>

                    {filteredTerms.length === 0 && (
                      <div className="p-10 text-center rounded-2xl border border-[#D4A72C]/40 space-y-3">
                        <p className="font-['Marcellus'] text-sm">
                          No Vastu terms found matching "{searchTerm}".
                        </p>
                        <button
                          onClick={() => {
                            setSearchTerm('');
                            setSelectedDictFilter('All');
                          }}
                          className="px-4 py-2 rounded-xl bg-[#E88A16] text-[#2D1B14] font-serif text-xs font-bold cursor-pointer"
                        >
                          Show All Terms
                        </button>
                      </div>
                    )}

                    {/* Multi-Page Pagination Controls */}
                    {totalSabdkoshPages > 1 && (
                      <div className="pt-4 border-t border-[#D4A72C]/30 flex flex-wrap items-center justify-between gap-4">
                        <span className="text-xs font-serif opacity-80">
                          Showing page {sabdkoshPage} of {totalSabdkoshPages} ({filteredTerms.length} terms)
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            disabled={sabdkoshPage <= 1}
                            onClick={() => setSabdkoshPage((p) => Math.max(1, p - 1))}
                            className="px-3 py-1.5 rounded-xl border border-[#D4A72C]/60 text-xs font-serif font-bold disabled:opacity-40 cursor-pointer flex items-center gap-1"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            <span>Prev</span>
                          </button>
                          {Array.from({ length: totalSabdkoshPages }, (_, i) => i + 1).map((pageNum) => (
                            <button
                              key={pageNum}
                              onClick={() => setSabdkoshPage(pageNum)}
                              className={`w-8 h-8 rounded-xl text-xs font-serif font-bold border transition-all cursor-pointer ${
                                sabdkoshPage === pageNum
                                  ? 'bg-[#E88A16] text-[#2D1B14] border-[#6B1F1F]'
                                  : 'border-[#D4A72C]/50 hover:bg-[#E88A16]/20'
                              }`}
                            >
                              {pageNum}
                            </button>
                          ))}
                          <button
                            disabled={sabdkoshPage >= totalSabdkoshPages}
                            onClick={() => setSabdkoshPage((p) => Math.min(totalSabdkoshPages, p + 1))}
                            className="px-3 py-1.5 rounded-xl border border-[#D4A72C]/60 text-xs font-serif font-bold disabled:opacity-40 cursor-pointer flex items-center gap-1"
                          >
                            <span>Next</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* In-Content Ad Slot inside Main Column */}
                    <div className="pt-2">
                      <InContentAd route={currentAdRoute} suppressed={isReadingMode} />
                    </div>
                  </div>
                )}

                {/* TAB 2: PRAKARAN (DETAILED ARTICLES & SERIES) */}
                {activeCategory === 'prakaran' && (
                  <div
                    className={`rounded-3xl border-2 p-6 sm:p-8 shadow-xl space-y-6 text-left ${
                      isLight ? 'bg-[#FFFDF9] border-[#D4A72C]/70 text-[#2D1B14]' : 'bg-[#1E0F14] border-[#44262E] text-[#FFF6F7]'
                    }`}
                  >
                    {/* Search & Category Filter Header */}
                    <div className="space-y-4 border-b border-[#D4A72C]/30 pb-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <span className="text-xs font-serif uppercase tracking-wider font-bold text-[#E88A16]">
                            प्रकरणानि · Detailed Vastu Articles & Guides
                          </span>
                          <h2 className={`font-['Cinzel_Decorative'] text-xl sm:text-2xl font-bold mt-0.5 ${
                            isLight ? 'text-[#2D1B14]' : 'text-[#FFF6F7]'
                          }`}>
                            Explore Step-by-Step Vastu Articles
                          </h2>
                        </div>

                        <div className="relative w-full sm:w-72">
                          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E88A16]" />
                          <input
                            type="text"
                            placeholder="Search articles & home guides..."
                            value={prakaranSearch}
                            onChange={(e) => setPrakaranSearch(e.target.value)}
                            className={`w-full pl-10 pr-8 py-2.5 rounded-xl border-2 text-xs font-['Marcellus'] transition-colors focus:outline-none ${
                              isLight
                                ? 'bg-[#FAF3E6] text-[#2D1B14] placeholder:text-stone-500 border-[#D4A72C]/70 focus:border-[#6B1F1F]'
                                : 'bg-[#28141B] text-[#FFF6F7] placeholder:text-stone-400 border-[#44262E] focus:border-[var(--color-primary)]'
                            }`}
                          />
                          {prakaranSearch && (
                            <button
                              onClick={() => setPrakaranSearch('')}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#E88A16] cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Category Chips */}
                      <div className="flex flex-wrap items-center gap-2">
                        {prakaranCategories.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setSelectedPrakaranCategory(cat)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-serif transition-all cursor-pointer border ${
                              selectedPrakaranCategory === cat
                                ? 'bg-[#6B1F1F] text-[#FFF7ED] font-bold border-[#D4A72C] shadow-sm'
                                : isLight
                                ? 'bg-[#FAF3E6] border-[#D4A72C]/50 text-[#2D1B14] hover:bg-amber-100/70'
                                : 'bg-[#28141B] border-[#44262E] text-[#D1BBA2] hover:bg-[#351A24]'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Inline Preview or Paginated Article Cards */}
                    {selectedArticle && !isReadingMode ? (
                      renderArticleReader(false)
                    ) : (
                      <div className="space-y-5">
                        {paginatedArticles.map((article, idx) => {
                          const slug = article.slug || slugifyTerm(article.title);
                          const thumb =
                            article.imageUrl ||
                            DEFAULT_FALLBACK_IMAGES[idx % DEFAULT_FALLBACK_IMAGES.length];

                          return (
                            <article
                              key={article.id || slug}
                              className={`group rounded-2xl border-2 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row ${
                                isLight
                                  ? 'bg-[#FFFDF9] border-[#D4A72C]/60 hover:border-[#6B1F1F]'
                                  : 'bg-[#28141B] border-[#44262E] hover:border-[var(--color-primary)]'
                              }`}
                            >
                              {/* Thumbnail Image */}
                              <div
                                onClick={() => handleOpenPrakaranArticle(article)}
                                className={`sm:w-56 md:w-64 h-48 sm:h-auto shrink-0 relative overflow-hidden cursor-pointer ${
                                  isLight ? 'bg-[#FAF3E6]' : 'bg-[#1E0F14]'
                                }`}
                              >
                                <img
                                  src={thumb}
                                  alt={article.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  loading="lazy"
                                />
                                <div className={`absolute inset-0 bg-gradient-to-t sm:hidden ${
                                  isLight ? 'from-[#FAF3E6]/80 via-transparent to-transparent' : 'from-[#28141B]/80 via-transparent to-transparent'
                                }`} />
                                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-[#6B1F1F]/95 text-[#FFF7ED] border border-[#D4A72C]/70 text-[10px] font-serif uppercase tracking-wider font-bold">
                                  {article.category}
                                </span>
                              </div>

                              {/* Content Details */}
                              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                                <div className="space-y-2">
                                  <div className="flex flex-wrap items-center gap-2 text-xs font-serif opacity-85">
                                    <span className="flex items-center gap-1 font-semibold text-[#E88A16]">
                                      <Clock className="w-3.5 h-3.5" />
                                      <span>{article.readTime}</span>
                                    </span>
                                    <span>·</span>
                                    <span className={`flex items-center gap-1 ${isLight ? 'text-[#2D1B14]' : 'text-[#D1BBA2]'}`}>
                                      <User className="w-3.5 h-3.5 text-[#229983]" />
                                      <span>{article.author}</span>
                                    </span>
                                  </div>

                                  <h3
                                    onClick={() => handleOpenPrakaranArticle(article)}
                                    className={`font-['Cinzel_Decorative'] text-lg sm:text-xl font-bold leading-snug cursor-pointer group-hover:text-[#E88A16] transition-colors ${
                                      isLight ? 'text-[#2D1B14]' : 'text-[#FFF6F7]'
                                    }`}
                                  >
                                    {article.title}
                                  </h3>

                                  {article.sanskritTitle && (
                                    <div className="text-xs sm:text-sm font-['Yatra_One'] text-[#D4A72C]">
                                      ॥ {article.sanskritTitle} ॥
                                    </div>
                                  )}

                                  <p
                                    className={`font-['Marcellus'] text-xs sm:text-sm leading-relaxed line-clamp-2 ${
                                      isLight ? 'text-stone-700' : 'text-[#D1BBA2]'
                                    }`}
                                  >
                                    {article.summary}
                                  </p>
                                </div>

                                <div className="pt-3 border-t border-[#D4A72C]/25 flex flex-wrap items-center justify-between gap-3">
                                  <button
                                    onClick={() => handleOpenPrakaranArticle(article)}
                                    className="px-4 py-2 rounded-xl bg-[#6B1F1F] hover:bg-[#B94E2C] text-[#FFF7ED] border border-[#D4A72C] font-serif text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                                  >
                                    <span>Read Full Article</span>
                                    <ArrowRight className="w-3.5 h-3.5 text-[#D4A72C]" />
                                  </button>

                                  <button
                                    onClick={() => {
                                      setSelectedArticle(article);
                                      setIsReadingMode(true);
                                    }}
                                    className="px-3 py-1.5 rounded-xl border text-xs font-serif font-semibold flex items-center gap-1.5 cursor-pointer transition-colors bg-[#FAF3E6] hover:bg-amber-100 text-[#2D1B14] border-[#D4A72C]/60"
                                  >
                                    <Maximize2 className="w-3 h-3" />
                                    <span>Quick Reader</span>
                                  </button>
                                </div>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    )}

                    {/* Multi-Page Pagination for Prakaran */}
                    {totalPrakaranPages > 1 && !selectedArticle && (
                      <div className="pt-4 border-t border-[#D4A72C]/30 flex flex-wrap items-center justify-between gap-4">
                        <span className="text-xs font-serif opacity-80">
                          Showing page {prakaranPage} of {totalPrakaranPages} ({filteredArticles.length} articles)
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            disabled={prakaranPage <= 1}
                            onClick={() => setPrakaranPage((p) => Math.max(1, p - 1))}
                            className="px-3 py-1.5 rounded-xl border border-[#D4A72C]/60 text-xs font-serif font-bold disabled:opacity-40 cursor-pointer flex items-center gap-1"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            <span>Prev</span>
                          </button>
                          {Array.from({ length: totalPrakaranPages }, (_, i) => i + 1).map((pageNum) => (
                            <button
                              key={pageNum}
                              onClick={() => setPrakaranPage(pageNum)}
                              className={`w-8 h-8 rounded-xl text-xs font-serif font-bold border transition-all cursor-pointer ${
                                prakaranPage === pageNum
                                  ? 'bg-[#E88A16] text-[#2D1B14] border-[#6B1F1F]'
                                  : 'border-[#D4A72C]/50 hover:bg-[#E88A16]/20'
                              }`}
                            >
                              {pageNum}
                            </button>
                          ))}
                          <button
                            disabled={prakaranPage >= totalPrakaranPages}
                            onClick={() => setPrakaranPage((p) => Math.min(totalPrakaranPages, p + 1))}
                            className="px-3 py-1.5 rounded-xl border border-[#D4A72C]/60 text-xs font-serif font-bold disabled:opacity-40 cursor-pointer flex items-center gap-1"
                          >
                            <span>Next</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* In-Content Ad Slot */}
                    <div className="pt-2">
                      <InContentAd route={currentAdRoute} suppressed={isReadingMode} />
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT 4 COLUMNS: SIDEBAR (Related Content + Advertisement + Popular Links) */}
              <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
                {/* Sidebar Card 1: Cross-Section Related Content */}
                <div
                  className={`rounded-3xl border-2 p-6 shadow-xl text-left space-y-4 transition-colors ${
                    isLight
                      ? 'bg-[#FFFDF9] border-[#D4A72C]/70 text-[#2D1B14]'
                      : 'bg-[#1C0F13] border-[#5A333C] text-[#FFF6F7]'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-[#D4A72C]/30 pb-3">
                    <div className="flex items-center gap-2">
                      <Compass className="w-4 h-4 text-[#E88A16]" />
                      <h3 className={`font-['Cinzel_Decorative'] text-base font-bold ${isLight ? 'text-[#2D1B14]' : 'text-[#FFF7ED]'}`}>
                        {activeCategory === 'shabd-kosh'
                          ? 'Relevant Prakaran Guides'
                          : 'Important Shabd Kosh Terms'}
                      </h3>
                    </div>
                    <button
                      onClick={() =>
                        handleTabSwitch(activeCategory === 'shabd-kosh' ? 'prakaran' : 'shabd-kosh')
                      }
                      className="text-[11px] font-serif font-bold text-[#B94E2C] hover:underline cursor-pointer"
                    >
                      View All
                    </button>
                  </div>

                  {activeCategory === 'shabd-kosh' ? (
                    <div className="space-y-3">
                      {combinedArticles.slice(0, 4).map((art) => (
                        <button
                          key={art.id}
                          onClick={() => handleOpenPrakaranArticle(art)}
                          className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer group flex items-start justify-between gap-3 ${
                            isLight
                              ? 'bg-[#FAF3E6] hover:bg-amber-100/70 border-[#D4A72C]/40 text-[#2D1B14]'
                              : 'bg-[#251519] hover:bg-[#321C22] border-[#5A333C]/60 text-[#FFF6F7]'
                          }`}
                        >
                          <div className="space-y-1">
                            <span className="text-[10px] font-serif uppercase tracking-wider text-[#B94E2C] font-bold block">
                              {art.category}
                            </span>
                            <h4 className={`font-['Cinzel_Decorative'] text-xs sm:text-sm font-bold group-hover:text-[#E88A16] transition-colors line-clamp-2 ${isLight ? 'text-[#2D1B14]' : 'text-[#FFF7ED]'}`}>
                              {art.title}
                            </h4>
                            <span className={`text-[11px] font-serif opacity-75 block ${isLight ? 'text-[#5A4545]' : 'text-zinc-400'}`}>
                              {art.readTime}
                            </span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-[#E88A16] shrink-0 mt-1 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {combinedTerms.slice(0, 5).map((term) => (
                        <button
                          key={term.id}
                          onClick={() => handleOpenSabdkoshTerm(term)}
                          className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer group flex items-start justify-between gap-3 ${
                            isLight
                              ? 'bg-[#FAF3E6] hover:bg-amber-100/70 border-[#D4A72C]/40 text-[#2D1B14]'
                              : 'bg-[#251519] hover:bg-[#321C22] border-[#5A333C]/60 text-[#FFF6F7]'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <h4 className={`font-['Cinzel_Decorative'] text-xs sm:text-sm font-bold group-hover:text-[#E88A16] transition-colors ${isLight ? 'text-[#2D1B14]' : 'text-[#FFF7ED]'}`}>
                                {term.term}
                              </h4>
                              <span className="font-['Yatra_One'] text-xs text-[#B94E2C]">
                                ({term.sanskrit})
                              </span>
                            </div>
                            <p className={`font-['Marcellus'] text-xs line-clamp-2 ${isLight ? 'text-stone-700 opacity-80' : 'text-[#E8D3A8]'}`}>
                              {term.meaning}
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-[#E88A16] shrink-0 mt-1 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sidebar Card 2: Synced Sidebar Advertisement Slot */}
                <SidebarAd route={currentAdRoute} suppressed={isReadingMode} />

                {/* Sidebar Card 3: Quick Topic & Category Explorer */}
                <div
                  className={`rounded-3xl border-2 p-6 shadow-xl text-left space-y-4 transition-colors ${
                    isLight
                      ? 'bg-[#FFFDF9] border-[#D4A72C]/70 text-[#2D1B14]'
                      : 'bg-[#1C0F13] border-[#5A333C] text-[#FFF6F7]'
                  }`}
                >
                  <div className="flex items-center gap-2 border-b border-[#D4A72C]/30 pb-3">
                    <Layers className="w-4 h-4 text-[#E88A16]" />
                    <h3 className={`font-['Cinzel_Decorative'] text-base font-bold ${isLight ? 'text-[#2D1B14]' : 'text-[#FFF7ED]'}`}>
                      Browse Vastu Categories
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'Vastu Foundations', slug: 'vastu-foundations' },
                      { label: 'Directions & Zones', slug: 'directional-science' },
                      { label: 'Home & Flat Vastu', slug: 'architectural-design' },
                      { label: 'Remedies & Myths', slug: 'remedies-myths' },
                    ].map((cat) => (
                      <button
                        key={cat.slug}
                        onClick={() => onNavigate?.('category-detail', cat.slug)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-serif font-semibold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                          isLight
                            ? 'bg-[#FAF3E6] hover:bg-amber-100 border-[#D4A72C]/50 text-[#2D1B14]'
                            : 'bg-[#251519] hover:bg-[#321C22] border-[#5A333C]/60 text-[#E8D3A8]'
                        }`}
                      >
                        <Tag className="w-3 h-3 text-[#E88A16]" />
                        <span>{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </FolioReveal>
      )}

      {/* =====================================================================
          OTHER TABS (Handbooks, Videos, Myths)
      ====================================================================== */}
      {activeCategory !== 'shabd-kosh' && activeCategory !== 'prakaran' && (
        <FolioReveal>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className={`rounded-3xl border-2 shadow-2xl p-6 sm:p-10 animate-in fade-in duration-200 text-left relative overflow-hidden transition-colors ${
                isLight
                  ? 'bg-vastu-grid bg-gradient-to-br from-[#FFFDF9] via-[#FAF3E6] to-[#F5EADB] border-[var(--color-border)] text-[var(--color-text-heading)] shadow-amber-900/10'
                  : 'bg-vastu-grid bg-gradient-to-br from-[#1C0F13] via-[#241318] to-[#160B0E] border-[#5A333C] text-[#FFF6F7] shadow-black/80'
              }`}
            >
              {/* Category 3: Handbooks */}
              {activeCategory === 'handbooks' && (
                <div className="space-y-6">
                  <div className="border-b-2 border-[#D4A72C]/40 pb-5">
                    <span className={`text-xs uppercase font-serif tracking-wider font-bold ${isLight ? 'text-amber-800' : 'text-[#D4A72C]'}`}>
                      हस्तपुस्तिका
                    </span>
                    <h2 className={`font-['Cinzel_Decorative'] text-2xl sm:text-3xl font-black mt-1 ${isLight ? 'text-[var(--color-text-heading)]' : 'text-[#FFF7ED]'}`}>
                      Classical Handbooks & Field Guides
                    </h2>
                    <p className={`font-['Marcellus'] text-sm mt-1 ${isLight ? 'text-[var(--color-text-body)]' : 'text-[#E8D3A8]'}`}>
                      Structured reference manuals for homeowners, architectural students, and civil engineers.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {dbHandbooks.map((hb, idx) => {
                      const cardThemes = [
                        isLight ? 'bg-white text-[var(--color-text-heading)] border-[var(--color-border)]' : 'bg-[#E8D3A8] text-[#2D1B14] border-[#D4A72C]',
                        isLight ? 'bg-[#FFF7F2] text-amber-950 border-[var(--color-border)]/80' : 'bg-[#B94E2C] text-[#FFF7ED] border-[#D4A72C]',
                        isLight ? 'bg-[#F0FAF7] text-teal-950 border-teal-400/80' : 'bg-[#6B1F1F] text-[#FFF7ED] border-[#D4A72C]',
                      ];
                      const currentTheme = cardThemes[idx % cardThemes.length];
                      const isLightCard = isLight || currentTheme.includes('#E8D3A8');

                      return (
                        <div
                          key={hb.id}
                          className={`p-6 rounded-2xl border-2 shadow-xl flex flex-col justify-between space-y-4 hover:scale-102 transition-transform ${currentTheme}`}
                        >
                          <div className="space-y-3">
                            <span className={`text-[11px] font-serif uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full ${
                              isLightCard ? 'bg-[#6B1F1F] text-[#FFF7ED]' : 'bg-[#E88A16] text-[#2D1B14]'
                            }`}>
                              {hb.targetAudience}
                            </span>
                            <h3 className="font-['Cinzel_Decorative'] text-lg font-black leading-snug">
                              {hb.title}
                            </h3>
                            <p className={`font-['Marcellus'] text-xs italic ${isLightCard ? 'text-[#9A3412]' : 'text-[#FDE68A]'}`}>
                              {hb.subtitle}
                            </p>
                            <p className={`font-['Marcellus'] text-xs leading-relaxed ${isLight ? 'text-[var(--color-text-body)]' : ''}`}>
                              {hb.summary}
                            </p>

                            <div className="space-y-1 pt-2">
                              <span className={`text-[11px] font-serif font-bold block ${isLightCard ? 'text-[var(--color-text-heading)]' : ''}`}>
                                Included Modules:
                              </span>
                              <ul className="text-xs font-['Marcellus'] space-y-1">
                                {(hb.topics || []).map((t, topicIdx) => (
                                  <li key={topicIdx} className="flex items-center gap-1.5">
                                    <span className={`w-1.5 h-1.5 rounded-full ${isLightCard ? 'bg-[#6B1F1F]' : 'bg-[#D4A72C]'}`} />
                                    <span>{t}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div className={`pt-4 border-t text-xs font-serif flex items-center justify-between ${
                            isLightCard ? 'border-[var(--color-border)] text-[var(--color-text-body)]' : 'border-[#D4A72C]/40 text-[#E8D3A8]'
                          }`}>
                            <span>{hb.pages || 40} Folio Pages</span>
                            <button
                              onClick={() => handleReadHandbookClick(hb)}
                              className={`px-4 py-1.5 rounded-xl font-bold border transition-colors cursor-pointer shadow-sm hover:shadow-md flex items-center gap-1.5 ${
                                isLight
                                  ? 'bg-[#6B1F1F] text-[#FFF7ED] border-[#D4A72C] hover:bg-[#B94E2C]'
                                  : 'bg-[#E88A16] text-[#2D1B14] border-[#D4A72C] hover:bg-[#D97706]'
                              }`}
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>Read Handbook</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Category 4: Videos */}
              {activeCategory === 'videos' && (
                <div className="space-y-6">
                  <div className="border-b-2 border-[#D4A72C]/40 pb-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                      <span className={`text-xs uppercase font-serif tracking-wider font-bold ${isLight ? 'text-amber-800' : 'text-[#D4A72C]'}`}>
                        दृश्य-माध्यम · Recorded Discourses
                      </span>
                      <h2 className={`font-['Cinzel_Decorative'] text-2xl sm:text-3xl font-black mt-1 ${isLight ? 'text-[var(--color-text-heading)]' : 'text-[#FFF7ED]'}`}>
                        Video Archives & Research Lectures
                      </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <div className="relative">
                        <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-[var(--color-text-body)]' : 'text-stone-400'}`} />
                        <input
                          type="text"
                          placeholder="Search discourses..."
                          value={videoSearchQuery}
                          onChange={(e) => setVideoSearchQuery(e.target.value)}
                          className={`pl-8 pr-3 py-1.5 rounded-xl text-xs focus:outline-none transition-colors ${
                            isLight
                              ? 'bg-white border-2 border-[var(--color-border)] text-[var(--color-text-heading)] placeholder-stone-400 focus:border-amber-600 shadow-2xs'
                              : 'bg-[#2D1B14] border border-[#D4A72C]/50 text-[#FFF7ED] placeholder-stone-400 focus:border-[#D4A72C]'
                          }`}
                        />
                      </div>

                      <button
                        onClick={fetchDatabaseVideos}
                        title="Refresh video catalog"
                        className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                          isLight
                            ? 'bg-white hover:bg-stone-100 text-amber-800 border-[var(--color-border)] shadow-2xs'
                            : 'bg-[#2D1B14] hover:bg-[#3D251C] text-[#D4A72C] border-[#D4A72C]/50'
                        }`}
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${loadingVideos ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {loadingVideos ? (
                    <div className="p-16 text-center text-[#E8D3A8] flex flex-col items-center justify-center gap-3">
                      <RefreshCw className="w-8 h-8 animate-spin text-[#D4A72C]" />
                      <p className="font-['Marcellus'] text-sm">Consulting Video Archives...</p>
                    </div>
                  ) : videoError ? (
                    <div className="p-8 rounded-2xl bg-red-950/60 border border-red-800 text-center space-y-3">
                      <AlertCircle className="w-6 h-6 text-red-400 mx-auto" />
                      <p className="text-red-200 text-sm font-serif">{videoError}</p>
                      <button
                        onClick={fetchDatabaseVideos}
                        className="px-4 py-1.5 rounded-lg bg-red-900 hover:bg-red-800 text-xs text-white font-bold cursor-pointer"
                      >
                        Retry
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {dbVideos
                        .filter((vid) => {
                          if (!videoSearchQuery.trim()) return true;
                          const q = videoSearchQuery.toLowerCase();
                          return (
                            vid.title.toLowerCase().includes(q) ||
                            vid.description.toLowerCase().includes(q) ||
                            vid.instructor?.toLowerCase().includes(q) ||
                            vid.topicName?.toLowerCase().includes(q)
                          );
                        })
                        .map((vid) => (
                          <div
                            key={vid.id}
                            className={`rounded-2xl border-2 overflow-hidden shadow-xl group transition-all flex flex-col justify-between ${
                              isLight
                                ? 'bg-white border-[var(--color-border)] text-[var(--color-text-heading)] shadow-amber-900/10 hover:shadow-xl'
                                : 'bg-[#2D1B14] border-[#D4A72C] text-[#FFF7ED]'
                            }`}
                          >
                            <div>
                              <div
                                onClick={() => setActiveVideoModal(vid)}
                                className="relative aspect-video bg-stone-950 overflow-hidden cursor-pointer group/thumb"
                              >
                                <img
                                  src={vid.thumbnailUrl || '/hero-sanctuary.jpg'}
                                  alt={vid.title}
                                  className="w-full h-full object-cover opacity-85 group-hover/thumb:opacity-100 group-hover/thumb:scale-105 transition-all duration-500"
                                  onError={(e) => {
                                    (e.target as HTMLElement).setAttribute('src', '/hero-sanctuary.jpg');
                                  }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#1A0F0A] via-transparent to-black/30" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-14 h-14 rounded-full bg-gradient-to-r from-[#D4A72C] to-[#E88A16] text-[#2D1B14] border-2 border-[#FFF7ED] flex items-center justify-center shadow-2xl">
                                    <Play className="w-6 h-6 fill-current ml-0.5" />
                                  </div>
                                </div>
                              </div>
                              <div className="p-5 space-y-2.5 text-left">
                                <h3
                                  onClick={() => setActiveVideoModal(vid)}
                                  className="font-['Cinzel_Decorative'] text-base sm:text-lg font-bold leading-snug cursor-pointer"
                                >
                                  {vid.title}
                                </h3>
                                <p className="font-['Marcellus'] text-xs sm:text-sm leading-relaxed line-clamp-3">
                                  {vid.description}
                                </p>
                              </div>
                            </div>
                            <div className="p-5 pt-3 border-t border-[#D4A72C]/20 flex items-center justify-between gap-2">
                              <span className="text-xs font-serif truncate">
                                {vid.instructor ? `✦ ${vid.instructor}` : '✦ Vastu Ritam Fellowship'}
                              </span>
                              <button
                                onClick={() => setActiveVideoModal(vid)}
                                className="px-3.5 py-1.5 rounded-xl bg-[#E88A16] text-[#2D1B14] font-serif font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                              >
                                <Play className="w-3 h-3 fill-current" />
                                <span>Watch</span>
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                  <BelowVideoAd route="/gyan-kosh" suppressed={isReadingMode} />
                </div>
              )}

              {/* Category 5: Myths & Misconceptions - Single Full Article with Bifurcated Cross-Links */}
              {activeCategory === 'myths' && (() => {
                const currentMyth = MYTHS_DATA.find((m) => m.id === activeMythId) || MYTHS_DATA[0];
                const currentIndex = MYTHS_DATA.findIndex((m) => m.id === currentMyth.id);
                const prevMyth = currentIndex > 0 ? MYTHS_DATA[currentIndex - 1] : null;
                const nextMyth = currentIndex < MYTHS_DATA.length - 1 ? MYTHS_DATA[currentIndex + 1] : null;
                const remainingMyths = MYTHS_DATA.filter((m) => m.id !== currentMyth.id);

                const handleSelectMyth = (mythId: string) => {
                  setActiveMythId(mythId);
                  const el = document.getElementById('vastu-myth-article-top');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                };

                return (
                  <div id="vastu-myth-article-top" className="space-y-8 scroll-mt-24 text-left">
                    {/* Section Header */}
                    <div className="border-b-2 border-[#D4A72C]/40 pb-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <span className={`text-xs uppercase font-serif tracking-widest font-bold ${isLight ? 'text-amber-800' : 'text-[#D4A72C]'}`}>
                            भ्रान्ति-निवारणम् · VASTU MYTH BUSTER
                          </span>
                          <h2 className={`font-['Cinzel_Decorative'] text-2xl sm:text-3xl font-black mt-1 ${isLight ? 'text-stone-950' : 'text-[#FFF7ED]'}`}>
                            Vastu Myths & Authentic Classical Reality
                          </h2>
                          <p className={`text-xs sm:text-sm font-['Marcellus'] mt-1 ${isLight ? 'text-stone-700' : 'text-[#E8D3A8]/85'}`}>
                            Addressing commercial superstitions and fear-based beliefs with classical Shastra references, scientific rationale, and peace of mind.
                          </p>
                        </div>

                        {/* Reading indicator badge */}
                        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#D4A72C]/60 bg-[#D4A72C]/10 text-xs font-serif font-bold text-[#E88A16]">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Reading Myth #{currentMyth.id} of {MYTHS_DATA.length}</span>
                        </div>
                      </div>

                      {/* Myth Quick Switcher Pills */}
                      <div className="mt-5 pt-4 border-t border-[#D4A72C]/25">
                        <div className="text-[11px] font-serif uppercase tracking-wider font-bold text-[#D4A72C] mb-2.5 flex items-center gap-1.5">
                          <span>Quick Select Myth to Read:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {MYTHS_DATA.map((m) => {
                            const isSelected = m.id === currentMyth.id;
                            return (
                              <button
                                key={m.id}
                                onClick={() => handleSelectMyth(m.id)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-serif font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                                  isSelected
                                    ? 'bg-[#E88A16] text-[#2D1B14] border-[#D4A72C] shadow-md scale-[1.02] font-extrabold'
                                    : isLight
                                    ? 'bg-white hover:bg-amber-50 text-stone-800 border-amber-200 shadow-sm'
                                    : 'bg-[#2D1B14] hover:bg-[#3D251C] text-[#E8D3A8] border-[#D4A72C]/40'
                                }`}
                                aria-label={`Read Myth #${m.id}`}
                              >
                                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                  isSelected ? 'bg-[#2D1B14] text-[#E88A16]' : 'bg-[#D4A72C]/30 text-current'
                                }`}>
                                  {m.id}
                                </span>
                                <span className="truncate max-w-[200px] sm:max-w-[280px]">
                                  {m.myth.split(' ').slice(0, 5).join(' ')}...
                                </span>
                                {isSelected && (
                                  <span className="text-[10px] uppercase font-mono tracking-wider ml-1 bg-[#2D1B14]/20 px-1.5 py-0.5 rounded">
                                    Active
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* =========================================================================
                        SINGLE FULL MYTH ARTICLE VIEW
                    ========================================================================== */}
                    <article
                      className={`rounded-3xl border-2 overflow-hidden shadow-2xl transition-all relative ${
                        isLight
                          ? 'bg-[#FFFDF9] border-[#D4A72C] text-[#2D1B14]'
                          : 'bg-[#24130C] border-[#D4A72C] text-[#FFF7ED]'
                      }`}
                    >
                      {/* Top Vedic Aura Accent Strip */}
                      <div className="h-2 bg-gradient-to-r from-[#6B1F1F] via-[#E88A16] to-[#0F5C55]" />

                      <div className="p-6 sm:p-9 md:p-11 space-y-7">
                        {/* Article Header & Badges */}
                        <div className="space-y-3 pb-5 border-b border-[#D4A72C]/35">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <span className="text-xs font-serif font-bold text-[#2D1B14] uppercase bg-[#E88A16] px-3 py-1 rounded-full border border-[#D4A72C] shadow-sm flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>Common Myth #{currentMyth.id}</span>
                            </span>
                            <span className="text-xs font-serif tracking-widest text-[#D4A72C] font-semibold">
                              ॥ मिथ्या-धारणा खण्डनम् ॥
                            </span>
                          </div>

                          <h3 className={`font-['Cinzel_Decorative'] text-xl sm:text-2xl md:text-3xl font-black leading-snug ${
                            isLight ? 'text-[#2D1B14]' : 'text-[#FFF7ED]'
                          }`}>
                            "{currentMyth.myth}"
                          </h3>
                        </div>

                        {/* 1. Context: Why This Myth Is Widespread */}
                        <div className={`p-5 rounded-2xl border-l-4 border-amber-500 border-y border-r font-['Marcellus'] space-y-1.5 ${
                          isLight
                            ? 'bg-amber-50/70 border-amber-200/80 text-amber-950'
                            : 'bg-[#2E1C12] border-amber-500/30 text-[#F5E6CC]'
                        }`}>
                          <div className="flex items-center gap-2 text-xs font-serif uppercase tracking-widest font-bold text-amber-600 dark:text-amber-400">
                            <AlertCircle className="w-4 h-4 text-amber-600" />
                            <span>Why This Myth Spreads & Causes Anxiety</span>
                          </div>
                          <p className="text-sm sm:text-base leading-relaxed">
                            {currentMyth.misconceptionContext}
                          </p>
                        </div>

                        {/* 2. Authentic Classical Truth (Highlight Vedic Box) */}
                        <div className="p-6 sm:p-7 rounded-2xl border-2 border-[#D4A72C] bg-gradient-to-br from-[#0F5C55] to-[#0A3D38] text-[#FFF7ED] shadow-xl space-y-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-[#E88A16] text-[#2D1B14] flex items-center justify-center font-bold">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="text-xs font-serif uppercase tracking-wider font-bold text-[#E8D3A8]">
                                Classical Shastra Truth · शास्त्रीय सत्य
                              </span>
                              <h4 className="font-['Cinzel',serif] text-base sm:text-lg font-bold text-[#FFF7ED]">
                                Authentic Vastu Principle & Resolution
                              </h4>
                            </div>
                          </div>
                          <p className="font-['Marcellus'] text-sm sm:text-base md:text-lg leading-relaxed text-[#FFF7ED]">
                            {currentMyth.classicalTruth}
                          </p>
                        </div>

                        {/* 3. Scriptural Evidence & Shastra Reference */}
                        <div className={`p-5 sm:p-6 rounded-2xl border space-y-2 font-['Marcellus'] ${
                          isLight
                            ? 'bg-[#FAF3E6] border-[#D4A72C]/40 text-[#2D1B14]'
                            : 'bg-[#1E0F09] border-[#D4A72C]/30 text-[#E8D3A8]'
                        }`}>
                          <div className="flex items-center gap-2 text-xs font-serif uppercase tracking-widest font-bold text-[#E88A16]">
                            <BookOpen className="w-4 h-4" />
                            <span>Scriptural Reference & Classical Logic</span>
                          </div>
                          <p className="text-sm sm:text-base leading-relaxed italic">
                            "{currentMyth.scripturalPrinciple}"
                          </p>
                        </div>

                        {/* 4. Practical Real-World Harm & Layman Warning */}
                        <div className={`p-5 rounded-2xl border space-y-1.5 font-['Marcellus'] ${
                          isLight
                            ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                            : 'bg-rose-950/25 border-rose-800/40 text-rose-200'
                        }`}>
                          <div className="flex items-center gap-2 text-xs font-serif uppercase tracking-widest font-bold text-rose-600 dark:text-rose-400">
                            <XCircle className="w-4 h-4" />
                            <span>Practical Real-World Damage Caused by Believing This Myth</span>
                          </div>
                          <p className="text-sm sm:text-base leading-relaxed">
                            {currentMyth.practicalHarm}
                          </p>
                        </div>

                        {/* 5. Layman Takeaway: What Homeowners Should Do */}
                        <div className={`p-5 rounded-2xl border-l-4 border-[#0F5C55] border-y border-r space-y-2 font-['Marcellus'] ${
                          isLight
                            ? 'bg-stone-50 border-stone-200 text-stone-800'
                            : 'bg-[#1A0C06] border-[#D4A72C]/20 text-[#E8D3A8]'
                        }`}>
                          <div className="flex items-center gap-2 text-xs font-serif uppercase tracking-widest font-bold text-[#0F5C55] dark:text-[#2DD4BF]">
                            <Home className="w-4 h-4" />
                            <span>Simple Rule for Indian Homes & Flats</span>
                          </div>
                          <p className="text-sm sm:text-base leading-relaxed">
                            Never permit fear, commercial sales pitches, or arbitrary structural demolition to govern your home. Authentic Vastu Shastra is rooted in balance, solar orientation, and non-destructive spatial harmony.
                          </p>
                        </div>

                        {/* Prev / Next Article Switchers inside Article */}
                        <div className="pt-4 border-t border-[#D4A72C]/30 flex flex-wrap items-center justify-between gap-3">
                          {prevMyth ? (
                            <button
                              onClick={() => handleSelectMyth(prevMyth.id)}
                              className="px-4 py-2 rounded-xl bg-[#2D1B14] hover:bg-[#6B1F1F] text-[#FFF7ED] border border-[#D4A72C] text-xs font-serif font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                            >
                              <ChevronLeft className="w-4 h-4 text-[#D4A72C]" />
                              <span>Previous: Myth #{prevMyth.id}</span>
                            </button>
                          ) : (
                            <div />
                          )}

                          {nextMyth && (
                            <button
                              onClick={() => handleSelectMyth(nextMyth.id)}
                              className="px-4 py-2 rounded-xl bg-[#0F5C55] hover:bg-[#0B4640] text-[#FFF7ED] border border-[#D4A72C] text-xs font-serif font-bold flex items-center gap-1.5 cursor-pointer transition-colors ml-auto"
                            >
                              <span>Next: Myth #{nextMyth.id}</span>
                              <ChevronRight className="w-4 h-4 text-[#D4A72C]" />
                            </button>
                          )}
                        </div>

                        {/* =====================================================================
                            AUTHORITATIVE END-OF-READING MARKER (VISUAL BIFURCATION)
                        ====================================================================== */}
                        <EndOfReadingMarker
                          type="myth"
                          title={currentMyth.myth}
                          sanskritTitle="भ्रान्ति-निवारणम्"
                          isLight={isLight}
                          categoryLabel={`Common Myth #${currentMyth.id} Resolution`}
                        />

                        {/* =====================================================================
                            FURTHER READING: CONNECTED TERMS AND ARTICLES (VISUALLY BIFURCATED ZONE)
                        ====================================================================== */}
                        <section
                          aria-label="Further Reading"
                          className={`rounded-3xl border-2 p-6 sm:p-8 shadow-xl space-y-8 transition-all ${
                            isLight
                              ? 'bg-gradient-to-br from-[#FAF3E6] via-[#F6EBD8] to-[#EFE2CC] border-[#D4A72C]/70 text-[#2D1B14]'
                              : 'bg-gradient-to-br from-[#1E090D] via-[#160507] to-[#0F0304] border-[#D4A72C]/50 text-[#FFF7ED]'
                          }`}
                        >
                          {/* Primary Header for Further Reading Zone */}
                          <div className="border-b border-[#D4A72C]/35 pb-5">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-xs font-serif uppercase tracking-widest text-[#E88A16] font-bold">
                                आगे का अध्ययन एवं संबंधित विषय · EXPLORATION ZONE
                              </span>
                            </div>
                            <h4
                              className={`font-['Cinzel_Decorative',serif] text-xl sm:text-2xl font-bold ${
                                isLight ? 'text-[#2D1B14]' : 'text-[#FFF7ED]'
                              }`}
                            >
                              Further Reading: Connected Terms and Articles
                            </h4>
                            <p
                              className={`text-xs sm:text-sm font-['Marcellus'] mt-1 ${
                                isLight ? 'text-stone-700' : 'text-[#E8D3A8]/85'
                              }`}
                            >
                              You have finished reading this myth resolution. Explore other popular misconceptions below, or navigate to connected Shabd Kosh definitions and Prakaran articles.
                            </p>
                          </div>

                          {/* Remaining Myths Cards */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-serif uppercase tracking-wider font-bold text-[#D4A72C] flex items-center gap-1.5">
                                <BookMarked className="w-3.5 h-3.5 text-[#E88A16]" />
                                <span>Other Vastu Myths in this Treatise ({remainingMyths.length})</span>
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {remainingMyths.map((rm) => (
                                <div
                                  key={rm.id}
                                  className={`rounded-2xl border-2 p-5 flex flex-col justify-between gap-4 transition-all hover:shadow-lg ${
                                    isLight
                                      ? 'bg-white border-[#D4A72C]/50 hover:border-[#D4A72C]'
                                      : 'bg-[#24130C] border-[#D4A72C]/40 hover:border-[#D4A72C]'
                                  }`}
                                >
                                  <div className="space-y-2 text-left">
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-[10px] font-serif uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-[#E88A16]/20 text-[#E88A16] border border-[#E88A16]/40">
                                        Myth #{rm.id}
                                      </span>
                                      <span className="text-[11px] font-serif text-[#D4A72C] font-semibold">
                                        Misconception
                                      </span>
                                    </div>
                                    <h5 className={`font-['Cinzel',serif] text-sm sm:text-base font-bold leading-snug ${
                                      isLight ? 'text-[#2D1B14]' : 'text-[#FFF7ED]'
                                    }`}>
                                      {rm.myth}
                                    </h5>
                                    <p className={`text-xs font-['Marcellus'] leading-relaxed line-clamp-2 ${
                                      isLight ? 'text-stone-600' : 'text-[#E8D3A8]/80'
                                    }`}>
                                      <strong className="text-[#0F5C55] dark:text-[#2DD4BF] font-serif">Fact: </strong>
                                      {rm.classicalTruth}
                                    </p>
                                  </div>

                                  <button
                                    onClick={() => handleSelectMyth(rm.id)}
                                    className="w-full py-2 px-3 rounded-xl bg-[#6B1F1F] hover:bg-[#8B2626] text-[#FFF7ED] text-xs font-serif font-bold border border-[#D4A72C]/60 flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                                  >
                                    <span>Read Full Myth #{rm.id} Analysis</span>
                                    <ArrowRight className="w-3.5 h-3.5 text-[#D4A72C]" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Cross-Section Navigation to Shabd Kosh & Prakaran */}
                          <div className={`p-5 rounded-2xl border-2 flex flex-col sm:flex-row items-center justify-between gap-4 ${
                            isLight
                              ? 'bg-[#FFFDF9] border-[#D4A72C]/60'
                              : 'bg-[#2A160F] border-[#D4A72C]/40'
                          }`}>
                            <div className="space-y-1 text-center sm:text-left">
                              <span className="text-xs font-serif uppercase tracking-wider font-bold text-[#E88A16]">
                                Explore More Sections
                              </span>
                              <p className={`text-xs sm:text-sm font-['Marcellus'] ${
                                isLight ? 'text-stone-700' : 'text-[#E8D3A8]'
                              }`}>
                                Deepen your knowledge with technical dictionary terms or comprehensive Prakaran guides.
                              </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2.5">
                              <button
                                onClick={() => handleTabSwitch('shabd-kosh')}
                                className="px-4 py-2 rounded-xl bg-[#2D1B14] hover:bg-[#4A2818] text-[#FFF7ED] font-serif text-xs font-bold border border-[#D4A72C] flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                              >
                                <Compass className="w-3.5 h-3.5 text-[#D4A72C]" />
                                <span>Browse Shabd Kosh</span>
                              </button>
                              <button
                                onClick={() => handleTabSwitch('prakaran')}
                                className="px-4 py-2 rounded-xl bg-[#0F5C55] hover:bg-[#0B4640] text-[#FFF7ED] font-serif text-xs font-bold border border-[#D4A72C] flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                              >
                                <BookOpen className="w-3.5 h-3.5 text-[#D4A72C]" />
                                <span>Browse Prakaran Articles</span>
                              </button>
                            </div>
                          </div>
                        </section>
                      </div>
                    </article>
                  </div>
                );
              })()}
            </div>
          </div>
        </FolioReveal>
      )}

      {/* =====================================================================
          STEP 5: BOTTOM AD SLOT (Synced with Database & Admin Panel)
      ====================================================================== */}
      <FolioReveal>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ArticleBottomAd route={currentAdRoute} suppressed={isReadingMode} />
        </div>
      </FolioReveal>

      {/* =====================================================================
          STEP 6: RELATED / SUGGESTED TOPICS SECTION
          Image + Title + Short Description + Clickable Cards + Topic Suggestion
      ====================================================================== */}
      <FolioReveal>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`rounded-3xl border-2 p-6 sm:p-8 md:p-10 shadow-xl space-y-8 text-left transition-colors ${
              isLight
                ? 'bg-gradient-to-br from-[#FFFDF9] to-[#FAF3E6] border-[#D4A72C]/70 text-[#2D1B14]'
                : 'bg-gradient-to-br from-[#1C0F13] via-[#241318] to-[#160B0E] border-[#5A333C] text-[#FFF6F7] shadow-black/80'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#D4A72C]/30 pb-5">
              <div>
                <span className="text-xs font-serif uppercase tracking-widest font-bold text-[#E88A16]">
                  Recommended Reading & Cross-Links
                </span>
                <h2 className={`font-['Cinzel_Decorative'] text-2xl sm:text-3xl font-bold mt-1 ${isLight ? 'text-[#2D1B14]' : 'text-[#FFF7ED]'}`}>
                  Related & Suggested Vastu Topics
                </h2>
                <p className={`font-['Marcellus'] text-xs sm:text-sm mt-1 ${isLight ? 'text-stone-700 opacity-85' : 'text-[#E8D3A8]'}`}>
                  Continue exploring practical Vastu Shabd Kosh terms and detailed Prakaran guides.
                </p>
              </div>
              <button
                onClick={() =>
                  handleTabSwitch(activeCategory === 'shabd-kosh' ? 'prakaran' : 'shabd-kosh')
                }
                className="px-4 py-2 rounded-xl bg-[#6B1F1F] hover:bg-[#B94E2C] text-[#FFF7ED] border border-[#D4A72C] font-serif text-xs font-bold flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <span>
                  {activeCategory === 'shabd-kosh'
                    ? 'Browse All Prakaran Articles'
                    : 'Browse All Shabd Kosh Terms'}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-[#D4A72C]" />
              </button>
            </div>

            {/* 3-Column Illustrated Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(activeCategory === 'shabd-kosh'
                ? combinedArticles.slice(0, 3).map((art, i) => ({
                    type: 'Prakaran Article',
                    title: art.title,
                    summary: art.summary,
                    imageUrl: art.imageUrl || DEFAULT_FALLBACK_IMAGES[i % DEFAULT_FALLBACK_IMAGES.length],
                    onClick: () => handleOpenPrakaranArticle(art),
                  }))
                : combinedTerms.slice(0, 3).map((t, i) => ({
                    type: `Shabd Kosh · ${t.category}`,
                    title: `${t.term} (${t.sanskrit})`,
                    summary: t.meaning,
                    imageUrl: t.imageUrl || DEFAULT_FALLBACK_IMAGES[i % DEFAULT_FALLBACK_IMAGES.length],
                    onClick: () => handleOpenSabdkoshTerm(t),
                  }))
              ).map((card, idx) => (
                <div
                  key={idx}
                  onClick={card.onClick}
                  className={`group rounded-2xl border-2 overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between ${
                    isLight
                      ? 'bg-[#FFFDF9] border-[#D4A72C]/60 hover:border-[#6B1F1F] text-[#2D1B14]'
                      : 'bg-[#221217] border-[#5A333C]/60 hover:border-[#D4A72C] text-[#FFF6F7]'
                  }`}
                >
                  <div>
                    <div className={`relative h-40 overflow-hidden ${isLight ? 'bg-[#FAF3E6]' : 'bg-[#180B0F]'}`}>
                      <img
                        src={card.imageUrl}
                        alt={card.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t ${isLight ? 'from-[#FAF3E6]/85' : 'from-[#221217]/90'} via-transparent to-transparent`} />
                      <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-md bg-[#E88A16] text-[#2D1B14] font-serif text-[10px] font-bold uppercase">
                        {card.type}
                      </span>
                    </div>
                    <div className="p-5 space-y-2">
                      <h3 className={`font-['Cinzel_Decorative'] text-base font-bold group-hover:text-[#E88A16] transition-colors line-clamp-2 ${isLight ? 'text-[#2D1B14]' : 'text-[#FFF7ED]'}`}>
                        {card.title}
                      </h3>
                      <p className={`font-['Marcellus'] text-xs leading-relaxed line-clamp-3 ${isLight ? 'text-stone-700 opacity-85' : 'text-[#E8D3A8]'}`}>
                        {card.summary}
                      </p>
                    </div>
                  </div>
                  <div className={`px-5 py-3 border-t border-[#D4A72C]/25 flex items-center justify-between text-xs font-serif font-bold ${
                    isLight ? 'bg-[#FAF3E6] text-[#B94E2C]' : 'bg-[#1A0C10] text-[#E88A16]'
                  }`}>
                    <span>Read More</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>

            {/* Suggest a New Vastu Topic Bar */}
            <div
              className={`p-5 sm:p-6 rounded-2xl border-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors ${
                isLight
                  ? 'bg-[#FAF3E6] border-[#D4A72C]/60 text-[#2D1B14]'
                  : 'bg-[#221217] border-[#5A333C] text-[#FFF6F7]'
              }`}
            >
              <div className="space-y-1">
                <h3 className={`font-['Cinzel_Decorative'] text-sm sm:text-base font-bold flex items-center gap-2 ${isLight ? 'text-[#2D1B14]' : 'text-[#FFF7ED]'}`}>
                  <Sparkles className="w-4 h-4 text-[#E88A16]" />
                  <span>Have a Vastu question or topic you want explained simply?</span>
                </h3>
                <p className={`font-['Marcellus'] text-xs ${isLight ? 'text-stone-700 opacity-85' : 'text-[#E8D3A8]'}`}>
                  Suggest a new Sabdkosh word or Prakaran home topic for our research team to publish next.
                </p>
              </div>

              {suggestionSubmitted ? (
                <div className="flex items-center gap-2 text-xs font-serif font-bold text-emerald-700 bg-emerald-50 border border-emerald-400 px-4 py-2.5 rounded-xl">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Thank you! Your topic suggestion has been recorded.</span>
                </div>
              ) : (
                <form
                  onSubmit={handleSuggestionSubmit}
                  className="flex items-center gap-2 w-full md:w-auto"
                >
                  <input
                    type="text"
                    value={suggestionInput}
                    onChange={(e) => setSuggestionInput(e.target.value)}
                    placeholder="e.g., Vastu for Pooja Room in 2BHK Flat..."
                    className={`w-full md:w-72 px-3.5 py-2 rounded-xl border text-xs font-['Marcellus'] ${
                      isLight
                        ? 'bg-white border-[#D4A72C] text-[#2D1B14]'
                        : 'bg-[#180B0F] border-[#5A333C] text-[#FFF6F7] placeholder:text-zinc-500'
                    }`}
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#E88A16] hover:bg-[#D97706] text-[#2D1B14] font-serif text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Suggest Topic</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </FolioReveal>

      {/* Public Video Playback Modal */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className={`relative w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-4 max-h-[95vh] overflow-y-auto border-2 ${
              isLight
                ? 'bg-[#FAF6EE] border-[#D5C2B5] text-[#2A1515]'
                : 'bg-[#1A0F0A] border-[#D4A72C] text-stone-200'
            }`}
          >
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-[#D4A72C]/40">
              <div>
                <span className="text-[10px] font-serif uppercase tracking-wider text-[#C51E28] font-bold block">
                  Vastu Ritam Video Discourse · {String(activeVideoModal.videoProvider || 'youtube').toUpperCase()}
                </span>
                <h3 className="font-['Cinzel_Decorative'] text-lg sm:text-xl font-bold">
                  {activeVideoModal.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveVideoModal(null)}
                className="p-1.5 rounded-full bg-stone-800 text-stone-200 hover:bg-stone-700 cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-[#D5C2B5]">
              {activeVideoModal.embedUrl ? (
                <iframe
                  src={activeVideoModal.embedUrl}
                  title={activeVideoModal.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 space-y-3 text-white">
                  <AlertCircle className="w-8 h-8 text-amber-500" />
                  <p className="text-sm font-serif">Direct embed player is unavailable for this video link.</p>
                  {activeVideoModal.videoUrl && (
                    <a
                      href={activeVideoModal.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-[#E88A16] text-[#2D1B14] font-serif font-bold text-xs inline-flex items-center gap-1.5"
                    >
                      <span>Open Video on {activeVideoModal.videoProvider || 'YouTube'}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
              <div className="space-y-1 max-w-2xl">
                <p className="font-['Marcellus'] leading-relaxed">{activeVideoModal.description}</p>
                {activeVideoModal.instructor && (
                  <p className="text-[11px] text-[#B45309] font-serif font-bold">✦ {activeVideoModal.instructor}</p>
                )}
              </div>
              {activeVideoModal.videoUrl && (
                <a
                  href={activeVideoModal.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-[#C51E28] hover:bg-[#A20D18] text-white font-serif font-bold text-xs inline-flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <span>Watch on {activeVideoModal.videoProvider || 'YouTube'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Verified Lead Contact Access Modal */}
      {selectedHandbookForAccess && (
        <HandbookAccessModal
          handbook={selectedHandbookForAccess}
          isOpen={isAccessModalOpen}
          onClose={() => {
            setIsAccessModalOpen(false);
            setSelectedHandbookForAccess(null);
          }}
          onAccessGranted={handleAccessGranted}
        />
      )}

      {/* Embedded Document Viewer Modal */}
      <HandbookViewerModal
        handbook={activeReadingHandbook}
        token={readingToken}
        isOpen={isViewerModalOpen}
        onClose={() => {
          setIsViewerModalOpen(false);
          setActiveReadingHandbook(null);
        }}
      />
    </div>
  );
};
