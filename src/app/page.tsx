import Link from "next/link";
import { Search, Handshake, Sparkles, GraduationCap, Briefcase, Bot, ArrowRight, Users, Award } from "lucide-react";
import Reveal from "@/components/Reveal";
import CredentialStat from "@/components/CredentialStat";
import { connectDB } from "@/lib/db";
import User from "@/models/User.model";
import Opportunity from "@/models/Opportunity.model";
import ReferralRequest from "@/models/ReferralRequest.model";

const steps = [
  {
    icon: Sparkles,
    title: "Verify",
    description: "Sign up with your official college email. We confirm it's really you, and automatically classify you as a student or alumnus based on your graduation year.",
  },
  {
    icon: Search,
    title: "Discover",
    description: "Search alumni by company, role, industry, department, or batch. An AI ranks your best matches and explains why each one is worth reaching out to.",
  },
  {
    icon: Handshake,
    title: "Connect",
    description: "Request a referral with an AI-drafted message built from your resume, track its status, and follow up automatically if it goes quiet.",
  },
];

const studentFeatures = [
  "AI-ranked alumni search across company, role, industry, department, and batch",
  "Resume upload with instant ATS scoring and missing-keyword breakdown",
  "Personalized learning roadmap with certifications and project ideas",
  "AI-drafted referral requests and follow-up messages",
];

const alumniFeatures = [
  "Post internships, full-time roles, and referral opportunities in minutes",
  "Review incoming referral requests with full student context",
  "Earn contribution points for posting and for referrals that land",
  "Climb the leaderboard as one of the network's top contributors",
];

async function getStats() {
  try {
    await connectDB();
    const [students, alumni, opportunities, accepted] = await Promise.all([
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "alumni" }),
      Opportunity.countDocuments({}),
      ReferralRequest.countDocuments({ status: "accepted" }),
    ]);
    return { network: students + alumni, opportunities, accepted };
  } catch {
    return { network: 0, opportunities: 0, accepted: 0 };
  }
}

