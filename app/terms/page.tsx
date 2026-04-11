import Card from '@/components/ui/Card';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold font-display text-gray-900 mb-2">
          Terms & Conditions
        </h1>
        <p className="text-gray-600">
          PCIU Room Management System
        </p>
      </div>

      <Card className="prose max-w-none">
        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing and using the PCIU Room Management System, you accept and agree to be bound by the terms and conditions of this agreement. If you do not agree to these terms, please do not use this system.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              2. User Accounts
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-2">
              <p><strong>2.1 Token Security:</strong></p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Your login token is personal and confidential</li>
                <li>Do not share your token with anyone</li>
                <li>You are responsible for all activities under your account</li>
                <li>Report any unauthorized use immediately</li>
              </ul>
              
              <p className="mt-4"><strong>2.2 Account Types:</strong></p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Admin:</strong> Full system access, token generation</li>
                <li><strong>CR (Class Representative):</strong> Manage assigned section schedules</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              3. Acceptable Use Policy
            </h2>
            <div className="text-gray-700 leading-relaxed">
              <p className="mb-2">You agree NOT to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Use the system for any unlawful purpose</li>
                <li>Attempt to gain unauthorized access to any part of the system</li>
                <li>Interfere with or disrupt the system's functionality</li>
                <li>Upload malicious code or harmful content</li>
                <li>Scrape or extract data through automated means without permission</li>
                <li>Impersonate another user or provide false information</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              4. Data Privacy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We collect and store only necessary information for system functionality. Your data is protected and will not be shared with third parties without your consent, except as required by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              5. System Availability
            </h2>
            <p className="text-gray-700 leading-relaxed">
              While we strive to maintain 24/7 availability, we do not guarantee uninterrupted access. The system may be temporarily unavailable due to maintenance, updates, or technical issues.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              6. Modifications
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify these terms at any time. Users will be notified of significant changes. Continued use of the system after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              7. Termination
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to suspend or terminate access to any account that violates these terms or engages in prohibited activities.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              8. Contact
            </h2>
            <p className="text-gray-700 leading-relaxed">
              For questions about these terms, please contact me at{' '}
              <a href="mailto:emamulislamnadid_cse30d@portcity.edu.bd" className="text-blue-600 hover:text-blue-700">
                emamulislamnadid_cse30d@portcity.edu.bd
              </a>
            </p>
          </section>

          {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8">
            <p className="text-sm text-blue-900">
              <strong>Last Updated:</strong> December 2024
            </p>
            <p className="text-sm text-blue-900 mt-1">
              <strong>Effective Date:</strong> December 2024
            </p>
          </div> */}
        </div>
      </Card>

      <div className="mt-8 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all"
        >
          ← Back to Login
        </Link>
      </div>
    </div>
  );
}