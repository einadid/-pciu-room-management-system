'use client';

import { useState } from 'react';
import Button from './Button';

interface ExceptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    exception_type: 'cancelled' | 'notice';
    exception_date: string;
    reason?: string;
    notice_text?: string;
  }) => void;
  scheduleInfo: {
    course_name: string;
    day_of_week: string;
    time_slot?: string;
  };
  isLoading?: boolean;
}

export default function ExceptionModal({
  isOpen,
  onClose,
  onSubmit,
  scheduleInfo,
  isLoading = false
}: ExceptionModalProps) {
  const [type, setType] = useState<'cancelled' | 'notice'>('cancelled');
  const [date, setDate] = useState(() => {
    // Default to next occurrence of this day
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [reason, setReason] = useState('');
  const [noticeText, setNoticeText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      exception_type: type,
      exception_date: date,
      reason: reason || undefined,
      notice_text: noticeText || undefined,
    });
  };

  // Get today and limit date range (e.g. 3 months)
  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Class Update
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {scheduleInfo.course_name}
            </p>
            <p className="text-xs text-gray-400">
              {scheduleInfo.day_of_week}
              {scheduleInfo.time_slot && ` • ${scheduleInfo.time_slot}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Update Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('cancelled')}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  type === 'cancelled'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-1">❌</div>
                <div className="font-semibold text-sm text-gray-900">
                  Cancel Class
                </div>
                <div className="text-xs text-gray-500">
                  No class on this date
                </div>
              </button>

              <button
                type="button"
                onClick={() => setType('notice')}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  type === 'notice'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-1">📢</div>
                <div className="font-semibold text-sm text-gray-900">
                  Add Notice
                </div>
                <div className="text-xs text-gray-500">
                  CT, Assignment, etc.
                </div>
              </button>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Date *
            </label>
            <input
              type="date"
              value={date}
              min={today}
              max={maxDateStr}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Reason (for cancellation) */}
          {type === 'cancelled' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Reason (Optional)
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Teacher on leave, University holiday"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          )}

          {/* Notice Text (for notice) */}
          {type === 'notice' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Notice Message *
              </label>
              <textarea
                value={noticeText}
                onChange={(e) => setNoticeText(e.target.value)}
                placeholder="e.g., CT exam on this day. Syllabus: Chapter 1-3&#10;Assignment submission deadline today"
                rows={3}
                required={type === 'notice'}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
              />
            </div>
          )}

          {/* Preview */}
          <div className={`p-3 rounded-lg border ${
            type === 'cancelled'
              ? 'bg-red-50 border-red-200'
              : 'bg-blue-50 border-blue-200'
          }`}>
            <p className="text-xs font-medium text-gray-700 mb-1">Preview:</p>
            {type === 'cancelled' ? (
              <p className="text-sm text-red-700">
                ❌ <strong>{scheduleInfo.course_name}</strong> class is cancelled on{' '}
                <strong>{date}</strong>
                {reason && `. Reason: ${reason}`}
              </p>
            ) : (
              <p className="text-sm text-blue-700">
                📢 Notice for <strong>{scheduleInfo.course_name}</strong> on{' '}
                <strong>{date}</strong>:{' '}
                {noticeText || '(Enter notice message)'}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              isLoading={isLoading}
              className={`flex-1 ${
                type === 'cancelled'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              {type === 'cancelled' ? '❌ Cancel Class' : '📢 Add Notice'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Back
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}