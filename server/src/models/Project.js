import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String }, // URL from Cloudinary
    volunteers: [{ type: String }], // List of names or IDs
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
