import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  uploadProjectImage,
  uploadToCloudinary,
} from "../middleware/cloudinary.js";
import Project from "../models/Project.js";

const router = express.Router();

// Middleware to set folder for projects
const setProjectFolder = (req, res, next) => {
  req.cloudinaryFolder = "ujiyala-foundation/projects";
  next();
};

router.post(
  "/",
  requireAuth,
  uploadProjectImage,
  setProjectFolder,
  uploadToCloudinary,
  async (req, res, next) => {
    try {
      const body = { ...req.body };
      if (req.file && req.file.cloudinaryUrl) {
        body.image = req.file.cloudinaryUrl;
      }

      // Parse JSON fields if they are strings (multipart/form-data)
      if (typeof body.volunteers === "string") {
        try {
          body.volunteers = JSON.parse(body.volunteers);
        } catch (e) {
          // If it's a comma separated string
          body.volunteers = body.volunteers.split(",").map((v) => v.trim());
        }
      }
      if (typeof body.tags === "string") {
        try {
          body.tags = JSON.parse(body.tags);
        } catch (e) {
          body.tags = body.tags.split(",").map((t) => t.trim());
        }
      }
      if (typeof body.impact === "string") {
        try {
          body.impact = JSON.parse(body.impact);
        } catch (e) {}
      }

      const project = await Project.create(body);
      res.json({ ok: true, project });
    } catch (e) {
      next(e);
    }
  }
);

router.get("/", async (req, res, next) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json({ ok: true, projects });
  } catch (e) {
    next(e);
  }
});

export default router;
