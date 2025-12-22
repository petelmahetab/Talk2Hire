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



export const candidateEmailTemplate = (interview, candidateTime) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f3f4f6;">
      <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 24px; text-align: center;">
          <h1 style="color: #ffffff; font-size: 28px; margin: 0;">Interview Confirmed! 🎉</h1>
        </div>

        <!-- Content -->
        <div style="padding: 32px 24px;">
          <p style="font-size: 18px; color: #1f2937; margin-bottom: 16px;">
            Hello <strong>${interview.candidateName.split(' ')[0]}</strong> 👋
          </p>
          
          <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">
            Your mock interview with <strong>${interview.interviewerName}</strong> is confirmed!
          </p>

          <!-- Interview Details Box -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 24px; border-radius: 12px; margin: 24px 0;">
            <p style="margin: 8px 0; font-size: 16px;">
              <strong>📅 Date:</strong> ${candidateTime.format('dddd, MMMM Do, YYYY')}
            </p>
            <p style="margin: 8px 0; font-size: 16px;">
              <strong>🕐 Time:</strong> ${candidateTime.format('h:mm A')} 
              <span style="font-size: 14px; opacity: 0.9;">(${interview.timezone || 'IST'})</span>
            </p>
            <p style="margin: 8px 0; font-size: 16px;">
              <strong>⏱ Duration:</strong> ${interview.duration} minutes
            </p>
            <p style="margin: 8px 0; font-size: 16px;">
              <strong>💼 Type:</strong> ${interview.interviewType.toUpperCase()}
            </p>
          </div>

          <!-- Join Button -->
          ${interview.meetingLink ? `
            <div style="text-align: center; margin: 32px 0;">
              <a href="${interview.meetingLink}" 
                 style="display: inline-block; background: #10b981; color: white; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 18px;">
                Join Interview Room 🚀
              </a>
            </div>
          ` : ''}

          <hr style="border: none; border-top: 1px dashed #e5e7eb; margin: 32px 0;">

          <!-- Tips -->
          <div style="background: #f0f9ff; padding: 16px; border-left: 4px solid #0ea5e9; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #0c4a6e; font-size: 14px;">
              <strong>💡 Pro Tip:</strong> Join 5-10 minutes early to test your microphone and camera!
            </p>
          </div>

          <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
            Good luck! 🍀<br/>
            <strong>— The Talk2Hire Team</strong>
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; color: #9ca3af; font-size: 12px;">
            This email was sent by Talk2Hire. If you didn't book this interview, please ignore this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const interviewerEmailTemplate = (interview, interviewerTime) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f3f4f6;">
      <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 40px 24px; text-align: center;">
          <h1 style="color: #ffffff; font-size: 28px; margin: 0;">New Interview Scheduled 📅</h1>
        </div>

        <!-- Content -->
        <div style="padding: 32px 24px;">
          <p style="font-size: 18px; color: #1f2937; margin-bottom: 16px;">
            Hello <strong>${interview.interviewerName.split(' ')[0]}</strong> 👋
          </p>
          
          <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">
            You have a new mock interview scheduled with <strong>${interview.candidateName}</strong>!
          </p>

          <!-- Candidate Info Box -->
          <div style="background: #f0f9ff; padding: 20px; border-radius: 12px; margin: 24px 0; border-left: 4px solid #0ea5e9;">
            <h3 style="margin: 0 0 12px 0; color: #0c4a6e; font-size: 16px;">Candidate Information</h3>
            <p style="margin: 6px 0; color: #0c4a6e;">
              <strong>👤 Name:</strong> ${interview.candidateName}
            </p>
            <p style="margin: 6px 0; color: #0c4a6e;">
              <strong>📧 Email:</strong> ${interview.candidateEmail}
            </p>
            ${interview.candidatePhone ? `
              <p style="margin: 6px 0; color: #0c4a6e;">
                <strong>📱 Phone:</strong> ${interview.candidatePhone}
              </p>
            ` : ''}
          </div>

          <!-- Interview Details Box -->
          <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 24px; border-radius: 12px; margin: 24px 0;">
            <p style="margin: 8px 0; font-size: 16px;">
              <strong>📅 Date:</strong> ${interviewerTime.format('dddd, MMMM Do, YYYY')}
            </p>
            <p style="margin: 8px 0; font-size: 16px;">
              <strong>🕐 Time:</strong> ${interviewerTime.format('h:mm A')}
              <span style="font-size: 14px; opacity: 0.9;">(${interview.timezone || 'IST'})</span>
            </p>
            <p style="margin: 8px 0; font-size: 16px;">
              <strong>⏱ Duration:</strong> ${interview.duration} minutes
            </p>
            <p style="margin: 8px 0; font-size: 16px;">
              <strong>💼 Type:</strong> ${interview.interviewType.toUpperCase()}
            </p>
          </div>

          ${interview.notes ? `
            <div style="background: #fef3c7; padding: 16px; border-left: 4px solid #f59e0b; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #92400e;">
                <strong>📝 Notes:</strong> ${interview.notes}
              </p>
            </div>
          ` : ''}

          <!-- Join Button -->
          ${interview.meetingLink ? `
            <div style="text-align: center; margin: 32px 0;">
              <a href="${interview.meetingLink}" 
                 style="display: inline-block; background: #10b981; color: white; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 18px;">
                Join Interview Room 🚀
              </a>
            </div>
          ` : ''}

          <hr style="border: none; border-top: 1px dashed #e5e7eb; margin: 32px 0;">

          <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
            Get ready to evaluate! 💪<br/>
            <strong>— The Talk2Hire Team</strong>
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; color: #9ca3af; font-size: 12px;">
            Reply to this email to contact the candidate directly.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};
