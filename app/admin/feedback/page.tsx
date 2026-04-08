'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Feedback } from '@/types';

export default function AdminFeedbackPage() {
  const router = useRouter();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');

    if (!userData || !token) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'admin' && parsedUser.role !== 'superadmin') {
      router.push('/cr');
      return;
    }

    fetchFeedback(token);
  }, [router]);

  const fetchFeedback = async (token: string) => {
    try {
      const res = await fetch('/api/admin/feedback', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setFeedback(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    const token = localStorage.getItem('access_token');

    try {
      const res = await fetch(`/api/admin/feedback/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();

      if (data.success) {
        setFeedback(feedback.map(f => 
          f.id === id ? { ...f, status: status as Feedback['status'] } : f
        ));
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const deleteFeedback = async (id: number) => {
    if (!confirm('Are you sure you want to delete this feedback?')) return;

    const token = localStorage.getItem('access_token');

    try {
      const res = await fetch(`/api/admin/feedback/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setFeedback(feedback.filter(f => f.id !== id));
      }
    } catch (err) {
      alert('Failed to delete feedback');
    }
  };

  const replyViaWhatsApp = (email: string, name: string) => {
    const message = `Hello ${name},\n\nThank you for contacting PCIU Room Management System.\n\nRegards,\nPCIU Admin`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const replyViaEmail = (email: string, subject: string) => {
    window.open(`mailto:${email}?subject=Re: ${subject}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const filteredFeedback = filter === 'all' 
    ? feedback 
    : feedback.filter(f => f.status === filter);

  const pendingCount = feedback.filter(f => f.status === 'pending').length;
  const reviewedCount = feedback.filter(f => f.status === 'reviewed').length;
  const resolvedCount = feedback.filter(f => f.status === 'resolved').length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display text-gray-900 mb-2">
            📬 Messages & Feedback
          </h1>
          <p className="text-gray-600">
            View and manage contact form submissions
          </p>
        </div>
        <Button variant="secondary" onClick={() => router.push('/admin')}>
          ← Back to Dashboard
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="text-center">
          <div className="text-3xl font-bold text-blue-600">{feedback.length}</div>
          <div className="text-sm text-gray-500 mt-1">Total Messages</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-yellow-600">{pendingCount}</div>
          <div className="text-sm text-gray-500 mt-1">Pending</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-purple-600">{reviewedCount}</div>
          <div className="text-sm text-gray-500 mt-1">Reviewed</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600">{resolvedCount}</div>
          <div className="text-sm text-gray-500 mt-1">Resolved</div>
        </Card>
      </div>

      {/* Filter */}
      <Card className="mb-8">
        <div className="flex items-center gap-4">
          <span className="font-medium text-gray-700">Filter:</span>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'All', color: 'bg-gray-100' },
              { value: 'pending', label: 'Pending', color: 'bg-yellow-100' },
              { value: 'reviewed', label: 'Reviewed', color: 'bg-purple-100' },
              { value: 'resolved', label: 'Resolved', color: 'bg-green-100' },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => setFilter(item.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === item.value
                    ? 'bg-blue-600 text-white'
                    : `${item.color} text-gray-700 hover:bg-gray-200`
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Messages List */}
      {filteredFeedback.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Messages Found
            </h3>
            <p className="text-gray-500">
              {filter === 'all' 
                ? 'No messages have been submitted yet.'
                : `No ${filter} messages.`}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredFeedback.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xl font-bold text-blue-600">
                        {item.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.email}</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="font-medium text-gray-900 mb-1">{item.subject}</p>
                    <p className="text-gray-700 bg-gray-50 rounded-lg p-3 text-sm whitespace-pre-wrap">
                      {item.message}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>📅 {new Date(item.created_at).toLocaleString()}</span>
                    <Badge 
                      variant={
                        item.status === 'pending' ? 'special' :
                        item.status === 'reviewed' ? 'lab' : 'free'
                      }
                    >
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </Badge>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap md:flex-col gap-2 mt-4 md:mt-0">
                  <button
                    onClick={() => replyViaEmail(item.email, item.subject)}
                    className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors flex items-center gap-1"
                  >
                    <span>📧</span>
                    <span>Reply Email</span>
                  </button>

                  <button
                    onClick={() => replyViaWhatsApp(item.email, item.name)}
                    className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center gap-1"
                  >
                    <span>💬</span>
                    <span>WhatsApp</span>
                  </button>

                  {item.status === 'pending' && (
                    <button
                      onClick={() => updateStatus(item.id, 'reviewed')}
                      className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors"
                    >
                      Mark Reviewed
                    </button>
                  )}

                  {item.status !== 'resolved' && (
                    <button
                      onClick={() => updateStatus(item.id, 'resolved')}
                      className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                    >
                      Mark Resolved
                    </button>
                  )}

                  <button
                    onClick={() => deleteFeedback(item.id)}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}