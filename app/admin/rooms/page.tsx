'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';

interface Room {
  id: number;
  room_name: string;
  building: string;
  capacity: number | null;
}

export default function AdminRoomsPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [newRoom, setNewRoom] = useState({
    room_name: '',
    building: '',
    capacity: '',
  });

  useEffect(() => {
    checkAuth();
    fetchRooms();
  }, []);

  const checkAuth = () => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.replace('/login');
      return;
    }
    
    const user = JSON.parse(userData);
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      router.replace('/login');
    }
  };

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

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          room_name: newRoom.room_name,
          building: newRoom.building,
          capacity: newRoom.capacity ? parseInt(newRoom.capacity) : null,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess('✅ Room added successfully!');
        setNewRoom({ room_name: '', building: '', capacity: '' });
        setShowAddForm(false);
        fetchRooms();
      } else {
        setError(data.error || 'Failed to add room');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteRoom = async (roomId: number, roomName: string) => {
    if (!confirm(`Are you sure you want to delete "${roomName}"?`)) {
      return;
    }

    setDeletingId(roomId);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`/api/rooms/${roomId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setSuccess('✅ Room deleted successfully!');
        setRooms(rooms.filter(r => r.id !== roomId));
      } else {
        setError(data.error || 'Failed to delete room');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setDeletingId(null);
    }
  };

  // Group rooms by building
  const groupedRooms = rooms.reduce((acc, room) => {
    if (!acc[room.building]) {
      acc[room.building] = [];
    }
    acc[room.building].push(room);
    return acc;
  }, {} as { [building: string]: Room[] });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <Button variant="secondary" onClick={() => router.push('/admin')}>
            ← Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">🏢 Room Management</h1>
          <p className="text-gray-600">Add, view, and delete rooms</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? '✕ Cancel' : '➕ Add Room'}
        </Button>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          ❌ {error}
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      {/* Add Room Form */}
      {showAddForm && (
        <Card title="➕ Add New Room" className="mb-8">
          <form onSubmit={handleAddRoom} className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <Input
                label="Room Name *"
                placeholder="e.g., 301, Lab-1, Seminar Hall"
                value={newRoom.room_name}
                onChange={(e) => setNewRoom({ ...newRoom, room_name: e.target.value })}
                required
              />
              <Input
                label="Building *"
                placeholder="e.g., Building A, Main Building"
                value={newRoom.building}
                onChange={(e) => setNewRoom({ ...newRoom, building: e.target.value })}
                required
              />
              <Input
                label="Capacity"
                type="number"
                placeholder="e.g., 40"
                value={newRoom.capacity}
                onChange={(e) => setNewRoom({ ...newRoom, capacity: e.target.value })}
              />
            </div>
            <Button type="submit" isLoading={adding}>
              {adding ? 'Adding...' : '➕ Add Room'}
            </Button>
          </form>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{rooms.length}</div>
            <div className="text-sm text-gray-500">Total Rooms</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{Object.keys(groupedRooms).length}</div>
            <div className="text-sm text-gray-500">Buildings</div>
          </div>
        </Card>
      </div>

      {/* Rooms List by Building */}
      {Object.keys(groupedRooms).length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏢</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Rooms Yet</h3>
            <p className="text-gray-500 mb-4">Start by adding your first room</p>
            <Button onClick={() => setShowAddForm(true)}>
              ➕ Add First Room
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedRooms).map(([building, buildingRooms]) => (
            <Card key={building} title={`🏢 ${building}`}>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {buildingRooms.map((room) => (
                  <div
                    key={room.id}
                    className="border rounded-lg p-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{room.room_name}</h3>
                      <Badge variant="default">#{room.id}</Badge>
                    </div>
                    {room.capacity && (
                      <p className="text-sm text-gray-500 mb-3">
                        👥 Capacity: {room.capacity}
                      </p>
                    )}
                    <button
                      onClick={() => handleDeleteRoom(room.id, room.room_name)}
                      disabled={deletingId === room.id}
                      className={`w-full text-sm px-3 py-2 rounded-lg transition-colors ${
                        deletingId === room.id
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-red-50 text-red-600 hover:bg-red-100'
                      }`}
                    >
                      {deletingId === room.id ? '⏳ Deleting...' : '🗑️ Delete'}
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}