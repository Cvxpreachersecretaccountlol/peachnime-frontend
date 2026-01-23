import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabase';
import { useNavigate } from 'react-router-dom';
import LoginButton from '../components/LoginButton';

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    username: '',
    avatar_url: '',
    preferred_language: 'sub'
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.log('Profile not found, creating new one');
    }
  };

  const updateProfile = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: profile.username,
          avatar_url: profile.avatar_url,
          preferred_language: profile.preferred_language,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      alert('Profile updated! 🍑');
    } catch (error) {
      alert('Error updating profile: ' + error.message);
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] text-white flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-cyan-500 mb-6">
            🍑 Login to View Profile
          </h1>
          <p className="text-gray-400 mb-8">Sign in to customize your profile and save your preferences</p>
          <LoginButton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-cyan-500 mb-8">
          🍑 Profile Settings
        </h1>

        <div className="bg-[#1a1a2e] rounded-2xl p-6 mb-6 border border-violet-500/20">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Profile Picture URL
          </label>
          <input
            type="url"
            placeholder="https://example.com/avatar.jpg"
            value={profile.avatar_url}
            onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
            className="w-full p-3 rounded-xl border-2 border-violet-500/30 bg-[#16213e] text-white focus:border-violet-500 outline-none mb-4"
          />
          {profile.avatar_url && (
            <img
              src={profile.avatar_url}
              alt="Avatar preview"
              className="w-24 h-24 rounded-full object-cover border-2 border-violet-500"
            />
          )}
        </div>

        <div className="bg-[#1a1a2e] rounded-2xl p-6 mb-6 border border-violet-500/20">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Username
          </label>
          <input
            type="text"
            placeholder="Your username"
            value={profile.username}
            onChange={(e) => setProfile({ ...profile, username: e.target.value })}
            className="w-full p-3 rounded-xl border-2 border-violet-500/30 bg-[#16213e] text-white focus:border-violet-500 outline-none"
          />
        </div>

        <div className="bg-[#1a1a2e] rounded-2xl p-6 mb-6 border border-violet-500/20">
          <label className="block text-sm font-medium text-gray-300 mb-4">
            Preferred Language
          </label>
          <div className="flex gap-4">
            <button
              onClick={() => setProfile({ ...profile, preferred_language: 'sub' })}
              className={`flex-1 p-4 rounded-xl font-bold transition-all ${
                profile.preferred_language === 'sub'
                  ? 'bg-gradient-to-r from-violet-500 to-cyan-500 text-white'
                  : 'bg-[#16213e] text-gray-400 hover:bg-violet-500/10'
              }`}
            >
              Subbed
            </button>
            <button
              onClick={() => setProfile({ ...profile, preferred_language: 'dub' })}
              className={`flex-1 p-4 rounded-xl font-bold transition-all ${
                profile.preferred_language === 'dub'
                  ? 'bg-gradient-to-r from-violet-500 to-cyan-500 text-white'
                  : 'bg-[#16213e] text-gray-400 hover:bg-violet-500/10'
              }`}
            >
              Dubbed
            </button>
          </div>
        </div>

        <div className="bg-[#1a1a2e] rounded-2xl p-6 mb-6 border border-violet-500/20">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email
          </label>
          <input
            type="email"
            value={user.email}
            disabled
            className="w-full p-3 rounded-xl border-2 border-violet-500/30 bg-[#16213e] text-gray-500 cursor-not-allowed"
          />
        </div>

        <button
          onClick={updateProfile}
          disabled={loading}
          className="w-full p-4 bg-gradient-to-r from-violet-500 to-cyan-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-violet-500/50 transition-all disabled:opacity-50 mb-4"
        >
          {loading ? 'Saving...' : 'Save Profile 🍑'}
        </button>

        <button
          onClick={() => {
            signOut();
            navigate('/home');
          }}
          className="w-full p-4 bg-red-500/20 text-red-400 rounded-xl font-bold hover:bg-red-500/30 transition-all"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
