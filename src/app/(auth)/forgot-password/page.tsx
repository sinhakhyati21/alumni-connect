"use client";

import { useState, type SyntheticEvent } from "react";
import Link from "next/link";
import AuthLayout from "@/components/AuthLayout";
import { Mail, ArrowRight } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const res = await fetch("/api/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    setLoading(false);
    setMessage(data.message ?? "If an account with that email exists, a reset link has been sent.");
  }

  return (
    <AuthLayout>
      <div className="animate-hero">
        <h1 className="font-display mb-1 text-2xl font-semibold text-ink sm:text-3xl">
          Forgot password
        </h1>
        <p className="mb-7 text-sm text-charcoal/70">
          Enter your college email and we'll send you a reset link.
        </p>

        {message ? (
          <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{message}</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-charcoal">College email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
                <input
                  required
                  type="email"
                  className="w-full rounded-lg border border-charcoal/15 bg-white py-2.5 pl-9 pr-3 text-sm transition-colors focus:border-brass focus:outline-none focus:ring-2 focus:ring-brass/15"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="group mt-2 flex items-center justify-center gap-2 rounded-lg bg-ink px-4 py-2.5 font-medium text-white transition-colors hover:bg-ink-light disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send reset link"}
              {!loading && (
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              )}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-charcoal/60">
          <Link href="/login" className="font-medium text-brass hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}