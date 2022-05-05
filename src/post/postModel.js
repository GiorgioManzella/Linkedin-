import mongoose from "mongoose";
// =====================================
const { Schema, model } = mongoose;
const postSchema = new Schema(
  {
    text: { type: String },
    username: { type: String },
    image: { type: String },
    profile: { type: Schema.Types.ObjectId, ref: "Profile" },
  },
  { timestamps: true }
);
export default model("post", postSchema);
