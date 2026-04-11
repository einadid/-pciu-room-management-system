import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  const quickLinks = [
    { href: "/",            label: "Home",             icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { href: "/routine",     label: "Class Routine",    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
    { href: "/check-room",  label: "Room Availability",icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
    // { href: "/rooms",       label: "All Rooms",        icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
    { href: "/contact",     label: "Contact Us",       icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
    { href: "/terms",       label: "Terms & Conditions",icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
    { href: "/cr-guidelines",label: "CR Guidelines",  icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
  ];

  const departments = [
    { short: "CSE",  full: "Computer Science & Engineering"    },
    { short: "EEE",  full: "Electrical & Electronic Engineering"},
    { short: "CEN",   full: "Civil Engineering"                  },
    { short: "BTE",   full: "Textile Engineering"                },
    { short: "BFT",  full: "Fashion Design & Technology"        },
    { short: "DBA",  full: "Business Administration"            },
    { short: "LLB",  full: "Law"                               },
    { short: "ENG",  full: "English"                           },
    { short: "JRN",  full: "Broadcast & Print Journalism"       },
  ];

  return (
    <footer className="bg-slate-900 text-slate-300">

      {/* ── Top accent bar ── */}
      <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600" />

      {/* ── Main content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* ── Brand ── */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="relative w-11 h-14 bg-white rounded-xl
                overflow-hidden p-1 shadow-md shrink-0">
                <Image src="/pciu.png" alt="PCIU" fill
                  sizes="44px" className="object-contain" />
              </div>
              <div>
                <h3 className="text-white font-extrabold text-xl tracking-tight">
                  PCIU
                </h3>
                <p className="text-[11px] text-slate-400 font-medium
                  tracking-widest uppercase">
                  Est. 2013 · Chittagong
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Port City International University is committed to providing
              quality education and fostering innovation in the port city
              of Chattogram, Bangladesh.
            </p>

            {/* Contact pill */}
            <a href="mailto:info@portcity.edu.bd"
              className="inline-flex items-center gap-2 px-4 py-2.5
                bg-slate-800 hover:bg-slate-700 border border-slate-700
                hover:border-slate-600 rounded-xl text-sm text-slate-300
                hover:text-white transition-all group">
              <svg className="w-4 h-4 text-blue-400 group-hover:text-blue-300
                shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              <span className="font-medium">@portcity.edu.bd</span>
            </a>
          </div>

          {/* ── Quick Links ── */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-widest
              mb-5 flex items-center gap-2">
              <span className="w-5 h-px bg-blue-500 inline-block" />
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}
                    className="group flex items-center gap-2.5 text-sm
                      text-slate-400 hover:text-white transition-colors">
                    <svg className="w-3.5 h-3.5 text-slate-600
                      group-hover:text-blue-400 transition-colors shrink-0"
                      fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        strokeWidth={2} d={link.icon} />
                    </svg>
                    <span className="group-hover:translate-x-0.5
                      transition-transform duration-200">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Departments ── */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-widest
              mb-5 flex items-center gap-2">
              <span className="w-5 h-px bg-blue-500 inline-block" />
              Departments
            </h4>
            <ul className="space-y-2">
              {departments.map((dept) => (
                <li key={dept.short}
                  className="flex items-center gap-2.5 text-sm group">
                  <span className="shrink-0 text-[10px] font-bold text-blue-400
                    bg-blue-950 border border-blue-900 px-1.5 py-0.5 rounded
                    min-w-[36px] text-center">
                    {dept.short}
                  </span>
                  <span className="text-slate-400 group-hover:text-slate-300
                    transition-colors text-xs leading-snug">
                    {dept.full}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* ── System Info ── */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-widest
              mb-5 flex items-center gap-2">
              <span className="w-5 h-px bg-blue-500 inline-block" />
              System Info
            </h4>

            <div className="space-y-3">
              {[
                { icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4", label: "Rooms",     val: "60+"  },
                { icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",                                                                                                   label: "Time Slots", val: "6"    },
                { icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5",                                                                          label: "Departments",val: "9"    },
                { icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",                                                       label: "Days/Week",  val: "6"    },
              ].map(({ icon, label, val }) => (
                <div key={label}
                  className="flex items-center justify-between px-3 py-2.5
                    bg-slate-800/60 border border-slate-700/60 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <svg className="w-3.5 h-3.5 text-blue-400 shrink-0"
                      fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        strokeWidth={2} d={icon} />
                    </svg>
                    <span className="text-xs text-slate-400">{label}</span>
                  </div>
                  <span className="text-sm font-bold text-white">{val}</span>
                </div>
              ))}
            </div>

            {/* Status badge */}
            <div className="mt-4 flex items-center gap-2 px-3 py-2.5
              bg-emerald-950/50 border border-emerald-900/50 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-400
                animate-pulse shrink-0" />
              <span className="text-xs text-emerald-400 font-medium">
                System Online
              </span>
              <span className="ml-auto text-[10px] text-emerald-600 font-medium">
                v1.0.0
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex flex-col sm:flex-row items-center
            justify-between gap-3">

            <p className="text-slate-500 text-xs text-center sm:text-left">
              © {new Date().getFullYear()}{" "}
              <span className="text-slate-400 font-medium">
                Port City International University
              </span>
              . All rights reserved.
            </p>

            {/* Developer credit */}
            <a href="https://github.com/einadid" target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5
                bg-slate-800 hover:bg-slate-700 border border-slate-700
                hover:border-slate-600 rounded-lg transition-all group">
              <span className="text-[10px] text-slate-500 font-medium
                group-hover:text-slate-400 transition-colors">
                Developed by
              </span>
              <svg className="w-3.5 h-3.5 text-slate-400
                group-hover:text-white transition-colors"
                fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              <span className="text-xs font-bold text-slate-300
                group-hover:text-white transition-colors">
                einadid
              </span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}