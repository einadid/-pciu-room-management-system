'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const [tokenId, setTokenId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tokenId.trim()) {
      setError('Please enter your token ID');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token_id: tokenId.toUpperCase() }),
      });

      const data = await res.json();

      console.log('Login response:', data); // Debug log

      if (data.success && data.data) {
        // Save token to localStorage
        localStorage.setItem('access_token', data.data.access_token);
        localStorage.setItem('user', JSON.stringify(data.data.user));

        // Show success
        alert(`Welcome, ${data.data.user.name}!`);

        // Redirect based on role
        if (data.data.user.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/cr');
        }
      } else {
        setError(data.error || 'Invalid token ID. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Quick login for testing
  const quickLogin = async (token: string) => {
    setTokenId(token);
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token_id: token }),
      });

      const data = await res.json();

      if (data.success && data.data) {
        localStorage.setItem('access_token', data.data.access_token);
        localStorage.setItem('user', JSON.stringify(data.data.user));

        if (data.data.user.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/cr');
        }
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative w-16 h-20 bg-white rounded-xl shadow-lg overflow-hidden">
              <Image
                src="/pciu.png"
                alt="PCIU Logo"
                fill
                sizes="64px"
                className="object-contain p-1"
              />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-gray-900 mb-2">
            Login to System
          </h1>
          <p className="text-gray-600">
            Enter your token ID to access the system
          </p>
        </div>

        {/* Login Form */}
        <Card>
          <form onSubmit={handleLogin} className="space-y-6">
            <Input
              label="Token ID"
              type="text"
              placeholder="Enter your token ID"
              value={tokenId}
              onChange={(e) => {
                setTokenId(e.target.value.toUpperCase());
                setError('');
              }}
              error={error}
              autoFocus
            />

            <Button
              type="submit"
              isLoading={loading}
              className="w-full"
              size="lg"
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <h3 className="text-sm font-semibold text-blue-900 mb-3">
              💡 Quick Login (Demo)
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => quickLogin('ADMIN2024')}
                disabled={loading}
                className="w-full text-left px-4 py-3 bg-white rounded-lg border border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all disabled:opacity-50"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">Admin</p>
                    <p className="text-xs text-gray-500">Full system access</p>
                  </div>
                  <code className="text-sm bg-blue-100 px-2 py-1 rounded text-blue-700">
                    ADMIN2024
                  </code>
                </div>
              </button>

              <button
                onClick={() => quickLogin('CRCSE001')}
                disabled={loading}
                className="w-full text-left px-4 py-3 bg-white rounded-lg border border-green-200 hover:border-green-400 hover:bg-green-50 transition-all disabled:opacity-50"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">CR (CSE)</p>
                    <p className="text-xs text-gray-500">Class Representative</p>
                  </div>
                  <code className="text-sm bg-green-100 px-2 py-1 rounded text-green-700">
                    CRCSE001
                  </code>
                </div>
              </button>
            </div>
          </div>
        </Card>

        {/* Help */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Don't have a token?{' '}
            <span className="text-blue-600 font-medium">
              Contact your department admin
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}