'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { DEPARTMENTS, Batch, Section } from '@/types';
import { generateTokenId } from '@/lib/utils';

export default function GenerateTokenPage() {
  const router = useRouter();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    batch_id: '',
    section_id: '',
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

  // Fetch batches when department changes
  useEffect(() => {
    if (formData.department) {
      fetchBatches(formData.department);
    } else {
      setBatches([]);
      setSections([]);
      setFormData(prev => ({ ...prev, batch_id: '', section_id: '' }));
    }
  }, [formData.department]);

  // Fetch sections when batch changes
  useEffect(() => {
    if (formData.batch_id) {
      fetchSections(parseInt(formData.batch_id));
    } else {
      setSections([]);
      setFormData(prev => ({ ...prev, section_id: '' }));
    }
  }, [formData.batch_id]);

  const fetchBatches = async (department: string) => {
    try {
      const res = await fetch(`/api/batches?department=${department}`);
      const data = await res.json();
      if (data.success) {
        setBatches(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch batches:', err);
    }
  };

  const fetchSections = async (batchId: number) => {
    try {
      const res = await fetch(`/api/sections?batch_id=${batchId}`);
      const data = await res.json();
      if (data.success) {
        setSections(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch sections:', err);
    }
  };

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
          batch_id: formData.batch_id ? parseInt(formData.batch_id) : null,
          section_id: formData.section_id ? parseInt(formData.section_id) : null,
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
          batch_id: '',
          section_id: '',
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

          {formData.department && (
            <Select
              label="Batch *"
              value={formData.batch_id}
              onChange={(e) => setFormData({ ...formData, batch_id: e.target.value })}
              options={batches.map((batch) => ({ 
                value: batch.id, 
                label: `${batch.batch_name} (${batch.year})` 
              }))}
              placeholder="Select batch"
              required
            />
          )}

          {formData.batch_id && (
            <Select
              label="Section *"
              value={formData.section_id}
              onChange={(e) => setFormData({ ...formData, section_id: e.target.value })}
              options={sections.map((section) => ({ 
                value: section.id, 
                label: `Section ${section.section_name} (${section.total_students} students)` 
              }))}
              placeholder="Select section"
              required
            />
          )}

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
              disabled={!formData.department || !formData.batch_id || !formData.section_id}
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