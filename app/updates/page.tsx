'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';

export default function UpdatesPage() {
  const [updates, setUpdates] = useState<any[]>([]);

  useEffect(() => {
    fetchUpdates();
  }, []);

  const fetchUpdates = async () => {
    const today = new Date();
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(today.getMonth() - 2);

    const res = await fetch(
      `/api/schedule-exceptions`
    );
    const data = await res.json();

    if (data.success) {
      const filtered = data.data.filter((u: any) => {
        return new Date(u.exception_date) >= twoMonthsAgo;
      });
      setUpdates(filtered);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">📢 Academic Updates</h1>

      {updates.length === 0 ? (
        <Card>
          <div className="text-center py-10 text-gray-500">
            No recent updates
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {updates.map((u) => (
            <Card key={u.id}>
              <div className="flex justify-between">
                <div>
                  <h3 className="font-semibold">
                    {u.schedules?.course_name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {u.exception_date}
                  </p>
                </div>

                <span className={`px-3 py-1 rounded text-xs ${
                  u.exception_type === 'cancelled'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {u.exception_type === 'cancelled' ? 'Cancelled' : 'Notice'}
                </span>
              </div>

              {u.reason && (
                <p className="mt-2 text-sm text-red-600">{u.reason}</p>
              )}

              {u.notice_text && (
                <p className="mt-2 text-sm text-blue-600">{u.notice_text}</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}