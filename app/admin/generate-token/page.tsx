'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { DEPARTMENTS } from '@/types';
import { generateTokenId } from '@/lib/utils';

export default function GenerateTokenPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    token_id: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<string | null>(null);

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

    // Generate initial token
    setFormData(prev => ({ ...prev, token_id: generateTokenId() }));
  }, [router]);

  const regenerateToken = () => {
    setFormData(prev => ({ ...prev, token_id: generateTokenId() }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(null);

    try {
      const token = localStorage.getItem('access_token');

      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          role: 'cr',
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(formData.token_id);
        setFormData({
          name: '',
          email: '',
          department: '',
          token_id: generateTokenId(),
        });
      } else {
        setError(data.error || 'Failed to create user');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Button
          variant="secondary"
          onClick={() => router.push('/admin')}
          size="sm"
        >
          ← Back to Dashboard
        </Button>
      </div>

      <Card title="🔑 Generate CR Token" subtitle="Create a new Class Representative account">
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 font-medium mb-2">
              ✅ CR Account Created Successfully!
            </p>
            <div className="bg-white p-4 rounded border border-green-300">
              <p className="text-sm text-gray-600 mb-1">Token ID:</p>
              <p className="text-2xl font-mono font-bold text-green-700">
                {success}
              </p>
            </div>
            <p className="text-sm text-green-600 mt-2">
              Share this token with the CR securely.
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="CR Name *"
            placeholder="e.g., John Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="Email *"
            type="email"
            placeholder="e.g., john@pciu.ac.bd"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <Select
            label="Department *"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            options={DEPARTMENTS.map((dept) => ({ value: dept, label: dept }))}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Generated Token ID *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.token_id}
                readOnly
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 font-mono text-lg"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={regenerateToken}
              >
                🔄 Regenerate
              </Button>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              This token will be used by the CR to login
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              isLoading={loading}
              className="flex-1"
            >
              Create CR Account
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push('/admin')}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}