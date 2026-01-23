import { useState } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from '../context/AuthContext';
import { FaReply, FaTrash, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const Comment = ({ comment, animeId, episodeNumber, onReplyAdded, onDelete }) => {
  const { user } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadReplies = async () => {
    if (showReplies) {
      setShowReplies(false);
      return;
    }

    setLoadingReplies(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('parent_comment_id', comment.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setReplies(data || []);
      setShowReplies(true);
    } catch (error) {
      console.error('Error loading replies:', error);
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!user || !replyText.trim()) return;

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
          comment_text: replyText,
          parent_comment_id: comment.id
        })
        .select()
        .single();

      if (error) throw error;

      setReplies([...replies, data]);
      setReplyText('');
      setShowReplyForm(false);
      setShowReplies(true);
      if (onReplyAdded) onReplyAdded();
    } catch (error) {
      alert('Error posting reply: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this comment?')) return;

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', comment.id);

      if (error) throw error;
      if (onDelete) onDelete(comment.id);
    } catch (error) {
      alert('Error deleting comment: ' + error.message);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className={`${comment.parent_comment_id ? 'ml-8 md:ml-12' : ''} mb-4`}>
      <div className="bg-[#1a1a2e] rounded-xl p-4 border border-violet-500/20">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {comment.avatar_url ? (
              <img
                src={comment.avatar_url}
                alt={comment.username}
                className="w-10 h-10 rounded-full object-cover border-2 border-violet-500"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 flex items-center justify-center text-lg">
                🍑
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-violet-400">{comment.username}</span>
              <span className="text-xs text-gray-500">{formatTime(comment.created_at)}</span>
            </div>
            <p className="text-gray-300 text-sm mb-2">{comment.comment_text}</p>

            <div className="flex items-center gap-4 text-xs">
              {user && (
                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="text-violet-400 hover:text-violet-300 flex items-center gap-1"
                >
                  <FaReply /> Reply
                </button>
              )}
              
              {user && user.id === comment.user_id && (
                <button
                  onClick={handleDelete}
                  className="text-red-400 hover:text-red-300 flex items-center gap-1"
                >
                  <FaTrash /> Delete
                </button>
              )}
            </div>
          </div>
        </div>

        {showReplyForm && user && (
          <form onSubmit={handleReply} className="mt-4 ml-12">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              className="w-full p-3 rounded-xl border-2 border-violet-500/30 bg-[#16213e] text-white focus:border-violet-500 outline-none resize-none"
              rows="2"
              required
            />
            <div className="flex gap-2 mt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white rounded-lg text-sm font-bold hover:shadow-lg hover:shadow-violet-500/50 transition-all disabled:opacity-50"
              >
                {submitting ? 'Posting...' : 'Post Reply'}
              </button>
              <button
                type="button"
                onClick={() => setShowReplyForm(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm hover:bg-gray-600 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {!comment.parent_comment_id && (
        <button
          onClick={loadReplies}
          className="ml-12 mt-2 text-sm text-violet-400 hover:text-violet-300 flex items-center gap-2"
        >
          {showReplies ? <FaChevronUp /> : <FaChevronDown />}
          {loadingReplies ? 'Loading...' : showReplies ? 'Hide replies' : `Show replies`}
        </button>
      )}

      {showReplies && replies.length > 0 && (
        <div className="mt-2">
          {replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              animeId={animeId}
              episodeNumber={episodeNumber}
              onDelete={(id) => setReplies(replies.filter(r => r.id !== id))}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Comment;
