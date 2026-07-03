import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Opportunity from "@/models/Opportunity.model";

const opportunitySchema = z.object({
  company: z.string().min(2).max(100),
  role: z.string().min(2).max(100),
  eligibility: z.string().min(2).max(300),
  requiredSkills: z.array(z.string().min(1)).min(1),
  deadline: z.string(),
  referralLink: z.string().url(),
});

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== "alumni") {
    return NextResponse.json({ error: "Only alumni can post opportunities" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = opportunitySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await connectDB();

  const opportunity = await Opportunity.create({
    ...parsed.data,
    deadline: new Date(parsed.data.deadline),
    postedBy: session.user.id,
  });

  return NextResponse.json({ opportunity }, { status: 201 });
}

export async function GET(req: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const skillFilter = searchParams.get("skill")?.trim();

  await connectDB();

  const query: Record<string, unknown> = { deadline: { $gte: new Date() } };
  if (skillFilter) query.requiredSkills = { $regex: skillFilter, $options: "i" };

  const opportunities = await Opportunity.find(query)
    .populate("postedBy", "name company seniorityScore contributionPoints referralSuccessRate")
    .lean();

  opportunities.sort((a, b) => {
    if (a.company === b.company && a.role === b.role) {
      const posterA = a.postedBy as any;
      const posterB = b.postedBy as any;
      const scoreA =
        (posterA?.seniorityScore ?? 0) +
        (posterA?.contributionPoints ?? 0) / 10 +
        (posterA?.referralSuccessRate ?? 0) * 5;
      const scoreB =
        (posterB?.seniorityScore ?? 0) +
        (posterB?.contributionPoints ?? 0) / 10 +
        (posterB?.referralSuccessRate ?? 0) * 5;
      return scoreB - scoreA;
    }
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });

  return NextResponse.json({ opportunities });
}