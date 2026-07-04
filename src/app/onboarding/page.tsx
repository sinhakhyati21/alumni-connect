"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [studentForm, setStudentForm] = useState({
    department: "",
    skillsInput: "",
    projectsInput: "",
  });

  const [alumniForm, setAlumniForm] = useState({
    company: "",
    jobRole: "",
    industry: "",
    experienceYears: 0,
    skillsInput: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (status === "loading") {
    return <main className="flex min-h-screen items-center justify-center">Loading...</main>;
  }

  if (!session?.user) {
    router.push("/login");
    return null;
  }

  const isStudent = session.user.role === "student";

  function toList(input: string) {
    return input
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = isStudent
      ? {
          department: studentForm.department,
          skills: toList(studentForm.skillsInput),
          projects: toList(studentForm.projectsInput),
        }
      : {
          company: alumniForm.company,
          jobRole: alumniForm.jobRole,
          industry: alumniForm.industry,
          experienceYears: Number(alumniForm.experienceYears),
          skills: toList(alumniForm.skillsInput),
        };

    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError("Please fill in all required fields.");
      return;
    }

    // Refresh the JWT so middleware stops redirecting to /onboarding
    await update({ profileComplete: true });
    window.location.href = "/dashboard";
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <h1 className="mb-1 text-2xl font-semibold">
        {isStudent ? "Complete your student profile" : "Complete your alumni profile"}
      </h1>
      <p className="mb-6 text-sm text-slate-500">
        This helps {isStudent ? "alumni and the AI assistant" : "students"} find you.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {isStudent ? (
          <>
            <div>
              <label className="mb-1 block text-sm font-medium">Department</label>
              <input
                required
                type="text"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
                value={studentForm.department}
                onChange={(e) => setStudentForm({ ...studentForm, department: e.target.value })}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Skills (comma-separated)</label>
              <input
                required
                type="text"
                placeholder="React, Node.js, MongoDB"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
                value={studentForm.skillsInput}
                onChange={(e) => setStudentForm({ ...studentForm, skillsInput: e.target.value })}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Projects (comma-separated, optional)</label>
              <input
                type="text"
                placeholder="Project Matchmaker, AlumniConnect"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
                value={studentForm.projectsInput}
                onChange={(e) => setStudentForm({ ...studentForm, projectsInput: e.target.value })}
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="mb-1 block text-sm font-medium">Company</label>
              <input
                required
                type="text"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
                value={alumniForm.company}
                onChange={(e) => setAlumniForm({ ...alumniForm, company: e.target.value })}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Job role</label>
              <input
                required
                type="text"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
                value={alumniForm.jobRole}
                onChange={(e) => setAlumniForm({ ...alumniForm, jobRole: e.target.value })}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Industry</label>
              <input
                required
                type="text"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
                value={alumniForm.industry}
                onChange={(e) => setAlumniForm({ ...alumniForm, industry: e.target.value })}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Years of experience</label>
              <input
                required
                type="number"
                min={0}
                max={60}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
                value={alumniForm.experienceYears}
                onChange={(e) => setAlumniForm({ ...alumniForm, experienceYears: Number(e.target.value) })}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Skills (comma-separated)</label>
              <input
                required
                type="text"
                placeholder="System design, React, leadership"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
                value={alumniForm.skillsInput}
                onChange={(e) => setAlumniForm({ ...alumniForm, skillsInput: e.target.value })}
              />
            </div>
          </>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
  disabled={loading}
  type="submit"
  className="mt-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
>
  {loading ? "Saving..." : "Save and continue"}
</button>
      </form>
    </main>
  );
}