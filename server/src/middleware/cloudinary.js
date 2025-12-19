import { v2 as cloudinary } from "cloudinary";
import { ENV } from "../configs/env.js";
import multer from "multer";

// Configure Cloudinary
cloudinary.config({
  cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
  api_key: ENV.CLOUDINARY_API_KEY,
  api_secret: ENV.CLOUDINARY_API_SECRET,
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // Increased to 50MB for videos
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype.startsWith("video/")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only image and video files are allowed"), false);
    }
  },
});

// Middleware to upload single image (existing)
export const uploadToCloudinary = async (req, res, next) => {
  try {
    if (!req.file) return next();
    const folder = req.cloudinaryFolder || "ujiyala-foundation/receipts";
    const result = await cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: "image",
          transformation: [{ quality: "auto" }, { fetch_format: "auto" }],
        },
        (error, result) => {
          if (error) return next(error);
          req.file.cloudinaryUrl = result.secure_url;
          req.file.cloudinaryPublicId = result.public_id;
          next();
        }
      )
      .end(req.file.buffer);
  } catch (error) {
    next(error);
  }
};

// NEW: Middleware to upload multiple files (images & videos)
export const uploadFilesToCloudinary = async (req, res, next) => {
  if (!req.files) return next();

  const uploadFile = (file) => {
    return new Promise((resolve, reject) => {
      const resourceType = file.mimetype.startsWith("video")
        ? "video"
        : "image";
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: req.cloudinaryFolder,
          resource_type: resourceType,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result.secure_url);
        }
      );
      stream.end(file.buffer);
    });
  };

  try {
    // Handle 'images' field
    if (req.files["images"]) {
      const imageUploads = req.files["images"].map(uploadFile);
      req.body.uploadedImages = await Promise.all(imageUploads);
    }

    // Handle 'videos' field
    if (req.files["videos"]) {
      const videoUploads = req.files["videos"].map(uploadFile);
      req.body.uploadedVideos = await Promise.all(videoUploads);
    }

    next();
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    next(error);
  }
};

export const uploadImage = upload.single("receipt");
export const uploadProjectImage = upload.single("image");
// NEW: Multer config for project files
export const uploadProjectFiles = upload.fields([
  { name: "images", maxCount: 20 },
  { name: "videos", maxCount: 10 },
]);

export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw error;
  }
};
