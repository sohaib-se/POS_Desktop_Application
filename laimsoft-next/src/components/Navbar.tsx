'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { label: 'Home', icon: 'home', href: '/' },
  { label: 'Services', icon: 'widgets', href: '/services' },
  { label: 'Blog', icon: 'article', href: '/blog' },
  { label: 'About', icon: 'badge', href: '/about' },
  { label: 'Contact', icon: 'mail', href: '/contact' },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const openConsultation = () => {
    window.dispatchEvent(new CustomEvent('open-consultation-modal'));
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="header-modern-divider fixed top-0 z-50 w-full bg-white backdrop-blur-xl shadow-sm shadow-slate-900/5 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center gap-4">
            {/* Logo */}
            <div className="flex items-center">
              <Link className="flex items-center gap-2 group" href="/">
                <img
                  src="/images/logo.jpg"
                  alt="Laimsoft Logo"
                  className="h-10 w-auto rounded transition-transform duration-300 group-hover:scale-105"
                />
              </Link>
            </div>

            {/* Desktop Navigation Pill Shell */}
            <div className="hidden md:flex flex-1 justify-center items-center">
              <div className="menu-shell flex items-center gap-1.5 p-1.5 rounded-full">
                {NAV_LINKS.map((data) => {
                  const isActive =
                    data.href === '/'
                      ? pathname === '/'
                      : pathname === data.href || pathname.startsWith(data.href + '/');

                  return (
                    <Link
                      key={data.href}
                      href={data.href}
                      className={`nav-link text-sm font-semibold ${
                        isActive
                          ? 'active-nav bg-black text-white'
                          : 'text-slate-600 hover:text-black hover:bg-black/5'
                      }`}
                    >
                      <span className="material-symbols-outlined nav-link-icon">{data.icon}</span>
                      <span className="nav-link-label">{data.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Desktop Consultation Button */}
            <div className="hidden md:flex items-center gap-4">
              <button
                id="nav-book-consultation-btn"
                type="button"
                onClick={openConsultation}
                className="group px-6 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white bg-black hover:bg-zinc-800 hover:-translate-y-0.5 hover:scale-105 hover:shadow-lg hover:shadow-black/20 transition-all duration-300"
              >
                Book Free Consultation
              </button>
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              id="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-10 h-10 rounded-lg border border-slate-200 bg-white/60 text-slate-700 flex items-center justify-center hover:border-black hover:text-black transition-colors"
              type="button"
              aria-label="Toggle Navigation"
            >
              <span className="material-symbols-outlined" id="mobile-menu-icon">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 overflow-hidden shadow-lg" id="mobileNav">
            <div className="flex flex-col p-6 gap-2">
              {NAV_LINKS.map((data) => {
                const isActive =
                  data.href === '/'
                    ? pathname === '/'
                    : pathname === data.href || pathname.startsWith(data.href + '/');

                return (
                  <Link
                    key={data.href}
                    href={data.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      isActive
                        ? 'bg-slate-50 text-black font-bold'
                        : 'text-slate-600 font-medium hover:bg-slate-50 hover:text-black'
                    }`}
                  >
                    <span className="material-symbols-outlined text-xl">{data.icon}</span>
                    {data.label}
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={openConsultation}
                className="mt-4 bg-black text-white px-6 py-4 rounded-xl font-bold text-center shadow-lg hover:bg-zinc-800 transition-colors"
              >
                Book Free Consultation
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* 80px Spacer for fixed header */}
      <div className="h-20" />
    </>
  );
}
