import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User.model";

const currentYear = new Date().getFullYear();

const signupSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8),
  graduationYear: z.number().int().min(2015).max(currentYear + 6),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { name, email, password, graduationYear } = parsed.data;

  const allowedDomains = (process.env.ALLOWED_EMAIL_DOMAINS ?? "")
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);
  const domain = email.split("@")[1]?.toLowerCase();

  if (allowedDomains.length > 0 && !allowedDomains.includes(domain)) {
    return NextResponse.json(
      { error: "Please register with your official college email address." },
      { status: 400 }
    );
  }

  await connectDB();

  const existing = await User.findOne({ email });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const verificationToken = crypto.randomBytes(32).toString("hex");

  const user = await User.create({
    name,
    email,
    passwordHash,
    graduationYear,
    role: "student",
    verificationToken,
  });

  // TODO: send verificationToken via email:
  // `${process.env.NEXTAUTH_URL}/api/verify-email?token=${verificationToken}`

  return NextResponse.json(
    { message: "Account created. Check your email to verify your account.", role: user.role },
    { status: 201 }
  );
}