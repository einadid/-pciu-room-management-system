export default function Footer() {
  return (
    <footer className="bg-dark text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Main Footer */}
        <div className="grid md:grid-cols-3 gap-8 mb-6">
          {/* About */}
          <div>
            <h3 className="text-white font-display font-semibold text-lg mb-3">
              About System
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Smart room management and scheduling system designed for 
              Port City International University to optimize classroom utilization.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-display font-semibold text-lg mb-3">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="text-gray-400 hover:text-white transition-colors">Home</a></li>
              <li><a href="/check-room" className="text-gray-400 hover:text-white transition-colors">Check Availability</a></li>
              <li><a href="/rooms" className="text-gray-400 hover:text-white transition-colors">All Rooms</a></li>
              <li><a href="/login" className="text-gray-400 hover:text-white transition-colors">Login</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-display font-semibold text-lg mb-3">
              Contact
            </h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>📍 Port City International University</li>
              <li>📧 info@pciu.ac.bd</li>
              <li>📞 +880-XXX-XXXXXX</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <p className="text-gray-500">
            © {new Date().getFullYear()} Port City International University. All rights reserved.
          </p>
          <p className="text-gray-500">
            Developed by <span className="text-accent-500 font-medium">Emamul Islam Nadid</span>
          </p>
        </div>
      </div>
    </footer>
  );
}