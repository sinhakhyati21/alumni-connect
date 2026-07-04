"use client";

import { useState, type SyntheticEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthLayout from "@/components/AuthLayout";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn("credentials", {
      ...form,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError(
        res.error === "EMAIL_NOT_VERIFIED"
          ? "Please verify your email before logging in."
          : "Invalid email or password."
      );
      return;
    }

    router.push("/dashboard");
  }

  return (
    <AuthLayout>
      <h1 className="font-display mb-1 text-2xl font-semibold text-ink">Log in</h1>
      {params.get("justSignedUp") && (
        <p className="mb-4 text-sm text-ink">
          Account created — check your email to verify before logging in.
        </p>
      )}
      {params.get("verified") && (
        <p className="mb-4 text-sm text-green-700">
          Email verified — you can log in now.
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-charcoal">Email</label>
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
            type="password"
            className="w-full rounded-lg border border-charcoal/15 px-3 py-2 focus:border-ink focus:outline-none"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          disabled={loading}
          type="submit"
          className="mt-2 rounded-lg bg-ink px-4 py-2 font-medium text-white hover:bg-ink-light disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>
    </AuthLayout>
  );
}