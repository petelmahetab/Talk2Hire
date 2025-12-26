import express from 'express';
import InterviewSchedule from '../models/InterviewSchedule.js';
import InterviewerAvailability from '../models/InterviewerAvailability.js';
import Session from '../models/Session.js';
import { getAvailableSlots, isSlotAvailable } from '../services/schedulingService.js';
// import { sendInterviewConfirmationEmail } from '../services/emailService.js';
import { sendBookingConfirmationEmails } from '../utils/sendEmails.js';
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

// Book interview - FIXED VERSION
router.post('/book', async (req, res) => {
  try {
    const data = req.body;
    const roomId = uuidv4();

    console.log('📝 Booking data received:', data);

    // Check if slot is still available
    const isAvailable = await isSlotAvailable(
      data.interviewerId,
      data.scheduledTime,
      data.duration,
      data.timezone
    );

    if (!isAvailable) {
      return res.status(409).json({
        success: false,
        message: 'This time slot has already been booked. Please select another slot.'
      });
    }

    const endTime = moment.tz(data.scheduledTime, data.timezone)
      .add(data.duration, 'minutes')
      .toDate();

    const interview = await InterviewSchedule.create({
      ...data,
      interviewerId: data.interviewerId,
      interviewerName: data.interviewerName || 'Interviewer',
      interviewerEmail: data.interviewerEmail,
      candidateName: data.candidateName,
      candidateEmail: data.candidateEmail,
      candidatePhone: data.candidatePhone || null,
      roomId,
      endTime,
      duration: data.duration,
      interviewType: data.interviewType,
      timezone: data.timezone,
      status: 'scheduled',
      meetingLink: `${process.env.CLIENT_URL || 'http://localhost:5173'}/interview/join/${roomId}`
    });

    console.log('✅ Interview created:', interview._id);
    
    // ✅ RESEND CONFIG CHECK
    console.log('📧 Resend API Key:', process.env.RESEND_API_KEY ? 'Configured ✓' : '❌ MISSING!');

    // Send booking confirmation emails
    try {
      console.log('📧 Sending emails to:', {
        candidate: interview.candidateEmail,
        interviewer: interview.interviewerEmail
      });
      
      const emailResult = await sendBookingConfirmationEmails(interview.toObject());
      
      console.log('✅ Emails sent successfully:', emailResult);
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError);
      console.error('Error details:', {
        message: emailError.message,
        statusCode: emailError.statusCode,
        name: emailError.name
      });
    
    }

    res.json({ 
      success: true, 
      interview,
      message: 'INTERVIEW HAS BEEN BOOKED..! CHECK YOUR EMAIL'
    });

  } catch (error) {
    console.error('❌ Booking error:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
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
