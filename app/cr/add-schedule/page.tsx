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
    class_type: 'Theory',
    sub_section: '',
    duration_slots: 1, // NEW: 1 = 1.5 hours, 2 = 3 hours (for labs)
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Auth check
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

  // Fetch time slots and rooms
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    // Validation for Lab classes
    if (formData.class_type === 'Lab' && !formData.sub_section) {
      setError('Please select a lab group for Lab classes');
      setLoading(false);
      return;
    }

    // Validate slot range for multi-slot bookings
    const startSlotId = Number(formData.time_slot_id);
    const endSlotId = startSlotId + formData.duration_slots - 1;
    const maxSlots = timeSlots.length || 6;

    if (endSlotId > maxSlots) {
      setError(`Cannot book ${formData.duration_slots} slots starting from this time. Not enough slots remaining in the day.`);
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('access_token');

      const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          room_id: Number(formData.room_id),
          course_name: formData.course_name,
          course_code: formData.course_code || null,
          teacher_name: formData.teacher_name || null,
          day_of_week: formData.day_of_week,
          time_slot_id: Number(formData.time_slot_id),
          class_type: formData.class_type,
          duration_slots: formData.class_type === 'Lab' ? formData.duration_slots : 1, // Only labs can have multiple slots
          department: user?.department,
          batch_name: user?.batch_name,
          section_name: user?.section_name,
          sub_section: formData.class_type === 'Theory' ? null : formData.sub_section,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        // Reset form
        setFormData({
          room_id: '',
          course_name: '',
          course_code: '',
          teacher_name: '',
          day_of_week: '',
          time_slot_id: '',
          class_type: 'Theory',
          sub_section: '',
          duration_slots: 1,
        });

        setTimeout(() => {
          router.push('/cr/schedules');
        }, 1500);
      } else {
        setError(data.error || 'Failed to create schedule');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle class type change
  const handleClassTypeChange = (type: string) => {
    setFormData({
      ...formData,
      class_type: type,
      sub_section: '', // Reset sub_section when type changes
      duration_slots: type === 'Lab' ? 2 : 1, // Default 2 slots for lab, 1 for theory
      room_id: '', // Reset room selection
    });
  };

  // Filter rooms based on class type
  const filteredRooms = rooms.filter((room) => {
    if (formData.class_type === 'Lab') {
      return room.room_types?.type_name === 'Lab';
    }
    // For theory, show all rooms except labs (or show all)
    return room.room_types?.type_name !== 'Lab';
  });

  // Get available time slots (filter out slots that would exceed day limit for multi-slot booking)
  const getAvailableTimeSlots = () => {
    const maxSlots = timeSlots.length || 6;
    return timeSlots.filter((slot) => {
      const slotNumber = slot.id; // Assuming id corresponds to slot number
      const endSlot = slotNumber + formData.duration_slots - 1;
      return endSlot <= maxSlots;
    });
  };

  // Calculate end time for display
  const getEndTimeDisplay = () => {
    if (!formData.time_slot_id || formData.duration_slots <= 1) return null;

    const startSlotId = Number(formData.time_slot_id);
    const endSlotId = startSlotId + formData.duration_slots - 1;
    const endSlot = timeSlots.find((s) => s.id === endSlotId);

    if (endSlot) {
      return `Will book slots ${startSlotId} to ${endSlotId} (ends at ${endSlot.end_time.slice(0, 5)})`;
    }
    return null;
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
      {/* Back Button */}
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

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            ✅ Schedule created successfully! Redirecting...
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Class Type Selection */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">📚 Class Type</h4>
            <div className="grid grid-cols-2 gap-4">
              <label
                className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  formData.class_type === 'Theory'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="class_type"
                  value="Theory"
                  checked={formData.class_type === 'Theory'}
                  onChange={() => handleClassTypeChange('Theory')}
                  className="sr-only"
                />
                <span className="text-2xl">📖</span>
                <span className="font-medium">Theory</span>
              </label>

              <label
                className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  formData.class_type === 'Lab'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="class_type"
                  value="Lab"
                  checked={formData.class_type === 'Lab'}
                  onChange={() => handleClassTypeChange('Lab')}
                  className="sr-only"
                />
                <span className="text-2xl">🔬</span>
                <span className="font-medium">Lab</span>
              </label>
            </div>
          </div>

          {/* Lab Duration Selection (Only for Lab) */}
          {formData.class_type === 'Lab' && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-medium text-orange-900 mb-3">⏱️ Lab Duration</h4>
              <p className="text-sm text-orange-700 mb-3">
                Select how long this lab session is:
              </p>
              <div className="grid grid-cols-2 gap-4">
                <label
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.duration_slots === 1
                      ? 'border-orange-500 bg-orange-100'
                      : 'border-gray-200 bg-white hover:border-orange-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="duration"
                    value="1"
                    checked={formData.duration_slots === 1}
                    onChange={() => setFormData({ ...formData, duration_slots: 1 })}
                    className="sr-only"
                  />
                  <span className="text-2xl mb-1">🕐</span>
                  <span className="font-bold">1.5 Hours</span>
                  <span className="text-sm text-gray-500">(1 Slot)</span>
                </label>

                <label
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.duration_slots === 2
                      ? 'border-orange-500 bg-orange-100'
                      : 'border-gray-200 bg-white hover:border-orange-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="duration"
                    value="2"
                    checked={formData.duration_slots === 2}
                    onChange={() => setFormData({ ...formData, duration_slots: 2 })}
                    className="sr-only"
                  />
                  <span className="text-2xl mb-1">🕒</span>
                  <span className="font-bold">3 Hours</span>
                  <span className="text-sm text-gray-500">(2 Slots)</span>
                </label>
              </div>
            </div>
          )}

          {/* Lab Group Selection (Only for Lab) */}
          {formData.class_type === 'Lab' && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-medium text-purple-900 mb-3">👥 Lab Group</h4>
              <p className="text-sm text-purple-700 mb-3">
                Select which group this lab is for (e.g., A1, A2 for Section A)
              </p>
              <div className="grid grid-cols-4 gap-2">
                {['1', '2', '3', '4'].map((num) => (
                  <label
                    key={num}
                    className={`flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.sub_section === `${user?.section_name}${num}`
                        ? 'border-purple-500 bg-purple-100'
                        : 'border-gray-200 bg-white hover:border-purple-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="sub_section"
                      value={`${user?.section_name}${num}`}
                      checked={formData.sub_section === `${user?.section_name}${num}`}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sub_section: e.target.value,
                        })
                      }
                      className="sr-only"
                    />
                    <span className="font-bold text-lg">
                      {user?.section_name}
                      {num}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Course Details */}
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Course Name *"
              placeholder="e.g., Data Structures"
              value={formData.course_name}
              onChange={(e) =>
                setFormData({ ...formData, course_name: e.target.value })
              }
              required
            />

            <Input
              label="Course Code"
              placeholder="e.g., CSE201"
              value={formData.course_code}
              onChange={(e) =>
                setFormData({ ...formData, course_code: e.target.value })
              }
            />
          </div>

          <Input
            label="Teacher Name"
            placeholder="e.g., Dr. Ahmed Hassan"
            value={formData.teacher_name}
            onChange={(e) =>
              setFormData({ ...formData, teacher_name: e.target.value })
            }
          />

          {/* Day & Time */}
          <div className="grid md:grid-cols-2 gap-4">
            <Select
              label="Day *"
              value={formData.day_of_week}
              onChange={(e) =>
                setFormData({ ...formData, day_of_week: e.target.value as DayOfWeek })
              }
              options={DAYS.map((day) => ({ value: day, label: day }))}
              required
            />

            <div>
              <Select
                label={`Time Slot * ${formData.duration_slots > 1 ? '(Starting Slot)' : ''}`}
                value={formData.time_slot_id}
                onChange={(e) =>
                  setFormData({ ...formData, time_slot_id: e.target.value })
                }
                options={getAvailableTimeSlots().map((slot) => ({
                  value: slot.id,
                  label: `${slot.slot_name || `Slot ${slot.id}`} (${slot.start_time.slice(0, 5)} - ${slot.end_time.slice(0, 5)})`,
                }))}
                required
              />
              {/* Show end time for multi-slot bookings */}
              {getEndTimeDisplay() && (
                <p className="text-sm text-orange-600 mt-1">
                  📌 {getEndTimeDisplay()}
                </p>
              )}
            </div>
          </div>

          {/* Room Selection */}
          <Select
            label={`Room * ${formData.class_type === 'Lab' ? '(Showing Labs only)' : '(Showing Classrooms)'}`}
            value={formData.room_id}
            onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
            options={filteredRooms.map((room) => ({
              value: room.id,
              label: `${room.room_name} - ${room.building} (${room.room_types?.type_name || 'Room'})`,
            }))}
            required
          />

          {/* No rooms available message */}
          {filteredRooms.length === 0 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
              ⚠️ No {formData.class_type === 'Lab' ? 'lab rooms' : 'classrooms'} available. Please contact admin.
            </div>
          )}

          {/* Summary before submit */}
          {formData.course_name && formData.day_of_week && formData.time_slot_id && formData.room_id && (
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">📋 Summary</h4>
              <div className="text-sm space-y-1">
                <p>
                  <strong>Course:</strong> {formData.course_name} {formData.course_code && `(${formData.course_code})`}
                </p>
                <p>
                  <strong>Type:</strong> {formData.class_type}
                  {formData.class_type === 'Lab' && formData.sub_section && ` - Group ${formData.sub_section}`}
                </p>
                <p>
                  <strong>Day:</strong> {formData.day_of_week}
                </p>
                <p>
                  <strong>Duration:</strong> {formData.duration_slots * 1.5} hours ({formData.duration_slots} slot{formData.duration_slots > 1 ? 's' : ''})
                </p>
                <p>
                  <strong>Room:</strong> {filteredRooms.find(r => r.id.toString() === formData.room_id)?.room_name}
                </p>
                {formData.teacher_name && (
                  <p>
                    <strong>Teacher:</strong> {formData.teacher_name}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <Button type="submit" isLoading={loading} className="flex-1">
              {loading ? 'Creating...' : 'Create Schedule'}
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