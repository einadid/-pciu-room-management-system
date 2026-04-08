'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { RoomAvailability, TimeSlot, DayOfWeek, DAYS } from '@/types';
import { getCurrentDay, getCurrentTimeSlotId } from '@/lib/utils';

export default function CheckRoomPage() {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Sunday');
  const [selectedSlot, setSelectedSlot] = useState<number>(0);
  const [roomType, setRoomType] = useState<string>('');
  const [building, setBuilding] = useState<string>('');
  
  const [availability, setAvailability] = useState<RoomAvailability[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Auto-set current day and time on mount
  useEffect(() => {
    fetchTimeSlots();
    
    const currentDay = getCurrentDay();
    if (DAYS.includes(currentDay as DayOfWeek)) {
      setSelectedDay(currentDay as DayOfWeek);
    }
  }, []);

  useEffect(() => {
    if (timeSlots.length > 0) {
      const currentSlotId = getCurrentTimeSlotId();
      if (currentSlotId) {
        setSelectedSlot(currentSlotId);
      } else {
        setSelectedSlot(timeSlots[0].id);
      }
    }
  }, [timeSlots]);

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

  // Get current time slot name
  const currentSlotName = timeSlots.find(s => s.id === selectedSlot)?.slot_name || '';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold font-display text-gray-900 mb-3">
          🔍 Check Room Availability
        </h1>
        <p className="text-gray-600 text-lg">
          Find free classrooms and labs instantly
        </p>
      </div>

      {/* Current Status Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 mb-8 border border-blue-100">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xl">📅</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Today is</p>
              <p className="text-lg font-bold text-gray-900">{getCurrentDay()}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-cyan-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xl">⏰</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Current Time</p>
              <p className="text-lg font-bold text-gray-900">
                {new Date().toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>

          <Button
            onClick={() => {
              const currentDay = getCurrentDay();
              if (DAYS.includes(currentDay as DayOfWeek)) {
                setSelectedDay(currentDay as DayOfWeek);
              }
              const currentSlotId = getCurrentTimeSlotId();
              if (currentSlotId && timeSlots.length > 0) {
                setSelectedSlot(currentSlotId);
              }
              setTimeout(() => checkAvailability(), 100);
            }}
            className="whitespace-nowrap"
          >
            🔄 Check Now
          </Button>
        </div>
      </div>

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

          {/* Building Filter */}
          <Select
            label="Building (Optional)"
            value={building}
            onChange={(e) => setBuilding(e.target.value)}
            options={[
              { value: 'Main Building', label: 'Main Building' },
              { value: 'A Building', label: 'A Building' },
              { value: 'B Building', label: 'B Building' },
              { value: 'C Building', label: 'C Building' },
              { value: 'D Building', label: 'D Building' },
            ]}
            placeholder="All buildings"
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
          🔍 Check Availability
        </Button>
      </Card>

      {/* Results Summary */}
      {availability.length > 0 && (
        <>
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-4xl font-bold text-green-600">
                    {freeRooms.length}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Free Rooms</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {selectedDay} • {currentSlotName}
                  </div>
                </div>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl">✓</span>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-4xl font-bold text-red-600">
                    {occupiedRooms.length}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Occupied Rooms</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {selectedDay} • {currentSlotName}
                  </div>
                </div>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl">✕</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="bg-gray-50 rounded-xl p-4 mb-8">
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">
                  <strong>{freeRooms.length}</strong> rooms available
                </span>
              </div>
              <div className="w-px h-4 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-gray-700">
                  <strong>{occupiedRooms.length}</strong> rooms occupied
                </span>
              </div>
              <div className="w-px h-4 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">
                  <strong>{Math.round((freeRooms.length / availability.length) * 100)}%</strong> availability
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Free Rooms */}
      {freeRooms.length > 0 && (
        <Card title="✅ Available Rooms" subtitle="Ready to use right now" className="mb-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {freeRooms.map((room) => (
              <div
                key={room.room.id}
                className="border-2 border-green-200 bg-green-50 rounded-xl p-4 hover:border-green-400 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {room.room.room_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {room.room.building}
                    </p>
                  </div>
                  <Badge variant="free">Free</Badge>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">👥</span>
                    <span>Capacity: {room.room.capacity}</span>
                  </div>
                  
                  {room.owned_by && room.owned_by.length > 0 && (
                    <div className="pt-2 border-t border-green-200">
                      <p className="text-xs text-gray-500 mb-1">Usually used by:</p>
                      <div className="flex flex-wrap gap-1">
                        {room.owned_by.map((dept) => (
                          <Badge key={dept} variant="default" className="text-xs">
                            {dept}
                          </Badge>
                        ))}
                      </div>
                      {room.is_exclusive && (
                        <p className="text-xs text-green-700 mt-2 flex items-center gap-1">
                          <span>🔒</span>
                          <span>Exclusive to {room.owned_by[0]}</span>
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
        <Card title="❌ Occupied Rooms" subtitle="Currently in use">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {occupiedRooms.map((room) => (
              <div
                key={room.room.id}
                className="border-2 border-red-200 bg-red-50 rounded-xl p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {room.room.room_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {room.room.building}
                    </p>
                  </div>
                  <Badge variant="occupied">Busy</Badge>
                </div>

                {room.current_class && (
                  <div className="mt-3 p-3 bg-white rounded-lg border border-red-100">
                    <p className="font-semibold text-gray-900 text-sm mb-1">
                      {room.current_class.course_name}
                    </p>
                    {room.current_class.teacher_name && (
                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        <span>👨‍🏫</span>
                        <span>{room.current_class.teacher_name}</span>
                      </p>
                    )}
                    <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                      <span>📚</span>
                      <span>{room.current_class.department}</span>
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
          <div className="text-center py-16">
            <div className="text-8xl mb-6">🔍</div>
            <h3 className="text-2xl font-bold font-display text-gray-900 mb-3">
              Ready to Find Rooms?
            </h3>
            <p className="text-gray-500 text-lg mb-6">
              Select a day and time slot above to check room availability
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => {
                  const currentDay = getCurrentDay();
                  if (DAYS.includes(currentDay as DayOfWeek)) {
                    setSelectedDay(currentDay as DayOfWeek);
                  }
                  const currentSlotId = getCurrentTimeSlotId();
                  if (currentSlotId && timeSlots.length > 0) {
                    setSelectedSlot(currentSlotId);
                  }
                }}
              >
                Set Current Time
              </Button>
              <Button variant="secondary" onClick={() => window.location.href = '/rooms'}>
                Browse All Rooms
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}