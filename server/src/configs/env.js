import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the server root directory
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const ENV = {
  PORT: process.env.PORT || 4000,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  ORIGIN: process.env.ORIGIN || "*",
  NGO_NAME: process.env.NGO_NAME || "Ujiyala Foundation",
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
};

if (!ENV.MONGODB_URI) console.error("MISSING ENV: MONGODB_URI");
if (!ENV.JWT_SECRET) console.error("MISSING ENV: JWT_SECRET");
if (!ENV.CLOUDINARY_CLOUD_NAME)
  console.error("MISSING ENV: CLOUDINARY_CLOUD_NAME");

export default ENV;
