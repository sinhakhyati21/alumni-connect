import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import ReferralRequest from "@/models/ReferralRequest.model";
import User from "@/models/User.model";
import { generateFollowUpMessage } from "@/lib/ai";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user || session.user.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  await connectDB();

  const request = await ReferralRequest.findById(id).populate("opportunity", "company role");
  if (!request || request.student.toString() !== session.user.id) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  if (request.status !== "pending") {
    return NextResponse.json({ error: "This request is no longer pending" }, { status: 409 });
  }

  const student = await User.findById(session.user.id);
  const alumni = await User.findById(request.alumni);

  const daysSinceRequest = Math.floor(
    (Date.now() - new Date(request.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  const opportunity = request.opportunity as any;

  try {
    const message = await generateFollowUpMessage({
      studentName: student?.name ?? "Student",
      alumniName: alumni?.name ?? "there",
      company: opportunity?.company ?? "",
      role: opportunity?.role ?? "",
      daysSinceRequest,
    });

    await ReferralRequest.findByIdAndUpdate(
      request._id,
      { followUpMessage: message },
      { runValidators: false }
    );

    return NextResponse.json({ message, daysSinceRequest });
  } catch (err) {
    console.error("Follow-up generation failed:", err);
    return NextResponse.json({ error: "Could not generate follow-up, try again." }, { status: 503 });
  }
}