"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { ScheduleWithDetails, User, DayOfWeek, DAYS } from "@/types";

export default function CRSchedulesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [schedules, setSchedules] = useState<ScheduleWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDay, setFilterDay] = useState<DayOfWeek | "">("");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("access_token");

    if (!userData || !token) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "cr") {
      router.push("/admin");
      return;
    }

    setUser(parsedUser);
    fetchSchedules(parsedUser.department, token);
  }, [router]);

  const fetchSchedules = async (department: string, token: string) => {
    try {
      const res = await fetch(`/api/schedules?department=${department}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setSchedules(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch schedules:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteSchedule = async (scheduleId: number) => {
    if (!confirm("Are you sure you want to delete this schedule?")) return;

    const token = localStorage.getItem("access_token");

    try {
      const res = await fetch(`/api/schedules/${scheduleId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setSchedules(schedules.filter((s) => s.id !== scheduleId));
        alert("Schedule deleted successfully");
      }
    } catch (err) {
      alert("Failed to delete schedule");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const filteredSchedules = filterDay
    ? schedules.filter((s) => s.day_of_week === filterDay)
    : schedules;

  // Group by day
  const schedulesByDay = DAYS.reduce(
    (acc, day) => {
      acc[day] = filteredSchedules.filter((s) => s.day_of_week === day);
      return acc;
    },
    {} as Record<DayOfWeek, ScheduleWithDetails[]>,
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display text-gray-900 mb-2">
            All Schedules
          </h1>
          <p className="text-gray-600">
            {user?.department} Department • {schedules.length} Classes
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => router.push("/cr")}>
            ← Back
          </Button>
          <Button onClick={() => router.push("/cr/add-schedule")}>
            + Add Class
          </Button>
        </div>
      </div>

      {/* Filter */}
      <Card className="mb-8">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">
            Filter by Day:
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterDay("")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterDay === ""
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Days
            </button>
            {DAYS.map((day) => (
              <button
                key={day}
                onClick={() => setFilterDay(day)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterDay === day
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Schedules by Day */}
      {DAYS.map((day) => {
        const daySchedules = schedulesByDay[day];
        if (daySchedules.length === 0 && filterDay && filterDay !== day)
          return null;

        return (
          <Card key={day} title={`📅 ${day}`} className="mb-6">
            {daySchedules.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No classes scheduled for {day}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Course
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Teacher
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Room
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {daySchedules
                      .sort((a, b) => a.time_slot_id - b.time_slot_id)
                      .map((schedule) => (
                        <tr key={schedule.id}>
                          {/* Time */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {schedule.time_slots.slot_name}
                            <br />
                            <span className="text-xs text-gray-500">
                              {schedule.time_slots.start_time.slice(0, 5)} -{" "}
                              {schedule.time_slots.end_time.slice(0, 5)}
                            </span>
                          </td>

                          {/* Course + Batch/Section */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {schedule.course_name}
                            </div>

                            {schedule.course_code && (
                              <div className="text-sm text-gray-500">
                                {schedule.course_code}
                              </div>
                            )}

                            {/* ✅ NEW: Batch + Section */}
                            {schedule.batches && schedule.sections && (
                              <div className="text-xs text-blue-600 mt-1">
                                {schedule.batches.batch_name} - Sec{" "}
                                {schedule.sections.section_name}
                              </div>
                            )}
                          </td>

                          {/* Teacher */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {schedule.teacher_name || "N/A"}
                          </td>

                          {/* Room */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="classroom">
                              {schedule.rooms.room_name}
                            </Badge>
                            <div className="text-xs text-gray-500 mt-1">
                              {schedule.rooms.building}
                            </div>
                          </td>

                          {/* Action */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => deleteSchedule(schedule.id)}
                              className="text-red-600 hover:text-red-900 font-medium"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        );
      })}

      {schedules.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Schedules Yet
            </h3>
            <p className="text-gray-500 mb-4">
              Start by adding your first class schedule
            </p>
            <Button onClick={() => router.push("/cr/add-schedule")}>
              Add First Class
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
