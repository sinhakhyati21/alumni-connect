"use client";

import { useState, useEffect } from "react";
import DashboardShell from "@/components/DashboardShell";
import Reveal from "@/components/Reveal";
import { Users, GraduationCap, Briefcase, Handshake, CheckCircle } from "lucide-react";
import CredentialStat from "@/components/CredentialStat";

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
  verifiedBadge: boolean;
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

  async function toggleVerifiedBadge(userId: string, currentlyVerified: boolean) {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verifiedBadge: !currentlyVerified }),
    });

    if (res.ok) {
      loadData();
    } else {
      alert("Could not update verification badge.");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <DashboardShell title="Admin dashboard" subtitle="Monitor platform activity and manage users.">
        <main className="mx-auto max-w-5xl px-6">
          <div className="card-panel p-6 text-ink">Loading...</div>
        </main>
      </DashboardShell>
    );
  }

  const statCards = [
    { label: "Students", value: stats?.totalStudents, icon: GraduationCap },
    { label: "Alumni", value: stats?.totalAlumni, icon: Users },
    { label: "Opportunities", value: stats?.totalOpportunities, icon: Briefcase },
    { label: "Referral requests", value: stats?.totalRequests, icon: Handshake },
    { label: "Accepted", value: stats?.acceptedRequests, icon: CheckCircle },
  ];

  return (
    <DashboardShell title="Admin dashboard" subtitle="Monitor platform activity and manage users.">
      <main className="mx-auto max-w-5xl px-6">
        <Reveal>
          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {statCards.map((card) => (
              <CredentialStat key={card.label} icon={card.icon} value={card.value ?? 0} label={card.label} />
            ))}
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="card-panel p-6">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brass/10 text-brass">
                <Users size={18} />
              </div>
              <h2 className="font-display text-xl font-semibold text-ink">Users</h2>
            </div>

            <div className="overflow-x-auto rounded-lg border border-ink/8">
              <table className="w-full text-left text-sm">
                <thead className="bg-sage/60">
                  <tr>
                    <th className="px-4 py-2 font-medium text-ink">Name</th>
                    <th className="px-4 py-2 font-medium text-ink">Email</th>
                    <th className="px-4 py-2 font-medium text-ink">Role</th>
                    <th className="px-4 py-2 font-medium text-ink">Verified</th>
                    <th className="px-4 py-2 font-medium text-ink">Profile complete</th>
                    <th className="px-4 py-2 font-medium text-ink">Status</th>
                    <th className="px-4 py-2 font-medium text-ink">Badge</th>
                    <th className="px-4 py-2 font-medium text-ink">Joined</th>
                    <th className="px-4 py-2 font-medium text-ink">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className="border-t border-ink/8 transition-colors hover:bg-sage/30">
                      <td className="px-4 py-2 text-charcoal">{u.name}</td>
                      <td className="px-4 py-2 text-charcoal">{u.email}</td>
                      <td className="px-4 py-2 capitalize text-charcoal">{u.role}</td>
                      <td className="px-4 py-2 text-charcoal">{u.emailVerified ? "Yes" : "No"}</td>
                      <td className="px-4 py-2 text-charcoal">{u.profileComplete ? "Yes" : "No"}</td>
                      <td className="px-4 py-2">
                        <span className={u.active === false ? "text-red-700" : "text-green-700"}>
                          {u.active === false ? "Inactive" : "Active"}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {u.role === "alumni" && (
                          <button
                            onClick={() => toggleVerifiedBadge(u._id, u.verifiedBadge)}
                            className={`text-xs font-medium ${
                              u.verifiedBadge ? "text-brass" : "text-charcoal/50"
                            } hover:underline`}
                          >
                            {u.verifiedBadge ? "✓ Verified" : "Grant badge"}
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-2 text-charcoal">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => toggleActive(u._id, u.active !== false)}
                          className="text-xs font-medium text-brass hover:underline"
                        >
                          {u.active === false ? "Reactivate" : "Deactivate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>
      </main>
    </DashboardShell>
  );
}