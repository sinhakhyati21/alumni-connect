import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Opportunity from "@/models/Opportunity.model";
import User from "@/models/User.model";
import { generateInterviewQuestions } from "@/lib/ai";

export const maxDuration = 30;

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user || session.user.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  await connectDB();

  const opportunity = await Opportunity.findById(id);
  if (!opportunity) {
    return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
  }

  let resumeText = body.resumeText;
  if (!resumeText) {
    const student = await User.findById(session.user.id).select("+resumeText");
    resumeText = student?.resumeText;
  }

  try {
    const questions = await generateInterviewQuestions({
      resumeText,
      company: opportunity.company,
      role: opportunity.role,
      requiredSkills: opportunity.requiredSkills,
    });

    return NextResponse.json({ questions });
  } catch (err) {
    console.error("Interview prep generation failed:", err);
    return NextResponse.json({ error: "Could not generate interview prep, try again." }, { status: 503 });
  }
}