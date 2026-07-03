import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Opportunity from "@/models/Opportunity.model";
import User from "@/models/User.model";
import { generateReferralMessage } from "@/lib/ai";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const { opportunityId } = body;
  let resumeText = body.resumeText;

  if (!opportunityId) {
    return NextResponse.json({ error: "Missing opportunityId" }, { status: 400 });
  }

  await connectDB();

  const [opportunity, student] = await Promise.all([
    Opportunity.findById(opportunityId).populate("postedBy", "name company jobRole"),
    User.findById(session.user.id).select("+resumeText"),
  ]);

  if (!opportunity) {
    return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
  }

  // Fall back to stored resume text if the client didn't have it in memory.
  if (!resumeText) {
    resumeText = student?.resumeText;
  }

  const alumni = opportunity.postedBy as any;

  try {
    const message = await generateReferralMessage({
      studentName: student?.name ?? "Student",
      studentDepartment: student?.department,
      studentSkills: student?.skills,
      resumeText,
      alumniName: alumni?.name ?? "there",
      company: opportunity.company,
      role: opportunity.role,
    });

    return NextResponse.json({ message });
  } catch (err) {
    console.error("Message generation failed:", err);
    return NextResponse.json({ error: "Could not generate message, try again." }, { status: 503 });
  }
}