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

  const topAlumni = await User.find({ role: "alumni" })
    .select("name company jobRole contributionPoints referralSuccessRate")
    .sort({ contributionPoints: -1 })
    .limit(10)
    .lean();

  return NextResponse.json({ leaderboard: topAlumni });
}