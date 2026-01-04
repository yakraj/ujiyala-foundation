import { ENV } from "./env.js";

export const allowedOrigins = [
  "http://localhost:5173", // Main Client
  "http://localhost:5174", // Website (Vite often uses 5174 if 5173 is taken)
  "http://localhost:5175",
  "http://localhost:3000",
  "https://www.ujiyalafoundation.org",
  "https://ujiyalafoundation.org",
  "https://wwl38t1g0ci6tp4hk9jv7by2f5sx8da7zq9b5vn0.ujiyalafoundation.org",
  ENV.ORIGIN,
].filter(Boolean);

export const corsOrigin = (origin, callback) => {
  // Allow requests with no origin (like mobile apps or curl)
  if (!origin) return callback(null, true);
  if (allowedOrigins.indexOf(origin) !== -1 || ENV.ORIGIN === "*") {
    callback(null, true);
  } else {
    callback(new Error("Not allowed by CORS"));
  }
};
