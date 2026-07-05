# AlumniConnect

A verified college alumni networking and referral platform built for **HackSphere PS1**. Students discover alumni, request referrals, and get AI-powered career coaching — all inside a network gated by official college email verification.

**Live demo:** https://alumni-connect-ecru.vercel.app

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture Notes](#architecture-notes)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Seeding an Admin Account](#seeding-an-admin-account)
- [Project Structure](#project-structure)
- [Known Limitations](#known-limitations)
- [Demo Credentials](#demo-credentials)

---

## Overview

AlumniConnect solves a simple problem: students want referrals, alumni want to help but are hard to find and don't have time to sift through generic requests, and neither side trusts an unverified network. AlumniConnect fixes this by:

- Verifying every account against an official college email domain
- Automatically classifying accounts as **Student** or **Alumni** based on graduation year
- Using AI to rank alumni search results by actual relevance (skills, industry, responsiveness) instead of a static list
- Using AI to help students write better referral requests and prep for interviews
- Rewarding alumni who actually help, with a public leaderboard and verification badges

## Features

### Authentication & Profiles
- College-email-only signup with real email verification
- Automatic Student ⇄ Alumni role classification and transition based on graduation year
- Role-specific onboarding (Department/Skills/Projects for students; Company/Role/Industry/Experience for alumni)

### Alumni Discovery
- Search by Company, Role, Industry, Department, and Graduation Batch
- AI-powered ranking (Groq) factoring in skill overlap, contribution history, referral success rate, and responsiveness — with a plain-English reason for every match

### Referral & Opportunity Portal
- Alumni post internships/roles with required skills, eligibility, and deadlines
- Duplicate postings are ranked by the poster's seniority, contribution score, and success rate
- Full referral request lifecycle: request → accept/decline → status tracking
- AI-drafted referral request messages and automatic follow-ups if a request goes quiet

### AI Career Assistant
- Resume upload (PDF) **or** build a resume directly on the platform, with a live preview and PDF export
- Instant ATS compatibility score, missing-keyword analysis, and improvement suggestions
- Per-opportunity skill-gap analysis showing exactly what a student is missing
- Personalized learning roadmap: resources, certifications, and project ideas for each missing skill
- Interview-readiness quiz: 5 tailored multiple-choice questions per opportunity, scored, with topics to review

### Contribution System
- Points for posting opportunities and for referrals that get accepted
- Live leaderboard of top-contributing alumni
- Admin-granted verification badges, shown across search results, postings, and the leaderboard

### Admin Dashboard
- Platform-wide stats (students, alumni, opportunities, requests, acceptance rate)
- Full user table with verification/profile/active status
- Deactivate/reactivate accounts (deactivation blocks login immediately) and grant/revoke verification badges

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | MongoDB (Atlas) via Mongoose |
| Auth | NextAuth v5, JWT sessions, Credentials provider |
| AI | Groq (Llama 3.3 70B) for ranking/message generation/interview quizzes; Gemini (structured output) for resume ATS scoring |
| File storage | Cloudinary (resume PDFs) |
| Email | Nodemailer via Gmail SMTP |
| PDF parsing | `unpdf` (serverless-safe, no native canvas dependency) |
| PDF generation | `jsPDF` (client-side resume export) |
| Styling | Tailwind CSS v4, custom design tokens |
| Icons | lucide-react |
| Hosting | Vercel |

## Architecture Notes

A few decisions worth calling out, since they weren't obvious on the first pass:

- **Middleware runs on Node, not Edge, via the `proxy.ts` convention** (Next.js 16 renamed `middleware.ts`). The NextAuth config is split into `auth.config.ts` (Edge-safe, no providers) and `auth.ts` (full config with the Credentials provider, bcrypt, and Mongoose) — the proxy only imports the Edge-safe half, so bcrypt/Mongoose never get bundled into the restricted runtime.
- **Role is never user-editable.** It's computed once at signup and recomputed on every login from `graduationYear`, so a student can't manipulate their own role.
- **PDF text extraction uses `unpdf`, not `pdf-parse`.** `pdf-parse` v2 depends on browser-only APIs (`DOMMatrix`, canvas) that don't reliably polyfill on Vercel's serverless functions. `unpdf` was built specifically for serverless/edge environments and avoids the issue entirely.
- **AI ranking is genuinely AI-driven, not a hardcoded formula.** Alumni search results are ranked by an LLM call (Groq) that receives each candidate's skills, contribution history, and responsiveness, and returns both a score and a one-sentence reason — this was a deliberate choice over writing a weighted scoring function by hand.
- **Skill-gap analysis and the learning roadmap are rule-based, not AI**, by design — for a live demo, instant deterministic results matter more than an extra AI round-trip for something a simple set comparison already solves well.
- **Deactivated accounts are blocked at login**, not mid-session — an already-logged-in user whose account is deactivated retains access until their session naturally expires, since re-checking status on every request would add a DB call to every protected route. This is a deliberate tradeoff between security and performance for the scope of this project.

## Getting Started

```bash
git clone https://github.com/sinhakhyati21/alumni-connect.git
cd alumni-connect
npm install
cp .env.example .env.local
# fill in .env.local — see Environment Variables below
npm run dev
```

Visit `http://localhost:3000`.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in each value:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication
AUTH_SECRET=your_auth_secret          # generate with: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000    # your deployed URL in production

# Allowed Email Domains (comma-separated if more than one)
ALLOWED_EMAIL_DOMAINS=your_college_domain.ac.in

# AI APIs
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile
GEMINI_API_KEY=your_gemini_api_key

# Email (SMTP) — used for verification emails
EMAIL_USER=your_email@example.com
EMAIL_APP_PASSWORD=your_email_app_password   # Gmail App Password, not your normal password
EMAIL_FROM="AlumniConnect <your_email@example.com>"

# Cloudinary — resume PDF storage
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Admin Account — used by the one-time seed route below
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_admin_password

# Database Seed — protects the /api/seed-admin route
SEED_SECRET=your_seed_secret
```

## Seeding an Admin Account

There's no self-serve admin signup by design. Instead, hit the seed route once after deploying:

```bash
curl -H "Authorization: Bearer YOUR_SEED_SECRET" https://your-deployed-url/api/seed-admin
```

This creates (or resets) an admin account using `ADMIN_EMAIL`/`ADMIN_PASSWORD` from your environment variables. Safe to run more than once — it's idempotent.

## Project Structure

```
src/
├── app/
│   ├── (auth)/login, signup       # Auth pages (split-screen layout)
│   ├── admin/                     # Admin dashboard
│   ├── dashboard/                 # Role-routed dashboard (student/alumni)
│   ├── onboarding/                # Role-specific profile completion
│   ├── api/
│   │   ├── auth/                  # NextAuth handlers
│   │   ├── signup, verify-email   # Registration flow
│   │   ├── alumni/search          # AI-ranked alumni search
│   │   ├── opportunities/         # Posting, browsing, interview prep
│   │   ├── referral-requests/     # Request lifecycle, messages, follow-ups
│   │   ├── resume/                # Upload, build, analyze
│   │   ├── admin/                 # Stats, user management
│   │   └── seed-admin/            # One-time production admin seed
│   └── page.tsx                   # Landing page
├── components/                    # Dashboards, shared UI, layout
├── lib/                           # DB connection, AI calls, email, Cloudinary, roadmap data
├── models/                        # Mongoose schemas (User, Opportunity, ReferralRequest)
├── auth.ts / auth.config.ts       # NextAuth (Node / Edge split)
└── proxy.ts                       # Route protection middleware
```

## Known Limitations

- **Resume Builder** produces plain-text-based resumes (with live preview and PDF export) rather than a fully designed template — intentional scope decision to prioritize the AI analysis pipeline.
- **"Responsiveness" tracking** is based on real accept/decline timestamps but only accumulates after alumni actually respond to requests — a brand-new alumni account will show no responsiveness data until its first response.
- **Email delivery** depends on Gmail SMTP; large-scale sending would need a dedicated transactional email provider.

## Demo Credentials

For judges/reviewers — seeded test accounts (do not rely on these for anything beyond evaluation):

| Role | Email | Password |
|---|---|---|
| Admin | `admin@nitjsr.ac.in` | `AdminPass` |

Student and alumni accounts can be created directly through the signup flow using any `@nitjsr.ac.in` email (or your configured `ALLOWED_EMAIL_DOMAINS`), or via Gmail plus-addressing (`yourname+test@nitjsr.ac.in`) for quick repeat testing against the same inbox.

---

Built solo in 48 hours for HackSphere PS1.