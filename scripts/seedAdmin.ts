import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User.model";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.SEED_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const email = process.env.ADMIN_EMAIL as string;
  const password = process.env.ADMIN_PASSWORD as string;
  const passwordHash = await bcrypt.hash(password, 10);

  await User.findOneAndUpdate(
    { email },
    {
      name: "Admin",
      email,
      passwordHash,
      role: "admin",
      graduationYear: new Date().getFullYear(),
      emailVerified: true,
      profileComplete: true,
    },
    { upsert: true, new: true, runValidators: false }
  );

  return NextResponse.json({ message: `Admin account ready: ${email}` });
}