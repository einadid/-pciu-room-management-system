'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { ScheduleWithDetails, User, DayOfWeek, DAYS } from '@/types';

export default function PrintSchedulePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [schedules, setSchedules] = useState<ScheduleWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');

    if (!userData || !token) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'cr') {
      router.push('/admin');
      return;
    }

    setUser(parsedUser);
    fetchSchedules(parsedUser.department, token);
  }, [router]);

  const fetchSchedules = async (department: string, token: string) => {
    try {
      const res = await fetch(`/api/schedules?department=${department}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setSchedules(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  // Group schedules by day and time slot
  const scheduleGrid: { [day: string]: { [slot: number]: ScheduleWithDetails | null } } = {};
  
  DAYS.forEach(day => {
    scheduleGrid[day] = {};
    for (let i = 1; i <= 6; i++) {
      scheduleGrid[day][i] = null;
    }
  });

  schedules.forEach(schedule => {
    scheduleGrid[schedule.day_of_week][schedule.time_slot_id] = schedule;
  });

  return (
    <>
      {/* Print Button - Hidden when printing */}
      <div className="no-print max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Print Schedule</h1>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => router.push('/cr')}>
              ← Back
            </Button>
            <Button onClick={handlePrint}>
              🖨️ Print Schedule
            </Button>
          </div>
        </div>
      </div>

      {/* Printable Content */}
      <div className="print-content max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Port City International University
          </h1>
          <h2 className="text-xl font-semibold mb-1">
            Class Schedule - {user?.department} Department
          </h2>
          <p className="text-gray-600">
            Generated on {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Schedule Table */}
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                Time / Day
              </th>
              {DAYS.map(day => (
                <th key={day} className="border border-gray-300 px-4 py-3 text-center font-semibold">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5, 6].map(slot => {
              const timeSlot = schedules.find(s => s.time_slot_id === slot)?.time_slots;
              
              return (
                <tr key={slot}>
                  <td className="border border-gray-300 px-4 py-3 bg-gray-50 font-medium">
                    <div>Slot {slot}</div>
                    {timeSlot && (
                      <div className="text-xs text-gray-600">
                        {timeSlot.start_time.slice(0, 5)} - {timeSlot.end_time.slice(0, 5)}
                      </div>
                    )}
                  </td>
                  {DAYS.map(day => {
                    const schedule = scheduleGrid[day][slot];
                    
                    return (
                      <td key={day} className="border border-gray-300 px-3 py-2 text-sm">
                        {schedule ? (
                          <div>
                            <div className="font-semibold">{schedule.course_name}</div>
                            {schedule.course_code && (
                              <div className="text-xs text-gray-600">{schedule.course_code}</div>
                            )}
                            {schedule.teacher_name && (
                              <div className="text-xs text-gray-600">{schedule.teacher_name}</div>
                            )}
                            <div className="text-xs font-medium text-blue-700 mt-1">
                              Room: {schedule.rooms.room_name} ({schedule.rooms.building})
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-400 text-center">-</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Footer */}
        <div className="mt-8 text-sm text-gray-600">
          <p>Total Classes: {schedules.length}</p>
          <p>Department: {user?.department}</p>
          <p>Class Representative: {user?.name}</p>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          .print-content {
            max-width: 100% !important;
            padding: 20px !important;
          }
          
          body {
            background: white !important;
          }
          
          header, footer, nav {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}