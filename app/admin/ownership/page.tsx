'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

interface RoomOwnershipData {
  room: {
    id: number;
    room_name: string;
    building: string;
    room_types: {
      type_name: string;
    };
  };
  departments: string[];
  is_exclusive: boolean;
}

export default function AdminOwnershipPage() {
  const router = useRouter();
  const [ownership, setOwnership] = useState<RoomOwnershipData[]>([]);
  const [loading, setLoading] = useState(true);

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

    fetchOwnership(token);
  }, [router]);

  const fetchOwnership = async (token: string) => {
    try {
      const res = await fetch('/api/rooms/ownership', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        // Group by room
        const grouped = data.data.reduce((acc: any, item: any) => {
          const roomId = item.rooms.id;
          if (!acc[roomId]) {
            acc[roomId] = {
              room: item.rooms,
              departments: [],
              is_exclusive: false,
            };
          }
          acc[roomId].departments.push(item.department);
          return acc;
        }, {});

        const ownershipData = Object.values(grouped).map((item: any) => ({
          ...item,
          is_exclusive: item.departments.length === 1,
        }));

        setOwnership(ownershipData);
      }
    } catch (err) {
      console.error('Failed to fetch ownership:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const exclusiveRooms = ownership.filter(o => o.is_exclusive);
  const sharedRooms = ownership.filter(o => !o.is_exclusive);
  const unassignedCount = 61 - ownership.length; // Assuming 61 total rooms

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display text-gray-900 mb-2">
            Room Ownership
          </h1>
          <p className="text-gray-600">
            Track which departments use which rooms
          </p>
        </div>
        <Button variant="secondary" onClick={() => router.push('/admin')}>
          ← Back to Dashboard
        </Button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card>
          <div className="text-3xl font-bold text-blue-600">{ownership.length}</div>
          <div className="text-sm text-gray-500 mt-1">Assigned Rooms</div>
        </Card>
        <Card>
          <div className="text-3xl font-bold text-green-600">{exclusiveRooms.length}</div>
          <div className="text-sm text-gray-500 mt-1">Exclusive Rooms</div>
        </Card>
        <Card>
          <div className="text-3xl font-bold text-orange-600">{sharedRooms.length}</div>
          <div className="text-sm text-gray-500 mt-1">Shared Rooms</div>
        </Card>
        <Card>
          <div className="text-3xl font-bold text-gray-600">{unassignedCount}</div>
          <div className="text-sm text-gray-500 mt-1">Unassigned</div>
        </Card>
      </div>

      {/* Exclusive Rooms */}
      {exclusiveRooms.length > 0 && (
        <Card title="🔒 Exclusive Rooms" subtitle="Used by only one department" className="mb-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exclusiveRooms.map((item) => (
              <div
                key={item.room.id}
                className="border border-green-200 bg-green-50 rounded-xl p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {item.room.room_name}
                    </h3>
                    <p className="text-sm text-gray-600">{item.room.building}</p>
                  </div>
                  <Badge variant="lab">{item.room.room_types.type_name}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Exclusive to:</span>
                  <Badge variant="default">{item.departments[0]}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Shared Rooms */}
      {sharedRooms.length > 0 && (
        <Card title="🤝 Shared Rooms" subtitle="Used by multiple departments">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sharedRooms.map((item) => (
              <div
                key={item.room.id}
                className="border border-blue-200 bg-blue-50 rounded-xl p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {item.room.room_name}
                    </h3>
                    <p className="text-sm text-gray-600">{item.room.building}</p>
                  </div>
                  <Badge variant="classroom">{item.room.room_types.type_name}</Badge>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block mb-2">
                    Shared by {item.departments.length} departments:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {item.departments.map((dept) => (
                      <Badge key={dept} variant="default" className="text-xs">
                        {dept}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {ownership.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏷️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Room Assignments Yet
            </h3>
            <p className="text-gray-500">
              Rooms will be automatically assigned when CRs create schedules
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}