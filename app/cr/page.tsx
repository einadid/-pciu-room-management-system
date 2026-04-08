"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { User, Schedule } from "@/types";

export default function CRDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
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

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {user?.name}
          </h1>
          <p className="text-gray-600">
            {user?.department} Department • Class Representative
          </p>
        </div>
        <Button variant="secondary" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card>
          <div className="text-2xl font-bold text-blue-600">
            {schedules.length}
          </div>
          <div className="text-sm text-gray-500 mt-1">Total Classes</div>
        </Card>

        <Card>
          <div className="text-2xl font-bold text-green-600">
            {user?.department}
          </div>
          <div className="text-sm text-gray-500 mt-1">Department</div>
        </Card>

        <Card>
          <div className="text-2xl font-bold text-purple-600">
            {user?.token_id}
          </div>
          <div className="text-sm text-gray-500 mt-1">Token ID</div>
        </Card>

        <Card>
          <div className="text-2xl font-bold text-orange-600">Active</div>
          <div className="text-sm text-gray-500 mt-1">Status</div>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Button
          onClick={() => router.push("/cr/add-schedule")}
          className="h-20 text-lg"
        >
          ➕ Add New Class
        </Button>

        <Button
          variant="secondary"
          onClick={() => router.push("/cr/schedules")}
          className="h-20 text-lg"
        >
          📋 View All Schedules
        </Button>

        <Button
          variant="secondary"
          onClick={() => router.push("/check-room")}
          className="h-20 text-lg"
        >
          🔍 Check Availability
        </Button>
        <Button
          variant="secondary"
          onClick={() => router.push("/cr/print-schedule")}
          className="h-20 text-lg"
        >
          🖨️ Print Schedule
        </Button>
      </div>

      {/* Recent Schedules */}
      <Card
        title="📅 Recent Classes"
        subtitle={`${user?.department} Department`}
      >
        {schedules.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Classes Yet
            </h3>
            <p className="text-gray-500 mb-4">
              Start by adding your first class schedule
            </p>
            <Button onClick={() => router.push("/cr/add-schedule")}>
              Add First Class
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teacher
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Day
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Room
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {schedules.slice(0, 5).map((schedule) => (
                  <tr key={schedule.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {schedule.course_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {schedule.course_code}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {schedule.teacher_name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {schedule.day_of_week}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        Room {schedule.room_id}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
