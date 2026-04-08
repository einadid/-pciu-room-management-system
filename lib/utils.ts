import { type ClassValue, clsx } from 'clsx';

// 🔹 Combine class names
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

// 🔹 Format time for display
export function formatTime(time: string): string {
  // Input: "08:30:00" or "08:30"
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

// 🔹 Get current day name
export function getCurrentDay(): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date().getDay()];
}

// 🔹 Get current time slot ID based on current time
export function getCurrentTimeSlotId(): number | null {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  const slots = [
    { id: 1, start: 8 * 60 + 30, end: 9 * 60 + 55 },   // 08:30-09:55
    { id: 2, start: 10 * 60, end: 11 * 60 + 25 },      // 10:00-11:25
    { id: 3, start: 11 * 60 + 30, end: 12 * 60 + 55 }, // 11:30-12:55
    { id: 4, start: 13 * 60 + 30, end: 14 * 60 + 55 }, // 13:30-14:55
    { id: 5, start: 15 * 60, end: 16 * 60 + 25 },      // 15:00-16:25
    { id: 6, start: 16 * 60 + 30, end: 17 * 60 + 55 }, // 16:30-17:55
  ];
  
  for (const slot of slots) {
    if (currentMinutes >= slot.start && currentMinutes <= slot.end) {
      return slot.id;
    }
  }
  
  return null; // Outside class hours
}

// 🔹 Check if current time is within university hours
export function isUniversityHours(): boolean {
  const now = new Date();
  const hour = now.getHours();
  
  // Sunday=0 to Thursday=4 are class days
  
  // Class hours: 8:30 AM to 6:00 PM
  if (hour < 8 || hour >= 18) return false;
  
  return true;
}

// 🔹 Generate random token ID
export function generateTokenId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'CR';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 🔹 Validate token format
export function isValidTokenFormat(token: string): boolean {
  // Token format: 2 letters + 6 alphanumeric
  return /^[A-Z]{2,5}[A-Z0-9]{4,8}$/.test(token.toUpperCase());
}