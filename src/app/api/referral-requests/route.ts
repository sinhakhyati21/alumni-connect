import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import ReferralRequest from "@/models/ReferralRequest.model";
import Opportunity from "@/models/Opportunity.model";

const createSchema = z.object({
  opportunityId: z.string().min(1),
  message: z.string().max(500).optional(),
});

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== "student") {
    return NextResponse.json({ error: "Only students can request referrals" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await connectDB();

  const opportunity = await Opportunity.findById(parsed.data.opportunityId);
  if (!opportunity) {
    return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
  }

  try {
    const request = await ReferralRequest.create({
      student: session.user.id,
      opportunity: opportunity._id,
      alumni: opportunity.postedBy,
      message: parsed.data.message,
    });
    return NextResponse.json({ request }, { status: 201 });
  } catch (err: any) {
    if (err.code === 11000) {
      return NextResponse.json({ error: "You already requested this opportunity." }, { status: 409 });
    }
    throw err;
  }
}

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const filter =
    session.user.role === "student"
      ? { student: session.user.id }
      : { alumni: session.user.id };

  const requests = await ReferralRequest.find(filter)
    .populate("opportunity", "company role deadline")
    .populate("student", "name email department skills resumeUrl")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ requests });
}