import nodemailer from 'nodemailer';
import moment from 'moment-timezone';

// ✅ FIXED: Better Gmail configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD 
  },
  tls: {
    rejectUnauthorized: false // Helps on Render
  }
});

// ✅ Test email connection on startup
transporter.verify(function (error, success) {
  if (error) {
    console.log('❌ Email connection error:', error);
    console.log('📧 EMAIL_USER:', process.env.EMAIL_USER ? 'Set ✓' : '❌ MISSING');
    console.log('📧 EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'Set ✓ (length: ' + process.env.EMAIL_PASSWORD.length + ')' : '❌ MISSING');
  } else {
    console.log('✅ Email server is ready to send messages');
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

    console.log('✅ Candidate email sent successfully');

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

    console.log('✅ Interviewer email sent successfully');
    console.log('✅ All booking confirmation emails sent!');

  } catch (error) {
    console.error('❌ Error sending booking confirmation emails:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      response: error.response
    });
    throw error;
  }
};

export const sendInterviewConfirmationEmail = async (to, interview, recipientType) => {
  
  const isCandidate = recipientType === 'candidate';
  const recipientName = isCandidate ? interview.candidateName : interview.interviewerName;
  const recipientTimezone = isCandidate ? interview.candidateTimezone : interview.interviewerTimezone;

  const displayTimezone = recipientTimezone || interview.timezone || 'Asia/Kolkata';
  const localTime = moment(interview.scheduledTime).tz(displayTimezone);

  const mailOptions = {
    from: `"Talk2Hire" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Mock Interview Confirmed - ${localTime.format('dddd, MMM Do [at] h:mm A z')}`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 24px; background: #ffffff; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border: 1px solid #e0e0e0;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #4f46e5; font-size: 28px;">Interview Scheduled Successfully!</h1>
        </div>

        <p style="font-size: 18px; color: #1f2937;">Hello <strong>${recipientName.split(' ')[0]}</strong> 👋,</p>
        
        <p style="font-size: 16px; color: #374151;">
          ${isCandidate 
            ? `Your mock interview with <strong>${interview.interviewerName}</strong> is confirmed!`
            : `You have a mock interview scheduled with <strong>${interview.candidateName}</strong>!`
          }
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
          ${isCandidate 
            ? "Pro tip: Join 5 minutes early and test your mic/camera!"
            : "Get ready to grill them hard! 😈"
          }
        </p>

        <p style="color: #6b7280;">See you soon!<br/><strong>— The Talk2Hire Team</strong></p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

export const sendReminderEmail = async (to, name, interview, minutesBefore = 5) => {
  const recipientTimezone = interview.candidateTimezone || interview.interviewerTimezone || interview.timezone;
  const time = moment(interview.scheduledTime).tz(recipientTimezone);

  await transporter.sendMail({
    from: `"Talk2Hire" <${process.env.EMAIL_USER}>`,
    to,
    subject: `⏰ Reminder: Mock Interview in ${minutesBefore} minutes!`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; background: #fff7ed; border-radius: 16px; border: 2px solid #f59e0b;">
        <h2 style="color: #d97706; text-align: center;">⏰ Interview Starting Soon!</h2>
        <p style="font-size: 18px;">Hi ${name.split(' ')[0]},</p>
        <p style="font-size: 16px;">Your mock interview starts in <strong>${minutesBefore} minutes</strong>!</p>

        <div style="background: #fef3c7; padding: 16px; border-radius: 12px; margin: 20px 0;">
          <p><strong>Date:</strong> ${time.format('dddd, MMMM Do, YYYY')}</p>
          <p><strong>Time:</strong> ${time.format('h:mm A')} (${recipientTimezone.replace('_', ' ')})</p>
        </div>

        ${interview.meetingLink ? `
          <div style="text-align: center;">
            <a href="${interview.meetingLink}" style="background:#ef4444; color:white; padding:16px 32px; text-decoration:none; border-radius:12px; font-weight:bold; font-size:18px;">
              Join Now 🔥
            </a>
          </div>
        ` : ''}

        <p style="text-align: center; margin-top: 24px; color: #92400e;">
          Don't keep them waiting! 😉
        </p>
      </div>
    `
  });
};
