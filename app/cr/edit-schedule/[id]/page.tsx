'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { TimeSlot, RoomWithType, DayOfWeek, DAYS } from '@/types';

export default function EditSchedulePage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [rooms, setRooms] = useState<RoomWithType[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    course_name: '',
    course_code: '',
    teacher_name: '',
    day_of_week: '',
    time_slot_id: '',
    room_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);
  
  useEffect(() => {
    if (id) {
      fetchScheduleDetails(id as string);
    }
  }, [id]);

  const fetchScheduleDetails = async (scheduleId: string) => {
    try {
      const res = await fetch(`/api/schedules?id=${scheduleId}`);
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        const schedule = data.data[0];
        setFormData({
          course_name: schedule.course_name,
          course_code: schedule.course_code || '',
          teacher_name: schedule.teacher_name || '',
          day_of_week: schedule.day_of_week,
          time_slot_id: schedule.time_slot_id.toString(),
          room_id: schedule.room_id.toString()
        });
      } else {
        setError('Schedule not found');
      }
    } catch (err) {
      setError('Failed to load schedule details');
    } finally {
      setFetching(false);
    }
  };

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
      const res = await fetch(`/api/schedules/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          room_id: Number(formData.room_id),
          time_slot_id: Number(formData.time_slot_id),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => router.push('/cr/schedules'), 1500);
      } else {
        setError(data.error || 'Failed to update schedule');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };
  
  if (fetching) return <div className="p-8">Loading schedule...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="secondary" onClick={() => router.back()}>
          ← Back
        </Button>
      </div>
      <Card title="✏️ Edit Class Schedule">
        {success && <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg">✅ Schedule updated successfully!</div>}
        {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">❌ {error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Course Name"
            value={formData.course_name}
            onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
          />
          <Input
            label="Course Code"
            value={formData.course_code}
            onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
          />
          <Input
            label="Teacher Name"
            value={formData.teacher_name}
            onChange={(e) => setFormData({ ...formData, teacher_name: e.target.value })}
          />
          <div className="grid md:grid-cols-2 gap-4">
            <Select
              label="Day"
              value={formData.day_of_week}
              onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
              options={DAYS.map((d) => ({ value: d, label: d }))}
            />
            <Select
              label="Time Slot"
              value={formData.time_slot_id}
              onChange={(e) => setFormData({ ...formData, time_slot_id: e.target.value })}
              options={timeSlots.map((s) => ({ value: s.id, label: s.slot_name }))}
            />
          </div>
          <Select
            label="Room"
            value={formData.room_id}
            onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
            options={rooms.map((r) => ({ value: r.id, label: r.room_name }))}
          />
          <Button type="submit" isLoading={loading} className="w-full">
            Save Changes
          </Button>
        </form>
      </Card>
    </div>
  );
}