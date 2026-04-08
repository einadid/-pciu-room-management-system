'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/check-room', label: 'Check Availability', icon: '🔍' },
    { href: '/rooms', label: 'All Rooms', icon: '🏫' },
    { href: '/login', label: 'Login', icon: '🔐' },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-3 group">
            {/* University Logo - Portrait Size */}
            <div className="relative w-12 h-16 flex-shrink-0">
              <Image
                src="/pciu.png"
                alt="PCIU Logo"
                fill
                sizes="48px"
                className="object-contain"
                priority
              />
            </div>
            
            {/* Text - Desktop */}
            <div className="hidden sm:block">
              <h1 className="text-lg font-display font-bold text-dark leading-tight">
                Port City International University
              </h1>
              <p className="text-xs text-gray-500 font-medium tracking-wide">
                Room Management System
              </p>
            </div>

            {/* Text - Mobile */}
            <div className="sm:hidden">
              <h1 className="text-base font-display font-bold text-dark">
                PCIU
              </h1>
              <p className="text-[10px] text-gray-500">
                Room System
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  pathname === item.href
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Tablet Navigation - Icons Only */}
          <nav className="hidden md:flex lg:hidden items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-center w-10 h-10 rounded-lg text-lg transition-all ${
                  pathname === item.href
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                title={item.label}
              >
                {item.icon}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}