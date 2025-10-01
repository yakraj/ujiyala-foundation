import mongoose from "mongoose";
import logger from "./logger.js";
import { ENV } from "./env.js";

export async function connectDB() {
  try {
    await mongoose.connect(ENV.MONGODB_URI);
    logger.info("MongoDB connected");
  } catch (err) {
    logger.error("MongoDB connection error", { error: err.message });
    process.exit(1);
  }
}
