import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User.model";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const user = await User.findById(session.user.id).select("resumeUrl skills department");

  return NextResponse.json({
    resumeUrl: user?.resumeUrl ?? null,
    skills: user?.skills ?? [],
    department: user?.department ?? null,
  });
}