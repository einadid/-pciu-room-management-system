'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ExceptionModal from '@/components/ui/ExceptionModal';
import { DayOfWeek, DAYS } from '@/types';

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
  rooms?: { id: number; room_name: string; building: string } | null;
  time_slots?: {
    id: number;
    slot_name: string;
    start_time: string;
    end_time: string;
  } | null;
}

interface ScheduleException {
  id: number;
  schedule_id: number;
  exception_date: string;
  exception_type: 'cancelled' | 'notice';
  reason: string | null;
  notice_text: string | null;
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

interface ProcessedSchedule extends Schedule {
  isMultiSlot: boolean;
  slotSpan: number;
  isFirstSlot: boolean;
  sessionSlots: number[];
  exceptions?: ScheduleException[];
}

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

export default function CRSchedulesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [exceptions, setExceptions] = useState<ScheduleException[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDay, setFilterDay] = useState<DayOfWeek | ''>('');
  const [deleting, setDeleting] = useState<number | null>(null);

  // Exception modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [submittingException, setSubmittingException] = useState(false);

  // View existing exceptions
  const [viewingExceptions, setViewingExceptions] = useState<number | null>(null);

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

  const fetchSchedules = async (userData: User, token: string) => {
    try {
      let url = `/api/schedules?department=${encodeURIComponent(userData.department)}`;
      if (userData.batch_name) url += `&batch_name=${encodeURIComponent(userData.batch_name)}`;
      if (userData.section_name) url += `&section_name=${encodeURIComponent(userData.section_name)}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success) {
        setSchedules(data.data);
        // Also fetch exceptions for these schedules
        fetchExceptions(data.data, token);
      }
    } catch (err) {
      console.error('Failed to fetch schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchExceptions = async (scheduleList: Schedule[], token: string) => {
    if (scheduleList.length === 0) return;
    try {
      const dept = scheduleList[0]?.department;
      const batch = scheduleList[0]?.batch_name;
      const section = scheduleList[0]?.section_name;

      let url = `/api/schedule-exceptions?department=${encodeURIComponent(dept)}`;
      if (batch) url += `&batch_name=${encodeURIComponent(batch)}`;
      if (section) url += `&section_name=${encodeURIComponent(section)}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setExceptions(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch exceptions:', err);
    }
  };

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
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success) {
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
      alert('Network error. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  // Open modal to add exception
  const openExceptionModal = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setModalOpen(true);
  };

  // Submit exception
  const handleExceptionSubmit = async (formData: {
    exception_type: 'cancelled' | 'notice';
    exception_date: string;
    reason?: string;
    notice_text?: string;
  }) => {
    if (!selectedSchedule) return;
    setSubmittingException(true);
    const token = localStorage.getItem('access_token');

    try {
      const res = await fetch('/api/schedule-exceptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          schedule_id: selectedSchedule.id,
          ...formData,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert(
          formData.exception_type === 'cancelled'
            ? `✅ Class cancelled for ${formData.exception_date}`
            : `✅ Notice added for ${formData.exception_date}`
        );
        setModalOpen(false);
        setSelectedSchedule(null);
        // Refresh exceptions
        if (user) {
          const tok = localStorage.getItem('access_token') || '';
          fetchExceptions(schedules, tok);
        }
      } else {
        alert('❌ ' + (data.error || 'Failed'));
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setSubmittingException(false);
    }
  };

  // Delete exception
  const deleteException = async (exceptionId: number) => {
    if (!confirm('Remove this exception?')) return;
    const token = localStorage.getItem('access_token');

    try {
      const res = await fetch(`/api/schedule-exceptions/${exceptionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setExceptions(exceptions.filter((e) => e.id !== exceptionId));
      }
    } catch (err) {
      alert('Failed to remove exception');
    }
  };

  // Get exceptions for a schedule
  const getScheduleExceptions = (scheduleId: number) => {
    return exceptions.filter((e) => e.schedule_id === scheduleId);
  };

  // Process multi-slot
  const processSchedules = (scheduleList: Schedule[]): ProcessedSchedule[] => {
    const sessionMap = new Map<string, Schedule[]>();
    scheduleList.forEach((schedule) => {
      if (schedule.session_id) {
        if (!sessionMap.has(schedule.session_id)) sessionMap.set(schedule.session_id, []);
        sessionMap.get(schedule.session_id)!.push(schedule);
      }
    });

    return scheduleList.map((schedule) => {
      let isMultiSlot = false, slotSpan = 1, isFirstSlot = true;
      let sessionSlots = [schedule.time_slot_id];

      if (schedule.session_id && sessionMap.has(schedule.session_id)) {
        const grp = sessionMap.get(schedule.session_id)!;
        if (grp.length > 1) {
          isMultiSlot = true;
          slotSpan = grp.length;
          sessionSlots = grp.map((s) => s.time_slot_id).sort((a, b) => a - b);
          isFirstSlot = schedule.time_slot_id === Math.min(...sessionSlots);
        }
      }

      return {
        ...schedule,
        isMultiSlot,
        slotSpan,
        isFirstSlot,
        sessionSlots,
        exceptions: getScheduleExceptions(schedule.id),
      };
    });
  };

  const filteredSchedules = filterDay
    ? schedules.filter((s) => s.day_of_week === filterDay)
    : schedules;

  const processedSchedules = processSchedules(filteredSchedules);

  const getSchedulesForDay = (day: string): ProcessedSchedule[] => {
    return processedSchedules
      .filter((s) => s.day_of_week === day)
      .filter((s) => !s.isMultiSlot || s.isFirstSlot)
      .sort((a, b) => a.time_slot_id - b.time_slot_id);
  };

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📋 All Schedules</h1>
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">{user?.department}</Badge>
            {user?.batch_name && <Badge variant="lab">{user.batch_name}</Badge>}
            {user?.section_name && <Badge variant="classroom">Section {user.section_name}</Badge>}
            <span className="text-gray-500 text-sm">• {getUniqueClassCount()} Classes</span>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => router.push('/cr')}>← Back</Button>
          <Button onClick={() => router.push('/cr/add-schedule')}>+ Add Class</Button>
        </div>
      </div>

      {/* Upcoming Exceptions Summary */}
      {exceptions.length > 0 && (
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <div className="flex items-start gap-3">
            <span className="text-2xl">📢</span>
            <div className="flex-1">
              <h3 className="font-semibold text-orange-900 mb-2">
                Upcoming Updates ({exceptions.length})
              </h3>
              <div className="space-y-2">
                {exceptions.slice(0, 5).map((ex) => {
                  const schedule = schedules.find((s) => s.id === ex.schedule_id);
                  return (
                    <div key={ex.id} className="flex items-center justify-between
                      bg-white rounded-lg px-3 py-2 border border-orange-200">
                      <div className="flex items-center gap-2">
                        <span>{ex.exception_type === 'cancelled' ? '❌' : '📢'}</span>
                        <div>
                          <span className="text-sm font-medium text-gray-900">
                            {schedule?.course_name || 'Unknown'}
                          </span>
                          <span className="text-xs text-gray-500 ml-2">
                            {ex.exception_date}
                          </span>
                          {ex.exception_type === 'cancelled' && ex.reason && (
                            <span className="text-xs text-red-600 ml-2">
                              ({ex.reason})
                            </span>
                          )}
                          {ex.exception_type === 'notice' && ex.notice_text && (
                            <span className="text-xs text-blue-600 ml-2">
                              {ex.notice_text}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteException(ex.id)}
                        className="text-red-400 hover:text-red-600 text-xs font-medium ml-2"
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
                {exceptions.length > 5 && (
                  <p className="text-xs text-orange-600">
                    +{exceptions.length - 5} more updates
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

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
                filterDay === '' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Days
            </button>
            {DAYS.map((day) => (
              <button
                key={day}
                onClick={() => setFilterDay(day)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterDay === day ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
        if (daySchedules.length === 0) return null;

        return (
          <Card key={day} title={`📅 ${day}`} className="mb-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Updates</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {daySchedules.map((schedule) => {
                    const schedExceptions = getScheduleExceptions(schedule.id);
                    const upcomingCancels = schedExceptions.filter(
                      (e) => e.exception_type === 'cancelled' && e.exception_date >= new Date().toISOString().split('T')[0]
                    );
                    const upcomingNotices = schedExceptions.filter(
                      (e) => e.exception_type === 'notice' && e.exception_date >= new Date().toISOString().split('T')[0]
                    );

                    return (
                      <tr key={schedule.id} className="hover:bg-gray-50">
                        {/* Time */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">
                            {schedule.time_slots?.slot_name || `Slot ${schedule.time_slot_id}`}
                          </div>
                          <div className="text-xs text-gray-500">
                            {schedule.time_slots?.start_time?.slice(0, 5)} –{' '}
                            {schedule.time_slots?.end_time?.slice(0, 5)}
                          </div>
                          {schedule.isMultiSlot && (
                            <div className="text-xs text-purple-600 font-medium mt-1">
                              ⏱️ {schedule.slotSpan * 1.5}h
                            </div>
                          )}
                        </td>

                        {/* Course */}
                        <td className="px-4 py-4">
                          <div className="font-medium text-gray-900">{schedule.course_name}</div>
                          {schedule.course_code && (
                            <div className="text-sm text-gray-500">{schedule.course_code}</div>
                          )}
                        </td>

                        {/* Teacher */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          {schedule.teacher_name ? (
                            <div className="text-sm text-gray-700">👨‍🏫 {schedule.teacher_name}</div>
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
                            <div className="text-xs text-gray-500 mt-1">{schedule.rooms.building}</div>
                          )}
                        </td>

                        {/* Updates / Exceptions */}
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-1">
                            {upcomingCancels.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {upcomingCancels.map((ex) => (
                                  <span key={ex.id}
                                    className="inline-flex items-center gap-1 px-2 py-0.5
                                      bg-red-100 text-red-700 text-xs rounded-full">
                                    ❌ {ex.exception_date}
                                    <button
                                      onClick={() => deleteException(ex.id)}
                                      className="hover:text-red-900 font-bold ml-0.5"
                                    >×</button>
                                  </span>
                                ))}
                              </div>
                            )}
                            {upcomingNotices.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {upcomingNotices.map((ex) => (
                                  <span key={ex.id}
                                    className="inline-flex items-center gap-1 px-2 py-0.5
                                      bg-blue-100 text-blue-700 text-xs rounded-full
                                      max-w-[160px] truncate"
                                    title={ex.notice_text || ''}>
                                    📢 {ex.exception_date}
                                    <button
                                      onClick={() => deleteException(ex.id)}
                                      className="hover:text-blue-900 font-bold ml-0.5 flex-shrink-0"
                                    >×</button>
                                  </span>
                                ))}
                              </div>
                            )}
                            {schedExceptions.length === 0 && (
                              <span className="text-xs text-gray-400">No updates</span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1.5">
                            {/* Cancel/Notice button */}
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => openExceptionModal(schedule)}
                              className="text-orange-600 border-orange-200 hover:bg-orange-50 text-xs"
                            >
                              📢 Cancel/Notice
                            </Button>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => router.push(`/cr/edit-schedule/${schedule.id}`)}
                              >
                                ✏️
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => deleteSchedule(schedule.id, schedule.session_id)}
                                disabled={deleting === schedule.id}
                              >
                                {deleting === schedule.id ? '...' : '🗑️'}
                              </Button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        );
      })}

      {/* Empty State */}
      {schedules.length === 0 && (
        <Card>
          <div className="text-center py-16">
            <div className="text-8xl mb-6">📅</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Schedules Yet</h3>
            <p className="text-gray-500 mb-6">Add your first class to get started.</p>
            <Button onClick={() => router.push('/cr/add-schedule')}>+ Add First Class</Button>
          </div>
        </Card>
      )}

      {/* Exception Modal */}
      {selectedSchedule && (
        <ExceptionModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedSchedule(null);
          }}
          onSubmit={handleExceptionSubmit}
          scheduleInfo={{
            course_name: selectedSchedule.course_name,
            day_of_week: selectedSchedule.day_of_week,
            time_slot: selectedSchedule.time_slots
              ? `${selectedSchedule.time_slots.start_time?.slice(0, 5)} – ${selectedSchedule.time_slots.end_time?.slice(0, 5)}`
              : undefined,
          }}
          isLoading={submittingException}
        />
      )}
    </div>
  );
}