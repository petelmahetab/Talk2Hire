import express from "express";
import path from "path";
import { fileURLToPath } from "url";
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

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.set('trust proxy', 1);


// Recove Password SendGrid new emailService' D22FZ9FCQ8UZ287J1F16Y1RU]

// Logging middleware
app.use((req, res, next) => {
  console.log('📍', req.method, req.url);
  console.log('🔑 Auth header:', req.headers.authorization ? 'Present' : 'Missing');
  next();
});

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
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors());

// ✅ Apply Clerk middleware GLOBALLY - it will parse the token
app.use(clerkMiddleware());

// Debug middleware to check what Clerk extracted
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    console.log('🔍 Clerk auth object:', req.auth);
  }
  next();
});

app.get("/", (req, res) => {
  res.json({ 
    message: 'Talk2Hire API', 
    status: 'running',
    timestamp: new Date().toISOString()
  });
});
// app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.get("/health", (req, res) => {
  res.status(200).json({ msg: "api is up and running" });
});

app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/chat", chatRoutes);
app.use("/api/sessions", sessionRoutes);
app.use('/api/scheduling', schedulingRoutes);
app.use('/api', interviewersRoutes);
app.use("/api/interview-schedule", interviewScheduleRoutes);

// // 404 handler
// app.get('*', (req, res) => {
//   if (req.path.startsWith('/api/')) {
//     return res.status(404).json({ error: 'API route not found' });
//   }
//   res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
// });
// Error handler
app.use((err, req, res, next) => {
  console.error('💥 Error:', err.message);
  res.status(500).json({ error: err.message });
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(ENV.PORT, () => {
      console.log("✅ Server running on port:", ENV.PORT);
      console.log("✅ Environment:", ENV.NODE_ENV);
      console.log("✅ Clerk Keys:", {
        publishable: ENV.CLERK_PUBLISHABLE_KEY ? '✅ Set' : '❌ Missing',
        secret: ENV.CLERK_SECRET_KEY ? '✅ Set' : '❌ Missing'
      });
    });
  } catch (error) {
    console.error("💥 Error starting server:", error);
  }
};

startServer();
