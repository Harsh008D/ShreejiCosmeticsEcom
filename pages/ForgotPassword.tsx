import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Leaf } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { sendResetOTP, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    clearError();

    try {
      const result = await sendResetOTP(email);
      if (result.success) {
        setSuccess('OTP sent successfully! Please check your email.');
        setOtpSent(true);
        // Store email in sessionStorage for next step
        sessionStorage.setItem('resetEmail', email);
      } else {
        setError(result.error || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    navigate('/verify-otp');
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    clearError();

    try {
      const result = await sendResetOTP(email);
      if (result.success) {
        setSuccess('New OTP sent successfully! Please check your email.');
      } else {
        setError(result.error || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-rose-50 pt-24">
      <div className="max-w-md mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {otpSent ? 'OTP Sent Successfully!' : 'Forgot Password?'}
            </h1>
            <p className="text-gray-600">
              {otpSent 
                ? 'We\'ve sent a 6-digit OTP to your email address'
                : 'Enter your email address to receive a password reset OTP'
              }
            </p>
          </div>

          {!otpSent ? (
            /* Email Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                    placeholder="Enter your email address"
                    disabled={loading}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-red-600 text-sm flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {error}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 text-white py-3 rounded-xl font-medium hover:bg-emerald-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending OTP...
                  </>
                ) : (
                  'Send OTP'
                )}
              </button>
            </form>
          ) : (
            /* Success State */
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-green-600 text-sm flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {success}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-blue-600 text-sm">
                  <strong>Email:</strong> {email}
                </p>
                <p className="text-blue-600 text-sm mt-1">
                  <strong>OTP expires in:</strong> 15 minutes
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleContinue}
                  className="w-full bg-emerald-500 text-white py-3 rounded-xl font-medium hover:bg-emerald-600 transition-colors duration-200"
                >
                  Continue to Verify OTP
                </button>
                
                <button
                  onClick={handleResendOTP}
                  disabled={loading}
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Resend OTP'}
                </button>
              </div>
            </div>
          )}

          {/* Back to Login */}
          <div className="text-center mt-6">
            <Link
              to="/login"
              className="text-gray-500 hover:text-emerald-600 text-sm transition-colors duration-200 flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 