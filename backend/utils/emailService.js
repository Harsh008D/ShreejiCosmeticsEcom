import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './config.env' });

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp, userName) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset OTP - Shreeji Cosmetics',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Shreeji Cosmetics</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Password Reset Request</p>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #374151; margin: 0 0 20px 0;">Hello ${userName},</h2>
            
            <p style="color: #6b7280; line-height: 1.6; margin-bottom: 25px;">
              We received a request to reset your password. Use the OTP below to complete the password reset process.
            </p>
            
            <div style="background: #ffffff; border: 2px solid #10b981; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
              <h3 style="color: #10b981; margin: 0 0 10px 0; font-size: 18px;">Your OTP Code</h3>
              <div style="font-size: 32px; font-weight: bold; color: #374151; letter-spacing: 5px; font-family: 'Courier New', monospace;">
                ${otp}
              </div>
            </div>
            
            <p style="color: #6b7280; line-height: 1.6; margin-bottom: 15px;">
              <strong>Important:</strong>
            </p>
            <ul style="color: #6b7280; line-height: 1.6; margin-bottom: 25px; padding-left: 20px;">
              <li>This OTP will expire in 15 minutes</li>
              <li>If you didn't request this password reset, please ignore this email</li>
              <li>Never share this OTP with anyone</li>
            </ul>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 25px;">
              <p style="color: #9ca3af; font-size: 14px; margin: 0;">
                Best regards,<br>
                <strong>Shreeji Cosmetics Team</strong>
              </p>
            </div>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('OTP Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
};

// Verify email configuration
const verifyEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email service configured successfully');
    return true;
  } catch (error) {
    console.error('❌ Email service configuration failed:', error);
    return false;
  }
};

export {
  generateOTP,
  sendOTPEmail,
  verifyEmailConfig
}; 