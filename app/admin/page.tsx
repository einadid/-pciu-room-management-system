'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');

    if (!userData || !token) {
      router.replace('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      
      if (parsedUser.role !== 'admin' && parsedUser.role !== 'superadmin') {
        router.replace('/login');
        return;
      }

      setUser(parsedUser);
      setLoading(false);
    } catch (err) {
      localStorage.clear();
      router.replace('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.replace('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <Badge variant="special">{user.role}</Badge>
          </div>
          <p className="text-gray-600">Welcome back, {user.name}</p>
        </div>
        <Button variant="danger" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        <Card 
          className="hover:border-blue-300 cursor-pointer transition-colors"
          onClick={() => router.push('/admin/generate-token')}
        >
          <div className="text-center py-4">
            <div className="text-5xl mb-4">🔑</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Generate Token</h3>
            <p className="text-sm text-gray-500">Create CR accounts</p>
          </div>
        </Card>

        <Card 
          className="hover:border-green-300 cursor-pointer transition-colors"
          onClick={() => router.push('/admin/users')}
        >
          <div className="text-center py-4">
            <div className="text-5xl mb-4">👥</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Users</h3>
            <p className="text-sm text-gray-500">View all users</p>
          </div>
        </Card>

        {/* NEW: Room Management */}
        <Card 
          className="hover:border-yellow-300 cursor-pointer transition-colors"
          onClick={() => router.push('/admin/rooms')}
        >
          <div className="text-center py-4">
            <div className="text-5xl mb-4">🏢</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Rooms</h3>
            <p className="text-sm text-gray-500">Add & delete rooms</p>
          </div>
        </Card>

        <Card 
          className="hover:border-purple-300 cursor-pointer transition-colors"
          onClick={() => router.push('/admin/schedules')}
        >
          <div className="text-center py-4">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">All Schedules</h3>
            <p className="text-sm text-gray-500">View all classes</p>
          </div>
        </Card>

        <Card 
          className="hover:border-orange-300 cursor-pointer transition-colors"
          onClick={() => router.push('/admin/feedback')}
        >
          <div className="text-center py-4">
            <div className="text-5xl mb-4">📬</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Messages</h3>
            <p className="text-sm text-gray-500">Contact submissions</p>
          </div>
        </Card>

        <Card 
          className="hover:border-cyan-300 cursor-pointer transition-colors"
          onClick={() => router.push('/check-room')}
        >
          <div className="text-center py-4">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Check Room</h3>
            <p className="text-sm text-gray-500">Room availability</p>
          </div>
        </Card>

        <Card 
          className="hover:border-pink-300 cursor-pointer transition-colors"
          onClick={() => router.push('/routine')}
        >
          <div className="text-center py-4">
            <div className="text-5xl mb-4">📅</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">View Routine</h3>
            <p className="text-sm text-gray-500">Class schedules</p>
          </div>
        </Card>
      </div>

      {/* User Info */}
      <Card title="👤 Your Info">
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="font-medium">{user.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{user.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Role</p>
            <Badge variant="special">{user.role}</Badge>
          </div>
          <div>
            <p className="text-sm text-gray-500">Token</p>
            <code className="text-sm bg-gray-100 px-2 py-1 rounded">{user.token_id}</code>
          </div>
        </div>
      </Card>
    </div>
  );
}