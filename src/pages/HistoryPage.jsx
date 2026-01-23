import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { FaHistory, FaTrash } from 'react-icons/fa';
import Loader from '../components/Loader';

const HistoryPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadHistory();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('watch_history')
        .select('id, anime_id, anime_title, anime_image, episode_number, last_watched_at')
        .eq('user_id', user.id)
        .order('last_watched_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      console.log('History data:', data); // Debug
      setHistory(data || []);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    if (!window.confirm('Clear all watch history?')) return;

    try {
      const { error } = await supabase
        .from('watch_history')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      setHistory([]);
    } catch (error) {
      alert('Error clearing history: ' + error.message);
    }
  };

  const deleteItem = async (id) => {
    try {
      const { error } = await supabase
        .from('watch_history')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setHistory(history.filter(item => item.id !== id));
    } catch (error) {
      alert('Error deleting: ' + error.message);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] text-white flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-cyan-500 mb-6">
            🍑 Login to View History
          </h1>
          <p className="text-gray-400 mb-8">Sign in to track your watch history</p>
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-cyan-500 mb-2 flex items-center gap-3">
              <FaHistory /> Watch History
            </h1>
            <p className="text-gray-400">{history.length} episodes watched</p>
          </div>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all flex items-center gap-2"
            >
              <FaTrash /> Clear All
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-20">
            <FaHistory className="text-6xl text-gray-600 mx-auto mb-6" />
            <p className="text-gray-400 text-xl mb-6">No watch history yet</p>
            <p className="text-sm text-gray-500 mb-6">Watch an anime to see it here!</p>
            <Link
              to="/home"
              className="px-8 py-4 bg-gradient-to-r from-violet-500 to-cyan-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-violet-500/50 transition-all inline-block"
            >
              Start Watching 🍑
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item.id}
                className="bg-[#1a1a2e] rounded-xl p-4 border border-violet-500/20 hover:border-violet-500/40 transition-all flex gap-4 items-center group"
              >
                <Link to={`/anime/${item.anime_id}`} className="flex-shrink-0">
                  <img
                    src={item.anime_image || '/placeholder.png'}
                    alt={item.anime_title}
                    className="w-20 h-28 object-cover rounded-lg"
                  />
                </Link>
                
                <div className="flex-1">
                  <Link to={`/anime/${item.anime_id}`}>
                    <h3 className="font-bold text-lg mb-1 hover:text-violet-400 transition-colors line-clamp-1">
                      {item.anime_title}
                    </h3>
                  </Link>
                  <p className="text-sm text-violet-400">
                    Episode {item.episode_number}
                  </p>
                </div>

                <button
                  onClick={() => deleteItem(item.id)}
                  className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all opacity-0 group-hover:opacity-100"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
