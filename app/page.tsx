import Link from 'next/link';
import Image from 'next/image';
import Card from '@/components/ui/Card';

export default function HomePage() {
  const features = [
    {
      title: 'Check Room Availability',
      description: 'Instantly find free classrooms and labs by selecting day and time slot',
      href: '/check-room',
      icon: '🔍',
      color: 'bg-blue-500',
    },
    {
      title: 'CR Dashboard',
      description: 'Class Representatives can efficiently manage department schedules',
      href: '/login',
      icon: '👤',
      color: 'bg-purple-500',
    },
    {
      title: 'Browse All Rooms',
      description: 'Complete catalog of classrooms, labs, and special rooms with details',
      href: '/rooms',
      icon: '🏫',
      color: 'bg-orange-500',
    },
  ];

  const stats = [
    { value: '60+', label: 'Total Rooms', icon: '🏫' },
    { value: '6', label: 'Time Slots', icon: '⏰' },
    { value: '20+', label: 'Lab Facilities', icon: '🔬' },
    { value: '7', label: 'Working Days', icon: '📅' },
  ];

  const timeSlots = [
    { slot: 1, time: '08:30 - 09:55' },
    { slot: 2, time: '10:00 - 11:25' },
    { slot: 3, time: '11:30 - 12:55' },
    { slot: 4, time: '13:30 - 14:55' },
    { slot: 5, time: '15:00 - 16:25' },
    { slot: 6, time: '16:30 - 17:55' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-400 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-center">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="relative w-24 h-32 sm:w-28 sm:h-36 bg-white rounded-2xl shadow-2xl p-2 overflow-hidden">
                <Image
                  src="/pciu.png"
                  alt="PCIU Logo"
                  fill
                  sizes="(max-width: 640px) 96px, 112px"
                  className="object-contain p-1"
                  priority
                />
              </div>
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Smart Classroom Management
            </div>

            {/* Heading */}
            <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl mb-6 leading-tight">
              Port City International University
              <br />
              <span className="text-cyan-300">Room Management System</span>
            </h1>

            {/* Description */}
            <p className="text-lg sm:text-xl text-blue-100 max-w-3xl mx-auto mb-10 leading-relaxed px-4">
              Optimize classroom utilization with real-time availability tracking,
              intelligent scheduling, and comprehensive room management.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
              <Link href="/check-room">
                <button className="w-full sm:w-auto px-8 py-4 bg-white text-blue-700 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all">
                  🔍 Check Availability Now
                </button>
              </Link>
              <Link href="/rooms">
                <button className="w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all">
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
      <section className="max-w-7xl mx-auto px-4 -mt-8 sm:-mt-12 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
            >
              <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">{stat.icon}</div>
              <div className="text-2xl sm:text-3xl font-bold font-display text-blue-700 mb-1">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 sm:py-20">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 mb-4">
            Powerful Features
          </h2>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
            Everything you need for efficient room and schedule management
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <Link key={index} href={feature.href}>
              <div className="group bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 h-full">
                {/* Icon */}
                <div className={`w-14 h-14 sm:w-16 sm:h-16 ${feature.color} rounded-2xl flex items-center justify-center text-2xl sm:text-3xl mb-5 sm:mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                  {feature.icon}
                </div>

                {/* Content */}
                <h3 className="text-lg sm:text-xl font-display font-semibold text-gray-900 mb-2 sm:mb-3 group-hover:text-blue-700 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  {feature.description}
                </p>

                {/* Arrow */}
                <div className="mt-5 sm:mt-6 flex items-center text-blue-600 font-medium text-sm sm:text-base">
                  <span>Learn more</span>
                  <svg className="w-5 h-5 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Info Section */}
      <section className="bg-gray-50 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-6 sm:p-8 md:p-12 border border-gray-100">
            <div className="grid md:grid-cols-2 gap-8 sm:gap-12">
              {/* University Hours */}
              <div>
                <div className="flex items-center gap-3 mb-5 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl sm:text-2xl">⏰</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-display font-bold text-gray-900">
                    University Hours
                  </h3>
                </div>
                <div className="space-y-3 text-gray-700">
                  <div className="flex items-center gap-3 p-3 sm:p-4 bg-gray-50 rounded-xl">
                    <span className="text-blue-600 font-semibold text-lg">📅</span>
                    <span className="font-medium">Saturday - Friday (7 Days)</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 sm:p-4 bg-gray-50 rounded-xl">
                    <span className="text-blue-600 font-semibold text-lg">🕐</span>
                    <span className="font-medium">8:30 AM - 6:00 PM</span>
                  </div>
                </div>
              </div>

              {/* Time Slots */}
              <div>
                <div className="flex items-center gap-3 mb-5 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl sm:text-2xl">📊</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-display font-bold text-gray-900">
                    Daily Time Slots
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {timeSlots.map((item) => (
                    <div key={item.slot} className="flex items-center gap-2 p-2.5 sm:p-3 bg-gray-50 rounded-xl">
                      <span className="text-cyan-600 font-bold text-sm w-5">#{item.slot}</span>
                      <span className="text-gray-700 font-medium text-sm">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Buildings Section */}
      <section className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 mb-3">
            Our Buildings
          </h2>
          <p className="text-gray-600">
            Multiple buildings with modern facilities
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {['Main Building', 'A Building', 'B Building', 'C Building', 'D Building'].map((building, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl p-4 sm:p-6 text-center shadow-md hover:shadow-lg transition-shadow border border-gray-100"
            >
              <div className="text-3xl sm:text-4xl mb-3">🏛️</div>
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{building}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-4">
            Ready to Find Your Room?
          </h2>
          <p className="text-blue-100 mb-8 text-base sm:text-lg">
            Check room availability instantly or login to manage schedules
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/check-room">
              <button className="w-full sm:w-auto px-8 py-4 bg-white text-blue-700 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
                🔍 Check Availability
              </button>
            </Link>
            <Link href="/login">
              <button className="w-full sm:w-auto px-8 py-4 bg-blue-500 text-white border-2 border-white/30 rounded-xl font-semibold hover:bg-blue-400 transition-all">
                🔐 Login to System
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}