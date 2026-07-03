import mongoose, { Schema, models, model, type Document } from "mongoose";

export type UserRole = "student" | "alumni" | "admin";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  graduationYear: number;
  role: UserRole;
  emailVerified: boolean;
  verificationToken?: string;
  profileComplete: boolean;

  department?: string;
  skills?: string[];
  projects?: string[];
  resumeUrl?: string;
  resumeText?: string;
  company?: string;
  jobRole?: string;
  industry?: string;
  experienceYears?: number;
  contributionPoints: number;
  referralSuccessRate: number;
  seniorityScore: number;
  verifiedBadge: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (value: string) {
          const allowed = (process.env.ALLOWED_EMAIL_DOMAINS ?? "")
            .split(",")
            .map((d) => d.trim().toLowerCase())
            .filter(Boolean);
          if (allowed.length === 0) return true;
          const domain = value.split("@")[1]?.toLowerCase();
          return allowed.includes(domain);
        },
        message: "Please register with your official college email address.",
      },
    },
    passwordHash: { type: String, select: false },
    graduationYear: {
      type: Number,
      required: true,
      min: 2015,
      max: new Date().getFullYear() + 6,
    },
    role: {
      type: String,
      enum: ["student", "alumni", "admin"],
      required: true,
    },
    emailVerified: { type: Boolean, default: false },
    verificationToken: { type: String, select: false },
    profileComplete: { type: Boolean, default: false },

    department: { type: String, trim: true },
    skills: { type: [String], default: [] },
    projects: { type: [String], default: [] },
    resumeUrl: { type: String },
    resumeText: { type: String, select: false },

    company: { type: String, trim: true },
    jobRole: { type: String, trim: true },
    industry: { type: String, trim: true },
    experienceYears: { type: Number, min: 0 },
    contributionPoints: { type: Number, default: 0 },
    referralSuccessRate: { type: Number, default: 0 },
    seniorityScore: { type: Number, default: 0 },
    verifiedBadge: { type: Boolean, default: false },
  },
  { timestamps: true }
);

UserSchema.pre("validate", function (this: IUser) {
  if (this.role !== "admin") {
    const currentYear = new Date().getFullYear();
    this.role = this.graduationYear > currentYear ? "student" : "alumni";
  }
});

UserSchema.index({ role: 1 });
UserSchema.index({ company: 1, jobRole: 1 });
UserSchema.index({ skills: 1 });

export default (models.User as mongoose.Model<IUser>) ?? model<IUser>("User", UserSchema);