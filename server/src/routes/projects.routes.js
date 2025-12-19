import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  uploadProjectFiles, // Changed from uploadProjectImage
  uploadFilesToCloudinary, // Changed from uploadToCloudinary
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
  (req, res, next) => {
    uploadProjectFiles(req, res, (err) => {
      if (err) {
        console.error("Multer Upload Error:", err);
        // Multer throws "Unexpected field" if a field name doesn't match or maxCount is exceeded
        return res.status(400).json({
          ok: false,
          message: err.message,
          field: err.field || "unknown",
        });
      }
      next();
    });
  },
  setProjectFolder,
  uploadFilesToCloudinary, // Use the new upload logic
  async (req, res, next) => {
    try {
      console.log("Incoming project creation request body:", req.body);
      console.log("Incoming project creation files:", req.files);
      const body = { ...req.body };

      // Assign uploaded URLs to body
      if (body.uploadedImages) {
        body.images = body.uploadedImages;
        // Set the first image as the main image for backward compatibility
        if (body.images.length > 0) body.image = body.images[0];
      }
      if (body.uploadedVideos) {
        body.videos = body.uploadedVideos;
      }

      // Parse JSON fields
      ["volunteers", "tags", "impact"].forEach((field) => {
        if (body[field] && typeof body[field] === "string") {
          try {
            body[field] = JSON.parse(body[field]);
          } catch (e) {
            console.warn(`Failed to parse JSON for field ${field}:`, e.message);
            if (field !== "impact") {
              body[field] = body[field].split(",").map((v) => v.trim());
            }
          }
        }
      });

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

router.get("/:id", async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project)
      return res.status(404).json({ ok: false, message: "Project not found" });
    res.json({ ok: true, project });
  } catch (e) {
    next(e);
  }
});

export default router;
