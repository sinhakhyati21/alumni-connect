import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center gap-6 px-6 text-center">
      <span className="rounded-full bg-blue-50 px-4 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-200">
        Built for verified college networks
      </span>
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
        AlumniConnect
      </h1>
      <p className="max-w-xl text-lg text-slate-600 dark:text-slate-400">
        Find alumni, get real referrals, and let an AI career assistant
        sharpen your resume — all inside a network verified by your own
        college email.
      </p>
      <div className="flex gap-4">
        <Link
          href="/signup"
          className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
        >
          Sign up with college email
        </Link>
        <Link
          href="/login"
          className="rounded-lg border border-slate-300 px-6 py-3 font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-900"
        >
          Log in
        </Link>
      </div>
    </main>
  );
}