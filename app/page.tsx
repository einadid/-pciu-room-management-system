import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function HomePage() {
  const features = [
    {
      title: 'Check Room Availability',
      description: 'Instantly find free classrooms and labs by selecting day and time slot',
      href: '/check-room',
      icon: '🔍',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'CR Dashboard',
      description: 'Class Representatives can efficiently manage department schedules',
      href: '/login',
      icon: '👤',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Browse All Rooms',
      description: 'Complete catalog of classrooms, labs, and special rooms with details',
      href: '/rooms',
      icon: '🏫',
      gradient: 'from-orange-500 to-red-500',
    },
  ];

  const stats = [
    { value: '60+', label: 'Total Rooms', icon: '🏫' },
    { value: '6', label: 'Time Slots', icon: '⏰' },
    { value: '20+', label: 'Lab Facilities', icon: '🔬' },
    { value: '7', label: 'Working Days', icon: '📅' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-28">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Smart Classroom Management
            </div>

            {/* Heading */}
            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl mb-6 leading-tight">
              Port City International University
              <br />
              <span className="text-accent-400">Room Management System</span>
            </h1>

            {/* Description */}
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-10 leading-relaxed">
              Optimize classroom utilization with real-time availability tracking,
              intelligent scheduling, and comprehensive room management.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/check-room">
                <button className="px-8 py-4 bg-white text-primary-700 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all">
                  🔍 Check Availability Now
                </button>
              </Link>
              <Link href="/rooms">
                <button className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all">
                  📋 Browse All Rooms
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#f8fafc"/>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 -mt-12 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 text-center shadow-card hover:shadow-soft transition-shadow">
              <div className="text-4xl mb-3">{stat.icon}</div>
              <div className="text-3xl font-bold font-display text-primary-700 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-display font-bold text-dark mb-4">
            Powerful Features
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Everything you need for efficient room and schedule management
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Link key={index} href={feature.href}>
              <div className="group bg-white rounded-2xl p-8 shadow-card hover:shadow-soft transition-all duration-300 border border-transparent hover:border-primary-200 h-full">
                {/* Icon with Gradient */}
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                  {feature.icon}
                </div>

                {/* Content */}
                <h3 className="text-xl font-display font-semibold text-dark mb-3 group-hover:text-primary-700 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>

                {/* Arrow */}
                <div className="mt-6 flex items-center text-primary-600 font-medium group-hover:gap-2 transition-all">
                  <span>Learn more</span>
                  <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Info Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-3xl shadow-soft p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-12">
              {/* University Hours */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">⏰</span>
                  </div>
                  <h3 className="text-2xl font-display font-bold text-dark">
                    University Hours
                  </h3>
                </div>
                <div className="space-y-3 text-gray-700">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-primary-600 font-semibold">📅</span>
                    <span>Saturday - Friday (7 Days)</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-primary-600 font-semibold">🕐</span>
                    <span>8:30 AM - 6:00 PM</span>
                  </div>
                </div>
              </div>

              {/* Time Slots */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h3 className="text-2xl font-display font-bold text-dark">
                    Daily Time Slots
                  </h3>
                </div>
                <div className="space-y-2 text-sm">
                  {[
                    '08:30 - 09:55',
                    '10:00 - 11:25',
                    '11:30 - 12:55',
                    '13:30 - 14:55',
                    '15:00 - 16:25',
                    '16:30 - 17:55'
                  ].map((slot, i) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg">
                      <span className="text-accent-600 font-bold w-6">#{i + 1}</span>
                      <span className="text-gray-700 font-medium">{slot}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}