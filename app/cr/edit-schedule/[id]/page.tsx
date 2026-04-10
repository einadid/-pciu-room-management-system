'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { DAYS } from '@/types';

interface TimeSlot {
  id: number;
  slot_name: string;
  start_time: string;
  end_time: string;
}

interface Room {
  id: number;
  room_name: string;
  building: string;
  room_type: string;
}

export default function EditSchedulePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');

  const [formData, setFormData] = useState({
    course_name: '',
    course_code: '',
    teacher_name: '',
    day_of_week: '',
    time_slot_id: '',
    room_id: ''
  });

  useEffect(() => {
    console.log('Schedule ID from params:', id);
    fetchData();
    if (id) {
      fetchScheduleDetails(id);
    }
  }, [id]);

  const fetchScheduleDetails = async (scheduleId: string) => {
    try {
      const token = localStorage.getItem('access_token');
      const url = `/api/schedules?id=${scheduleId}`;
      
      console.log('Fetching from URL:', url);
      setDebugInfo(`Fetching schedule ID: ${scheduleId}`);
      
      const res = await fetch(url, {
        headers: { 
          'Authorization': `Bearer ${token}` 
        },
      });
      
      const data = await res.json();
      console.log('API Response:', data);
      setDebugInfo(`Response: ${JSON.stringify(data, null, 2)}`);
      
      if (data.success && data.data && data.data.length > 0) {
        const schedule = data.data[0];
        console.log('Schedule found:', schedule);
        
        setFormData({
          course_name: schedule.course_name || '',
          course_code: schedule.course_code || '',
          teacher_name: schedule.teacher_name || '',
          day_of_week: schedule.day_of_week || '',
          time_slot_id: schedule.time_slot_id?.toString() || '',
          room_id: schedule.room_id?.toString() || ''
        });
        setError('');
      } else if (data.success && (!data.data || data.data.length === 0)) {
        setError(`Schedule with ID ${scheduleId} not found in database`);
      } else {
        setError(data.error || 'Failed to load schedule');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Network error: Failed to load schedule details');
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
      
      console.log('Time slots:', slotsData);
      console.log('Rooms:', roomsData);
      
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
          course_name: formData.course_name,
          course_code: formData.course_code || null,
          teacher_name: formData.teacher_name || null,
          day_of_week: formData.day_of_week,
          room_id: Number(formData.room_id),
          time_slot_id: Number(formData.time_slot_id),
        }),
      });

      const data = await res.json();
      console.log('Update response:', data);
      
      if (data.success) {
        setSuccess(true);
        alert('✅ Schedule updated successfully!');
        setTimeout(() => router.push('/cr'), 1500);
      } else {
        setError(data.error || 'Failed to update schedule');
      }
    } catch (err) {
      console.error('Update error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading schedule (ID: {id})...</p>
        </div>
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

      {/* Debug Info - Remove after fixing */}
      {/* <div className="mb-4 p-4 bg-gray-100 rounded-lg text-xs">
        <p><strong>Debug - Schedule ID:</strong> {id}</p>
        <p><strong>Debug - URL:</strong> /api/schedules?id={id}</p>
        {debugInfo && (
          <details>
            <summary>API Response</summary>
            <pre className="mt-2 overflow-auto max-h-40">{debugInfo}</pre>
          </details>
        )}
      </div> */}

      <Card title="✏️ Edit Class Schedule">
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            ✅ Schedule updated successfully!
          </div>
        )}
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Course Name *"
            placeholder="e.g., Data Structures"
            value={formData.course_name}
            onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
            required
          />

          <Input
            label="Course Code"
            placeholder="e.g., CSE-201"
            value={formData.course_code}
            onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
          />

          <Input
            label="Teacher Name"
            placeholder="e.g., Dr. Ahmed"
            value={formData.teacher_name}
            onChange={(e) => setFormData({ ...formData, teacher_name: e.target.value })}
          />

          <div className="grid md:grid-cols-2 gap-4">
            <Select
              label="Day *"
              value={formData.day_of_week}
              onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
              options={DAYS.map((d) => ({ value: d, label: d }))}
              placeholder="Select day"
              required
            />

            <Select
              label="Time Slot *"
              value={formData.time_slot_id}
              onChange={(e) => setFormData({ ...formData, time_slot_id: e.target.value })}
              options={timeSlots.map((s) => ({ 
                value: s.id.toString(), 
                label: `${s.slot_name} (${s.start_time} - ${s.end_time})` 
              }))}
              placeholder="Select time"
              required
            />
          </div>

          <Select
            label="Room *"
            value={formData.room_id}
            onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
            options={rooms.map((r) => ({ 
              value: r.id.toString(), 
              label: `${r.room_name} (${r.building})` 
            }))}
            placeholder="Select room"
            required
          />

          <div className="flex gap-3 pt-4">
            <Button type="submit" isLoading={loading} className="flex-1">
              {loading ? 'Saving...' : '💾 Save Changes'}
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