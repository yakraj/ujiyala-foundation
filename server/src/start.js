import app from './server.js';
import { connectDB } from './configs/db.js';
import logger from './configs/logger.js';
import { ENV } from './configs/env.js';

const start = async () => {
  await connectDB();
  app.listen(ENV.PORT, () => {
    logger.info(`Server running on port ${ENV.PORT}`);
  });
};

start();
