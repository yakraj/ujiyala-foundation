import { v2 as cloudinary } from "cloudinary";
import { ENV } from "../configs/env.js";
import multer from "multer";

// Configure Cloudinary
cloudinary.config({
  cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
  api_key: ENV.CLOUDINARY_API_KEY,
  api_secret: ENV.CLOUDINARY_API_SECRET,
});

// Configure multer for memory storage (required for Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

// Middleware to upload image to Cloudinary
export const uploadToCloudinary = async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }

    const folder = req.cloudinaryFolder || "ujiyala-foundation/receipts";

    // Upload to Cloudinary
    const result = await cloudinary.uploader
      .upload_stream(
        {
          folder: folder,
          resource_type: "image",
          transformation: [{ quality: "auto" }, { fetch_format: "auto" }],
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            return next(error);
          }

          // Store the Cloudinary URL in req.file.cloudinaryUrl
          req.file.cloudinaryUrl = result.secure_url;
          req.file.cloudinaryPublicId = result.public_id;
          next();
        }
      )
      .end(req.file.buffer);
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    next(error);
  }
};

// Export multer middleware for single file upload
export const uploadImage = upload.single("receipt");
export const uploadProjectImage = upload.single("image");

// Helper function to delete image from Cloudinary
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw error;
  }
};
