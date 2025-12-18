import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { uploadProjectImage, uploadToCloudinary } from "../middleware/cloudinary.js";
import Gallery from "../models/Gallery.js";

const router = express.Router();

const setGalleryFolder = (req, res, next) => {
  req.cloudinaryFolder = "ujiyala-foundation/gallery";
  next();
};

router.post(
  "/",
  requireAuth,
  uploadProjectImage, // Reusing the 'image' field name
  setGalleryFolder,
  uploadToCloudinary,
  async (req, res, next) => {
    try {
      const body = { ...req.body };
      if (req.file && req.file.cloudinaryUrl) {
        body.imageUrl = req.file.cloudinaryUrl;
      } else {
        return res.status(400).json({ ok: false, message: "Image is required" });
      }

      const item = await Gallery.create(body);
      res.json({ ok: true, item });
    } catch (e) {
      next(e);
    }
  }
);

router.get("/", async (req, res, next) => {
  try {
    const items = await Gallery.find().sort({ createdAt: -1 });
    res.json({ ok: true, items });
  } catch (e) {
    next(e);
  }
});

export default router;
