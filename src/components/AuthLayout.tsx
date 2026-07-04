import { GraduationCap } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Mobile-only top header, since the left panel is hidden below lg */}
      <div className="flex items-center gap-2 border-b border-ink/8 bg-white px-6 py-4 lg:hidden">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brass/10 text-brass">
          <GraduationCap size={20} />
        </div>
        <span className="font-display text-lg font-semibold text-ink">AlumniConnect</span>
      </div>

      {/* Left panel, desktop only */}
      <div className="hidden w-2/5 flex-col justify-center bg-sage px-12 lg:flex">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-white text-brass shadow-sm">
          <GraduationCap size={24} />
        </div>
        <p className="font-display max-w-md text-2xl font-semibold leading-snug text-ink">
          "The referral that got me my first offer came from an alum I'd never have found without this."
        </p>
        <p className="mt-4 text-sm text-charcoal">Built for verified college networks</p>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-1 flex-col justify-center bg-parchment px-6 py-10 sm:px-10 lg:w-3/5 lg:px-16">
        <div className="mx-auto w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}