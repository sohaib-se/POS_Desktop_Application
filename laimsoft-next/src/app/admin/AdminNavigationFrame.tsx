'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface AdminNavItem {
  name: string;
  href: string;
  icon: string;
}

const NAV_ITEMS: AdminNavItem[] = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: 'dashboard' },
  { name: 'Consultations', href: '/admin/consultations', icon: 'event_note' },
  { name: 'Messages', href: '/admin/messages', icon: 'mail' },
  { name: 'Newsletter', href: '/admin/newsletter', icon: 'subscriptions' },
  { name: 'Blogs', href: '/admin/posts', icon: 'article' },
  { name: 'Categories', href: '/admin/categories', icon: 'category' },
  { name: 'Certifications', href: '/admin/certifications', icon: 'verified' },
  { name: 'POS Credentials', href: '/admin/pos-credentials', icon: 'key' },
  { name: 'SEO Manager', href: '/admin/seo', icon: 'travel_explore' },
  { name: 'Settings', href: '/admin/settings', icon: 'settings' },
];

export default function AdminNavigationFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [adminUsername, setAdminUsername] = useState<string>('Admin');

  useEffect(() => {
    if (pathname === '/admin/login') return;

    // Fetch unread count for topbar
    const fetchUnread = async () => {
      try {
        const res = await fetch('/api/admin/messages');
        if (res.ok) {
          const data = await res.json();
          const unread = Array.isArray(data) ? data.filter((m: any) => !m.isRead).length : 0;
          setUnreadCount(unread);
        }
      } catch {
        // graceful ignore
      }
    };

    fetchUnread();

    // Poll every 60 seconds without triggering network overhead on every sidebar tab switch
    const interval = setInterval(fetchUnread, 60000);
    return () => clearInterval(interval);
  }, [pathname === '/admin/messages']);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1b1b1b] flex flex-col font-sans">
      {/* Mobile Sidebar Toggle Button */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open sidebar"
        title="Open sidebar"
        className="md:hidden fixed left-3 top-3 z-50 w-11 h-11 flex items-center justify-center bg-white rounded-lg shadow-md border border-[rgba(207,196,197,0.25)] text-[#1b1b1b]"
      >
        <span className="material-symbols-outlined text-2xl">menu</span>
      </button>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 bg-black/45 z-50 transition-opacity"
        />
      )}

      {/* ══════════════════════════════════════════════
           ADMIN SIDEBAR (Exact 1:1 PHP admin_sidebar.php)
      ══════════════════════════════════════════════ */}
      <aside
        className={`fixed left-0 top-0 z-50 md:z-40 w-64 h-screen bg-white border-r border-[rgba(207,196,197,0.2)] shadow-[4px_0_24px_rgba(0,0,0,0.04)] flex flex-col p-4 overflow-y-auto transition-transform duration-300 ease-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3 p-2 pb-8">
          <div className="w-10 h-10 bg-black rounded-[10px] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px] text-white">terminal</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[20px] font-black tracking-[-0.03em] text-black leading-tight">
              Laimsoft Admin
            </span>
            <span className="font-mono text-[9px] font-semibold tracking-[0.18em] uppercase text-[#5f5e5e] mt-0.5">
              Technical Command
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1 mt-4 grow">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all duration-150 ${
                  isActive
                    ? 'bg-black text-white shadow-[0_0_15px_rgba(0,255,136,0.3)]'
                    : 'text-[#5f5e5e] hover:bg-[#e8e8e8] hover:text-black hover:scale-[1.02]'
                }`}
                style={{ fontFamily: "'Space Grotesk', monospace" }}
              >
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={
                    isActive
                      ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }
                      : undefined
                  }
                >
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="mt-auto pt-4 border-t border-[rgba(207,196,197,0.15)] flex flex-col gap-1">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wider uppercase text-[#5f5e5e] hover:bg-[#e8e8e8] hover:text-black transition-colors"
            style={{ fontFamily: "'Space Grotesk', monospace" }}
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[20px]">open_in_new</span>
              <span>Live Site</span>
            </div>
            <span className="text-[10px] bg-[#e8e8e8] px-1.5 py-0.5 rounded text-[#5f5e5e]">↗</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wider uppercase text-[#5f5e5e] hover:bg-[#fff1f2] hover:text-[#be123c] hover:scale-[1.02] transition-all text-left w-full cursor-pointer"
            style={{ fontFamily: "'Space Grotesk', monospace" }}
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════
           MAIN CONTENT AREA WITH STICKY TOPBAR
      ══════════════════════════════════════════════ */}
      <div className="md:ml-64 flex-1 flex flex-col min-w-0 bg-[#f9f9f9]">
        {/* TOP BAR (Exact 1:1 PHP admin topbar) */}
        <header className="sticky top-0 z-30 flex justify-between items-center px-6 py-2.5 w-full bg-[rgba(249,249,249,0.80)] backdrop-blur-xl border-b border-[rgba(207,196,197,0.30)] shadow-sm">
          <div className="flex items-center gap-4 grow"></div>

          {/* Right side controls */}
          <div className="flex items-center gap-4">
            <Link
              href="/admin/messages"
              className="p-2 text-[#5f5e5e] hover:text-black transition-colors relative"
              title="Messages & Notifications"
            >
              <span className="material-symbols-outlined text-[22px] block">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 inline-flex items-center justify-center rounded-full bg-[#d92b2b] text-white text-[11px] font-bold">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>

            <Link
              href="/admin/settings"
              className="p-2 text-[#5f5e5e] hover:text-black transition-colors"
              title="Admin Settings"
            >
              <span className="material-symbols-outlined text-[22px] block">settings</span>
            </Link>

            <div className="h-6 w-px bg-[rgba(207,196,197,0.4)] mx-1"></div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p
                  className="text-[10px] font-semibold tracking-wider uppercase text-black"
                  style={{ fontFamily: "'Space Grotesk', monospace" }}
                >
                  Admin Access
                </p>
                <p className="text-[12px] text-[#5f5e5e] font-sans">{adminUsername}</p>
              </div>

              {/* Avatar initials fallback */}
              <div className="w-9 h-9 rounded-full bg-[#e8e8e8] border border-[#cfc4c5] flex items-center justify-center font-bold text-xs text-black">
                {adminUsername.substring(0, 2).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-6 md:p-10 max-w-[1280px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export { AdminNavigationFrame };
