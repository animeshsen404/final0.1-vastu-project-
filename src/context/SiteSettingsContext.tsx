import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  CANONICAL_DEFAULT_LOGO,
  fetchGlobalLogoFromFirestore,
  subscribeToGlobalLogo,
} from '../services/logoService';

export interface SiteSettings {
  id?: number;
  primaryPhone: string;
  secondaryPhone?: string | null;
  primaryEmail: string;
  consultationEmail?: string | null;
  whatsappNumber?: string | null;
  whatsappNotice?: string | null;
  consultationTimings?: string | null;
  appointmentNotice?: string | null;
  youtubeUrl?: string | null;
  youtubeHandle?: string | null;
  twitterUrl?: string | null;
  twitterHandle?: string | null;
  facebookUrl?: string | null;
  facebookHandle?: string | null;
  instagramUrl?: string | null;
  instagramHandle?: string | null;
  officeAddress?: string | null;
  collaborationNotice?: string | null;
  logoUrl?: string | null;
  adsensePublisherId?: string | null;
  adsenseEnabled?: boolean;
  adsenseAutoAds?: boolean;
}

interface SiteSettingsContextType {
  settings: SiteSettings | null;
  logoUrl: string;
  updateLogoUrl: (newLogoUrl: string) => void;
  refreshSettings: () => Promise<void>;
  loading: boolean;
}

const DEFAULT_LOGO = CANONICAL_DEFAULT_LOGO;
const LOGO_STORAGE_KEY = 'vastu_ritam_custom_logo';

const getInitialLogo = (): string => {
  try {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(LOGO_STORAGE_KEY) : null;
    if (saved && saved.trim() && saved !== '/custom-test-logo.png') {
      return saved.trim();
    }
  } catch {
    // ignore localStorage errors
  }
  return DEFAULT_LOGO;
};

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  settings: null,
  logoUrl: DEFAULT_LOGO,
  updateLogoUrl: () => {},
  refreshSettings: async () => {},
  loading: true,
});

export const SiteSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [logoUrl, setLogoUrl] = useState<string>(getInitialLogo);
  const [loading, setLoading] = useState<boolean>(true);

  const applyLogo = useCallback((nextLogo: string) => {
    if (!nextLogo || !nextLogo.trim()) return;
    const clean = nextLogo.trim();
    setLogoUrl(clean);
    try {
      localStorage.setItem(LOGO_STORAGE_KEY, clean);
    } catch {
      // ignore
    }
    setSettings((prev) =>
      prev ? { ...prev, logoUrl: clean } : { primaryPhone: '', primaryEmail: '', logoUrl: clean }
    );
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      // 1. Fetch from backend API (/api/contact-details) which checks PostgreSQL, Firestore, and dataStore
      const res = await fetch(`/api/contact-details?_t=${Date.now()}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setSettings(data.settings);
          if (data.settings.logoUrl && data.settings.logoUrl !== '/custom-test-logo.png') {
            applyLogo(data.settings.logoUrl);
          }
        }
      }

      // 2. Also query Firestore `/site_settings/branding` directly for global cross-session authority
      const firestoreLogo = await fetchGlobalLogoFromFirestore();
      if (firestoreLogo && firestoreLogo !== '/custom-test-logo.png') {
        applyLogo(firestoreLogo);
      }
    } catch (err) {
      console.warn('Could not load site settings:', err);
    } finally {
      setLoading(false);
    }
  }, [applyLogo]);

  useEffect(() => {
    fetchSettings();

    // Real-time Firestore listener so any logo uploaded by an admin updates all connected sessions immediately
    const unsubscribe = subscribeToGlobalLogo((liveLogoUrl) => {
      if (liveLogoUrl && liveLogoUrl !== '/custom-test-logo.png') {
        applyLogo(liveLogoUrl);
      }
    });

    const handleCustomEvent = (e: Event) => {
      const customEvt = e as CustomEvent<{ logoUrl?: string }>;
      if (customEvt.detail?.logoUrl) {
        applyLogo(customEvt.detail.logoUrl);
      } else {
        fetchSettings();
      }
    };

    window.addEventListener('vastu_ritam_logo_updated', handleCustomEvent);
    return () => {
      unsubscribe();
      window.removeEventListener('vastu_ritam_logo_updated', handleCustomEvent);
    };
  }, [fetchSettings, applyLogo]);

  const updateLogoUrl = useCallback(
    (newLogoUrl: string) => {
      applyLogo(newLogoUrl);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('vastu_ritam_logo_updated', { detail: { logoUrl: newLogoUrl } })
        );
      }
    },
    [applyLogo]
  );

  return (
    <SiteSettingsContext.Provider
      value={{
        settings,
        logoUrl: logoUrl || DEFAULT_LOGO,
        updateLogoUrl,
        refreshSettings: fetchSettings,
        loading,
      }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => useContext(SiteSettingsContext);
