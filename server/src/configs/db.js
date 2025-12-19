import mongoose from "mongoose";
import logger from "./logger.js";
import { ENV } from "./env.js";

export async function connectDB() {
  try {
    if (!ENV.MONGODB_URI) {
      throw new Error(
        "MONGODB_URI is undefined. Check your .env file and Docker configuration."
      );
    }
    await mongoose.connect(ENV.MONGODB_URI);
    logger.info("MongoDB connected successfully");
  } catch (err) {
    logger.error("MongoDB connection error", {
      error: err.message,
      uri_defined: !!ENV.MONGODB_URI,
    });
    process.exit(1);
  }
}
