console.log('🚀 Test deployment script running...');
console.log('✅ Node.js version:', process.version);
console.log('✅ Environment:', process.env.NODE_ENV || 'development');
console.log('✅ Port:', process.env.PORT || 5000);

// Check if required environment variables are present
const requiredVars = ['MONGODB_URI', 'SESSION_SECRET'];
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.log('❌ Missing environment variables:', missingVars);
} else {
  console.log('✅ All required environment variables are present');
}

console.log('✅ Test script completed successfully');