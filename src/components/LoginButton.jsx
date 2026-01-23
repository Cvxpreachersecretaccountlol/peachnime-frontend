import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import TurnstileWrapper from './TurnstileWrapper';

const LoginButton = () => {
  const { user, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [showTurnstile, setShowTurnstile] = useState(false);

  const handleLoginClick = () => {
    setShowTurnstile(true);
  };

  const handleTurnstileVerify = (token) => {
    signInWithGoogle(token);
    setShowTurnstile(false);
  };

  if (user) {
    return (
      <button
        onClick={() => navigate('/profile')}
        className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-violet-500/50 transition-all"
      >
        <span className="hidden sm:inline">Profile</span>
        <span className="text-xl">🍑</span>
      </button>
    );
  }

  if (showTurnstile) {
    return (
      <div className="flex flex-col items-center gap-4 p-4 bg-[#1a1a2e] rounded-xl border border-violet-500/20">
        <p className="text-sm text-gray-300 mb-2">Verify you're human 🍑</p>
        <TurnstileWrapper onVerify={handleTurnstileVerify} />
        <button
          onClick={() => setShowTurnstile(false)}
          className="text-sm text-gray-400 hover:text-white transition-all"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleLoginClick}
      className="px-6 py-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-violet-500/50 transition-all"
    >
      <span className="hidden sm:inline">Sign in</span>
      <span className="sm:hidden">Login</span>
    </button>
  );
};

export default LoginButton;
