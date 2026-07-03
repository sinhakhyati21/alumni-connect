import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User.model";
import { uploadResume } from "@/lib/cloudinary";
import { PDFParse } from "pdf-parse";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== "student") {
    return NextResponse.json({ error: "Only students can upload a resume" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("resume") as File | null;

  if (!file || file.type !== "application/pdf") {
    return NextResponse.json({ error: "Please upload a PDF file" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  let extractedText = "";
  try {
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    extractedText = result.text;
    await parser.destroy();
  } catch (err) {
    console.error("PDF parse error:", err);
    return NextResponse.json({ error: "Could not read text from this PDF" }, { status: 400 });
  }

  if (extractedText.trim().length < 50) {
    return NextResponse.json(
      { error: "Resume text is too short or unreadable — is this a scanned image PDF?" },
      { status: 400 }
    );
  }

  const resumeUrl = await uploadResume(buffer, `${session.user.id}-resume.pdf`);

  await connectDB();
  await User.findByIdAndUpdate(session.user.id, { resumeUrl }, { runValidators: false });

  return NextResponse.json({ resumeUrl, extractedText });
}