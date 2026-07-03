// Run with: npm run seed:admin
// Creates (or updates) a single admin account directly in the database.
// There is no self-serve admin signup route by design.
import { config } from "dotenv";
config({ path: ".env.local" });
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../src/models/User.model";

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const password = process.env.ADMIN_PASSWORD ?? "changeme123";

  await mongoose.connect(process.env.MONGODB_URI as string);

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
    { upsert: true, new: true }
  );

  console.log(`Admin account ready: ${email}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});