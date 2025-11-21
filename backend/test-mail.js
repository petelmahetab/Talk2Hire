import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});
// console.log("Loaded .env:", process.env);
const testEmail = async () => {
  try {
    console.log('📧 Testing email configuration...');
    console.log('Email Service:', process.env.EMAIL_SERVICE);
    console.log('Email User:', process.env.EMAIL_USER);
    console.log('Password set:', process.env.EMAIL_PASSWORD ? 'Yes ✅' : 'No ❌');

    const info = await transporter.sendMail({
      from: `"Talk2Hire Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to yourself
      subject: 'Test Email - Talk2Hire',
      html: `
        <h1>✅ Email Setup Successful!</h1>
        <p>Your Talk2Hire email configuration is working correctly.</p>
        <p>You can now receive interview reminders and confirmations.</p>
      `
    });

    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Check your inbox:', process.env.EMAIL_USER);
  } catch (error) {
    console.error('❌ Email sending failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('Invalid login')) {
      console.error('\n💡 Solution: Check your email and app password are correct');
    } else if (error.message.includes('self signed certificate')) {
      console.error('\n💡 Solution: Try using port 587 instead of 465');
    } else {
      console.error('\n💡 Solution: Make sure 2FA is enabled and App Password is generated');
    }
  }
};

testEmail();