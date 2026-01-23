import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { FaHeart, FaTrash } from 'react-icons/fa';
import Loader from '../components/Loader';

const MyListPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myList, setMyList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadMyList();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadMyList = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('my_list')
        .select('*')
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });

      if (error) throw error;
      setMyList(data || []);
    } catch (error) {
      console.error('Error loading list:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromList = async (id) => {
    try {
      const { error } = await supabase
        .from('my_list')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setMyList(myList.filter(item => item.id !== id));
    } catch (error) {
      alert('Error removing from list: ' + error.message);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] text-white flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-cyan-500 mb-6">
            🍑 Login to View Your List
          </h1>
          <p className="text-gray-400 mb-8">Sign in to save your favorite anime</p>
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
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-cyan-500 mb-2 flex items-center gap-3">
          <FaHeart className="text-red-500" /> My List
        </h1>
        <p className="text-gray-400 mb-8">{myList.length} anime in your list</p>

        {myList.length === 0 ? (
          <div className="text-center py-20">
            <FaHeart className="text-6xl text-gray-600 mx-auto mb-6" />
            <p className="text-gray-400 text-xl mb-6">Your list is empty</p>
            <Link
              to="/home"
              className="px-8 py-4 bg-gradient-to-r from-violet-500 to-cyan-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-violet-500/50 transition-all inline-block"
            >
              Browse Anime 🍑
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {myList.map((item) => (
              <div
                key={item.id}
                className="bg-[#1a1a2e] rounded-xl overflow-hidden border border-violet-500/20 hover:border-violet-500/40 transition-all group relative"
              >
                <Link to={`/anime/${item.anime_id}`}>
                  <img
                    src={item.anime_image}
                    alt={item.anime_title}
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-3">
                    <h3 className="font-bold text-sm line-clamp-2">
                      {item.anime_title}
                    </h3>
                  </div>
                </Link>
                <button
                  onClick={() => removeFromList(item.id)}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <FaTrash className="text-sm" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyListPage;
