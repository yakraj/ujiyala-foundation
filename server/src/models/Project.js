import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    // Keeping 'image' for backward compatibility, but new projects will use 'images'
    image: { type: String },
    images: [{ type: String }], // Array of image URLs
    videos: [{ type: String }], // Array of video URLs
    category: { type: String, default: "Rural Development" }, // New category field
    volunteers: [{ type: String }],
    location: { type: String },
    date: { type: Date },
    duration: { type: String },
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed"],
      default: "upcoming",
    },
    tags: [{ type: String }],
    impact: [
      {
        label: String,
        value: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Project", projectSchema);
