// backend/routes/interviewers.js
import express from 'express';
import InterviewerAvailability from '../models/InterviewerAvailability.js';

const router = express.Router();

// GET all interviewers with their real availability
router.get('/interviewers', async (req, res) => {
  try {
    // Find all active availability records
    const availabilities = await InterviewerAvailability.find({ isActive: true });

    // Group by interviewer
    const interviewersMap = {};

    availabilities.forEach((avail) => {
      const id = avail.interviewerId;
      const key = id.toString();

      if (!interviewersMap[key]) {
        interviewersMap[key] = {
          interviewerId: key,
          name: avail.interviewerName || 'Interviewer',
          timezone: avail.timezone,
          schedules: []
        };
      }

      interviewersMap[key].schedules.push({
        dayOfWeek: avail.dayOfWeek,
        startTime: avail.startTime,
        endTime: avail.endTime,
        interviewDuration: avail.interviewDuration,
        bufferMinutes: avail.bufferMinutes,
        breakTime: avail.breakTime
      });
    });

    const interviewers = Object.values(interviewersMap);

    res.json({ success: true, interviewers });
  } catch (error) {
    console.error('Error fetching interviewers:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;