'use client';

import { useState, useEffect, useRef } from 'react';
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { DAYS } from '@/types';

interface Schedule {
  id: number;
  course_name: string;
  course_code: string;
  teacher_name: string;
  department: string;
  batch_name: string;
  section_name: string;

  // ✅ new fields (make them optional to avoid runtime/type issues)
  sub_section?: string | null; // e.g. "A1", "B2"
  class_type?: string | null; // e.g. "Lab" | "Theory"

  day_of_week: string;
  time_slot_id: number;

  rooms?: {
    room_name: string;
    building: string;
  } | null;

  time_slots?: {
    slot_name: string;
    start_time: string;
    end_time: string;
  } | null;
}

interface BatchSection {
  department: string;
  batch_name: string;
  section_name: string;
  count: number;
}

export default function PublicRoutinePage() {
  const [allSchedules, setAllSchedules] = useState<Schedule[]>([]);
  const [batchSections, setBatchSections] = useState<BatchSection[]>([]);
  const [selectedSchedules, setSelectedSchedules] = useState<Schedule[]>([]);

  const [filterDept, setFilterDept] = useState<string>('');
  const [filterBatch, setFilterBatch] = useState<string>('');
  const [filterSection, setFilterSection] = useState<string>('');

  const [loading, setLoading] = useState(true);
  const [showRoutine, setShowRoutine] = useState(false);

  const routineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAllSchedules();
  }, []);

  useEffect(() => {
    if (filterDept && filterBatch && filterSection) {
      const filtered = allSchedules.filter(
        (s) =>
          s.department === filterDept &&
          s.batch_name === filterBatch &&
          s.section_name === filterSection
      );
      setSelectedSchedules(filtered);
      setShowRoutine(true);
    } else {
      setSelectedSchedules([]);
      setShowRoutine(false);
    }
  }, [filterDept, filterBatch, filterSection, allSchedules]);

  const fetchAllSchedules = async () => {
    try {
      const res = await fetch('/api/schedules');
      const data = await res.json();

      if (data.success) {
        setAllSchedules(data.data);

        // Extract unique department-batch-section combos
        const uniqueBatchSections: Record<string, BatchSection> = {};

        (data.data as Schedule[]).forEach((schedule) => {
          if (schedule.batch_name && schedule.section_name) {
            const key = `${schedule.department}-${schedule.batch_name}-${schedule.section_name}`;

            if (!uniqueBatchSections[key]) {
              uniqueBatchSections[key] = {
                department: schedule.department,
                batch_name: schedule.batch_name,
                section_name: schedule.section_name,
                count: 0,
              };
            }
            uniqueBatchSections[key].count++;
          }
        });

        setBatchSections(Object.values(uniqueBatchSections));
      }
    } catch (err) {
      console.error('Failed to fetch schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  const departments = [...new Set(batchSections.map((bs) => bs.department))];

  const batches = [
    ...new Set(
      batchSections
        .filter((bs) => !filterDept || bs.department === filterDept)
        .map((bs) => bs.batch_name)
    ),
  ];

  const sections = [
    ...new Set(
      batchSections
        .filter(
          (bs) =>
            (!filterDept || bs.department === filterDept) &&
            (!filterBatch || bs.batch_name === filterBatch)
        )
        .map((bs) => bs.section_name)
    ),
  ];

  const handleQuickSelect = (bs: BatchSection) => {
    setFilterDept(bs.department);
    setFilterBatch(bs.batch_name);
    setFilterSection(bs.section_name);
  };

  const handleDownload = async () => {
    if (!routineRef.current) return;

    try {
      const html2canvas = (await import('html2canvas')).default;

      const canvas = await html2canvas(routineRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });

      const link = document.createElement('a');
      link.download = `Routine-${filterDept}-${filterBatch}-Section${filterSection}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download. Please try again.');
    }
  };

  // ✅ Build schedule grid as arrays to support multiple entries per cell (e.g. sub-sections)
  const scheduleGrid: { [day: string]: { [slot: number]: Schedule[] } } = {};
  DAYS.forEach((day) => {
    scheduleGrid[day] = {};
    for (let i = 1; i <= 6; i++) scheduleGrid[day][i] = [];
  });

  selectedSchedules.forEach((schedule) => {
    if (!scheduleGrid[schedule.day_of_week]) return;
    if (!scheduleGrid[schedule.day_of_week][schedule.time_slot_id]) return;
    scheduleGrid[schedule.day_of_week][schedule.time_slot_id].push(schedule);
  });

  const timeSlots = [
    { id: 1, name: 'Slot 1', time: '08:30 - 09:55' },
    { id: 2, name: 'Slot 2', time: '10:00 - 11:25' },
    { id: 3, name: 'Slot 3', time: '11:30 - 12:55' },
    { id: 4, name: 'Slot 4', time: '13:30 - 14:55' },
    { id: 5, name: 'Slot 5', time: '15:00 - 16:25' },
    { id: 6, name: 'Slot 6', time: '16:30 - 17:55' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading routines...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          📅 Class Routine
        </h1>
        <p className="text-gray-600 text-lg">View class schedules for all departments</p>
      </div>

      {/* Quick Select */}
      {batchSections.length > 0 && !showRoutine && (
        <Card title="📚 Available Routines" subtitle="Click to view routine" className="mb-8">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {batchSections.map((bs, index) => (
              <div
                key={index}
                onClick={() => handleQuickSelect(bs)}
                className="border-2 border-gray-200 rounded-xl p-4 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="default">{bs.department}</Badge>
                  <span className="text-xs text-gray-500">{bs.count} classes</span>
                </div>
                <h3 className="font-bold text-gray-900">{bs.batch_name}</h3>
                <p className="text-sm text-gray-600">Section {bs.section_name}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Manual Filters */}
      <Card className="mb-8">
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <Select
            label="Department"
            value={filterDept}
            onChange={(e) => {
              setFilterDept(e.target.value);
              setFilterBatch('');
              setFilterSection('');
            }}
            options={departments.map((dept) => ({ value: dept, label: dept }))}
            placeholder="Select department"
          />

          {filterDept && (
            <Select
              label="Batch"
              value={filterBatch}
              onChange={(e) => {
                setFilterBatch(e.target.value);
                setFilterSection('');
              }}
              options={batches.map((batch) => ({ value: batch, label: batch }))}
              placeholder="Select batch"
            />
          )}

          {filterBatch && (
            <Select
              label="Section"
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
              options={sections.map((section) => ({
                value: section,
                label: `Section ${section}`,
              }))}
              placeholder="Select section"
            />
          )}
        </div>

        {showRoutine && (
          <div className="flex gap-3">
            <Button onClick={handleDownload}>📥 Download as Image</Button>
            <Button
              variant="secondary"
              onClick={() => {
                setFilterDept('');
                setFilterBatch('');
                setFilterSection('');
                setShowRoutine(false);
              }}
            >
              ✕ Clear Selection
            </Button>
          </div>
        )}
      </Card>

      {/* Routine Display */}
      {showRoutine && (
        <div ref={routineRef}>
          {/* Info Header */}
          <div className="bg-blue-600 text-white rounded-t-xl p-6 text-center">
            <h2 className="text-2xl font-bold mb-2">Port City International University</h2>
            <p className="text-blue-100">Class Routine</p>

            <div className="flex justify-center gap-4 mt-4 flex-wrap">
              <span className="bg-white/20 px-4 py-2 rounded-lg">📚 {filterDept}</span>
              <span className="bg-white/20 px-4 py-2 rounded-lg">🎓 {filterBatch}</span>
              <span className="bg-white/20 px-4 py-2 rounded-lg">
                👥 Section {filterSection}
              </span>
            </div>
          </div>

          {/* Schedule Table */}
          <Card className="rounded-t-none">
            {selectedSchedules.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Classes Found</h3>
                <p className="text-gray-500">
                  No schedules have been added for this section yet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-3 py-3 text-left text-sm font-semibold text-gray-700 w-28">
                        Time / Day
                      </th>
                      {DAYS.map((day) => (
                        <th
                          key={day}
                          className="border border-gray-300 px-3 py-3 text-center text-sm font-semibold text-gray-700"
                        >
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {timeSlots.map((slot) => (
                      <tr key={slot.id}>
                        <td className="border border-gray-300 px-3 py-3 bg-gray-50">
                          <div className="font-medium text-gray-900 text-sm">{slot.name}</div>
                          <div className="text-xs text-gray-500">{slot.time}</div>
                        </td>

                        {DAYS.map((day) => {
                          const schedules = scheduleGrid[day]?.[slot.id] ?? [];
                          const hasAny = schedules.length > 0;

                          return (
                            <td
                              key={day}
                              className={`border border-gray-300 px-2 py-2 text-xs align-top ${
                                hasAny ? 'bg-blue-50' : ''
                              }`}
                            >
                              {hasAny ? (
                                <div className="space-y-2">
                                  {schedules.map((schedule) => (
                                    <div
                                      key={schedule.id}
                                      className="space-y-1 bg-white/60 rounded-md p-2 border border-blue-100"
                                    >
                                      <div className="font-semibold text-gray-900">
                                        {schedule.course_name}
                                      </div>

                                      {schedule.course_code && (
                                        <div className="text-gray-600">{schedule.course_code}</div>
                                      )}

                                      {schedule.teacher_name && (
                                        <div className="text-gray-600">
                                          {schedule.teacher_name}
                                        </div>
                                      )}

                                      {/* ✅ UPDATED: show room + sub-section + lab tag */}
                                      <div className="pt-1 flex flex-wrap gap-1">
                                        <span className="inline-block bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[10px] font-medium">
                                          📍 {schedule.rooms?.room_name ?? '—'}
                                        </span>

                                        {schedule.sub_section && (
                                          <span className="inline-block bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-[10px] font-medium">
                                            👥 {schedule.sub_section}
                                          </span>
                                        )}

                                        {schedule.class_type === 'Lab' && (
                                          <span className="inline-block bg-green-100 text-green-800 px-2 py-0.5 rounded text-[10px] font-medium">
                                            🔬 Lab
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-gray-400 text-center">-</div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Footer Info */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap justify-between items-center gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Total Classes:</span> {selectedSchedules.length}
                </div>
                <div>
                  <span className="font-medium">Generated:</span>{' '}
                  {new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {!showRoutine && batchSections.length === 0 && (
        <Card>
          <div className="text-center py-16">
            <div className="text-8xl mb-6">📅</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Routines Available</h3>
            <p className="text-gray-500 text-lg">
              No class schedules have been added yet.
              <br />
              Check back later or contact your CR.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}