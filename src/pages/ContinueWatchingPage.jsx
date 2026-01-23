import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { FaPlay, FaClock } from 'react-icons/fa';
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
      // Get most recent episode for each anime
      const { data, error } = await supabase
        .from('watch_history')
        .select('*')
        .eq('user_id', user.id)
        .order('last_watched_at', { ascending: false });

      if (error) throw error;

      // Group by anime_id and keep only most recent
      const uniqueAnime = [];
      const seenIds = new Set();
      
      data?.forEach(item => {
        if (!seenIds.has(item.anime_id)) {
          seenIds.add(item.anime_id);
          uniqueAnime.push(item);
        }
      });

      setWatchHistory(uniqueAnime);
    } catch (error) {
      console.error('Error loading watch history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] text-white flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-cyan-500 mb-6">
            🍑 Login to Continue Watching
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {watchHistory.map((item) => (
              <div
                key={item.id}
                className="bg-[#1a1a2e] rounded-xl overflow-hidden border border-violet-500/20 hover:border-violet-500/40 transition-all group relative"
              >
                <Link to={`/watch/${item.anime_id}?ep=${item.episode_number}`}>
                  <img
                    src={item.anime_image}
                    alt={item.anime_title}
                    className="w-full h-64 object-cover"
                  />
                  
                  {/* Time Left Off Badge */}
                  <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 text-xs">
                    <FaClock className="text-violet-400" />
                    <span>{formatTime(item.time_watched)}</span>
                  </div>

                  {/* Play overlay on hover */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <FaPlay className="text-4xl text-white" />
                  </div>
                </Link>

                <div className="p-3">
                  <h3 className="font-bold text-sm line-clamp-2 mb-1">
                    {item.anime_title}
                  </h3>
                  <p className="text-xs text-gray-400">
                    EP {item.episode_number}
                  </p>
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
