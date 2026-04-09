'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

export default function CRDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

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

  const fetchSchedules = async (userData: any, token: string) => {
    try {
      let url = `/api/schedules?department=${userData.department}`;
      if (userData.batch_name) url += `&batch_name=${userData.batch_name}`;
      if (userData.section_name) url += `&section_name=${userData.section_name}`;

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` },
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

  // Delete single schedule
  const handleDeleteSchedule = async (scheduleId: number, courseName: string) => {
    if (!confirm(`Are you sure you want to delete "${courseName}"?`)) {
      return;
    }

    setDeletingId(scheduleId);
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
      } else {
        alert('❌ Failed: ' + data.error);
      }
    } catch (err) {
      alert('❌ Network error');
    } finally {
      setDeletingId(null);
    }
  };

  // Delete all schedules
  const handleDeleteAll = async () => {
    const semesterName = prompt('Enter semester name for archive (e.g., "Fall 2024"):');
    if (!semesterName) return;

    if (!confirm(`⚠️ Are you sure you want to archive and delete ALL ${schedules.length} schedules?\n\nThis will:\n1. Archive schedules as "${semesterName}"\n2. Delete all current schedules\n\nThis cannot be undone!`)) {
      return;
    }

    setDeleting(true);
    const token = localStorage.getItem('access_token');

    try {
      const res = await fetch('/api/schedules/archive-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          department: user.department,
          batch_name: user.batch_name,
          section_name: user.section_name,
          semester: semesterName,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert(`✅ ${data.data?.archived_count || schedules.length} schedules archived and deleted successfully!`);
        setSchedules([]);
      } else {
        alert('❌ Failed: ' + data.error);
      }
    } catch (err) {
      alert('❌ Network error');
    } finally {
      setDeleting(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.replace('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {user.name}
          </h1>
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">{user.department}</Badge>
            {user.batch_name && <Badge variant="lab">{user.batch_name}</Badge>}
            {user.section_name && <Badge variant="classroom">Section {user.section_name}</Badge>}
          </div>
        </div>
        <Button variant="danger" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{schedules.length}</div>
            <div className="text-sm text-gray-500">Total Classes</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{user.department}</div>
            <div className="text-sm text-gray-500">Department</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">{user.batch_name || 'N/A'}</div>
            <div className="text-sm text-gray-500">Batch</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-lg font-bold text-orange-600">{user.section_name || 'N/A'}</div>
            <div className="text-sm text-gray-500">Section</div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card 
          className="hover:border-blue-400 hover:shadow-md transition-all"
          onClick={() => router.push('/cr/add-schedule')}
        >
          <div className="text-center py-2">
            <div className="text-4xl mb-2">➕</div>
            <h3 className="font-semibold text-gray-900">Add Class</h3>
            <p className="text-xs text-gray-500 mt-1">Create schedule</p>
          </div>
        </Card>

        <Card 
          className="hover:border-green-400 hover:shadow-md transition-all"
          onClick={() => router.push('/cr/schedules')}
        >
          <div className="text-center py-2">
            <div className="text-4xl mb-2">📋</div>
            <h3 className="font-semibold text-gray-900">My Schedules</h3>
            <p className="text-xs text-gray-500 mt-1">{schedules.length} classes</p>
          </div>
        </Card>

        <Card 
          className="hover:border-purple-400 hover:shadow-md transition-all"
          onClick={() => router.push('/check-room')}
        >
          <div className="text-center py-2">
            <div className="text-4xl mb-2">🔍</div>
            <h3 className="font-semibold text-gray-900">Check Room</h3>
            <p className="text-xs text-gray-500 mt-1">Availability</p>
          </div>
        </Card>

        <Card 
          className="hover:border-cyan-400 hover:shadow-md transition-all"
          onClick={() => router.push('/routine')}
        >
          <div className="text-center py-2">
            <div className="text-4xl mb-2">📅</div>
            <h3 className="font-semibold text-gray-900">View Routine</h3>
            <p className="text-xs text-gray-500 mt-1">Public view</p>
          </div>
        </Card>
      </div>

      {/* Recent Classes with Delete */}
      <Card title="📚 Your Classes" className="mb-8">
        {schedules.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Classes Yet</h3>
            <p className="text-gray-500 mb-4">Start by adding your first class schedule</p>
            <Button onClick={() => router.push('/cr/add-schedule')}>
              ➕ Add First Class
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Day</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {schedules.map((schedule) => (
                  <tr key={schedule.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{schedule.course_name}</div>
                      {schedule.course_code && (
                        <div className="text-xs text-gray-500">{schedule.course_code}</div>
                      )}
                      {schedule.teacher_name && (
                        <div className="text-xs text-gray-500">👨‍🏫 {schedule.teacher_name}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {schedule.day_of_week}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {schedule.time_slots?.slot_name || `Slot ${schedule.time_slot_id}`}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge variant="classroom">
                        {schedule.rooms?.room_name || `Room ${schedule.room_id}`}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {schedule.class_type === 'Lab' ? (
                          <Badge variant="lab">🔬 Lab</Badge>
                        ) : (
                          <Badge variant="default">📖 Theory</Badge>
                        )}
                        {schedule.sub_section && (
                          <Badge variant="special">👥 {schedule.sub_section}</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleDeleteSchedule(schedule.id, schedule.course_name)}
                        disabled={deletingId === schedule.id}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                          deletingId === schedule.id
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-red-50 text-red-600 hover:bg-red-100'
                        }`}
                      >
                        {deletingId === schedule.id ? (
                          <>
                            <span className="animate-spin">⏳</span>
                            Deleting...
                          </>
                        ) : (
                          <>
                            🗑️ Delete
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Danger Zone */}
      {schedules.length > 0 && (
        <Card title="⚠️ Semester End Actions" className="border-red-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-gray-700">
                Archive and delete all <strong>{schedules.length}</strong> schedules for new semester.
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Archived routines can be viewed in "Previous Routines"
              </p>
            </div>
            <Button
              variant="danger"
              onClick={handleDeleteAll}
              isLoading={deleting}
            >
              🗑️ Archive & Delete All
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}