import React, { useState, useEffect } from 'react';
import { Phone, Mail, Youtube, Twitter, Facebook, Instagram, MessageSquare, Clock, MapPin, CheckCircle2, Send, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { BrandName } from './BrandName';

interface SiteContactData {
  primaryPhone: string;
  secondaryPhone?: string | null;
  primaryEmail: string;
  consultationEmail?: string | null;
  whatsappNumber?: string | null;
  whatsappNotice?: string | null;
  whatsappMessage?: string | null;
  telegramUrl?: string | null;
  telegramHandle?: string | null;
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
}

const DEFAULT_CONTACT_DATA: SiteContactData = {
  primaryPhone: '+91 98200 18272',
  secondaryPhone: '+91 98200 45678',
  primaryEmail: 'contact@vasturitam.com',
  consultationEmail: 'consultation@vasturitam.com',
  whatsappNumber: '+91 98200 18272',
  whatsappNotice: '✦ WhatsApp Available for Blueprint Sharing',
  whatsappMessage: 'Namaste Vastu Ritam, I would like to inquire about a Vastu consultation.',
  telegramUrl: 'https://t.me/vasturitam',
  telegramHandle: '@VastuRitam',
  consultationTimings: 'Monday – Saturday: 10:00 AM – 6:30 PM (IST)',
  appointmentNotice: 'Prior appointment required for in-depth architectural floor plan audit.',
  youtubeUrl: 'https://youtube.com',
  youtubeHandle: '@VastuRitam',
  twitterUrl: 'https://x.com',
  twitterHandle: '@VastuRitam',
  facebookUrl: 'https://facebook.com/vasturitam',
  facebookHandle: '@VastuRitam',
  instagramUrl: 'https://instagram.com/vasturitam',
  instagramHandle: '@vasturitam',
  officeAddress: 'Vastu Ritam Research & Vedic Architecture Sanctuary, Pune / Mumbai, Maharashtra, Bharat',
  collaborationNotice: 'Collaborations welcome from registered Architects (COA), Civil Structural Engineers, and Researchers.',
};

export const ContactSection: React.FC = () => {
  const { isLight } = useTheme();
  const [contact, setContact] = useState<SiteContactData>(DEFAULT_CONTACT_DATA);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    propertyType: 'Residential Apartment',
    city: '',
    message: '',
  });

  useEffect(() => {
    fetch('/api/contact-details')
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) {
          const s = data.settings;
          setContact({
            primaryPhone: s.primaryPhone || s.primary_phone || DEFAULT_CONTACT_DATA.primaryPhone,
            secondaryPhone: s.secondaryPhone || s.secondary_phone,
            primaryEmail: s.primaryEmail || s.primary_email || DEFAULT_CONTACT_DATA.primaryEmail,
            consultationEmail: s.consultationEmail || s.consultation_email,
            whatsappNumber: s.whatsappNumber || s.whatsapp_number || DEFAULT_CONTACT_DATA.whatsappNumber,
            whatsappNotice: s.whatsappNotice || s.whatsapp_notice || DEFAULT_CONTACT_DATA.whatsappNotice,
            whatsappMessage: s.whatsappMessage || s.whatsapp_message || DEFAULT_CONTACT_DATA.whatsappMessage,
            telegramUrl: s.telegramUrl || s.telegram_url || DEFAULT_CONTACT_DATA.telegramUrl,
            telegramHandle: s.telegramHandle || s.telegram_handle || DEFAULT_CONTACT_DATA.telegramHandle,
            consultationTimings: s.consultationTimings || s.consultation_timings,
            appointmentNotice: s.appointmentNotice || s.appointment_notice,
            youtubeUrl: s.youtubeUrl || s.youtube_url || DEFAULT_CONTACT_DATA.youtubeUrl,
            youtubeHandle: s.youtubeHandle || s.youtube_handle || DEFAULT_CONTACT_DATA.youtubeHandle,
            twitterUrl: s.twitterUrl || s.twitter_url || DEFAULT_CONTACT_DATA.twitterUrl,
            twitterHandle: s.twitterHandle || s.twitter_handle || DEFAULT_CONTACT_DATA.twitterHandle,
            facebookUrl: s.facebookUrl || s.facebook_url || DEFAULT_CONTACT_DATA.facebookUrl,
            facebookHandle: s.facebookHandle || s.facebook_handle || DEFAULT_CONTACT_DATA.facebookHandle,
            instagramUrl: s.instagramUrl || s.instagram_url || DEFAULT_CONTACT_DATA.instagramUrl,
            instagramHandle: s.instagramHandle || s.instagram_handle || DEFAULT_CONTACT_DATA.instagramHandle,
            officeAddress: s.officeAddress || s.office_address,
            collaborationNotice: s.collaborationNotice || s.collaboration_notice,
          });
        }
      })
      .catch((e) => console.warn('Using default contact info:', e));
  }, []);

  const cleanWhatsappDigits = (contact.whatsappNumber || contact.primaryPhone || '+919820018272').replace(/[^0-9]/g, '');
  const whatsappGreeting = contact.whatsappMessage || DEFAULT_CONTACT_DATA.whatsappMessage || 'Namaste Vastu Ritam, I would like to inquire about a Vastu consultation.';
  const whatsappChatUrl = `https://wa.me/${cleanWhatsappDigits}?text=${encodeURIComponent(whatsappGreeting)}`;
  const telegramChatUrl = contact.telegramUrl && contact.telegramUrl.trim()
    ? contact.telegramUrl.trim()
    : `https://t.me/${(contact.telegramHandle || 'vasturitam').replace(/^@/, '')}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="flex items-center justify-center gap-2 text-xs font-serif uppercase tracking-widest text-[var(--color-primary)] font-bold">
          <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent-orange)]" />
          <span>Connect & Consult · सम्पर्क-सूत्रम्</span>
        </div>
        <h1 className={`font-['Cinzel_Decorative'] text-3xl sm:text-4xl md:text-5xl font-black drop-shadow-md ${
          isLight ? 'text-[var(--color-text-heading)]' : 'text-white'
        }`}>
          Contact <BrandName size="inherit" />
        </h1>
        <p className={`font-['Marcellus'] text-base sm:text-lg leading-relaxed ${
          isLight ? 'text-zinc-700' : 'text-zinc-300'
        }`}>
          We appreciate your interest in <BrandName size="inherit" />. Whether you are seeking a consultation, have a research query, wish to collaborate, or simply have a question, we would be pleased to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Direct Contact Details & Valuable Social Links */}
        <div className="lg:col-span-5 space-y-6 text-left">
          {/* Contact Details Card */}
          <div className={`rounded-3xl p-6 sm:p-8 border-2 border-[var(--color-border)] shadow-xl space-y-6 ${
            isLight ? 'bg-[#FFFDF9] text-[#2A1515]' : 'bg-[#1E0F14] text-[#FFF6F7]'
          }`}>
            <h3 className={`font-['Cinzel_Decorative'] text-xl sm:text-2xl font-black border-b border-[var(--color-border)] pb-3 flex items-center gap-2 ${
              isLight ? 'text-[#2A1515]' : 'text-[#FFF6F7]'
            }`}>
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent-orange)] inline-block" />
              <span>Direct Channels</span>
            </h3>

            {/* Mobile Numbers */}
            <div className={`flex items-start gap-4 p-4 rounded-2xl border shadow-xs ${
              isLight ? 'bg-[#FAF6EE] border-[var(--color-border)]' : 'bg-[#28141B] border-[#44262E]'
            }`}>
              <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)] flex items-center justify-center text-white shrink-0 font-bold">
                <Phone className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-serif uppercase tracking-wider text-[var(--color-primary)] font-bold block">
                  Mobile Number
                </span>
                <a
                  href={`tel:${contact.primaryPhone.replace(/\s+/g, '')}`}
                  className={`font-['Marcellus'] text-base font-bold hover:text-[var(--color-primary)] block transition-colors ${
                    isLight ? 'text-[#2A1515]' : 'text-[#FFF6F7]'
                  }`}
                >
                  {contact.primaryPhone}
                </a>
                {contact.secondaryPhone && (
                  <a
                    href={`tel:${contact.secondaryPhone.replace(/\s+/g, '')}`}
                    className={`font-['Marcellus'] text-sm hover:text-[var(--color-primary)] block transition-colors ${
                      isLight ? 'text-[#5A4545]' : 'text-[#D1BBA2]'
                    }`}
                  >
                    {contact.secondaryPhone} (Consultation Desk)
                  </a>
                )}
                {contact.whatsappNotice && (
                  <span className={`text-xs font-serif block pt-0.5 font-medium ${
                    isLight ? 'text-[var(--color-secondary)]' : 'text-emerald-400'
                  }`}>
                    {contact.whatsappNotice}
                  </span>
                )}
              </div>
            </div>

            {/* Email Address */}
            <div className={`flex items-start gap-4 p-4 rounded-2xl border shadow-xs ${
              isLight ? 'bg-[#FAF6EE] border-[var(--color-border)]' : 'bg-[#28141B] border-[#44262E]'
            }`}>
              <div className="w-10 h-10 rounded-xl bg-[var(--color-secondary)] flex items-center justify-center text-white shrink-0 font-bold">
                <Mail className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className={`text-xs font-serif uppercase tracking-wider font-bold block ${
                  isLight ? 'text-[var(--color-secondary)]' : 'text-emerald-400'
                }`}>
                  Email Address
                </span>
                <a
                  href={`mailto:${contact.primaryEmail}`}
                  className={`font-['Marcellus'] text-base font-bold hover:text-[var(--color-primary)] block transition-colors ${
                    isLight ? 'text-[#2A1515]' : 'text-[#FFF6F7]'
                  }`}
                >
                  {contact.primaryEmail}
                </a>
                {contact.consultationEmail && (
                  <a
                    href={`mailto:${contact.consultationEmail}`}
                    className={`font-['Marcellus'] text-sm hover:text-[var(--color-primary)] block transition-colors ${
                      isLight ? 'text-[#5A4545]' : 'text-[#D1BBA2]'
                    }`}
                  >
                    {contact.consultationEmail}
                  </a>
                )}
              </div>
            </div>

            {/* Unified Social Media & Knowledge Channels (All on One Level) */}
            <div className="pt-3 border-t border-[var(--color-border)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-serif uppercase tracking-wider text-[var(--color-accent-orange)] font-bold block">
                  Official Channels & Social Media
                </span>
                <span className={`text-[10px] font-serif tracking-wide font-medium ${isLight ? 'text-[#7A6565]' : 'text-[#D1BBA2]'}`}>
                  All 6 Verified Channels
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* 1. Direct WhatsApp */}
                <a
                  href={whatsappChatUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`flex items-center gap-3.5 p-3.5 rounded-2xl border hover:border-[#25D366] hover:shadow-md transition-all shadow-xs group h-full ${
                    isLight ? 'bg-[#FAF6EE] border-[var(--color-border)]' : 'bg-[#28141B] border-[#44262E]'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-[#25D366] flex items-center justify-center text-white shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <MessageSquare className="w-5 h-5 fill-current" />
                  </div>
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <span className={`font-['Cinzel_Decorative'] font-bold text-xs sm:text-sm group-hover:text-[#128C7E] block truncate transition-colors ${
                      isLight ? 'text-[#2A1515]' : 'text-[#FFF6F7]'
                    }`}>
                      WhatsApp
                    </span>
                    <span className={`font-['Marcellus'] text-xs font-semibold block truncate ${
                      isLight ? 'text-[#5A4545]' : 'text-[#D1BBA2]'
                    }`}>
                      {contact.whatsappNumber || contact.primaryPhone}
                    </span>
                    <span className="text-[10px] text-[#128C7E] font-serif font-bold uppercase tracking-wider block">
                      Direct Chat →
                    </span>
                  </div>
                </a>

                {/* 2. Telegram */}
                <a
                  href={telegramChatUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`flex items-center gap-3.5 p-3.5 rounded-2xl border hover:border-[#0088CC] hover:shadow-md transition-all shadow-xs group h-full ${
                    isLight ? 'bg-[#FAF6EE] border-[var(--color-border)]' : 'bg-[#28141B] border-[#44262E]'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-[#0088CC] flex items-center justify-center text-white shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <Send className="w-4 h-4 fill-current" />
                  </div>
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <span className={`font-['Cinzel_Decorative'] font-bold text-xs sm:text-sm group-hover:text-[#0088CC] block truncate transition-colors ${
                      isLight ? 'text-[#2A1515]' : 'text-[#FFF6F7]'
                    }`}>
                      Telegram
                    </span>
                    <span className={`font-['Marcellus'] text-xs font-semibold block truncate ${
                      isLight ? 'text-[#5A4545]' : 'text-[#D1BBA2]'
                    }`}>
                      {contact.telegramHandle || '@VastuRitam'}
                    </span>
                    <span className="text-[10px] text-[#0088CC] font-serif font-bold uppercase tracking-wider block">
                      Connect on Telegram →
                    </span>
                  </div>
                </a>

                {/* 3. YouTube */}
                <a
                  href={contact.youtubeUrl || 'https://youtube.com'}
                  target="_blank"
                  rel="noreferrer"
                  className={`flex items-center gap-3.5 p-3.5 rounded-2xl border hover:border-[var(--color-primary)] hover:shadow-md transition-all shadow-xs group h-full ${
                    isLight ? 'bg-[#FAF6EE] border-[var(--color-border)]' : 'bg-[#28141B] border-[#44262E]'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)] flex items-center justify-center text-white shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <Youtube className="w-4 h-4 fill-current" />
                  </div>
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <span className={`font-['Cinzel_Decorative'] font-bold text-xs sm:text-sm group-hover:text-[var(--color-primary)] block truncate transition-colors ${
                      isLight ? 'text-[#2A1515]' : 'text-[#FFF6F7]'
                    }`}>
                      YouTube
                    </span>
                    <span className={`font-['Marcellus'] text-xs font-semibold block truncate ${
                      isLight ? 'text-[#5A4545]' : 'text-[#D1BBA2]'
                    }`}>
                      {contact.youtubeHandle || '@VastuRitam'}
                    </span>
                    <span className="text-[10px] text-[var(--color-primary)] font-serif font-bold uppercase tracking-wider block">
                      Watch Insights →
                    </span>
                  </div>
                </a>

                {/* 4. Instagram */}
                <a
                  href={contact.instagramUrl || 'https://instagram.com/vasturitam'}
                  target="_blank"
                  rel="noreferrer"
                  className={`flex items-center gap-3.5 p-3.5 rounded-2xl border hover:border-[#DD2A7B] hover:shadow-md transition-all shadow-xs group h-full ${
                    isLight ? 'bg-[#FAF6EE] border-[var(--color-border)]' : 'bg-[#28141B] border-[#44262E]'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center text-white shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <Instagram className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <span className={`font-['Cinzel_Decorative'] font-bold text-xs sm:text-sm group-hover:text-[#DD2A7B] block truncate transition-colors ${
                      isLight ? 'text-[#2A1515]' : 'text-[#FFF6F7]'
                    }`}>
                      Instagram
                    </span>
                    <span className={`font-['Marcellus'] text-xs font-semibold block truncate ${
                      isLight ? 'text-[#5A4545]' : 'text-[#D1BBA2]'
                    }`}>
                      {contact.instagramHandle || '@vasturitam'}
                    </span>
                    <span className="text-[10px] text-[#DD2A7B] font-serif font-bold uppercase tracking-wider block">
                      Visual Principles →
                    </span>
                  </div>
                </a>

                {/* 5. Facebook */}
                <a
                  href={contact.facebookUrl || 'https://facebook.com/vasturitam'}
                  target="_blank"
                  rel="noreferrer"
                  className={`flex items-center gap-3.5 p-3.5 rounded-2xl border hover:border-[#1877F2] hover:shadow-md transition-all shadow-xs group h-full ${
                    isLight ? 'bg-[#FAF6EE] border-[var(--color-border)]' : 'bg-[#28141B] border-[#44262E]'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-[#1877F2] flex items-center justify-center text-white shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <Facebook className="w-4 h-4 fill-current" />
                  </div>
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <span className={`font-['Cinzel_Decorative'] font-bold text-xs sm:text-sm group-hover:text-[#1877F2] block truncate transition-colors ${
                      isLight ? 'text-[#2A1515]' : 'text-[#FFF6F7]'
                    }`}>
                      Facebook
                    </span>
                    <span className={`font-['Marcellus'] text-xs font-semibold block truncate ${
                      isLight ? 'text-[#5A4545]' : 'text-[#D1BBA2]'
                    }`}>
                      {contact.facebookHandle || '@VastuRitam'}
                    </span>
                    <span className="text-[10px] text-[#1877F2] font-serif font-bold uppercase tracking-wider block">
                      Community Updates →
                    </span>
                  </div>
                </a>

                {/* 6. X (Twitter) */}
                <a
                  href={contact.twitterUrl || 'https://x.com'}
                  target="_blank"
                  rel="noreferrer"
                  className={`flex items-center gap-3.5 p-3.5 rounded-2xl border hover:border-[var(--color-secondary)] hover:shadow-md transition-all shadow-xs group h-full ${
                    isLight ? 'bg-[#FAF6EE] border-[var(--color-border)]' : 'bg-[#28141B] border-[#44262E]'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-secondary)] flex items-center justify-center text-white shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <Twitter className="w-4 h-4 fill-current" />
                  </div>
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <span className={`font-['Cinzel_Decorative'] font-bold text-xs sm:text-sm group-hover:text-[var(--color-secondary)] block truncate transition-colors ${
                      isLight ? 'text-[#2A1515]' : 'text-[#FFF6F7]'
                    }`}>
                      X (Twitter)
                    </span>
                    <span className={`font-['Marcellus'] text-xs font-semibold block truncate ${
                      isLight ? 'text-[#5A4545]' : 'text-[#D1BBA2]'
                    }`}>
                      {contact.twitterHandle || '@VastuRitam'}
                    </span>
                    <span className="text-[10px] text-[var(--color-secondary)] font-serif font-bold uppercase tracking-wider block">
                      Live Feeds →
                    </span>
                  </div>
                </a>
              </div>
            </div>

            {/* Consultation Hours & Timings */}
            <div className={`pt-3 border-t border-[var(--color-border)] flex items-start gap-3 text-xs font-['Marcellus'] ${
              isLight ? 'text-[#5A4545]' : 'text-[#D1BBA2]'
            }`}>
              <Clock className="w-4 h-4 text-[var(--color-accent-orange)] shrink-0 mt-0.5" />
              <div>
                <strong className={`block font-serif text-sm ${isLight ? 'text-[#2A1515]' : 'text-[#FFF6F7]'}`}>
                  Consultation Timings:
                </strong>
                <span>{contact.consultationTimings || 'Monday – Saturday: 10:00 AM – 6:30 PM (IST)'}</span>
                {contact.appointmentNotice && (
                  <span className="block text-[var(--color-accent-orange)] mt-0.5 font-medium">{contact.appointmentNotice}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Consultation Inquiry Form */}
        <div className={`lg:col-span-7 rounded-3xl p-6 sm:p-8 md:p-10 border-2 border-[var(--color-border)] shadow-xl text-left ${
          isLight ? 'bg-[#FFFDF9] text-[#2A1515]' : 'bg-[#1E0F14] text-[#FFF6F7]'
        }`}>
          {formSubmitted ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-[var(--color-secondary)] text-white border-2 border-[var(--color-secondary-dark)] flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-['Cinzel_Decorative'] text-2xl font-black">
                Thank You for Reaching Out
              </h3>
              <p className="font-['Marcellus'] text-zinc-600 dark:text-zinc-300 text-base max-w-md mx-auto leading-relaxed">
                We have received your message. Our research and consultation desk will review your requirements and connect with you on your provided contact details promptly.
              </p>
              <div className="pt-4">
                <button
                  onClick={() => setFormSubmitted(false)}
                  className="px-6 py-2.5 rounded-xl border border-[var(--color-primary-dark)] bg-[var(--color-primary)] text-white font-serif text-xs font-bold hover:bg-[var(--color-primary-hover)] transition-all cursor-pointer shadow-md"
                >
                  Send Another Inquiry
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="border-b border-[var(--color-border)] pb-3">
                <span className="text-xs uppercase font-serif text-[var(--color-primary)] tracking-wider font-bold">
                  Schedule Consultation or Academic Collaboration
                </span>
                <h3 className={`font-['Cinzel_Decorative'] text-xl sm:text-2xl font-black mt-1 ${isLight ? 'text-[var(--color-text-heading)]' : 'text-white'}`}>
                  Send a Message to <BrandName size="inherit" />
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-serif uppercase tracking-wider font-bold mb-1 text-zinc-800 dark:text-zinc-200">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ar. Rajesh Sharma / Meera Patel"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] font-['Marcellus'] text-sm bg-[var(--color-surface-soft)] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-serif uppercase tracking-wider font-bold mb-1 text-zinc-800 dark:text-zinc-200">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98XXX XXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] font-['Marcellus'] text-sm bg-[var(--color-surface-soft)] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-serif uppercase tracking-wider font-bold mb-1 text-zinc-800 dark:text-zinc-200">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] font-['Marcellus'] text-sm bg-[var(--color-surface-soft)] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-serif uppercase tracking-wider font-bold mb-1 text-zinc-800 dark:text-zinc-200">
                    Property / Inquiry Type
                  </label>
                  <select
                    value={formData.propertyType}
                    onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] font-['Marcellus'] text-sm bg-[var(--color-surface-soft)] text-zinc-900 dark:text-zinc-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  >
                    <option>Residential Apartment / Villa</option>
                    <option>Commercial Office / Retail</option>
                    <option>Industrial Factory / Plant</option>
                    <option>Vastu Before You Buy (Pre-Purchase)</option>
                    <option>Architect / Civil Engineer Collaboration</option>
                    <option>Academic Research & Publications</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-serif uppercase tracking-wider font-bold mb-1 text-zinc-800 dark:text-zinc-200">
                  City / Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai, Bengaluru, Ahmedabad, London"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] font-['Marcellus'] text-sm bg-[var(--color-surface-soft)] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-serif uppercase tracking-wider font-bold mb-1 text-zinc-800 dark:text-zinc-200">
                  Describe Your Space or Query *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Please share details such as current building stage (blueprint planning, construction, renovation, or lived-in space)..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] font-['Marcellus'] text-sm bg-[var(--color-surface-soft)] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-serif font-black text-sm sm:text-base border border-[var(--color-primary-dark)] shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4 text-white" />
                  <span className="flex items-center justify-center">Submit Inquiry to <BrandName variant="badge" size="inherit" /></span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
