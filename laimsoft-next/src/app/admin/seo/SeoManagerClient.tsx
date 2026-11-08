'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SeoPageData, SeoGlobalData } from '@/lib/seo';

interface Props {
  initialPages: SeoPageData[];
  initialGlobal: SeoGlobalData;
  initialContents?: Record<string, any>;
}

const MAIN_CONTENT_ROUTES = [
  { path: '/', label: 'Homepage', icon: 'home' },
  { path: '/about', label: 'About Us', icon: 'info' },
  { path: '/services', label: 'Our Services', icon: 'layers' },
  { path: '/contact', label: 'Contact Us', icon: 'mail' },
];

const SINGLE_SERVICE_ROUTES = [
  { path: '/services/ai-solutions', label: 'AI Solutions & ML', icon: 'psychology' },
  { path: '/services/web-development', label: 'Web Development', icon: 'code' },
  { path: '/services/custom-software', label: 'Custom Software', icon: 'terminal' },
  { path: '/services/digital-marketing', label: 'Digital Marketing', icon: 'trending_up' },
  { path: '/services/mobile-app', label: 'Mobile App Dev', icon: 'smartphone' },
  { path: '/services/ui-ux', label: 'UI/UX Design', icon: 'palette' },
];

export default function SeoManagerClient({
  initialPages,
  initialGlobal,
  initialContents = {},
}: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'pages' | 'content' | 'global' | 'sitemap' | 'schema'>('pages');
  const [pages, setPages] = useState<SeoPageData[]>(initialPages);
  const [globalSettings, setGlobalSettings] = useState<SeoGlobalData>(initialGlobal);
  const [selectedPath, setSelectedPath] = useState<string>(initialPages[0]?.path || '/');

  // Page Content state
  const [contents, setContents] = useState<Record<string, any>>(initialContents);
  const [selectedContentPath, setSelectedContentPath] = useState<string>('/');
  const [contentSaving, setContentSaving] = useState(false);
  const [contentResetting, setContentResetting] = useState(false);

  // Currently edited page
  const selectedPage = pages.find((p) => p.path === selectedPath) || pages[0] || {
    path: '/',
    pageName: 'Homepage',
    title: '',
    description: '',
    keywords: '',
    ogImage: '',
    canonicalUrl: '',
    noIndex: 0,
    noFollow: 0,
  };

  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [copiedSitemap, setCopiedSitemap] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  // Content input change handler
  const handleContentFieldChange = (key: string, value: string) => {
    setContents((prev) => ({
      ...prev,
      [selectedContentPath]: {
        ...(prev[selectedContentPath] || {}),
        [key]: value,
      },
    }));
  };

  // Save current page live content
  const handleSaveContent = async () => {
    setContentSaving(true);
    setAlert(null);
    try {
      const activeSections = contents[selectedContentPath] || {};
      const res = await fetch('/api/admin/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_content',
          path: selectedContentPath,
          sections: activeSections,
        }),
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        showAlert('success', data.message || 'Page content saved & edge cache refreshed.');
        router.refresh();
      } else {
        showAlert('error', data.message || 'Failed to save content.');
      }
    } catch {
      showAlert('error', 'Network error while saving page content.');
    } finally {
      setContentSaving(false);
    }
  };

  // Reset current page live content back to default
  const handleResetContent = async () => {
    if (!confirm(`Reset content for "${selectedContentPath}" back to standard defaults? All current custom copy will be overwritten.`)) {
      return;
    }
    setContentResetting(true);
    setAlert(null);
    try {
      const res = await fetch('/api/admin/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset_content',
          path: selectedContentPath,
        }),
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        if (data.sections) {
          setContents((prev) => ({
            ...prev,
            [selectedContentPath]: data.sections,
          }));
        }
        showAlert('success', data.message || 'Content reset to default template.');
        router.refresh();
      } else {
        showAlert('error', data.message || 'Failed to reset content.');
      }
    } catch {
      showAlert('error', 'Network error while resetting page content.');
    } finally {
      setContentResetting(false);
    }
  };

  // Page input changes
  const handlePageFieldChange = (field: keyof SeoPageData, value: any) => {
    setPages((prev) =>
      prev.map((p) => (p.path === selectedPath ? { ...p, [field]: value } : p))
    );
  };

  // Global input changes
  const handleGlobalFieldChange = (field: keyof SeoGlobalData, value: any) => {
    setGlobalSettings((prev) => ({ ...prev, [field]: value }));
  };

  // Save current page SEO
  const handleSavePage = async () => {
    setSaving(true);
    setAlert(null);
    try {
      const res = await fetch('/api/admin/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_page',
          ...selectedPage,
        }),
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        showAlert('success', data.message || 'Page SEO saved successfully.');
        router.refresh();
      } else {
        showAlert('error', data.message || 'Failed to save page SEO.');
      }
    } catch {
      showAlert('error', 'Network error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  // Save global SEO settings
  const handleSaveGlobal = async () => {
    setSaving(true);
    setAlert(null);
    try {
      const res = await fetch('/api/admin/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_global',
          ...globalSettings,
        }),
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        showAlert('success', data.message || 'Global SEO settings saved.');
        router.refresh();
      } else {
        showAlert('error', data.message || 'Failed to save global SEO.');
      }
    } catch {
      showAlert('error', 'Network error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  // Reset or Seed defaults
  const handleSeedDefaults = async () => {
    if (!confirm('Populate any missing standard routes and schemas with high-performance defaults?')) {
      return;
    }
    setSeeding(true);
    setAlert(null);
    try {
      const res = await fetch('/api/admin/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'seed_defaults' }),
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        showAlert('success', data.message || 'Default SEO metadata populated.');
        router.refresh();
      } else {
        showAlert('error', data.message || 'Failed to seed defaults.');
      }
    } catch {
      showAlert('error', 'Network error while seeding defaults.');
    } finally {
      setSeeding(false);
    }
  };

  const handleCopySitemap = () => {
    navigator.clipboard.writeText('https://laimsoft.site/sitemap.xml');
    setCopiedSitemap(true);
    setTimeout(() => setCopiedSitemap(false), 2500);
  };

  // Character calculations & Health score
  const titleLen = selectedPage.title?.length || 0;
  const descLen = selectedPage.description?.length || 0;
  const isTitleOptimal = titleLen >= 40 && titleLen <= 65;
  const isDescOptimal = descLen >= 120 && descLen <= 165;
  const hasCanonical = !!selectedPage.canonicalUrl;
  const hasOgImage = !!selectedPage.ogImage;
  const isIndexable = !selectedPage.noIndex;

  let healthScore = 0;
  if (isTitleOptimal) healthScore += 25;
  else if (titleLen > 0) healthScore += 15;

  if (isDescOptimal) healthScore += 25;
  else if (descLen > 0) healthScore += 15;

  if (hasCanonical) healthScore += 20;
  if (hasOgImage) healthScore += 20;
  if (isIndexable) healthScore += 10;

  const scoreBadgeColor =
    healthScore >= 80 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
    healthScore >= 50 ? 'text-amber-700 bg-amber-50 border-amber-200' :
    'text-rose-700 bg-rose-50 border-rose-200';

  return (
    <div className="space-y-8">
      {/* ── Status Alert Notification ── */}
      {alert && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between shadow-sm transition-all animate-fadeIn ${
            alert.type === 'success'
              ? 'bg-[#ecfdf5] border-[#a7f3d0] text-[#065f46]'
              : 'bg-[#fff1f2] border-[#fecdd3] text-[#9f1239]'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[20px]">
              {alert.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <span className="text-sm font-semibold">{alert.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setAlert(null)}
            className="text-xs uppercase font-bold tracking-wider hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── Navigation Tabs ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[rgba(207,196,197,0.30)] pb-4">
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-[rgba(207,196,197,0.30)] shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab('pages')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all ${
              activeTab === 'pages'
                ? 'bg-black text-white shadow-sm'
                : 'text-[#5f5e5e] hover:text-black hover:bg-slate-50'
            }`}
            style={{ fontFamily: "'Space Grotesk', monospace" }}
          >
            <span className="material-symbols-outlined text-[18px]">web</span>
            Page-by-Page SEO
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('content')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all ${
              activeTab === 'content'
                ? 'bg-black text-white shadow-sm'
                : 'text-[#5f5e5e] hover:text-black hover:bg-slate-50'
            }`}
            style={{ fontFamily: "'Space Grotesk', monospace" }}
          >
            <span className="material-symbols-outlined text-[18px]">edit_document</span>
            Live Page Content
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('global')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all ${
              activeTab === 'global'
                ? 'bg-black text-white shadow-sm'
                : 'text-[#5f5e5e] hover:text-black hover:bg-slate-50'
            }`}
            style={{ fontFamily: "'Space Grotesk', monospace" }}
          >
            <span className="material-symbols-outlined text-[18px]">verified_user</span>
            Webmaster & Global
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sitemap')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all ${
              activeTab === 'sitemap'
                ? 'bg-black text-white shadow-sm'
                : 'text-[#5f5e5e] hover:text-black hover:bg-slate-50'
            }`}
            style={{ fontFamily: "'Space Grotesk', monospace" }}
          >
            <span className="material-symbols-outlined text-[18px]">lan</span>
            Sitemap & Robots
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('schema')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all ${
              activeTab === 'schema'
                ? 'bg-black text-white shadow-sm'
                : 'text-[#5f5e5e] hover:text-black hover:bg-slate-50'
            }`}
            style={{ fontFamily: "'Space Grotesk', monospace" }}
          >
            <span className="material-symbols-outlined text-[18px]">schema</span>
            Structured Data
          </button>
        </div>

        <button
          type="button"
          onClick={handleSeedDefaults}
          disabled={seeding}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[rgba(207,196,197,0.40)] bg-white text-[#5f5e5e] hover:text-black hover:border-black text-[11px] font-semibold uppercase tracking-wider transition-colors disabled:opacity-50"
          style={{ fontFamily: "'Space Grotesk', monospace" }}
          title="Restore standard recommended configurations"
        >
          <span className="material-symbols-outlined text-[16px]">restart_alt</span>
          {seeding ? 'Seeding...' : 'Load Standard Defaults'}
        </button>
      </div>

      {/* ════════════════════════════════════════════════════════════════
           TAB 1: PAGE-BY-PAGE SEO WITH LIVE SERP & SOCIAL PREVIEWS
      ════════════════════════════════════════════════════════════════ */}
      {activeTab === 'pages' && (
        <div className="space-y-6">
          {/* Route selector pills */}
          <div className="bg-white p-3.5 rounded-xl border border-[rgba(207,196,197,0.25)] shadow-sm space-y-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5f5e5e] mr-2 shrink-0 flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">home</span>
                Main Pages:
              </span>
              {pages
                .filter((p) => !p.path.startsWith('/services/') || p.path === '/services')
                .map((p) => {
                  const isSelected = p.path === selectedPath;
                  return (
                    <button
                      key={p.path}
                      type="button"
                      onClick={() => setSelectedPath(p.path)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                        isSelected
                          ? 'bg-black text-white border-black shadow-sm'
                          : 'bg-white text-[#5f5e5e] border-[rgba(207,196,197,0.35)] hover:border-black hover:text-black'
                      }`}
                      style={{ fontFamily: "'Space Grotesk', monospace" }}
                    >
                      {p.pageName}
                    </button>
                  );
                })}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[rgba(207,196,197,0.20)]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5f5e5e] mr-2 shrink-0 flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">terminal</span>
                Single Services:
              </span>
              {pages
                .filter((p) => p.path.startsWith('/services/') && p.path !== '/services')
                .map((p) => {
                  const isSelected = p.path === selectedPath;
                  return (
                    <button
                      key={p.path}
                      type="button"
                      onClick={() => setSelectedPath(p.path)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                        isSelected
                          ? 'bg-black text-white border-black shadow-sm'
                          : 'bg-white text-[#5f5e5e] border-[rgba(207,196,197,0.35)] hover:border-black hover:text-black'
                      }`}
                      style={{ fontFamily: "'Space Grotesk', monospace" }}
                    >
                      {p.pageName}
                    </button>
                  );
                })}
            </div>
          </div>

          {/* 2-Column Grid: Form Inputs (Left) vs Real-Time Previews (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Form Controls */}
            <div className="lg:col-span-7 bg-white rounded-xl border border-[rgba(207,196,197,0.25)] p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[rgba(207,196,197,0.20)]">
                <div>
                  <h2 className="text-lg font-bold text-black flex items-center gap-2">
                    <span>{selectedPage.pageName}</span>
                    <span className="text-xs font-mono font-normal text-[#5f5e5e] bg-slate-100 px-2 py-0.5 rounded">
                      {selectedPage.path}
                    </span>
                  </h2>
                  <p className="text-xs text-[#5f5e5e] mt-0.5">
                    Configure meta tags and social card directives for this endpoint.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSavePage}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-black text-white hover:shadow-[0_0_15px_rgba(0,255,136,0.3)] hover:scale-[1.02] active:scale-95 transition-all text-[11px] font-semibold tracking-wider uppercase disabled:opacity-50"
                  style={{ fontFamily: "'Space Grotesk', monospace" }}
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  {saving ? 'Saving...' : 'Save Page SEO'}
                </button>
              </div>

              {/* Meta Title */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#1b1b1b]">
                    Meta Title
                  </label>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      isTitleOptimal
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {titleLen} / 60 chars {isTitleOptimal ? '✓ Optimal' : '(Aim for 50-60)'}
                  </span>
                </div>
                <input
                  type="text"
                  value={selectedPage.title}
                  onChange={(e) => handlePageFieldChange('title', e.target.value)}
                  placeholder="e.g. Laimsoft — High-Performance Software Firm"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#cfc4c5] text-sm text-black outline-none focus:border-black transition-colors"
                />
              </div>

              {/* Meta Description */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#1b1b1b]">
                    Meta Description
                  </label>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      isDescOptimal
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {descLen} / 160 chars {isDescOptimal ? '✓ Optimal' : '(Aim for 140-160)'}
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={selectedPage.description}
                  onChange={(e) => handlePageFieldChange('description', e.target.value)}
                  placeholder="Compelling summary explaining the purpose of this page to Google searchers..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#cfc4c5] text-sm text-black outline-none focus:border-black transition-colors resize-y leading-relaxed"
                />
              </div>

              {/* Canonical URL & Focus Keywords */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1b1b1b] mb-1.5">
                    Canonical URL
                  </label>
                  <input
                    type="url"
                    value={selectedPage.canonicalUrl || ''}
                    onChange={(e) => handlePageFieldChange('canonicalUrl', e.target.value)}
                    placeholder="https://laimsoft.site/about"
                    className="w-full px-3.5 py-2 rounded-lg border border-[#cfc4c5] text-xs text-black outline-none focus:border-black transition-colors font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1b1b1b] mb-1.5">
                    Focus Keywords (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={selectedPage.keywords || ''}
                    onChange={(e) => handlePageFieldChange('keywords', e.target.value)}
                    placeholder="software firm, nextjs, AI development"
                    className="w-full px-3.5 py-2 rounded-lg border border-[#cfc4c5] text-xs text-black outline-none focus:border-black transition-colors"
                  />
                </div>
              </div>

              {/* Social Share Image (OG Image) */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1b1b1b] mb-1.5">
                  Social Share Image (OpenGraph 1200×630)
                </label>
                <input
                  type="text"
                  value={selectedPage.ogImage || ''}
                  onChange={(e) => handlePageFieldChange('ogImage', e.target.value)}
                  placeholder="https://laimsoft.site/images/og-banner.jpg or /images/..."
                  className="w-full px-3.5 py-2 rounded-lg border border-[#cfc4c5] text-xs text-black outline-none focus:border-black transition-colors font-mono"
                />
              </div>

              {/* Robots Directives */}
              <div className="pt-2 border-t border-[rgba(207,196,197,0.20)]">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-[#1b1b1b] mb-3">
                  Search Crawler Robots Directives
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-[rgba(207,196,197,0.30)] bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!selectedPage.noIndex}
                      onChange={(e) => handlePageFieldChange('noIndex', e.target.checked ? 0 : 1)}
                      className="w-4 h-4 rounded text-black focus:ring-black"
                    />
                    <div>
                      <span className="text-xs font-semibold text-black block">Index this page</span>
                      <span className="text-[10px] text-[#5f5e5e]">Allow search engines to show this page</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-lg border border-[rgba(207,196,197,0.30)] bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!selectedPage.noFollow}
                      onChange={(e) => handlePageFieldChange('noFollow', e.target.checked ? 0 : 1)}
                      className="w-4 h-4 rounded text-black focus:ring-black"
                    />
                    <div>
                      <span className="text-xs font-semibold text-black block">Follow internal links</span>
                      <span className="text-[10px] text-[#5f5e5e]">Permit bots to crawl links on this page</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column: Live Interactive SERP & Social Card Previews */}
            <div className="lg:col-span-5 space-y-6">
              {/* Quality Score Bento */}
              <div className="bg-white rounded-xl border border-[rgba(207,196,197,0.25)] p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="text-[11px] font-bold uppercase tracking-wider text-[#5f5e5e]"
                    style={{ fontFamily: "'Space Grotesk', monospace" }}
                  >
                    Live SEO Audit
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${scoreBadgeColor}`}
                  >
                    Score: {healthScore}/100
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[#5f5e5e]">
                    <span>Title Length (50–65 chars)</span>
                    <span className={isTitleOptimal ? 'text-emerald-600 font-bold' : 'text-amber-600'}>
                      {isTitleOptimal ? '✓ Great' : `${titleLen} chars`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[#5f5e5e]">
                    <span>Description Length (120–165 chars)</span>
                    <span className={isDescOptimal ? 'text-emerald-600 font-bold' : 'text-amber-600'}>
                      {isDescOptimal ? '✓ Great' : `${descLen} chars`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[#5f5e5e]">
                    <span>Social Banner (OG Image)</span>
                    <span className={hasOgImage ? 'text-emerald-600 font-bold' : 'text-amber-600'}>
                      {hasOgImage ? '✓ Connected' : 'Missing'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[#5f5e5e]">
                    <span>Canonical Tag</span>
                    <span className={hasCanonical ? 'text-emerald-600 font-bold' : 'text-amber-600'}>
                      {hasCanonical ? '✓ Canonicalized' : 'Auto'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 1. Google SERP Snippet Preview */}
              <div className="bg-white rounded-xl border border-[rgba(207,196,197,0.25)] p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-blue-600">search</span>
                    <span
                      className="text-[11px] font-bold uppercase tracking-wider text-black"
                      style={{ fontFamily: "'Space Grotesk', monospace" }}
                    >
                      Google Search Snippet Preview
                    </span>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded text-[10px]">
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('desktop')}
                      className={`px-2 py-0.5 rounded ${previewDevice === 'desktop' ? 'bg-white shadow-xs font-bold' : 'text-[#5f5e5e]'}`}
                    >
                      Desktop
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('mobile')}
                      className={`px-2 py-0.5 rounded ${previewDevice === 'mobile' ? 'bg-white shadow-xs font-bold' : 'text-[#5f5e5e]'}`}
                    >
                      Mobile
                    </button>
                  </div>
                </div>

                {/* Google Card Simulation */}
                <div
                  className={`p-4 bg-white border border-slate-200 rounded-lg font-sans ${
                    previewDevice === 'mobile' ? 'max-w-[340px] mx-auto text-xs' : ''
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1 text-[12px] text-[#202124]">
                    <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold">
                      L
                    </div>
                    <span className="truncate">laimsoft.site</span>
                    <span className="text-[#5f6368]">› {selectedPage.path.replace('/', '') || 'home'}</span>
                  </div>
                  <h3 className="text-[#1a0dab] hover:underline cursor-pointer text-[17px] font-medium leading-snug line-clamp-1 mb-1">
                    {selectedPage.title || 'Untitled Page — Laimsoft'}
                  </h3>
                  <p className="text-[#4d5156] text-[13px] leading-relaxed line-clamp-2">
                    {selectedPage.description || 'No description provided. Add a meta description so search engines can summarize your content.'}
                  </p>
                </div>
              </div>

              {/* 2. Social Media Share Card Preview */}
              <div className="bg-white rounded-xl border border-[rgba(207,196,197,0.25)] p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-[18px] text-emerald-600">share</span>
                  <span
                    className="text-[11px] font-bold uppercase tracking-wider text-black"
                    style={{ fontFamily: "'Space Grotesk', monospace" }}
                  >
                    Social Share Card Preview (OpenGraph)
                  </span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 font-sans shadow-xs">
                  <div className="aspect-[1.91/1] w-full bg-slate-900 relative overflow-hidden flex items-center justify-center">
                    {selectedPage.ogImage ? (
                      <img
                        src={selectedPage.ogImage}
                        alt="OG Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                        <span className="material-symbols-outlined text-[32px] mb-1">image</span>
                        <span className="text-[11px]">No social share image attached</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3.5 bg-white border-t border-slate-200">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                      laimsoft.site
                    </span>
                    <h4 className="text-sm font-bold text-black line-clamp-1 mb-1">
                      {selectedPage.title || 'Laimsoft — Engineering Precision'}
                    </h4>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {selectedPage.description || 'Precision software architectures and intelligence.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
           TAB: LIVE PAGE CONTENT EDITOR (EDGE-CACHED ZERO-LATENCY)
      ════════════════════════════════════════════════════════════════ */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          {/* Page Route Selector */}
          <div className="bg-white p-4 rounded-xl border border-[rgba(207,196,197,0.25)] shadow-sm space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#5f5e5e] mr-2 shrink-0 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px]">home</span>
                  Main Pages:
                </span>
                {MAIN_CONTENT_ROUTES.map((route) => {
                  const isSelected = route.path === selectedContentPath;
                  return (
                    <button
                      key={route.path}
                      type="button"
                      onClick={() => setSelectedContentPath(route.path)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                        isSelected
                          ? 'bg-black text-white border-black shadow-sm'
                          : 'bg-white text-[#5f5e5e] border-[rgba(207,196,197,0.35)] hover:border-black hover:text-black'
                      }`}
                      style={{ fontFamily: "'Space Grotesk', monospace" }}
                    >
                      <span className="material-symbols-outlined text-[15px]">{route.icon}</span>
                      {route.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={selectedContentPath}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[rgba(207,196,197,0.35)] text-[#5f5e5e] hover:text-black hover:border-black text-xs font-semibold transition-all"
                  style={{ fontFamily: "'Space Grotesk', monospace" }}
                >
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                  Preview Live
                </a>
                <button
                  type="button"
                  onClick={handleResetContent}
                  disabled={contentResetting}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[rgba(207,196,197,0.35)] text-rose-600 hover:border-rose-300 hover:bg-rose-50 text-xs font-semibold transition-all disabled:opacity-50"
                  style={{ fontFamily: "'Space Grotesk', monospace" }}
                  title="Restore default hardcoded copy"
                >
                  <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                  {contentResetting ? 'Resetting...' : 'Restore Defaults'}
                </button>
                <button
                  type="button"
                  onClick={handleSaveContent}
                  disabled={contentSaving}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-black text-white hover:shadow-[0_0_15px_rgba(0,255,136,0.3)] hover:scale-[1.02] active:scale-95 transition-all text-xs font-semibold uppercase tracking-wider disabled:opacity-50"
                  style={{ fontFamily: "'Space Grotesk', monospace" }}
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  {contentSaving ? 'Saving...' : 'Save Live Content'}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[rgba(207,196,197,0.20)]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5f5e5e] mr-2 shrink-0 flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">terminal</span>
                Single Services:
              </span>
              {SINGLE_SERVICE_ROUTES.map((route) => {
                const isSelected = route.path === selectedContentPath;
                return (
                  <button
                    key={route.path}
                    type="button"
                    onClick={() => setSelectedContentPath(route.path)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                      isSelected
                        ? 'bg-black text-white border-black shadow-sm'
                        : 'bg-white text-[#5f5e5e] border-[rgba(207,196,197,0.35)] hover:border-black hover:text-black'
                    }`}
                    style={{ fontFamily: "'Space Grotesk', monospace" }}
                  >
                    <span className="material-symbols-outlined text-[15px]">{route.icon}</span>
                    {route.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2-Column Grid: Form Inputs (Left) vs Live Responsive Preview & Cache Info (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Form Controls */}
            <div className="lg:col-span-7 space-y-6">
              {/* ── HOMEPAGE FIELDS ── */}
              {selectedContentPath === '/' && (
                <div className="bg-white rounded-xl border border-[rgba(207,196,197,0.25)] p-6 shadow-sm space-y-6">
                  <div className="pb-4 border-b border-[rgba(207,196,197,0.20)]">
                    <h2 className="text-base font-bold text-black flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-500 text-[20px]">rocket_launch</span>
                      Homepage Hero & Main Banner
                    </h2>
                    <p className="text-xs text-[#5f5e5e] mt-0.5">
                      The primary headline and call-to-actions displayed over the corporate video background.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f5e5e] mb-1">
                        Hero Pill Badge
                      </label>
                      <input
                        type="text"
                        value={contents['/']?.heroBadge || ''}
                        onChange={(e) => handleContentFieldChange('heroBadge', e.target.value)}
                        placeholder="The Future of Software Engineering"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[rgba(207,196,197,0.40)] text-sm focus:outline-none focus:border-black font-sans"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f5e5e] mb-1">
                          Main Title Line
                        </label>
                        <input
                          type="text"
                          value={contents['/']?.heroHeading || ''}
                          onChange={(e) => handleContentFieldChange('heroHeading', e.target.value)}
                          placeholder="Precision Built"
                          className="w-full px-3.5 py-2.5 rounded-lg border border-[rgba(207,196,197,0.40)] text-sm font-bold focus:outline-none focus:border-black font-sans"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f5e5e] mb-1">
                          Title Accent Word
                        </label>
                        <input
                          type="text"
                          value={contents['/']?.heroHeadingAccent || ''}
                          onChange={(e) => handleContentFieldChange('heroHeadingAccent', e.target.value)}
                          placeholder="Digital Assets."
                          className="w-full px-3.5 py-2.5 rounded-lg border border-[rgba(207,196,197,0.40)] text-sm font-bold text-slate-500 focus:outline-none focus:border-black font-sans"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f5e5e] mb-1">
                        Hero Subheading Paragraph
                      </label>
                      <textarea
                        rows={3}
                        value={contents['/']?.heroSubheading || ''}
                        onChange={(e) => handleContentFieldChange('heroSubheading', e.target.value)}
                        placeholder="We orchestrate high-performance digital ecosystems through elite engineering and data-driven intelligence."
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[rgba(207,196,197,0.40)] text-sm leading-relaxed focus:outline-none focus:border-black font-sans"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[rgba(207,196,197,0.15)]">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f5e5e] mb-1">
                          Primary Button Text
                        </label>
                        <input
                          type="text"
                          value={contents['/']?.heroPrimaryBtnText || ''}
                          onChange={(e) => handleContentFieldChange('heroPrimaryBtnText', e.target.value)}
                          placeholder="Get Started"
                          className="w-full px-3 py-2 rounded-lg border border-[rgba(207,196,197,0.40)] text-xs font-medium focus:outline-none focus:border-black font-sans"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f5e5e] mb-1">
                          Primary Button Link
                        </label>
                        <input
                          type="text"
                          value={contents['/']?.heroPrimaryBtnLink || ''}
                          onChange={(e) => handleContentFieldChange('heroPrimaryBtnLink', e.target.value)}
                          placeholder="/contact"
                          className="w-full px-3 py-2 rounded-lg border border-[rgba(207,196,197,0.40)] text-xs font-mono focus:outline-none focus:border-black"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f5e5e] mb-1">
                          Secondary Button Text
                        </label>
                        <input
                          type="text"
                          value={contents['/']?.heroSecondaryBtnText || ''}
                          onChange={(e) => handleContentFieldChange('heroSecondaryBtnText', e.target.value)}
                          placeholder="Book Free Consultation"
                          className="w-full px-3 py-2 rounded-lg border border-[rgba(207,196,197,0.40)] text-xs font-medium focus:outline-none focus:border-black font-sans"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Services Header */}
                  <div className="pt-6 border-t border-[rgba(207,196,197,0.20)] space-y-4">
                    <h3 className="text-sm font-bold text-black flex items-center gap-2">
                      <span className="material-symbols-outlined text-blue-500 text-[18px]">terminal</span>
                      Services Showcase Section
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f5e5e] mb-1">
                          Category Badge
                        </label>
                        <input
                          type="text"
                          value={contents['/']?.servicesTag || ''}
                          onChange={(e) => handleContentFieldChange('servicesTag', e.target.value)}
                          placeholder="Our Expertise"
                          className="w-full px-3 py-2 rounded-lg border border-[rgba(207,196,197,0.40)] text-xs focus:outline-none focus:border-black font-sans"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f5e5e] mb-1">
                          Section Heading
                        </label>
                        <input
                          type="text"
                          value={contents['/']?.servicesHeading || ''}
                          onChange={(e) => handleContentFieldChange('servicesHeading', e.target.value)}
                          placeholder="Our Services"
                          className="w-full px-3 py-2 rounded-lg border border-[rgba(207,196,197,0.40)] text-xs font-bold focus:outline-none focus:border-black font-sans"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f5e5e] mb-1">
                        Section Subtitle
                      </label>
                      <textarea
                        rows={2}
                        value={contents['/']?.servicesSubheading || ''}
                        onChange={(e) => handleContentFieldChange('servicesSubheading', e.target.value)}
                        placeholder="We deliver high-impact technological interventions designed for the modern enterprise landscape."
                        className="w-full px-3 py-2 rounded-lg border border-[rgba(207,196,197,0.40)] text-xs leading-relaxed focus:outline-none focus:border-black font-sans"
                      />
                    </div>
                  </div>

                  {/* Section 3: Advantage Header */}
                  <div className="pt-6 border-t border-[rgba(207,196,197,0.20)] space-y-4">
                    <h3 className="text-sm font-bold text-black flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-500 text-[18px]">verified</span>
                      Advantage / Why Choose Us
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f5e5e] mb-1">
                          Badge Tag
                        </label>
                        <input
                          type="text"
                          value={contents['/']?.advantageTag || ''}
                          onChange={(e) => handleContentFieldChange('advantageTag', e.target.value)}
                          placeholder="The Advantage"
                          className="w-full px-3 py-2 rounded-lg border border-[rgba(207,196,197,0.40)] text-xs focus:outline-none focus:border-black font-sans"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f5e5e] mb-1">
                          Heading
                        </label>
                        <input
                          type="text"
                          value={contents['/']?.advantageHeading || ''}
                          onChange={(e) => handleContentFieldChange('advantageHeading', e.target.value)}
                          placeholder="Engineered for Excellence"
                          className="w-full px-3 py-2 rounded-lg border border-[rgba(207,196,197,0.40)] text-xs font-bold focus:outline-none focus:border-black font-sans"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f5e5e] mb-1">
                        Subtitle
                      </label>
                      <textarea
                        rows={2}
                        value={contents['/']?.advantageSubheading || ''}
                        onChange={(e) => handleContentFieldChange('advantageSubheading', e.target.value)}
                        placeholder="We combine strategic expertise with technical precision to deliver solutions that drive measurable business impact and sustainable growth."
                        className="w-full px-3 py-2 rounded-lg border border-[rgba(207,196,197,0.40)] text-xs leading-relaxed focus:outline-none focus:border-black font-sans"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── ABOUT PAGE FIELDS ── */}
              {selectedContentPath === '/about' && (
                <div className="bg-white rounded-xl border border-[rgba(207,196,197,0.25)] p-6 shadow-sm space-y-6">
                  <div className="pb-4 border-b border-[rgba(207,196,197,0.20)]">
                    <h2 className="text-base font-bold text-black flex items-center gap-2">
                      <span className="material-symbols-outlined text-purple-500 text-[20px]">auto_stories</span>
                      About Us — Narrative & Statements
                    </h2>
                    <p className="text-xs text-[#5f5e5e] mt-0.5">
                      Configure your brand story, mission, vision, and metric achievements.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f5e5e] mb-1">
                        Hero Pill Badge
                      </label>
                      <input
                        type="text"
                        value={contents['/about']?.heroBadge || ''}
                        onChange={(e) => handleContentFieldChange('heroBadge', e.target.value)}
                        placeholder="Engineered for Excellence"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[rgba(207,196,197,0.40)] text-sm focus:outline-none focus:border-black font-sans"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f5e5e] mb-1">
                          Title Prefix
                        </label>
                        <input
                          type="text"
                          value={contents['/about']?.heroTitle || ''}
                          onChange={(e) => handleContentFieldChange('heroTitle', e.target.value)}
                          placeholder="Innovating at the speed of"
                          className="w-full px-3.5 py-2.5 rounded-lg border border-[rgba(207,196,197,0.40)] text-sm font-bold focus:outline-none focus:border-black font-sans"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f5e5e] mb-1">
                          Green Accent Word
                        </label>
                        <input
                          type="text"
                          value={contents['/about']?.heroTitleAccent || ''}
                          onChange={(e) => handleContentFieldChange('heroTitleAccent', e.target.value)}
                          placeholder="thought."
                          className="w-full px-3.5 py-2.5 rounded-lg border border-[rgba(207,196,197,0.40)] text-sm font-bold text-emerald-600 focus:outline-none focus:border-black font-sans"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f5e5e] mb-1">
                        Main Brand Narrative
                      </label>
                      <textarea
                        rows={3}
                        value={contents['/about']?.heroDescription || ''}
                        onChange={(e) => handleContentFieldChange('heroDescription', e.target.value)}
                        placeholder="Laimsoft is a boutique software engineering firm dedicated to high-performance solutions..."
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[rgba(207,196,197,0.40)] text-sm leading-relaxed focus:outline-none focus:border-black font-sans"
                      />
                    </div>

                    {/* Mission & Vision */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[rgba(207,196,197,0.20)]">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-black uppercase tracking-wider">
                          Our Mission Statement
                        </label>
                        <textarea
                          rows={4}
                          value={contents['/about']?.missionDescription || ''}
                          onChange={(e) => handleContentFieldChange('missionDescription', e.target.value)}
                          placeholder="To empower forward-thinking enterprises..."
                          className="w-full px-3 py-2 rounded-lg border border-[rgba(207,196,197,0.40)] text-xs leading-relaxed focus:outline-none focus:border-black font-sans"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-black uppercase tracking-wider">
                          Our Vision Statement
                        </label>
                        <textarea
                          rows={4}
                          value={contents['/about']?.visionDescription || ''}
                          onChange={(e) => handleContentFieldChange('visionDescription', e.target.value)}
                          placeholder="A future where technology is invisible..."
                          className="w-full px-3 py-2 rounded-lg border border-[rgba(207,196,197,0.40)] text-xs leading-relaxed focus:outline-none focus:border-black font-sans"
                        />
                      </div>
                    </div>

                    {/* Bento Stats */}
                    <div className="pt-4 border-t border-[rgba(207,196,197,0.20)] space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-black">
                        Key Metric Bento Cards
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                          <label className="block text-[11px] font-bold text-slate-700">Metric 1</label>
                          <input
                            type="text"
                            value={contents['/about']?.stat1Value || ''}
                            onChange={(e) => handleContentFieldChange('stat1Value', e.target.value)}
                            placeholder="120+"
                            className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-sm font-bold text-emerald-600 focus:outline-none bg-white font-mono"
                          />
                          <input
                            type="text"
                            value={contents['/about']?.stat1Title || ''}
                            onChange={(e) => handleContentFieldChange('stat1Title', e.target.value)}
                            placeholder="Systems Deployed"
                            className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-xs font-semibold focus:outline-none bg-white font-sans"
                          />
                          <input
                            type="text"
                            value={contents['/about']?.stat1Desc || ''}
                            onChange={(e) => handleContentFieldChange('stat1Desc', e.target.value)}
                            placeholder="Global high-availability infrastructures."
                            className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-xs focus:outline-none bg-white font-sans"
                          />
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                          <label className="block text-[11px] font-bold text-slate-700">Metric 2</label>
                          <input
                            type="text"
                            value={contents['/about']?.stat2Value || ''}
                            onChange={(e) => handleContentFieldChange('stat2Value', e.target.value)}
                            placeholder="99.9%"
                            className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-sm font-bold text-slate-900 focus:outline-none bg-white font-mono"
                          />
                          <input
                            type="text"
                            value={contents['/about']?.stat2Title || ''}
                            onChange={(e) => handleContentFieldChange('stat2Title', e.target.value)}
                            placeholder="Engineering Precision"
                            className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-xs font-semibold focus:outline-none bg-white font-sans"
                          />
                          <input
                            type="text"
                            value={contents['/about']?.stat2Desc || ''}
                            onChange={(e) => handleContentFieldChange('stat2Desc', e.target.value)}
                            placeholder="Benchmark for uptime and code quality."
                            className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-xs focus:outline-none bg-white font-sans"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── SERVICES PAGE FIELDS ── */}
              {selectedContentPath === '/services' && (
                <div className="bg-white rounded-xl border border-[rgba(207,196,197,0.25)] p-6 shadow-sm space-y-6">
                  <div className="pb-4 border-b border-[rgba(207,196,197,0.20)]">
                    <h2 className="text-base font-bold text-black flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-500 text-[20px]">code_blocks</span>
                      Services Page Header & Call To Action
                    </h2>
                    <p className="text-xs text-[#5f5e5e] mt-0.5">
                      Configure the main headline and closing engagement banner on the services overview page.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f5e5e] mb-1">
                        Hero Badge
                      </label>
                      <input
                        type="text"
                        value={contents['/services']?.heroBadge || ''}
                        onChange={(e) => handleContentFieldChange('heroBadge', e.target.value)}
                        placeholder="Excellence in Engineering"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[rgba(207,196,197,0.40)] text-sm focus:outline-none focus:border-black font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f5e5e] mb-1">
                        Main Hero Title
                      </label>
                      <input
                        type="text"
                        value={contents['/services']?.heroHeading || ''}
                        onChange={(e) => handleContentFieldChange('heroHeading', e.target.value)}
                        placeholder="Architecting the future with precision code."
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[rgba(207,196,197,0.40)] text-sm font-bold focus:outline-none focus:border-black font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f5e5e] mb-1">
                        Hero Description
                      </label>
                      <textarea
                        rows={3}
                        value={contents['/services']?.heroDescription || ''}
                        onChange={(e) => handleContentFieldChange('heroDescription', e.target.value)}
                        placeholder="We combine high-performance developer tools with a minimalist philosophy to deliver premium software solutions..."
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[rgba(207,196,197,0.40)] text-sm leading-relaxed focus:outline-none focus:border-black font-sans"
                      />
                    </div>

                    {/* Bottom CTA Card */}
                    <div className="pt-6 border-t border-[rgba(207,196,197,0.20)] space-y-4">
                      <h3 className="text-sm font-bold text-black flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-500 text-[18px]">ads_click</span>
                        Bottom Project Call-to-Action Card
                      </h3>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f5e5e] mb-1">
                          CTA Heading
                        </label>
                        <input
                          type="text"
                          value={contents['/services']?.ctaHeading || ''}
                          onChange={(e) => handleContentFieldChange('ctaHeading', e.target.value)}
                          placeholder="Ready to engineer your next breakthrough?"
                          className="w-full px-3 py-2 rounded-lg border border-[rgba(207,196,197,0.40)] text-xs font-bold focus:outline-none focus:border-black font-sans"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f5e5e] mb-1">
                          CTA Description
                        </label>
                        <textarea
                          rows={2}
                          value={contents['/services']?.ctaDescription || ''}
                          onChange={(e) => handleContentFieldChange('ctaDescription', e.target.value)}
                          placeholder="Our team is currently accepting high-impact projects. Let's build something exceptional together."
                          className="w-full px-3 py-2 rounded-lg border border-[rgba(207,196,197,0.40)] text-xs leading-relaxed focus:outline-none focus:border-black font-sans"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f5e5e] mb-1">
                            CTA Button Text
                          </label>
                          <input
                            type="text"
                            value={contents['/services']?.ctaButtonText || ''}
                            onChange={(e) => handleContentFieldChange('ctaButtonText', e.target.value)}
                            placeholder="Start Your Project"
                            className="w-full px-3 py-2 rounded-lg border border-[rgba(207,196,197,0.40)] text-xs font-medium focus:outline-none focus:border-black font-sans"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f5e5e] mb-1">
                            CTA Button Link
                          </label>
                          <input
                            type="text"
                            value={contents['/services']?.ctaButtonLink || ''}
                            onChange={(e) => handleContentFieldChange('ctaButtonLink', e.target.value)}
                            placeholder="/contact"
                            className="w-full px-3 py-2 rounded-lg border border-[rgba(207,196,197,0.40)] text-xs font-mono focus:outline-none focus:border-black"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── CONTACT PAGE FIELDS ── */}
              {selectedContentPath === '/contact' && (
                <div className="bg-white rounded-xl border border-[rgba(207,196,197,0.25)] p-6 shadow-sm space-y-6">
                  <div className="pb-4 border-b border-[rgba(207,196,197,0.20)]">
                    <h2 className="text-base font-bold text-black flex items-center gap-2">
                      <span className="material-symbols-outlined text-blue-500 text-[20px]">contact_mail</span>
                      Contact Us Header Copy
                    </h2>
                    <p className="text-xs text-[#5f5e5e] mt-0.5">
                      The introductory headline and invitation greeting above the contact and consultation forms.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f5e5e] mb-1">
                        Pill Tag / Badge
                      </label>
                      <input
                        type="text"
                        value={contents['/contact']?.pillText || ''}
                        onChange={(e) => handleContentFieldChange('pillText', e.target.value)}
                        placeholder="GET IN TOUCH"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[rgba(207,196,197,0.40)] text-sm focus:outline-none focus:border-black font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f5e5e] mb-1">
                        Main Heading
                      </label>
                      <input
                        type="text"
                        value={contents['/contact']?.heading || ''}
                        onChange={(e) => handleContentFieldChange('heading', e.target.value)}
                        placeholder="Engineering excellence starts with a conversation."
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[rgba(207,196,197,0.40)] text-sm font-bold focus:outline-none focus:border-black font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f5e5e] mb-1">
                        Subtitle Description
                      </label>
                      <textarea
                        rows={3}
                        value={contents['/contact']?.subheading || ''}
                        onChange={(e) => handleContentFieldChange('subheading', e.target.value)}
                        placeholder="Reach out to our technical team for custom software solutions, system architecture, or consulting."
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[rgba(207,196,197,0.40)] text-sm leading-relaxed focus:outline-none focus:border-black font-sans"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── SINGLE SERVICE PAGES FIELDS ── */}
              {selectedContentPath.startsWith('/services/') && selectedContentPath !== '/services' && (
                <div className="bg-white rounded-xl border border-[rgba(207,196,197,0.25)] p-6 shadow-sm space-y-6">
                  <div className="pb-4 border-b border-[rgba(207,196,197,0.20)]">
                    <h2 className="text-base font-bold text-black flex items-center gap-2">
                      <span className="material-symbols-outlined text-indigo-500 text-[20px]">terminal</span>
                      {SINGLE_SERVICE_ROUTES.find((s) => s.path === selectedContentPath)?.label || 'Single Service'} — Live Page Content
                    </h2>
                    <p className="text-xs text-[#5f5e5e] mt-0.5">
                      Configure the hero narrative, capabilities section, feature cards, and bottom consultation CTA for <code className="font-mono text-black font-semibold">{selectedContentPath}</code>.
                    </p>
                  </div>

                  {/* Section 1: Hero Header */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-black flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-500 text-[18px]">rocket_launch</span>
                      Hero Section
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f5e5e] mb-1">
                          Pill Badge
                        </label>
                        <input
                          type="text"
                          value={contents[selectedContentPath]?.badge || ''}
                          onChange={(e) => handleContentFieldChange('badge', e.target.value)}
                          placeholder="Core Engineering Service"
                          className="w-full px-3.5 py-2.5 rounded-lg border border-[rgba(207,196,197,0.40)] text-sm focus:outline-none focus:border-black font-sans"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f5e5e] mb-1">
                          Service Title
                        </label>
                        <input
                          type="text"
                          value={contents[selectedContentPath]?.title || ''}
                          onChange={(e) => handleContentFieldChange('title', e.target.value)}
                          placeholder="AI Solutions & Machine Learning"
                          className="w-full px-3.5 py-2.5 rounded-lg border border-[rgba(207,196,197,0.40)] text-sm font-bold focus:outline-none focus:border-black font-sans"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f5e5e] mb-1">
                        Hero Description Paragraph
                      </label>
                      <textarea
                        rows={3}
                        value={contents[selectedContentPath]?.heroDesc || ''}
                        onChange={(e) => handleContentFieldChange('heroDesc', e.target.value)}
                        placeholder="Precision-engineered intelligence systems designed to scale with your ambition..."
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[rgba(207,196,197,0.40)] text-sm leading-relaxed focus:outline-none focus:border-black font-sans"
                      />
                    </div>
                  </div>

                  {/* Section 2: Capabilities Header */}
                  <div className="pt-6 border-t border-[rgba(207,196,197,0.20)] space-y-4">
                    <h3 className="text-sm font-bold text-black flex items-center gap-2">
                      <span className="material-symbols-outlined text-blue-500 text-[18px]">verified</span>
                      Capabilities Header
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f5e5e] mb-1">
                          Section Tag
                        </label>
                        <input
                          type="text"
                          value={contents[selectedContentPath]?.capabilitiesTag || ''}
                          onChange={(e) => handleContentFieldChange('capabilitiesTag', e.target.value)}
                          placeholder="01 // CAPABILITIES"
                          className="w-full px-3 py-2 rounded-lg border border-[rgba(207,196,197,0.40)] text-xs font-mono focus:outline-none focus:border-black"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f5e5e] mb-1">
                          Section Heading
                        </label>
                        <input
                          type="text"
                          value={contents[selectedContentPath]?.capabilitiesTitle || ''}
                          onChange={(e) => handleContentFieldChange('capabilitiesTitle', e.target.value)}
                          placeholder="Unmatched Technical Depth"
                          className="w-full px-3 py-2 rounded-lg border border-[rgba(207,196,197,0.40)] text-xs font-bold focus:outline-none focus:border-black font-sans"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f5e5e] mb-1">
                        Capabilities Description
                      </label>
                      <textarea
                        rows={2}
                        value={contents[selectedContentPath]?.capabilitiesDesc || ''}
                        onChange={(e) => handleContentFieldChange('capabilitiesDesc', e.target.value)}
                        placeholder="Our implementations aren't just wrappers. We build the infrastructure that powers decisions."
                        className="w-full px-3 py-2 rounded-lg border border-[rgba(207,196,197,0.40)] text-xs leading-relaxed focus:outline-none focus:border-black font-sans"
                      />
                    </div>
                  </div>

                  {/* Section 3: Feature Cards 1-4 */}
                  <div className="pt-6 border-t border-[rgba(207,196,197,0.20)] space-y-4">
                    <h3 className="text-sm font-bold text-black flex items-center gap-2">
                      <span className="material-symbols-outlined text-purple-500 text-[18px]">view_module</span>
                      4 Feature & Capability Cards
                    </h3>

                    {/* Cards 1 & 2 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Card 1 */}
                      <div className="p-3.5 rounded-lg border border-[rgba(207,196,197,0.30)] bg-slate-50/60 space-y-2">
                        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                          Card 1
                        </span>
                        <div>
                          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#5f5e5e] mb-1">
                            Title
                          </label>
                          <input
                            type="text"
                            value={contents[selectedContentPath]?.card1Title || ''}
                            onChange={(e) => handleContentFieldChange('card1Title', e.target.value)}
                            placeholder="Card 1 Title"
                            className="w-full px-2.5 py-1.5 rounded border border-[rgba(207,196,197,0.40)] text-xs font-semibold bg-white focus:outline-none focus:border-black"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#5f5e5e] mb-1">
                            Description
                          </label>
                          <textarea
                            rows={2}
                            value={contents[selectedContentPath]?.card1Desc || ''}
                            onChange={(e) => handleContentFieldChange('card1Desc', e.target.value)}
                            placeholder="Card 1 Description"
                            className="w-full px-2.5 py-1.5 rounded border border-[rgba(207,196,197,0.40)] text-xs bg-white leading-relaxed focus:outline-none focus:border-black"
                          />
                        </div>
                      </div>

                      {/* Card 2 */}
                      <div className="p-3.5 rounded-lg border border-[rgba(207,196,197,0.30)] bg-slate-50/60 space-y-2">
                        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                          Card 2
                        </span>
                        <div>
                          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#5f5e5e] mb-1">
                            Title
                          </label>
                          <input
                            type="text"
                            value={contents[selectedContentPath]?.card2Title || ''}
                            onChange={(e) => handleContentFieldChange('card2Title', e.target.value)}
                            placeholder="Card 2 Title"
                            className="w-full px-2.5 py-1.5 rounded border border-[rgba(207,196,197,0.40)] text-xs font-semibold bg-white focus:outline-none focus:border-black"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#5f5e5e] mb-1">
                            Description
                          </label>
                          <textarea
                            rows={2}
                            value={contents[selectedContentPath]?.card2Desc || ''}
                            onChange={(e) => handleContentFieldChange('card2Desc', e.target.value)}
                            placeholder="Card 2 Description"
                            className="w-full px-2.5 py-1.5 rounded border border-[rgba(207,196,197,0.40)] text-xs bg-white leading-relaxed focus:outline-none focus:border-black"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Cards 3 & 4 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Card 3 */}
                      <div className="p-3.5 rounded-lg border border-[rgba(207,196,197,0.30)] bg-slate-50/60 space-y-2">
                        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                          Card 3
                        </span>
                        <div>
                          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#5f5e5e] mb-1">
                            Title
                          </label>
                          <input
                            type="text"
                            value={contents[selectedContentPath]?.card3Title || ''}
                            onChange={(e) => handleContentFieldChange('card3Title', e.target.value)}
                            placeholder="Card 3 Title"
                            className="w-full px-2.5 py-1.5 rounded border border-[rgba(207,196,197,0.40)] text-xs font-semibold bg-white focus:outline-none focus:border-black"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#5f5e5e] mb-1">
                            Description
                          </label>
                          <textarea
                            rows={2}
                            value={contents[selectedContentPath]?.card3Desc || ''}
                            onChange={(e) => handleContentFieldChange('card3Desc', e.target.value)}
                            placeholder="Card 3 Description"
                            className="w-full px-2.5 py-1.5 rounded border border-[rgba(207,196,197,0.40)] text-xs bg-white leading-relaxed focus:outline-none focus:border-black"
                          />
                        </div>
                      </div>

                      {/* Card 4 */}
                      <div className="p-3.5 rounded-lg border border-[rgba(207,196,197,0.30)] bg-slate-50/60 space-y-2">
                        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                          Card 4
                        </span>
                        <div>
                          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#5f5e5e] mb-1">
                            Title
                          </label>
                          <input
                            type="text"
                            value={contents[selectedContentPath]?.card4Title || ''}
                            onChange={(e) => handleContentFieldChange('card4Title', e.target.value)}
                            placeholder="Card 4 Title"
                            className="w-full px-2.5 py-1.5 rounded border border-[rgba(207,196,197,0.40)] text-xs font-semibold bg-white focus:outline-none focus:border-black"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#5f5e5e] mb-1">
                            Description
                          </label>
                          <textarea
                            rows={2}
                            value={contents[selectedContentPath]?.card4Desc || ''}
                            onChange={(e) => handleContentFieldChange('card4Desc', e.target.value)}
                            placeholder="Card 4 Description"
                            className="w-full px-2.5 py-1.5 rounded border border-[rgba(207,196,197,0.40)] text-xs bg-white leading-relaxed focus:outline-none focus:border-black"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Bottom CTA */}
                  <div className="pt-6 border-t border-[rgba(207,196,197,0.20)] space-y-4">
                    <h3 className="text-sm font-bold text-black flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-500 text-[18px]">call</span>
                      Bottom Consultation Banner & CTA
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f5e5e] mb-1">
                          CTA Heading
                        </label>
                        <input
                          type="text"
                          value={contents[selectedContentPath]?.ctaTitle || ''}
                          onChange={(e) => handleContentFieldChange('ctaTitle', e.target.value)}
                          placeholder="Ready to Build the Future?"
                          className="w-full px-3 py-2 rounded-lg border border-[rgba(207,196,197,0.40)] text-xs font-bold focus:outline-none focus:border-black font-sans"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f5e5e] mb-1">
                          Button Text (Triggers Modal)
                        </label>
                        <input
                          type="text"
                          value={contents[selectedContentPath]?.ctaBtnText || ''}
                          onChange={(e) => handleContentFieldChange('ctaBtnText', e.target.value)}
                          placeholder="Book Free Consultation"
                          className="w-full px-3 py-2 rounded-lg border border-[rgba(207,196,197,0.40)] text-xs font-medium focus:outline-none focus:border-black font-sans"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f5e5e] mb-1">
                        CTA Subtitle Description
                      </label>
                      <textarea
                        rows={2}
                        value={contents[selectedContentPath]?.ctaDesc || ''}
                        onChange={(e) => handleContentFieldChange('ctaDesc', e.target.value)}
                        placeholder="Let's discuss how our solutions can integrate into your current ecosystem..."
                        className="w-full px-3 py-2 rounded-lg border border-[rgba(207,196,197,0.40)] text-xs leading-relaxed focus:outline-none focus:border-black font-sans"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Live Real-Time Preview & Cloudflare Edge Status */}
            <div className="lg:col-span-5 space-y-6">
              {/* Cloudflare Edge Cache Invalidation Status Card */}
              <div className="p-4 rounded-xl bg-[#030712] text-white border border-slate-800 shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
                      Cloudflare Edge Sync Active
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">0ms DB Overhead</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Saved text is stored in D1 and immediately pushes a cache invalidation (<code className="text-emerald-400 bg-white/5 px-1 py-0.5 rounded font-mono">revalidatePath</code>). Visitors load static HTML directly from Cloudflare&apos;s global CDN edge in single-digit milliseconds.
                </p>
              </div>

              {/* Real-time Hero Card Preview */}
              <div className="bg-[#0b0f17] rounded-xl border border-white/10 p-6 text-white shadow-xl relative overflow-hidden space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 font-mono">
                    Live UI Preview ({selectedContentPath})
                  </span>
                  <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/70 font-mono">
                    Instant Preview
                  </span>
                </div>

                {/* Badge preview */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] font-bold tracking-widest uppercase">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                  {selectedContentPath === '/' && (contents['/']?.heroBadge || 'The Future of Software Engineering')}
                  {selectedContentPath === '/about' && (contents['/about']?.heroBadge || 'Engineered for Excellence')}
                  {selectedContentPath === '/services' && (contents['/services']?.heroBadge || 'Excellence in Engineering')}
                  {selectedContentPath === '/contact' && (contents['/contact']?.pillText || 'GET IN TOUCH')}
                  {selectedContentPath.startsWith('/services/') && selectedContentPath !== '/services' && (
                    contents[selectedContentPath]?.badge || 'Core Engineering Service'
                  )}
                </div>

                {/* Heading preview */}
                <h3 className="text-2xl font-black tracking-tight leading-tight">
                  {selectedContentPath === '/' && (
                    <>
                      {contents['/']?.heroHeading || 'Precision Built'}{' '}
                      <span className="text-emerald-400">{contents['/']?.heroHeadingAccent || 'Digital Assets.'}</span>
                    </>
                  )}
                  {selectedContentPath === '/about' && (
                    <>
                      {contents['/about']?.heroTitle || 'Innovating at the speed of'}{' '}
                      <span className="text-emerald-400">{contents['/about']?.heroTitleAccent || 'thought.'}</span>
                    </>
                  )}
                  {selectedContentPath === '/services' && (
                    <span>{contents['/services']?.heroHeading || 'Architecting the future with precision code.'}</span>
                  )}
                  {selectedContentPath === '/contact' && (
                    <span>{contents['/contact']?.heading || 'Engineering excellence starts with a conversation.'}</span>
                  )}
                  {selectedContentPath.startsWith('/services/') && selectedContentPath !== '/services' && (
                    <span>{contents[selectedContentPath]?.title || 'Service Title'}</span>
                  )}
                </h3>

                {/* Subtitle preview */}
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedContentPath === '/' && (contents['/']?.heroSubheading || 'We orchestrate high-performance digital ecosystems through elite engineering.')}
                  {selectedContentPath === '/about' && (contents['/about']?.heroDescription || 'Laimsoft is a boutique software engineering firm dedicated to high-performance solutions.')}
                  {selectedContentPath === '/services' && (contents['/services']?.heroDescription || 'We combine high-performance developer tools with a minimalist philosophy.')}
                  {selectedContentPath === '/contact' && (contents['/contact']?.subheading || 'Reach out to our technical team for custom software solutions.')}
                  {selectedContentPath.startsWith('/services/') && selectedContentPath !== '/services' && (
                    contents[selectedContentPath]?.heroDesc || 'High-performance engineering and custom software architectures.'
                  )}
                </p>

                {/* Single Service Capability Cards Snippet Preview */}
                {selectedContentPath.startsWith('/services/') && selectedContentPath !== '/services' && (
                  <div className="pt-2 border-t border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400">
                      <span>{contents[selectedContentPath]?.capabilitiesTag || '01 // CAPABILITIES'}</span>
                      <span className="text-slate-400">4 Cards Active</span>
                    </div>
                    <div className="text-xs font-bold text-white">
                      {contents[selectedContentPath]?.capabilitiesTitle || 'Capabilities'}
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="p-2 rounded bg-white/5 border border-white/10">
                        <p className="text-[11px] font-semibold text-white truncate">
                          {contents[selectedContentPath]?.card1Title || 'Card 1'}
                        </p>
                        <p className="text-[9px] text-slate-400 line-clamp-1 mt-0.5">
                          {contents[selectedContentPath]?.card1Desc || ''}
                        </p>
                      </div>
                      <div className="p-2 rounded bg-white/5 border border-white/10">
                        <p className="text-[11px] font-semibold text-white truncate">
                          {contents[selectedContentPath]?.card2Title || 'Card 2'}
                        </p>
                        <p className="text-[9px] text-slate-400 line-clamp-1 mt-0.5">
                          {contents[selectedContentPath]?.card2Desc || ''}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Buttons preview */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <div className="px-4 py-2 rounded-full bg-white text-black text-xs font-bold shadow-sm">
                    {selectedContentPath === '/' && (contents['/']?.heroPrimaryBtnText || 'Get Started')}
                    {selectedContentPath === '/about' && (contents['/about']?.heroPrimaryBtnText || 'Our Journey')}
                    {selectedContentPath === '/services' && (contents['/services']?.ctaButtonText || 'Start Your Project')}
                    {selectedContentPath === '/contact' && 'Send Message'}
                    {selectedContentPath.startsWith('/services/') && selectedContentPath !== '/services' && (
                      contents[selectedContentPath]?.ctaBtnText || 'Book Free Consultation'
                    )}
                  </div>
                  {selectedContentPath === '/' && (
                    <div className="px-4 py-2 rounded-full border border-white/30 text-white text-xs font-bold">
                      {contents['/']?.heroSecondaryBtnText || 'Book Free Consultation'}
                    </div>
                  )}
                  {selectedContentPath === '/about' && (
                    <div className="px-4 py-2 rounded-full border border-white/30 text-white text-xs font-bold">
                      {contents['/about']?.heroSecondaryBtnText || 'View Stack'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
           TAB 2: GLOBAL SITE SETTINGS & WEBMASTER VERIFICATIONS
      ════════════════════════════════════════════════════════════════ */}
      {activeTab === 'global' && (
        <div className="bg-white rounded-xl border border-[rgba(207,196,197,0.25)] p-6 shadow-sm space-y-6 max-w-4xl">
          <div className="flex items-center justify-between pb-4 border-b border-[rgba(207,196,197,0.20)]">
            <div>
              <h2 className="text-lg font-bold text-black">Global Search & Webmaster Verifications</h2>
              <p className="text-xs text-[#5f5e5e] mt-0.5">
                Connect Google Search Console, Bing Webmaster, analytics IDs, and fallback metadata.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSaveGlobal}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-black text-white hover:shadow-[0_0_15px_rgba(0,255,136,0.3)] hover:scale-[1.02] active:scale-95 transition-all text-[11px] font-semibold tracking-wider uppercase disabled:opacity-50"
              style={{ fontFamily: "'Space Grotesk', monospace" }}
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              {saving ? 'Saving...' : 'Save Global Settings'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1b1b1b] mb-1.5">
                Brand / Site Name
              </label>
              <input
                type="text"
                value={globalSettings.siteName || ''}
                onChange={(e) => handleGlobalFieldChange('siteName', e.target.value)}
                placeholder="Laimsoft"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#cfc4c5] text-sm text-black outline-none focus:border-black transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1b1b1b] mb-1.5">
                Title Suffix Template
              </label>
              <input
                type="text"
                value={globalSettings.titleTemplate || ''}
                onChange={(e) => handleGlobalFieldChange('titleTemplate', e.target.value)}
                placeholder="%s — Laimsoft"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#cfc4c5] text-sm text-black outline-none focus:border-black transition-colors font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1b1b1b] mb-1.5">
              Default Fallback Meta Description
            </label>
            <textarea
              rows={2}
              value={globalSettings.defaultDescription || ''}
              onChange={(e) => handleGlobalFieldChange('defaultDescription', e.target.value)}
              placeholder="Used whenever an explicit page description is not configured..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#cfc4c5] text-sm text-black outline-none focus:border-black transition-colors leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1b1b1b] mb-1.5">
              Default Social Card Image (Global Fallback OG Image)
            </label>
            <input
              type="text"
              value={globalSettings.defaultOgImage || ''}
              onChange={(e) => handleGlobalFieldChange('defaultOgImage', e.target.value)}
              placeholder="https://laimsoft.site/images/og-main.jpg"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#cfc4c5] text-xs text-black outline-none focus:border-black transition-colors font-mono"
            />
          </div>

          {/* Verification Codes Section */}
          <div className="pt-4 border-t border-[rgba(207,196,197,0.20)] space-y-4">
            <h3 className="text-sm font-bold text-black uppercase tracking-wider">
              Search Engine Ownership Verifications
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1b1b1b] mb-1.5">
                  Google Search Console Verification Token
                </label>
                <input
                  type="text"
                  value={globalSettings.googleVerification || ''}
                  onChange={(e) => handleGlobalFieldChange('googleVerification', e.target.value)}
                  placeholder="e.g. google-site-verification token or code"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#cfc4c5] text-xs text-black outline-none focus:border-black transition-colors font-mono"
                />
                <span className="text-[10px] text-[#5f5e5e] block mt-1">
                  Injects &lt;meta name=&quot;google-site-verification&quot; content=&quot;...&quot;&gt;
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1b1b1b] mb-1.5">
                  Bing Webmaster Verification Code
                </label>
                <input
                  type="text"
                  value={globalSettings.bingVerification || ''}
                  onChange={(e) => handleGlobalFieldChange('bingVerification', e.target.value)}
                  placeholder="e.g. msvalidate.01 token"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#cfc4c5] text-xs text-black outline-none focus:border-black transition-colors font-mono"
                />
                <span className="text-[10px] text-[#5f5e5e] block mt-1">
                  Injects &lt;meta name=&quot;msvalidate.01&quot; content=&quot;...&quot;&gt;
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1b1b1b] mb-1.5">
                Google Analytics 4 / Tag Manager (GA4 Measurement ID)
              </label>
              <input
                type="text"
                value={globalSettings.gaMeasurementId || ''}
                onChange={(e) => handleGlobalFieldChange('gaMeasurementId', e.target.value)}
                placeholder="G-XXXXXXXXXX"
                className="w-full max-w-md px-3.5 py-2.5 rounded-lg border border-[#cfc4c5] text-xs text-black outline-none focus:border-black transition-colors font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
           TAB 3: SITEMAP & ROBOTS.TXT
      ════════════════════════════════════════════════════════════════ */}
      {activeTab === 'sitemap' && (
        <div className="space-y-6 max-w-4xl">
          {/* Sitemap Bento */}
          <div className="bg-white rounded-xl border border-[rgba(207,196,197,0.25)] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(207,196,197,0.20)]">
              <div>
                <h2 className="text-lg font-bold text-black flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-emerald-600">check_circle</span>
                  Dynamic XML Sitemap Active
                </h2>
                <p className="text-xs text-[#5f5e5e] mt-0.5">
                  Automatically indexes all active static pages and every published blog post in real time.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  className="px-3 py-1.5 rounded-lg border border-[rgba(207,196,197,0.40)] text-xs font-semibold hover:border-black hover:text-black transition-colors"
                >
                  View XML ↗
                </a>
                <button
                  type="button"
                  onClick={handleCopySitemap}
                  className="px-3.5 py-1.5 rounded-lg bg-black text-white text-xs font-semibold tracking-wider uppercase transition-all"
                  style={{ fontFamily: "'Space Grotesk', monospace" }}
                >
                  {copiedSitemap ? '✓ Copied URL' : 'Copy Sitemap URL'}
                </button>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 font-mono text-xs flex items-center justify-between">
              <span className="text-slate-800">https://laimsoft.site/sitemap.xml</span>
              <span className="text-emerald-700 font-bold bg-emerald-100/60 px-2 py-0.5 rounded text-[10px]">
                Ready for Google Search Console
              </span>
            </div>
          </div>

          {/* Robots.txt Configuration */}
          <div className="bg-white rounded-xl border border-[rgba(207,196,197,0.25)] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(207,196,197,0.20)]">
              <div>
                <h2 className="text-lg font-bold text-black">Robots.txt Directive Rules</h2>
                <p className="text-xs text-[#5f5e5e] mt-0.5">
                  Controls how search engine spiders, Googlebot, and Bingbot crawl your domain.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="/robots.txt"
                  target="_blank"
                  className="px-3 py-1.5 rounded-lg border border-[rgba(207,196,197,0.40)] text-xs font-semibold hover:border-black hover:text-black transition-colors"
                >
                  View Live robots.txt ↗
                </a>
                <button
                  type="button"
                  onClick={handleSaveGlobal}
                  disabled={saving}
                  className="px-4 py-1.5 rounded-lg bg-black text-white text-xs font-semibold tracking-wider uppercase transition-all"
                  style={{ fontFamily: "'Space Grotesk', monospace" }}
                >
                  {saving ? 'Saving...' : 'Save Rules'}
                </button>
              </div>
            </div>

            <textarea
              rows={8}
              value={globalSettings.robotsTxtCustom || ''}
              onChange={(e) => handleGlobalFieldChange('robotsTxtCustom', e.target.value)}
              placeholder="User-agent: *&#10;Allow: /&#10;Disallow: /admin/&#10;&#10;Sitemap: https://laimsoft.site/sitemap.xml"
              className="w-full px-4 py-3 rounded-lg border border-[#cfc4c5] font-mono text-xs text-black outline-none focus:border-black leading-relaxed"
            />
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
           TAB 4: STRUCTURED DATA (JSON-LD SCHEMA)
      ════════════════════════════════════════════════════════════════ */}
      {activeTab === 'schema' && (
        <div className="bg-white rounded-xl border border-[rgba(207,196,197,0.25)] p-6 shadow-sm space-y-6 max-w-4xl">
          <div className="flex items-center justify-between pb-4 border-b border-[rgba(207,196,197,0.20)]">
            <div>
              <h2 className="text-lg font-bold text-black">Organization Schema (JSON-LD)</h2>
              <p className="text-xs text-[#5f5e5e] mt-0.5">
                Generates Google&apos;s Knowledge Graph card with official organization details and verified social links.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSaveGlobal}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-black text-white hover:shadow-[0_0_15px_rgba(0,255,136,0.3)] hover:scale-[1.02] active:scale-95 transition-all text-[11px] font-semibold tracking-wider uppercase disabled:opacity-50"
              style={{ fontFamily: "'Space Grotesk', monospace" }}
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              {saving ? 'Saving...' : 'Save Schema'}
            </button>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1b1b1b] mb-1.5">
              Structured Data Payload (Schema.org JSON-LD)
            </label>
            <textarea
              rows={14}
              value={globalSettings.organizationSchema || ''}
              onChange={(e) => handleGlobalFieldChange('organizationSchema', e.target.value)}
              placeholder="Paste JSON-LD Schema..."
              className="w-full px-4 py-3 rounded-lg border border-[#cfc4c5] font-mono text-xs text-black outline-none focus:border-black leading-relaxed"
            />
            <span className="text-[11px] text-[#5f5e5e] block mt-1.5">
              Validated against Schema.org standards. Injected automatically into the &lt;head&gt; of your website.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
