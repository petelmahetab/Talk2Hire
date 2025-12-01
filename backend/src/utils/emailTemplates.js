
import moment from 'moment-timezone';

export const candidateEmailTemplate = (interview, localTime) => `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 40px auto; padding: 32px; background: #fff; border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.08); border: 1px solid #e0e0e0;">
  <div style="text-align: center; margin-bottom: 32px;">
    <h1 style="color: #4f46e5; font-size: 28px; margin:0;">Your Interview is Confirmed!</h1>
    <p style="color: #6b7280; font-size: 18px;">with <strong>${interview.interviewerName}</strong></p>
  </div>

  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 24px; border-radius: 16px; text-align: center;">
    <p style="margin: 8px 0; font-size: 18px;"><strong>Date:</strong> ${localTime.format('dddd, MMMM Do, YYYY')}</p>
    <p style="margin: 12px 0; font-size: 24px; font-weight: bold;">${localTime.format('h:mm A')} <small style="opacity:0.9;">${localTime.format('z')}</small></p>
    <p style="margin: 8px 0;"><strong>Duration:</strong> ${interview.duration} minutes • ${interview.interviewType.toUpperCase()}</p>
  </div>

  <div style="text-align: center; margin: 40px 0;">
    <a href="${interview.meetingLink}" style="background:#10b981; color:white; padding:18px 40px; text-decoration:none; border-radius:12px; font-weight:bold; font-size:20px; display:inline-block; box-shadow: 0 10px 20px rgba(16,185,129,0.3);">
      Join Interview Room
    </a>
  </div>

  <div style="background: #f0fff4; padding: 20px; border-radius: 12px; border-left: 5px solid #10b981;">
    <p style="margin:0; color: #166534;"><strong>Pro Tip:</strong> Join 5 minutes early to test your mic & camera!</p>
  </div>

  <p style="text-align: center; color: #6b7280; margin-top: 40px;">
    See you soon!<br/>
    — <strong>${interview.interviewerName.split(' ')[0]}</strong> & The Talk2Hire Team
  </p>
</div>
`;

export const interviewerEmailTemplate = (interview, localTime) => `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 40px auto; padding: 32px; background: #fff; border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.08); border: 1px solid #e0e0e0;">
  <h1 style="color: #7c3aed; font-size: 26px; text-align: center; margin-bottom: 24px;">New Mock Interview Booked!</h1>

  <div style="background: #f5f3ff; padding: 24px; border-radius: 16px; margin: 24px 0; border: 2px dashed #a78bfa;">
    <p style="margin: 8px 0;"><strong>Candidate:</strong> ${interview.candidateName}</p>
    <p style="margin: 8px 0;"><strong>Email:</strong> ${interview.candidateEmail}</p>
    ${interview.candidatePhone ? `<p style="margin: 8px 0;"><strong>Phone:</strong> ${interview.candidatePhone}</p>` : ''}
    ${interview.notes ? `<p style="margin: 12px 0; padding: 16px; background: white; border-radius: 8px; border-left: 4px solid #a78bfa;"><strong>Notes:</strong> ${interview.notes}</p>` : ''}
  </div>

  <div style="background: linear-gradient(135deg, #818cf8 0%, #c084fc 100%); color: white; padding: 24px; border-radius: 16px; text-align: center;">
    <p style="margin: 8px 0; font-size: 18px;"><strong>Date:</strong> ${localTime.format('dddd, MMMM Do, YYYY')}</p>
    <p style="margin: 12px 0; font-size: 24px; font-weight: bold;">${localTime.format('h:mm A z')}</p>
    <p style="margin: 8px 0;"><strong>Duration:</strong> ${interview.duration} mins • ${interview.interviewType.toUpperCase()}</p>
  </div>

  <div style="text-align: center; margin: 40px 0;">
    <a href="${interview.meetingLink}" style="background:#8b5cf6; color:white; padding:18px 40px; text-decoration:none; border-radius:12px; font-weight:bold; font-size:20px;">
      Open Interview Room
    </a>
  </div>

  <p style="text-align: center; color: #6b7280;">
    Get ready to help them crush it!<br/>— Talk2Hire Scheduler
  </p>
</div>
`;