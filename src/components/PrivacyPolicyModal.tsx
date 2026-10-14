import React, { useEffect } from 'react';
import { Shield, X, Lock, Eye, FileText, CheckCircle2, Mail, Phone, ExternalLink } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCookiePolicy?: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose,
  onOpenCookiePolicy,
}) => {
  const { isLight } = useTheme();

  // Escape key listener & body scroll lock
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
      aria-label="Vastu Ritam Privacy Policy"
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
              <Shield className="w-5 h-5 text-[var(--color-primary)]" />
            </div>
            <div>
              <h2 className="font-['Cinzel_Decorative'] text-lg sm:text-xl font-bold text-[var(--color-primary)]">
                Privacy Policy
              </h2>
              <p
                className={`text-xs font-['Marcellus'] ${
                  isLight ? 'text-[#5A4545]' : 'text-zinc-300'
                }`}
              >
                Vastu Ritam · Transparency, Sacred Trust & Data Protection
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
            aria-label="Close Privacy Policy dialog"
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
          {/* Notice Badge */}
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3 ${
              isLight
                ? 'bg-[#FAF3EB]/90 border-[var(--color-border)]'
                : 'bg-[#251519]/70 border-[#44262E]'
            }`}
          >
            <Lock className="w-4 h-4 text-[var(--color-primary)] shrink-0 mt-0.5" />
            <p className="text-xs">
              <strong>Our Sacred Trust:</strong> At Vastu Ritam, we honor the confidentiality of your living spaces, property floor plans, and personal inquiries with the same sanctity and integrity that classical Vastu Vidya accords to sacred geometry.
            </p>
          </div>

          {/* Section 1 */}
          <div className="space-y-2">
            <h3 className="font-['Cinzel'] text-sm sm:text-base font-bold text-[var(--color-primary)] flex items-center gap-2">
              <span>1. Data Controller & Scope</span>
            </h3>
            <p>
              This Privacy Policy applies to the official website and online services of <strong>VASTU RITAM</strong> (accessible at <code className="px-1 py-0.5 rounded bg-amber-500/10 text-xs">vasturitam.com</code>). Vastu Ritam acts as the Data Controller responsible for your personal data under global data protection frameworks, including the EU/UK General Data Protection Regulation (GDPR) and the Digital Personal Data Protection Act (DPDP Act).
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-2">
            <h3 className="font-['Cinzel'] text-sm sm:text-base font-bold text-[var(--color-primary)] flex items-center gap-2">
              <span>2. Personal Data We Collect</span>
            </h3>
            <p>
              Depending on how you interact with our platform, we may collect the following categories of information:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 marker:text-[var(--color-primary)]">
              <li>
                <strong>Consultation Inquiries & Bookings:</strong> Your full name, email address, telephone/WhatsApp number, preferred consultation slot, property category (residential, commercial, industrial), and architectural floor plans or orientation sketches you provide.
              </li>
              <li>
                <strong>Handbook & Educational Access:</strong> Name, verified email address, and mobile number collected when requesting access to digital Vastu handbooks or classical study publications.
              </li>
              <li>
                <strong>Technical & Diagnostic Data:</strong> IP address, device type, operating system, browser specifications, and referral URLs collected automatically through secure server access logs.
              </li>
              <li>
                <strong>Cookie & Preference Choices:</strong> Your chosen theme (Vedic Light or Dark mode), reading progress, and granular cookie consent parameters saved locally.
              </li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="space-y-2">
            <h3 className="font-['Cinzel'] text-sm sm:text-base font-bold text-[var(--color-primary)] flex items-center gap-2">
              <span>3. How We Process & Use Your Personal Data</span>
            </h3>
            <p>We process personal data solely for clear, lawful purposes:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div
                className={`p-3.5 rounded-xl border ${
                  isLight ? 'bg-white border-[var(--color-border)]' : 'bg-[#221417] border-[#44262E]'
                }`}
              >
                <div className="font-semibold text-[var(--color-primary)] mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Consultation Delivery
                </div>
                <p className="text-[11px] leading-normal opacity-90">
                  To analyze directional orientations, calculate 16-zone Vastu Purusha Mandala balances, and prepare personalized rectification guidance.
                </p>
              </div>

              <div
                className={`p-3.5 rounded-xl border ${
                  isLight ? 'bg-white border-[var(--color-border)]' : 'bg-[#221417] border-[#44262E]'
                }`}
              >
                <div className="font-semibold text-[var(--color-primary)] mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Handbook Distribution
                </div>
                <p className="text-[11px] leading-normal opacity-90">
                  To issue time-limited access tokens for authentic digital handbooks and prevent unauthorized reproduction of copyrighted research.
                </p>
              </div>

              <div
                className={`p-3.5 rounded-xl border ${
                  isLight ? 'bg-white border-[var(--color-border)]' : 'bg-[#221417] border-[#44262E]'
                }`}
              >
                <div className="font-semibold text-[var(--color-primary)] mb-1 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" /> Traffic Analytics
                </div>
                <p className="text-[11px] leading-normal opacity-90">
                  To aggregate page view trends, assess which classical topics readers find most illuminating, and optimize server performance.
                </p>
              </div>

              <div
                className={`p-3.5 rounded-xl border ${
                  isLight ? 'bg-white border-[var(--color-border)]' : 'bg-[#221417] border-[#44262E]'
                }`}
              >
                <div className="font-semibold text-[var(--color-primary)] mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> Security & Integrity
                </div>
                <p className="text-[11px] leading-normal opacity-90">
                  To safeguard against malicious automated requests, protect admin endpoints with HMAC sessions, and maintain audit logs.
                </p>
              </div>
            </div>
          </div>

          {/* Section 4 */}
          <div className="space-y-2">
            <h3 className="font-['Cinzel'] text-sm sm:text-base font-bold text-[var(--color-primary)] flex items-center gap-2">
              <span>4. Third-Party Integrations & Embedded Services</span>
            </h3>
            <p>
              We prioritize data minimization and do not sell or rent personal information to brokers. Third-party integrations on our platform include:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 marker:text-[var(--color-primary)]">
              <li>
                <strong>Video Learning (YouTube No-Cookie):</strong> Educational videos are served strictly via YouTube’s privacy-enhanced domain (<code className="px-1 py-0.5 rounded bg-amber-500/10 text-xs">youtube-nocookie.com</code>), which restricts tracking until you choose to play the video.
              </li>
              <li>
                <strong>Google AdSense (Optional / Non-Intrusive):</strong> Where sponsored educational banners are shown, AdSense honors user consent preferences in compliance with Google publisher privacy standards.
              </li>
              <li>
                <strong>Cloud Infrastructure:</strong> High-security Google Cloud / Cloud SQL instances adhering to strict ISO/IEC 27001 data center protocols.
              </li>
            </ul>
          </div>

          {/* Section 5 */}
          <div className="space-y-2">
            <h3 className="font-['Cinzel'] text-sm sm:text-base font-bold text-[var(--color-primary)] flex items-center gap-2">
              <span>5. Your Legal Rights</span>
            </h3>
            <p>Under applicable data privacy regulations, you are entitled to:</p>
            <ul className="list-disc pl-5 space-y-1.5 marker:text-[var(--color-primary)]">
              <li><strong>Right of Access:</strong> Request a copy of personal information we hold about you.</li>
              <li><strong>Right to Rectification:</strong> Request corrections to inaccurate consultation or contact records.</li>
              <li><strong>Right to Erasure ("Right to be Forgotten"):</strong> Request deletion of your handbook download leads or consultation inquiries.</li>
              <li><strong>Right to Withdraw Consent:</strong> Revoke cookie permissions at any time via the Cookie Preferences link in the footer.</li>
            </ul>
          </div>

          {/* Section 6: Contact */}
          <div
            className={`p-4 rounded-2xl border space-y-2 ${
              isLight ? 'bg-[#FAF3EB] border-[var(--color-border)]' : 'bg-[#221417] border-[#44262E]'
            }`}
          >
            <h4 className="font-['Cinzel'] text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
              Data Protection Contact
            </h4>
            <p className="text-xs">
              For any privacy inquiries, data deletion requests, or questions regarding our processing practices, please reach out to:
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium pt-1">
              <a
                href="mailto:contact@vasturitam.com"
                className="inline-flex items-center gap-1.5 text-[var(--color-primary)] hover:underline"
              >
                <Mail className="w-3.5 h-3.5" /> contact@vasturitam.com
              </a>
              <a
                href="tel:+919820018272"
                className="inline-flex items-center gap-1.5 text-[var(--color-primary)] hover:underline"
              >
                <Phone className="w-3.5 h-3.5" /> +91 98200 18272
              </a>
            </div>
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
          {onOpenCookiePolicy ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenCookiePolicy();
              }}
              className="text-xs font-['Marcellus'] font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View Cookie Policy</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-['Marcellus'] font-bold text-xs tracking-wide shadow-md transition-all cursor-pointer"
          >
            Close Privacy Policy
          </button>
        </div>
      </div>
    </div>
  );
};
