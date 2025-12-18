import { createServer } from "http";
import { Server } from "socket.io";
import app from "./server.js";
import { connectDB } from "./configs/db.js";
import logger from "./configs/logger.js";
import { ENV } from "./configs/env.js";

const start = async () => {
  await connectDB();

  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: ENV.ORIGIN,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Attach io to app so it can be used in routes
  app.set("io", io);

  io.on("connection", (socket) => {
    logger.info(`New client connected: ${socket.id}`);
    socket.on("disconnect", () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });

  httpServer.listen(ENV.PORT, () => {
    logger.info(`Server running on port ${ENV.PORT}`);
  });
};

start();
