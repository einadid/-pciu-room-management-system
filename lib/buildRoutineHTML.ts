// lib/buildRoutineHTML.ts

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
}

interface ProcessedSchedule extends Schedule {
  isMultiSlot: boolean;
  slotSpan: number;
  isFirstSlot: boolean;
  sessionSlots: number[];
}

const DAYS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];

const TIME_SLOTS = [
  { id: 1, name: 'Slot 1', time: '08:30 – 09:55' },
  { id: 2, name: 'Slot 2', time: '10:00 – 11:25' },
  { id: 3, name: 'Slot 3', time: '11:30 – 12:55' },
  { id: 4, name: 'Slot 4', time: '13:30 – 14:55' },
  { id: 5, name: 'Slot 5', time: '15:00 – 16:25' },
  { id: 6, name: 'Slot 6', time: '16:30 – 17:55' },
];

const SUB_PAL: Record<string, { bg: string; fg: string; border: string }> = {
  '1': { bg: '#f0f9ff', fg: '#0369a1', border: '#bae6fd' },
  '2': { bg: '#f0fdf4', fg: '#15803d', border: '#bbf7d0' },
  '3': { bg: '#fffbeb', fg: '#a16207', border: '#fde68a' },
  '4': { bg: '#f5f3ff', fg: '#6d28d9', border: '#ddd6fe' },
  '5': { bg: '#fff1f2', fg: '#be185d', border: '#fecdd3' },
  '6': { bg: '#f0fdfa', fg: '#0f766e', border: '#99f6e4' },
};

