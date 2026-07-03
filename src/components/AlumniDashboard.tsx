"use client";

import { useState, useEffect } from "react";

interface ReferralRequestItem {
  _id: string;
  status: "pending" | "accepted" | "declined";
  opportunity?: { company: string; role: string; deadline: string };
  student?: { name: string; department?: string; skills?: string[] };
}

export default function AlumniDashboard() {
  const [form, setForm] = useState({
    company: "",
    role: "",
    eligibility: "",
    skillsInput: "",
    deadline: "",
    referralLink: "",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [requests, setRequests] = useState<ReferralRequestItem[]>([]);
  const [reqLoading, setReqLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const res = await fetch("/api/opportunities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company: form.company,
        role: form.role,
        eligibility: form.eligibility,
        requiredSkills: form.skillsInput.split(",").map((s) => s.trim()).filter(Boolean),
        deadline: form.deadline,
        referralLink: form.referralLink,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      setMessage("Something went wrong. Check your inputs.");
      return;
    }

    setMessage("Opportunity posted.");
    setForm({ company: "", role: "", eligibility: "", skillsInput: "", deadline: "", referralLink: "" });
  }

  async function loadRequests() {
    setReqLoading(true);
    const res = await fetch("/api/referral-requests");
    const data = await res.json();
    setRequests(data.requests ?? []);
    setReqLoading(false);
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function respondToRequest(id: string, status: "accepted" | "declined") {
    const res = await fetch(`/api/referral-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      loadRequests();
    } else {
      const data = await res.json();
      alert(data.error ?? "Could not update request.");
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Post an opportunity</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          required
          type="text"
          placeholder="Company"
          className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          value={form.company}
          onChange={(e) => setForm({ ...form, company: e.target.value })}
        />
        <input
          required
          type="text"
          placeholder="Role"
          className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        />
        <input
          required
          type="text"
          placeholder="Eligibility (e.g. final year CS students)"
          className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          value={form.eligibility}
          onChange={(e) => setForm({ ...form, eligibility: e.target.value })}
        />
        <input
          required
          type="text"
          placeholder="Required skills (comma-separated)"
          className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          value={form.skillsInput}
          onChange={(e) => setForm({ ...form, skillsInput: e.target.value })}
        />
        <input
          required
          type="date"
          className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          value={form.deadline}
          onChange={(e) => setForm({ ...form, deadline: e.target.value })}
        />
        <input
          required
          type="url"
          placeholder="Referral / application link"
          className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          value={form.referralLink}
          onChange={(e) => setForm({ ...form, referralLink: e.target.value })}
        />

        {message && <p className="text-sm text-slate-600 dark:text-slate-400">{message}</p>}

        <button
          disabled={loading}
          type="submit"
          className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Posting..." : "Post opportunity"}
        </button>
      </form>

      <hr className="my-10 border-slate-200 dark:border-slate-800" />

      <h2 className="mb-4 text-xl font-semibold">Incoming referral requests</h2>

      {reqLoading && <p className="text-sm text-slate-500">Loading requests...</p>}

      {!reqLoading && requests.length === 0 && (
        <p className="text-sm text-slate-500">No requests yet.</p>
      )}

      <div className="flex flex-col gap-4">
        {requests.map((r) => (
          <div key={r._id} className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{r.student?.name}</h3>
              <span
                className={`text-xs font-medium ${
                  r.status === "pending"
                    ? "text-amber-600"
                    : r.status === "accepted"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {r.status}
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {r.opportunity?.role} at {r.opportunity?.company}
            </p>
            {r.student?.department && (
              <p className="mt-1 text-xs text-slate-500">
                {r.student.department} · {(r.student.skills ?? []).join(", ")}
              </p>
            )}
            {r.status === "pending" && (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => respondToRequest(r._id, "accepted")}
                  className="rounded-lg bg-green-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-green-700"
                >
                  Accept
                </button>
                <button
                  onClick={() => respondToRequest(r._id, "declined")}
                  className="rounded-lg border border-slate-300 px-4 py-1.5 text-sm font-medium hover:bg-slate-50 dark:border-slate-700"
                >
                  Decline
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}