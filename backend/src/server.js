import express from "express";
import path from "path";
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

const __dirname = path.resolve();

// middleware
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
  credentials: true
}));

app.use(clerkMiddleware());

// ✅ HEALTH CHECK ROUTE (BEFORE EVERYTHING)
app.get("/health", (req, res) => {
  res.status(200).json({ msg: "api is up and running" });
});

// ✅ API ROUTES (MUST COME BEFORE STATIC FILES!)
app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/chat", chatRoutes);
app.use("/api/sessions", sessionRoutes);
app.use('/api/scheduling', schedulingRoutes);
app.use('/api', interviewersRoutes);
app.use("/api/interview-schedule", interviewScheduleRoutes);

// ✅ SERVE FRONTEND STATIC FILES (AFTER API ROUTES)
// if (ENV.NODE_ENV === "production") {
//   const frontendPath = path.join(__dirname, "../frontend/dist");
  
//   app.use(express.static(frontendPath));
  
//   // ✅ CATCH-ALL ROUTE (MUST BE LAST!)
//   // This only catches routes that don't match /api/* or /health
//   app.get("*", (req, res) => {
//     res.sendFile(path.join(frontendPath, "index.html"));
//   });
// }

const startServer = async () => {
  try {
    await connectDB();
    app.listen(ENV.PORT, () => console.log("Server is running on port:", ENV.PORT));
  } catch (error) {
    console.error("💥 Error starting the server", error);
  }
};

startServer();