import React, { useState, useEffect } from 'react';
import { PageType } from '../types';
import { Phone, Mail, Youtube, Twitter, Facebook, Instagram, MessageSquare, Send, Cookie } from 'lucide-react';
import { VastuRitamLogo } from './VastuRitamLogo';
import { BrandName } from './BrandName';
import { useTheme } from '../context/ThemeContext';

interface FooterProps {
  onNavigate: (page: PageType, subTab?: string) => void;
  onOpenCookiePreferences?: () => void;
  onOpenPrivacyPolicy?: () => void;
  onOpenCookiePolicy?: () => void;
}

interface FooterContactData {
  primaryPhone: string;
  secondaryPhone?: string | null;
  primaryEmail: string;
  whatsappNumber?: string | null;
  whatsappMessage?: string | null;
  telegramUrl?: string | null;
  telegramHandle?: string | null;
  youtubeUrl?: string | null;
  youtubeHandle?: string | null;
  twitterUrl?: string | null;
  twitterHandle?: string | null;
  facebookUrl?: string | null;
  facebookHandle?: string | null;
  instagramUrl?: string | null;
  instagramHandle?: string | null;
  collaborationNotice?: string | null;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenCookiePreferences,
  onOpenPrivacyPolicy,
  onOpenCookiePolicy,
}) => {
  const { isLight } = useTheme();
  const [contact, setContact] = useState<FooterContactData>({
    primaryPhone: '+91 98200 18272',
    secondaryPhone: '+91 98200 45678',
    primaryEmail: 'contact@vasturitam.com',
    whatsappNumber: '+91 98200 18272',
    whatsappMessage: 'Namaste Vastu Ritam, I would like to inquire about a Vastu consultation.',
    telegramUrl: 'https://t.me/vasturitam',
    telegramHandle: '@VastuRitam',
    youtubeUrl: 'https://youtube.com',
    youtubeHandle: '@VastuRitam',
    twitterUrl: 'https://x.com',
    twitterHandle: '@VastuRitam',
    facebookUrl: 'https://facebook.com/vasturitam',
    facebookHandle: '@VastuRitam',
    instagramUrl: 'https://instagram.com/vasturitam',
    instagramHandle: '@vasturitam',
    collaborationNotice: 'Collaborations welcome from registered Architects (COA), Civil Structural Engineers, and Researchers.',
  });

  useEffect(() => {
    fetch('/api/contact-details')
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) {
          const s = data.settings;
          setContact({
            primaryPhone: s.primaryPhone || s.primary_phone || '+91 98200 18272',
            secondaryPhone: s.secondaryPhone || s.secondary_phone,
            primaryEmail: s.primaryEmail || s.primary_email || 'contact@vasturitam.com',
            whatsappNumber: s.whatsappNumber || s.whatsapp_number || '+91 98200 18272',
            whatsappMessage: s.whatsappMessage || s.whatsapp_message || 'Namaste Vastu Ritam, I would like to inquire about a Vastu consultation.',
            telegramUrl: s.telegramUrl || s.telegram_url || 'https://t.me/vasturitam',
            telegramHandle: s.telegramHandle || s.telegram_handle || '@VastuRitam',
            youtubeUrl: s.youtubeUrl || s.youtube_url || 'https://youtube.com',
            youtubeHandle: s.youtubeHandle || s.youtube_handle || '@VastuRitam',
            twitterUrl: s.twitterUrl || s.twitter_url || 'https://x.com',
            twitterHandle: s.twitterHandle || s.twitter_handle || '@VastuRitam',
            facebookUrl: s.facebookUrl || s.facebook_url || 'https://facebook.com/vasturitam',
            facebookHandle: s.facebookHandle || s.facebook_handle || '@VastuRitam',
            instagramUrl: s.instagramUrl || s.instagram_url || 'https://instagram.com/vasturitam',
            instagramHandle: s.instagramHandle || s.instagram_handle || '@vasturitam',
            collaborationNotice: s.collaborationNotice || s.collaboration_notice || 'Collaborations welcome from registered Architects (COA), Civil Structural Engineers, and Researchers.',
          });
        }
      })
      .catch(() => {});
  }, []);

  const cleanWhatsappDigits = (contact.whatsappNumber || contact.primaryPhone || '+919820018272').replace(/[^0-9]/g, '');
  const whatsappGreeting = contact.whatsappMessage || 'Namaste Vastu Ritam, I would like to inquire about a Vastu consultation.';
  const whatsappChatUrl = `https://wa.me/${cleanWhatsappDigits}?text=${encodeURIComponent(whatsappGreeting)}`;
  const telegramChatUrl = contact.telegramUrl && contact.telegramUrl.trim()
    ? contact.telegramUrl.trim()
    : `https://t.me/${(contact.telegramHandle || 'vasturitam').replace(/^@/, '')}`;

  return (
    <footer
      className={`border-t-2 border-[var(--color-primary)] pt-16 pb-20 sm:pb-24 relative overflow-hidden transition-colors duration-200 ${
        isLight
          ? 'bg-[#FFFAF5] text-[#2A1515]'
          : 'bg-[#1A0F0F] text-[#FFF6F7]'
      }`}
    >
      {/* Decorative Brand Color Ribbon (Red, Orange, Green) */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-accent-orange)] to-[var(--color-secondary)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 items-start text-left">
          
          {/* Col 1: Emblem & Identity (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div
              className="flex items-center gap-4 text-[#152a25]"
              style={{ color: '#152a25' }}
            >
              <button
                onClick={() => {
                  onNavigate?.('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="group flex items-center gap-2 text-left focus:outline-none transition-transform hover:scale-[1.01] cursor-pointer"
                aria-label="Vastu Ritam Home"
              >
                <VastuRitamLogo
                  variant="full"
                  size={76}
                  showText={true}
                  showSubtitle={true}
                  subtitleAlwaysVisible={true}
                  withTm={true}
                />
              </button>
            </div>

            <p
              className={`font-['Marcellus'] text-xs sm:text-sm leading-relaxed max-w-md ${
                isLight ? 'text-[#5A4545]' : 'text-zinc-300'
              }`}
            >
              An institution dedicated to the study, practice, sharing, and consultation of authentic Vastu knowledge. Rooted in traditional wisdom and guided by thoughtful research.
            </p>

            <div className="pt-2">
              <span
                className="text-xs font-serif uppercase tracking-widest font-bold block mb-1 text-[var(--color-primary)]"
              >
                Our Foundational Ideal
              </span>
              <p
                className="font-['Rozha_One'] text-base italic text-[var(--color-secondary)] font-medium"
              >
                “We do not begin with remedies. We begin with understanding.”
              </p>
            </div>
          </div>

          {/* Col 2: Quick Links (2 cols) */}
          <div className="lg:col-span-2 space-y-3 font-['Marcellus'] text-xs sm:text-sm text-left">
            <h4
              className={`font-['Cinzel_Decorative'] text-sm uppercase tracking-wider font-bold border-b pb-2 ${
                isLight ? 'text-[var(--color-secondary)] border-[var(--color-border)]' : 'text-[#FFF6F7] border-[#44262E]'
              }`}
            >
              Sections
            </h4>
            <ul
              className={`space-y-2 text-left ${
                isLight ? 'text-[#5A4545]' : 'text-zinc-300'
              }`}
            >
              <li className="text-left">
                <button
                  onClick={() => onNavigate('home')}
                  className="text-left block transition-colors cursor-pointer hover:text-[var(--color-primary)]"
                >
                  Home
                </button>
              </li>
              <li className="text-left">
                <button
                  onClick={() => onNavigate('discover', 'meaning')}
                  className="text-left block transition-colors cursor-pointer hover:text-[var(--color-primary)]"
                >
                  The Meaning (Vastu & Ritam)
                </button>
              </li>
              <li className="text-left">
                <button
                  onClick={() => onNavigate('discover', 'philosophy')}
                  className="text-left block transition-colors cursor-pointer hover:text-[var(--color-primary)]"
                >
                  Our Philosophy
                </button>
              </li>
              <li className="text-left">
                <button
                  onClick={() => onNavigate('discover', 'emblem')}
                  className="text-left block transition-colors cursor-pointer font-bold text-[var(--color-secondary)] hover:text-[var(--color-primary)]"
                >
                  Our Emblem · Our Identity
                </button>
              </li>
              <li className="text-left">
                <button
                  onClick={() => onNavigate('what-we-do')}
                  className="text-left block transition-colors cursor-pointer hover:text-[var(--color-primary)]"
                >
                  Collaborations & Services
                </button>
              </li>
              <li className="text-left">
                <button
                  onClick={() => onNavigate('testimonials')}
                  className="text-left block transition-colors cursor-pointer hover:text-[var(--color-primary)]"
                >
                  Testimonials
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Vastu Categories & Gyan-Kosh Links (3 cols) */}
          <div className="lg:col-span-3 space-y-3 font-['Marcellus'] text-xs sm:text-sm text-left">
            <h4
              className={`font-['Cinzel_Decorative'] text-sm uppercase tracking-wider font-bold border-b pb-2 ${
                isLight ? 'text-[var(--color-secondary)] border-[var(--color-border)]' : 'text-[#FFF6F7] border-[#44262E]'
              }`}
            >
              Gyan-Kosh & Category Links
            </h4>
            <ul
              className={`space-y-2 text-left ${
                isLight ? 'text-[#5A4545]' : 'text-zinc-300'
              }`}
            >
              <li className="text-left">
                <button
                  onClick={() => onNavigate('gyan-kosh', 'shabd-kosh')}
                  className="text-left block transition-colors cursor-pointer font-bold hover:text-[var(--color-primary)]"
                >
                  Vastu Shabd Kosh (Dictionary)
                </button>
              </li>
              <li className="text-left">
                <button
                  onClick={() => onNavigate('gyan-kosh', 'prakaran')}
                  className="text-left block transition-colors cursor-pointer font-bold hover:text-[var(--color-primary)]"
                >
                  Prakaran (Detailed Articles)
                </button>
              </li>
              <li className="text-left">
                <button
                  onClick={() => onNavigate('category-detail', 'vastu-foundations')}
                  className="text-left block transition-colors cursor-pointer hover:text-[var(--color-primary)]"
                >
                  Vastu Foundations & Mandala
                </button>
              </li>
              <li className="text-left">
                <button
                  onClick={() => onNavigate('category-detail', 'directional-science')}
                  className="text-left block transition-colors cursor-pointer hover:text-[var(--color-primary)]"
                >
                  Directions & Energy Zones
                </button>
              </li>
              <li className="text-left">
                <button
                  onClick={() => onNavigate('category-detail', 'architectural-design')}
                  className="text-left block transition-colors cursor-pointer hover:text-[var(--color-primary)]"
                >
                  Home & Apartment Vastu
                </button>
              </li>
              <li className="text-left">
                <button
                  onClick={() => onNavigate('category-detail', 'remedies-myths')}
                  className="text-left block transition-colors cursor-pointer hover:text-[var(--color-primary)]"
                >
                  Practical Remedies & Myths
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Knowledge Channels (3 cols) */}
          <div className="lg:col-span-3 space-y-3 font-['Marcellus'] text-xs sm:text-sm">
            <h4
              className={`font-['Cinzel_Decorative'] text-sm uppercase tracking-wider font-bold border-b pb-2 ${
                isLight ? 'text-[var(--color-secondary)] border-[var(--color-border)]' : 'text-[#FFF6F7] border-[#44262E]'
              }`}
            >
              Contact & Channels
            </h4>

            <div
              className={`space-y-2 ${
                isLight ? 'text-[#5A4545]' : 'text-zinc-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0 text-[var(--color-secondary)]" />
                <a
                  href={`tel:${contact.primaryPhone.replace(/\s+/g, '')}`}
                  className="transition-colors hover:text-[var(--color-primary)] font-medium"
                >
                  {contact.primaryPhone} {contact.secondaryPhone ? `/ ${contact.secondaryPhone}` : ''}
                </a>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0 text-[var(--color-secondary)]" />
                <a
                  href={`mailto:${contact.primaryEmail}`}
                  className="transition-colors hover:text-[var(--color-primary)] font-medium"
                >
                  {contact.primaryEmail}
                </a>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-2.5">
                <a
                  href={whatsappChatUrl}
                  target="_blank"
                  rel="noreferrer"
                  title="Direct WhatsApp"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-colors text-xs font-serif bg-[var(--color-pink-tint)] text-[#128C7E] border-[var(--color-border)] hover:bg-[#FCE7EC]"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />
                  <span>WhatsApp</span>
                </a>

                <a
                  href={telegramChatUrl}
                  target="_blank"
                  rel="noreferrer"
                  title="Telegram"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-colors text-xs font-serif bg-[var(--color-pink-tint)] text-[#0088CC] border-[var(--color-border)] hover:bg-[#FCE7EC]"
                >
                  <Send className="w-3.5 h-3.5 text-[#0088CC]" />
                  <span>{contact.telegramHandle || 'Telegram'}</span>
                </a>

                <a
                  href={contact.youtubeUrl || 'https://youtube.com'}
                  target="_blank"
                  rel="noreferrer"
                  title="YouTube"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-colors text-xs font-serif bg-[var(--color-pink-tint)] text-[var(--color-primary)] border-[var(--color-border)] hover:bg-[#FCE7EC]"
                >
                  <Youtube className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                  <span>{contact.youtubeHandle || 'YouTube'}</span>
                </a>

                <a
                  href={contact.instagramUrl || 'https://instagram.com/vasturitam'}
                  target="_blank"
                  rel="noreferrer"
                  title="Instagram"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-colors text-xs font-serif bg-[var(--color-pink-tint)] text-[#D82A5F] border-[var(--color-border)] hover:bg-[#FCE7EC]"
                >
                  <Instagram className="w-3.5 h-3.5 text-[#D82A5F]" />
                  <span>{contact.instagramHandle || 'Instagram'}</span>
                </a>

                <a
                  href={contact.facebookUrl || 'https://facebook.com/vasturitam'}
                  target="_blank"
                  rel="noreferrer"
                  title="Facebook"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-colors text-xs font-serif bg-[var(--color-pink-tint)] text-[#1877F2] border-[var(--color-border)] hover:bg-[#FCE7EC]"
                >
                  <Facebook className="w-3.5 h-3.5 text-[#1877F2]" />
                  <span>{contact.facebookHandle || 'Facebook'}</span>
                </a>

                <a
                  href={contact.twitterUrl || 'https://x.com'}
                  target="_blank"
                  rel="noreferrer"
                  title="X (Twitter)"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-colors text-xs font-serif bg-[var(--color-pink-tint)] text-[var(--color-secondary)] border-[var(--color-border)] hover:bg-[#FCE7EC]"
                >
                  <Twitter className="w-3.5 h-3.5 text-[var(--color-secondary)]" />
                  <span>{contact.twitterHandle || 'X'}</span>
                </a>
              </div>
            </div>

            {contact.collaborationNotice && (
              <div
                className={`pt-3 text-[11px] font-serif ${
                  isLight ? 'text-[#5A4545]' : 'text-zinc-400'
                }`}
              >
                {contact.collaborationNotice}
              </div>
            )}
          </div>

        </div>

        {/* Bottom Bar */}
        <div
          className="pt-8 border-t border-[var(--color-border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-['Marcellus'] text-center sm:text-left text-[#5A4545]"
        >
          <div className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-start">
            <span>© {new Date().getFullYear()}</span>
            <BrandName size="inherit" />
            <span>. All Rights Reserved. Toward Harmony through Authentic Vastu Knowledge.</span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center">
            {onOpenPrivacyPolicy && (
              <button
                type="button"
                onClick={onOpenPrivacyPolicy}
                className="hover:text-[var(--color-primary)] transition-colors cursor-pointer text-[11px] underline decoration-[var(--color-border)] hover:decoration-[var(--color-primary)]"
              >
                Privacy Policy
              </button>
            )}
            {onOpenCookiePolicy && (
              <button
                type="button"
                onClick={onOpenCookiePolicy}
                className="hover:text-[var(--color-primary)] transition-colors cursor-pointer text-[11px] underline decoration-[var(--color-border)] hover:decoration-[var(--color-primary)]"
              >
                Cookie Policy
              </button>
            )}
            {onOpenCookiePreferences && (
              <button
                type="button"
                onClick={onOpenCookiePreferences}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors cursor-pointer text-[11px]"
              >
                <Cookie className="w-3.5 h-3.5 text-[var(--color-secondary)]" />
                <span>Cookie Preferences</span>
              </button>
            )}
            <span
              className="font-['Yatra_One'] text-xs text-[var(--color-secondary)] ml-1"
            >
              ॥ शान्तिः शान्तिः शान्तिः ॥
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
