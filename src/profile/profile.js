import express from "express";
import profile from "./profileModal.js";
import createError from "http-errors";
import generateUserPdfReadableStream from "../libs/pdfTools.js";
import { pipeline } from "stream";
import experienceSchema from "../experience/experienceModal.js";
import pkg from "cloudinary";
const { v2: cloudinary } = pkg;
import pkg2 from "multer-storage-cloudinary";
const { CloudinaryStorage } = pkg2;
import multer from "multer";
import json2csv from "json2csv";

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

const profileRouter = express.Router();

profileRouter.get("/:userId", async (req, res, next) => {
  try {
    const users = await profile.findById(req.params.userId);
    if (users) {
      res.send(users);
    } else {
      next(createError(400, `profile with id ${req.params.userId}  not found`));
    }
  } catch (error) {
    next(error);
  }
});

profileRouter.get("/", async (req, res, next) => {
  try {
    const users = await profile.find();
    if (users) {
      res.send(users);
    }
  } catch (error) {
    next(createError(400, "profiles not found"));
  }
});

profileRouter.post("/", async (req, res, next) => {
  try {
    let image;
    if (req.body.image) {
      image = req.body.image;
    } else {
      image =
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVKTCvhbnqwyIbeN8eZAzlzb9s9d6LBnNWsw&usqp=CAU"; // template
    }

    let post = { ...req.body, ...{ image } }; //image:image = image
    console.log(post);
    const newUser = new profile(post); // here it happens the validation of req.body, if it is not ok Mongoose will throw an error (if it is ok it is NOT saved in db yet)

    const { _id } = await newUser.save(); // --> {_id: 123io12j3oi21j, firstName: "aoidjoasijdo"}
    res.status(201).send({ _id });
  } catch (error) {
    next(createError(400, "profile must be unique"));
  }
});

profileRouter.put("/:userId", async (req, res, next) => {
  try {
    const updatedUser = await profile.findByIdAndUpdate(
      req.params.userId, // WHO
      req.body, // HOW
      { new: true, runValidators: true } //
    );

    if (updatedUser) {
      res.send(updatedUser);
    } else {
      next(createError(404, `User with id ${req.params.userId} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

profileRouter.delete("/:userId", async (req, res, next) => {
  try {
    const deletedUser = await profile.findByIdAndDelete(req.params.userId);
    if (deletedUser) {
      res.status(204).send();
    } else {
      next(createError(404, `User with id ${req.params.userId} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

/* end pionts for cv download */
profileRouter.get("/:userId/cv", async (req, res, next) => {
  try {
    const user = await profile.findById(req.params.userId);
    res.setHeader("Content-Disposition", "attachment; filename=yourCV.pdf");
    const source = generateUserPdfReadableStream(user);

    console.log(source);
    const destination = res;

    pipeline(source, destination, (err) => {
      if (err) console.log(err);
    });
  } catch (error) {
    console.log(error);
  }
});

//--*--------------------------------EXPERIENCE CRUD --------------------------------

profileRouter.get("/:userName/experiences", async (req, res, next) => {
  try {
    const user = await profile.findOne({ username: req.params.userName });
    const { _id } = user;
    const experience = await experienceSchema
      .find({ profile: _id })
      .populate("profile");

    res.status(200).send(experience);
  } catch (error) {
    next(error);
  }
});

profileRouter.get(
  "/:userName/experiences/:experienceId",
  async (req, res, next) => {
    try {
      const experience = await experienceSchema
        .findById(req.params.experienceId)
        .populate("profile");
      res.status(200).send(experience);
    } catch (error) {
      next(error);
    }
  }
);

profileRouter.post(
  "/:userName/experiences",

  async (req, res, next) => {
    try {
      const user = await profile.findOne({ username: req.params.userName });
      const { _id } = user;
      let experience;
      if (!req.body.image) {
        experience = {
          ...req.body,
          image:
            "https://post.medicalnewstoday.com/wp-content/uploads/sites/3/2020/02/322868_1100-800x825.jpg",
        };
      } else {
        experience = req.body;
      }
      const newExperience = await new experienceSchema({
        ...experience,
        profile: _id,
      });
      console.log(newExperience);
      const createdExp = await newExperience.save();

      res.status(201).send(createdExp);
    } catch (error) {
      next(error);
    }
  }
);
profileRouter.put(
  "/:userName/experiences/:experienceId",
  async (req, res, next) => {
    try {
      const experienceUpdate = await experienceSchema.findByIdAndUpdate(
        req.params.experienceId,
        req.body,
        { new: true }
      );
      res.status(202).send(experienceUpdate);
    } catch (error) {
      next(error);
    }
  }
);

profileRouter.delete(
  "/:userName/experiences/:experienceId",
  async (req, res, next) => {
    try {
      await experienceSchema.findByIdAndDelete(req.params.experienceId);
      res.status(204).send(`product ${req.params.id} deleted`);
    } catch (error) {
      next(error);
    }
  }
);

profileRouter.post(
  "/:userName/experiences/:experienceId/picture",
  cloudinaryUload,

  async (req, res, next) => {
    try {
      const experience = await experienceSchema.findById(
        req.params.experienceId
      );
      experience.image = req.file.path;

      experience.save();

      res.status(201).send(experience);
    } catch (error) {
      next(error);
    }
  }
);

profileRouter.get("/:userName/experiences/csv", async (req, res, next) => {
  try {
    res.setHeader("Content-Disposition", "attachment; filename=books.csv");

    const user = await profile.findOne({ username: req.params.userName });
    const { _id } = user;
    const experience = await experienceSchema.find({ profile: _id });

    const stream = Readable.from(JSON.stringify(experience));
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

//*----------------------------------------------------------------------------

export default profileRouter;
