import React, { useEffect } from 'react';
import { Cookie, X, Sliders, CheckCircle2, ShieldCheck, Database, Layers, ExternalLink } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface CookiePolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPreferences?: () => void;
  onOpenPrivacyPolicy?: () => void;
}

export const CookiePolicyModal: React.FC<CookiePolicyModalProps> = ({
  isOpen,
  onClose,
  onOpenPreferences,
  onOpenPrivacyPolicy,
}) => {
  const { isLight } = useTheme();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Vastu Ritam Cookie Policy"
    >
      <div
        className={`w-full max-w-3xl rounded-3xl border-2 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors ${
          isLight
            ? 'bg-[#FFFAF5] border-[var(--color-border)] text-[#2A1515]'
            : 'bg-[#1A0F12] border-[#44262E] text-[#FFF6F7]'
        }`}
      >
        {/* Header */}
        <div
          className={`px-5 sm:px-8 py-5 border-b flex items-center justify-between shrink-0 ${
            isLight
              ? 'bg-[#FAF3EB] border-[var(--color-border)]'
              : 'bg-[#221417] border-[#44262E]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--color-pink-tint)] border border-[var(--color-border)] flex items-center justify-center shrink-0">
              <Cookie className="w-5 h-5 text-[var(--color-primary)]" />
            </div>
            <div>
              <h2 className="font-['Cinzel_Decorative'] text-lg sm:text-xl font-bold text-[var(--color-primary)]">
                Cookie Policy
              </h2>
              <p
                className={`text-xs font-['Marcellus'] ${
                  isLight ? 'text-[#5A4545]' : 'text-zinc-300'
                }`}
              >
                Vastu Ritam · How We Use Cookies & Local Browser Storage
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isLight
                ? 'bg-white border-[var(--color-border)] hover:bg-[#F2E8DC] text-[#2A1515]'
                : 'bg-[#251519] border-[#44262E] hover:bg-[#321C22] text-zinc-300'
            }`}
            aria-label="Close Cookie Policy dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div
          className={`p-5 sm:p-8 overflow-y-auto space-y-6 text-xs sm:text-sm font-['Marcellus'] leading-relaxed ${
            isLight ? 'text-[#3E2723]' : 'text-zinc-200'
          }`}
        >
          {/* Introduction */}
          <div className="space-y-2">
            <h3 className="font-['Cinzel'] text-sm sm:text-base font-bold text-[var(--color-primary)]">
              1. What Are Cookies and Local Storage?
            </h3>
            <p>
              Cookies are small data files placed on your computer or mobile device when you visit websites. Along with cookies, modern web applications utilize browser <strong>localStorage</strong> to remember settings between sessions without transmitting repetitive data over the network.
            </p>
            <p>
              Vastu Ritam utilizes these technologies to personalize your experience, preserve your reading preferences, protect secure session areas, and analyze how visitors explore classical Vastu topics.
            </p>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h3 className="font-['Cinzel'] text-sm sm:text-base font-bold text-[var(--color-primary)]">
              2. Categories of Cookies We Use
            </h3>

            {/* Category 1 */}
            <div
              className={`p-4 rounded-2xl border space-y-1.5 ${
                isLight ? 'bg-white border-[var(--color-border)]' : 'bg-[#221417] border-[#44262E]'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-bold font-['Cinzel'] text-[var(--color-primary)]">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Strictly Necessary Cookies (Always Active)</span>
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                Essential for core website operation, authentication security, handbook access authorization, and recording your cookie consent preferences. The website cannot function safely without these.
              </p>
            </div>

            {/* Category 2 */}
            <div
              className={`p-4 rounded-2xl border space-y-1.5 ${
                isLight ? 'bg-white border-[var(--color-border)]' : 'bg-[#221417] border-[#44262E]'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-bold font-['Cinzel'] text-[var(--color-primary)]">
                <Layers className="w-4 h-4 text-[var(--color-secondary)]" />
                <span>Functional & Experience Cookies (Optional)</span>
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                Enable enhanced presentation features, such as preserving your chosen Vedic theme (Parchment Light Mode vs. Mahogany Dark Mode), reading font adjustments, and ambient aesthetic effects.
              </p>
            </div>

            {/* Category 3 */}
            <div
              className={`p-4 rounded-2xl border space-y-1.5 ${
                isLight ? 'bg-white border-[var(--color-border)]' : 'bg-[#221417] border-[#44262E]'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-bold font-['Cinzel'] text-[var(--color-primary)]">
                <Database className="w-4 h-4 text-blue-600" />
                <span>Traffic Analytics & Performance Cookies (Optional)</span>
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                Allow us to understand visitor traffic, count article reads, evaluate the popularity of Vastu Shabd Kosh terminology, and identify navigation bottlenecks so we can refine our authentic research archives.
              </p>
            </div>

            {/* Category 4 */}
            <div
              className={`p-4 rounded-2xl border space-y-1.5 ${
                isLight ? 'bg-white border-[var(--color-border)]' : 'bg-[#221417] border-[#44262E]'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-bold font-['Cinzel'] text-[var(--color-primary)]">
                <CheckCircle2 className="w-4 h-4 text-amber-600" />
                <span>Personalisation & Sponsor Relevance (Optional)</span>
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                Help tailor recommended reading topics and display context-relevant, non-intrusive sponsorships adhering to Google AdSense privacy policies.
              </p>
            </div>
          </div>

          {/* Table of Keys */}
          <div className="space-y-2">
            <h3 className="font-['Cinzel'] text-sm sm:text-base font-bold text-[var(--color-primary)]">
              3. Specific Storage Items on Vastu Ritam
            </h3>
            <div className="overflow-x-auto">
              <table
                className={`w-full text-left text-xs border rounded-xl overflow-hidden ${
                  isLight ? 'border-[var(--color-border)]' : 'border-[#44262E]'
                }`}
              >
                <thead
                  className={
                    isLight ? 'bg-[#FAF3EB] text-[var(--color-primary)]' : 'bg-[#251519] text-[#FFF6F7]'
                  }
                >
                  <tr>
                    <th className="p-2.5 font-bold">Key / Identifier</th>
                    <th className="p-2.5 font-bold">Category</th>
                    <th className="p-2.5 font-bold">Duration</th>
                    <th className="p-2.5 font-bold">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  <tr>
                    <td className="p-2.5 font-mono text-[11px]">vastu_ritam_cookie_consent_v1</td>
                    <td className="p-2.5">Necessary</td>
                    <td className="p-2.5">Persistent</td>
                    <td className="p-2.5">Stores your accepted cookie consent parameters.</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-mono text-[11px]">vr_session</td>
                    <td className="p-2.5">Necessary</td>
                    <td className="p-2.5">Session / 7 Days</td>
                    <td className="p-2.5">Secure HMAC token for consultant authentication.</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-mono text-[11px]">vastu_theme_preference</td>
                    <td className="p-2.5">Functional</td>
                    <td className="p-2.5">Persistent</td>
                    <td className="p-2.5">Remembers Light or Dark Vedic theme selection.</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-mono text-[11px]">vastu_analytics_token</td>
                    <td className="p-2.5">Analytics</td>
                    <td className="p-2.5">30 Days</td>
                    <td className="p-2.5">Aggregates anonymous page readership stats.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* How to Manage */}
          <div className="space-y-2">
            <h3 className="font-['Cinzel'] text-sm sm:text-base font-bold text-[var(--color-primary)]">
              4. How to Manage or Revoke Your Choices
            </h3>
            <p>
              You have complete control over your cookie choices. You can modify your preferences at any time by clicking <strong>Customize Preferences</strong> below, or by clicking the <strong>Cookie Preferences</strong> link in our website footer.
            </p>
            <p>
              You may also clear or block cookies entirely through your browser settings (Chrome, Safari, Edge, Firefox). Please note that disabling strictly necessary cookies may prevent certain consultation features from functioning properly.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`px-5 sm:px-8 py-4 border-t flex flex-wrap items-center justify-between gap-3 shrink-0 ${
            isLight
              ? 'bg-[#FAF3EB] border-[var(--color-border)]'
              : 'bg-[#221417] border-[#44262E]'
          }`}
        >
          <div className="flex items-center gap-3">
            {onOpenPrivacyPolicy && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPrivacyPolicy();
                }}
                className="text-xs font-['Marcellus'] font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Read Privacy Policy</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {onOpenPreferences && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPreferences();
                }}
                className={`px-4 py-2 rounded-xl border text-xs font-['Marcellus'] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isLight
                    ? 'bg-white border-[var(--color-border)] text-[#2A1515] hover:border-[var(--color-primary)]'
                    : 'bg-[#251519] border-[#44262E] text-zinc-200 hover:border-amber-500/50'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-[var(--color-secondary)]" />
                <span>Customize Preferences</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-['Marcellus'] font-bold text-xs tracking-wide shadow-md transition-all cursor-pointer"
            >
              Close Cookie Policy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
