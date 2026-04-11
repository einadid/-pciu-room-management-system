'use client';

import { useState, useEffect, useRef } from 'react';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { DAYS } from '@/types';

interface Schedule {
  id: number;
  course_name: string;
  course_code: string | null;
  teacher_name: string | null;
  department: string;
  batch_name: string;
  section_name: string;
  sub_section: string | null;
  day_of_week: string;
  time_slot_id: number;
  class_type: string | null;
  session_id: string | null;
  rooms?: { id: number; room_name: string; building: string } | null;
  time_slots?: {
    id: number; slot_name: string;
    start_time: string; end_time: string;
  } | null;
}

interface BatchSection {
  department: string;
  batch_name: string;
  section_name: string;
  count: number;
}

interface ProcessedSchedule extends Schedule {
  isMultiSlot: boolean;
  slotSpan: number;
  isFirstSlot: boolean;
  sessionSlots: number[];
}

// ─── helpers ──────────────────────────────────────────────────────────────────
const getSubSectionStyle = (sub: string | null) => {
  if (!sub) return 'bg-slate-100 text-slate-600';
  const map: Record<string, string> = {
    '1': 'bg-sky-100 text-sky-700',
    '2': 'bg-emerald-100 text-emerald-700',
    '3': 'bg-amber-100 text-amber-700',
    '4': 'bg-violet-100 text-violet-700',
    '5': 'bg-rose-100 text-rose-700',
    '6': 'bg-teal-100 text-teal-700',
  };
  return map[sub.slice(-1)] ?? 'bg-slate-100 text-slate-600';
};

const getCardStyle = (ct: string | null) =>
  ct === 'Lab'
    ? {
        wrap: 'bg-emerald-50 border border-emerald-200 border-l-4 border-l-emerald-500',
        strip: 'bg-emerald-500',
        title: 'text-emerald-900',
        meta: 'text-emerald-700',
        code: 'text-emerald-500',
        badge: 'bg-emerald-100 text-emerald-700',
      }
    : {
        wrap: 'bg-blue-50 border border-blue-200 border-l-4 border-l-blue-500',
        strip: 'bg-blue-500',
        title: 'text-blue-900',
        meta: 'text-blue-700',
        code: 'text-blue-400',
        badge: 'bg-blue-100 text-blue-700',
      };

const getDeptColor = (dept: string) => {
  const colors = [
    'from-blue-500 to-indigo-600',
    'from-emerald-500 to-teal-600',
    'from-violet-500 to-purple-600',
    'from-rose-500 to-pink-600',
    'from-amber-500 to-orange-600',
    'from-cyan-500 to-sky-600',
  ];
  let h = 0;
  for (let i = 0; i < dept.length; i++) h = dept.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
};

const TIME_SLOTS = [
  { id: 1, name: 'Slot 1', time: '08:30', end: '09:55' },
  { id: 2, name: 'Slot 2', time: '10:00', end: '11:25' },
  { id: 3, name: 'Slot 3', time: '11:30', end: '12:55' },
  { id: 4, name: 'Slot 4', time: '13:30', end: '14:55' },
  { id: 5, name: 'Slot 5', time: '15:00', end: '16:25' },
  { id: 6, name: 'Slot 6', time: '16:30', end: '17:55' },
];

const SUB_PAL: Record<string, { bg: string; fg: string; border: string }> = {
  '1': { bg: '#f0f9ff', fg: '#0369a1', border: '#bae6fd' },
  '2': { bg: '#f0fdf4', fg: '#15803d', border: '#bbf7d0' },
  '3': { bg: '#fffbeb', fg: '#a16207', border: '#fde68a' },
  '4': { bg: '#f5f3ff', fg: '#6d28d9', border: '#ddd6fe' },
  '5': { bg: '#fff1f2', fg: '#be185d', border: '#fecdd3' },
  '6': { bg: '#f0fdfa', fg: '#0f766e', border: '#99f6e4' },
};

