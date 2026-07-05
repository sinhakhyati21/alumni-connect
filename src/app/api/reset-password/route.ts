import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User.model";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { token, password } = await req.json();

  if (!token || !password || password.length < 8) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  await connectDB();

  const user = await User.findOne({
    resetToken: token,
    resetTokenExpiry: { $gt: new Date() },
  }).select("+resetToken +resetTokenExpiry email");

  if (!user) {
    return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 });
  }

  // Extra safeguard: even if a token somehow existed for the admin account,
  // never allow the seeded demo admin's password to be changed this way.
  if (user.email.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase()) {
    return NextResponse.json({ error: "This account's password cannot be reset." }, { status: 403 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await User.findByIdAndUpdate(
    user._id,
    {
      passwordHash,
      resetToken: undefined,
      resetTokenExpiry: undefined,
    },
    { runValidators: false }
  );

  return NextResponse.json({ message: "Password reset successfully." });
}