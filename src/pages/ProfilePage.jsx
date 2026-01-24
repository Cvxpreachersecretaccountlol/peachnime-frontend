import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabase';
import { useNavigate } from 'react-router-dom';
import { Edit2, Copy, Check, LogOut, X } from 'lucide-react';

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUsernamePopup, setShowUsernamePopup] = useState(false);
  const [oldUsername, setOldUsername] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchProfile();
  }, [user, navigate]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Fetch error:', error);
        throw error;
      }
      
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const openUsernamePopup = () => {
    setOldUsername('');
    setNewUsername('');
    setShowUsernamePopup(true);
  };

  const handleUsernameUpdate = async () => {
    if (!oldUsername || !newUsername) {
      alert('Please fill in both fields');
      return;
    }

    if (oldUsername !== profile.username) {
      alert('Old username is incorrect');
      return;
    }

    const trimmedUsername = newUsername.trim();

    if (trimmedUsername.length < 3) {
      alert('Username must be at least 3 characters');
      return;
    }

    if (trimmedUsername === profile.username) {
      alert('New username is the same as old username');
      return;
    }

    try {
      const { data: existing } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', trimmedUsername)
        .neq('id', user.id)
        .maybeSingle();

      if (existing) {
        alert('Username claimed, change username');
        return;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ username: trimmedUsername })
        .eq('id', user.id);

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }

      await fetchProfile();
      setShowUsernamePopup(false);
      alert('Username updated! 🍑');
    } catch (error) {
      console.error('Error updating username:', error);
      alert('Error updating username: ' + error.message);
    }
  };

  const copyUserId = () => {
    navigator.clipboard.writeText(user.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] text-white flex items-center justify-center">
        <div className="text-2xl">Loading... 🍑</div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#0a0a1a] text-white pt-24 pb-12 px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-cyan-500 mb-12 text-center">
            Profile 🍑
          </h1>

          <div className="bg-[#1a1a2e] rounded-2xl p-8 border border-violet-500/20">
            <div className="flex justify-center mb-8">
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 p-1">
                <div className="w-full h-full rounded-full bg-[#16213e] flex items-center justify-center overflow-hidden">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-5xl">🍑</span>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Username
              </label>
              <div className="flex items-center gap-3">
                <div className="flex-1 p-3 rounded-xl bg-[#16213e] text-white text-lg">
                  {profile?.username || 'No username'}
                </div>
                <button
                  onClick={openUsernamePopup}
                  className="p-3 bg-violet-500/20 rounded-xl hover:bg-violet-500/30 transition-all"
                >
                  <Edit2 size={20} />
                </button>
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                User ID
              </label>
              <div className="flex items-center gap-3">
                <div className="flex-1 p-3 rounded-xl bg-[#16213e] text-white font-mono text-sm overflow-hidden text-ellipsis">
                  {user?.id}
                </div>
                <button
                  onClick={copyUserId}
                  className="p-3 bg-violet-500/20 rounded-xl hover:bg-violet-500/30 transition-all"
                >
                  {copied ? <Check size={20} className="text-green-400" /> : <Copy size={20} />}
                </button>
              </div>
              {copied && (
                <p className="text-green-400 text-sm mt-2">Copied to clipboard! ✓</p>
              )}
            </div>

            <button
              onClick={handleSignOut}
              className="w-full p-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {showUsernamePopup && (
        <div 
          className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4"
          onClick={() => setShowUsernamePopup(false)}
        >
          <div 
            className="bg-[#1a1a2e] rounded-2xl p-6 border border-violet-500/20 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold text-white">Change Username</h3>
              <button
                onClick={() => setShowUsernamePopup(false)}
                className="p-1 hover:bg-violet-500/20 rounded-lg transition-all"
              >
                <X size={24} className="text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Old Username
                </label>
                <input
                  type="text"
                  value={oldUsername}
                  onChange={(e) => setOldUsername(e.target.value)}
                  placeholder="Enter your current username"
                  className="w-full p-3 rounded-xl border-2 border-violet-500/30 bg-[#16213e] text-white focus:border-violet-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  New Username
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Enter your new username"
                  className="w-full p-3 rounded-xl border-2 border-violet-500/30 bg-[#16213e] text-white focus:border-violet-500 outline-none"
                />
              </div>

              <button
                onClick={handleUsernameUpdate}
                className="w-full p-4 bg-gradient-to-r from-violet-500 to-cyan-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-violet-500/50 transition-all"
              >
                Confirm Change
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfilePage;
