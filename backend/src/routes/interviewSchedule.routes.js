// backend/routes/interviewSchedule.routes.js
import express from 'express';
import { protectRoute } from "../middleware/protectRoute.js";

import {
  getInterviewByRoomId,
  joinScheduledInterview,
  completeScheduledInterview,
} from '../controllers/interviewSchedule.controller.js'; 
const router = express.Router();

// These 3 routes are used when someone clicks the email link
router.get('/room/:roomId', protectRoute, getInterviewByRoomId);           
router.post('/room/:roomId/join', protectRoute, joinScheduledInterview); 
router.post('/room/:roomId/complete', protectRoute, completeScheduledInterview);

export default router;