"use client";

import { useState, useEffect, type SyntheticEvent } from "react";
import DashboardShell from "@/components/DashboardShell";
import Reveal from "@/components/Reveal";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import SkillPill from "@/components/ui/SkillPill";
import StatsCard from "@/components/ui/StatsCard";
import EmptyState from "@/components/ui/EmptyState";
import SectionHeader from "@/components/ui/SectionHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  Award,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Handshake,
  Link2,
  Trophy,
  Users,
  UserRound,
  GraduationCap,
} from "lucide-react";

interface ReferralRequestItem {
  _id: string;
  status: "pending" | "accepted" | "declined";
  message?: string;
  followUpMessage?: string;
  opportunity?: { company: string; role: string; deadline: string };
  student?: { name: string; department?: string; skills?: string[] };
}

interface LeaderboardEntry {
  _id: string;
  name: string;
  company?: string;
  jobRole?: string;
  contributionPoints: number;
  referralSuccessRate: number;
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
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
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
        requiredSkills: form.skillsInput
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        deadline: form.deadline,
        referralLink: form.referralLink,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      setMessage("Something went wrong. Check your inputs.");
      return;
    }

    setMessage("Opportunity posted successfully.");
    setForm({
      company: "",
      role: "",
      eligibility: "",
      skillsInput: "",
      deadline: "",
      referralLink: "",
    });
  }

  async function loadRequests() {
    setReqLoading(true);

    const res = await fetch("/api/referral-requests");
    const data = await res.json();

    setRequests(data.requests ?? []);
    setReqLoading(false);
  }

  async function loadLeaderboard() {
    setLeaderboardLoading(true);

    const res = await fetch("/api/leaderboard");
    const data = await res.json();

    setLeaderboard(data.leaderboard ?? []);
    setLeaderboardLoading(false);
  }

  async function respondToRequest(id: string, status: "accepted" | "declined") {
    const res = await fetch(`/api/referral-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      loadRequests();
      loadLeaderboard();
    } else {
      const data = await res.json();
      alert(data.error ?? "Could not update request.");
    }
  }

  useEffect(() => {
    loadRequests();
    loadLeaderboard();
  }, []);

  const pendingRequests = requests.filter((r) => r.status === "pending").length;
  const acceptedRequests = requests.filter((r) => r.status === "accepted").length;
  const declinedRequests = requests.filter((r) => r.status === "declined").length;

  const totalPoints = leaderboard.reduce(
    (sum, entry) => sum + entry.contributionPoints,
    0
  );

  return (
    <DashboardShell
      title="Welcome back"
      subtitle="Post opportunities, review referral requests, and support students."
    >
      <main className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6">
        <Reveal>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <StatsCard
              title="Total Requests"
              value={requests.length}
              subtitle="Incoming referrals"
              icon={<Handshake size={24} />}
            />

            <StatsCard
              title="Pending"
              value={pendingRequests}
              subtitle="Need review"
              icon={<Users size={24} />}
              iconColor="bg-amber-100 text-amber-700"
            />

            <StatsCard
              title="Accepted"
              value={acceptedRequests}
              subtitle="Successful referrals"
              icon={<CheckCircle2 size={24} />}
              iconColor="bg-emerald-100 text-emerald-700"
            />

            <StatsCard
              title="Points"
              value={totalPoints}
              subtitle="Leaderboard total"
              icon={<Trophy size={24} />}
              iconColor="bg-indigo-100 text-indigo-700"
            />
          </div>
        </Reveal>

        <div className="grid gap-8 xl:grid-cols-[1.35fr_0.9fr]">
          <Reveal delay={80}>
            <Card className="p-6 sm:p-8">
              <SectionHeader
                icon={<Briefcase size={24} />}
                title="Post an Opportunity"
                subtitle="Share internships, jobs, and referral openings with students."
              />

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <Input
                    required
                    label="Company"
                    placeholder="Company name"
                    icon={<Building2 size={18} />}
                    value={form.company}
                    onChange={(e) =>
                      setForm({ ...form, company: e.target.value })
                    }
                  />

                  <Input
                    required
                    label="Role"
                    placeholder="Software Engineer Intern"
                    icon={<Briefcase size={18} />}
                    value={form.role}
                    onChange={(e) =>
                      setForm({ ...form, role: e.target.value })
                    }
                  />

                  <Input
                    required
                    label="Eligibility"
                    placeholder="Final year CS students"
                    icon={<GraduationCap size={18} />}
                    value={form.eligibility}
                    onChange={(e) =>
                      setForm({ ...form, eligibility: e.target.value })
                    }
                  />

                  <Input
                    required
                    label="Required skills"
                    placeholder="React, Node.js, MongoDB"
                    icon={<Award size={18} />}
                    value={form.skillsInput}
                    onChange={(e) =>
                      setForm({ ...form, skillsInput: e.target.value })
                    }
                  />

                  <Input
                    required
                    type="date"
                    label="Deadline"
                    icon={<Calendar size={18} />}
                    value={form.deadline}
                    onChange={(e) =>
                      setForm({ ...form, deadline: e.target.value })
                    }
                  />

                  <Input
                    required
                    type="url"
                    label="Referral / application link"
                    placeholder="https://..."
                    icon={<Link2 size={18} />}
                    value={form.referralLink}
                    onChange={(e) =>
                      setForm({ ...form, referralLink: e.target.value })
                    }
                  />
                </div>

                {message && (
                  <div
                    className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
                      message.includes("successfully")
                        ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                        : "border-red-100 bg-red-50 text-red-700"
                    }`}
                  >
                    {message}
                  </div>
                )}

                <div className="flex justify-end">
                  <Button type="submit" loading={loading}>
                    Post Opportunity
                  </Button>
                </div>
              </form>
            </Card>
          </Reveal>

          <Reveal delay={120}>
            <Card className="p-6 sm:p-8">
              <SectionHeader
                icon={<Trophy size={24} />}
                title="Leaderboard Preview"
                subtitle="Top alumni contributors."
              />

              {leaderboardLoading && (
                <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                  Loading leaderboard...
                </p>
              )}

              {!leaderboardLoading && leaderboard.length === 0 && (
                <EmptyState
                  icon={<Trophy size={28} />}
                  title="No contributors yet"
                  description="Accepted referrals will start showing up here."
                />
              )}

              <div className="space-y-4">
                {leaderboard.slice(0, 5).map((entry, index) => (
                  <div
                    key={entry._id}
                    className="flex items-center justify-between rounded-3xl border border-slate-100 bg-slate-50/80 p-4 transition hover:bg-white"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 font-bold text-blue-800">
                        {index + 1}
                      </div>

                      <div>
                        <p className="font-semibold text-slate-950">
                          {entry.name}
                        </p>

                        <p className="text-xs text-slate-500">
                          {entry.jobRole}{" "}
                          {entry.company ? `at ${entry.company}` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-950">
                        {entry.contributionPoints} pts
                      </p>

                      <p className="text-xs text-slate-500">
                        {Math.round(entry.referralSuccessRate * 100)}% success
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Reveal>
        </div>

        <Reveal delay={160}>
          <Card className="p-6 sm:p-8">
            <SectionHeader
              icon={<Handshake size={24} />}
              title="Incoming Referral Requests"
              subtitle="Review student requests and respond quickly."
            />

            {reqLoading && (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                Loading requests...
              </p>
            )}

            {!reqLoading && requests.length === 0 && (
              <EmptyState
                icon={<Handshake size={28} />}
                title="No referral requests"
                description="Once students request referrals, they will appear here."
              />
            )}

            <div className="grid gap-5 lg:grid-cols-2">
              {requests.map((r) => (
                <div
                  key={r._id}
                  className="rounded-3xl border border-slate-100 bg-slate-50/80 p-5 transition hover:bg-white"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                        <UserRound size={22} />
                      </div>

                      <div>
                        <h3 className="font-semibold text-slate-950">
                          {r.student?.name}
                        </h3>

                        <p className="mt-1 text-sm text-slate-600">
                          {r.opportunity?.role}{" "}
                          {r.opportunity?.company
                            ? `at ${r.opportunity.company}`
                            : ""}
                        </p>

                        {r.student?.department && (
                          <p className="mt-1 text-xs text-slate-500">
                            {r.student.department}
                          </p>
                        )}
                      </div>
                    </div>

                    <StatusBadge variant={r.status}>
                      {r.status}
                    </StatusBadge>
                  </div>

                  {r.student?.skills && r.student.skills.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {r.student.skills.map((skill) => (
                        <SkillPill key={skill}>{skill}</SkillPill>
                      ))}
                    </div>
                  )}

                  {r.message && (
                    <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-4">
                      <p className="mb-1 text-xs font-semibold text-slate-500">
                        Student message
                      </p>

                      <p className="text-sm leading-6 text-slate-700">
                        {r.message}
                      </p>
                    </div>
                  )}

                  {r.followUpMessage && (
                    <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                      <p className="mb-1 text-xs font-semibold text-amber-700">
                        Follow-up
                      </p>

                      <p className="text-sm leading-6 text-slate-700">
                        {r.followUpMessage}
                      </p>
                    </div>
                  )}

                  {r.status === "pending" && (
                    <div className="mt-5 flex flex-wrap gap-3">
                      <Button
                        onClick={() => respondToRequest(r._id, "accepted")}
                      >
                        Accept
                      </Button>

                      <Button
                        variant="secondary"
                        onClick={() => respondToRequest(r._id, "declined")}
                      >
                        Decline
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </Reveal>

        <Reveal delay={200}>
          <Card className="p-6 sm:p-8">
            <SectionHeader
              icon={<Award size={24} />}
              title="Top Contributors"
              subtitle="Full leaderboard based on contribution points and referral success rate."
            />

            {leaderboardLoading && (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                Loading leaderboard...
              </p>
            )}

            {!leaderboardLoading && leaderboard.length === 0 && (
              <EmptyState
                icon={<Award size={28} />}
                title="Leaderboard is empty"
                description="Accepted referrals will start contributing to the leaderboard."
              />
            )}

            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry._id}
                  className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-slate-50/80 p-5 transition hover:bg-white sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl font-bold ${
                        index === 0
                          ? "bg-amber-100 text-amber-700"
                          : index === 1
                          ? "bg-slate-200 text-slate-700"
                          : index === 2
                          ? "bg-orange-100 text-orange-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {index + 1}
                    </div>

                    <div>
                      <p className="font-semibold text-slate-950">
                        {entry.name}
                      </p>

                      <p className="text-sm text-slate-500">
                        {entry.jobRole}{" "}
                        {entry.company ? `at ${entry.company}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    <StatusBadge variant="score">
                      {entry.contributionPoints} pts
                    </StatusBadge>

                    <StatusBadge variant="success">
                      {Math.round(entry.referralSuccessRate * 100)}% success
                    </StatusBadge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Reveal>
      </main>
    </DashboardShell>
  );
}