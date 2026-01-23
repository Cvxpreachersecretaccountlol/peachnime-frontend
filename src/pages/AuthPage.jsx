import { useState } from 'react';
import { supabase } from '../config/supabase';
import { useNavigate } from 'react-router-dom';
import TurnstileWrapper from '../components/TurnstileWrapper';

const AuthPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTurnstileVerify = () => {
    setVerified(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!verified) {
      alert('Please complete the verification');
      return;
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;
        navigate('/home');
      } else {
        // Sign up
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              username: formData.username
            },
            emailRedirectTo: `${window.location.origin}/home`
          }
        });

        if (signUpError) throw signUpError;

        // Don't create profile here - let the trigger handle it
        // Show verification message
        setShowVerificationMessage(true);
        setFormData({
          username: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
        setVerified(false);
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      alert('Please enter your email address');
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      alert('Password reset email sent! Check your inbox 📧');
    } catch (error) {
      alert(error.message);
    }
  };

  if (showVerificationMessage) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#1a1a2e] rounded-xl p-8 border border-violet-500/20 text-center">
          <div className="text-6xl mb-6">📧</div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-cyan-500 mb-4">
            Verify Your Email
          </h1>
          <p className="text-gray-300 mb-6">
            We've sent a verification email to <strong>{formData.email || 'your email'}</strong>
          </p>
          <p className="text-gray-400 text-sm mb-8">
            Please check your inbox and click the verification link to activate your account. 
            Don't forget to check your spam folder!
          </p>
          <button
            onClick={() => {
              setShowVerificationMessage(false);
              setIsLogin(true);
            }}
            className="w-full p-4 bg-gradient-to-r from-violet-500 to-cyan-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-violet-500/50 transition-all"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-cyan-500 mb-8 text-center">
          {isLogin ? '🍑 Login' : '🍑 Sign Up'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="bg-[#1a1a2e] rounded-xl p-4 border border-violet-500/20">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-xl border-2 border-violet-500/30 bg-[#16213e] text-white focus:border-violet-500 outline-none"
                placeholder="Choose a username"
              />
            </div>
          )}

          <div className="bg-[#1a1a2e] rounded-xl p-4 border border-violet-500/20">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-xl border-2 border-violet-500/30 bg-[#16213e] text-white focus:border-violet-500 outline-none"
              placeholder="your@email.com"
            />
          </div>

          <div className="bg-[#1a1a2e] rounded-xl p-4 border border-violet-500/20">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full p-3 rounded-xl border-2 border-violet-500/30 bg-[#16213e] text-white focus:border-violet-500 outline-none"
              placeholder="••••••••"
            />
          </div>

          {!isLogin && (
            <div className="bg-[#1a1a2e] rounded-xl p-4 border border-violet-500/20">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full p-3 rounded-xl border-2 border-violet-500/30 bg-[#16213e] text-white focus:border-violet-500 outline-none"
                placeholder="••••••••"
              />
            </div>
          )}

          {!verified ? (
            <div className="bg-[#1a1a2e] rounded-xl p-4 border border-violet-500/20">
              <p className="text-sm text-gray-300 mb-4 text-center">Verify you're human 🍑</p>
              <TurnstileWrapper onVerify={handleTurnstileVerify} />
            </div>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="w-full p-4 bg-gradient-to-r from-violet-500 to-cyan-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-violet-500/50 transition-all disabled:opacity-50"
            >
              {loading ? 'Processing...' : isLogin ? 'Login 🍑' : 'Sign Up 🍑'}
            </button>
          )}

          {isLogin && (
            <button
              type="button"
              onClick={handleForgotPassword}
              className="w-full text-sm text-violet-400 hover:text-violet-300 transition-all"
            >
              Forgot Password?
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setVerified(false);
              setShowVerificationMessage(false);
            }}
            className="w-full text-sm text-gray-400 hover:text-white transition-all"
          >
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
