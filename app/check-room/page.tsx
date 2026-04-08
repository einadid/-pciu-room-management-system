'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { RoomAvailability, TimeSlot, DayOfWeek, DAYS } from '@/types';

export default function CheckRoomPage() {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Sunday');
  const [selectedSlot, setSelectedSlot] = useState<number>(0);
  const [roomType, setRoomType] = useState<string>('');
  const [building, setBuilding] = useState<string>('');
  
  const [availability, setAvailability] = useState<RoomAvailability[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Load time slots on mount
  useEffect(() => {
    fetchTimeSlots();
  }, []);

  const fetchTimeSlots = async () => {
    try {
      const res = await fetch('/api/time-slots');
      const data = await res.json();
      if (data.success) {
        setTimeSlots(data.data);
      }
    } catch (err) {
      console.error('Failed to load time slots:', err);
    }
  };

  const checkAvailability = async () => {
    if (!selectedDay || !selectedSlot) {
      setError('Please select both day and time slot');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          day: selectedDay,
          time_slot_id: selectedSlot,
          room_type: roomType || undefined,
          building: building || undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setAvailability(data.data);
      } else {
        setError(data.error || 'Failed to check availability');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const freeRooms = availability.filter((r) => r.status === 'free');
  const occupiedRooms = availability.filter((r) => r.status === 'occupied');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        🔍 Check Room Availability
      </h1>

      {/* Filter Form */}
      <Card className="mb-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Day Selection */}
          <Select
            label="Day"
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value as DayOfWeek)}
            options={DAYS.map((day) => ({ value: day, label: day }))}
          />

          {/* Time Slot Selection */}
          <Select
            label="Time Slot"
            value={selectedSlot}
            onChange={(e) => setSelectedSlot(Number(e.target.value))}
            options={timeSlots.map((slot) => ({
              value: slot.id,
              label: `${slot.slot_name} (${slot.start_time.slice(0, 5)} - ${slot.end_time.slice(0, 5)})`,
            }))}
            placeholder="Select time slot"
          />

          {/* Room Type Filter */}
          <Select
            label="Room Type (Optional)"
            value={roomType}
            onChange={(e) => setRoomType(e.target.value)}
            options={[
              { value: 'Classroom', label: 'Classroom' },
              { value: 'Lab', label: 'Lab' },
              { value: 'Special', label: 'Special' },
            ]}
            placeholder="All types"
          />

       
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <Button
          onClick={checkAvailability}
          isLoading={loading}
          size="lg"
          className="w-full md:w-auto"
        >
          Check Availability
        </Button>
      </Card>

      {/* Results Summary */}
      {availability.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-green-600">
                  {freeRooms.length}
                </div>
                <div className="text-sm text-gray-500 mt-1">Free Rooms</div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">✓</span>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-red-600">
                  {occupiedRooms.length}
                </div>
                <div className="text-sm text-gray-500 mt-1">Occupied Rooms</div>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">✕</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Free Rooms */}
      {freeRooms.length > 0 && (
        <Card title="✅ Free Rooms" className="mb-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {freeRooms.map((room) => (
              <div
                key={room.room.id}
                className="border border-green-200 bg-green-50 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {room.room.room_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {room.room.building} Building
                    </p>
                  </div>
                  <Badge variant="free">Free</Badge>
                </div>

                <div className="text-sm text-gray-600 space-y-1">
                  <p>Capacity: {room.room.capacity}</p>
                  
                  {/* Room Ownership Info */}
                  {room.owned_by && room.owned_by.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-green-200">
                      <p className="font-medium text-gray-700">Used by:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {room.owned_by.map((dept) => (
                          <Badge key={dept} variant="default">
                            {dept}
                          </Badge>
                        ))}
                      </div>
                      {room.is_exclusive && (
                        <p className="text-xs text-green-700 mt-1">
                          🔒 Exclusive to {room.owned_by[0]}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Occupied Rooms */}
      {occupiedRooms.length > 0 && (
        <Card title="❌ Occupied Rooms">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {occupiedRooms.map((room) => (
              <div
                key={room.room.id}
                className="border border-red-200 bg-red-50 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {room.room.room_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {room.room.building} Building
                    </p>
                  </div>
                  <Badge variant="occupied">Occupied</Badge>
                </div>

                {room.current_class && (
                  <div className="mt-3 p-3 bg-white rounded border border-red-100">
                    <p className="font-medium text-gray-900 text-sm">
                      {room.current_class.course_name}
                    </p>
                    {room.current_class.teacher_name && (
                      <p className="text-xs text-gray-600 mt-1">
                        👨‍🏫 {room.current_class.teacher_name}
                      </p>
                    )}
                    <p className="text-xs text-gray-600 mt-1">
                      📚 {room.current_class.department}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Empty State */}
      {availability.length === 0 && !loading && (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Results Yet
            </h3>
            <p className="text-gray-500">
              Select a day and time slot to check room availability
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}