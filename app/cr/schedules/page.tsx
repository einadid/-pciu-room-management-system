'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { DayOfWeek, DAYS } from '@/types';

// Schedule interface
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
  created_by: number;
  rooms?: {
    id: number;
    room_name: string;
    building: string;
  } | null;
  time_slots?: {
    id: number;
    slot_name: string;
    start_time: string;
    end_time: string;
  } | null;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  batch_name?: string;
  section_name?: string;
}

// Helper function for sub-section colors
const getSubSectionColor = (subSection: string | null): string => {
  if (!subSection) return 'bg-gray-100 text-gray-800';
  
  const lastChar = subSection.slice(-1);
  const colors: { [key: string]: string } = {
    '1': 'bg-blue-100 text-blue-800',
    '2': 'bg-green-100 text-green-800',
    '3': 'bg-yellow-100 text-yellow-800',
    '4': 'bg-purple-100 text-purple-800',
    '5': 'bg-pink-100 text-pink-800',
    '6': 'bg-indigo-100 text-indigo-800',
  };
  
  return colors[lastChar] || 'bg-gray-100 text-gray-800';
};

// Process schedules to identify multi-slot classes
interface ProcessedSchedule extends Schedule {
  isMultiSlot: boolean;
  slotSpan: number;
  isFirstSlot: boolean;
  sessionSlots: number[];
}

