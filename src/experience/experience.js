import express from "express";
import multer from "multer";
import experienceSchema from "./experienceModal.js";
import pkg from "cloudinary";
const { v2: cloudinary } = pkg;
import pkg2 from "multer-storage-cloudinary";
const { CloudinaryStorage } = pkg2;
import { Readable, pipeline } from "stream";
import json2csv from "json2csv";
import profile from "../profile/profileModal.js";

const experienceRouter = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const cloudinaryUload = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: { folder: "Linkedin-Profiles_images" },
  }),
}).single("image");

//----------------------------------------------------------------CRUD

experienceRouter.get("/", async (req, res, next) => {
  try {
    const experience = await experienceSchema.find();
    res.status(200).send(experience);
  } catch (error) {
    next(error);
  }
});
experienceRouter.get("/:userId/:id", async (req, res, next) => {
  try {
    const experience = await experienceSchema
      .findById(req.params.id)
      .populate("profile");
    res.status(200).send(experience);
  } catch (error) {
    next(error);
  }
});
experienceRouter.post("/:userId", cloudinaryUload, async (req, res, next) => {
  try {
    const newExperience = await new experienceSchema(req.body);
    const { _id } = await newExperience.save();

    res.status(201).send(newExperience);
  } catch (error) {
    next(error);
  }
});
experienceRouter.put("/:id", async (req, res, next) => {
  try {
    const experienceUpdate = await experienceSchema.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.send(202).send(experienceUpdate);
  } catch (error) {
    next(error);
  }
});
experienceRouter.delete("/:id", async (req, res, next) => {
  try {
    await experienceSchema.findByIdAndDelete(req.params.id);
    res.status(204).send(`product ${req.params.id} deleted`);
  } catch (error) {
    next(error);
  }
});

experienceRouter.get("/:id/download", async (req, res, next) => {
  try {
    res.setHeader("Content-Disposition", "attachment; filename=books.csv");
    let experiences = await experienceSchema.findById(req.params.id);
    console.log(experiences);
    const stream = Readable.from(JSON.stringify(experiences));
    const transform = new json2csv.Transform({
      fields: ["role", "company"],
    });
    const destination = res;

    pipeline(stream, transform, destination, (err) => {
      if (err) console.log(err);
    });
  } catch (error) {
    next(error);
  }
});
export default experienceRouter;

// ------------------------------------------ test
/* experienceRouter.get("id/download", function (req, res, next) {
  json2csv({ data: myCars, fields: fields }, function (err, csv) {
    res.setHeader("Content-disposition", "attachment; filename=data.csv");
    res.set("Content-Type", "text/csv");
    res.status(200).send(csv);
  });
});
 */
