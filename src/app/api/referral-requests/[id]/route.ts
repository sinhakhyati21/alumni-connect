import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import ReferralRequest from "@/models/ReferralRequest.model";
import User from "@/models/User.model";

const patchSchema = z.object({
  status: z.enum(["accepted", "declined"]),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user || session.user.role !== "alumni") {
    return NextResponse.json({ error: "Only alumni can respond to requests" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = patchSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await connectDB();

  const request = await ReferralRequest.findById(id);
  if (!request) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  if (request.alumni.toString() !== session.user.id) {
    return NextResponse.json({ error: "Not your request to manage" }, { status: 403 });
  }

  if (request.status !== "pending") {
    return NextResponse.json({ error: "This request has already been resolved" }, { status: 409 });
  }

  const responseHours = (Date.now() - new Date(request.createdAt).getTime()) / (1000 * 60 * 60);

  request.status = parsed.data.status;
  await request.save();

  // Responsiveness is tracked on every response (accept or decline).
  const alumniDoc = await User.findById(request.alumni).select("avgResponseHours respondedRequestsCount");
  const prevAvg = alumniDoc?.avgResponseHours ?? 0;
  const prevCount = alumniDoc?.respondedRequestsCount ?? 0;
  const newAvg = (prevAvg * prevCount + responseHours) / (prevCount + 1);

  await User.findByIdAndUpdate(
    request.alumni,
    {
      $set: { avgResponseHours: newAvg },
      $inc: { respondedRequestsCount: 1 },
    },
    { runValidators: false }
  );

  // Update alumni contribution stats when a referral is accepted.
  if (parsed.data.status === "accepted") {
    const [totalResolved, totalAccepted] = await Promise.all([
      ReferralRequest.countDocuments({ alumni: request.alumni, status: { $in: ["accepted", "declined"] } }),
      ReferralRequest.countDocuments({ alumni: request.alumni, status: "accepted" }),
    ]);
    const referralSuccessRate = totalResolved > 0 ? totalAccepted / totalResolved : 0;

    await User.findByIdAndUpdate(
      request.alumni,
      {
        $inc: { contributionPoints: 10 },
        $set: { referralSuccessRate },
      },
      { runValidators: false }
    );
  }

  return NextResponse.json({ request });
}