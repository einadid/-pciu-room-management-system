'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Select from '@/components/ui/Select';
import { ScheduleWithDetails, User, DayOfWeek, DAYS, DEPARTMENTS } from '@/types';

export default function AdminSchedulesPage() {
  const router = useRouter();
  const [schedules, setSchedules] = useState<ScheduleWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDay, setFilterDay] = useState<DayOfWeek | ''>('');
  const [filterDept, setFilterDept] = useState<string>('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');

    if (!userData || !token) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'admin') {
      router.push('/cr');
      return;
    }

    fetchSchedules(token);
  }, [router]);

  const fetchSchedules = async (token: string) => {
    try {
      const res = await fetch('/api/schedules', {
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

  const deleteSchedule = async (scheduleId: number) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;

    const token = localStorage.getItem('access_token');

    try {
      const res = await fetch(`/api/schedules/${scheduleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setSchedules(schedules.filter(s => s.id !== scheduleId));
        alert('Schedule deleted successfully');
      }
    } catch (err) {
      alert('Failed to delete schedule');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const filteredSchedules = schedules.filter((s) => {
    if (filterDay && s.day_of_week !== filterDay) return false;
    if (filterDept && s.department !== filterDept) return false;
    return true;
  });

  // Group by department
  const departmentStats = DEPARTMENTS.map((dept) => ({
    name: dept,
    count: schedules.filter((s) => s.department === dept).length,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display text-gray-900 mb-2">
            All Schedules
          </h1>
          <p className="text-gray-600">
            View schedules from all departments
          </p>
        </div>
        <Button variant="secondary" onClick={() => router.push('/admin')}>
          ← Back to Dashboard
        </Button>
      </div>

      {/* Department Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-8">
        {departmentStats.map((stat) => (
          <Card key={stat.name} className="text-center p-4">
            <div className="text-2xl font-bold text-blue-600">{stat.count}</div>
            <div className="text-xs text-gray-500 mt-1">{stat.name}</div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Filter by Day
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterDay('')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filterDay === ''
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {DAYS.map((day) => (
                <button
                  key={day}
                  onClick={() => setFilterDay(day)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filterDay === day
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <Select
            label="Filter by Department"
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            options={DEPARTMENTS.map((dept) => ({ value: dept, label: dept }))}
            placeholder="All Departments"
          />
        </div>
      </Card>

      {/* Schedules Table */}
      <Card title={`📋 Schedules (${filteredSchedules.length})`}>
        {filteredSchedules.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No schedules found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Day</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created By</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSchedules
                  .sort((a, b) => {
                    const dayCompare = DAYS.indexOf(a.day_of_week as DayOfWeek) - DAYS.indexOf(b.day_of_week as DayOfWeek);
                    if (dayCompare !== 0) return dayCompare;
                    return a.time_slot_id - b.time_slot_id;
                  })
                  .map((schedule) => (
                    <tr key={schedule.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {schedule.day_of_week}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {schedule.time_slots.slot_name}
                        <br />
                        <span className="text-xs">
                          {schedule.time_slots.start_time.slice(0, 5)} - {schedule.time_slots.end_time.slice(0, 5)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-gray-900">{schedule.course_name}</div>
                        {schedule.course_code && (
                          <div className="text-xs text-gray-500">{schedule.course_code}</div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {schedule.teacher_name || 'N/A'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Badge variant="classroom">{schedule.rooms.room_name}</Badge>
                        <div className="text-xs text-gray-500 mt-1">{schedule.rooms.building}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Badge variant="default">{schedule.department}</Badge>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {schedule.users.name}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => deleteSchedule(schedule.id)}
                          className="text-red-600 hover:text-red-900 font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}