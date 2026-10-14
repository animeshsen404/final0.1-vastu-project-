/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { PageType, DiscoverTab, ServiceType, LibraryCategory } from './types';
import { Navbar } from './components/Navbar';
import { DivineBackground } from './components/DivineBackground';
import { DivineCursor } from './components/DivineCursor';
import { HomeSection } from './components/HomeSection';
import { DiscoverSection } from './components/DiscoverSection';
import { WhatWeDoSection } from './components/WhatWeDoSection';
import { GyanKoshSection } from './components/GyanKoshSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { ContactSection } from './components/ContactSection';
import { AdminPanel } from './components/AdminPanel';
import { KnowledgeList } from './components/KnowledgeList';
import { ArticleView } from './components/ArticleView';
import { TopicView } from './components/TopicView';
import { TopicsList } from './components/TopicsList';
import { CategoryView } from './components/CategoryView';
import { CategoriesList } from './components/CategoriesList';
import { SearchResultsView } from './components/SearchResultsView';
import { Footer } from './components/Footer';
import { CookieConsent, type PolicyModalType } from './components/CookieConsent';
import { useTheme } from './context/ThemeContext';
import { normalizeRoutePath, isRouteEligibleForAds } from './lib/adPolicy';

export default function App() {
  const { isLight } = useTheme();
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [activeSlug, setActiveSlug] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [discoverSubTab, setDiscoverSubTab] = useState<DiscoverTab>('meaning');
  const [serviceSubTab, setServiceSubTab] = useState<ServiceType>('residential');
  const [gyanKoshSubTab, setGyanKoshSubTab] = useState<LibraryCategory>('shabd-kosh');
  const [cookieModalOpen, setCookieModalOpen] = useState<boolean>(false);
  const [cookiePolicyType, setCookiePolicyType] = useState<PolicyModalType>(null);

  // Persistent Ritam Ambience & Petals State (persisted in localStorage across sessions)
  const [petalsEnabled, setPetalsEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('vastu_ritam_ambiance_petals');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const handleTogglePetals = useCallback(() => {
    setPetalsEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('vastu_ritam_ambiance_petals', String(next));
      } catch (e) {
        console.warn('Could not persist petals preference:', e);
      }
      return next;
    });
  }, []);

  // Parse path & update route state with strict normalization
  const parseCurrentUrl = useCallback(() => {
    const rawPathname = window.location.pathname;
    const normalizedPath = normalizeRoutePath(rawPathname);
    const search = window.location.search;

    if (normalizedPath.startsWith('/vastu-gyan-kosh/prakaran/')) {
      const slug = normalizedPath.replace('/vastu-gyan-kosh/prakaran/', '').replace(/\/$/, '');
      if (slug) {
        setCurrentPage('article-detail');
        setActiveSlug(slug);
        return;
      }
    }

    if (normalizedPath.startsWith('/knowledge/')) {
      const slug = normalizedPath.replace('/knowledge/', '').replace(/\/$/, '');
      if (slug) {
        setCurrentPage('article-detail');
        setActiveSlug(slug);
        return;
      }
    }

    if (normalizedPath === '/knowledge') {
      setCurrentPage('knowledge');
      return;
    }

    if (normalizedPath.startsWith('/vastu-gyan-kosh/sabdkosh/')) {
      const slug = normalizedPath.replace('/vastu-gyan-kosh/sabdkosh/', '').replace(/\/$/, '');
      if (slug) {
        setCurrentPage('topic-detail');
        setActiveSlug(slug);
        return;
      }
    }

    if (normalizedPath.startsWith('/topic/')) {
      const slug = normalizedPath.replace('/topic/', '').replace(/\/$/, '');
      if (slug) {
        setCurrentPage('topic-detail');
        setActiveSlug(slug);
        return;
      }
    }

    if (normalizedPath === '/topics') {
      setCurrentPage('topics');
      return;
    }

    if (normalizedPath.startsWith('/category/')) {
      const slug = normalizedPath.replace('/category/', '').replace(/\/$/, '');
      if (slug) {
        setCurrentPage('category-detail');
        setActiveSlug(slug);
        return;
      }
    }

    if (normalizedPath === '/categories') {
      setCurrentPage('categories');
      return;
    }

    if (normalizedPath === '/search') {
      const params = new URLSearchParams(search);
      const q = params.get('q') || '';
      setCurrentPage('search');
      setSearchQuery(q);
      return;
    }

    if (normalizedPath === '/admin' || normalizedPath.startsWith('/admin/')) {
      setCurrentPage('admin');
      return;
    }

    if (normalizedPath === '/discover') {
      setCurrentPage('discover');
      return;
    }

    if (normalizedPath === '/what-we-do') {
      setCurrentPage('what-we-do');
      return;
    }

    if (normalizedPath === '/vastu-gyan-kosh/sabdkosh') {
      setCurrentPage('gyan-kosh');
      setGyanKoshSubTab('shabd-kosh');
      return;
    }

    if (normalizedPath === '/vastu-gyan-kosh/prakaran') {
      setCurrentPage('gyan-kosh');
      setGyanKoshSubTab('prakaran');
      return;
    }

    if (normalizedPath === '/gyan-kosh' || normalizedPath === '/vastu-gyan-kosh') {
      setCurrentPage('gyan-kosh');
      return;
    }

    if (normalizedPath === '/testimonials') {
      setCurrentPage('testimonials');
      return;
    }

    if (normalizedPath === '/contact') {
      setCurrentPage('contact');
      return;
    }

    // Default to home (includes '/', '/home', '/index.html', and unknown fallback routes)
    setCurrentPage('home');
  }, []);

  // Listen to browser Back/Forward (popstate)
  useEffect(() => {
    parseCurrentUrl();

    const handlePopState = () => {
      parseCurrentUrl();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [parseCurrentUrl]);

  // Unified Navigation Handler (accepts either a route path or PageType identifier)
  const handleNavigate = (target: string, subTab?: string) => {
    let newPath = '/';

    if (target.startsWith('/')) {
      newPath = target;
    } else {
      switch (target) {
        case 'home':
          newPath = '/';
          break;
        case 'knowledge':
          newPath = subTab ? `/vastu-gyan-kosh/prakaran/${subTab}` : '/knowledge';
          break;
        case 'article-detail':
        case 'knowledge-detail':
          newPath = subTab
            ? `/vastu-gyan-kosh/prakaran/${subTab.replace(/^\/+/, '')}`
            : '/vastu-gyan-kosh/prakaran';
          break;
        case 'topics':
          newPath = subTab ? `/vastu-gyan-kosh/sabdkosh/${subTab}` : '/topics';
          break;
        case 'topic-detail':
        case 'sabdkosh-detail':
          newPath = subTab
            ? `/vastu-gyan-kosh/sabdkosh/${subTab.replace(/^\/+/, '')}`
            : '/vastu-gyan-kosh/sabdkosh';
          break;
        case 'categories':
          newPath = subTab ? `/category/${subTab}` : '/categories';
          break;
        case 'category-detail':
          newPath = subTab ? `/category/${subTab.replace(/^\/+/, '')}` : '/categories';
          break;
        case 'search':
          newPath = subTab ? `/search?q=${encodeURIComponent(subTab)}` : '/search';
          break;
        case 'admin':
          newPath = '/admin';
          break;
        case 'discover':
          newPath = '/discover';
          if (subTab) setDiscoverSubTab(subTab as DiscoverTab);
          break;
        case 'what-we-do':
          newPath = '/what-we-do';
          if (subTab) setServiceSubTab(subTab as ServiceType);
          break;
        case 'gyan-kosh':
          if (subTab === 'shabd-kosh') {
            newPath = '/vastu-gyan-kosh/sabdkosh';
          } else if (subTab === 'prakaran') {
            newPath = '/vastu-gyan-kosh/prakaran';
          } else {
            newPath = '/gyan-kosh';
          }
          if (subTab) setGyanKoshSubTab(subTab as LibraryCategory);
          break;
        case 'testimonials':
          newPath = '/testimonials';
          break;
        case 'contact':
          newPath = '/contact';
          break;
        default:
          newPath = `/${target}`;
      }
    }

    if (window.location.pathname + window.location.search !== newPath) {
      window.history.pushState(null, '', newPath);
    }

    parseCurrentUrl();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isAdminRoute = currentPage === 'admin';
  const currentPathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  const adsEligible = currentPage !== 'home' && currentPage !== 'admin' && currentPage !== 'contact' && isRouteEligibleForAds(currentPathname);

  return (
    <div
      className={`min-h-screen ${
        isLight ? 'bg-[#FAF6EE] text-[#2A1515]' : 'bg-[#140A0D] text-[#FFF6F7]'
      } selection:bg-[#FCE7EC] selection:text-[var(--color-primary)] flex flex-col font-['Marcellus'] relative w-full overflow-x-hidden`}
    >
      {/* Divine Mouse Cursor */}
      <DivineCursor />

      {/* Background with floating petals and Ritam Ambience shrine */}
      {!isAdminRoute && (
        <DivineBackground
          petalsEnabled={petalsEnabled}
          onTogglePetals={handleTogglePetals}
          isHomepage={currentPage === 'home'}
        />
      )}

      {/* Top Navbar (only for public website) */}
      {!isAdminRoute && (
        <Navbar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          petalsEnabled={petalsEnabled}
          onTogglePetals={handleTogglePetals}
        />
      )}

      {/* Main Routing Views */}
      <main
        data-page-type={currentPage}
        data-ads-eligible={adsEligible ? 'true' : 'false'}
        className={isAdminRoute ? 'min-h-screen flex flex-col' : 'flex-1 relative z-10'}
      >
        {currentPage === 'home' && (
          <HomeSection onNavigate={handleNavigate} />
        )}

        {currentPage === 'knowledge' && (
          <KnowledgeList onNavigate={handleNavigate} />
        )}

        {currentPage === 'article-detail' && (
          <ArticleView slug={activeSlug} onNavigate={handleNavigate} />
        )}

        {currentPage === 'topics' && (
          <TopicsList onNavigate={handleNavigate} />
        )}

        {currentPage === 'topic-detail' && (
          <TopicView slug={activeSlug} onNavigate={handleNavigate} />
        )}

        {currentPage === 'categories' && (
          <CategoriesList onNavigate={handleNavigate} />
        )}

        {currentPage === 'category-detail' && (
          <CategoryView slug={activeSlug} onNavigate={handleNavigate} />
        )}

        {currentPage === 'search' && (
          <SearchResultsView query={searchQuery} onNavigate={handleNavigate} />
        )}

        {currentPage === 'admin' && (
          <AdminPanel onNavigate={handleNavigate} />
        )}

        {currentPage === 'discover' && (
          <DiscoverSection initialTab={discoverSubTab} />
        )}

        {currentPage === 'what-we-do' && (
          <WhatWeDoSection
            initialService={serviceSubTab}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'gyan-kosh' && (
          <GyanKoshSection
            initialCategory={gyanKoshSubTab}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'testimonials' && (
          <TestimonialsSection />
        )}

        {currentPage === 'contact' && (
          <ContactSection />
        )}
      </main>

      {/* Sacred Footer (only for public website) */}
      {!isAdminRoute && (
        <Footer
          onNavigate={handleNavigate}
          onOpenCookiePreferences={() => {
            setCookiePolicyType('preferences');
            setCookieModalOpen(true);
          }}
          onOpenPrivacyPolicy={() => {
            setCookiePolicyType('privacy');
            setCookieModalOpen(true);
          }}
          onOpenCookiePolicy={() => {
            setCookiePolicyType('cookie');
            setCookieModalOpen(true);
          }}
        />
      )}

      {/* Cookie Preferences Banner & Policy Modals */}
      {!isAdminRoute && (
        <CookieConsent
          externalOpen={cookieModalOpen}
          externalPolicyType={cookiePolicyType}
          onCloseExternal={() => {
            setCookieModalOpen(false);
            setCookiePolicyType(null);
          }}
        />
      )}
    </div>
  );
}
