"use client";

import { useState, useEffect, type SyntheticEvent } from "react";
import { getRoadmapFor } from "@/lib/roadmap";

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

export default function StudentDashboard() {
  const [filters, setFilters] = useState({ company: "", jobRole: "", industry: "", department: "", batch: "" });
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

  async function handleRequestReferral(opportunityId: string) {
    const res = await fetch("/api/referral-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ opportunityId, message: draftMessages[opportunityId] }),
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

    setDraftMessages((prev) => ({ ...prev, [opportunityId]: data.message }));
  }

  function getSkillMatch(requiredSkills: string[]) {
    const studentSet = new Set(studentSkills.map((s) => s.toLowerCase()));
    const required = requiredSkills.map((s) => s.toLowerCase());
    const missing = requiredSkills.filter((s) => !studentSet.has(s.toLowerCase()));
    const matchCount = required.length - missing.length;
    const matchPercent = required.length > 0 ? Math.round((matchCount / required.length) * 100) : 0;
    return { missing, matchPercent };
  }

  useEffect(() => {
    loadOpportunities();
    loadProfile();
  }, []);

  const sortedOpportunities = [...opportunities].sort((a, b) => {
    const matchA = getSkillMatch(a.requiredSkills).matchPercent;
    const matchB = getSkillMatch(b.requiredSkills).matchPercent;
    return matchB - matchA;
  });

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
          <>
            <p className="mt-3 text-sm text-green-600">
              Resume on file. Ready for analysis.
            </p>
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="mt-3 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 disabled:opacity-50"
            >
              {analyzing ? "Analyzing..." : "Analyze resume"}
            </button>
          </>
        )}

        {analysis && (
          <div className="mt-4 rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-2xl font-semibold">{analysis.atsScore}</span>
              <span className="text-sm text-slate-500">/ 100 ATS score</span>
            </div>

            {analysis.missingKeywords.length > 0 && (
              <div className="mb-3">
                <p className="mb-1 text-sm font-medium">Missing keywords</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {analysis.missingKeywords.join(", ")}
                </p>
              </div>
            )}

            {analysis.improvementSuggestions.length > 0 && (
              <div>
                <p className="mb-1 text-sm font-medium">Suggestions</p>
                <ul className="list-inside list-disc text-sm text-slate-600 dark:text-slate-400">
                  {analysis.improvementSuggestions.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {analysis && analysis.missingKeywords.length > 0 && (
          <div className="mt-4 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
            <p className="mb-2 text-sm font-medium">Suggested learning resources</p>
            {getRoadmapFor(analysis.missingKeywords).length > 0 ? (
              <ul className="flex flex-col gap-1">
                {getRoadmapFor(analysis.missingKeywords).map((r) => (
                  <li key={r.skill} className="text-sm">
                    <span className="text-slate-500">{r.skill}:</span>{" "}
                    
                    <a  href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {r.resource}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">
                No curated resources for these specific keywords yet — try searching for them directly.
              </p>
            )}
          </div>
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
        <input
          type="text"
          placeholder="Department"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          value={filters.department}
          onChange={(e) => setFilters({ ...filters, department: e.target.value })}
        />
        <input
          type="number"
          placeholder="Graduation batch (year)"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          value={filters.batch}
          onChange={(e) => setFilters({ ...filters, batch: e.target.value })}
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
        {sortedOpportunities.map((opp) => {
          const { missing, matchPercent } = getSkillMatch(opp.requiredSkills);
          return (
            <div
              key={opp._id}
              className="rounded-lg border border-slate-200 p-4 dark:border-slate-800"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium">
                  {opp.role} at {opp.company}
                </h3>
                <span className="text-xs font-medium text-blue-600">
                  {matchPercent}% skill match
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{opp.eligibility}</p>
              {opp.requiredSkills?.length > 0 && (
                <p className="mt-1 text-xs text-slate-500">
                  Skills: {opp.requiredSkills.join(", ")}
                </p>
              )}
              {missing.length > 0 && (
                <p className="mt-1 text-xs text-amber-600">Missing: {missing.join(", ")}</p>
              )}
              <p className="mt-1 text-xs text-slate-500">
                Posted by {opp.postedBy?.name} {opp.postedBy?.company ? `(${opp.postedBy.company})` : ""}
              </p>

              {!requestedIds.has(opp._id) && (
                <>
                  {draftMessages[opp._id] ? (
                    <textarea
                      value={draftMessages[opp._id]}
                      onChange={(e) =>
                        setDraftMessages((prev) => ({ ...prev, [opp._id]: e.target.value }))
                      }
                      rows={4}
                      className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                    />
                  ) : (
                    <button
                      onClick={() => handleGenerateMessage(opp._id)}
                      disabled={generatingFor === opp._id}
                      className="mt-3 rounded-lg border border-slate-300 px-4 py-1.5 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 disabled:opacity-50"
                    >
                      {generatingFor === opp._id ? "Generating..." : "Generate referral message"}
                    </button>
                  )}
                </>
              )}

              <button
                className="mt-3 rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                disabled={requestedIds.has(opp._id)}
                onClick={() => handleRequestReferral(opp._id)}
              >
                {requestedIds.has(opp._id) ? "Requested" : "Request referral"}
              </button>
            </div>
          );
        })}
      </div>
    </main>
  );
}