const buildCard = (s: ProcessedSchedule): string => {
  const isLab    = s.class_type === 'Lab';
  const cardBg   = isLab ? '#ecfdf5' : '#eff6ff';
  const cardBrd  = isLab ? '#6ee7b7' : '#bfdbfe';
  const strip    = isLab ? '#059669' : '#3b82f6';
  const leftBrd  = s.isMultiSlot ? '#7c3aed' : strip;
  const titleClr = isLab ? '#064e3b' : '#1e3a8a';
  const metaClr  = isLab ? '#065f46' : '#1d4ed8';
  const codeClr  = isLab ? '#10b981' : '#60a5fa';

  const teacherRow = s.teacher_name
    ? `<div style="display:flex;align-items:flex-start;gap:6px;margin-bottom:6px;">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke="${metaClr}" stroke-width="2" stroke-linecap="round"
          stroke-linejoin="round" style="flex-shrink:0;margin-top:1px;">
          <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0z"/>
          <path d="M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
        </svg>
        <span style="font-size:11.5px;color:${metaClr};font-weight:500;
          line-height:1.5;word-break:break-word;">${s.teacher_name}</span>
      </div>`
    : '';

  const roomRow = s.rooms?.room_name
    ? `<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke="${metaClr}" stroke-width="2" stroke-linecap="round"
          stroke-linejoin="round" style="flex-shrink:0;">
          <path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
          <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
        <span style="font-size:11.5px;color:${metaClr};font-weight:600;
          line-height:1.5;">${s.rooms.room_name}</span>
      </div>`
    : '';

  const multiRow = s.isMultiSlot
    ? `<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke="#7c3aed" stroke-width="2" stroke-linecap="round"
          stroke-linejoin="round" style="flex-shrink:0;">
          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <span style="font-size:11.5px;color:#7c3aed;font-weight:500;line-height:1.5;">
          ${s.slotSpan * 1.5}h &nbsp;(Slot&nbsp;${s.sessionSlots.join('–')})
        </span>
      </div>`
    : '';

  let tags = '';
  if (s.sub_section) {
    const p = SUB_PAL[s.sub_section.slice(-1)] ?? { bg: '#f8fafc', fg: '#475569', border: '#e2e8f0' };
    tags += `<span style="
      display:inline-flex;align-items:center;gap:3px;
      background:${p.bg};color:${p.fg};border:1px solid ${p.border};
      font-size:10px;font-weight:700;padding:2px 7px;
      border-radius:4px;margin-right:4px;white-space:nowrap;">${s.sub_section}</span>`;
  }
  if (isLab) {
    tags += `<span style="
      display:inline-flex;align-items:center;
      background:#d1fae5;color:#065f46;border:1px solid #6ee7b7;
      font-size:10px;font-weight:700;padding:2px 7px;
      border-radius:4px;white-space:nowrap;">Lab</span>`;
  } else if (s.class_type) {
    tags += `<span style="
      display:inline-flex;align-items:center;
      background:#dbeafe;color:#1e40af;border:1px solid #bfdbfe;
      font-size:10px;font-weight:700;padding:2px 7px;
      border-radius:4px;white-space:nowrap;">${s.class_type}</span>`;
  }

  return `
    <div style="
      background:${cardBg};
      border:1.5px solid ${cardBrd};
      border-left:3px solid ${leftBrd};
      border-radius:8px;
      overflow:hidden;
      margin-bottom:7px;
      box-shadow:0 1px 3px rgba(0,0,0,0.07);
      box-sizing:border-box;
    ">
      <div style="height:3px;background:${strip};"></div>
      <div style="padding:10px 11px;">
        <div style="
          font-size:12.5px;font-weight:700;color:${titleClr};
          line-height:1.5;word-break:break-word;
          margin-bottom:${s.course_code ? '3px' : '8px'};">
          ${s.course_name}
        </div>
        ${s.course_code
          ? `<div style="font-size:10.5px;color:${codeClr};font-weight:500;
              margin-bottom:8px;line-height:1.4;">${s.course_code}</div>`
          : ''}
        ${teacherRow}${roomRow}${multiRow}
        ${tags
          ? `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:5px;">${tags}</div>`
          : ''}
      </div>
    </div>`;
};

export function buildRoutineHTML(
  filters: { dept: string; batch: string; section: string },
  scheduleGrid: Record<string, Record<number, ProcessedSchedule[]>>,
  stats: { uniqueCount: number; theories: number; labs: number; totalSlots: number }
): string {
  const PAGE_W = 1600;
  const TIME_W = 130;
  const H_PAD  = 20;
  const DAY_W  = Math.floor((PAGE_W - TIME_W - H_PAD * 2) / DAYS.length);

  const dayHeaders = DAYS.map((day) => `
    <th style="
      border:1px solid #334155;padding:14px 8px;
      font-size:13px;font-weight:700;color:#ffffff;
      text-align:center;background:#1e293b;
      width:${DAY_W}px;min-width:${DAY_W}px;
      letter-spacing:0.06em;box-sizing:border-box;">
      ${day}
    </th>`).join('');

  const tableRows = TIME_SLOTS.map((slot, ri) => {
    const rowBg = ri % 2 === 0 ? '#ffffff' : '#f8fafc';

    const cells = DAYS.map((day) => {
      const all       = scheduleGrid[day]?.[slot.id] ?? [];
      const display   = all.filter((s) => !s.isMultiSlot || s.isFirstSlot);
      const continued = all.filter((s) => s.isMultiSlot && !s.isFirstSlot);

      let inner = '';
      let bg    = rowBg;

      if (display.length > 0) {
        inner = display.map(buildCard).join('');
      } else if (continued.length > 0) {
        bg = '#faf5ff';
        inner = `
          <div style="display:flex;flex-direction:column;align-items:center;
            justify-content:center;min-height:90px;
            color:#8b5cf6;font-size:12px;font-weight:500;text-align:center;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="#8b5cf6" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" style="margin-bottom:5px;">
              <path d="M5 15l7-7 7 7"/>
            </svg>
            Continued
          </div>`;
      } else {
        inner = `
          <div style="display:flex;align-items:center;justify-content:center;
            min-height:90px;color:#e2e8f0;font-size:22px;">—</div>`;
      }

      return `
        <td style="
          border:1px solid #e2e8f0;
          padding:7px;
          vertical-align:top;
          background:${bg};
          width:${DAY_W}px;
          min-width:${DAY_W}px;
          max-width:${DAY_W}px;
          overflow:hidden;
          word-break:break-word;
          box-sizing:border-box;">
          ${inner}
        </td>`;
    }).join('');

    return `
      <tr>
        <td style="
          border:1px solid #e2e8f0;
          padding:12px 14px;
          background:#f1f5f9;
          vertical-align:middle;
          width:${TIME_W}px;
          min-width:${TIME_W}px;
          box-sizing:border-box;">
          <div style="font-weight:700;font-size:13px;color:#1e293b;
            margin-bottom:4px;line-height:1.4;">${slot.name}</div>
          <div style="font-size:11px;color:#94a3b8;line-height:1.4;">${slot.time}</div>
        </td>
        ${cells}
      </tr>`;
  }).join('');

  const footerStats = [
    { dot: '#64748b', label: 'Total Classes', val: stats.uniqueCount  },
    { dot: '#3b82f6', label: 'Theory',        val: stats.theories     },
    { dot: '#10b981', label: 'Lab',            val: stats.labs        },
    { dot: '#f59e0b', label: 'Total Slots',   val: stats.totalSlots   },
  ].map(({ dot, label, val }) => `
    <div style="display:flex;align-items:center;gap:7px;">
      <span style="display:inline-block;width:9px;height:9px;
        border-radius:50%;background:${dot};flex-shrink:0;"></span>
      <span style="font-size:12.5px;color:#64748b;line-height:1.4;">
        ${label}:&nbsp;<b style="color:#1e293b;">${val}</b>
      </span>
    </div>`).join('');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<style>
  * { box-sizing:border-box; margin:0; padding:0; }
  body {
    font-family: 'Segoe UI', Arial, Helvetica, sans-serif;
    background: #ffffff;
    width: ${PAGE_W}px;
    -webkit-font-smoothing: antialiased;
  }
  table { border-collapse:collapse; table-layout:fixed; }
  td, th { overflow:hidden; }
