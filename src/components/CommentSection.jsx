import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from '../context/AuthContext';
import Comment from './Comment';
import { FaComments, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const CommentSection = ({ animeId, episodeNumber }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (expanded) {
      loadComments();
    }
  }, [animeId, episodeNumber, expanded]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('anime_id', animeId)
        .eq('episode_number', episodeNumber)
        .is('parent_comment_id', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!commentText.trim()) return;

    setSubmitting(true);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', user.id)
        .single();

      const { data, error } = await supabase
        .from('comments')
        .insert({
          anime_id: animeId,
          episode_number: episodeNumber,
          user_id: user.id,
          username: profile?.username || user.email,
          avatar_url: profile?.avatar_url,
          comment_text: commentText,
          parent_comment_id: null
        })
        .select()
        .single();

      if (error) throw error;

      setComments([data, ...comments]);
      setCommentText('');
    } catch (error) {
      alert('Error posting comment: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-8 mb-8 max-w-4xl mx-auto px-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full bg-[#1a1a2e] rounded-xl p-4 border border-violet-500/20 hover:border-violet-500/40 transition-all flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <FaComments className="text-violet-500 text-xl" />
          <span className="font-bold text-lg text-white">
            Comments ({comments.length})
          </span>
        </div>
        {expanded ? <FaChevronUp className="text-violet-500" /> : <FaChevronDown className="text-violet-500" />}
      </button>

      {expanded && (
        <div className="mt-4">
          {user ? (
            <form onSubmit={handleSubmit} className="mb-6">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="w-full p-4 rounded-xl border-2 border-violet-500/30 bg-[#1a1a2e] text-white focus:border-violet-500 outline-none resize-none"
                rows="3"
                required
              />
              <button
                type="submit"
                disabled={submitting}
                className="mt-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-cyan-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-violet-500/50 transition-all disabled:opacity-50"
              >
                {submitting ? 'Posting...' : 'Post Comment 🍑'}
              </button>
            </form>
          ) : (
            <div className="mb-6 bg-[#1a1a2e] rounded-xl p-4 border border-violet-500/20 text-center">
              <p className="text-gray-400 mb-3">Sign in to leave a comment</p>
              <button
                onClick={() => navigate('/auth')}
                className="px-6 py-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-violet-500/50 transition-all"
              >
                Sign In
              </button>
            </div>
          )}

          {loading ? (
            <div className="text-center text-gray-400 py-8">Loading comments...</div>
          ) : comments.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              No comments yet. Be the first to comment! 🍑
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <Comment
                  key={comment.id}
                  comment={comment}
                  animeId={animeId}
                  episodeNumber={episodeNumber}
                  onReplyAdded={loadComments}
                  onDelete={(id) => setComments(comments.filter(c => c.id !== id))}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
