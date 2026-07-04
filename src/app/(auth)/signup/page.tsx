"use client";

import { useState, type SyntheticEvent } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/AuthLayout";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    graduationYear: new Date().getFullYear(),
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : "Something went wrong. Check your details.");
      return;
    }

    router.push("/login?justSignedUp=1");
  }

  return (
    <AuthLayout>
      <h1 className="font-display mb-1 text-2xl font-semibold text-ink">Create your account</h1>
      <p className="mb-6 text-sm text-charcoal/60">Use your official college email.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-charcoal">Full name</label>
          <input
            required
            type="text"
            className="w-full rounded-lg border border-charcoal/15 px-3 py-2 focus:border-ink focus:outline-none"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-charcoal">College email</label>
          <input
            required
            type="email"
            className="w-full rounded-lg border border-charcoal/15 px-3 py-2 focus:border-ink focus:outline-none"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-charcoal">Password</label>
          <input
            required
            minLength={8}
            type="password"
            className="w-full rounded-lg border border-charcoal/15 px-3 py-2 focus:border-ink focus:outline-none"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-charcoal">Graduation year</label>
          <input
            required
            type="number"
            min={2015}
            max={new Date().getFullYear() + 6}
            className="w-full rounded-lg border border-charcoal/15 px-3 py-2 focus:border-ink focus:outline-none"
            value={form.graduationYear}
            onChange={(e) => setForm({ ...form, graduationYear: Number(e.target.value) })}
          />
          <p className="mt-1 text-xs text-charcoal/50">
            This determines whether you're a student or an alum on the platform.
          </p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          disabled={loading}
          type="submit"
          className="mt-2 rounded-lg bg-ink px-4 py-2 font-medium text-white hover:bg-ink-light disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>

        <p className="text-xs leading-relaxed text-charcoal/50">
          We use your official college email only to verify your student or alumni status and keep the network secure.
        </p>
      </form>
    </AuthLayout>
  );
}