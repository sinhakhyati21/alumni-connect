import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User.model";

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/login?error=invalid_token", req.url));
  }

  await connectDB();
  const user = await User.findOne({ verificationToken: token }).select("+verificationToken");

  if (!user) {
    return NextResponse.redirect(new URL("/login?error=invalid_token", req.url));
  }

  user.emailVerified = true;
  user.verificationToken = undefined;
  await user.save();

  return NextResponse.redirect(new URL("/login?verified=1", req.url));
}