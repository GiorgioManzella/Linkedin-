import express from "express";
import createError from "http-errors";
import postModel from "./postModel.js";
/* import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary"; */
import pkg from "cloudinary";
const { v2:cloudinary} = pkg
import pkg2 from "multer-storage-cloudinary";
const { CloudinaryStorage } = pkg2
import multer from "multer";
// =============================
const postRouter = express.Router();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const cloudinaryUpload = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: { folder: "Linkedin-Profiles_images" },
  }),
}).single("image");

// ==============================
postRouter.post("/", cloudinaryUpload, async (req, res, next) => {
  try {
    const post = await postModel(req.body);
    const { _id } = await post.save();
    res.send({ _id });
  } catch (error) {
    console.log(error);
    next(createError(404, `post Not found!`));
  }
});
// =======================================
postRouter.get("/", async (req, res, next) => {
  try {
    const getPost = await postModel.find().populate("profile")
    res.send(getPost);
  } catch (error) {
    console.log(error);
    next(createError(404, `post Not found`));
  }
});
// =======================================
postRouter.get("/:postId", async (req, res, next) => {
  try {
    const getPost = await postModel.findById(req.params.postId).populate(
      "profile"
    );
    res.send(getPost);
  } catch (error) {
    console.log(error);
    next(createError(404, `post with ${req.params.postId}not found`));
  }
});
// =======================================
postRouter.put("/:postId", async (req, res, next) => {
  try {
    const updatePost = await postModel.findByIdAndUpdate(
      req.params.postId,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    res.send(updatePost);
  } catch (error) {
    console.log(error);
    next(createError(404, `post with ${req.params.postId}not found`));
  }
});
// =======================================
postRouter.delete("/:postId", async (req, res, next) => {
  try {
    const deletePost = await postModel.findByIdAndDelete(req.params.postId);
    res.send(deletePost);
  } catch (error) {
    console.log(error);
    next(createError(404, `post with ${req.params.postId}not found`));
  }
});
// =======================================
postRouter.post("/:postId", async (req, res, next) => {
  try {
    res.send();
  } catch (error) {
    console.log(error);
    next(createError(404));
  }
});
// =======================================

// =====================================
export default postRouter;
