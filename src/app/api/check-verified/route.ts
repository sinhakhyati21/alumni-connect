import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User.model";

export async function GET(req: Request) {
  const email = new URL(req.url).searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  await connectDB();
  const user = await User.findOne({ email }).select("emailVerified");

  return NextResponse.json({ verified: user?.emailVerified ?? false });
}