import dotenv from 'dotenv';
import { verifyEmailConfig, sendOTPEmail } from '../utils/emailService.js';

// Load environment variables
dotenv.config({ path: './config.env' });

const testEmail = async () => {
  try {
    console.log('🔧 Testing email configuration...');
    console.log('📧 Email User:', process.env.EMAIL_USER);
    console.log('🔑 Email Pass:', process.env.EMAIL_PASS ? '***' + process.env.EMAIL_PASS.slice(-4) : 'NOT SET');
    console.log('📤 Email From:', process.env.EMAIL_FROM);
    
    // Test email configuration
    console.log('\n🔍 Verifying email configuration...');
    const isConfigValid = await verifyEmailConfig();
    
    if (isConfigValid) {
      console.log('✅ Email configuration is valid!');
      
      // Test sending email
      console.log('\n📤 Testing email sending...');
      const result = await sendOTPEmail(
        'hdholakiya659@gmail.com',
        '123456',
        'Test User'
      );
      
      if (result.success) {
        console.log('✅ Email sent successfully!');
        console.log('📧 Message ID:', result.messageId);
      }
    } else {
      console.log('❌ Email configuration failed!');
    }
    
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    console.error('🔍 Full error:', error);
  }
};

testEmail(); 