// ─── PNG card (inline styles only) ───────────────────────────────────────────
const buildPNGCard = (s: ProcessedSchedule): string => {
  const isLab    = s.class_type === 'Lab';
  const cardBg   = isLab ? '#ecfdf5' : '#eff6ff';
  const cardBrd  = isLab ? '#6ee7b7' : '#bfdbfe';
  const strip    = isLab ? '#059669' : '#3b82f6';
  const left     = s.isMultiSlot ? '#7c3aed' : strip;
  const titleClr = isLab ? '#064e3b' : '#1e3a8a';
  const metaClr  = isLab ? '#065f46' : '#1d4ed8';
  const codeClr  = isLab ? '#10b981' : '#60a5fa';

  const teacher = s.teacher_name
    ? `<div style="display:flex;align-items:flex-start;gap:6px;margin-bottom:6px;">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke="${metaClr}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          style="flex-shrink:0;margin-top:1px;">
          <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0z"/>
          <path d="M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
        </svg>
        <span style="font-size:12px;color:${metaClr};font-weight:500;
          line-height:1.5;word-break:break-word;">${s.teacher_name}</span>
      </div>` : '';

  const room = s.rooms?.room_name
    ? `<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke="${metaClr}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          style="flex-shrink:0;">
          <path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
          <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
        <span style="font-size:12px;color:${metaClr};font-weight:600;line-height:1.5;">
          ${s.rooms.room_name}</span>
      </div>` : '';

  const multi = s.isMultiSlot
    ? `<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke="#7c3aed" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          style="flex-shrink:0;">
          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <span style="font-size:12px;color:#7c3aed;font-weight:500;line-height:1.5;">
          ${s.slotSpan * 1.5}h (Slot ${s.sessionSlots.join('–')})</span>
      </div>` : '';

  let tags = '';
  if (s.sub_section) {
    const p = SUB_PAL[s.sub_section.slice(-1)] ?? { bg:'#f8fafc', fg:'#475569', border:'#e2e8f0' };
    tags += `<span style="display:inline-flex;align-items:center;background:${p.bg};
      color:${p.fg};border:1px solid ${p.border};font-size:11px;font-weight:700;
      padding:3px 8px;border-radius:4px;margin-right:4px;white-space:nowrap;">
      ${s.sub_section}</span>`;
  }
  if (isLab) {
    tags += `<span style="display:inline-flex;align-items:center;background:#d1fae5;
      color:#065f46;border:1px solid #6ee7b7;font-size:11px;font-weight:700;
      padding:3px 8px;border-radius:4px;white-space:nowrap;">Lab</span>`;
  } else if (s.class_type) {
    tags += `<span style="display:inline-flex;align-items:center;background:#dbeafe;
      color:#1e40af;border:1px solid #bfdbfe;font-size:11px;font-weight:700;
      padding:3px 8px;border-radius:4px;white-space:nowrap;">${s.class_type}</span>`;
  }

  return `
    <div style="background:${cardBg};border:1.5px solid ${cardBrd};
      border-left:3px solid ${left};border-radius:8px;overflow:hidden;
      margin-bottom:8px;box-shadow:0 1px 3px rgba(0,0,0,0.07);box-sizing:border-box;">
      <div style="height:3px;background:${strip};"></div>
      <div style="padding:10px 12px;">
        <div style="font-size:13px;font-weight:700;color:${titleClr};
          line-height:1.5;word-break:break-word;
          margin-bottom:${s.course_code ? '3px' : '8px'};">${s.course_name}</div>
        ${s.course_code
          ? `<div style="font-size:11px;color:${codeClr};font-weight:500;
              margin-bottom:8px;">${s.course_code}</div>` : ''}
        ${teacher}${room}${multi}
        ${tags ? `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px;">${tags}</div>` : ''}
      </div>
    </div>`;
};

const buildPNGHTML = (
  filters: { dept: string; batch: string; section: string },
  grid: Record<string, Record<number, ProcessedSchedule[]>>,
  stats: { unique: number; theories: number; labs: number; total: number }
): string => {
  const W   = 1600;
  const TW  = 140;
  const PAD = 20;
  const DW  = Math.floor((W - TW - PAD * 2) / DAYS.length);

  const dayHeaders = DAYS.map((d) => `
    <th style="border:1px solid #334155;padding:14px 8px;font-size:13px;
      font-weight:700;color:#fff;text-align:center;background:#1e293b;
      width:${DW}px;min-width:${DW}px;letter-spacing:.05em;box-sizing:border-box;">
      ${d}</th>`).join('');

  const rows = TIME_SLOTS.map((slot, ri) => {
    const bg = ri % 2 === 0 ? '#ffffff' : '#f8fafc';
    const cells = DAYS.map((day) => {
      const all  = grid[day]?.[slot.id] ?? [];
      const disp = all.filter((s) => !s.isMultiSlot || s.isFirstSlot);
      const cont = all.filter((s) => s.isMultiSlot && !s.isFirstSlot);
      let inner = '', cellBg = bg;

      if (disp.length > 0) {
        inner = disp.map(buildPNGCard).join('');
      } else if (cont.length > 0) {
        cellBg = '#faf5ff';
        inner = `<div style="display:flex;flex-direction:column;align-items:center;
          justify-content:center;min-height:90px;color:#8b5cf6;font-size:13px;
          font-weight:500;text-align:center;">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="#8b5cf6" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round" style="margin-bottom:5px;">
            <path d="M5 15l7-7 7 7"/></svg>Continued</div>`;
      } else {
        inner = `<div style="display:flex;align-items:center;justify-content:center;
          min-height:90px;color:#e2e8f0;font-size:24px;">—</div>`;
      }

      return `<td style="border:1px solid #e2e8f0;padding:8px;vertical-align:top;
        background:${cellBg};width:${DW}px;min-width:${DW}px;max-width:${DW}px;
        overflow:hidden;word-break:break-word;box-sizing:border-box;">${inner}</td>`;
    }).join('');

    return `<tr>
      <td style="border:1px solid #e2e8f0;padding:0;background:#1e293b;
        vertical-align:middle;width:${TW}px;min-width:${TW}px;box-sizing:border-box;">
        <div style="padding:14px 16px;">
          <div style="font-weight:800;font-size:14px;color:#f1f5f9;
            margin-bottom:6px;">${slot.name}</div>
          <div style="font-size:12px;font-weight:700;color:#ffffff;
            margin-bottom:2px;">${slot.time}</div>
          <div style="font-size:11px;color:#94a3b8;">– ${slot.end}</div>
        </div>
      </td>${cells}</tr>`;
  }).join('');

  const footerItems = [
    { dot:'#64748b', label:'Total Classes', val: stats.unique   },
    { dot:'#3b82f6', label:'Theory',        val: stats.theories },
    { dot:'#10b981', label:'Lab',            val: stats.labs    },
    { dot:'#f59e0b', label:'Total Slots',   val: stats.total   },
  ].map(({ dot, label, val }) => `
    <div style="display:flex;align-items:center;gap:7px;">
      <span style="display:inline-block;width:10px;height:10px;
        border-radius:50%;background:${dot};"></span>
      <span style="font-size:13px;color:#64748b;">
        ${label}: <b style="color:#1e293b;">${val}</b></span>
    </div>`).join('');

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<style>
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Segoe UI',Arial,sans-serif;background:#fff;
    width:${W}px;-webkit-font-smoothing:antialiased;}
  table{border-collapse:collapse;table-layout:fixed;}
  td,th{overflow:hidden;}
