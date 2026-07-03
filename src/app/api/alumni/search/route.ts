import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User.model";

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

  const alumni = await User.find(query).limit(50).lean();

  // Pull the searching student's skills for the similarity component.
  const student = await User.findById(session.user.id).lean();
  const studentSkills = new Set((student?.skills ?? []).map((s) => s.toLowerCase()));

  const scored = alumni.map((a) => {
    const alumniSkills = new Set((a.skills ?? []).map((s) => s.toLowerCase()));
    const overlap = [...studentSkills].filter((s) => alumniSkills.has(s)).length;
    const union = new Set([...studentSkills, ...alumniSkills]).size || 1;
    const skillSimilarity = overlap / union; // Jaccard similarity, 0-1

    const companyMatch = company && a.company?.toLowerCase().includes(company.toLowerCase()) ? 1 : 0;

    const score =
      companyMatch * 2 +
      skillSimilarity * 3 +
      (a.referralSuccessRate ?? 0) * 2 +
      Math.min((a.contributionPoints ?? 0) / 10, 3);

    return {
      _id: a._id,
      name: a.name,
      company: a.company,
      jobRole: a.jobRole,
      industry: a.industry,
      skills: a.skills,
      contributionPoints: a.contributionPoints,
      score,
    };
  });

  scored.sort((a, b) => b.score - a.score);

  return NextResponse.json({ results: scored });
}