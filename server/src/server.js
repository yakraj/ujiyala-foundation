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
import healthRoutes from './routes/health.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('trust proxy', 1);
app.use(helmet());
//app.use(cors({ origin: ENV.ORIGIN, credentials: true }));
// made some changes on corse
//const allowedOrigins = Array.isArray(ENV.ORIGIN) ? ENV.ORIGIN : [ENV.ORIGIN];
app.use(cors())
// app.use(cors({
//   origin: (origin, callback) => {
//     // allow non-browser tools (no origin) and exact origin matches
//     if (!origin) return callback(null, true);
//     if (allowedOrigins.includes(origin)) return callback(null, true);
//     return callback(new Error('CORS: origin not allowed'));
//   },
//   credentials: false, // you said you don't use cookies; keep false
//   methods: ['GET','HEAD','PUT','PATCH','POST','DELETE','OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
//   exposedHeaders: [], // add header names here only if the browser must read custom response headers
//   preflightContinue: false,
//   optionsSuccessStatus: 204
// }));

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
app.use('/api/_health', healthRoutes);

app.use(notFound);
app.use(errorHandler);

// Do NOT start the server here. Export the app so serverless platforms (like
// Vercel) can import it. For local development, use src/start.js which will
// connect to DB and start listening.
export default app;
//export const handler = serverless(app);
//this is for vercel
// module.exports = app;
