"use client";

import { useState } from "react";

interface AlumniResult {
  _id: string;
  name: string;
  company?: string;
  jobRole?: string;
  industry?: string;
  skills?: string[];
  contributionPoints: number;
  score: number;
}

export default function StudentDashboard() {
  const [filters, setFilters] = useState({ company: "", jobRole: "", industry: "" });
  const [results, setResults] = useState<AlumniResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
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

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
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
              <span className="text-xs text-slate-500">match score {alum.score.toFixed(1)}</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {alum.jobRole} at {alum.company} · {alum.industry}
            </p>
            {alum.skills && alum.skills.length > 0 && (
              <p className="mt-1 text-xs text-slate-500">{alum.skills.join(", ")}</p>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}