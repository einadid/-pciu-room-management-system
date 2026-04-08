'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { ScheduleWithDetails, DayOfWeek, DAYS, DEPARTMENTS, Batch, Section } from '@/types';

export default function PublicRoutinePage() {
  const [schedules, setSchedules] = useState<ScheduleWithDetails[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  
  const [filterDept, setFilterDept] = useState<string>('');
  const [filterBatch, setFilterBatch] = useState<string>('');
  const [filterSection, setFilterSection] = useState<string>('');
  const [filterDay, setFilterDay] = useState<DayOfWeek | ''>('');
  
  const [loading, setLoading] = useState(false);

  // Fetch batches when department changes
  useEffect(() => {
    if (filterDept) {
      fetchBatches(filterDept);
    } else {
      setBatches([]);
      setSections([]);
      setFilterBatch('');
      setFilterSection('');
    }
  }, [filterDept]);

  // Fetch sections when batch changes
  useEffect(() => {
    if (filterBatch) {
      fetchSections(parseInt(filterBatch));
    } else {
      setSections([]);
      setFilterSection('');
    }
  }, [filterBatch]);

  // Fetch schedules when section selected
  useEffect(() => {
    if (filterSection) {
      fetchSchedules();
    }
  }, [filterSection, filterDay]);

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

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      let url = `/api/schedules?section_id=${filterSection}`;
      if (filterDay) url += `&day=${filterDay}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setSchedules(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Group schedules by day and time slot
  const scheduleGrid: { [day: string]: { [slot: number]: ScheduleWithDetails | null } } = {};
  
  DAYS.forEach(day => {
    scheduleGrid[day] = {};
    for (let i = 1; i <= 6; i++) {
      scheduleGrid[day][i] = null;
    }
  });

  schedules.forEach(schedule => {
    scheduleGrid[schedule.day_of_week][schedule.time_slot_id] = schedule;
  });

  const selectedBatch = batches.find(b => b.id === parseInt(filterBatch));
  const selectedSection = sections.find(s => s.id === parseInt(filterSection));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold font-display text-gray-900 mb-3">
          📅 Class Routine
        </h1>
        <p className="text-gray-600 text-lg">
          View class schedules for all departments
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <Select
            label="Department"
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            options={DEPARTMENTS.map((dept) => ({ value: dept, label: dept }))}
            placeholder="Select department"
          />

          {filterDept && (
            <Select
              label="Batch"
              value={filterBatch}
              onChange={(e) => setFilterBatch(e.target.value)}
              options={batches.map((batch) => ({
                value: batch.id,
                label: `${batch.batch_name} (${batch.year})`,
              }))}
              placeholder="Select batch"
            />
          )}

          {filterBatch && (
            <Select
              label="Section"
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
              options={sections.map((section) => ({
                value: section.id,
                label: `Section ${section.section_name}`,
              }))}
              placeholder="Select section"
            />
          )}

          {filterSection && (
            <Select
              label="Day (Optional)"
              value={filterDay}
              onChange={(e) => setFilterDay(e.target.value as DayOfWeek)}
              options={DAYS.map((day) => ({ value: day, label: day }))}
              placeholder="All Days"
            />
          )}
        </div>

        {filterSection && (
          <div className="flex gap-3">
            <Button onClick={fetchSchedules} isLoading={loading}>
              🔍 View Routine
            </Button>
            {schedules.length > 0 && (
              <Button variant="secondary" onClick={handlePrint}>
                🖨️ Print
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* Routine Display */}
      {schedules.length > 0 && (
        <>
          {/* Info Card */}
          <Card className="mb-6">
            <div className="grid md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-500">Department</p>
                <p className="text-lg font-bold text-gray-900">{filterDept}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Batch</p>
                <p className="text-lg font-bold text-gray-900">{selectedBatch?.batch_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Section</p>
                <p className="text-lg font-bold text-gray-900">{selectedSection?.section_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Classes</p>
                <p className="text-lg font-bold text-gray-900">{schedules.length}</p>
              </div>
            </div>
          </Card>

          {/* Schedule Table */}
          <Card title="📚 Class Schedule">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-3 text-left font-semibold text-sm">
                      Time / Day
                    </th>
                    {DAYS.map(day => (
                      <th key={day} className="border border-gray-300 px-3 py-3 text-center font-semibold text-sm">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5, 6].map(slot => {
                    const timeSlot = schedules.find(s => s.time_slot_id === slot)?.time_slots;
                    
                    return (
                      <tr key={slot}>
                        <td className="border border-gray-300 px-3 py-3 bg-gray-50 font-medium text-sm">
                          <div>Slot {slot}</div>
                          {timeSlot && (
                            <div className="text-xs text-gray-600">
                              {timeSlot.start_time.slice(0, 5)} - {timeSlot.end_time.slice(0, 5)}
                            </div>
                          )}
                        </td>
                        {DAYS.map(day => {
                          const schedule = scheduleGrid[day][slot];
                          
                          return (
                            <td key={day} className="border border-gray-300 px-2 py-2 text-xs">
                              {schedule ? (
                                <div className="space-y-1">
                                  <div className="font-semibold text-gray-900">
                                    {schedule.course_name}
                                  </div>
                                  {schedule.course_code && (
                                    <div className="text-gray-600">{schedule.course_code}</div>
                                  )}
                                  {schedule.teacher_name && (
                                    <div className="text-gray-600">
                                      👨‍🏫 {schedule.teacher_name}
                                    </div>
                                  )}
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    <Badge variant="classroom" className="text-[10px]">
                                      {schedule.rooms.room_name}
                                    </Badge>
                                    <Badge variant="default" className="text-[10px]">
                                      {schedule.rooms.building}
                                    </Badge>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-gray-400 text-center">-</div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* Empty State */}
      {!filterSection && (
        <Card>
          <div className="text-center py-16">
            <div className="text-8xl mb-6">📅</div>
            <h3 className="text-2xl font-bold font-display text-gray-900 mb-3">
              Select Your Class
            </h3>
            <p className="text-gray-500 text-lg">
              Choose your department, batch, and section to view the routine
            </p>
          </div>
        </Card>
      )}

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          header, footer, .no-print, button {
            display: none !important;
          }
          
          body {
            background: white !important;
          }
          
          table {
            page-break-inside: auto;
          }
          
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
        }
      `}</style>
    </div>
  );
}