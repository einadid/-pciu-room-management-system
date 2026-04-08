'use client';

import { useState } from 'react';

export default function TestPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // 🔹 Test Time Slots
  const testTimeSlots = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/time-slots');
      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult('Error: ' + error);
    }
    setLoading(false);
  };

  // 🔹 Test Rooms
  const testRooms = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/rooms');
      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult('Error: ' + error);
    }
    setLoading(false);
  };

  // 🔹 Test Login
  const testLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token_id: 'ADMIN2024' }),
      });
      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult('Error: ' + error);
    }
    setLoading(false);
  };

  // 🔹 Test Availability
  const testAvailability = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          day: 'Sunday', 
          time_slot_id: 1 
        }),
      });
      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult('Error: ' + error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🧪 API Test Page
        </h1>

        {/* Test Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={testTimeSlots}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Test Time Slots
          </button>

          <button
            onClick={testRooms}
            disabled={loading}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            Test Rooms
          </button>

          <button
            onClick={testLogin}
            disabled={loading}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            Test Login (ADMIN2024)
          </button>

          <button
            onClick={testAvailability}
            disabled={loading}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
          >
            Test Availability
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-blue-600 mb-4">Loading...</div>
        )}

        {/* Result Display */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Response:</h2>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto max-h-96 text-sm">
            {result || 'Click a button to test API'}
          </pre>
        </div>
      </div>
    </div>
  );
}