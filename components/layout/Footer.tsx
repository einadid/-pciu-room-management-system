import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  const quickLinks = [
    { href: "/", label: "Home" },
    { href: "/routine", label: "Class Routine" },
    { href: "/check-room", label: "Room Availability" },
    { href: "/rooms", label: "All Rooms" },
    { href: "/contact", label: "Contact Us" },
    { href: "/terms", label: "Terms & Conditions" }, // NEW
    { href: "/cr-guidelines", label: "CR Guidelines" }, // NEW
  ];
  const departments = [
    "Computer Science & Engineering",
    "Electrical & Electronic Engineering",
    "Business Administration",
    "Civil Engineering",
    "English",
    "Law",
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-12 h-16 bg-white rounded-lg overflow-hidden p-1">
                <Image
                  src="/pciu.png"
                  alt="PCIU"
                  fill
                  sizes="48px"
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="text-white font-display font-bold text-lg">
                  PCIU
                </h3>
                <p className="text-xs text-gray-400">Est. 2013</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Port City International University is committed to providing
              quality education and fostering innovation in the port city of
              Chattogram.
            </p>
            {/* <div className="flex gap-3">
              <a href="https://facebook.com/pciu" target="_blank" rel="noopener noreferrer" 
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                <span>📘</span>
              </a>
              <a href="https://youtube.com/pciu" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors">
                <span>📺</span>
              </a>
              <a href="https://linkedin.com/school/pciu" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                <span>💼</span>
              </a>
            </div> */}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-display font-semibold text-lg mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <span className="text-blue-400">→</span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Departments */}
          <div>
            <h3 className="text-white font-display font-semibold text-lg mb-4">
              Departments
            </h3>
            <ul className="space-y-2 text-sm">
              {departments.map((dept) => (
                <li key={dept} className="text-gray-400">
                  {dept}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-display font-semibold text-lg mb-4">
              Contact Us
            </h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center gap-2">
                <span>🌐</span>
                <span>
                  <a href="https://www.portcity.edu.bd/" target="_blank">
                    www.portcity.edu.bd
                  </a>
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm text-center md:text-left">
              © {new Date().getFullYear()} Port City International University.
              All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Developed by</span>
              <a
                href="https://github.com/einadid"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 font-medium hover:text-cyan-300 transition-colors flex items-center gap-1"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                einadid
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
