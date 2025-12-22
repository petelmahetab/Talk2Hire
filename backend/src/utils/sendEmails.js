// backend/src/utils/sendEmails.js
import { Resend } from 'resend';
import moment from 'moment-timezone';
import { candidateEmailTemplate, interviewerEmailTemplate } from './emailTemplates.js';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Verify API key on startup
if (process.env.RESEND_API_KEY) {
  console.log('✅ Resend API key configured');
} else {
  console.error('❌ RESEND_API_KEY missing in environment variables!');
}

export const sendBookingConfirmationEmails = async (interview) => {
  try {
    console.log('📧 Starting email send process...');
    console.log('📧 Candidate email:', interview.candidateEmail);
    console.log('📧 Interviewer email:', interview.interviewerEmail);

    const candidateTz = interview.candidateTimezone || interview.timezone || 'UTC';
    const interviewerTz = interview.interviewerTimezone || interview.timezone || 'UTC';
    
    const candidateTime = moment(interview.scheduledTime).tz(candidateTz);
    const interviewerTime = moment(interview.scheduledTime).tz(interviewerTz);

    // Send email to Candidate
    console.log('📨 Sending to candidate...');
    const candidateResult = await resend.emails.send({
      from: 'Talk2Hire <onboarding@resend.dev>',
      replyTo: interview.interviewerEmail || 'noreply@talk2hire.com',
      to: interview.candidateEmail,
      subject: `Mock Interview with ${interview.interviewerName.split(' ')[0]} - ${candidateTime.format('MMM Do [at] h:mm A')}`,
      html: candidateEmailTemplate(interview, candidateTime),
    });

    console.log('✅ Candidate email sent! ID:', candidateResult.id);

    // Send email to Interviewer
    console.log('📨 Sending to interviewer...');
    const interviewerResult = await resend.emails.send({
      from: 'Talk2Hire <onboarding@resend.dev>',
      replyTo: interview.candidateEmail,
      to: interview.interviewerEmail,
      subject: `New Booking: ${interview.candidateName} - ${interviewerTime.format('MMM Do, h:mm A')}`,
      html: interviewerEmailTemplate(interview, interviewerTime),
    });

    console.log('✅ Interviewer email sent! ID:', interviewerResult.id);
    console.log('✅ All emails sent successfully!');

    return {
      success: true,
      candidateEmailId: candidateResult.id,
      interviewerEmailId: interviewerResult.id
    };

  } catch (error) {
    console.error('❌ Email sending failed:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      statusCode: error.statusCode
    });
    
    // Don't throw - let booking succeed even if email fails
    return {
      success: false,
      error: error.message
    };
  }
};
