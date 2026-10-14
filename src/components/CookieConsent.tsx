import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cookie, Sliders, X, Check, Lock, ExternalLink, Shield } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';
import { CookiePolicyModal } from './CookiePolicyModal';

export interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  sponsored: boolean;
  updatedAt: string;
}

export type PolicyModalType = 'preferences' | 'privacy' | 'cookie' | null;

const COOKIE_STORAGE_KEY = 'vastu_ritam_cookie_consent_v1';

const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true,
  functional: true,
  analytics: true,
  sponsored: true,
  updatedAt: '',
};

export const CookieConsent: React.FC<{
  externalOpen?: boolean;
  externalPolicyType?: PolicyModalType;
  onCloseExternal?: () => void;
}> = ({ externalOpen = false, externalPolicyType = null, onCloseExternal }) => {
  const { isLight } = useTheme();
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [showPrefsModal, setShowPrefsModal] = useState<boolean>(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState<boolean>(false);
  const [showCookiePolicyModal, setShowCookiePolicyModal] = useState<boolean>(false);
  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  const [prefs, setPrefs] = useState<CookiePreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(COOKIE_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CookiePreferences;
        setPrefs({
          necessary: true,
          functional: parsed.functional ?? true,
          analytics: parsed.analytics ?? true,
          sponsored: parsed.sponsored ?? true,
          updatedAt: parsed.updatedAt || '',
        });
        setShowBanner(false);
      } else {
        setShowBanner(true);
      }
    } catch {
      setShowBanner(true);
    }
  }, []);

  useEffect(() => {
    if (externalOpen) {
      if (externalPolicyType === 'privacy') {
        setShowPrivacyModal(true);
      } else if (externalPolicyType === 'cookie') {
        setShowCookiePolicyModal(true);
      } else {
        setShowPrefsModal(true);
      }
    }
  }, [externalOpen, externalPolicyType]);

  const handleClosePrefsModal = () => {
    setShowPrefsModal(false);
    if (onCloseExternal) onCloseExternal();
  };

  const handleClosePrivacyModal = () => {
    setShowPrivacyModal(false);
    if (onCloseExternal) onCloseExternal();
  };

  const handleCloseCookiePolicyModal = () => {
    setShowCookiePolicyModal(false);
    if (onCloseExternal) onCloseExternal();
  };

  const persistPreferences = (nextPrefs: CookiePreferences) => {
    const payload: CookiePreferences = {
      ...nextPrefs,
      necessary: true,
      updatedAt: new Date().toISOString(),
    };
    setPrefs(payload);
    try {
      localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('Could not persist cookie preferences:', e);
    }
    setShowBanner(false);
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      handleClosePrefsModal();
    }, 650);
  };

  const handleAcceptAll = () => {
    persistPreferences({
      necessary: true,
      functional: true,
      analytics: true,
      sponsored: true,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleEssentialOnly = () => {
    persistPreferences({
      necessary: true,
      functional: false,
      analytics: false,
      sponsored: false,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleSaveCustom = () => {
    persistPreferences(prefs);
  };

  return (
    <>
      {/* 1. Floating Bottom Cookie Consent Banner with Subtle Backdrop */}
      {showBanner && !showPrefsModal && !showPrivacyModal && !showCookiePolicyModal && (
        <div
          className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-5 pointer-events-none animate-in fade-in slide-in-from-bottom-5 duration-300"
          role="region"
          aria-label="Cookie and Privacy Consent Banner"
        >
          {/* Subtle Ambient Backdrop Vignette */}
          <div className="absolute inset-0 bg-black/15 pointer-events-none backdrop-blur-[2px]" />

          <div
            className={`relative max-w-5xl mx-auto rounded-3xl border-2 p-5 sm:p-6 shadow-2xl pointer-events-auto transition-colors ${
              isLight
                ? 'bg-[#FFFAF5]/98 border-[var(--color-border)] text-[#2A1515] shadow-stone-900/20'
                : 'bg-[#1A0F12]/98 border-[#44262E] text-[#FFF6F7] shadow-black/80'
            }`}
          >
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 sm:gap-6">
              {/* Left Column: Icon & Exact Mandated Copy */}
              <div className="flex items-start gap-4 max-w-3xl">
                <div className="w-11 h-11 rounded-2xl bg-[var(--color-pink-tint)] border border-[var(--color-border)] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Cookie className="w-5 h-5 text-[var(--color-primary)]" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-['Cinzel',serif] text-sm sm:text-base font-bold text-[var(--color-primary)]">
                      Cookie & Data Privacy Notice
                    </h3>
                    <span className="text-[10px] font-serif uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--color-secondary)]/15 text-[var(--color-secondary)] font-bold">
                      Vastu Ritam Compliance
                    </span>
                  </div>

                  {/* Mandatory Exact Copy with Interactive Policy Modals */}
                  <p
                    className={`font-['Marcellus'] text-xs sm:text-sm leading-relaxed ${
                      isLight ? 'text-[#3E2723]' : 'text-zinc-200'
                    }`}
                  >
                    Our website uses cookies to personalise content and to analyse our traffic. Check our{' '}
                    <button
                      type="button"
                      onClick={() => setShowPrivacyModal(true)}
                      className="font-bold underline decoration-[var(--color-primary)]/40 hover:decoration-[var(--color-primary)] text-[var(--color-primary)] hover:opacity-80 transition-all cursor-pointer inline-flex items-center gap-0.5 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded-xs"
                      aria-label="Open Privacy Policy"
                    >
                      <span>privacy policy</span>
                    </button>{' '}
                    and{' '}
                    <button
                      type="button"
                      onClick={() => setShowCookiePolicyModal(true)}
                      className="font-bold underline decoration-[var(--color-primary)]/40 hover:decoration-[var(--color-primary)] text-[var(--color-primary)] hover:opacity-80 transition-all cursor-pointer inline-flex items-center gap-0.5 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded-xs"
                      aria-label="Open Cookie Policy"
                    >
                      <span>cookie policy</span>
                    </button>{' '}
                    to learn more on how we process your personal data. By pressing Accept you agree with these terms.
                  </p>
                </div>
              </div>

              {/* Right Column: Three Confirmed Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setShowPrefsModal(true)}
                  className={`px-3.5 py-2.5 rounded-xl border text-xs font-['Marcellus'] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isLight
                      ? 'bg-white border-[var(--color-border)] text-[#2A1515] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
                      : 'bg-[#251519] border-[#44262E] text-zinc-200 hover:border-amber-500/50'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5 text-[var(--color-secondary)]" />
                  <span>Customize Preferences</span>
                </button>

                <button
                  type="button"
                  onClick={handleEssentialOnly}
                  className={`px-3.5 py-2.5 rounded-xl border text-xs font-['Marcellus'] font-bold transition-all cursor-pointer ${
                    isLight
                      ? 'bg-[#FAF3EB] border-[var(--color-border)] text-[#5A4545] hover:text-[#2A1515]'
                      : 'bg-[#221417] border-[#44262E] text-zinc-300 hover:text-white'
                  }`}
                >
                  Essential Only
                </button>

                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="px-6 py-2.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-['Marcellus'] font-bold text-xs tracking-wide shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Accept</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Detailed Cookie Preferences Modal */}
      {showPrefsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-label="Cookie Preferences Center"
        >
          <div
            className={`w-full max-w-2xl rounded-3xl border-2 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
              isLight
                ? 'bg-[#FFFAF5] border-[var(--color-border)] text-[#2A1515]'
                : 'bg-[#1A0F12] border-[#44262E] text-[#FFF6F7]'
            }`}
          >
            {/* Modal Header */}
            <div
              className={`px-6 py-4 border-b flex items-center justify-between ${
                isLight ? 'bg-white border-[var(--color-border)]' : 'bg-[#140E10] border-[#44262E]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[var(--color-pink-tint)] border border-[var(--color-border)] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-[var(--color-primary)]" />
                </div>
                <div>
                  <h2 className="font-['Cinzel',serif] text-base sm:text-lg font-bold text-[var(--color-primary)]">
                    Cookie Preferences Center
                  </h2>
                  <p className="text-[11px] font-['Marcellus'] text-[var(--color-secondary)]">
                    Control how Vastu Ritam stores preferences on your browser
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClosePrefsModal}
                className="p-2 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-pink-tint)] transition-colors cursor-pointer"
                aria-label="Close Cookie Preferences"
              >
                <X className="w-4 h-4 text-[var(--color-primary)]" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 font-['Marcellus']">
              <p
                className={`text-xs sm:text-sm leading-relaxed ${
                  isLight ? 'text-[#5A4545]' : 'text-zinc-300'
                }`}
              >
                Choose which types of cookies you want to allow. Essential cookies are always enabled because they keep the website working smoothly and safely.
              </p>

              {/* Policy Quick Links */}
              <div className="flex items-center gap-4 text-xs font-semibold text-[var(--color-primary)] pb-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowPrefsModal(false);
                    setShowPrivacyModal(true);
                  }}
                  className="hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Privacy Policy</span>
                </button>
                <span className="text-zinc-400">·</span>
                <button
                  type="button"
                  onClick={() => {
                    setShowPrefsModal(false);
                    setShowCookiePolicyModal(true);
                  }}
                  className="hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <Cookie className="w-3.5 h-3.5" />
                  <span>Cookie Policy</span>
                </button>
              </div>

              {/* Category 1: Strictly Necessary */}
              <div
                className={`p-4 rounded-2xl border ${
                  isLight ? 'bg-white border-[var(--color-border)]' : 'bg-[#221417] border-[#44262E]'
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-1.5">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[var(--color-secondary)]" />
                    <h4 className="font-['Cinzel',serif] text-sm font-bold">
                      1. Essential & Security Cookies
                    </h4>
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[var(--color-secondary)]/15 text-[var(--color-secondary)]">
                    Always Active
                  </span>
                </div>
                <p
                  className={`text-xs leading-relaxed ${
                    isLight ? 'text-[#5A4545]' : 'text-zinc-400'
                  }`}
                >
                  Required for page navigation, session authorization, handbook access verification, and saving your cookie consent choices.
                </p>
              </div>

              {/* Category 2: Functional & Ambience */}
              <div
                className={`p-4 rounded-2xl border ${
                  isLight ? 'bg-white border-[var(--color-border)]' : 'bg-[#221417] border-[#44262E]'
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-1.5">
                  <h4 className="font-['Cinzel',serif] text-sm font-bold">
                    2. Reading & Ambience Preferences
                  </h4>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prefs.functional}
                      onChange={(e) =>
                        setPrefs((p) => ({ ...p, functional: e.target.checked }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-stone-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--color-secondary)]" />
                  </label>
                </div>
                <p
                  className={`text-xs leading-relaxed ${
                    isLight ? 'text-[#5A4545]' : 'text-zinc-400'
                  }`}
                >
                  Remembers your Light/Dark mode choice, floating lotus petals animation setting, and your last visited Gyan-Kosh tab.
                </p>
              </div>

              {/* Category 3: Analytics & Popular Articles */}
              <div
                className={`p-4 rounded-2xl border ${
                  isLight ? 'bg-white border-[var(--color-border)]' : 'bg-[#221417] border-[#44262E]'
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-1.5">
                  <h4 className="font-['Cinzel',serif] text-sm font-bold">
                    3. Traffic Analytics & Reading Trends
                  </h4>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prefs.analytics}
                      onChange={(e) =>
                        setPrefs((p) => ({ ...p, analytics: e.target.checked }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-stone-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--color-secondary)]" />
                  </label>
                </div>
                <p
                  className={`text-xs leading-relaxed ${
                    isLight ? 'text-[#5A4545]' : 'text-zinc-400'
                  }`}
                >
                  Helps us understand which Vastu Shabd Kosh terms and Prakaran articles are most helpful so we can expand our research.
                </p>
              </div>

              {/* Category 4: Sponsored & Educational Banners */}
              <div
                className={`p-4 rounded-2xl border ${
                  isLight ? 'bg-white border-[var(--color-border)]' : 'bg-[#221417] border-[#44262E]'
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-1.5">
                  <h4 className="font-['Cinzel',serif] text-sm font-bold">
                    4. Personalised Content & Educational Banners
                  </h4>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prefs.sponsored}
                      onChange={(e) =>
                        setPrefs((p) => ({ ...p, sponsored: e.target.checked }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-stone-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--color-secondary)]" />
                  </label>
                </div>
                <p
                  className={`text-xs leading-relaxed ${
                    isLight ? 'text-[#5A4545]' : 'text-zinc-400'
                  }`}
                >
                  Allows relevant classical book recommendations and respectful educational sponsorships in accordance with AdSense policies.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              className={`px-6 py-4 border-t flex flex-wrap items-center justify-between gap-3 ${
                isLight ? 'bg-white border-[var(--color-border)]' : 'bg-[#140E10] border-[#44262E]'
              }`}
            >
              <button
                type="button"
                onClick={handleEssentialOnly}
                className={`px-4 py-2 rounded-xl border text-xs font-['Marcellus'] font-bold cursor-pointer ${
                  isLight
                    ? 'bg-[#FAF3EB] border-[var(--color-border)] text-[#5A4545] hover:text-[#2A1515]'
                    : 'bg-[#221417] border-[#44262E] text-zinc-300'
                }`}
              >
                Essential Only
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleSaveCustom}
                  className="px-4 py-2 rounded-xl border border-[var(--color-secondary)] text-[var(--color-secondary)] hover:bg-[var(--color-secondary)] hover:text-white font-['Marcellus'] font-bold text-xs transition-all cursor-pointer"
                >
                  {savedNotice ? 'Preferences Saved ✓' : 'Save My Preferences'}
                </button>

                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="px-5 py-2 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-['Marcellus'] font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Accept All</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Dedicated Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={showPrivacyModal}
        onClose={handleClosePrivacyModal}
        onOpenCookiePolicy={() => {
          setShowPrivacyModal(false);
          setShowCookiePolicyModal(true);
        }}
      />

      {/* 4. Dedicated Cookie Policy Modal */}
      <CookiePolicyModal
        isOpen={showCookiePolicyModal}
        onClose={handleCloseCookiePolicyModal}
        onOpenPreferences={() => {
          setShowCookiePolicyModal(false);
          setShowPrefsModal(true);
        }}
        onOpenPrivacyPolicy={() => {
          setShowCookiePolicyModal(false);
          setShowPrivacyModal(true);
        }}
      />
    </>
  );
};