</style></head><body>

<div style="background:linear-gradient(135deg,#0f172a,#1e293b,#0f172a);
  padding:38px ${PAD}px 32px;text-align:center;">
  <div style="font-size:28px;font-weight:800;color:#fff;
    letter-spacing:-.02em;margin-bottom:8px;">
    Port City International University</div>
  <div style="width:80px;height:2px;margin:0 auto 10px;
    background:linear-gradient(to right,transparent,#60a5fa,transparent);"></div>
  <div style="font-size:11px;color:#94a3b8;letter-spacing:.14em;
    text-transform:uppercase;font-weight:600;margin-bottom:28px;">Class Schedule</div>
  <div style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap;">
    ${[filters.dept, filters.batch, `Section ${filters.section}`].map((t) => `
      <div style="display:inline-flex;align-items:center;
        background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);
        padding:10px 26px;border-radius:8px;">
        <span style="font-size:14px;font-weight:600;color:#fff;">${t}</span>
      </div>`).join('')}
  </div>
</div>

<div style="background:#f8fafc;border-bottom:2px solid #e2e8f0;
  padding:13px ${PAD}px;display:flex;align-items:center;
  justify-content:center;gap:36px;flex-wrap:wrap;">
  ${[
    { bg:'#eff6ff', brd:'#bfdbfe', left:'#3b82f6', label:'Theory Class'       },
    { bg:'#ecfdf5', brd:'#6ee7b7', left:'#059669', label:'Lab Class'          },
    { bg:'#f5f3ff', brd:'#ddd6fe', left:'#7c3aed', label:'Multi-slot Session' },
  ].map(({ bg, brd, left, label }) => `
    <div style="display:flex;align-items:center;gap:9px;">
      <span style="display:inline-block;width:20px;height:16px;
        background:${bg};border:1.5px solid ${brd};
        border-left:3px solid ${left};border-radius:3px;"></span>
      <span style="font-size:13px;color:#475569;font-weight:500;">${label}</span>
    </div>`).join('')}
</div>

<div style="padding:16px ${PAD}px;background:#fff;">
  <table style="width:${W - PAD * 2}px;border-collapse:collapse;table-layout:fixed;">
    <colgroup>
      <col style="width:${TW}px;"/>
      ${DAYS.map(() => `<col style="width:${DW}px;"/>`).join('')}
    </colgroup>
    <thead><tr>
      <th style="border:1px solid #334155;padding:14px 12px;font-size:12px;
        font-weight:700;color:#fff;text-align:left;background:#1e293b;
        width:${TW}px;min-width:${TW}px;box-sizing:border-box;">TIME</th>
      ${dayHeaders}
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>
</div>

<div style="background:#f1f5f9;border-top:2px solid #e2e8f0;
  padding:16px ${PAD}px;display:flex;justify-content:space-between;
  align-items:center;flex-wrap:wrap;gap:12px;">
  <div style="display:flex;gap:30px;flex-wrap:wrap;align-items:center;">
    ${footerItems}
  </div>
  <div style="font-size:12px;color:#94a3b8;">
    Generated: ${new Date().toLocaleDateString('en-US', {
      weekday:'long', year:'numeric', month:'long', day:'numeric',
    })}
  </div>
</div>
</body></html>`;
};

// ══════════════════════════════════════════════════════════════════════════════
export default function PublicRoutinePage() {
  const [allSchedules, setAllSchedules]           = useState<Schedule[]>([]);
  const [batchSections, setBatchSections]         = useState<BatchSection[]>([]);
  const [selectedSchedules, setSelectedSchedules] = useState<Schedule[]>([]);
  const [filters, setFilters]  = useState({ dept:'', batch:'', section:'' });
  const [loading, setLoading]  = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [showRoutine, setShowRoutine] = useState(false);
  // mobile: which day tab is active
  const [activeDay, setActiveDay] = useState(0);
  // desktop vs mobile view toggle handled by CSS
  const routineRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    if (filters.dept && filters.batch && filters.section) {
      setSelectedSchedules(
        allSchedules.filter(
          (s) =>
            s.department   === filters.dept  &&
            s.batch_name   === filters.batch &&
            s.section_name === filters.section
        )
      );
      setShowRoutine(true);
      // default to today if available
     const todayIdx = DAYS.indexOf(
  new Date().toLocaleDateString('en-US', { weekday: 'long' }) as (typeof DAYS)[number]
);
      setActiveDay(todayIdx >= 0 ? todayIdx : 0);
    } else {
      setSelectedSchedules([]);
      setShowRoutine(false);
    }
  }, [filters, allSchedules]);

  const fetchAll = async () => {
    try {
      const res  = await fetch('/api/schedules');
      const data = await res.json();
      if (data.success) {
        setAllSchedules(data.data);
        const uniq: Record<string, BatchSection> = {};
        (data.data as Schedule[]).forEach((s) => {
          if (s.batch_name && s.section_name) {
            const k = `${s.department}-${s.batch_name}-${s.section_name}`;
            if (!uniq[k]) uniq[k] = {
              department: s.department, batch_name: s.batch_name,
              section_name: s.section_name, count: 0,
            };
            uniq[k].count++;
          }
        });
        setBatchSections(Object.values(uniq));
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const departments = [...new Set(batchSections.map((b) => b.department))];
  const batches = [...new Set(
    batchSections.filter((b) => !filters.dept || b.department === filters.dept)
      .map((b) => b.batch_name)
  )];
  const sections = [...new Set(
    batchSections.filter((b) =>
      (!filters.dept  || b.department === filters.dept) &&
      (!filters.batch || b.batch_name  === filters.batch)
    ).map((b) => b.section_name)
  )];

  // ── process ──
  const processSchedules = (): Map<string, ProcessedSchedule[]> => {
    const sessionMap = new Map<string, Schedule[]>();
    selectedSchedules.forEach((s) => {
      if (s.session_id) {
        if (!sessionMap.has(s.session_id)) sessionMap.set(s.session_id, []);
        sessionMap.get(s.session_id)!.push(s);
      }
    });
    const out = new Map<string, ProcessedSchedule[]>();
    selectedSchedules.forEach((schedule) => {
      const key = `${schedule.day_of_week}-${schedule.time_slot_id}`;
      if (!out.has(key)) out.set(key, []);
      let isMultiSlot = false, slotSpan = 1, isFirstSlot = true;
      let sessionSlots = [schedule.time_slot_id];
      if (schedule.session_id && sessionMap.has(schedule.session_id)) {
        const grp = sessionMap.get(schedule.session_id)!;
        if (grp.length > 1) {
          isMultiSlot  = true; slotSpan = grp.length;
          sessionSlots = grp.map((s) => s.time_slot_id).sort((a,b) => a-b);
          isFirstSlot  = schedule.time_slot_id === sessionSlots[0];
        }
      }
      out.get(key)!.push({ ...schedule, isMultiSlot, slotSpan, isFirstSlot, sessionSlots });
    });
    return out;
  };

  const buildGrid = () => {
    const grid: Record<string, Record<number, ProcessedSchedule[]>> = {};
    DAYS.forEach((day) => { grid[day] = {}; for (let i=1;i<=6;i++) grid[day][i]=[]; });
    processSchedules().forEach((schedules, key) => {
      const [day, slotStr] = key.split('-');
      const slot = parseInt(slotStr);
      if (grid[day]?.[slot] !== undefined) grid[day][slot] = schedules;
    });
    return grid;
  };

  const scheduleGrid = buildGrid();

  const getUniqueCount = () => {
    const seen = new Set<string>(); let n = 0;
    selectedSchedules.forEach((s) => {
      if (s.session_id) { if (!seen.has(s.session_id)) { seen.add(s.session_id); n++; } }
      else n++;
    });
    return n;
  };

  const getTypeCounts = () => {
    const seen = new Set<string>(); let labs=0, theories=0;
    selectedSchedules.forEach((s) => {
      const k = s.session_id ?? `_${s.id}`;
      if (!seen.has(k)) { seen.add(k); if(s.class_type==='Lab') labs++; else theories++; }
    });
    return { labs, theories };
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const grid = buildGrid();
      const { labs, theories } = getTypeCounts();
      const html = buildPNGHTML(filters, grid, {
        unique: getUniqueCount(), theories, labs, total: selectedSchedules.length,
      });
      const res = await fetch('/api/download-routine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html }),
      });
      if (!res.ok) throw new Error('Server error');
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url;
      a.download = `Routine_${filters.dept}_${filters.batch}_Sec${filters.section}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Download failed. Please try again.');
    } finally { setDownloading(false); }
  };

