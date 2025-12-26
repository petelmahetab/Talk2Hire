import nodemailer from 'nodemailer';
import moment from 'moment-timezone';

// Create Gmail transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Test connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email service error:', error);
  } else {
    console.log('✅ Email service ready');
  }
});

export const sendBookingConfirmationEmails = async (interview) => {
  try {
    console.log('📧 Preparing to send booking confirmation emails...');
    console.log('Interview data:', {
      candidateEmail: interview.candidateEmail,
      interviewerEmail: interview.interviewerEmail,
      scheduledTime: interview.scheduledTime
    });

    const displayTimezone = interview.timezone || 'Asia/Kolkata';
    const localTime = moment(interview.scheduledTime).tz(displayTimezone);

    // Send email to candidate
    console.log('📨 Sending email to candidate:', interview.candidateEmail);
    await transporter.sendMail({
      from: `"Talk2Hire" <${process.env.EMAIL_USER}>`,
      to: interview.candidateEmail,
      subject: `🎉 Interview Confirmed - ${localTime.format('MMM Do [at] h:mm A')}`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 24px; background: #ffffff; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border: 1px solid #e0e0e0;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #4f46e5; font-size: 28px;">Interview Scheduled Successfully!</h1>
          </div>

          <p style="font-size: 18px; color: #1f2937;">Hello <strong>${interview.candidateName.split(' ')[0]}</strong> 👋,</p>
          
          <p style="font-size: 16px; color: #374151;">
            Your mock interview with <strong>${interview.interviewerName}</strong> is confirmed!
          </p>

          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px; margin: 24px 0;">
            <p style="margin: 8px 0; font-size: 16px;"><strong>📅 Date:</strong> ${localTime.format('dddd, MMMM Do, YYYY')}</p>
            <p style="margin: 8px 0; font-size: 16px;"><strong>🕐 Time:</strong> ${localTime.format('h:mm A')} <small>(${displayTimezone.replace('_', ' ')})</small></p>
            <p style="margin: 8px 0; font-size: 16px;"><strong>⏱ Duration:</strong> ${interview.duration} minutes</p>
            <p style="margin: 8px 0; font-size: 16px;"><strong>💼 Type:</strong> ${interview.interviewType.toUpperCase()}</p>
          </div>

          ${interview.meetingLink ? `
            <div style="text-align: center; margin: 32px 0;">
              <a href="${interview.meetingLink}" style="background:#10b981; color:white; padding:16px 32px; text-decoration:none; border-radius:12px; font-weight:bold; font-size:18px; display:inline-block;">
                Join Interview Room 🚀
              </a>
            </div>
          ` : ''}

          <hr style="border: 1px dashed #e5e7eb; margin: 32px 0;">

          <p style="color: #6b7280; font-size: 14px;">
            Pro tip: Join 5 minutes early and test your mic/camera!
          </p>

          <p style="color: #6b7280;">See you soon!<br/><strong>— The Talk2Hire Team</strong></p>
        </div>
      `
    });

    console.log('✅ Candidate email sent');

    // Send email to interviewer
    console.log('📨 Sending email to interviewer:', interview.interviewerEmail);
    await transporter.sendMail({
      from: `"Talk2Hire" <${process.env.EMAIL_USER}>`,
      to: interview.interviewerEmail,
      subject: `📅 New Interview Scheduled - ${localTime.format('MMM Do [at] h:mm A')}`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 24px; background: #ffffff; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border: 1px solid #e0e0e0;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #4f46e5; font-size: 28px;">New Interview Scheduled</h1>
          </div>

          <p style="font-size: 18px; color: #1f2937;">Hello <strong>${interview.interviewerName.split(' ')[0]}</strong> 👋,</p>
          
          <p style="font-size: 16px; color: #374151;">
            You have a new mock interview scheduled with <strong>${interview.candidateName}</strong>!
          </p>

          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px; margin: 24px 0;">
            <p style="margin: 8px 0; font-size: 16px;"><strong>👤 Candidate:</strong> ${interview.candidateName}</p>
            <p style="margin: 8px 0; font-size: 16px;"><strong>📧 Email:</strong> ${interview.candidateEmail}</p>
            ${interview.candidatePhone ? `<p style="margin: 8px 0; font-size: 16px;"><strong>📱 Phone:</strong> ${interview.candidatePhone}</p>` : ''}
            <p style="margin: 8px 0; font-size: 16px;"><strong>📅 Date:</strong> ${localTime.format('dddd, MMMM Do, YYYY')}</p>
            <p style="margin: 8px 0; font-size: 16px;"><strong>🕐 Time:</strong> ${localTime.format('h:mm A')} <small>(${displayTimezone.replace('_', ' ')})</small></p>
            <p style="margin: 8px 0; font-size: 16px;"><strong>⏱ Duration:</strong> ${interview.duration} minutes</p>
            <p style="margin: 8px 0; font-size: 16px;"><strong>💼 Type:</strong> ${interview.interviewType.toUpperCase()}</p>
          </div>

          ${interview.notes ? `
            <div style="background: #f0f9ff; padding: 15px; border-left: 4px solid #0ea5e9; margin: 20px 0;">
              <strong>📝 Notes:</strong>
              <p style="margin: 5px 0 0 0;">${interview.notes}</p>
            </div>
          ` : ''}

          ${interview.meetingLink ? `
            <div style="text-align: center; margin: 32px 0;">
              <a href="${interview.meetingLink}" style="background:#10b981; color:white; padding:16px 32px; text-decoration:none; border-radius:12px; font-weight:bold; font-size:18px; display:inline-block;">
                Join Interview Room 🚀
              </a>
            </div>
          ` : ''}

          <hr style="border: 1px dashed #e5e7eb; margin: 32px 0;">

          <p style="color: #6b7280; font-size: 14px;">
            Get ready to grill them hard! 😈
          </p>

          <p style="color: #6b7280;">See you soon!<br/><strong>— The Talk2Hire Team</strong></p>
        </div>
      `
    });

    console.log('✅ Interviewer email sent');
    console.log('✅ All booking confirmation emails sent successfully!');

    return { success: true };

  } catch (error) {
    console.error('❌ Error sending booking confirmation emails:', error);
    throw error;
  }
};
