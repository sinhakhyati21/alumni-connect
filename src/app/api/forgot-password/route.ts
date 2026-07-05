import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import User from "@/models/User.model";
import { sendPasswordResetEmail } from "@/lib/email";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  // Protect the seeded demo admin account — judges need a stable, known password.
  if (email.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase()) {
    // Return the same generic response as a real request, so this endpoint
    // can't be used to probe whether an email exists on the platform.
    return NextResponse.json({
      message: "If an account with that email exists, a reset link has been sent.",
    });
  }

  await connectDB();
  const user = await User.findOne({ email });

  // Always return the same message whether or not the user exists,
  // to avoid leaking which emails are registered.
  if (!user) {
    return NextResponse.json({
      message: "If an account with that email exists, a reset link has been sent.",
    });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await User.findByIdAndUpdate(
    user._id,
    { resetToken, resetTokenExpiry },
    { runValidators: false }
  );

  try {
    await sendPasswordResetEmail(user.email, resetToken);
  } catch (err) {
    console.error("Failed to send reset email:", err);
  }

  return NextResponse.json({
    message: "If an account with that email exists, a reset link has been sent.",
  });
}