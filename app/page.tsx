import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/db';

async function getStats() {
  const [schedulesRes, noticesRes] = await Promise.all([
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
  const stats           = await getStats();
  const recentSchedules = await getRecentSchedules();

  const features = [
    {
      title: 'Class Routine',
      description: 'View complete class schedules for all departments, batches, and sections',
      href: '/routine',
      icon: '📅',
      gradient: 'from-blue-500 to-indigo-600',
      light: 'bg-blue-50',
      text: 'text-blue-700',
    },
    {
      title: 'Room Availability',
      description: 'Check real-time room availability by day and time slot',
      href: '/check-room',
      icon: '🔍',
      gradient: 'from-emerald-500 to-teal-600',
      light: 'bg-emerald-50',
      text: 'text-emerald-700',
    },
    {
      title: 'All Rooms',
      description: 'Browse complete catalog of classrooms, labs, and facilities',
      href: '/rooms',
      icon: '🏫',
      gradient: 'from-violet-500 to-purple-600',
      light: 'bg-violet-50',
      text: 'text-violet-700',
    },
    {
      title: 'CR Portal',
      description: 'Class Representatives can manage department schedules',
      href: '/login',
      icon: '📋',
      gradient: 'from-orange-500 to-rose-500',
      light: 'bg-orange-50',
      text: 'text-orange-700',
    },
  ];

  const quickStats = [
    { value: '60+', label: 'Classrooms',   icon: '🏫', color: 'from-blue-500 to-blue-600'     },
    { value: '6',   label: 'Time Slots',   icon: '⏰', color: 'from-violet-500 to-violet-600'  },
    { value: '9',   label: 'Departments',  icon: '🎓', color: 'from-emerald-500 to-emerald-600'},
    { value: '6',   label: 'Days/Week',    icon: '📆', color: 'from-orange-500 to-orange-600'  },
  ];

  const timeSlots = [
    { slot: 'Slot 1', time: '08:30 AM – 09:55 AM' },
    { slot: 'Slot 2', time: '10:00 AM – 11:25 AM' },
    { slot: 'Slot 3', time: '11:30 AM – 12:55 PM' },
    { slot: 'Slot 4', time: '01:30 PM – 02:55 PM' },
    { slot: 'Slot 5', time: '03:00 PM – 04:25 PM' },
    { slot: 'Slot 6', time: '04:30 PM – 05:55 PM' },
  ];

  const buildings = [
    { name: 'Main Building', icon: '🏛️' },
    { name: 'A Building',    icon: '🏢' },
    { name: 'B Building',    icon: '🏢' },
    { name: 'C Building',    icon: '🏢' },
    { name: 'D Building',    icon: '🏢' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ══════════════════ HERO ══════════════════ */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900
        text-white overflow-hidden">

        {/* decorative blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px]
            bg-blue-600/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px]
            bg-indigo-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-3xl" />
        </div>

        {/* grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
            backgroundSize: '40px 40px',
          }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-32
          sm:pt-20 sm:pb-36">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left */}
            <div>
              {/* Logo + name */}
              <div className="inline-flex items-center gap-3 mb-8
                bg-white/10 border border-white/20 rounded-2xl px-4 py-3
                backdrop-blur-sm">
                <div className="relative w-10 h-12 shrink-0">
                  <Image src="/pciu.png" alt="PCIU" fill
                    sizes="40px" className="object-contain" priority />
                </div>
                <div>
                  <p className="text-blue-300 text-[10px] font-semibold
                    uppercase tracking-widest">Port City International University</p>
                  <p className="text-white font-bold text-sm">PCIU — Chittagong</p>
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold
                leading-tight mb-5 tracking-tight">
                Smart{' '}
                <span className="text-transparent bg-clip-text
                  bg-gradient-to-r from-blue-300 to-cyan-300">
                  Room Management
                </span>
                <br />System
              </h1>

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-8
                max-w-lg">
                Real-time room availability, intelligent scheduling, and complete
                routine management for every department at PCIU.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/routine">
                  <span className="flex items-center justify-center gap-2
                    px-6 py-3.5 bg-blue-600 hover:bg-blue-500
                    text-white font-semibold rounded-xl shadow-lg
                    hover:shadow-blue-500/30 hover:-translate-y-0.5
                    transition-all duration-200 cursor-pointer text-sm sm:text-base">
                    📅 View Class Routine
                  </span>
                </Link>
                <Link href="/check-room">
                  <span className="flex items-center justify-center gap-2
                    px-6 py-3.5 bg-white/10 hover:bg-white/20
                    border border-white/20 text-white font-semibold rounded-xl
                    hover:-translate-y-0.5 transition-all duration-200
                    backdrop-blur-sm cursor-pointer text-sm sm:text-base">
                    🔍 Check Room Availability
                  </span>
                </Link>
              </div>
            </div>

            {/* Right — stat cards */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {quickStats.map((stat, i) => (
                <div key={i}
                  className="relative bg-white/10 border border-white/15
                    rounded-2xl p-5 sm:p-6 text-center backdrop-blur-sm
                    hover:bg-white/15 transition-colors overflow-hidden group">
                  <div className={`absolute inset-0 bg-gradient-to-br
                    ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                  <div className="text-3xl sm:text-4xl mb-2">{stat.icon}</div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white">
                    {stat.value}
                  </div>
                  <div className="text-slate-300 text-xs sm:text-sm mt-1 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none"
            className="w-full h-12 sm:h-20">
            <path
              d="M0 80L48 69.3C96 59 192 37 288 32C384 27 480 37 576 42.7C672 48 768 48 864 42.7C960 37 1056 27 1152 26.7C1248 27 1344 37 1392 42.7L1440 48V80H0Z"
              fill="#f8fafc"/>
          </svg>
        </div>
      </section>

      {/* ══════════════════ NOTICE ══════════════════ */}
      {stats.notices.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-4 relative z-10">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4
            flex items-start gap-3 shadow-sm">
            <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center
              justify-center shrink-0 text-lg">
              📢
            </div>
            <div>
              <p className="font-semibold text-amber-800 text-sm">
                {stats.notices[0].title}
              </p>
              <p className="text-amber-700 text-sm mt-0.5 leading-relaxed">
                {stats.notices[0].content}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════ FEATURES ══════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center mb-10 sm:mb-12">
          <span className="inline-block text-xs font-bold text-blue-600
            bg-blue-50 border border-blue-100 px-3 py-1 rounded-full
            uppercase tracking-widest mb-3">
            Features
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3">
            Everything You Need
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto text-sm sm:text-base">
            Access all room and schedule management features in one place
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((f, i) => (
            <Link key={i} href={f.href}>
              <div className="group h-full bg-white rounded-2xl p-6
                border border-slate-100 shadow-sm
                hover:shadow-xl hover:border-transparent
                hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                {/* icon */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br
                  ${f.gradient} flex items-center justify-center text-xl
                  mb-4 shadow-md group-hover:scale-110 transition-transform
                  duration-300`}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2
                  group-hover:text-blue-700 transition-colors">
                  {f.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {f.description}
                </p>
                {/* arrow */}
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold
                  text-slate-400 group-hover:text-blue-600 transition-colors">
                  <span>Learn more</span>
                  <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5
                    transition-transform" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      strokeWidth={2.5} d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ══════════════════ RECENT SCHEDULES ══════════════════ */}
      {recentSchedules.length > 0 && (
        <section className="bg-white border-y border-slate-100 py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center
              justify-between gap-4 mb-10">
              <div>
                <span className="inline-block text-xs font-bold text-emerald-600
                  bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full
                  uppercase tracking-widest mb-2">
                  Live Updates
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  Recently Added Classes
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  Latest schedules added by Class Representatives
                </p>
              </div>
              <Link href="/routine">
                <span className="inline-flex items-center gap-2 px-5 py-2.5
                  bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold
                  rounded-xl transition-colors cursor-pointer shrink-0">
                  View All
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      strokeWidth={2} d="M9 5l7 7-7 7"/>
                  </svg>
                </span>
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentSchedules.map((schedule: any) => (
                <div key={schedule.id}
                  className="group bg-slate-50 hover:bg-white rounded-2xl p-5
                    border border-slate-100 hover:border-blue-100
                    hover:shadow-md transition-all duration-200">
                  {/* top row */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 text-sm leading-snug
                        truncate">
                        {schedule.course_name}
                      </h4>
                      {schedule.course_code && (
                        <p className="text-xs text-slate-400 font-medium mt-0.5">
                          {schedule.course_code}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 px-2.5 py-1 bg-blue-100 text-blue-700
                      text-[10px] font-bold rounded-full uppercase tracking-wide">
                      {schedule.day_of_week?.slice(0, 3)}
                    </span>
                  </div>

                  {/* details */}
                  <div className="space-y-1.5">
                    {schedule.teacher_name && (
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <span className="w-5 h-5 bg-blue-50 rounded-md flex items-center
                          justify-center shrink-0 text-sm">👨‍🏫</span>
                        <span className="truncate">{schedule.teacher_name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <span className="w-5 h-5 bg-violet-50 rounded-md flex items-center
                        justify-center shrink-0 text-sm">⏰</span>
                      <span>
                        {schedule.time_slots?.start_time?.slice(0, 5)} –{' '}
                        {schedule.time_slots?.end_time?.slice(0, 5)}
                      </span>
                    </div>
                    {schedule.rooms?.room_name && (
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <span className="w-5 h-5 bg-emerald-50 rounded-md flex
                          items-center justify-center shrink-0 text-sm">🚪</span>
                        <span>
                          Room {schedule.rooms.room_name}
                          {schedule.rooms.building && ` · ${schedule.rooms.building}`}
                        </span>
                      </div>
                    )}
                    {schedule.batches && schedule.sections && (
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <span className="w-5 h-5 bg-amber-50 rounded-md flex items-center
                          justify-center shrink-0 text-sm">👥</span>
                        <span>
                          {schedule.batches.batch_name} · Sec {schedule.sections.section_name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════ TIME SLOTS + BUILDINGS ══════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8">

          {/* Time slots */}
          <div className="bg-white rounded-2xl border border-slate-100
            shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center
                justify-center text-xl shrink-0">
                ⏰
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Class Time Slots
                </h3>
                <p className="text-xs text-slate-400">Daily schedule — 6 slots</p>
              </div>
            </div>
            <div className="space-y-2">
              {timeSlots.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3
                  rounded-xl hover:bg-slate-50 transition-colors group">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-lg
                    flex items-center justify-center text-xs font-extrabold
                    shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                    {i + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-700">{item.slot}</p>
                    <p className="text-xs text-slate-400 font-medium tabular-nums">
                      {item.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Buildings */}
          <div className="bg-white rounded-2xl border border-slate-100
            shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 bg-emerald-100 rounded-xl flex items-center
                justify-center text-xl shrink-0">
                🏛️
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Campus Buildings
                </h3>
                <p className="text-xs text-slate-400">5 buildings · 60+ rooms</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {buildings.map((b, i) => (
                <div key={i}
                  className="flex items-center gap-2.5 p-3.5 bg-slate-50
                    hover:bg-emerald-50 border border-slate-100
                    hover:border-emerald-200 rounded-xl transition-all group">
                  <span className="text-xl shrink-0">{b.icon}</span>
                  <p className="text-xs font-semibold text-slate-700
                    group-hover:text-emerald-700 transition-colors">
                    {b.name}
                  </p>
                </div>
              ))}
            </div>

            {/* quick link */}
            <Link href="/rooms">
              <div className="mt-4 flex items-center justify-center gap-2
                p-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm
                font-semibold rounded-xl transition-colors cursor-pointer">
                <span>Browse All Rooms</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    strokeWidth={2} d="M9 5l7 7-7 7"/>
                </svg>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════ CTA ══════════════════ */}
      <section className="relative bg-gradient-to-br from-slate-900
        via-blue-950 to-slate-900 py-16 sm:py-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-80 h-80
            bg-blue-600/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80
            bg-indigo-600/20 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-block text-xs font-bold text-blue-300
            bg-blue-900/50 border border-blue-800 px-3 py-1 rounded-full
            uppercase tracking-widest mb-4">
            Get In Touch
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
            Need Help or Have Suggestions?
          </h2>
          <p className="text-slate-400 mb-8 text-sm sm:text-base max-w-lg mx-auto">
            Contact us for any queries or to report issues with the system.
            We're here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/contact">
              <span className="flex items-center justify-center gap-2
                px-7 py-3.5 bg-white text-slate-900 font-bold rounded-xl
                hover:bg-slate-100 transition-colors cursor-pointer
                shadow-lg text-sm sm:text-base">
                📧 Contact Us
              </span>
            </Link>
            <Link href="/routine">
              <span className="flex items-center justify-center gap-2
                px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white
                font-bold rounded-xl border border-blue-500
                transition-colors cursor-pointer text-sm sm:text-base">
                📅 View Routine
              </span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}