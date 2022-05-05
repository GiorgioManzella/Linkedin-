import mongoose from "mongoose";
import pkg from "mongoose";
const {Schema, model} = pkg

const profileSchema = new Schema(
  {
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: { type: String, required: true },
    bio: { type: String, required: true },
    title: { type: String, required: true },
    area: { type: String, required: true },
    image: { type: String },
    username: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

const profile = model("Profile", profileSchema)

export default profile