export default function CRSchedulesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDay, setFilterDay] = useState<DayOfWeek | ''>('');
  const [deleting, setDeleting] = useState<number | null>(null);

  // Auth check and fetch schedules
  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');

    if (!userData || !token) {
      router.replace('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      
      if (parsedUser.role !== 'cr') {
        router.replace('/login');
        return;
      }

      setUser(parsedUser);
      fetchSchedules(parsedUser, token);
    } catch (err) {
      localStorage.clear();
      router.replace('/login');
    }
  }, [router]);

  // Fetch schedules from API
  const fetchSchedules = async (userData: User, token: string) => {
    try {
      let url = `/api/schedules?department=${encodeURIComponent(userData.department)}`;
      
      if (userData.batch_name) {
        url += `&batch_name=${encodeURIComponent(userData.batch_name)}`;
      }
      if (userData.section_name) {
        url += `&section_name=${encodeURIComponent(userData.section_name)}`;
      }

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
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

  // Delete schedule (handles multi-slot via session_id on backend)
  const deleteSchedule = async (scheduleId: number, sessionId: string | null) => {
    const message = sessionId
      ? 'This is a multi-slot class. All related slots will be deleted. Continue?'
      : 'Are you sure you want to delete this schedule?';

    if (!confirm(message)) return;

    setDeleting(scheduleId);
    const token = localStorage.getItem('access_token');

    try {
      const res = await fetch(`/api/schedules/${scheduleId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        // Remove all schedules with same session_id (or just the one if no session_id)
        if (sessionId) {
          setSchedules(schedules.filter((s) => s.session_id !== sessionId));
        } else {
          setSchedules(schedules.filter((s) => s.id !== scheduleId));
        }
        alert('Schedule deleted successfully!');
      } else {
        alert(data.error || 'Failed to delete schedule');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Network error. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  // Process schedules to identify multi-slot classes
  const processSchedules = (scheduleList: Schedule[]): ProcessedSchedule[] => {
    const sessionMap = new Map<string, Schedule[]>();

    // Group by session_id
    scheduleList.forEach((schedule) => {
      if (schedule.session_id) {
        if (!sessionMap.has(schedule.session_id)) {
          sessionMap.set(schedule.session_id, []);
        }
        sessionMap.get(schedule.session_id)!.push(schedule);
      }
    });

    return scheduleList.map((schedule) => {
      let isMultiSlot = false;
      let slotSpan = 1;
      let isFirstSlot = true;
      let sessionSlots: number[] = [schedule.time_slot_id];

      if (schedule.session_id && sessionMap.has(schedule.session_id)) {
        const sessionSchedules = sessionMap.get(schedule.session_id)!;
        if (sessionSchedules.length > 1) {
          isMultiSlot = true;
          slotSpan = sessionSchedules.length;
          sessionSlots = sessionSchedules
            .map((s) => s.time_slot_id)
            .sort((a, b) => a - b);
          isFirstSlot = schedule.time_slot_id === Math.min(...sessionSlots);
        }
      }

      return {
        ...schedule,
        isMultiSlot,
        slotSpan,
        isFirstSlot,
        sessionSlots,
      };
    });
  };

  // Filter and process schedules
  const filteredSchedules = filterDay
    ? schedules.filter((s) => s.day_of_week === filterDay)
    : schedules;

  const processedSchedules = processSchedules(filteredSchedules);

  // Group by day, but only show first slot of multi-slot classes
  const getSchedulesForDay = (day: string): ProcessedSchedule[] => {
    return processedSchedules
      .filter((s) => s.day_of_week === day)
      .filter((s) => !s.isMultiSlot || s.isFirstSlot) // Only show first slot of multi-slot
      .sort((a, b) => a.time_slot_id - b.time_slot_id);
  };

  // Count unique classes (not counting multi-slot duplicates)
  const getUniqueClassCount = () => {
    const sessionIds = new Set<string>();
    let count = 0;

    schedules.forEach((schedule) => {
      if (schedule.session_id) {
        if (!sessionIds.has(schedule.session_id)) {
          sessionIds.add(schedule.session_id);
          count++;
        }
      } else {
        count++;
      }
    });

    return count;
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading schedules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📋 All Schedules
          </h1>
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">{user?.department}</Badge>
            {user?.batch_name && <Badge variant="lab">{user.batch_name}</Badge>}
            {user?.section_name && (
              <Badge variant="classroom">Section {user.section_name}</Badge>
            )}
            <span className="text-gray-500 text-sm">
              • {getUniqueClassCount()} Classes
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => router.push('/cr')}>
            ← Back
          </Button>
          <Button onClick={() => router.push('/cr/add-schedule')}>
            + Add Class
          </Button>
        </div>
      </div>

      {/* Day Filter */}
      <Card className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
            Filter by Day:
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterDay('')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterDay === ''
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Days
            </button>
            {DAYS.map((day) => (
              <button
                key={day}
                onClick={() => setFilterDay(day)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterDay === day
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Schedules by Day */}
      {DAYS.map((day) => {
        const daySchedules = getSchedulesForDay(day);

        // Hide empty days when filtering
        if (daySchedules.length === 0 && filterDay && filterDay !== day) {
          return null;
        }

        // Hide empty days when not filtering (optional - remove this if you want to show all days)
        if (daySchedules.length === 0 && !filterDay) {
          return null;
        }

        return (
          <Card key={day} title={`📅 ${day}`} className="mb-6">
            {daySchedules.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No classes scheduled for {day}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Teacher
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Room
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {daySchedules.map((schedule) => (
                      <tr
                        key={schedule.id}
                        className={`hover:bg-gray-50 ${
                          schedule.isMultiSlot ? 'bg-purple-50/30' : ''
                        }`}
                      >
                        {/* Time Slot */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">
                            {schedule.time_slots?.slot_name || `Slot ${schedule.time_slot_id}`}
                          </div>
                          <div className="text-xs text-gray-500">
                            {schedule.time_slots?.start_time?.slice(0, 5)} -{' '}
                            {schedule.time_slots?.end_time?.slice(0, 5)}
                          </div>
                          {/* Multi-slot indicator */}
                          {schedule.isMultiSlot && (
                            <div className="text-xs text-purple-600 font-medium mt-1">
                              ⏱️ {schedule.slotSpan * 1.5}h (Slot {schedule.sessionSlots.join('-')})
                            </div>
                          )}
                        </td>

                        {/* Course */}
                        <td className="px-4 py-4">
                          <div className="font-medium text-gray-900">
                            {schedule.course_name}
                          </div>
                          {schedule.course_code && (
                            <div className="text-sm text-gray-500">
                              {schedule.course_code}
                            </div>
                          )}
                        </td>

                        {/* Teacher */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          {schedule.teacher_name ? (
                            <div className="text-sm text-gray-700">
                              👨‍🏫 {schedule.teacher_name}
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>

                        {/* Room */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Badge variant="classroom">
                            📍 {schedule.rooms?.room_name || '—'}
                          </Badge>
                          {schedule.rooms?.building && (
                            <div className="text-xs text-gray-500 mt-1">
                              {schedule.rooms.building}
                            </div>
                          )}
                        </td>

                        {/* Type & Sub-section */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {schedule.class_type === 'Lab' ? (
                              <Badge variant="lab">🔬 Lab</Badge>
                            ) : (
                              <Badge variant="default">📖 Theory</Badge>
                            )}
                            {schedule.sub_section && (
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getSubSectionColor(schedule.sub_section)}`}
                              >
                                👥 {schedule.sub_section}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() =>
                                router.push(`/cr/edit-schedule/${schedule.id}`)
                              }
                            >
                              ✏️ Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() =>
                                deleteSchedule(schedule.id, schedule.session_id)
                              }
                              disabled={deleting === schedule.id}
                            >
                              {deleting === schedule.id ? '...' : '🗑️ Delete'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        );
      })}

      {/* Empty State */}
      {schedules.length === 0 && (
        <Card>
          <div className="text-center py-16">
            <div className="text-8xl mb-6">📅</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No Schedules Yet
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              You haven&apos;t added any class schedules yet. Start by adding
              your first class.
            </p>
            <Button onClick={() => router.push('/cr/add-schedule')}>
              + Add First Class
            </Button>
          </div>
        </Card>
      )}

      {/* No results for filter */}
      {schedules.length > 0 && filteredSchedules.length === 0 && filterDay && (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Classes on {filterDay}
            </h3>
            <p className="text-gray-500 mb-4">
              There are no classes scheduled for this day.
            </p>
            <Button variant="secondary" onClick={() => setFilterDay('')}>
              Show All Days
            </Button>
          </div>
        </Card>
      )}

      {/* Legend */}
      {schedules.length > 0 && (
        <Card className="mt-6">
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <span className="font-medium text-gray-700">Legend:</span>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-blue-100 border border-blue-200"></span>
              <span className="text-gray-600">Theory</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-green-100 border border-green-200"></span>
              <span className="text-gray-600">Lab</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-purple-100 border border-purple-200"></span>
              <span className="text-gray-600">Multi-slot (3 hours)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-100 bg-blue-100 px-2 rounded text-xs">A1</span>
              <span className="text-green-100 bg-green-100 px-2 rounded text-xs">A2</span>
              <span className="text-yellow-100 bg-yellow-100 px-2 rounded text-xs">A3</span>
              <span className="text-purple-100 bg-purple-100 px-2 rounded text-xs">A4</span>
              <span className="text-gray-600">Lab Groups</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

