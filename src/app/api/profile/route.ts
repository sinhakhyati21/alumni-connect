import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User.model";

const studentSchema = z.object({
  department: z.string().min(2).max(100),
  skills: z.array(z.string().min(1)).min(1),
  projects: z.array(z.string()).optional().default([]),
});

const alumniSchema = z.object({
  company: z.string().min(2).max(100),
  jobRole: z.string().min(2).max(100),
  industry: z.string().min(2).max(100),
  experienceYears: z.number().min(0).max(60),
  skills: z.array(z.string().min(1)).min(1),
});

export async function PATCH(req: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (session.user.role === "admin") {
    return NextResponse.json({ error: "Admin accounts don't have profiles" }, { status: 400 });
  }

  const body = await req.json();
  const schema = session.user.role === "student" ? studentSchema : alumniSchema;
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await connectDB();

  const user = await User.findByIdAndUpdate(
    session.user.id,
    { ...parsed.data, profileComplete: true },
    { new: true }
  );

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ profileComplete: true, role: user.role });
}