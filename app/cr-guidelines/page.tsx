import Card from '@/components/ui/Card';
import Link from 'next/link';

export default function CRGuidelinesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold font-display text-gray-900 mb-2">
          CR Guidelines
        </h1>
        <p className="text-gray-600">
          Rules and Responsibilities for Class Representatives
        </p>
      </div>

      <Card className="prose max-w-none">
        <div className="space-y-6">
          {/* Introduction */}
          <div className="bg-blue-50 border-l-4 border-blue-600 rounded-r-lg p-4">
            <p className="text-blue-900 font-medium">
              As a Class Representative (CR), you play a crucial role in managing your section's academic schedule. 
              Please read and follow these guidelines carefully.
            </p>
          </div>

          {/* Eligibility */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              1. Eligibility to Become CR
            </h2>
            <div className="text-gray-700 leading-relaxed">
              <p className="mb-2">To be eligible for a CR token, you must:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Be an enrolled student at PCIU</li>
                <li>Be elected or appointed by your section</li>
                <li>Have approval from your department coordinator</li>
                <li>Maintain good academic standing</li>
                <li>Be responsible and trustworthy</li>
              </ul>
            </div>
          </section>

          {/* Responsibilities */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              2. Your Responsibilities
            </h2>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="font-medium text-green-900 mb-2">✅ What You SHOULD Do:</p>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Add accurate class schedules for your assigned section only</li>
                <li>Verify room availability before adding schedules</li>
                <li>Include correct course names, codes, and teacher information</li>
                <li>Update schedules promptly when changes occur</li>
                <li>Coordinate with your department for room assignments</li>
                <li>Inform students about schedule changes</li>
                <li>Keep your login token secure and confidential</li>
                <li>Report technical issues to administrators</li>
              </ul>
            </div>
          </section>

          {/* Prohibited Actions */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              3. Prohibited Actions
            </h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="font-medium text-red-900 mb-2">❌ What You MUST NOT Do:</p>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li><strong>DO NOT</strong> add schedules for other sections or departments</li>
                <li><strong>DO NOT</strong> share your login token with anyone</li>
                <li><strong>DO NOT</strong> delete or modify other CRs' schedules</li>
                <li><strong>DO NOT</strong> book rooms without proper authorization</li>
                <li><strong>DO NOT</strong> enter false or misleading information</li>
                <li><strong>DO NOT</strong> use the system for personal purposes</li>
                <li><strong>DO NOT</strong> attempt to access admin features</li>
                <li><strong>DO NOT</strong> create duplicate or fake schedules</li>
              </ul>
            </div>
          </section>

          {/* How to Add Schedule */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              4. How to Add a Class Schedule
            </h2>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <ol className="list-decimal pl-6 space-y-2 text-gray-700">
                <li>Login with your CR token</li>
                <li>Go to "Add New Class Schedule"</li>
                <li>Select your batch and section</li>
                <li>Enter course details (name, code, teacher)</li>
                <li>Choose day and time slot</li>
                <li>Check room availability first on the availability page</li>
                <li>Select an available room</li>
                <li>Double-check all information</li>
                <li>Submit the schedule</li>
              </ol>
            </div>
          </section>

          {/* Best Practices */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              5. Best Practices
            </h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">→</span>
                <span><strong>Verify Information:</strong> Always confirm class details with teachers before adding</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">→</span>
                <span><strong>Avoid Conflicts:</strong> Use the room availability checker to prevent double-booking</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">→</span>
                <span><strong>Update Promptly:</strong> Make changes as soon as you're notified by teachers</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">→</span>
                <span><strong>Communicate:</strong> Inform your section about any schedule updates</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">→</span>
                <span><strong>Stay Organized:</strong> Keep a backup of your section's routine</span>
              </li>
            </ul>
          </section>

          {/* Consequences */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              6. Consequences of Violation
            </h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="font-medium text-yellow-900 mb-2">⚠️ Violations may result in:</p>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Warning from administration</li>
                <li>Temporary suspension of your CR access</li>
                <li>Permanent revocation of CR privileges</li>
                <li>Disciplinary action from the university</li>
                <li>Replacement as Class Representative</li>
              </ul>
            </div>
          </section>

          {/* Support */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              7. Getting Help
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              If you need assistance or have questions:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="font-medium text-blue-900">📧 Email Support</p>
                <p className="text-sm text-blue-700">emamulislamnadid_cse30d@portcity.edu.bd</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="font-medium text-green-900">💬 WhatsApp</p>
                <a 
                  href="https://wa.me/8801678791177"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-green-700 hover:text-green-800"
                >
                  +880 1678-791177
                </a>
              </div>
            </div>
          </section>

          {/* Acknowledgment */}
          <div className="bg-gray-100 border-l-4 border-gray-600 rounded-r-lg p-4 mt-8">
            <p className="text-gray-800 font-medium mb-2">
              📝 Acknowledgment
            </p>
            <p className="text-sm text-gray-700">
              By using your CR token to login, you acknowledge that you have read, understood, 
              and agree to follow these guidelines. Failure to comply may result in immediate 
              termination of your access.
            </p>
          </div>
        </div>
      </Card>

      <div className="mt-8 flex gap-4 justify-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all"
        >
          ← Back to Login
        </Link>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
        >
          📧 Contact Support
        </Link>
      </div>
    </div>
  );
}