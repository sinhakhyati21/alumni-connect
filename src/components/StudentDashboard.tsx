"use client";

import { useState, useEffect, type SyntheticEvent } from "react";

interface AlumniResult {
  _id: string;
  name: string;
  company?: string;
  jobRole?: string;
  industry?: string;
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

export default function StudentDashboard() {
  const [filters, setFilters] = useState({ company: "", jobRole: "", industry: "" });
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

  async function handleRequestReferral(opportunityId: string) {
    const res = await fetch("/api/referral-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ opportunityId }),
    });

    if (res.ok) {
      setRequestedIds((prev) => new Set(prev).add(opportunityId));
    } else {
      const data = await res.json();
      alert(data.error ?? "Could not send request.");
    }
  }

  async function handleResumeUpload() {
    if (!resumeFile) return;
    setResumeUploading(true);

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

  useEffect(() => {
    loadOpportunities();
  }, []);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-10 rounded-lg border border-slate-200 p-6 dark:border-slate-800">
        <h2 className="mb-2 text-xl font-semibold">AI Career Assistant</h2>
        <p className="mb-4 text-sm text-slate-500">
          Upload your resume to get an AI-powered ATS score, keyword suggestions, and more.
        </p>

        <div className="flex items-center gap-3">
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
            className="text-sm"
          />
          <button
            onClick={handleResumeUpload}
            disabled={!resumeFile || resumeUploading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {resumeUploading ? "Uploading..." : "Upload resume"}
          </button>
        </div>

        {resumeUrl && (
          <p className="mt-3 text-sm text-green-600">
            Resume uploaded. Ready for analysis.
          </p>
        )}
      </div>

      <h1 className="mb-6 text-2xl font-semibold">Find alumni</h1>

      <form onSubmit={handleSearch} className="mb-8 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Company"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          value={filters.company}
          onChange={(e) => setFilters({ ...filters, company: e.target.value })}
        />
        <input
          type="text"
          placeholder="Job role"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          value={filters.jobRole}
          onChange={(e) => setFilters({ ...filters, jobRole: e.target.value })}
        />
        <input
          type="text"
          placeholder="Industry"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          value={filters.industry}
          onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {searched && !loading && results.length === 0 && (
        <p className="text-sm text-slate-500">No alumni matched those filters.</p>
      )}

      <div className="flex flex-col gap-4">
        {results.map((alum) => (
          <div
            key={alum._id}
            className="rounded-lg border border-slate-200 p-4 dark:border-slate-800"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-medium">{alum.name}</h2>
              <span className="text-xs text-slate-500">{alum.score}/100 match</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {alum.jobRole} at {alum.company} · {alum.industry}
            </p>
            {alum.skills && alum.skills.length > 0 && (
              <p className="mt-1 text-xs text-slate-500">{alum.skills.join(", ")}</p>
            )}
            {alum.reason && (
              <p className="mt-1 text-xs text-slate-500">
                <strong>Reason:</strong> {alum.reason}
              </p>
            )}
          </div>
        ))}
      </div>

      <hr className="my-10 border-slate-200 dark:border-slate-800" />

      <h2 className="mb-4 text-xl font-semibold">Open opportunities</h2>

      <div className="mb-4 flex gap-3">
        <input
          type="text"
          placeholder="Filter by skill"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          value={skillFilter}
          onChange={(e) => setSkillFilter(e.target.value)}
        />
        <button
          onClick={() => loadOpportunities(skillFilter)}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-900"
        >
          Filter
        </button>
      </div>

      {oppLoading && <p className="text-sm text-slate-500">Loading opportunities...</p>}

      {!oppLoading && opportunities.length === 0 && (
        <p className="text-sm text-slate-500">No open opportunities right now.</p>
      )}

      <div className="flex flex-col gap-4">
        {opportunities.map((opp) => (
          <div
            key={opp._id}
            className="rounded-lg border border-slate-200 p-4 dark:border-slate-800"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-medium">
                {opp.role} at {opp.company}
              </h3>
              <span className="text-xs text-slate-500">
                Deadline {new Date(opp.deadline).toLocaleDateString()}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{opp.eligibility}</p>
            {opp.requiredSkills?.length > 0 && (
              <p className="mt-1 text-xs text-slate-500">
                Skills: {opp.requiredSkills.join(", ")}
              </p>
            )}
            <p className="mt-1 text-xs text-slate-500">
              Posted by {opp.postedBy?.name} {opp.postedBy?.company ? `(${opp.postedBy.company})` : ""}
            </p>
            <button
              className="mt-3 rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              disabled={requestedIds.has(opp._id)}
              onClick={() => handleRequestReferral(opp._id)}
            >
              {requestedIds.has(opp._id) ? "Requested" : "Request referral"}
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}