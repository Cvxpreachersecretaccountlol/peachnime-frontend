import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginButton = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

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

  return (
    <button
      onClick={() => navigate('/auth')}
      className="px-6 py-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-violet-500/50 transition-all"
    >
      <span className="hidden sm:inline">Sign in</span>
      <span className="sm:hidden">Login</span>
    </button>
  );
};

export default LoginButton;
