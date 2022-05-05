import mongoose from "mongoose";

const { Schema, model } = mongoose;

const experienceSchema = new Schema(
  {
    role: { type: "string" },
    company: { type: "string" },
    startDate: { type: "string" },
    endDate: { type: "string" },
    description: { type: "string" },
    area: { type: "string" },
    image: { type: "string" },
    profile: { type: Schema.Types.ObjectId, ref: "Profile" },
  },
  {
    timestamps: true,
    updatedAt: true,
  }
);

export default model("experience", experienceSchema);
