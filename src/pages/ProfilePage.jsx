import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabase';
import { useNavigate } from 'react-router-dom';
import LoginButton from '../components/LoginButton';

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState({
    username: '',
    avatar_url: '',
    last_username_change: null
  });
  const [canChangeUsername, setCanChangeUsername] = useState(true);
  const [cooldownTime, setCooldownTime] = useState('');

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  useEffect(() => {
    if (profile.last_username_change) {
      checkCooldown();
      const interval = setInterval(checkCooldown, 1000);
      return () => clearInterval(interval);
    }
  }, [profile.last_username_change]);

  const checkCooldown = () => {
    if (!profile.last_username_change) {
      setCanChangeUsername(true);
      return;
    }

    const lastChange = new Date(profile.last_username_change);
    const now = new Date();
    const timeDiff = now - lastChange;
    const oneDayMs = 24 * 60 * 60 * 1000;

    if (timeDiff >= oneDayMs) {
      setCanChangeUsername(true);
      setCooldownTime('');
    } else {
      setCanChangeUsername(false);
      const remainingMs = oneDayMs - timeDiff;
      const hours = Math.floor(remainingMs / (60 * 60 * 1000));
      const minutes = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
      const seconds = Math.floor((remainingMs % (60 * 1000)) / 1000);
      setCooldownTime(`${hours}h ${minutes}m ${seconds}s`);
    }
  };

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
      console.log('Profile not found');
    }
  };

  const uploadAvatar = async (event) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile({ ...profile, avatar_url: data.publicUrl });
      alert('Avatar updated! 🍑');
    } catch (error) {
      alert('Error uploading avatar: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const updateProfile = async () => {
    if (!canChangeUsername) {
      alert(`You can change your username again in ${cooldownTime}`);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: profile.username,
          last_username_change: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      alert('Username updated! 🍑 (You can change it again in 24 hours)');
      loadProfile();
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
          <p className="text-gray-400 mb-8">Sign in to customize your profile</p>
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

        {/* Avatar Upload */}
        <div className="bg-[#1a1a2e] rounded-2xl p-6 mb-6 border border-violet-500/20">
          <label className="block text-sm font-medium text-gray-300 mb-4">
            Profile Picture
          </label>
          <div className="flex items-center gap-6">
            <div className="relative">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover border-4 border-violet-500"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 flex items-center justify-center text-4xl">
                  🍑
                </div>
              )}
            </div>
            <label className="cursor-pointer px-6 py-3 bg-gradient-to-r from-violet-500 to-cyan-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-violet-500/50 transition-all">
              {uploading ? 'Uploading...' : 'Choose Photo'}
              <input
                type="file"
                accept="image/*"
                onChange={uploadAvatar}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Username */}
        <div className="bg-[#1a1a2e] rounded-2xl p-6 mb-6 border border-violet-500/20">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Username {!canChangeUsername && (
              <span className="text-red-400 text-xs ml-2">
                (Cooldown: {cooldownTime})
              </span>
            )}
          </label>
          <input
            type="text"
            placeholder="Your username"
            value={profile.username || ''}
            onChange={(e) => setProfile({ ...profile, username: e.target.value })}
            disabled={!canChangeUsername}
            className={`w-full p-3 rounded-xl border-2 ${
              canChangeUsername 
                ? 'border-violet-500/30 bg-[#16213e]' 
                : 'border-red-500/30 bg-[#16213e] opacity-50 cursor-not-allowed'
            } text-white focus:border-violet-500 outline-none`}
          />
          {!canChangeUsername && (
            <p className="text-xs text-red-400 mt-2">
              You can change your username again in {cooldownTime}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="bg-[#1a1a2e] rounded-2xl p-6 mb-6 border border-violet-500/20">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email
          </label>
          <input
            type="email"
            value={user.email || ''}
            disabled
            className="w-full p-3 rounded-xl border-2 border-violet-500/30 bg-[#16213e] text-gray-500 cursor-not-allowed"
          />
        </div>

        <button
          onClick={updateProfile}
          disabled={loading || !canChangeUsername}
          className="w-full p-4 bg-gradient-to-r from-violet-500 to-cyan-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-violet-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4"
        >
          {loading ? 'Saving...' : 'Save Username 🍑'}
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
