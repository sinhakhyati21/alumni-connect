import mongoose, { Schema, models, model, type Document, type Types } from "mongoose";

export type ReferralStatus = "pending" | "accepted" | "declined";

export interface IReferralRequest extends Document {
  student: Types.ObjectId;
  opportunity: Types.ObjectId;
  alumni: Types.ObjectId; // denormalized from opportunity.postedBy for faster queries
  status: ReferralStatus;
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReferralRequestSchema = new Schema<IReferralRequest>(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    opportunity: { type: Schema.Types.ObjectId, ref: "Opportunity", required: true },
    alumni: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
    message: { type: String, trim: true },
  },
  { timestamps: true }
);

// A student can only request a given opportunity once.
ReferralRequestSchema.index({ student: 1, opportunity: 1 }, { unique: true });
ReferralRequestSchema.index({ alumni: 1, status: 1 });

export default (models.ReferralRequest as mongoose.Model<IReferralRequest>) ??
  model<IReferralRequest>("ReferralRequest", ReferralRequestSchema);