export default async function LandingPage() {
  const stats = await getStats();

  return (
    <main className="flex flex-col bg-parchment">
      {/* Hero */}
      <div className="relative z-0 overflow-hidden px-6 pt-24 pb-20">
        <img
          src="/hero-banner.png"
          alt=""
          className="absolute inset-0 -z-10 h-full w-full object-cover object-top"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-white/10 to-white" />

        <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
          <span className="animate-hero flex items-center gap-2 rounded-full border border-brass/25 bg-white px-4 py-1.5 text-sm font-medium text-brass shadow-sm">
            <Sparkles size={14} />
            Built for verified college networks
          </span>
          <h1 className="animate-hero-delay-1 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            AlumniConnect
          </h1>
          <p className="animate-hero-delay-1 max-w-xl text-lg text-charcoal">
            Find alumni, get real referrals, and let an AI career assistant
            sharpen your resume — all inside a network verified by your own
            college email.
          </p>
          <div className="animate-hero-delay-2 flex gap-4">
            <Link
              href="/signup"
              className="group flex items-center gap-2 rounded-lg bg-ink px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-ink-light"
            >
              Sign up with college email
              <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-ink/15 bg-white px-6 py-3 font-medium text-ink transition-colors duration-200 hover:bg-sage"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>

      {/* Floating stats card, bridging hero into the next section */}
      <div className="relative z-10 -mt-14 px-6">
        <div className="mx-auto grid max-w-3xl grid-cols-3 gap-3">
          <CredentialStat icon={Users} value={`${stats.network}+`} label="Verified members" />
          <CredentialStat icon={Briefcase} value={`${stats.opportunities}+`} label="Opportunities" />
          <CredentialStat icon={Award} value={`${stats.accepted}+`} label="Referrals accepted" />
        </div>
      </div>

      {/* How it works — stepper */}
      <section className="relative overflow-hidden bg-sage px-6 pb-24 pt-16">
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-brass/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-ink/5 blur-3xl" />

        <div className="relative mx-auto max-w-5xl">
          <Reveal className="mb-16 text-center">
            <h2 className="font-display text-3xl font-semibold text-ink">How it works</h2>
            <p className="mt-3 text-charcoal">Three steps from signup to your first referral.</p>
          </Reveal>

          <div className="relative">
            {/* Connecting line — desktop only, sits behind the circles */}
            <div className="absolute left-0 right-0 top-7 hidden h-0.5 bg-ink/10 sm:block">
              <div className="h-full w-full bg-gradient-to-r from-brass/60 via-brass/60 to-brass/20" />
            </div>

            <div className="relative grid gap-10 sm:grid-cols-3 sm:gap-8">
              {steps.map((s, i) => (
                <Reveal key={s.title} delay={i * 150}>
                  <div className="group flex flex-col items-center text-center sm:items-start sm:text-left">
                    <div className="relative z-10 mb-5 flex items-center gap-4 sm:flex-col sm:items-start sm:gap-0">
                      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border-4 border-sage bg-white font-display text-lg font-semibold text-brass shadow-md transition-all duration-300 group-hover:scale-110 group-hover:bg-brass group-hover:text-white">
                        {i + 1}
                      </div>
                    </div>

                    <div className="w-full rounded-xl border border-ink/8 bg-white p-6 shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg group-hover:border-brass/30 sm:mt-5">
                      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-brass/10 text-brass">
                        <s.icon size={18} />
                      </div>
                      <h3 className="font-display text-lg font-semibold text-ink">{s.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-charcoal">{s.description}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Dual audience */}
      <section className="relative overflow-hidden bg-parchment px-6 py-24">
        <div className="pointer-events-none absolute right-0 top-1/3 h-80 w-80 rounded-full bg-brass/5 blur-3xl" />

        <div className="relative mx-auto max-w-5xl">
          <Reveal className="mb-16 text-center">
            <h2 className="font-display text-3xl font-semibold text-ink">Built for both sides of the network</h2>
            <p className="mt-3 text-charcoal">Whether you're job hunting or hiring, the same platform works for you.</p>
          </Reveal>

          <div className="grid gap-8 sm:grid-cols-2">
            <Reveal>
              <div className="group h-full rounded-xl border border-ink/8 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:border-brass/30">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-brass/10 text-brass transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                  <GraduationCap size={22} />
                </div>
                <h3 className="font-display mb-5 text-2xl font-semibold text-ink">For students</h3>
                <ul className="flex flex-col gap-4">
                  {studentFeatures.map((f) => (
                    <li key={f} className="flex gap-3 text-sm text-charcoal">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brass" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={150}>
              <div className="group h-full rounded-xl border border-ink/8 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:border-brass/30">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-brass/10 text-brass transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                  <Briefcase size={22} />
                </div>
                <h3 className="font-display mb-5 text-2xl font-semibold text-ink">For alumni</h3>
                <ul className="flex flex-col gap-4">
                  {alumniFeatures.map((f) => (
                    <li key={f} className="flex gap-3 text-sm text-charcoal">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brass" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* AI Assistant spotlight */}
      <section className="relative overflow-hidden bg-sage px-6 py-24">
        <div className="pointer-events-none absolute -left-20 bottom-10 h-72 w-72 rounded-full bg-ink/5 blur-3xl" />

        <div className="relative mx-auto grid max-w-5xl gap-12 sm:grid-cols-2 sm:items-center">
          <Reveal>
            <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-brass/25 bg-white px-3 py-1 text-xs font-medium text-brass shadow-sm">
              <Bot size={14} />
              AI Career Assistant
            </span>
            <h2 className="font-display mb-4 text-3xl font-semibold text-ink">
              Your resume, reviewed before you send it
            </h2>
            <p className="mb-4 text-sm leading-relaxed text-charcoal">
              Upload a resume and get an ATS compatibility score, the exact
              keywords you're missing, and specific suggestions to fix them —
              generated in seconds, not days.
            </p>
            <p className="text-sm leading-relaxed text-charcoal">
              Then let the same assistant draft your referral request,
              matched to the alumnus and role you're targeting, and a
              polite follow-up if it goes quiet.
            </p>
          </Reveal>

          <Reveal delay={150}>
            <div className="group rounded-xl border border-ink/8 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:border-brass/30">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-ink">ATS compatibility</span>
                <span className="font-display text-2xl font-semibold text-ink">82<span className="text-sm text-charcoal">/100</span></span>
              </div>
              <div className="mb-5 h-2 w-full overflow-hidden rounded-full bg-sage">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-emerald-500"
                  style={{ width: "82%" }}
                />
              </div>
              <div className="mb-4">
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-charcoal/70">Missing keywords</p>
                <p className="text-sm text-ink">System design, Docker, CI/CD</p>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-charcoal/70">Suggestion</p>
                <p className="text-sm text-ink">Quantify the impact of your final-year project with a measurable outcome.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden bg-gradient-to-br from-ink to-ink-light px-6 py-24 text-center">
        <div className="pointer-events-none absolute left-1/4 top-0 h-64 w-64 rounded-full bg-brass/20 blur-3xl" />
        <div className="pointer-events-none absolute right-1/4 bottom-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

        <Reveal className="relative mx-auto max-w-2xl">
          <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
            <GraduationCap size={26} className="text-brass-light" />
          </div>
          <h2 className="font-display mb-4 text-3xl font-semibold text-white">
            Your network is already here.
          </h2>
          <p className="mb-8 text-white/80">Sign up with your college email and see who's already on it.</p>
          <Link
            href="/signup"
            className="group inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3 font-medium text-ink transition-colors duration-200 hover:bg-brass-light"
          >
            Sign up with college email
            <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </section>

      <footer className="border-t border-ink/8 bg-white px-6 py-8 text-center text-sm text-charcoal">
        AlumniConnect — built for verified college networks.
      </footer>
    </main>
  );
}