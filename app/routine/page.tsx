'use client';

import { useState, useEffect, useRef } from 'react';
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { DAYS } from '@/types';

// Schedule interface with all fields
interface Schedule {
  id: number;
  course_name: string;
  course_code: string | null;
  teacher_name: string | null;
  department: string;
  batch_name: string;
  section_name: string;
  sub_section: string | null;
  day_of_week: string;
  time_slot_id: number;
  class_type: string | null;
  session_id: string | null;
  rooms?: {
    id: number;
    room_name: string;
    building: string;
  } | null;
  time_slots?: {
    id: number;
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

interface ProcessedSchedule extends Schedule {
  isMultiSlot: boolean;
  slotSpan: number;
  isFirstSlot: boolean;
  sessionSlots: number[];
}

// Helper function for sub-section colors
const getSubSectionColor = (subSection: string | null): string => {
  if (!subSection) return 'bg-gray-100 text-gray-800';
  
  const lastChar = subSection.slice(-1);
  const colors: { [key: string]: string } = {
    '1': 'bg-blue-100 text-blue-800',
    '2': 'bg-green-100 text-green-800',
    '3': 'bg-yellow-100 text-yellow-800',
    '4': 'bg-purple-100 text-purple-800',
    '5': 'bg-pink-100 text-pink-800',
    '6': 'bg-indigo-100 text-indigo-800',
  };
  
  return colors[lastChar] || 'bg-gray-100 text-gray-800';
};

// Helper function for class type colors
const getClassTypeStyle = (classType: string | null): string => {
  if (classType === 'Lab') {
    return 'bg-green-100 text-green-800 border-green-200';
  }
  return 'bg-blue-100 text-blue-800 border-blue-200';
};

export default function PublicRoutinePage() {
  const [allSchedules, setAllSchedules] = useState<Schedule[]>([]);
  const [batchSections, setBatchSections] = useState<BatchSection[]>([]);
  const [selectedSchedules, setSelectedSchedules] = useState<Schedule[]>([]);
  
  const [filters, setFilters] = useState({
    dept: '',
    batch: '',
    section: '',
  });
  
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [showRoutine, setShowRoutine] = useState(false);
  const routineRef = useRef<HTMLDivElement>(null);

  // Fetch all schedules on mount
  useEffect(() => {
    fetchAllSchedules();
  }, []);

  // Filter schedules when filters change
  useEffect(() => {
    if (filters.dept && filters.batch && filters.section) {
      const filtered = allSchedules.filter(
        (s) =>
          s.department === filters.dept &&
          s.batch_name === filters.batch &&
          s.section_name === filters.section
      );
      setSelectedSchedules(filtered);
      setShowRoutine(true);
    } else {
      setSelectedSchedules([]);
      setShowRoutine(false);
    }
  }, [filters, allSchedules]);

  const fetchAllSchedules = async () => {
    try {
      const res = await fetch('/api/schedules');
      const data = await res.json();

      if (data.success) {
        setAllSchedules(data.data);

        const unique: { [key: string]: BatchSection } = {};

        (data.data as Schedule[]).forEach((schedule) => {
          if (schedule.batch_name && schedule.section_name) {
            const key = `${schedule.department}-${schedule.batch_name}-${schedule.section_name}`;

            if (!unique[key]) {
              unique[key] = {
                department: schedule.department,
                batch_name: schedule.batch_name,
                section_name: schedule.section_name,
                count: 0,
              };
            }
            unique[key].count++;
          }
        });

        setBatchSections(Object.values(unique));
      }
    } catch (err) {
      console.error('Failed to fetch schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  // Derived filter options
  const departments = [...new Set(batchSections.map((bs) => bs.department))];
  
  const batches = [
    ...new Set(
      batchSections
        .filter((bs) => !filters.dept || bs.department === filters.dept)
        .map((bs) => bs.batch_name)
    ),
  ];
  
  const sections = [
    ...new Set(
      batchSections
        .filter(
          (bs) =>
            (!filters.dept || bs.department === filters.dept) &&
            (!filters.batch || bs.batch_name === filters.batch)
        )
        .map((bs) => bs.section_name)
    ),
  ];

  const handleQuickSelect = (bs: BatchSection) => {
    setFilters({
      dept: bs.department,
      batch: bs.batch_name,
      section: bs.section_name,
    });
  };

  const handleClearFilters = () => {
    setFilters({ dept: '', batch: '', section: '' });
    setShowRoutine(false);
  };

 // Download PNG function
const handleDownload = async () => {
  if (!routineRef.current) return;

  setDownloading(true);

  try {
    const html2canvas = (await import('html2canvas')).default;
    const element = routineRef.current;

    // Store original styles
    const originalStyle = {
      width: element.style.width,
      maxWidth: element.style.maxWidth,
      overflow: element.style.overflow,
      position: element.style.position,
    };

    // Find the table container and store its original overflow
    const tableContainer = element.querySelector('.overflow-x-auto') as HTMLElement;
    const originalTableOverflow = tableContainer?.style.overflow;

    // Temporarily modify styles for full capture
    element.style.width = 'fit-content';
    element.style.maxWidth = 'none';
    element.style.overflow = 'visible';
    
    if (tableContainer) {
      tableContainer.style.overflow = 'visible';
    }

    // Wait for styles to apply
    await new Promise(resolve => setTimeout(resolve, 100));

    // Calculate the actual full width needed
    const table = element.querySelector('table');
    const fullWidth = Math.max(
      element.scrollWidth,
      element.offsetWidth,
      table?.scrollWidth || 0,
      1200
    );

    // Use type assertion to bypass TypeScript strict checking
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      width: fullWidth,
      windowWidth: fullWidth,
      scrollX: 0,
      scrollY: 0,
    } as Parameters<typeof html2canvas>[1]);

    // Restore original styles
    element.style.width = originalStyle.width;
    element.style.maxWidth = originalStyle.maxWidth;
    element.style.overflow = originalStyle.overflow;
    
    if (tableContainer) {
      tableContainer.style.overflow = originalTableOverflow || '';
    }

    // Download the image
    const link = document.createElement('a');
    link.download = `Routine-${filters.dept}-${filters.batch}-Section${filters.section}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

  } catch (error) {
    console.error('Download error:', error);
    alert('Failed to download. Please try again.');
  } finally {
    setDownloading(false);
  }
};

  // Process schedules to identify multi-slot classes
  const processSchedules = (): Map<string, ProcessedSchedule[]> => {
    const sessionMap = new Map<string, Schedule[]>();
    
    selectedSchedules.forEach((schedule) => {
      if (schedule.session_id) {
        if (!sessionMap.has(schedule.session_id)) {
          sessionMap.set(schedule.session_id, []);
        }
        sessionMap.get(schedule.session_id)!.push(schedule);
      }
    });

    const processedMap = new Map<string, ProcessedSchedule[]>();

    selectedSchedules.forEach((schedule) => {
      const key = `${schedule.day_of_week}-${schedule.time_slot_id}`;
      
      if (!processedMap.has(key)) {
        processedMap.set(key, []);
      }

      let isMultiSlot = false;
      let slotSpan = 1;
      let isFirstSlot = true;
      let sessionSlots: number[] = [schedule.time_slot_id];

      if (schedule.session_id && sessionMap.has(schedule.session_id)) {
        const sessionSchedules = sessionMap.get(schedule.session_id)!;
        if (sessionSchedules.length > 1) {
          isMultiSlot = true;
          slotSpan = sessionSchedules.length;
          sessionSlots = sessionSchedules.map((s) => s.time_slot_id).sort((a, b) => a - b);
          isFirstSlot = schedule.time_slot_id === Math.min(...sessionSlots);
        }
      }

      processedMap.get(key)!.push({
        ...schedule,
        isMultiSlot,
        slotSpan,
        isFirstSlot,
        sessionSlots,
      });
    });

    return processedMap;
  };

  // Build schedule grid
  const buildScheduleGrid = () => {
    const grid: { [day: string]: { [slot: number]: ProcessedSchedule[] } } = {};
    
    DAYS.forEach((day) => {
      grid[day] = {};
      for (let i = 1; i <= 6; i++) {
        grid[day][i] = [];
      }
    });

    const processedMap = processSchedules();

    processedMap.forEach((schedules, key) => {
      const [day, slotStr] = key.split('-');
      const slot = parseInt(slotStr);
      
      if (grid[day] && grid[day][slot] !== undefined) {
        grid[day][slot] = schedules;
      }
    });

    return grid;
  };

  const scheduleGrid = buildScheduleGrid();

  const timeSlots = [
    { id: 1, name: 'Slot 1', time: '08:30 - 09:55' },
    { id: 2, name: 'Slot 2', time: '10:00 - 11:25' },
    { id: 3, name: 'Slot 3', time: '11:30 - 12:55' },
    { id: 4, name: 'Slot 4', time: '13:30 - 14:55' },
    { id: 5, name: 'Slot 5', time: '15:00 - 16:25' },
    { id: 6, name: 'Slot 6', time: '16:30 - 17:55' },
  ];

  const getUniqueClassCount = () => {
    const sessionIds = new Set<string>();
    let count = 0;

    selectedSchedules.forEach((schedule) => {
      if (schedule.session_id) {
        if (!sessionIds.has(schedule.session_id)) {
          sessionIds.add(schedule.session_id);
          count++;
        }
      } else {
        count++;
      }
    });

    return count;
  };

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
        <p className="text-gray-600 text-lg">
          View class schedules for all departments
        </p>
      </div>

      {/* Quick Select Cards */}
      {batchSections.length > 0 && !showRoutine && (
        <Card
          title="📚 Available Routines"
          subtitle="Click to view routine"
          className="mb-8"
        >
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {batchSections.map((bs, index) => (
              <div
                key={index}
                onClick={() => handleQuickSelect(bs)}
                className="border-2 border-gray-200 rounded-xl p-4 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="default">{bs.department}</Badge>
                  <span className="text-xs text-gray-500">
                    {bs.count} classes
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 group-hover:text-blue-700">
                  {bs.batch_name}
                </h3>
                <p className="text-sm text-gray-600">Section {bs.section_name}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Filter Controls */}
      <Card className="mb-8">
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <Select
            label="Department"
            value={filters.dept}
            onChange={(e) =>
              setFilters({ dept: e.target.value, batch: '', section: '' })
            }
            options={departments.map((dept) => ({ value: dept, label: dept }))}
            placeholder="Select department"
          />

          {filters.dept && (
            <Select
              label="Batch"
              value={filters.batch}
              onChange={(e) =>
                setFilters({ ...filters, batch: e.target.value, section: '' })
              }
              options={batches.map((batch) => ({ value: batch, label: batch }))}
              placeholder="Select batch"
            />
          )}

          {filters.batch && (
            <Select
              label="Section"
              value={filters.section}
              onChange={(e) =>
                setFilters({ ...filters, section: e.target.value })
              }
              options={sections.map((section) => ({
                value: section,
                label: `Section ${section}`,
              }))}
              placeholder="Select section"
            />
          )}
        </div>

        {showRoutine && (
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleDownload} disabled={downloading}>
              {downloading ? '⏳ Downloading...' : '📥 Download PNG'}
            </Button>
            <Button variant="secondary" onClick={handleClearFilters}>
              ✕ Clear Selection
            </Button>
          </div>
        )}
      </Card>

      {/* Routine Display */}
      {showRoutine && (
        <div 
          ref={routineRef} 
          className="bg-white"
          data-routine-container
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-t-xl p-6 text-center">
            <h2 className="text-2xl font-bold mb-2">
              Port City International University
            </h2>
            <p className="text-blue-100 mb-4">Class Routine</p>

            <div className="flex justify-center gap-3 flex-wrap">
              <span className="bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                📚 {filters.dept}
              </span>
              <span className="bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                🎓 {filters.batch}
              </span>
              <span className="bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                👥 Section {filters.section}
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="bg-gray-50 border-b px-6 py-3">
            <div className="flex flex-wrap gap-4 justify-center text-sm">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-blue-100 border border-blue-200"></span>
                <span className="text-gray-600">Theory</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-green-100 border border-green-200"></span>
                <span className="text-gray-600">Lab</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-purple-100 border border-purple-200"></span>
                <span className="text-gray-600">Multi-slot</span>
              </div>
            </div>
          </div>

          {/* Schedule Table */}
          <Card className="rounded-t-none border-t-0">
            {selectedSchedules.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Classes Found
                </h3>
                <p className="text-gray-500">
                  No schedules have been added for this section yet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-3 py-3 text-left text-sm font-semibold text-gray-700 w-28 min-w-[100px]">
                        Time / Day
                      </th>
                      {DAYS.map((day) => (
                        <th
                          key={day}
                          className="border border-gray-300 px-3 py-3 text-center text-sm font-semibold text-gray-700 min-w-[130px]"
                        >
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {timeSlots.map((slot) => (
                      <tr key={slot.id}>
                        {/* Time Slot Cell */}
                        <td className="border border-gray-300 px-3 py-3 bg-gray-50">
                          <div className="font-medium text-gray-900 text-sm">
                            {slot.name}
                          </div>
                          <div className="text-xs text-gray-500">{slot.time}</div>
                        </td>

                        {/* Day Cells */}
                        {DAYS.map((day) => {
                          const schedules = scheduleGrid[day]?.[slot.id] ?? [];
                          const hasSchedules = schedules.length > 0;

                          const displaySchedules = schedules.filter(
                            (s) => !s.isMultiSlot || s.isFirstSlot
                          );

                          const continuedSchedules = schedules.filter(
                            (s) => s.isMultiSlot && !s.isFirstSlot
                          );

                          return (
                            <td
                              key={day}
                              className={`border border-gray-300 px-2 py-2 text-xs align-top min-w-[130px] ${
                                hasSchedules ? 'bg-blue-50/50' : ''
                              }`}
                            >
                              {displaySchedules.length > 0 ? (
                                <div className="space-y-2">
                                  {displaySchedules.map((schedule) => (
                                    <div
                                      key={schedule.id}
                                      className={`rounded-lg p-2 border ${getClassTypeStyle(schedule.class_type)} ${
                                        schedule.isMultiSlot
                                          ? 'border-l-4 border-l-purple-500'
                                          : ''
                                      }`}
                                    >
                                      <div className="font-semibold text-gray-900 mb-1">
                                        {schedule.course_name}
                                      </div>

                                      {schedule.course_code && (
                                        <div className="text-gray-600 text-[11px]">
                                          {schedule.course_code}
                                        </div>
                                      )}

                                      {schedule.teacher_name && (
                                        <div className="text-gray-600 text-[11px]">
                                          👨‍🏫 {schedule.teacher_name}
                                        </div>
                                      )}

                                      {schedule.rooms?.room_name && (
                                        <div className="text-gray-700 text-[11px] font-medium">
                                          📍 {schedule.rooms.room_name}
                                        </div>
                                      )}

                                      {schedule.isMultiSlot && (
                                        <div className="text-purple-700 text-[10px] font-medium mt-1">
                                          ⏱️ {schedule.slotSpan * 1.5}h (Slot{' '}
                                          {schedule.sessionSlots.join('-')})
                                        </div>
                                      )}

                                      <div className="pt-1.5 flex flex-wrap gap-1">
                                        {schedule.sub_section && (
                                          <span
                                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${getSubSectionColor(schedule.sub_section)}`}
                                          >
                                            👥 {schedule.sub_section}
                                          </span>
                                        )}

                                        {schedule.class_type === 'Lab' && (
                                          <span className="inline-block bg-green-200 text-green-800 px-2 py-0.5 rounded text-[10px] font-medium">
                                            🔬 Lab
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : continuedSchedules.length > 0 ? (
                                <div className="h-full flex items-center justify-center min-h-[60px]">
                                  <div className="text-purple-500 text-center">
                                    <div className="text-lg">↑</div>
                                    <div className="text-[10px]">Continued</div>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-gray-300 text-center py-4">—</div>
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
            {selectedSchedules.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex flex-wrap justify-between items-center gap-4 text-sm text-gray-600">
                  <div className="flex gap-4">
                    <span>
                      <span className="font-medium">Total Classes:</span>{' '}
                      {getUniqueClassCount()}
                    </span>
                    <span>
                      <span className="font-medium">Total Slots:</span>{' '}
                      {selectedSchedules.length}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Generated:</span>{' '}
                    {new Date().toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Empty State */}
      {!showRoutine && batchSections.length === 0 && (
        <Card>
          <div className="text-center py-16">
            <div className="text-8xl mb-6">📅</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No Routines Available
            </h3>
            <p className="text-gray-500 text-lg max-w-md mx-auto">
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