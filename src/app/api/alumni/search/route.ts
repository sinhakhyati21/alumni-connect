import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User.model";
import { rankAlumniWithAI } from "@/lib/ai";

export async function GET(req: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const company = searchParams.get("company")?.trim();
  const jobRole = searchParams.get("jobRole")?.trim();
  const industry = searchParams.get("industry")?.trim();

  await connectDB();

  const query: Record<string, unknown> = { role: "alumni" };
  if (company) query.company = { $regex: company, $options: "i" };
  if (jobRole) query.jobRole = { $regex: jobRole, $options: "i" };
  if (industry) query.industry = { $regex: industry, $options: "i" };

  const alumni = await User.find(query).limit(30).lean();
  const student = await User.findById(session.user.id).lean();

  if (alumni.length === 0) {
    return NextResponse.json({ results: [] });
  }

  let ranked;
  try {
    ranked = await rankAlumniWithAI(
      { department: student?.department, skills: student?.skills },
      alumni.map((a) => ({
        _id: a._id.toString(),
        name: a.name,
        company: a.company,
        jobRole: a.jobRole,
        industry: a.industry,
        skills: a.skills,
        contributionPoints: a.contributionPoints,
        referralSuccessRate: a.referralSuccessRate,
      }))
    );
  } catch (err) {
    console.error("AI ranking failed:", err);
    return NextResponse.json({ error: "Ranking service unavailable, try again." }, { status: 503 });
  }

  const alumniMap = new Map(alumni.map((a) => [a._id.toString(), a]));

  const results = ranked
    .map((r) => {
      const a = alumniMap.get(r.id);
      if (!a) return null;
      return {
        _id: a._id,
        name: a.name,
        company: a.company,
        jobRole: a.jobRole,
        industry: a.industry,
        skills: a.skills,
        contributionPoints: a.contributionPoints,
        score: r.score,
        reason: r.reason,
      };
    })
    .filter(Boolean);

  return NextResponse.json({ results });
}