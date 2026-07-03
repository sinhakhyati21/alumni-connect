"use client";

import { useState, useEffect } from "react";

interface Stats {
  totalStudents: number;
  totalAlumni: number;
  totalOpportunities: number;
  totalRequests: number;
  acceptedRequests: number;
}

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  emailVerified: boolean;
  profileComplete: boolean;
  active: boolean;
  createdAt: string;
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    const res = await fetch("/api/admin/stats");
    const data = await res.json();
    setStats(data.stats ?? null);
    setUsers(data.users ?? []);
    setLoading(false);
  }

  async function toggleActive(userId: string, currentlyActive: boolean) {
    const confirmed = confirm(
      currentlyActive
        ? "Deactivate this user? They will be flagged as inactive."
        : "Reactivate this user?"
    );
    if (!confirmed) return;

    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !currentlyActive }),
    });

    if (res.ok) {
      loadData();
    } else {
      alert("Could not update user status.");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return <main className="mx-auto max-w-5xl px-6 py-10">Loading...</main>;
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Admin dashboard</h1>

      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-5">
        {[
          { label: "Students", value: stats?.totalStudents },
          { label: "Alumni", value: stats?.totalAlumni },
          { label: "Opportunities", value: stats?.totalOpportunities },
          { label: "Referral requests", value: stats?.totalRequests },
          { label: "Accepted", value: stats?.acceptedRequests },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-slate-200 p-4 text-center dark:border-slate-800"
          >
            <p className="text-2xl font-semibold">{card.value ?? 0}</p>
            <p className="text-xs text-slate-500">{card.label}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-4 text-xl font-semibold">Users</h2>

      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Role</th>
              <th className="px-4 py-2 font-medium">Verified</th>
              <th className="px-4 py-2 font-medium">Profile complete</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Joined</th>
              <th className="px-4 py-2 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-t border-slate-200 dark:border-slate-800">
                <td className="px-4 py-2">{u.name}</td>
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2 capitalize">{u.role}</td>
                <td className="px-4 py-2">{u.emailVerified ? "Yes" : "No"}</td>
                <td className="px-4 py-2">{u.profileComplete ? "Yes" : "No"}</td>
                <td className="px-4 py-2">
                  <span className={u.active === false ? "text-red-600" : "text-green-600"}>
                    {u.active === false ? "Inactive" : "Active"}
                  </span>
                </td>
                <td className="px-4 py-2">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => toggleActive(u._id, u.active !== false)}
                    className="text-xs font-medium text-blue-600 hover:underline"
                  >
                    {u.active === false ? "Reactivate" : "Deactivate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}