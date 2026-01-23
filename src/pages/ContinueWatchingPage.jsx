import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { FaPlay, FaTrash, FaClock } from 'react-icons/fa';
import Loader from '../components/Loader';

const ContinueWatchingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [watchHistory, setWatchHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadWatchHistory();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadWatchHistory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('watch_history')
        .select('*')
        .eq('user_id', user.id)
        .order('last_watched_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setWatchHistory(data || []);
    } catch (error) {
      console.error('Error loading watch history:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteFromHistory = async (id) => {
    try {
      const { error } = await supabase
        .from('watch_history')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setWatchHistory(watchHistory.filter(item => item.id !== id));
    } catch (error) {
      alert('Error removing from history: ' + error.message);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = (watched, total) => {
    if (!total) return 0;
    return Math.round((watched / total) * 100);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] text-white flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-cyan-500 mb-6">
            🍑 Login to View Continue Watching
          </h1>
          <p className="text-gray-400 mb-8">Sign in to track your progress</p>
          <button
            onClick={() => navigate('/auth')}
            className="px-8 py-4 bg-gradient-to-r from-violet-500 to-cyan-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-violet-500/50 transition-all"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <Loader className="h-screen" />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white p-6 pt-20">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-cyan-500 mb-8">
          🍑 Continue Watching
        </h1>

        {watchHistory.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl mb-6">No watch history yet</p>
            <Link
              to="/home"
              className="px-8 py-4 bg-gradient-to-r from-violet-500 to-cyan-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-violet-500/50 transition-all inline-block"
            >
              Start Watching 🍑
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {watchHistory.map((item) => (
              <div
                key={item.id}
                className="bg-[#1a1a2e] rounded-xl overflow-hidden border border-violet-500/20 hover:border-violet-500/40 transition-all group"
              >
                {/* Anime Image */}
                <div className="relative">
                  <img
                    src={item.anime_image}
                    alt={item.anime_title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Link
                      to={`/watch/${item.anime_id}?ep=${item.episode_number}`}
                      className="px-6 py-3 bg-gradient-to-r from-violet-500 to-cyan-500 text-white rounded-xl font-bold flex items-center gap-2"
                    >
                      <FaPlay /> Continue
                    </Link>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-cyan-500"
                      style={{ width: `${getProgress(item.time_watched, item.total_duration)}%` }}
                    />
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 line-clamp-1">
                    {item.anime_title}
                  </h3>
                  <p className="text-sm text-gray-400 mb-3">
                    Episode {item.episode_number}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <FaClock />
                      {formatTime(item.time_watched)} / {formatTime(item.total_duration)}
                    </span>
                    <span>{getProgress(item.time_watched, item.total_duration)}%</span>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      to={`/watch/${item.anime_id}?ep=${item.episode_number}`}
                      className="flex-1 py-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white rounded-lg font-bold text-center text-sm hover:shadow-lg hover:shadow-violet-500/50 transition-all"
                    >
                      Continue
                    </Link>
                    <button
                      onClick={() => deleteFromHistory(item.id)}
                      className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContinueWatchingPage;
