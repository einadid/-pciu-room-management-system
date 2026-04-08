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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    batch_name: '',
    section_name: '',
    token_id: '',
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.replace('/login');
      return;
    }

    try {
      const user = JSON.parse(userData);
      if (user.role !== 'admin' && user.role !== 'superadmin') {
        router.replace('/login');
        return;
      }
    } catch (err) {
      router.replace('/login');
      return;
    }

    setFormData(prev => ({ ...prev, token_id: generateTokenId() }));
    setCheckingAuth(false);
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
          batch_name: '',
          section_name: '',
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

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="secondary" onClick={() => router.push('/admin')}>
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
            placeholder="e.g., Abdullah Rahman"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="Email *"
            type="email"
            placeholder="e.g., abdullah@pciu.ac.bd"
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

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Batch *"
              placeholder="e.g., Batch 30, 57th, 2024"
              value={formData.batch_name}
              onChange={(e) => setFormData({ ...formData, batch_name: e.target.value })}
              required
            />

            <Select
              label="Section *"
              value={formData.section_name}
              onChange={(e) => setFormData({ ...formData, section_name: e.target.value })}
              options={[
                { value: 'A', label: 'Section A' },
                { value: 'B', label: 'Section B' },
                { value: 'C', label: 'Section C' },
                { value: 'D', label: 'Section D' },
                { value: 'E', label: 'Section E' },
                { value: 'F', label: 'Section F' },
              ]}
              required
            />
          </div>

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
              <Button type="button" variant="secondary" onClick={regenerateToken}>
                🔄
              </Button>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              isLoading={loading}
              className="flex-1"
              disabled={!formData.department || !formData.batch_name || !formData.section_name}
            >
              Create CR Account
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push('/admin')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}