import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabase';
import { useNavigate } from 'react-router-dom';
import { Camera, Edit2, Copy, Check, LogOut } from 'lucide-react';

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchProfile();
  }, [user, navigate]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
      setNewUsername(data.username);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      await fetchProfile();
      alert('Profile picture updated! 🍑');
    } catch (error) {
      alert('Error uploading avatar: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleUsernameUpdate = async () => {
    if (!newUsername || newUsername === profile.username) {
      setIsEditingUsername(false);
      return;
    }

    if (newUsername.trim().length < 3) {
      alert('Username must be at least 3 characters');
      return;
    }

    try {
      const { data: existing } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', newUsername)
        .neq('id', user.id)
        .maybeSingle();

      if (existing) {
        alert('Username claimed, change username');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ username: newUsername })
        .eq('id', user.id);

      if (error) throw error;

      await fetchProfile();
      setIsEditingUsername(false);
      alert('Username updated! 🍑');
    } catch (error) {
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
    <div className="min-h-screen bg-[#0a0a1a] text-white pt-24 pb-12 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-cyan-500 mb-12 text-center">
          Profile 🍑
        </h1>

        <div className="bg-[#1a1a2e] rounded-2xl p-8 border border-violet-500/20">
          <div className="flex justify-center mb-8">
            <div className="relative">
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
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 w-10 h-10 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full flex items-center justify-center cursor-pointer hover:shadow-lg hover:shadow-violet-500/50 transition-all"
              >
                <Camera size={20} />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
              {uploading && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <div className="text-sm">Uploading...</div>
                </div>
              )}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Username
            </label>
            <div className="flex items-center gap-3">
              {isEditingUsername ? (
                <>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="flex-1 p-3 rounded-xl border-2 border-violet-500/30 bg-[#16213e] text-white focus:border-violet-500 outline-none"
                    placeholder="Enter new username"
                  />
                  <button
                    onClick={handleUsernameUpdate}
                    className="px-6 py-3 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-xl font-bold hover:shadow-lg hover:shadow-violet-500/50 transition-all"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingUsername(false);
                      setNewUsername(profile.username);
                    }}
                    className="px-6 py-3 bg-gray-700 rounded-xl font-bold hover:bg-gray-600 transition-all"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <div className="flex-1 p-3 rounded-xl bg-[#16213e] text-white text-lg">
                    {profile?.username || 'No username'}
                  </div>
                  <button
                    onClick={() => setIsEditingUsername(true)}
                    className="p-3 bg-violet-500/20 rounded-xl hover:bg-violet-500/30 transition-all"
                  >
                    <Edit2 size={20} />
                  </button>
                </>
              )}
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
  );
};

export default ProfilePage;
