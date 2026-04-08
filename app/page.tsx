import Link from 'next/link';
import Image from 'next/image';
import Card from '@/components/ui/Card';
import { supabase } from '@/lib/db';

async function getStats() {
  const [roomsRes, schedulesRes, noticesRes] = await Promise.all([
    supabase.from('rooms').select('count').single(),
    supabase.from('schedules').select('count').single(),
    supabase.from('notices').select('*').eq('is_active', true).limit(3),
  ]);

  return {
    rooms: 60,
    schedules: schedulesRes.data?.count || 0,
    notices: noticesRes.data || [],
  };
}

async function getRecentSchedules() {
  const { data } = await supabase
    .from('schedules')
    .select(`
      *,
      rooms (room_name, building),
      time_slots (slot_name, start_time, end_time),
      batches (batch_name),
      sections (section_name)
    `)
    .order('created_at', { ascending: false })
    .limit(6);

  return data || [];
}

export default async function HomePage() {
  const stats = await getStats();
  const recentSchedules = await getRecentSchedules();

  const features = [
    {
      title: 'Class Routine',
      description: 'View complete class schedules for all departments, batches, and sections',
      href: '/routine',
      icon: '📅',
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Room Availability',
      description: 'Check real-time room availability by day and time slot',
      href: '/check-room',
      icon: '🔍',
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'All Rooms',
      description: 'Browse complete catalog of classrooms, labs, and facilities',
      href: '/rooms',
      icon: '🏫',
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'CR Portal',
      description: 'Class Representatives can manage department schedules',
      href: '/login',
      icon: '📋',
      color: 'from-orange-500 to-orange-600',
    },
  ];

  const quickStats = [
    { value: '60+', label: 'Rooms', icon: '🏫' },
    { value: '6', label: 'Time Slots', icon: '⏰' },
    { value: '8', label: 'Departments', icon: '🎓' },
    { value: '7', label: 'Days/Week', icon: '📅' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-400 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              {/* Logo */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative w-20 h-24 bg-white rounded-xl p-2 shadow-xl">
                  <Image
                    src="/pciu.png"
                    alt="PCIU Logo"
                    fill
                    sizes="80px"
                    className="object-contain"
                    priority
                  />
                </div>
                <div>
                  <p className="text-blue-200 text-sm font-medium">Welcome to</p>
                  <h2 className="text-xl font-display font-bold">PCIU</h2>
                </div>
              </div>

              <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl mb-6 leading-tight">
                Smart Room Management System
              </h1>

              <p className="text-lg text-blue-100 mb-8 leading-relaxed">
                Optimize classroom utilization with real-time availability tracking, 
                intelligent scheduling, and comprehensive room management for 
                Port City International University.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/routine">
                  <button className="w-full sm:w-auto px-8 py-4 bg-white text-blue-700 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all">
                    📅 View Class Routine
                  </button>
                </Link>
                <Link href="/check-room">
                  <button className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white border-2 border-blue-400 rounded-xl font-semibold text-lg hover:bg-blue-500 transition-all">
                    🔍 Check Room Availability
                  </button>
                </Link>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              {quickStats.map((stat, index) => (
                <div 
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20"
                >
                  <div className="text-4xl mb-2">{stat.icon}</div>
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <div className="text-blue-200 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#f8fafc"/>
          </svg>
        </div>
      </section>

      {/* Notices Section */}
      {stats.notices.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 -mt-6 relative z-10">
          <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-r-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📢</span>
              <div>
                <h3 className="font-semibold text-yellow-800">
                  {stats.notices[0].title}
                </h3>
                <p className="text-yellow-700 text-sm">
                  {stats.notices[0].content}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
            What You Can Do
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Access all room and schedule management features
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Link key={index} href={feature.href}>
              <div className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 h-full">
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Schedules Preview */}
      {recentSchedules.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">
                  📋 Recently Added Classes
                </h2>
                <p className="text-gray-600">
                  Latest schedules added by Class Representatives
                </p>
              </div>
              <Link href="/routine">
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  View All →
                </button>
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentSchedules.map((schedule: any) => (
                <div 
                  key={schedule.id}
                  className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {schedule.course_name}
                      </h4>
                      {schedule.course_code && (
                        <p className="text-sm text-gray-500">{schedule.course_code}</p>
                      )}
                    </div>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                      {schedule.day_of_week}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    {schedule.teacher_name && (
                      <p className="flex items-center gap-2">
                        <span>👨‍🏫</span>
                        <span>{schedule.teacher_name}</span>
                      </p>
                    )}
                    <p className="flex items-center gap-2">
                      <span>⏰</span>
                      <span>
                        {schedule.time_slots?.start_time?.slice(0, 5)} - 
                        {schedule.time_slots?.end_time?.slice(0, 5)}
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span>🚪</span>
                      <span>
                        Room {schedule.rooms?.room_name} ({schedule.rooms?.building})
                      </span>
                    </p>
                    {schedule.batches && schedule.sections && (
                      <p className="flex items-center gap-2">
                        <span>👥</span>
                        <span>
                          {schedule.batches.batch_name} - Section {schedule.sections.section_name}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Time Slots Info */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">⏰</span>
                </div>
                <h3 className="text-2xl font-display font-bold text-gray-900">
                  Class Schedule
                </h3>
              </div>
              <div className="space-y-3">
                {[
                  { slot: 'Slot 1', time: '08:30 AM - 09:55 AM' },
                  { slot: 'Slot 2', time: '10:00 AM - 11:25 AM' },
                  { slot: 'Slot 3', time: '11:30 AM - 12:55 PM' },
                  { slot: 'Slot 4', time: '01:30 PM - 02:55 PM' },
                  { slot: 'Slot 5', time: '03:00 PM - 04:25 PM' },
                  { slot: 'Slot 6', time: '04:30 PM - 05:55 PM' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">{item.slot}</p>
                      <p className="text-sm text-gray-600">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🏛️</span>
                </div>
                <h3 className="text-2xl font-display font-bold text-gray-900">
                  Buildings
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {['Main Building', 'A Building', 'B Building', 'C Building', 'D Building'].map((building) => (
                  <div key={building} className="p-4 bg-gray-50 rounded-lg text-center">
                    <span className="text-3xl mb-2 block">🏢</span>
                    <p className="font-medium text-gray-900">{building}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-display font-bold text-white mb-4">
            Need Help or Have Suggestions?
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Contact us for any queries or to report issues with the system
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <button className="w-full sm:w-auto px-8 py-4 bg-white text-blue-700 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
                📧 Contact Us
              </button>
            </Link>
            <Link href="/routine">
              <button className="w-full sm:w-auto px-8 py-4 bg-blue-500 text-white border-2 border-white/30 rounded-xl font-semibold hover:bg-blue-400 transition-all">
                📅 View Routine
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}