'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (err) {
        setUser(null);
      }
    }
  }, [pathname]); // Re-check when page changes

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    window.location.href = '/login';
  };

  const navItems = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/routine', label: 'Routine', icon: '📅' },
    { href: '/check-room', label: 'Rooms', icon: '🔍' },
    { href: '/contact', label: 'Contact', icon: '📧' },
  ];

  return (
    <header className="bg-white sticky top-0 z-50 shadow-sm">
      {/* Top Bar */}
      <div className="bg-blue-900 text-white py-2">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center text-sm">
          <div className="flex items-center gap-4">
            <span className="hidden sm:block">📧 info@pciu.ac.bd</span>
            <span>📞 +880-XXX-XXXXXX</span>
          </div>
          <div>
            {user ? (
              <div className="flex items-center gap-3">
                <Link 
                  href={user.role === 'cr' ? '/cr' : '/admin'}
                  className="hover:text-blue-200"
                >
                  👤 {user.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-2 py-1 bg-red-500 hover:bg-red-600 rounded text-xs"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/login" className="hover:text-blue-200">
                🔐 Login
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-10 h-12">
                <Image
                  src="/pciu.png"
                  alt="PCIU"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="font-bold text-gray-900">PCIU</h1>
                <p className="text-xs text-gray-500">Room System</p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    pathname === item.href
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.icon} {item.label}
                </Link>
              ))}
              
              {user ? (
                <Link
                  href={user.role === 'cr' ? '/cr' : '/admin'}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700"
                >
                  ⚙️ Dashboard
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
                >
                  🔐 Login
                </Link>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              ☰
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 hover:bg-gray-50"
                >
                  {item.icon} {item.label}
                </Link>
              ))}
              {user ? (
                <>
                  <Link
                    href={user.role === 'cr' ? '/cr' : '/admin'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 hover:bg-gray-50"
                  >
                    ⚙️ Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-3 text-red-600 hover:bg-red-50"
                  >
                    🚪 Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 bg-blue-600 text-white m-4 rounded-lg text-center"
                >
                  🔐 Login
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}