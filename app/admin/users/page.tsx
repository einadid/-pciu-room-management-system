"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { User } from "@/types";

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterBatch, setFilterBatch] = useState('');
  const [filterSection, setFilterSection] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("access_token");

    if (!userData || !token) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "admin") {
      router.push("/cr");
      return;
    }

    fetchUsers(token);
  }, [router]);

  const fetchUsers = async (token: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setUsers(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    const token = localStorage.getItem("access_token");

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setUsers(users.filter((u) => u.id !== userId));
        alert("User deleted successfully");
      }
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  // Separate admin and cr users
  const adminUsers = users.filter((u) => u.role === "admin");
  const crUsers = users.filter((u) => u.role === "cr");

  // Get unique values for filter dropdowns
  const uniqueDepartments = [...new Set(crUsers.map((u: any) => u.department).filter(Boolean))];
  const uniqueBatches = [...new Set(crUsers.map((u: any) => u.batch_name).filter(Boolean))];
  const uniqueSections = [...new Set(crUsers.map((u: any) => u.section_name).filter(Boolean))];

  // Apply filters to CR users
  const filteredCrUsers = crUsers.filter((user: any) => {
    // Search query - name, email, token_id
    const matchesSearch =
      searchQuery === '' ||
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.token_id?.toLowerCase().includes(searchQuery.toLowerCase());

    // Department filter
    const matchesDepartment =
      filterDepartment === '' || user.department === filterDepartment;

    // Batch filter
    const matchesBatch =
      filterBatch === '' || user.batch_name === filterBatch;

    // Section filter
    const matchesSection =
      filterSection === '' || user.section_name === filterSection;

    return matchesSearch && matchesDepartment && matchesBatch && matchesSection;
  });

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setFilterDepartment('');
    setFilterBatch('');
    setFilterSection('');
  };

  const hasActiveFilters =
    searchQuery || filterDepartment || filterBatch || filterSection;

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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display text-gray-900 mb-2">
            Manage Users
          </h1>
          <p className="text-gray-600">View and manage all system users</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => router.push("/admin")}>
            ← Back
          </Button>
          <Button onClick={() => router.push("/admin/generate-token")}>
            + Generate Token
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card>
          <div className="text-3xl font-bold text-blue-600">{users.length}</div>
          <div className="text-sm text-gray-500 mt-1">Total Users</div>
        </Card>
        <Card>
          <div className="text-3xl font-bold text-purple-600">
            {adminUsers.length}
          </div>
          <div className="text-sm text-gray-500 mt-1">Admins</div>
        </Card>
        <Card>
          <div className="text-3xl font-bold text-green-600">
            {crUsers.length}
          </div>
          <div className="text-sm text-gray-500 mt-1">Class Representatives</div>
        </Card>
      </div>

      {/* Admin Users Table */}
      {adminUsers.length > 0 && (
        <Card title="🛡️ Admin Users" className="mb-8">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Token ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {adminUsers.map((user: any) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-600 font-bold text-sm">
                            {user.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                          <Badge variant="special">Admin</Badge>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                        {user.token_id}
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="default">{user.department || '—'}</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* CR Users - Filter Bar */}
      <Card title="👥 Class Representatives">

        {/* Filter Section */}
        <div className="mb-6 space-y-3">
          {/* Search */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search by name, email or token..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Dropdown Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Department Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Department
              </label>
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Departments</option>
                {uniqueDepartments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Batch Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Batch
              </label>
              <select
                value={filterBatch}
                onChange={(e) => setFilterBatch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Batches</option>
                {uniqueBatches.map((batch) => (
                  <option key={batch} value={batch}>
                    {batch}
                  </option>
                ))}
              </select>
            </div>

            {/* Section Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Section
              </label>
              <select
                value={filterSection}
                onChange={(e) => setFilterSection(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Sections</option>
                {uniqueSections.map((section) => (
                  <option key={section} value={section}>
                    Section {section}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter Results Info + Reset */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing{' '}
              <span className="font-semibold text-gray-800">
                {filteredCrUsers.length}
              </span>{' '}
              of{' '}
              <span className="font-semibold text-gray-800">
                {crUsers.length}
              </span>{' '}
              CR users
            </p>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
              >
                ✕ Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* CR Table */}
        {crUsers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No CR Users Yet
            </h3>
            <p className="text-gray-500 mb-4">
              Generate tokens to create CR accounts
            </p>
            <Button onClick={() => router.push("/admin/generate-token")}>
              Generate Token
            </Button>
          </div>
        ) : filteredCrUsers.length === 0 ? (
          // No results after filter
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Results Found
            </h3>
            <p className="text-gray-500 mb-4">
              No CR users match your current filters
            </p>
            <button
              onClick={resetFilters}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Token ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Batch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Section
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCrUsers.map((user: any) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    {/* Name */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-bold text-sm">
                            {user.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>

                    {/* Token ID */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded font-mono">
                        {user.token_id}
                      </code>
                    </td>

                    {/* Department */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="default">
                        {user.department || '—'}
                      </Badge>
                    </td>

                    {/* Batch */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.batch_name ? (
                        <Badge variant="lab">{user.batch_name}</Badge>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>

                    {/* Section */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.section_name ? (
                        <Badge variant="classroom">
                          Section {user.section_name}
                        </Badge>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>

                    {/* Created */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="text-red-600 hover:text-red-900 font-medium text-sm hover:underline transition-colors"
                      >
                        🗑️ Delete
                      </button>
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