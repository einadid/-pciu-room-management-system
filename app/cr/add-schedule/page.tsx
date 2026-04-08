'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { TimeSlot, RoomWithType, DayOfWeek, DAYS } from '@/types';

export default function AddSchedulePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [rooms, setRooms] = useState<RoomWithType[]>([]);

  const [formData, setFormData] = useState({
    room_id: '',
    course_name: '',
    course_code: '',
    teacher_name: '',
    day_of_week: '' as DayOfWeek | '',
    time_slot_id: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

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
      fetchData();
      setCheckingAuth(false);
    } catch (err) {
      localStorage.clear();
      router.replace('/login');
    }
  }, [router]);

  const fetchData = async () => {
    try {
      const [slotsRes, roomsRes] = await Promise.all([
        fetch('/api/time-slots'),
        fetch('/api/rooms'),
      ]);

      const slotsData = await slotsRes.json();
      const roomsData = await roomsRes.json();

      if (slotsData.success) setTimeSlots(slotsData.data);
      if (roomsData.success) setRooms(roomsData.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const token = localStorage.getItem('access_token');

      const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          room_id: Number(formData.room_id),
          time_slot_id: Number(formData.time_slot_id),
          department: user?.department,
          batch_name: user?.batch_name,
          section_name: user?.section_name,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setFormData({
          room_id: '',
          course_name: '',
          course_code: '',
          teacher_name: '',
          day_of_week: '',
          time_slot_id: '',
        });

        setTimeout(() => {
          router.push('/cr/schedules');
        }, 1500);
      } else {
        setError(data.error || 'Failed to create schedule');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="secondary" onClick={() => router.push('/cr')}>
          ← Back to Dashboard
        </Button>
      </div>

      <Card title="➕ Add New Class Schedule">
        {/* User Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-blue-900 mb-2">Adding schedule for:</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">{user?.department}</Badge>
            <Badge variant="lab">{user?.batch_name || 'No Batch'}</Badge>
            <Badge variant="classroom">Section {user?.section_name || 'N/A'}</Badge>
          </div>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            ✅ Schedule created successfully! Redirecting...
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Course Name *"
              placeholder="e.g., Data Structures"
              value={formData.course_name}
              onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
              required
            />

            <Input
              label="Course Code"
              placeholder="e.g., CSE201"
              value={formData.course_code}
              onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
            />
          </div>

          <Input
            label="Teacher Name"
            placeholder="e.g., Dr. Ahmed Hassan"
            value={formData.teacher_name}
            onChange={(e) => setFormData({ ...formData, teacher_name: e.target.value })}
          />

          <div className="grid md:grid-cols-2 gap-4">
            <Select
              label="Day *"
              value={formData.day_of_week}
              onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value as DayOfWeek })}
              options={DAYS.map((day) => ({ value: day, label: day }))}
              required
            />

            <Select
              label="Time Slot *"
              value={formData.time_slot_id}
              onChange={(e) => setFormData({ ...formData, time_slot_id: e.target.value })}
              options={timeSlots.map((slot) => ({
                value: slot.id,
                label: `${slot.slot_name} (${slot.start_time.slice(0, 5)} - ${slot.end_time.slice(0, 5)})`,
              }))}
              required
            />
          </div>

          <Select
            label="Room *"
            value={formData.room_id}
            onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
            options={rooms.map((room) => ({
              value: room.id,
              label: `${room.room_name} - ${room.building} (${room.room_types?.type_name || 'Room'})`,
            }))}
            required
          />

          <div className="flex gap-4">
            <Button
              type="submit"
              isLoading={loading}
              className="flex-1"
            >
              Create Schedule
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push('/cr')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}