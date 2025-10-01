import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import { ENV } from './configs/env.js';
import { connectDB } from './configs/db.js';
import logger from './configs/logger.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/auth.routes.js';
import membersRoutes from './routes/members.routes.js';
import donationsRoutes from './routes/donations.routes.js';
import expensesRoutes from './routes/expenses.routes.js';
import statsRoutes from './routes/stats.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: ENV.ORIGIN, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use('/api', apiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/donations', donationsRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/stats', statsRoutes);

app.use(notFound);
app.use(errorHandler);

const start = async () => {
  await connectDB();
  app.listen(ENV.PORT, () => {
    logger.info(`Server running on port ${ENV.PORT}`);
  });
};

start();
export default app;
export const handler = serverless(app);
