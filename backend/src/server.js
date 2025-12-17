import express from "express";
import cors from "cors";
import { serve } from "inngest/express";
import { clerkMiddleware } from "@clerk/express";
import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";
import { inngest, functions } from "./lib/inngest.js";
import chatRoutes from "./routes/chatRoutes.js";
import sessionRoutes from "./routes/sessionRoute.js";
import './jobs/reminderJobs.js';
import schedulingRoutes from './routes/scheduling.js';
import interviewersRoutes from './routes/interviewers.js';
import interviewScheduleRoutes from './routes/interviewSchedule.routes.js';

const app = express();

app.use(express.json());
app.set('trust proxy', 1);

const allowedOrigins = [
  'http://localhost:5173',
  'https://talk2hire-f1kx.onrender.com'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors());

// ⚠️ CRITICAL: Apply Clerk ONLY to routes that need it
// For API routes, authentication is handled by protectRoute middleware
app.use((req, res, next) => {
  if (req.path === '/health' || req.path === '/' || req.path.startsWith('/api/')) {
    // Skip Clerk middleware for these routes
    return next();
  }
  return clerkMiddleware()(req, res, next);
});

app.get("/", (req, res) => {
  res.json({ message: 'Talk2Hire API', status: 'running' });
});

app.get("/health", (req, res) => {
  res.status(200).json({ msg: "api is up and running" });
});

app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/chat", chatRoutes);
app.use("/api/sessions", sessionRoutes);
app.use('/api/scheduling', schedulingRoutes);
app.use('/api', interviewersRoutes);
app.use("/api/interview-schedule", interviewScheduleRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: err.message });
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(ENV.PORT, () => console.log("Server running on port:", ENV.PORT));
  } catch (error) {
    console.error("Error starting server:", error);
  }
};

startServer();
