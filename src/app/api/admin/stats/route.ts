import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User.model";
import Opportunity from "@/models/Opportunity.model";
import ReferralRequest from "@/models/ReferralRequest.model";

export async function GET() {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await connectDB();

  const [totalStudents, totalAlumni, totalOpportunities, totalRequests, acceptedRequests, users] =
    await Promise.all([
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "alumni" }),
      Opportunity.countDocuments({}),
      ReferralRequest.countDocuments({}),
      ReferralRequest.countDocuments({ status: "accepted" }),
      User.find({ role: { $in: ["student", "alumni"] } })
        .select("name email role emailVerified profileComplete active verifiedBadge createdAt")
        .sort({ createdAt: -1 })
        .limit(100)
        .lean(),
    ]);

  return NextResponse.json({
    stats: {
      totalStudents,
      totalAlumni,
      totalOpportunities,
      totalRequests,
      acceptedRequests,
    },
    users,
  });
}