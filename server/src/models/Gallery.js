import mongoose from "mongoose";

const gallerySchema = new mongoose.Schema(
  {
    title: { type: String },
    imageUrl: { type: String, required: true }, // URL from Cloudinary
    category: { type: String }, // e.g., 'Event', 'Distribution'
    description: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Gallery", gallerySchema);
