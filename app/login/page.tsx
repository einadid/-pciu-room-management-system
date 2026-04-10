'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const [tokenId, setTokenId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check if already logged in
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.role === 'admin' || user.role === 'superadmin') {
          router.replace('/admin');
        } else if (user.role === 'cr') {
          router.replace('/cr');
        }
      } catch (err) {
        localStorage.clear();
      }
    }
    setCheckingAuth(false);
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tokenId.trim()) {
      setError('Please enter your token ID');
      return;
    }

    if (!acceptedTerms) {
      setError('Please accept the terms and conditions');
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

      if (data.success && data.data) {
        // Save to localStorage
        localStorage.setItem('access_token', data.data.access_token);
        localStorage.setItem('user', JSON.stringify(data.data.user));

        // Redirect based on role
        const role = data.data.user.role;
        
        if (role === 'admin' || role === 'superadmin') {
          router.replace('/admin');
        } else if (role === 'cr') {
          router.replace('/cr');
        } else {
          setError('Unknown user role');
        }
      } else {
        setError(data.error || 'Invalid token ID');
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
        <div className="text-gray-600">Checking...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative w-20 h-24 bg-white rounded-2xl shadow-xl p-2">
              <Image
                src="/pciu.png"
                alt="PCIU Logo"
                fill
                sizes="80px"
                className="object-contain"
                priority
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Login to System
          </h1>
          <p className="text-gray-600">
            Port City International University
          </p>
        </div>

        {/* Login Form */}
        <Card className="shadow-xl border-t-4 border-t-blue-600">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <Input
              label="Token ID"
              type="text"
              placeholder="Enter your token ID"
              value={tokenId}
              onChange={(e) => {
                setTokenId(e.target.value.toUpperCase());
                setError('');
              }}
              autoFocus
              className="text-center text-lg font-mono"
            />

            {/* Terms */}
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">
                  I accept the{' '}
                  <Link href="/terms" className="text-blue-600 font-medium">Terms</Link>
                  {' '}and{' '}
                  <Link href="/cr-guidelines" className="text-blue-600 font-medium">Guidelines</Link>
                </span>
              </label>
            </div>

            <Button
              type="submit"
              isLoading={loading}
              disabled={!acceptedTerms}
              className="w-full"
              size="lg"
            >
              Login
            </Button>
          </form>
        </Card>

        {/* WhatsApp Help */}
        <div className="mt-6 text-center">
          <a
            href="https://wa.me/8801678791177"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700"
          >
            💬 Need Token ID? WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}