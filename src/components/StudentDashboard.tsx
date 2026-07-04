"use client";

import { useState, useEffect, type SyntheticEvent } from "react";
import { getRoadmapFor } from "@/lib/roadmap";
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
  Bot,
  Search,
  Briefcase,
  Handshake,
  Upload,
  FileText,
  Sparkles,
  GraduationCap,
  Users,
  CheckCircle2,
} from "lucide-react";

interface AlumniResult {
  _id: string;
  name: string;
  company?: string;
  jobRole?: string;
  industry?: string;
  department?: string;
  graduationYear?: number;
  skills?: string[];
  contributionPoints: number;
  score: number;
  reason?: string;
}

interface Opportunity {
  _id: string;
  company: string;
  role: string;
  eligibility: string;
  requiredSkills: string[];
  deadline: string;
  referralLink: string;
  postedBy: { name: string; company?: string };
}

interface ResumeAnalysis {
  atsScore: number;
  missingKeywords: string[];
  improvementSuggestions: string[];
}

interface MyRequest {
  _id: string;
  status: "pending" | "accepted" | "declined";
  opportunity?: { company: string; role: string };
}

export default function StudentDashboard() {
  const [filters, setFilters] = useState({
    company: "",
    jobRole: "",
    industry: "",
    department: "",
    batch: "",
  });

  const [results, setResults] = useState<AlumniResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [oppLoading, setOppLoading] = useState(false);
  const [skillFilter, setSkillFilter] = useState("");
  const [requestedIds, setRequestedIds] = useState<Set<string>>(new Set());

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeText, setResumeText] = useState<string | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);

  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const [draftMessages, setDraftMessages] = useState<Record<string, string>>({});
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);

  const [studentSkills, setStudentSkills] = useState<string[]>([]);
  const [myRequests, setMyRequests] = useState<MyRequest[]>([]);
  const [followUps, setFollowUps] = useState<Record<string, string>>({});
  const [generatingFollowUp, setGeneratingFollowUp] = useState<string | null>(null);

  async function handleSearch(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSearched(true);

    const params = new URLSearchParams(
      Object.entries(filters).filter(([, v]) => v.trim() !== "")
    );

    const res = await fetch(`/api/alumni/search?${params.toString()}`);
    const data = await res.json();

    setResults(data.results ?? []);
    setLoading(false);
  }

  async function loadOpportunities(skill?: string) {
    setOppLoading(true);
    const params = skill ? `?skill=${encodeURIComponent(skill)}` : "";
    const res = await fetch(`/api/opportunities${params}`);
    const data = await res.json();

    setOpportunities(data.opportunities ?? []);
    setOppLoading(false);
  }

  async function loadProfile() {
    const res = await fetch("/api/profile/me");
    if (!res.ok) return;

    const data = await res.json();

    if (data.resumeUrl) setResumeUrl(data.resumeUrl);
    setStudentSkills(data.skills ?? []);
  }

  async function loadMyRequests() {
    const res = await fetch("/api/referral-requests");
    const data = await res.json();

    setMyRequests(data.requests ?? []);
  }

  async function handleRequestReferral(opportunityId: string) {
    const res = await fetch("/api/referral-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        opportunityId,
        message: draftMessages[opportunityId],
      }),
    });

    if (res.ok) {
      setRequestedIds((prev) => new Set(prev).add(opportunityId));
      loadMyRequests();
    } else {
      const data = await res.json();
      alert(data.error ?? "Could not send request.");
    }
  }

  async function handleResumeUpload() {
    if (!resumeFile) return;

    setResumeUploading(true);
    setAnalysis(null);

    const formData = new FormData();
    formData.append("resume", resumeFile);

    const res = await fetch("/api/resume", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setResumeUploading(false);

    if (!res.ok) {
      alert(data.error ?? "Upload failed");
      return;
    }

    setResumeUrl(data.resumeUrl);
    setResumeText(data.extractedText);
  }

  async function handleAnalyze() {
    setAnalyzing(true);

    const res = await fetch("/api/resume/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeText }),
    });

    const data = await res.json();
    setAnalyzing(false);

    if (!res.ok) {
      alert(data.error ?? "Analysis failed");
      return;
    }

    setAnalysis(data);
  }

  async function handleGenerateMessage(opportunityId: string) {
    setGeneratingFor(opportunityId);

    const res = await fetch("/api/referral-requests/generate-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ opportunityId, resumeText }),
    });

    const data = await res.json();
    setGeneratingFor(null);

    if (!res.ok) {
      alert(data.error ?? "Could not generate message");
      return;
    }

    setDraftMessages((prev) => ({
      ...prev,
      [opportunityId]: data.message,
    }));
  }

  async function handleGenerateFollowUp(requestId: string) {
    setGeneratingFollowUp(requestId);

    const res = await fetch(`/api/referral-requests/${requestId}/follow-up`, {
      method: "POST",
    });

    const data = await res.json();
    setGeneratingFollowUp(null);

    if (!res.ok) {
      alert(data.error ?? "Could not generate follow-up");
      return;
    }

    setFollowUps((prev) => ({
      ...prev,
      [requestId]: data.message,
    }));
  }

  function getSkillMatch(requiredSkills: string[]) {
    const studentSet = new Set(studentSkills.map((s) => s.toLowerCase()));
    const required = requiredSkills.map((s) => s.toLowerCase());
    const missing = requiredSkills.filter(
      (s) => !studentSet.has(s.toLowerCase())
    );
    const matchCount = required.length - missing.length;
    const matchPercent =
      required.length > 0 ? Math.round((matchCount / required.length) * 100) : 0;

    return { missing, matchPercent };
  }

  useEffect(() => {
    loadOpportunities();
    loadProfile();
    loadMyRequests();
  }, []);

  const sortedOpportunities = [...opportunities].sort((a, b) => {
    const matchA = getSkillMatch(a.requiredSkills).matchPercent;
    const matchB = getSkillMatch(b.requiredSkills).matchPercent;
    return matchB - matchA;
  });

  return (
    <DashboardShell
      title="Welcome back"
      subtitle="Search alumni, review opportunities, and sharpen your resume."
    >
      <main className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6">
        <Reveal>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <StatsCard
              title="Alumni Found"
              value={results.length}
              subtitle="From search results"
              icon={<Users size={24} />}
            />

            <StatsCard
              title="Opportunities"
              value={opportunities.length}
              subtitle="Open roles"
              icon={<Briefcase size={24} />}
              iconColor="bg-indigo-100 text-indigo-700"
            />

            <StatsCard
              title="Requests"
              value={myRequests.length}
              subtitle="Referral activity"
              icon={<Handshake size={24} />}
              iconColor="bg-cyan-100 text-cyan-700"
            />

            <StatsCard
              title="ATS Score"
              value={analysis?.atsScore ?? "--"}
              subtitle="Latest resume score"
              icon={<Sparkles size={24} />}
              iconColor="bg-emerald-100 text-emerald-700"
            />
          </div>
        </Reveal>

        <Reveal delay={60}>
          <Card className="p-6 sm:p-8">
            <SectionHeader
              icon={<Bot size={24} />}
              title="AI Career Assistant"
              subtitle="Upload your resume to get an ATS score, missing keywords, and improvement suggestions."
            />

            <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
              <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <label className="flex min-h-14 flex-1 cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-blue-300 bg-white px-4 py-3 text-sm text-slate-600 transition hover:bg-blue-50">
                    <FileText size={20} className="text-blue-700" />
                    <span className="truncate">
                      {resumeFile ? resumeFile.name : "Choose PDF resume"}
                    </span>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
                      className="hidden"
                    />
                  </label>

                  <Button
                    onClick={handleResumeUpload}
                    loading={resumeUploading}
                    disabled={!resumeFile}
                  >
                    <Upload size={16} />
                    Upload resume
                  </Button>
                </div>

                {resumeUrl && (
                  <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="text-emerald-700" size={20} />
                      <p className="text-sm font-medium text-emerald-800">
                        Resume on file. Ready for analysis.
                      </p>
                    </div>

                    <Button
                      variant="secondary"
                      onClick={handleAnalyze}
                      loading={analyzing}
                    >
                      Analyze resume
                    </Button>
                  </div>
                )}

                {analysis && analysis.missingKeywords.length > 0 && (
                  <div className="mt-5 rounded-2xl bg-white p-5">
                    <p className="mb-3 text-sm font-semibold text-slate-950">
                      Suggested learning resources
                    </p>

                    {getRoadmapFor(analysis.missingKeywords).length > 0 ? (
                      <ul className="space-y-3">
                        {getRoadmapFor(analysis.missingKeywords).map((r) => (
                          <li key={r.skill} className="text-sm">
                            <p>
                              <span className="font-semibold text-slate-950">
                                {r.skill}
                              </span>{" "}
                              —{" "}
                              <a
                                href={r.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-blue-700 hover:underline"
                              >
                                {r.resource}
                              </a>
                            </p>

                            {r.certification && (
                              <p className="text-xs text-slate-500">
                                Certification: {r.certification}
                              </p>
                            )}

                            {r.projectIdea && (
                              <p className="text-xs text-slate-500">
                                Project idea: {r.projectIdea}
                              </p>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-500">
                        No curated resources for these keywords yet.
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6">
                <p className="text-sm font-medium text-slate-500">ATS Score</p>

                <div className="mt-4 flex items-end gap-2">
                  <span className="text-5xl font-bold text-slate-950">
                    {analysis ? analysis.atsScore : "--"}
                  </span>
                  <span className="pb-2 text-sm text-slate-500">/ 100</span>
                </div>

                <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all duration-700"
                    style={{ width: `${analysis?.atsScore ?? 0}%` }}
                  />
                </div>

                {analysis && (
                  <div className="mt-5 space-y-4">
                    {analysis.missingKeywords.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-slate-950">
                          Missing keywords
                        </p>

                        <div className="mt-2 flex flex-wrap gap-2">
                          {analysis.missingKeywords.map((keyword) => (
                            <SkillPill key={keyword}>{keyword}</SkillPill>
                          ))}
                        </div>
                      </div>
                    )}

                    {analysis.improvementSuggestions.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-slate-950">
                          Suggestions
                        </p>

                        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600">
                          {analysis.improvementSuggestions.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </Reveal>

        <div className="grid gap-8 lg:grid-cols-2">
          <Reveal delay={100}>
            <Card className="p-6 sm:p-8">
              <SectionHeader
                icon={<Search size={24} />}
                title="Find Alumni"
                subtitle="Search and connect with alumni from your network."
              />

              <form onSubmit={handleSearch} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    placeholder="Company"
                    value={filters.company}
                    onChange={(e) =>
                      setFilters({ ...filters, company: e.target.value })
                    }
                  />

                  <Input
                    placeholder="Job role"
                    value={filters.jobRole}
                    onChange={(e) =>
                      setFilters({ ...filters, jobRole: e.target.value })
                    }
                  />

                  <Input
                    placeholder="Industry"
                    value={filters.industry}
                    onChange={(e) =>
                      setFilters({ ...filters, industry: e.target.value })
                    }
                  />

                  <Input
                    placeholder="Department"
                    value={filters.department}
                    onChange={(e) =>
                      setFilters({ ...filters, department: e.target.value })
                    }
                  />

                  <Input
                    type="number"
                    placeholder="Graduation batch"
                    value={filters.batch}
                    onChange={(e) =>
                      setFilters({ ...filters, batch: e.target.value })
                    }
                  />

                  <Button type="submit" loading={loading}>
                    Search
                  </Button>
                </div>
              </form>

              <div className="mt-6 space-y-4">
                {searched && !loading && results.length === 0 && (
                  <EmptyState
                    icon={<Users size={28} />}
                    title="No alumni found"
                    description="Try changing your filters and searching again."
                  />
                )}

                {results.map((alum) => (
                  <div
                    key={alum._id}
                    className="rounded-3xl border border-slate-100 bg-slate-50/80 p-5 transition hover:bg-white"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 font-bold text-blue-800">
                          {alum.name?.charAt(0)?.toUpperCase() ?? "A"}
                        </div>

                        <div>
                          <h3 className="font-semibold text-slate-950">
                            {alum.name}
                          </h3>

                          <p className="mt-1 text-sm text-slate-600">
                            {alum.jobRole}{" "}
                            {alum.company ? `at ${alum.company}` : ""}
                          </p>

                          <p className="text-xs text-slate-500">
                            {alum.department}{" "}
                            {alum.graduationYear
                              ? `· ${alum.graduationYear}`
                              : ""}
                          </p>
                        </div>
                      </div>

                      <StatusBadge variant="match">
                        {alum.score}/100
                      </StatusBadge>
                    </div>

                    {alum.skills && alum.skills.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {alum.skills.map((skill) => (
                          <SkillPill key={skill}>{skill}</SkillPill>
                        ))}
                      </div>
                    )}

                    {alum.reason && (
                      <p className="mt-3 text-xs text-slate-500">
                        <span className="font-semibold">Reason:</span>{" "}
                        {alum.reason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </Reveal>

          <Reveal delay={140}>
            <Card className="p-6 sm:p-8">
              <SectionHeader
                icon={<Briefcase size={24} />}
                title="Open Opportunities"
                subtitle="Discover roles that match your skills."
              />

              <div className="mb-6 flex gap-3">
                <Input
                  placeholder="Filter by skill"
                  value={skillFilter}
                  onChange={(e) => setSkillFilter(e.target.value)}
                />

                <Button
                  variant="secondary"
                  onClick={() => loadOpportunities(skillFilter)}
                >
                  Filter
                </Button>
              </div>

              {oppLoading && (
                <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                  Loading opportunities...
                </p>
              )}

              {!oppLoading && opportunities.length === 0 && (
                <EmptyState
                  icon={<Briefcase size={28} />}
                  title="No opportunities"
                  description="There are no open opportunities right now."
                />
              )}

              <div className="space-y-4">
                {sortedOpportunities.map((opp) => {
                  const { missing, matchPercent } = getSkillMatch(
                    opp.requiredSkills
                  );

                  return (
                    <div
                      key={opp._id}
                      className="rounded-3xl border border-slate-100 bg-slate-50/80 p-5 transition hover:bg-white"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-slate-950">
                            {opp.role}
                          </h3>

                          <p className="mt-1 text-sm text-slate-600">
                            {opp.company}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {opp.eligibility}
                          </p>
                        </div>

                        <StatusBadge variant="match">
                          {matchPercent}% Match
                        </StatusBadge>
                      </div>

                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-600 to-emerald-500"
                          style={{ width: `${matchPercent}%` }}
                        />
                      </div>

                      {opp.requiredSkills?.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {opp.requiredSkills.map((skill) => (
                            <SkillPill key={skill}>{skill}</SkillPill>
                          ))}
                        </div>
                      )}

                      {missing.length > 0 && (
                        <p className="mt-3 text-xs font-medium text-amber-700">
                          Missing: {missing.join(", ")}
                        </p>
                      )}

                      <p className="mt-3 text-xs text-slate-500">
                        Posted by {opp.postedBy?.name}{" "}
                        {opp.postedBy?.company
                          ? `(${opp.postedBy.company})`
                          : ""}
                      </p>

                      {!requestedIds.has(opp._id) && (
                        <>
                          {draftMessages[opp._id] ? (
                            <textarea
                              value={draftMessages[opp._id]}
                              onChange={(e) =>
                                setDraftMessages((prev) => ({
                                  ...prev,
                                  [opp._id]: e.target.value,
                                }))
                              }
                              rows={4}
                              className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                            />
                          ) : (
                            <Button
                              variant="secondary"
                              onClick={() => handleGenerateMessage(opp._id)}
                              loading={generatingFor === opp._id}
                              className="mt-4"
                            >
                              Generate referral message
                            </Button>
                          )}
                        </>
                      )}

                      <Button
                        className="mt-3"
                        disabled={requestedIds.has(opp._id)}
                        onClick={() => handleRequestReferral(opp._id)}
                      >
                        {requestedIds.has(opp._id)
                          ? "Requested"
                          : "Request referral"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </Card>
          </Reveal>
        </div>

        <Reveal delay={180}>
          <Card className="p-6 sm:p-8">
            <SectionHeader
              icon={<Handshake size={24} />}
              title="My Referral Requests"
              subtitle="Track pending, accepted, and declined referral requests."
            />

            {myRequests.length === 0 && (
              <EmptyState
                icon={<Handshake size={28} />}
                title="No referral requests"
                description="Once you request referrals, they will appear here."
              />
            )}

            <div className="grid gap-4 md:grid-cols-2">
              {myRequests.map((r) => (
                <div
                  key={r._id}
                  className="rounded-3xl border border-slate-100 bg-slate-50/80 p-5 transition hover:bg-white"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                        <GraduationCap size={20} />
                      </div>

                      <div>
                        <h3 className="font-semibold text-slate-950">
                          {r.opportunity?.role}
                        </h3>

                        <p className="text-sm text-slate-500">
                          {r.opportunity?.company}
                        </p>
                      </div>
                    </div>

                    <StatusBadge variant={r.status}>
                      {r.status}
                    </StatusBadge>
                  </div>

                  {r.status === "pending" && (
                    <div className="mt-4">
                      {followUps[r._id] ? (
                        <p className="rounded-2xl bg-white p-3 text-sm text-slate-700">
                          {followUps[r._id]}
                        </p>
                      ) : (
                        <Button
                          variant="secondary"
                          onClick={() => handleGenerateFollowUp(r._id)}
                          loading={generatingFollowUp === r._id}
                        >
                          Generate & send follow-up
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </Reveal>
      </main>
    </DashboardShell>
  );
}