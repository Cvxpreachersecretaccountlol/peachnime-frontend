import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginButton = () => {
  const { user, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  if (user) {
    // User is logged in - show profile button
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

  // User is logged out - show login button
  return (
    <button
      onClick={signInWithGoogle}
      className="px-6 py-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-violet-500/50 transition-all"
    >
      <span className="hidden sm:inline">Sign in</span>
      <span className="sm:hidden">Login</span>
    </button>
  );
};

export default LoginButton;
