import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { Copy, Check, ArrowLeft } from 'lucide-react';
import Loader from '../components/Loader';

const PublicProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyUserId = () => {
    navigator.clipboard.writeText(userId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <Loader className="h-screen" />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] text-white flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-cyan-500 mb-4">
            User Not Found
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-xl font-bold hover:shadow-lg hover:shadow-violet-500/50 transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white pt-24 pb-12 px-6">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-all"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-cyan-500 mb-12 text-center">
          User Profile 🍑
        </h1>

        <div className="bg-[#1a1a2e] rounded-2xl p-8 border border-violet-500/20">
          <div className="flex justify-center mb-8">
            <div className="w-32 h-32 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 p-1">
              <div className="w-full h-full rounded-full bg-[#16213e] flex items-center justify-center overflow-hidden">
                {profile.avatar_url ? (
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

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Username
              </label>
              <div className="p-4 rounded-xl bg-[#16213e] text-white text-lg text-center">
                {profile.username || 'No username'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                User ID
              </label>
              <div className="flex items-center gap-3">
                <div className="flex-1 p-4 rounded-xl bg-[#16213e] text-white font-mono text-sm overflow-hidden text-ellipsis">
                  {userId}
                </div>
                <button
                  onClick={copyUserId}
                  className="p-4 bg-violet-500/20 rounded-xl hover:bg-violet-500/30 transition-all"
                >
                  {copied ? <Check size={20} className="text-green-400" /> : <Copy size={20} />}
                </button>
              </div>
              {copied && (
                <p className="text-green-400 text-sm mt-2">Copied to clipboard! ✓</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfilePage;
