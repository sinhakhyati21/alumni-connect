"use client";

import { useState, type SyntheticEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthLayout from "@/components/AuthLayout";
import { User, Mail, Lock, GraduationCap, ArrowRight, Eye, EyeOff } from "lucide-react";

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
  const [showPassword, setShowPassword] = useState(false);

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
      <div className="animate-hero">
        <h1 className="font-display mb-1 text-2xl font-semibold text-ink sm:text-3xl">
          Create your account
        </h1>
        <p className="mb-7 text-sm text-charcoal/70">Use your official college email.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-charcoal">Full name</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
              <input
                required
                type="text"
                className="w-full rounded-lg border border-charcoal/15 bg-white py-2.5 pl-9 pr-3 text-sm transition-colors focus:border-brass focus:outline-none focus:ring-2 focus:ring-brass/15"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-charcoal">College email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
              <input
                required
                type="email"
                className="w-full rounded-lg border border-charcoal/15 bg-white py-2.5 pl-9 pr-3 text-sm transition-colors focus:border-brass focus:outline-none focus:ring-2 focus:ring-brass/15"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-charcoal">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
              <input
                required
                minLength={8}
                type={showPassword ? "text" : "password"}
                className="w-full rounded-lg border border-charcoal/15 bg-white py-2.5 pl-9 pr-9 text-sm transition-colors focus:border-brass focus:outline-none focus:ring-2 focus:ring-brass/15"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-charcoal/70"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-charcoal">Graduation year</label>
            <div className="relative">
              <GraduationCap size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
              <input
                required
                type="number"
                min={2015}
                max={new Date().getFullYear() + 6}
                className="w-full rounded-lg border border-charcoal/15 bg-white py-2.5 pl-9 pr-3 text-sm transition-colors focus:border-brass focus:outline-none focus:ring-2 focus:ring-brass/15"
                value={form.graduationYear}
                onChange={(e) => setForm({ ...form, graduationYear: Number(e.target.value) })}
              />
            </div>
            <p className="mt-1.5 text-xs text-charcoal/50">
              This determines whether you're a student or an alum on the platform.
            </p>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <button
            disabled={loading}
            type="submit"
            className="group mt-2 flex items-center justify-center gap-2 rounded-lg bg-ink px-4 py-2.5 font-medium text-white transition-colors hover:bg-ink-light disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account"}
            {!loading && (
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            )}
          </button>

          <p className="text-xs leading-relaxed text-charcoal/50">
            We use your official college email only to verify your student or alumni status and keep the network secure.
          </p>
        </form>

        <p className="mt-6 text-center text-sm text-charcoal/60">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-brass hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}