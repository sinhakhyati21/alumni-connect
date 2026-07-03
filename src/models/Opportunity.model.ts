import mongoose, { Schema, models, model, type Document, type Types } from "mongoose";

export interface IOpportunity extends Document {
  company: string;
  role: string;
  eligibility: string;
  requiredSkills: string[];
  deadline: Date;
  referralLink: string;
  postedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const OpportunitySchema = new Schema<IOpportunity>(
  {
    company: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    eligibility: { type: String, required: true, trim: true },
    requiredSkills: { type: [String], default: [] },
    deadline: { type: Date, required: true },
    referralLink: { type: String, required: true, trim: true },
    postedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

OpportunitySchema.index({ company: 1, role: 1 });
OpportunitySchema.index({ requiredSkills: 1 });
OpportunitySchema.index({ deadline: 1 });

export default (models.Opportunity as mongoose.Model<IOpportunity>) ??
  model<IOpportunity>("Opportunity", OpportunitySchema);