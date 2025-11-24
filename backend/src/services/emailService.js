import nodemailer from 'nodemailer';
import moment from 'moment-timezone';

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

export const sendInterviewConfirmationEmail = async (to, interview) => {
  const candidateTime = moment(interview.scheduledTime).tz(interview.timezone);
  const interviewerTime = moment(interview.scheduledTime).tz(interview.timezone);

  const mailOptions = {
    from: `"Talk2Hire" <${process.env.EMAIL_USER}>`,
    to: to,
    subject: `🎯 Mock Interview Confirmed - ${candidateTime.format('MMMM Do, YYYY [at] h:mm A')}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px;">
        <h2 style="color: #4f46e5;">🎉 Interview Scheduled Successfully!</h2>
        <p>Hello <strong>${to === interview.candidateEmail ? interview.candidateName : interview.interviewerName}</strong>,</p>
        <div style="background: #f8f9ff; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>📅 Date:</strong> ${candidateTime.format('dddd, MMMM Do, YYYY')}</p>
          <p><strong>⏰ Time:</strong> ${candidateTime.format('h:mm A')} (${interview.timezone})</p>
          <p><strong>⏱ Duration:</strong> ${interview.duration} minutes</p>
          <p><strong>💼 Type:</strong> ${interview.interviewType.replace('-', ' ').toUpperCase()}</p>
        </div>
        ${interview.meetingLink ? `<p><a href="${interview.meetingLink}" style="background:#10b981; color:white; padding:12px 24px; text-decoration:none; border-radius:8px;">Join Interview Room 🚀</a></p>` : ''}
        <p>See you soon!<br/>— The Talk2Hire Team</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

export const sendReminderEmail = async (to, name, interview, type = '1 hour') => {
  const time = moment(interview.scheduledTime).tz(interview.timezone);
  await transporter.sendMail({
    from: `"Talk2Hire" <${process.env.EMAIL_USER}>`,
    to,
    subject: `⏰ Reminder: Your Mock Interview in ${type}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px;">
        <h2 style="color: #f59e0b;">⏰ Reminder: Upcoming Mock Interview</h2>
        <p>Hi ${name},</p>
        <p>Your interview is coming up in <strong>${type}</strong>!</p>
        <div style="background: #fff7ed; padding: 16px; border-radius: 8px;">
          <p><strong>Date:</strong> ${time.format('dddd, MMMM Do, YYYY')}</p>
          <p><strong>Time:</strong> ${time.format('h:mm A')} (${interview.timezone})</p>
        </div>
        ${interview.meetingLink ? `<p><a href="${interview.meetingLink}" style="background:#10b981; color:white; padding:12px 24px; text-decoration:none; border-radius:8px;">Join Now 🚀</a></p>` : ''}
      </div>
    `
  });
};