import cron from 'node-cron';
import InterviewSchedule from '../models/InterviewSchedule.js';
import { sendReminderEmail } from '../services/emailService.js';
import moment from 'moment-timezone';

// Run every minute
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    const fiveMinLater = new Date(now.getTime() + 5 * 60 * 1000);

    const interviews = await InterviewSchedule.find({
      status: 'scheduled',
      scheduledTime: { $gte: now, $lte: oneHourLater }
    });

    for (const interview of interviews) {
      const diff = (new Date(interview.scheduledTime) - now) / 60000;

      if (diff >= 55 && diff <= 65 && !interview.remindersSent.hour_before) {
        await sendReminderEmail(interview.candidateEmail, interview.candidateName, interview, '1 hour');
        await sendReminderEmail('interviewer@example.com', 'Interviewer', interview, '1 hour');
        await InterviewSchedule.findByIdAndUpdate(interview._id, { 'remindersSent.hour_before': true });
      }

      if (diff <= 5 && !interview.remindersSent.five_min_before) {
        await sendReminderEmail(interview.candidateEmail, interview.candidateName, interview, '5 minutes');
        await InterviewSchedule.findByIdAndUpdate(interview._id, { 'remindersSent.five_min_before': true });
      }
    }
  } catch (error) {
    console.error('Reminder job error:', error);
  }
});

console.log('Reminder jobs scheduled');