import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Eye,
  Sun,
  Moon,
  Smartphone,
  Monitor,
  RotateCcw,
  Database,
} from 'lucide-react';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { VastuRitamLogo } from '../VastuRitamLogo';
import {
  CANONICAL_DEFAULT_LOGO,
  uploadAndPersistTrademarkLogo,
} from '../../services/logoService';

interface WebsiteLogoManagerProps {
  userRole?: string;
  onNotification: (msg: string) => void;
}

export const WebsiteLogoManager: React.FC<WebsiteLogoManagerProps> = ({
  userRole = 'admin',
  onNotification,
}) => {
  const { logoUrl, updateLogoUrl, refreshSettings } = useSiteSettings();

  const [currentLogo, setCurrentLogo] = useState<string>(logoUrl || CANONICAL_DEFAULT_LOGO);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(logoUrl || CANONICAL_DEFAULT_LOGO);
  const [urlInput, setUrlInput] = useState<string>('');
  const [inputMode, setInputMode] = useState<'upload' | 'url'>('upload');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState<boolean>(false);

  // Aspect ratio and dimension metrics
  const [dimensions, setDimensions] = useState<{ width: number; height: number; ratio: string } | null>(null);

  // Preview context controls
  const [previewTheme, setPreviewTheme] = useState<'light' | 'dark'>('light');
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'mobile'>('desktop');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (logoUrl) {
      setCurrentLogo(logoUrl);
      if (!selectedFile) {
        setPreviewUrl(logoUrl);
      }
    }
  }, [logoUrl, selectedFile]);

  // Compute natural dimensions and aspect ratio of preview image
  useEffect(() => {
    if (!previewUrl) return;
    const img = new Image();
    img.src = previewUrl;
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const ratioVal = h > 0 ? (w / h).toFixed(2) : '1.00';
      let ratioName = `${ratioVal} : 1`;
      if (Math.abs(w / h - 1) < 0.05) ratioName = '1:1 (Square / Emblem)';
      else if (Math.abs(w / h - 1.78) < 0.1) ratioName = '16:9 (Widescreen)';
      else if (w / h > 2) ratioName = `${ratioVal}:1 (Horizontal Banner)`;

      setDimensions({ width: w, height: h, ratio: ratioName });
    };
    img.onerror = () => {
      setDimensions(null);
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    setSaveSuccess(false);
    setConfirmReset(false);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please choose a valid image file (PNG, JPG, SVG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image size exceeds 5MB limit. Please upload a smaller image.');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleApplyUrl = () => {
    setErrorMessage(null);
    setSaveSuccess(false);
    setConfirmReset(false);
    if (!urlInput.trim()) {
      setErrorMessage('Please enter an image URL.');
      return;
    }
    setSelectedFile(null);
    setPreviewUrl(urlInput.trim());
  };

  const handleResetToDefault = async () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    setConfirmReset(false);
    setSelectedFile(null);
    setUrlInput('');
    setPreviewUrl(CANONICAL_DEFAULT_LOGO);
    setErrorMessage(null);
    setSaveSuccess(false);

    setIsSaving(true);
    try {
      const { logoUrl: savedUrl } = await uploadAndPersistTrademarkLogo({
        directUrl: CANONICAL_DEFAULT_LOGO,
      });
      setCurrentLogo(savedUrl);
      setPreviewUrl(savedUrl);
      updateLogoUrl(savedUrl);
      await refreshSettings();
      setSaveSuccess(true);
      onNotification('Reverted to the official canonical Vastu Ritam trademark logo globally.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to reset logo to default');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveLogo = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    setSaveSuccess(false);
    setConfirmReset(false);

    try {
      const { logoUrl: finalUrl } = await uploadAndPersistTrademarkLogo({
        file: selectedFile,
        directUrl: selectedFile ? undefined : previewUrl,
      });

      // Update state and global context
      setCurrentLogo(finalUrl);
      setPreviewUrl(finalUrl);
      setSelectedFile(null);
      updateLogoUrl(finalUrl);
      await refreshSettings();

      setSaveSuccess(true);
      onNotification('Website Logo uploaded and persisted globally in Firestore, database, and server storage!');
    } catch (err: any) {
      console.error('Error saving logo:', err);
      setErrorMessage(err.message || 'Failed to save logo setting');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 font-serif">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-amber-900/60">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-[#C51E28] font-bold">
            <ImageIcon className="w-4 h-4 text-[#C51E28]" />
            <span>Vastu Purusha Emblem & Global Trademark Logo Management</span>
          </div>
          <h2 className="font-['Cinzel',serif] text-2xl sm:text-3xl font-bold text-[#2A1515] mt-1">
            Emblem & Website Logo Settings
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl font-['Marcellus']">
            Upload, preview, replace, and persist the official Vastu Ritam® trademark logo across Firestore, Firebase Storage, and the server database. Any logo saved here stays permanently active across all visitor devices and sessions until changed again.
          </p>
        </div>

        {/* Quick Reset Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {confirmReset ? (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-300 px-3 py-1.5 rounded-xl">
              <span className="text-xs text-amber-900 font-bold">Reset to canonical trademark?</span>
              <button
                onClick={handleResetToDefault}
                type="button"
                className="px-2.5 py-1 rounded-lg bg-[#C51E28] text-white text-xs font-bold cursor-pointer"
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                type="button"
                className="px-2 py-1 rounded-lg bg-white border border-stone-300 text-stone-700 text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={handleResetToDefault}
              type="button"
              className="px-3.5 py-2 rounded-xl border border-[#D5C2B5] bg-white text-[#2A1515] hover:bg-[#FAF6EE] text-xs font-mono flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
              title="Reset to default canonical trademark logo"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#C51E28]" />
              <span>Reset to Canonical Logo</span>
            </button>
          )}
        </div>
      </div>

      {/* Success Notification */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-800 flex items-center gap-3 shadow-xs animate-in fade-in duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-xs sm:text-sm">
            <span className="font-bold">Logo Published Globally!</span> Your website trademark logo is now stored in Firestore & server storage and is immediately visible to all visitors across every page of the platform.
          </div>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-300 text-red-800 flex items-center gap-3 shadow-xs animate-in fade-in duration-300">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <div className="text-xs sm:text-sm">{errorMessage}</div>
        </div>
      )}

      {/* Two Column Layout: Left Column Upload Form, Right Column Real-Time Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (6 cols): Upload & Configuration */}
        <div className="lg:col-span-6 space-y-6">
          {/* Card: Logo Source Selection */}
          <div className="rounded-2xl bg-[#FFFDF9] border border-[#E8DEC8] p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DEC8]">
              <span className="text-xs uppercase font-bold text-[#2A1515] tracking-wider flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-[#167A68]" />
                <span>Global Logo Source</span>
              </span>
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#D5C2B5] shadow-xs">
                <button
                  type="button"
                  onClick={() => setInputMode('upload')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    inputMode === 'upload'
                      ? 'bg-[#C51E28] text-white shadow-xs'
                      : 'text-stone-600 hover:text-[#C51E28]'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('url')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    inputMode === 'url'
                      ? 'bg-[#C51E28] text-white shadow-xs'
                      : 'text-stone-600 hover:text-[#C51E28]'
                  }`}
                >
                  Direct URL
                </button>
              </div>
            </div>

            {/* Mode 1: File Upload */}
            {inputMode === 'upload' && (
              <div className="space-y-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#D5C2B5] hover:border-[#C51E28] rounded-2xl p-6 sm:p-8 text-center bg-white hover:bg-[#FAF6EE] transition-all cursor-pointer group space-y-3"
                >
                  <div className="w-12 h-12 rounded-full bg-[#FDF2F4] border border-[#FBCFE8] text-[#C51E28] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-[#2A1515] block">
                      Click to Browse or Drag Official Trademark Logo Here
                    </span>
                    <span className="text-[11px] text-stone-500 block mt-1">
                      Supports PNG, SVG, JPG, WebP (Max 5MB · Persisted in Firestore & Storage)
                    </span>
                  </div>
                  {selectedFile && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FDF2F4] border border-[#FBCFE8] text-[#C51E28] text-xs font-mono font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mode 2: Direct Image URL */}
            {inputMode === 'url' && (
              <div className="space-y-3">
                <label className="block text-xs font-mono text-stone-600 uppercase font-bold">
                  Image Public or Asset URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="e.g. /trademark-logo.jpg or https://example.com/logo.png"
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B5] text-[#2A1515] placeholder:text-stone-400 text-xs font-mono focus:outline-none focus:border-[#C51E28]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyUrl}
                    className="px-4 py-2.5 rounded-xl bg-[#C51E28] hover:bg-[#A20D18] text-white text-xs font-bold font-mono cursor-pointer transition-colors shadow-xs"
                  >
                    Load
                  </button>
                </div>
              </div>
            )}

            {/* Logo Specifications & Aspect Ratio Card */}
            {dimensions && (
              <div className="rounded-xl bg-white border border-[#E8DEC8] p-4 space-y-2 text-xs font-mono shadow-xs">
                <div className="flex items-center justify-between text-stone-600">
                  <span>Natural Dimensions:</span>
                  <span className="text-[#2A1515] font-bold">
                    {dimensions.width}px × {dimensions.height}px
                  </span>
                </div>
                <div className="flex items-center justify-between text-stone-600">
                  <span>Aspect Ratio:</span>
                  <span className="text-[#2A1515] font-bold">{dimensions.ratio}</span>
                </div>
                <div className="flex items-center justify-between text-stone-600">
                  <span>Global Persistence:</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Firestore + Database Active
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={handleSaveLogo}
                disabled={isSaving}
                className="flex-1 py-3 px-6 rounded-xl bg-[#C51E28] hover:bg-[#A20D18] text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Uploading & Persisting Globally...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Save & Publish Website Logo Globally</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (6 cols): Multi-Context Live Previews */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-2xl bg-[#FFFDF9] border border-[#E8DEC8] p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DEC8]">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#C51E28]" />
                <span className="text-xs uppercase font-bold text-[#2A1515] tracking-wider">
                  Live Multi-Placement Preview
                </span>
              </div>

              {/* Theme & Viewport Toggle */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
                  className="p-1.5 rounded-lg bg-white border border-[#D5C2B5] text-[#2A1515] hover:bg-[#FAF6EE] cursor-pointer shadow-xs"
                  title="Toggle Light / Dark Preview"
                >
                  {previewTheme === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewViewport((prev) => (prev === 'desktop' ? 'mobile' : 'desktop'))}
                  className="p-1.5 rounded-lg bg-white border border-[#D5C2B5] text-[#2A1515] hover:bg-[#FAF6EE] cursor-pointer shadow-xs"
                  title="Toggle Desktop / Mobile Bar Preview"
                >
                  {previewViewport === 'desktop' ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Context 1: Navigation Bar Preview (Emblem Badge + Brand Title) */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-stone-500">
                1. Top Navigation Bar (Emblem Badge + Title)
              </span>
              <div
                className={`rounded-xl border p-3 sm:p-4 transition-colors duration-200 ${
                  previewTheme === 'light'
                    ? 'bg-[#FFFAF5] border-[#EBDCD5] text-[#2A1515]'
                    : 'bg-[#1A0F0F] border-[#44262E] text-[#FFF6F7]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <VastuRitamLogo
                    variant="horizontal"
                    size={previewViewport === 'desktop' ? 44 : 38}
                    customLogoUrl={previewUrl}
                  />

                  <div className="hidden sm:flex items-center gap-3 text-xs opacity-70">
                    <span className="hover:text-amber-600 cursor-pointer">Gyan Kosh</span>
                    <span className="hover:text-amber-600 cursor-pointer">Discover</span>
                    <span className="px-3 py-1 rounded-lg bg-[#C51E28] text-white font-bold text-[11px]">
                      Consult
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Context 2: Full Trademark Lockup Variant (Our Emblem & Footer) */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-stone-500">
                2. Full Trademark Lockup (Our Emblem Section & Footer)
              </span>
              <div
                className={`rounded-xl border p-4 flex items-center justify-center transition-colors duration-200 ${
                  previewTheme === 'light'
                    ? 'bg-[#FFFAF5] border-[#EBDCD5]'
                    : 'bg-[#1A0F0F] border-[#44262E]'
                }`}
              >
                <div className="max-w-[200px] w-full flex justify-center">
                  <VastuRitamLogo variant="full" size={160} customLogoUrl={previewUrl} />
                </div>
              </div>
            </div>

            {/* Context 3: Sacred Circular Emblem Variant */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-stone-500">
                3. Circular Emblem Badge Variant
              </span>
              <div
                className={`rounded-xl border p-4 sm:p-6 flex items-center justify-center gap-6 transition-colors duration-200 ${
                  previewTheme === 'light'
                    ? 'bg-[#FFFAF5] border-[#EBDCD5]'
                    : 'bg-[#1A0F0F] border-[#44262E]'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <VastuRitamLogo variant="emblem" size={60} customLogoUrl={previewUrl} />
                  <span className="text-[10px] font-mono text-stone-500">60px Emblem</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <VastuRitamLogo variant="emblem" size={80} customLogoUrl={previewUrl} />
                  <span className="text-[10px] font-mono text-stone-500">80px Large</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <VastuRitamLogo variant="emblem" size={44} customLogoUrl={previewUrl} />
                  <span className="text-[10px] font-mono text-stone-500">44px Navbar</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
