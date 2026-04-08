'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

export default function CRDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');

    if (!userData || !token) {
      router.replace('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      
      // Only allow CR
      if (parsedUser.role !== 'cr') {
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

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {user.name}
          </h1>
          <p className="text-gray-600">
            {user.department} Department • Class Representative
          </p>
        </div>
        <Button variant="danger" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{user.department}</div>
            <div className="text-sm text-gray-500 mt-1">Department</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">CR</div>
            <div className="text-sm text-gray-500 mt-1">Role</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <code className="text-lg font-bold text-purple-600">{user.token_id}</code>
            <div className="text-sm text-gray-500 mt-1">Token ID</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">Active</div>
            <div className="text-sm text-gray-500 mt-1">Status</div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card 
          className="hover:border-blue-300 cursor-pointer transition-colors"
          onClick={() => router.push('/cr/add-schedule')}
        >
          <div className="text-center py-4">
            <div className="text-5xl mb-4">➕</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Add Class
            </h3>
            <p className="text-sm text-gray-500">
              Create new schedule
            </p>
          </div>
        </Card>

        <Card 
          className="hover:border-green-300 cursor-pointer transition-colors"
          onClick={() => router.push('/cr/schedules')}
        >
          <div className="text-center py-4">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              My Schedules
            </h3>
            <p className="text-sm text-gray-500">
              View & manage
            </p>
          </div>
        </Card>

        <Card 
          className="hover:border-purple-300 cursor-pointer transition-colors"
          onClick={() => router.push('/check-room')}
        >
          <div className="text-center py-4">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Check Room
            </h3>
            <p className="text-sm text-gray-500">
              Room availability
            </p>
          </div>
        </Card>
      </div>

      {/* User Info */}
      <Card title="👤 Your Account">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="font-medium">{user.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{user.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Department</p>
            <Badge variant="default">{user.department}</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}