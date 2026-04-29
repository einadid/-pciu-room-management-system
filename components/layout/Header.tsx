'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try { setUser(JSON.parse(userData)); }
      catch { setUser(null); }
    }
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // close menu on route change
  useEffect(() => { setMobileMenuOpen(false); }, [pathname]);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    window.location.href = '/login';
  };

  const navItems = [
    { href: '/',           label: 'Home',    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
      </svg>
    )},
    { href: '/routine',    label: 'Routine', icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
      </svg>
    )},
    { href: '/check-room', label: 'Rooms',   icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>
    )},
    { href: '/contact',    label: 'Contact', icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
      </svg>
    )},
    { href: '/updates', label: 'Updates', icon: '📢' },
  ];

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      <header className={`bg-white sticky top-0 z-50 transition-all duration-300
        ${scrolled
          ? 'shadow-md border-b border-slate-200'
          : 'border-b border-slate-100 shadow-sm'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">

            {/* ── Logo ── */}
            <Link href="/"
              className="flex items-center gap-3 group shrink-0">
              <div className="relative w-9 h-11 transition-transform
                group-hover:scale-105 duration-200">
                <Image src="/pciu.png" alt="PCIU" fill
                  className="object-contain" priority />
              </div>
              <div className="hidden sm:block leading-tight">
                <p className="font-extrabold text-slate-900 text-sm tracking-tight
                  group-hover:text-blue-700 transition-colors">
                  PCIU
                </p>
                <p className="text-[10px] text-slate-400 font-medium tracking-wide">
                  Room Management
                </p>
              </div>
            </Link>

            {/* ── Desktop Nav ── */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link key={item.href} href={item.href}
                    className={`relative flex items-center gap-1.5 px-4 py-2
                      rounded-lg text-sm font-semibold transition-all duration-200
                      ${active
                        ? 'text-blue-700 bg-blue-50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}>
                    <span className={active ? 'text-blue-600' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    {item.label}
                    {/* active dot */}
                    {active && (
                      <span className="absolute -bottom-px left-4 right-4 h-0.5
                        bg-blue-600 rounded-full" />
                    )}
                  </Link>
                );
              })}

              {/* divider */}
              <div className="w-px h-5 bg-slate-200 mx-2" />

              {user ? (
                <div className="flex items-center gap-2">
                  <Link href={user.role === 'cr' ? '/cr' : '/admin'}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg
                      text-sm font-semibold bg-emerald-600 hover:bg-emerald-700
                      text-white transition-colors shadow-sm">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    Dashboard
                  </Link>
                  <button onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg
                      text-sm font-semibold text-slate-500 hover:text-red-600
                      hover:bg-red-50 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                    </svg>
                    Logout
                  </button>
                </div>
              ) : (
                <Link href="/login"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg
                    text-sm font-semibold bg-blue-600 hover:bg-blue-700
                    text-white transition-colors shadow-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
                  </svg>
                  Login
                </Link>
              )}
            </nav>

            {/* ── Mobile: right side ── */}
            <div className="flex md:hidden items-center gap-2">
              {user && (
                <Link href={user.role === 'cr' ? '/cr' : '/admin'}
                  className="flex items-center justify-center w-9 h-9 rounded-lg
                    bg-emerald-100 text-emerald-700 hover:bg-emerald-200
                    transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </Link>
              )}

              {/* Hamburger */}
              <button
                onClick={() => setMobileMenuOpen((v) => !v)}
                className="flex flex-col items-center justify-center w-9 h-9
                  rounded-lg hover:bg-slate-100 transition-colors gap-1.5 p-2"
                aria-label="Toggle menu">
                <span className={`block h-0.5 w-5 bg-slate-700 rounded-full
                  transition-all duration-300
                  ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                <span className={`block h-0.5 w-5 bg-slate-700 rounded-full
                  transition-all duration-300
                  ${mobileMenuOpen ? 'opacity-0 scale-x-0' : ''}`} />
                <span className={`block h-0.5 w-5 bg-slate-700 rounded-full
                  transition-all duration-300
                  ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile Menu Overlay ── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}>
          {/* backdrop */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

          {/* drawer */}
          <div className="absolute top-16 left-0 right-0 bg-white
            border-b border-slate-200 shadow-xl"
            onClick={(e) => e.stopPropagation()}>

            {/* user info bar */}
            {user && (
              <div className="flex items-center gap-3 px-4 py-3
                bg-slate-50 border-b border-slate-100">
                <div className="w-9 h-9 rounded-full bg-emerald-100
                  flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-emerald-700" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">
                    {user.name ?? user.email ?? 'User'}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium uppercase
                    tracking-wide">
                    {user.role === 'cr' ? 'Class Representative' : 'Administrator'}
                  </p>
                </div>
              </div>
            )}

            {/* nav links */}
            <div className="px-3 py-3 space-y-0.5">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link key={item.href} href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl
                      text-sm font-semibold transition-colors
                      ${active
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-700 hover:bg-slate-50'
                      }`}>
                    <span className={active ? 'text-blue-600' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    {item.label}
                    {active && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full
                        bg-blue-600" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* bottom actions */}
            <div className="px-3 pb-4 pt-2 border-t border-slate-100 space-y-1.5">
              {user ? (
                <>
                  <Link href={user.role === 'cr' ? '/cr' : '/admin'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl
                      text-sm font-semibold bg-emerald-600 text-white
                      hover:bg-emerald-700 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    Go to Dashboard
                  </Link>
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                      text-sm font-semibold text-red-600 hover:bg-red-50
                      transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                    </svg>
                    Logout
                  </button>
                </>
              ) : (
                <Link href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-3
                    rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700
                    text-white transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
                  </svg>
                  Login to Portal
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}