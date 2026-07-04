import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User.model";

export const maxDuration = 30;

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== "student") {
    return NextResponse.json({ error: "Only students can build a resume" }, { status: 403 });
  }

  const body = await req.json();
  const { summary, education, skills, experience, projects } = body;

  const sections = [
    summary ? `SUMMARY\n${summary}` : "",
    education ? `EDUCATION\n${education}` : "",
    skills ? `SKILLS\n${skills}` : "",
    experience ? `EXPERIENCE\n${experience}` : "",
    projects ? `PROJECTS\n${projects}` : "",
  ].filter(Boolean);

  const resumeText = sections.join("\n\n");

  if (resumeText.trim().length < 50) {
    return NextResponse.json({ error: "Please fill in more detail before saving." }, { status: 400 });
  }

  await connectDB();
  await User.findByIdAndUpdate(
    session.user.id,
    { resumeText, resumeUrl: "built-on-platform" },
    { runValidators: false }
  );

  return NextResponse.json({ resumeText });
}