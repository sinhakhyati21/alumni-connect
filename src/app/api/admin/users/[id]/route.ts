import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User.model";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  const update: Record<string, boolean> = {};
  if (typeof body.active === "boolean") update.active = body.active;
  if (typeof body.verifiedBadge === "boolean") update.verifiedBadge = body.verifiedBadge;

  await connectDB();
  await User.findByIdAndUpdate(id, update, { runValidators: false });

  return NextResponse.json({ success: true });
}