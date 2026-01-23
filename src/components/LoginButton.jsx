import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const LoginButton = () => {
  const { user, signIn, signUp, signOut } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = isSignUp 
      ? await signUp(email, password)
      : await signIn(email, password);

    if (error) {
      setError(error.message);
    } else {
      setShowModal(false);
      setEmail('');
      setPassword('');
    }
    setLoading(false);
  };

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-300">{user.email}</span>
        <button onClick={signOut} className="px-4 py-2 bg-red-500/20 text-red-400 rounded-full text-sm hover:bg-red-500/30 transition-all">
          Logout
        </button>
      </div>
    );
  }

  return (
    <>
      <button onClick={() => setShowModal(true)} className="px-6 py-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white rounded-full font-medium hover:shadow-lg hover:shadow-violet-500/50 transition-all">
        Login
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a2e] rounded-2xl p-8 max-w-md w-full border border-violet-500/20">
            <button onClick={() => setShowModal(false)} className="float-right text-white text-2xl hover:text-violet-500">×</button>
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-cyan-500 mb-6">
              🍑 {isSignUp ? 'Join' : 'Welcome to'} Peachnime
            </h2>
            {error && <div className="bg-red-500/20 border border-red-500 text-red-400 p-3 rounded-xl mb-4 text-sm">{error}</div>}
            <form onSubmit={handleSubmit}>
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 mb-4 rounded-xl border-2 border-violet-500/30 bg-[#16213e] text-white focus:border-violet-500 outline-none" required />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 mb-6 rounded-xl border-2 border-violet-500/30 bg-[#16213e] text-white focus:border-violet-500 outline-none" required />
              <button type="submit" disabled={loading} className="w-full p-3 bg-gradient-to-r from-violet-500 to-cyan-500 text-white rounded-xl font-bold mb-3 hover:shadow-lg hover:shadow-violet-500/50 transition-all disabled:opacity-50">
                {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Login')}
              </button>
            </form>
            <button onClick={() => setIsSignUp(!isSignUp)} className="w-full p-3 border-2 border-violet-500 text-violet-500 rounded-xl font-bold hover:bg-violet-500/10 transition-all">
              {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default LoginButton;
