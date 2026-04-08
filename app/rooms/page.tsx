'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Select from '@/components/ui/Select';
import { RoomWithType } from '@/types';

export default function RoomsPage() {
  const [rooms, setRooms] = useState<RoomWithType[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [filterBuilding, setFilterBuilding] = useState('');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await fetch('/api/rooms');
      const data = await res.json();

      if (data.success) {
        setRooms(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = rooms.filter((room) => {
    if (filterType && room.room_types?.type_name !== filterType) return false;
    if (filterBuilding && room.building !== filterBuilding) return false;
    return true;
  });

  const classrooms = filteredRooms.filter(r => r.room_types?.type_name === 'Classroom');
  const labs = filteredRooms.filter(r => r.room_types?.type_name === 'Lab');
  const special = filteredRooms.filter(r => r.room_types?.type_name === 'Special');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading rooms...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        🏫 All Rooms
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="text-center">
          <div className="text-3xl font-bold text-blue-600">{rooms.length}</div>
          <div className="text-sm text-gray-500 mt-1">Total Rooms</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600">{classrooms.length}</div>
          <div className="text-sm text-gray-500 mt-1">Classrooms</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-purple-600">{labs.length}</div>
          <div className="text-sm text-gray-500 mt-1">Labs</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-orange-600">{special.length}</div>
          <div className="text-sm text-gray-500 mt-1">Special</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <div className="grid md:grid-cols-2 gap-4">
          <Select
            label="Filter by Type"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            options={[
              { value: 'Classroom', label: 'Classroom' },
              { value: 'Lab', label: 'Lab' },
              { value: 'Special', label: 'Special' },
            ]}
            placeholder="All types"
          />

          <Select
            label="Filter by Building"
            value={filterBuilding}
            onChange={(e) => setFilterBuilding(e.target.value)}
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
      </Card>

      {/* Classrooms */}
      {(!filterType || filterType === 'Classroom') && classrooms.length > 0 && (
        <Card title="📚 Classrooms" className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {classrooms.map((room) => (
              <div
                key={room.id}
                className="border border-blue-200 bg-blue-50 rounded-lg p-3 text-center hover:bg-blue-100 transition-colors"
              >
                <div className="font-bold text-gray-900">{room.room_name}</div>
                <div className="text-xs text-gray-600 mt-1">{room.building}</div>
                <Badge variant="classroom" className="mt-2">Classroom</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Labs */}
      {(!filterType || filterType === 'Lab') && labs.length > 0 && (
        <Card title="🔬 Lab Rooms" className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {labs.map((room) => (
              <div
                key={room.id}
                className="border border-purple-200 bg-purple-50 rounded-lg p-3 text-center hover:bg-purple-100 transition-colors"
              >
                <div className="font-bold text-gray-900">{room.room_name}</div>
                <div className="text-xs text-gray-600 mt-1">{room.building}</div>
                <Badge variant="lab" className="mt-2">Lab</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Special Rooms */}
      {(!filterType || filterType === 'Special') && special.length > 0 && (
        <Card title="⭐ Special Rooms">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {special.map((room) => (
              <div
                key={room.id}
                className="border border-yellow-200 bg-yellow-50 rounded-lg p-3 text-center hover:bg-yellow-100 transition-colors"
              >
                <div className="font-bold text-gray-900">{room.room_name}</div>
                <div className="text-xs text-gray-600 mt-1">{room.building}</div>
                <Badge variant="special" className="mt-2">Special</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Empty State */}
      {filteredRooms.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Rooms Found
            </h3>
            <p className="text-gray-500">
              Try changing your filters
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}