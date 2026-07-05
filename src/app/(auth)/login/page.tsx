"use client";

import { useState, useEffect, type SyntheticEvent, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import AuthLayout from "@/components/AuthLayout";
import { Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [justVerified, setJustVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const pendingEmail = sessionStorage.getItem("pendingVerifyEmail");
    if (!pendingEmail) return;

    fetch(`/api/check-verified?email=${encodeURIComponent(pendingEmail)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.verified) {
          setJustVerified(true);
          setError(null);
          sessionStorage.removeItem("pendingVerifyEmail");
        }
      })
      .catch(() => {});
  }, []);

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
      if (res.error === "EMAIL_NOT_VERIFIED") {
        setError("Please verify your email before logging in.");
        sessionStorage.setItem("pendingVerifyEmail", form.email);
      } else if (res.error === "ACCOUNT_DEACTIVATED") {
        setError("This account has been deactivated. Contact an administrator.");
      } else {
        setError("Invalid email or password.");
      }
      return;
    }

    router.push("/dashboard");
  }

  return (
    <AuthLayout>
      <div className="animate-hero">
        <h1 className="font-display mb-1 text-2xl font-semibold text-ink sm:text-3xl">Log in</h1>
        <p className="mb-7 text-sm text-charcoal/70">Welcome back to your network.</p>

        {params.get("justSignedUp") && (
          <p className="mb-4 rounded-lg bg-blue-50 px-3 py-2 text-sm text-ink">
            Account created — check your email to verify before logging in.
          </p>
        )}
        {params.get("verified") && (
          <p className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
            Email verified — you can log in now.
          </p>
        )}
        {justVerified && (
          <p className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
            Email is verified — you can log in now.
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-charcoal">Email</label>
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

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <button
            disabled={loading}
            type="submit"
            className="group mt-2 flex items-center justify-center gap-2 rounded-lg bg-ink px-4 py-2.5 font-medium text-white transition-colors hover:bg-ink-light disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Log in"}
            {!loading && (
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-charcoal/60">
          New here?{" "}
          <Link href="/signup" className="font-medium text-brass hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}