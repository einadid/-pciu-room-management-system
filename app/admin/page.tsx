'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { User } from '@/types';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState({
    totalRooms: 0,
    totalUsers: 0,
    totalSchedules: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
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

    setUser(parsedUser);
    fetchStats();
  }, [router]);

  const fetchStats = async () => {
    try {
      const roomsRes = await fetch('/api/rooms');
      const roomsData = await roomsRes.json();
      
      if (roomsData.success) {
        setStats(prev => ({ ...prev, totalRooms: roomsData.data.length }));
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <Badge variant="special">Admin</Badge>
          </div>
          <p className="text-gray-600">
            Welcome back, {user?.name}
          </p>
        </div>
        <Button variant="secondary" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-blue-600">
                {stats.totalRooms}
              </div>
              <div className="text-sm text-gray-500 mt-1">Total Rooms</div>
            </div>
            <div className="text-4xl">🏫</div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-green-600">6</div>
              <div className="text-sm text-gray-500 mt-1">Time Slots</div>
            </div>
            <div className="text-4xl">⏰</div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-purple-600">7</div>
              <div className="text-sm text-gray-500 mt-1">Days/Week</div>
            </div>
            <div className="text-4xl">📅</div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-orange-600">8</div>
              <div className="text-sm text-gray-500 mt-1">Departments</div>
            </div>
            <div className="text-4xl">🎓</div>
          </div>
        </Card>
      </div>

      {/* Admin Actions */}
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Quick Actions
      </h2>
      
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card className="hover:border-blue-300 transition-colors cursor-pointer">
          <div 
            onClick={() => router.push('/admin/generate-token')}
            className="text-center py-4"
          >
            <div className="text-5xl mb-4">🔑</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Generate CR Token
            </h3>
            <p className="text-sm text-gray-500">
              Create new token for Class Representatives
            </p>
          </div>
        </Card>

        <Card className="hover:border-green-300 transition-colors cursor-pointer">
          <div 
            onClick={() => router.push('/admin/users')}
            className="text-center py-4"
          >
            <div className="text-5xl mb-4">👥</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Manage Users
            </h3>
            <p className="text-sm text-gray-500">
              View and manage all CR accounts
            </p>
          </div>
        </Card>

        <Card className="hover:border-purple-300 transition-colors cursor-pointer">
          <div 
            onClick={() => router.push('/admin/rooms')}
            className="text-center py-4"
          >
            <div className="text-5xl mb-4">🚪</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Manage Rooms
            </h3>
            <p className="text-sm text-gray-500">
              Add, edit, or deactivate rooms
            </p>
          </div>
        </Card>

        <Card className="hover:border-orange-300 transition-colors cursor-pointer">
          <div 
            onClick={() => router.push('/admin/schedules')}
            className="text-center py-4"
          >
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              All Schedules
            </h3>
            <p className="text-sm text-gray-500">
              View schedules from all departments
            </p>
          </div>
        </Card>

        <Card className="hover:border-red-300 transition-colors cursor-pointer">
          <div 
            onClick={() => router.push('/admin/ownership')}
            className="text-center py-4"
          >
            <div className="text-5xl mb-4">🏷️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Room Ownership
            </h3>
            <p className="text-sm text-gray-500">
              See which rooms belong to which dept
            </p>
          </div>
        </Card>

        <Card className="hover:border-cyan-300 transition-colors cursor-pointer">
          <div 
            onClick={() => router.push('/check-room')}
            className="text-center py-4"
          >
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Check Availability
            </h3>
            <p className="text-sm text-gray-500">
              Quick room availability check
            </p>
          </div>
        </Card>
      </div>

      {/* System Info */}
      <Card title="📊 System Information">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Buildings</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Main Building</p>
              <p>• A Building</p>
              <p>• B Building</p>
              <p>• C Building</p>
              <p>• D Building</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Departments</h4>
            <div className="flex flex-wrap gap-2">
              {['CSE', 'EEE', 'Civil', 'BBA', 'English', 'Law', 'Pharmacy', 'Architecture'].map((dept) => (
                <Badge key={dept} variant="default">{dept}</Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}