const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' }) as (typeof DAYS)[number];

  // ── schedule card (shared UI component) ──────────────────────────────────
  const ScheduleCard = ({ schedule }: { schedule: ProcessedSchedule }) => {
    const cs    = getCardStyle(schedule.class_type);
    const isLab = schedule.class_type === 'Lab';
    return (
      <div className={`rounded-xl overflow-hidden shadow-sm ${cs.wrap}
        ${schedule.isMultiSlot ? 'border-l-violet-500' : ''}`}>
        <div className={`h-1 w-full ${cs.strip}`} />
        <div className="p-3">
          <p className={`font-bold text-sm leading-snug mb-1 break-words ${cs.title}`}>
            {schedule.course_name}
          </p>
          {schedule.course_code && (
            <p className={`text-xs font-medium mb-2 ${cs.code}`}>
              {schedule.course_code}
            </p>
          )}
          {schedule.teacher_name && (
            <div className={`flex items-start gap-1.5 text-xs mb-1 ${cs.meta}`}>
              <svg className="w-3.5 h-3.5 flex-shrink-0 mt-px" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              <span className="break-words leading-snug font-medium">
                {schedule.teacher_name}
              </span>
            </div>
          )}
          {schedule.rooms?.room_name && (
            <div className={`flex items-center gap-1.5 text-xs mb-1 font-semibold ${cs.meta}`}>
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              {schedule.rooms.room_name}
            </div>
          )}
          {schedule.isMultiSlot && (
            <div className="flex items-center gap-1.5 text-xs text-violet-600 font-medium mb-1">
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              {schedule.slotSpan * 1.5}h · Slot {schedule.sessionSlots.join('–')}
            </div>
          )}
          <div className="flex flex-wrap gap-1 mt-2">
            {schedule.sub_section && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold
                ${getSubSectionStyle(schedule.sub_section)}`}>
                {schedule.sub_section}
              </span>
            )}
            {schedule.class_type && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${cs.badge}`}>
                {schedule.class_type}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2
          border-blue-600 mx-auto" />
        <p className="mt-4 text-gray-500 text-sm">Loading routines...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-full mx-auto px-3 sm:px-4 py-6 sm:py-8">

      {/* ── Header ── */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2 tracking-tight">
          Class Routine
        </h1>
        <p className="text-gray-500 text-sm sm:text-base">
          Browse and download class schedules
        </p>
      </div>

      {/* ── Quick select ── */}
      {batchSections.length > 0 && !showRoutine && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 bg-blue-600 rounded-full" />
            <h2 className="text-base sm:text-lg font-semibold text-gray-800">
              Available Routines
            </h2>
            <span className="text-sm text-gray-400">({batchSections.length})</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4
            lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
            {batchSections.map((bs, i) => (
              <button key={i} onClick={() =>
                setFilters({ dept:bs.department, batch:bs.batch_name, section:bs.section_name })}
                className="group relative bg-white border border-gray-200 rounded-xl p-3
                  text-left cursor-pointer hover:shadow-md hover:border-blue-300
                  hover:-translate-y-0.5 transition-all duration-200 overflow-hidden
                  active:scale-95">
                <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-xl
                  bg-gradient-to-r ${getDeptColor(bs.department)}`} />
                <p className="text-[10px] font-medium text-gray-400 mt-1 mb-1 truncate">
                  {bs.department}
                </p>
                <p className="font-bold text-gray-900 text-sm group-hover:text-blue-600
                  transition-colors leading-tight">{bs.batch_name}</p>
                <p className="text-xs text-gray-500 mt-0.5">Sec {bs.section_name}</p>
                <p className="text-[10px] text-gray-400 mt-1">{bs.count} slots</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Filters ── */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 mb-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
          <Select label="Department" value={filters.dept}
            onChange={(e) => setFilters({ dept:e.target.value, batch:'', section:'' })}
            options={departments.map((d) => ({ value:d, label:d }))}
            placeholder="Select department" />
          {filters.dept && (
            <Select label="Batch" value={filters.batch}
              onChange={(e) => setFilters({ ...filters, batch:e.target.value, section:'' })}
              options={batches.map((b) => ({ value:b, label:b }))}
              placeholder="Select batch" />
          )}
          {filters.batch && (
            <Select label="Section" value={filters.section}
              onChange={(e) => setFilters({ ...filters, section:e.target.value })}
              options={sections.map((s) => ({ value:s, label:`Section ${s}` }))}
              placeholder="Select section" />
          )}
        </div>
        {showRoutine && (
          <div className="flex flex-wrap gap-2 sm:gap-3 pt-3 border-t border-gray-100">
            <Button onClick={handleDownload} disabled={downloading}>
              {downloading ? (
                <span className="flex items-center gap-2 text-sm">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>Generating…
                </span>
              ) : (
                <span className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                  </svg>Download PNG
                </span>
              )}
            </Button>
            <Button variant="secondary" onClick={() => {
              setFilters({ dept:'', batch:'', section:'' }); setShowRoutine(false);
            }}>
              <span className="text-sm">✕ Clear</span>
            </Button>
          </div>
        )}
      </div>

      {/* ══════════════════════ ROUTINE ══════════════════════ */}
      {showRoutine && (
        <div ref={routineRef}
          className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

          {/* Header banner */}
          <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800
            text-white px-4 sm:px-8 py-5 sm:py-7 text-center">
            <h2 className="text-lg sm:text-2xl font-bold tracking-tight mb-1">
              Port City International University
            </h2>
            <div className="w-16 sm:w-24 h-px bg-gradient-to-r from-transparent
              via-blue-400 to-transparent mx-auto my-2" />
            <p className="text-slate-400 text-[10px] sm:text-xs font-medium
              tracking-widest uppercase mb-3 sm:mb-4">Class Schedule</p>
            <div className="flex justify-center gap-2 flex-wrap">
              {[filters.dept, filters.batch, `Section ${filters.section}`].map((t) => (
                <span key={t} className="bg-white/10 border border-white/15 text-white
                  text-xs sm:text-sm font-medium px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {selectedSchedules.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">📭</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">No Classes Found</h3>
              <p className="text-gray-400 text-sm">No schedules for this section yet.</p>
            </div>
          ) : (
            <>
             {/* ════════════════════════════════════════
    MOBILE VIEW — Same table, horizontal scroll
    ════════════════════════════════════════ */}
<div className="block lg:hidden">
  {/* Legend */}
  <div className="bg-slate-50 border-b border-slate-200 px-3 py-2">
    <div className="flex flex-wrap gap-3 justify-center">
      {[
        { cls: 'bg-blue-50 border-l-2 border-l-blue-500 border border-blue-200', label: 'Theory' },
        { cls: 'bg-emerald-50 border-l-2 border-l-emerald-500 border border-emerald-200', label: 'Lab' },
        { cls: 'bg-violet-50 border-l-2 border-l-violet-500 border border-violet-200', label: 'Multi-slot' },
      ].map(({ cls, label }) => (
        <div key={label} className="flex items-center gap-1.5">
          <span className={`w-4 h-3 rounded-sm inline-block ${cls}`} />
          <span className="text-[11px] text-slate-500 font-medium">{label}</span>
        </div>
      ))}
      {DAYS.includes(todayName as (typeof DAYS)[number]) && (
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
          <span className="text-[11px] text-slate-500 font-medium">Today</span>
        </div>
      )}
    </div>
  </div>

  {/* Scroll hint */}
  <div className="flex items-center justify-center gap-1.5 py-1.5
    bg-slate-100 border-b border-slate-200">
    <svg className="w-3.5 h-3.5 text-slate-400" fill="none"
      viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
    </svg>
    <span className="text-[10px] text-slate-400 font-medium">
      Scroll left / right to see all days
    </span>
  </div>

  {/* The exact same table as desktop */}
  <div className="overflow-x-auto">
    <table className="border-collapse"
      style={{ minWidth: `${DAYS.length * 160 + 110}px`, width: '100%' }}>
      <thead>
        <tr>
          {/* Time header */}
          <th className="bg-slate-800 text-white border border-slate-700
            px-3 py-3 text-left text-[11px] font-bold uppercase tracking-wider
            sticky left-0 z-20"
            style={{ minWidth: '110px', width: '110px' }}>
            <div className="flex items-center gap-1.5">
              <svg className="w-3 h-3 text-slate-400" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>Time</span>
            </div>
          </th>

          {/* Day headers */}
          {DAYS.map((day) => {
            const isToday = day === todayName;
            return (
              <th key={day}
                className={`border border-slate-700 px-2 py-3 text-center
                  text-[11px] font-bold uppercase tracking-wider
                  ${isToday ? 'bg-amber-500 text-white' : 'bg-slate-800 text-white'}`}
                style={{ minWidth: '160px' }}>
                <div className="flex items-center justify-center gap-1">
                  {isToday && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  )}
                  <span>{day}</span>
                </div>
                {isToday && (
                  <span className="text-[9px] bg-white/20 px-1.5 py-0.5
                    rounded-full font-medium normal-case mt-0.5 inline-block">
                    Today
                  </span>
                )}
              </th>
            );
          })}
        </tr>
      </thead>

      <tbody>
        {TIME_SLOTS.map((slot, ri) => (
          <tr key={slot.id}>
            {/* Time cell — sticky */}
            <td className="border border-slate-200 p-0 align-middle
              sticky left-0 z-10 bg-slate-800"
              style={{ minWidth: '110px', width: '110px' }}>
              <div className="px-3 py-3">
                <div className="inline-flex items-center gap-1
                  bg-blue-600 text-white text-[10px] font-bold
                  px-2 py-0.5 rounded-full mb-2 shadow-sm">
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  {slot.name}
                </div>
                <div className="text-white font-bold text-xs tabular-nums">
                  {slot.time}
                </div>
                <div className="text-slate-400 text-[10px] tabular-nums mt-0.5">
                  – {slot.end}
                </div>
                <div className="mt-1.5">
                  <span className="text-[9px] text-slate-500 bg-slate-700
                    px-1.5 py-0.5 rounded-full border border-slate-600">
                    85 min
                  </span>
                </div>
              </div>
            </td>

            {/* Day cells */}
            {DAYS.map((day) => {
              const isToday = day === todayName;
              const all     = scheduleGrid[day]?.[slot.id] ?? [];
              const display = all.filter((s) => !s.isMultiSlot || s.isFirstSlot);
              const cont    = all.filter((s) => s.isMultiSlot && !s.isFirstSlot);
              const rowBg   = ri % 2 === 0 ? 'bg-white' : 'bg-slate-50/50';

              return (
                <td key={day}
                  className={`border px-1.5 py-1.5 align-top
                    ${isToday
                      ? 'border-amber-200 bg-amber-50/30'
                      : `border-slate-200 ${rowBg}`}`}
                  style={{ minWidth: '160px' }}>

                  {display.length > 0 ? (
                    <div className="space-y-1.5">
                      {display.map((s) => (
                        <ScheduleCard key={s.id} schedule={s} />
                      ))}
                    </div>

                  ) : cont.length > 0 ? (
                    <div className="flex flex-col items-center justify-center
                      min-h-[70px] text-violet-400">
                      <div className="w-7 h-7 rounded-full bg-violet-100
                        border border-violet-200 flex items-center justify-center mb-1">
                        <svg className="w-3.5 h-3.5" fill="none"
                          viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round"
                            strokeWidth={2} d="M5 15l7-7 7 7"/>
                        </svg>
                      </div>
                      <span className="text-[10px] font-medium">Continued</span>
                    </div>

                  ) : (
                    <div className="flex items-center justify-center min-h-[70px]">
                      <span className="text-slate-200 text-xl select-none">—</span>
                    </div>
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>

              {/* ════════════════════════════════════════
                  DESKTOP VIEW — full scrollable table
                  ════════════════════════════════════════ */}
              <div className="hidden lg:block">
                {/* Legend */}
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5">
                  <div className="flex flex-wrap gap-4 justify-center text-xs font-medium">
                    {[
                      { cls:'bg-blue-50 border-l-2 border-l-blue-500 border border-blue-200',
                        label:'Theory' },
                      { cls:'bg-emerald-50 border-l-2 border-l-emerald-500 border border-emerald-200',
                        label:'Lab' },
                      { cls:'bg-violet-50 border-l-2 border-l-violet-500 border border-violet-200',
                        label:'Multi-slot' },
                    ].map(({ cls, label }) => (
                      <div key={label} className="flex items-center gap-1.5">
                        <span className={`w-5 h-3 rounded-sm inline-block ${cls}`} />
                        <span className="text-slate-600">{label}</span>
                      </div>
                    ))}
                    {DAYS.includes(todayName) && (
                      <div className="flex items-center gap-1.5 ml-2 pl-3
                        border-l border-slate-300">
                        <span className="w-3 h-3 rounded-full bg-amber-400
                          inline-block animate-pulse" />
                        <span className="text-slate-600">Today ({todayName})</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="border-collapse w-full"
                    style={{ minWidth:`${DAYS.length * 220 + 160}px` }}>
                    <thead>
                      <tr>
                        <th className="bg-slate-800 text-white border border-slate-700
                          px-4 py-3 text-left text-xs font-bold uppercase tracking-wider
                          sticky left-0 z-20" style={{ minWidth:'160px', width:'160px' }}>
                          Time
                        </th>
                        {DAYS.map((day) => {
                          const isToday = day === todayName;
                          return (
                            <th key={day}
                              className={`border border-slate-700 px-3 py-3 text-center
                                text-xs font-bold uppercase tracking-wider
                                ${isToday ? 'bg-amber-500 text-white' : 'bg-slate-800 text-white'}`}
                              style={{ minWidth:'220px' }}>
                              <div className="flex items-center justify-center gap-1.5">
                                {isToday && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-white
                                    animate-pulse" />
                                )}
                                {day}
                                {isToday && (
                                  <span className="text-[10px] bg-white/20 px-1.5 py-0.5
                                    rounded-full normal-case font-medium">Today</span>
                                )}
                              </div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {TIME_SLOTS.map((slot, ri) => (
                        <tr key={slot.id}>
                          {/* Time cell */}
                          <td className="border border-slate-200 p-0 align-middle
                            sticky left-0 z-10 bg-slate-800"
                            style={{ minWidth:'160px', width:'160px' }}>
                            <div className="px-4 py-4">
                              <div className="inline-flex items-center gap-1.5
                                bg-blue-600 text-white text-xs font-bold
                                px-2.5 py-1 rounded-full mb-2.5 shadow-sm">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24"
                                  stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round"
                                    strokeWidth={2.5}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                {slot.name}
                              </div>
                              <div className="text-sm font-bold text-white tabular-nums">
                                {slot.time}
                              </div>
                              <div className="text-xs text-slate-400 mt-0.5 tabular-nums">
                                – {slot.end}
                              </div>
                              <div className="mt-2">
                                <span className="text-[10px] text-slate-400 bg-slate-700
                                  px-2 py-0.5 rounded-full border border-slate-600">
                                  85 min
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Day cells */}
                          {DAYS.map((day) => {
                            const isToday = day === todayName;
                            const all     = scheduleGrid[day]?.[slot.id] ?? [];
                            const display = all.filter((s) => !s.isMultiSlot || s.isFirstSlot);
                            const cont    = all.filter((s) => s.isMultiSlot && !s.isFirstSlot);
                            const rowBg   = ri % 2 === 0 ? 'bg-white' : 'bg-slate-50/50';

                            return (
                              <td key={day}
                                className={`border px-2 py-2 align-top
                                  ${isToday
                                    ? 'border-amber-200 bg-amber-50/30'
                                    : `border-slate-200 ${rowBg}`}`}
                                style={{ minWidth:'220px' }}>
                                {display.length > 0 ? (
                                  <div className="space-y-2">
                                    {display.map((s) => (
                                      <ScheduleCard key={s.id} schedule={s} />
                                    ))}
                                  </div>
                                ) : cont.length > 0 ? (
                                  <div className="flex flex-col items-center
                                    justify-center min-h-[80px] text-violet-400">
                                    <div className="w-9 h-9 rounded-full bg-violet-100
                                      border border-violet-200 flex items-center
                                      justify-center mb-1">
                                      <svg className="w-4 h-4" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round"
                                          strokeWidth={2} d="M5 15l7-7 7 7"/>
                                      </svg>
                                    </div>
                                    <span className="text-[11px] font-medium">Continued</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center
                                    min-h-[80px]">
                                    <span className="text-slate-200 text-2xl select-none">
                                      —
                                    </span>
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Footer stats */}
              <div className="bg-slate-50 border-t border-slate-200 px-4 sm:px-6 py-4">
                <div className="flex flex-wrap justify-between items-center gap-3">
                  <div className="flex flex-wrap gap-3 sm:gap-5 text-xs sm:text-sm">
                    {[
                      { dot:'bg-slate-400',   label:'Classes', val: getUniqueCount()         },
                      { dot:'bg-blue-400',    label:'Theory',  val: getTypeCounts().theories  },
                      { dot:'bg-emerald-400', label:'Lab',     val: getTypeCounts().labs      },
                      { dot:'bg-amber-400',   label:'Slots',   val: selectedSchedules.length  },
                    ].map(({ dot, label, val }) => (
                      <div key={label} className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${dot}`} />
                        <span className="text-slate-500">
                          {label}:{' '}
                          <span className="font-semibold text-slate-800">{val}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] sm:text-xs text-slate-400">
                    {new Date().toLocaleDateString('en-US', {
                      weekday:'short', month:'short', day:'numeric', year:'numeric',
                    })}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Empty state */}
      {!showRoutine && batchSections.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-12 sm:p-16 text-center">
          <div className="text-5xl sm:text-6xl mb-4">📅</div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
            No Routines Available
          </h3>
          <p className="text-gray-400 max-w-sm mx-auto text-sm">
            No class schedules added yet. Check back later.
          </p>
        </div>
      )}
    </div>
  );
}