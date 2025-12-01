// src/utils/emailTemplates.js

import moment from 'moment-timezone';

// Professional colors
const brandBlue = '#2563eb';        
const brandGreen = '#16a34a';      
const brandLightGreen = '#22c55e';
const brandGray = '#f3f4f6';
const brandBorder = '#e5e7eb';
const brandText = '#1f2937';
const brandMuted = '#6b7280';


export const candidateEmailTemplate = (interview, localTime) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Interview is Confirmed</title>
  <style>
    body { font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif; background:#f9fafb; margin:0; padding:20px; line-height:1.6; color:${brandText}; }
    .container { max-width: 600px; margin:30px auto; background:white; border-radius:12px; overflow:hidden; box-shadow:0 10px 25px rgba(0,0,0,0.05); border:1px solid ${brandBorder}; }
    .header { background:${brandBlue}; color:white; padding:36px 24px; text-align:center; }
    .header h1 { margin:0; font-size:26px; font-weight:600; }
    .header p { margin:10px 0 0; font-size:17px; opacity:0.95; }
    .content { padding:40px 32px; }
    .details-box { background:${brandGray}; border-radius:10px; padding:28px; text-align:center; margin:24px 0; border:1px solid ${brandBorder}; }
    .time { font-size:34px; font-weight:700; color:${brandBlue}; margin:16px 0; }
    .btn {
      display:inline-block;
      background:${brandGreen};
      color:white !important;
      padding:16px 40px;
      border-radius:8px;
      font-weight:600;
      font-size:18px;
      text-decoration:none;
      box-shadow:0 6px 16px rgba(22,163,74,0.3);
      margin:24px 0;
      transition: background 0.3s;
    }
    .btn:hover { background:${brandLightGreen}; }
    .tip { background:#f0fdf4; border-left:4px solid ${brandGreen}; padding:18px; border-radius:6px; color:#166534; font-size:15px; margin-top:32px; }
    .footer { text-align:center; padding:32px 20px; color:${brandMuted}; font-size:14px; border-top:1px solid ${brandBorder}; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Interview Confirmed</h1>
      <p>with ${interview.interviewerName}</p>
    </div>

    <div class="content">
      <div class="details-box">
        <p style="margin:0; font-size:17px; color:${brandMuted};"><strong>Date</strong></p>
        <p style="margin:8px 0 20px; font-size:20px; font-weight:600;">${localTime.format('dddd, MMMM Do, YYYY')}</p>
        
        <p class="time">${localTime.format('h:mm A')}</p>
        <p style="margin:8px 0; font-size:17px; color:${brandMuted};">${localTime.format('z')} time zone</p>
        
        <p style="margin:16px 0 0;"><strong>Duration:</strong> ${interview.duration} minutes</p>
        <p><strong>Type:</strong> ${interview.interviewType.charAt(0).toUpperCase() + interview.interviewType.slice(1)} Interview</p>
      </div>

      <div style="text-align:center;">
        <a href="${interview.meetingLink}" class="btn">Join Interview Room</a>
      </div>

      <div class="tip">
        <strong>Pro Tip:</strong> Join 5–10 minutes early to test your mic, camera, and internet connection.
      </div>

      <div class="footer">
        Best of luck — you've got this!<br>
      <span style="font-size:18px; font-weight:600;color:${brandBlue};">${interview.interviewerName.split(' ')[0]} & The Talk2Hire Team</span>
      </div>
    </div>
  </div>
</body>
</html>
`;

export const interviewerEmailTemplate = (interview, localTime) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Interview Scheduled</title>
  <style>
    body { font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif; background:#f9fafb; margin:0; padding:20px; line-height:1.6; color:${brandText}; }
    .container { max-width: 600px; margin:30px auto; background:white; border-radius:12px; overflow:hidden; box-shadow:0 10px 25px rgba(0,0,0,0.05); border:1px solid ${brandBorder}; }
    .header { background:${brandBlue}; color:white; padding:36px 24px; text-align:center; }
    .header h1 { margin:0; font-size:24px; font-weight:600; }
    .content { padding:40px 32px; }
    .info { background:#f8fafc; border-radius:10px; padding:24px; margin:24px 0; border:1px solid ${brandBorder}; }
    .info p { margin:10px 0; font-size:16px; }
    .details-box { background:${brandGray}; border-radius:10px; padding:28px; text-align:center; margin:24px 0; }
    .time { font-size:32px; font-weight:700; color:${brandBlue}; margin:16px 0; }
    .btn {
      display:inline-block;
      background:${brandBlue};
      color:white !important;
      padding:16px 40px;
      border-radius:8px;
      font-weight:600;
      font-size:18px;
      text-decoration:none;
      box-shadow:0 6px 16px rgba(37,99,235,0.3);
    }
    .footer { text-align:center; padding:32px 20px; color:${brandMuted}; font-size:14px; border-top:1px solid ${brandBorder}; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Interview Scheduled</h1>
    </div>

    <div class="content">
      <div class="info">
        <p><strong>Candidate:</strong> ${interview.candidateName}</p>
        <p><strong>Email:</strong> ${interview.candidateEmail}</p>
        ${interview.candidatePhone ? `<p><strong>Phone:</strong> ${interview.candidatePhone}</p>` : ''}
        ${interview.notes ? `
        <div style="margin-top:16px; padding:16px; background:white; border-radius:8px; border-left:4px solid ${brandBlue}; font-size:15px;">
          <strong>Notes from candidate:</strong><br><br>${interview.notes.replace(/\n/g, '<br>')}
        </div>` : ''}
      </div>

      <div class="details-box">
        <p style="margin:0; color:${brandMuted};"><strong>Date & Time</strong></p>
        <p class="time">${localTime.format('h:mm A z')}</p>
        <p style="margin:12px 0 0; font-size:19px; font-weight:600;">${localTime.format('dddd, MMMM Do, YYYY')}</p>
        <p style="margin:16px 0 0;"><strong>Duration:</strong> ${interview.duration} minutes • ${interview.interviewType.toUpperCase()}</p>
      </div>

      <div style="text-align:center;">
        <a href="${interview.meetingLink}" class="btn">Open Interview Room</a>
      </div>

      <div class="footer">
        Thank you for helping candidates grow<br>
        <span style="font-size:18px; font-weight:600;color:${brandBlue};">Talk2Hire Platform</span>
      </div>
    </div>
  </div>
</body>
</html>
`;