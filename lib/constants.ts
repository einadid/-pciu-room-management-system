// System-wide constants
export const BUILDINGS = [
  'Main Building',
  'A Building',
  'B Building',
  'C Building',
  'D Building',
] as const;

export const TIME_SLOTS_INFO = [
  { slot: 1, label: 'Slot 1', time: '08:30 - 09:55' },
  { slot: 2, label: 'Slot 2', time: '10:00 - 11:25' },
  { slot: 3, label: 'Slot 3', time: '11:30 - 12:55' },
  { slot: 4, label: 'Slot 4', time: '13:30 - 14:55' },
  { slot: 5, label: 'Slot 5', time: '15:00 - 16:25' },
  { slot: 6, label: 'Slot 6', time: '16:30 - 17:55' },
] as const;

export const UNIVERSITY_INFO = {
  name: 'Port City International University',
  shortName: 'PCIU',
  workingDays: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  startTime: '08:30',
  endTime: '17:55',
} as const;