</style>
</head>
<body>

<!-- HEADER -->
<div style="
  background:linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#0f172a 100%);
  padding:38px ${H_PAD}px 32px;text-align:center;">
  <div style="font-size:27px;font-weight:800;color:#ffffff;
    letter-spacing:-0.02em;margin-bottom:8px;line-height:1.2;">
    Port City International University
  </div>
  <div style="width:80px;height:2px;margin:0 auto 10px;
    background:linear-gradient(to right,transparent,#60a5fa,transparent);"></div>
  <div style="font-size:11px;color:#94a3b8;letter-spacing:0.14em;
    text-transform:uppercase;font-weight:600;margin-bottom:28px;">
    Class Schedule
  </div>
  <div style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap;">
    ${[filters.dept, filters.batch, `Section ${filters.section}`].map((t) => `
      <div style="
        display:inline-flex;align-items:center;
        background:rgba(255,255,255,0.1);
        border:1px solid rgba(255,255,255,0.15);
        padding:9px 24px;border-radius:8px;">
        <span style="font-size:14px;font-weight:600;color:#ffffff;">${t}</span>
      </div>`).join('')}
  </div>
</div>

<!-- LEGEND -->
<div style="
  background:#f8fafc;border-bottom:2px solid #e2e8f0;
  padding:13px ${H_PAD}px;
  display:flex;align-items:center;justify-content:center;
  gap:36px;flex-wrap:wrap;">
  ${[
    { bg:'#eff6ff', brd:'#bfdbfe', left:'#3b82f6', label:'Theory Class'       },
    { bg:'#ecfdf5', brd:'#6ee7b7', left:'#059669', label:'Lab Class'          },
    { bg:'#f5f3ff', brd:'#ddd6fe', left:'#7c3aed', label:'Multi-slot Session' },
  ].map(({ bg, brd, left, label }) => `
    <div style="display:flex;align-items:center;gap:9px;">
      <span style="display:inline-block;width:18px;height:16px;
        background:${bg};border:1.5px solid ${brd};
        border-left:3px solid ${left};border-radius:3px;"></span>
      <span style="font-size:12.5px;color:#475569;font-weight:500;">${label}</span>
    </div>`).join('')}
</div>

<!-- TABLE -->
<div style="padding:16px ${H_PAD}px;background:#ffffff;">
  <table style="width:${PAGE_W - H_PAD * 2}px;
    border-collapse:collapse;table-layout:fixed;">
    <colgroup>
      <col style="width:${TIME_W}px;"/>
      ${DAYS.map(() => `<col style="width:${DAY_W}px;"/>`).join('')}
    </colgroup>
    <thead>
      <tr>
        <th style="
          border:1px solid #334155;padding:14px 12px;
          font-size:12px;font-weight:700;color:#ffffff;
          text-align:left;background:#1e293b;
          width:${TIME_W}px;min-width:${TIME_W}px;
          letter-spacing:0.06em;box-sizing:border-box;">
          TIME
        </th>
        ${dayHeaders}
      </tr>
    </thead>
    <tbody>${tableRows}</tbody>
  </table>
</div>

<!-- FOOTER -->
<div style="
  background:#f1f5f9;border-top:2px solid #e2e8f0;
  padding:16px ${H_PAD}px;
  display:flex;justify-content:space-between;
  align-items:center;flex-wrap:wrap;gap:12px;">
  <div style="display:flex;gap:30px;flex-wrap:wrap;align-items:center;">
    ${footerStats}
  </div>
  <div style="font-size:11.5px;color:#94a3b8;">
    Generated:&nbsp;${new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    })}
  </div>
</div>

</body>
</html>`;
}