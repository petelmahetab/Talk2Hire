// backend/src/utils/sendEmails.js
import nodemailer from 'nodemailer';
import moment from 'moment-timezone';
import { candidateEmailTemplate, interviewerEmailTemplate } from './emailTemplates.js';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendBookingConfirmationEmails = async (interview) => {
  const candidateTz = interview.candidateTimezone || interview.timezone || 'UTC';
  const interviewerTz = interview.interviewerTimezone || interview.timezone || 'UTC';

  const candidateTime = moment(interview.scheduledTime).tz(candidateTz);
  const interviewerTime = moment(interview.scheduledTime).tz(interviewerTz);

  // Email to Candidate
  await transporter.sendMail({
    from: `"${interview.interviewerName}" <${process.env.EMAIL_USER}>`,
    replyTo: interview.interviewerEmail || process.env.EMAIL_USER,
    to: interview.candidateEmail,
    subject: `Mock Interview with ${interview.interviewerName.split(' ')[0]} - ${candidateTime.format('MMM Do [at] h:mm A')}`,
    html: candidateEmailTemplate(interview, candidateTime),
  });

  // Email to Interviewer
  await transporter.sendMail({
    from: `"${interview.candidateName} (via Talk2Hire)" <${process.env.EMAIL_USER}>`,
    replyTo: interview.candidateEmail,
    to: interview.interviewerEmail,
    subject: `New Booking: ${interview.candidateName} - ${interviewerTime.format('MMM Do, h:mm A')}`,
    html: interviewerEmailTemplate(interview, interviewerTime),
  });
};