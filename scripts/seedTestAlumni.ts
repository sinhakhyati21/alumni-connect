// Run with: npm run seed:alumni
// Creates a fully-verified, profile-complete test alumni account directly
// in the database — bypasses signup/domain-check/email-verification for
// local testing purposes only.
import { config } from "dotenv";
config({ path: ".env.local" });
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../src/models/User.model";

async function main() {
  const email = process.env.TEST_ALUMNI_EMAIL ?? "testalumni@example.com";
  const password = process.env.TEST_ALUMNI_PASSWORD ?? "testpass123";

  await mongoose.connect(process.env.MONGODB_URI as string);

  const passwordHash = await bcrypt.hash(password, 10);

  await User.findOneAndUpdate(
    { email },
    {
      name: "Test Alumni",
      email,
      passwordHash,
      role: "alumni",
      graduationYear: 2022, // in the past, so role logic would also classify as alumni
      emailVerified: true,
      profileComplete: true,
      department: "CSE",
      company: "Google",
      jobRole: "Software Engineer",
      industry: "Technology",
      experienceYears: 3,
      skills: ["React", "Node.js", "System Design"],
      contributionPoints: 0,
      referralSuccessRate: 0,
      seniorityScore: 5,
    },
    { upsert: true, new: true }
  );

  console.log(`Test alumni account ready: ${email} / ${password}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});