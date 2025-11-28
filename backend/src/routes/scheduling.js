import express from 'express';
import InterviewSchedule from '../models/InterviewSchedule.js';
import InterviewerAvailability from '../models/InterviewerAvailability.js';
import Session from '../models/Session.js'; 
import { getAvailableSlots } from '../services/schedulingService.js';
import { sendInterviewConfirmationEmail } from '../services/emailService.js';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment-timezone';

const router = express.Router();

// Get available slots
router.get('/available-slots/:interviewerId', async (req, res) => {
  try {
    const { interviewerId } = req.params;
    const { startDate, timezone = 'UTC' } = req.query;

    // Accept both ISO and YYYY-MM-DD
    const date = startDate.includes('T') ? startDate : `${startDate}T00:00:00Z`;

    const slots = await getAvailableSlots(interviewerId, date, timezone);
    res.json({ success: true, slots });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Book interview
router.post('/book', async (req, res) => {
  try {
    const data = req.body;
    const roomId = uuidv4();
    console.log('🔵 Created roomId:', roomId); // ADD THIS
    
    const endTime = moment.tz(data.scheduledTime, data.timezone).add(data.duration, 'minutes').toDate();

    // 1. Create InterviewSchedule
    const interview = await InterviewSchedule.create({
      ...data,
      interviewerId: data.interviewerId,
      candidateId: req.user?.id || null,
      roomId,
      endTime,
      meetingLink: `${process.env.CLIENT_URL}/session/${roomId}`
    });
    console.log('✅ InterviewSchedule created'); // ADD THIS

    // 2. CREATE SESSION DOCUMENT
    const session = await Session.create({
      callId: roomId,
      problem: `Mock Interview - ${data.interviewType || 'Technical'}`,
      difficulty: 'medium',
      host: data.interviewerId,
      status: 'active'
    });
    console.log('✅ Session created with callId:', session.callId); // ADD THIS

    // 3. Send emails
    await sendInterviewConfirmationEmail(data.candidateEmail, interview);
    await sendInterviewConfirmationEmail(data.interviewerEmail || 'admin@talk2hire.com', interview);

    res.json({ success: true, interview });
  } catch (error) {
    console.error('❌ Booking error:', error); // ADD THIS
    res.status(500).json({ success: false, message: error.message });
  }
});

// // Get my interviews
router.get('/my-interviews', async (req, res) => {
  try {
    const userId = req.user?.id;
    const userEmail = req.user?.primaryEmailAddress?.emailAddress;
    const { role = 'candidate', upcoming } = req.query;

    let query = {};
    if (role === 'candidate') {
      query.candidateEmail = userEmail;
    } else {
      query.interviewerId = userId;
    }

    if (upcoming === 'true') {
      query.scheduledTime = { $gt: new Date() };
      query.status = 'scheduled';
    }

    const interviews = await InterviewSchedule.find(query).sort({ scheduledTime: 1 });
    res.json({ success: true, interviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Set availability
router.post('/availability', async (req, res) => {
  try {
    const { interviewerId } = req.body;

    if (!interviewerId) {
      return res.status(400).json({ success: false, message: 'interviewerId is required' });
    }

    const availability = await InterviewerAvailability.create({
      ...req.body,
      interviewerId
    });

    res.json({ success: true, availability });
  } catch (error) {
    console.error('Save availability error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// router.get('/interviewers', async (req, res) => {
//   try {
//     // Get unique interviewers who have active availability
//     const interviewers = await InterviewerAvailability.aggregate([
//       { $match: { isActive: true } },
//       { 
//         $group: { 
//           _id: '$interviewerId',
//           name: { $first: '$interviewerName' },
//           timezone: { $first: '$timezone' },
//           availableDays: { $addToSet: '$dayOfWeek' }
//         } 
//       },
//       {
//         $project: {
//           _id: 0,
//           interviewerId: '$_id',  // ✅ Map _id to interviewerId
//           name: 1,
//           timezone: 1,
//           availableDays: 1
//         }
//       }
//     ]);
    
//     res.json({ success: true, interviewers });
//   } catch (error) {
//     console.error('Error fetching interviewers:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// Get availability
router.get('/availability/:interviewerId', async (req, res) => {
  try {
    const { interviewerId } = req.params;
    if (!interviewerId) {
      return res.status(400).json({ success: false, message: 'interviewerId required' });
    }
    const availabilities = await InterviewerAvailability.find({ interviewerId });
    res.json({ success: true, availabilities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete availability
router.delete('/availability/:id', async (req, res) => {
  try {
    await InterviewerAvailability.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Cancel interview
router.delete('/:id', async (req, res) => {
  try {
    await InterviewSchedule.findByIdAndUpdate(req.params.id, { status: 'cancelled' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;