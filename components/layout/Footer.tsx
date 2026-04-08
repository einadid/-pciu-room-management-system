import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-10 sm:py-12">
        {/* Main Footer */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* About with Logo */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-10 h-14 bg-white rounded-lg overflow-hidden">
                <Image
                  src="/pciu.png"
                  alt="PCIU"
                  fill
                  sizes="40px"
                  className="object-contain p-0.5"
                />
              </div>
              <div>
                <h3 className="text-white font-display font-semibold">
                  PCIU
                </h3>
                <p className="text-xs text-gray-500">Room System</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Smart room management system for Port City International University.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-display font-semibold mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/check-room" className="text-gray-400 hover:text-white transition-colors">
                  Check Availability
                </Link>
              </li>
              <li>
                <Link href="/rooms" className="text-gray-400 hover:text-white transition-colors">
                  All Rooms
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-gray-400 hover:text-white transition-colors">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Buildings */}
          <div>
            <h3 className="text-white font-display font-semibold mb-4">
              Buildings
            </h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Main Building</li>
              <li>A Building</li>
              <li>B Building</li>
              <li>C Building</li>
              <li>D Building</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-display font-semibold mb-4">
              Contact
            </h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <span>📍</span>
                <span>Port City International University, Chattogram</span>
              </li>
              
              <li className="flex items-center gap-2">
                <span>🌐</span>
                <span><a href="https://www.portcity.edu.bd/" target='_blank'>www.portcity.edu.bd</a></span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
          <p className="text-gray-500 text-center sm:text-left">
            © {new Date().getFullYear()} Port City International University. All rights reserved.
          </p>
          <p className="text-gray-500">
            Developed by <span className="text-cyan-400 font-medium"><a href="https://github.com/einadid" target='_blank'>einadid</a></span>
          </p>
        </div>
      </div>
    </footer>
  );
}