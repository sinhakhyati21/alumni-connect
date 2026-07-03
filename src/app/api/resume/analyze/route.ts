import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User.model";
import { analyzeResumeWithAI } from "@/lib/ai";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  let resumeText = body.resumeText;

  // Fall back to the stored resume text if the client didn't send one
  // (e.g. student refreshed the page after uploading earlier).
  if (!resumeText) {
    await connectDB();
    const user = await User.findById(session.user.id).select("+resumeText");
    resumeText = user?.resumeText;
  }

  if (!resumeText || resumeText.trim().length < 50) {
    return NextResponse.json({ error: "No resume text to analyze. Upload a resume first." }, { status: 400 });
  }

  try {
    const analysis = await analyzeResumeWithAI(resumeText);
    return NextResponse.json(analysis);
  } catch (err) {
    console.error("Resume analysis failed:", err);
    return NextResponse.json({ error: "Analysis service unavailable, try again." }, { status: 503 });
  }
}