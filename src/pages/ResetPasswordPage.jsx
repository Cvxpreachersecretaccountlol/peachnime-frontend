import { useState } from 'react';
import { supabase } from '../config/supabase';
import { useNavigate } from 'react-router-dom';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    if (password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      alert('Password updated successfully! 🍑');
      navigate('/auth');
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-cyan-500 mb-8 text-center">
          🍑 Reset Password
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-[#1a1a2e] rounded-xl p-4 border border-violet-500/20">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full p-3 rounded-xl border-2 border-violet-500/30 bg-[#16213e] text-white focus:border-violet-500 outline-none"
              placeholder="••••••••"
            />
          </div>

          <div className="bg-[#1a1a2e] rounded-xl p-4 border border-violet-500/20">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full p-3 rounded-xl border-2 border-violet-500/30 bg-[#16213e] text-white focus:border-violet-500 outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full p-4 bg-gradient-to-r from-violet-500 to-cyan-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-violet-500/50 transition-all disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Reset Password 🍑'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
