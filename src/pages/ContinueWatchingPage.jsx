import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { FaPlay, FaClock, FaTrash } from 'react-icons/fa';
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

      // Get one entry per anime (most recent)
      const uniqueAnime = [];
      const seenIds = new Set();
      
      data?.forEach(item => {
        if (!seenIds.has(item.anime_id)) {
          seenIds.add(item.anime_id);
          uniqueAnime.push(item);
        }
      });

      console.log('Continue watching data:', uniqueAnime); // Debug
      setWatchHistory(uniqueAnime);
    } catch (error) {
      console.error('Error loading watch history:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteFromHistory = async (animeId) => {
    try {
      const { error } = await supabase
        .from('watch_history')
        .delete()
        .eq('user_id', user.id)
        .eq('anime_id', animeId);

      if (error) throw error;
      setWatchHistory(watchHistory.filter(item => item.anime_id !== animeId));
    } catch (error) {
      alert('Error removing: ' + error.message);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0:00';
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
            <FaPlay className="text-6xl text-gray-600 mx-auto mb-6" />
            <p className="text-gray-400 text-xl mb-6">No watch history yet</p>
            <p className="text-sm text-gray-500 mb-6">Start watching anime to see your progress here!</p>
            <Link
              to="/home"
              className="px-8 py-4 bg-gradient-to-r from-violet-500 to-cyan-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-violet-500/50 transition-all inline-block"
            >
              Start Watching 🍑
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {watchHistory.map((item) => (
              <div
                key={item.id}
                className="bg-[#1a1a2e] rounded-xl p-4 border border-violet-500/20 hover:border-violet-500/40 transition-all flex gap-4 items-center group"
              >
                <Link to={`/watch/${item.anime_id}?ep=${item.episode_number}`} className="flex-shrink-0">
                  <img
                    src={item.anime_image || '/placeholder.png'}
                    alt={item.anime_title}
                    className="w-20 h-28 object-cover rounded-lg"
                  />
                </Link>
                
                <div className="flex-1">
                  <Link to={`/watch/${item.anime_id}?ep=${item.episode_number}`}>
                    <h3 className="font-bold text-lg mb-1 hover:text-violet-400 transition-colors line-clamp-1">
                      {item.anime_title}
                    </h3>
                  </Link>
                  <p className="text-sm text-violet-400 mb-1">
                    Episode {item.episode_number}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <FaClock className="text-violet-400" />
                    Resume at {formatTime(item.time_watched)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/watch/${item.anime_id}?ep=${item.episode_number}`}
                    className="px-4 py-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white rounded-lg font-bold hover:shadow-lg hover:shadow-violet-500/50 transition-all flex items-center gap-2"
                  >
                    <FaPlay /> Resume
                  </Link>
                  <button
                    onClick={() => deleteFromHistory(item.anime_id)}
                    className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <FaTrash />
                  </button>
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
