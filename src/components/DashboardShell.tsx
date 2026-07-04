import type { ReactNode } from "react";

export default function DashboardShell({
  children,
  title = "Welcome back",
  subtitle = "Here's what's happening in your network.",
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#eaf6ff]">
      {/* Full page background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-[#eaf6ff] via-[#f6fbff] to-[#d8ecfb]" />

      {/* Soft glows */}
      <div className="fixed left-[-8rem] top-20 -z-10 h-80 w-80 rounded-full bg-sky-200/60 blur-3xl" />
      <div className="fixed right-[-10rem] top-52 -z-10 h-96 w-96 rounded-full bg-blue-200/60 blur-3xl" />
      <div className="fixed bottom-0 left-1/3 -z-10 h-96 w-96 rounded-full bg-white/70 blur-3xl" />
      <div className="fixed bottom-24 right-1/4 -z-10 h-72 w-72 rounded-full bg-amber-100/40 blur-3xl" />

      {/* Full page icons - fixed so they do not get cut while scrolling */}
      <svg
        className="fixed inset-0 -z-10 h-screen w-screen text-blue-900/20"
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
      >
        <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          {/* left side */}
          <g transform="translate(70 100) scale(1.4)">
            <path d="M5 15L25 5L45 15L25 25Z" fill="currentColor" opacity="0.28" />
            <path d="M13 20v11c0 5 24 5 24 0V20" />
            <path d="M45 15v20" />
            <circle cx="45" cy="39" r="3" fill="currentColor" />
          </g>

          <g transform="translate(65 265) scale(1.35)">
            <rect x="4" y="12" width="42" height="30" rx="5" fill="currentColor" opacity="0.18" />
            <path d="M15 12V7h20v5" />
            <path d="M4 24h42" />
            <path d="M20 24v7h10v-7" />
          </g>

          <g transform="translate(90 460) scale(1.3)">
            <circle cx="25" cy="8" r="7" fill="currentColor" opacity="0.24" />
            <path d="M8 42c2-11 32-11 34 0" />
            <circle cx="0" cy="30" r="6" fill="currentColor" opacity="0.2" />
            <circle cx="50" cy="30" r="6" fill="currentColor" opacity="0.2" />
            <path d="M7 31c8 10 28 10 36 0" />
          </g>

          <g transform="translate(70 760) scale(1.4)">
            <circle cx="8" cy="8" r="7" fill="currentColor" opacity="0.2" />
            <circle cx="50" cy="8" r="7" fill="currentColor" opacity="0.2" />
            <path d="M14 13l12 12" />
            <path d="M44 13L32 25" />
            <rect x="18" y="22" width="22" height="12" rx="6" fill="currentColor" opacity="0.18" />
          </g>

          {/* right side */}
          <g transform="translate(1310 120) scale(1.35)">
            <circle cx="20" cy="10" r="8" fill="currentColor" opacity="0.22" />
            <path d="M4 38c2-14 30-14 32 0" />
          </g>

          <g transform="translate(1285 260) scale(1.35)">
            <rect x="3" y="7" width="48" height="34" rx="5" />
            <path d="M5 9l22 18L49 9" />
          </g>

          <g transform="translate(1295 430) scale(1.4)">
            <rect x="0" y="0" width="44" height="30" rx="7" fill="currentColor" opacity="0.16" />
            <path d="M11 30l-3 9l12-9" />
            <path d="M12 12h20" />
            <path d="M12 20h13" />
          </g>

          <g transform="translate(1290 630) scale(1.35)">
            <path d="M24 2L48 14H0Z" fill="currentColor" opacity="0.2" />
            <path d="M6 14h36v30H6Z" />
            <path d="M14 14v30" />
            <path d="M24 14v30" />
            <path d="M34 14v30" />
          </g>

          <g transform="translate(1285 790) scale(1.25)">
            <circle cx="10" cy="10" r="6" fill="currentColor" opacity="0.22" />
            <circle cx="48" cy="10" r="6" fill="currentColor" opacity="0.22" />
            <circle cx="29" cy="42" r="6" fill="currentColor" opacity="0.22" />
            <path d="M15 14l10 21" />
            <path d="M43 14L33 35" />
            <path d="M16 10h26" />
          </g>
        </g>
      </svg>

      {/* Header */}
      <header className="relative mx-auto mt-0 max-w-6xl overflow-hidden rounded-b-[2rem] bg-gradient-to-br from-[#111c3a] via-[#1f3c78] to-[#18305f] px-8 pb-16 pt-14 shadow-2xl shadow-blue-900/20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_35%,rgba(125,211,252,0.35),transparent_22%),radial-gradient(circle_at_35%_0%,rgba(255,255,255,0.16),transparent_28%)]" />

        <div className="relative">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-white">
            {title}
          </h1>
          <p className="mt-2 text-sm text-blue-100/85">{subtitle}</p>
        </div>

        <svg
          className="absolute bottom-0 left-0 w-full text-[#eaf6ff]"
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
          style={{ height: "52px" }}
        >
          <path
            fill="currentColor"
            d="M0,62L120,68C240,74,480,86,720,78C960,70,1200,44,1320,32L1440,20L1440,100L0,100Z"
          />
        </svg>
      </header>

      {/* Page content */}
      <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-8">
        {children}
      </div>
    </div>
  );
}