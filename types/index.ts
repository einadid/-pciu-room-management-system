// ========================================
// PORT CITY UNIVERSITY ROOM SYSTEM
// TypeScript Type Definitions
// ========================================

// 🔹 User Types
export type UserRole = 'admin' | 'cr' | 'superadmin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  token_id: string | null;
  department: string | null;
  created_at: string;
}

// 🔹 Room Types
export type RoomTypeName = 'Classroom' | 'Lab' | 'Special';

export interface RoomType {
  id: number;
  type_name: RoomTypeName;
}

export interface Room {
  id: number;
  room_name: string;
  building: string | null;
  capacity: number;
  type_id: number;
  is_active: boolean;
}

// Room with type name (joined)
export interface RoomWithType extends Room {
  room_types: RoomType;
}

// 🔹 Time Slot
export interface TimeSlot {
  id: number;
  start_time: string;
  end_time: string;
  slot_name: string;
}

// 🔹 Days
export type DayOfWeek = 
  | 'Saturday'
  | 'Sunday' 
  | 'Monday' 
  | 'Tuesday' 
  | 'Wednesday' 
  | 'Thursday'
  | 'Friday';

export const DAYS: DayOfWeek[] = [
  'Saturday',
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday'
];

// 🔹 Schedule
export interface Schedule {
  id: number;
  room_id: number;
  course_name: string;
  course_code: string | null;
  teacher_name: string | null;
  department: string;
  day_of_week: DayOfWeek;
  time_slot_id: number;
  created_by: string;
  created_at: string;
}

// Schedule with relations (joined)
export interface ScheduleWithDetails extends Schedule {
  rooms: Room;
  time_slots: TimeSlot;
  users: User;
}

// 🔹 Room Ownership
export interface RoomOwnership {
  id: number;
  room_id: number;
  department: string;
  assigned_at: string;
}

// 🔹 Room Availability Status
export interface RoomAvailability {
  room: Room;
  status: 'free' | 'occupied';
  current_class?: {
    course_name: string;
    teacher_name: string | null;
    department: string;
    notice?: string;
  };
  cancelled_class?: {
    course_name: string;
    department: string;
    reason?: string;
  };
  owned_by?: string[];
  is_exclusive?: boolean;
}

// 🔹 API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 🔹 Auth Types
export interface LoginRequest {
  token_id: string;
}

export interface LoginResponse {
  user: User;
  access_token: string;
}

export interface JWTPayload {
  userId: string;
  role: UserRole;
  department: string | null;
}

// 🔹 Form Types
export interface CreateScheduleForm {
  room_id: number;
  course_name: string;
  course_code?: string;
  teacher_name?: string;
  department: string;
  day_of_week: DayOfWeek;
  time_slot_id: number;
}

export interface CheckAvailabilityRequest {
  day: DayOfWeek;
  time_slot_id: number;
  room_type?: RoomTypeName;
  building?: string;
}

// 🔹 Department List (PCIU specific)
export const DEPARTMENTS = [
  'CSE',
  'EEE', 
  'CEN',
  'DBA',
  'ENG',
  'LLB',
  'BTE',
  'JRN',
  'BFT'
] as const;

export type Department = typeof DEPARTMENTS[number];

// 🔹 Batch
export interface Batch {
  id: number;
  batch_name: string;
  department: string;
  year: number;
  semester: string;
  is_active: boolean;
  created_at: string;
}

// 🔹 Section
export interface Section {
  id: number;
  batch_id: number;
  section_name: string;
  total_students: number;
  is_active: boolean;
  created_at: string;
}

// 🔹 Batch with Sections
export interface BatchWithSections extends Batch {
  sections: Section[];
}

// 🔹 Update Schedule interface
export interface Schedule {
  id: number;
  room_id: number;
  course_name: string;
  course_code: string | null;
  teacher_name: string | null;
  department: string;
  day_of_week: DayOfWeek;
  time_slot_id: number;
  batch_id: number | null;          // NEW
  section_id: number | null;        // NEW
  created_by: string;
  created_at: string;
}

// 🔹 Schedule with all details
export interface ScheduleWithDetails extends Schedule {
  rooms: Room;
  time_slots: TimeSlot;
  users: User;
  batches?: Batch;                  // NEW
  sections?: Section;               // NEW
}

// 🔹 Update User interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  token_id: string | null;
  department: string | null;
  batch_id: number | null;          // NEW
  section_id: number | null;        // NEW
  created_at: string;
}

// 🔹 Notice
export interface Notice {
  id: number;
  title: string;
  content: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  is_active: boolean;
  created_by: string;
  created_at: string;
  expires_at: string | null;
}

// 🔹 Feedback
export interface Feedback {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'pending' | 'reviewed' | 'resolved';
  created_at: string;
}

// Add at the end of types/index.ts
export function getSubSectionColor(subSection?: string | null): string {
  if (!subSection) {
    return 'bg-gray-100 text-gray-800';
  }
  const lastChar = subSection.slice(-1);
  switch (lastChar) {
    case '1':
      return 'bg-purple-100 text-purple-800';
    case '2':
      return 'bg-emerald-100 text-emerald-800';
    case '3':
      return 'bg-orange-100 text-orange-800';
    case '4':
      return 'bg-pink-100 text-pink-800';
    default:
      return 'bg-blue-100 text-blue-800';
  }
}


// 🔹 Schedule Exception (Class Cancel / Notice)
export type ExceptionType = 'cancelled' | 'notice';

export interface ScheduleException {
  id: number;
  schedule_id: number;
  exception_date: string; // YYYY-MM-DD format
  exception_type: ExceptionType;
  reason: string | null;
  notice_text: string | null;
  created_by: string;
  created_at: string;
}

export interface ScheduleExceptionWithDetails extends ScheduleException {
  schedules?: {
    id: number;
    course_name: string;
    course_code: string | null;
    teacher_name: string | null;
    department: string;
    day_of_week: string;
    time_slot_id: number;
    room_id: number;
    batch_name: string | null;
    section_name: string | null;
  };
}

// Helper: Get date string YYYY-MM-DD from Date object
export function getDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Helper: Get day name from date
export function getDayFromDate(date: Date): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}