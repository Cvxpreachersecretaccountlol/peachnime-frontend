import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from '../context/AuthContext';
import { Heart, MessageCircle, Send, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CommentsSection = ({ animeId, episodeNumber }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [latestComment, setLatestComment] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchComments();
    const subscription = supabase
      .channel(`comments-${animeId}-${episodeNumber}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'comments' }, 
        () => fetchComments()
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }, [animeId, episodeNumber]);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('*, comment_likes(count)')
      .eq('anime_id', animeId)
      .eq('episode_number', episodeNumber)
      .is('parent_comment_id', null)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setComments(data);
      if (data.length > 0) setLatestComment(data[0]);
    }
  };

  const fetchReplies = async (commentId) => {
    const { data } = await supabase
      .from('comments')
      .select('*, comment_likes(count)')
      .eq('parent_comment_id', commentId)
      .order('created_at', { ascending: true });
    return data || [];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!newComment.trim()) return;

    setLoading(true);
    const { data: profile } = await supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('id', user.id)
      .single();

    const { error } = await supabase.from('comments').insert([
      {
        anime_id: animeId,
        episode_number: episodeNumber,
        user_id: user.id,
        username: profile?.username || 'Anonymous',
        avatar_url: profile?.avatar_url,
        comment: newComment,
        parent_comment_id: replyTo?.id || null
      }
    ]);

    if (!error) {
      setNewComment('');
      setReplyTo(null);
      fetchComments();
    }
    setLoading(false);
  };

  const handleLike = async (commentId) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const { data: existing } = await supabase
      .from('comment_likes')
      .select()
      .eq('comment_id', commentId)
      .eq('user_id', user.id)
      .single();

    if (existing) {
      await supabase.from('comment_likes').delete().eq('id', existing.id);
      await supabase.rpc('decrement_comment_likes', { comment_id: commentId });
    } else {
      await supabase.from('comment_likes').insert({ comment_id: commentId, user_id: user.id });
      await supabase.rpc('increment_comment_likes', { comment_id: commentId });
    }
    fetchComments();
  };

  const Comment = ({ comment, isReply = false }) => {
    const [showReplies, setShowReplies] = useState(false);
    const [replies, setReplies] = useState([]);

    const loadReplies = async () => {
      const data = await fetchReplies(comment.id);
      setReplies(data);
      setShowReplies(true);
    };

    return (
      <div className={`${isReply ? 'ml-12' : ''} mb-4`}>
        <div className="flex gap-3">
          <div
            onClick={() => navigate(`/profile/${comment.user_id}`)}
            className="cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 p-0.5">
              <div className="w-full h-full rounded-full bg-[#16213e] flex items-center justify-center overflow-hidden">
                {comment.avatar_url ? (
                  <img src={comment.avatar_url} alt={comment.username} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg">🍑</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span
                onClick={() => navigate(`/profile/${comment.user_id}`)}
                className="font-semibold text-white cursor-pointer hover:text-violet-400"
              >
                {comment.username}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(comment.created_at).toLocaleDateString()}
              </span>
            </div>

            <p className="text-gray-300 mb-2">{comment.comment}</p>

            <div className="flex items-center gap-4 text-sm">
              <button
                onClick={() => handleLike(comment.id)}
                className="flex items-center gap-1 text-gray-400 hover:text-red-400 transition-all"
              >
                <Heart size={16} className={user && comment.comment_likes?.some(l => l.user_id === user.id) ? 'fill-red-400 text-red-400' : ''} />
                <span>{comment.likes || 0}</span>
              </button>

              {!isReply && (
                <button
                  onClick={() => setReplyTo(comment)}
                  className="flex items-center gap-1 text-gray-400 hover:text-violet-400 transition-all"
                >
                  <MessageCircle size={16} />
                  Reply
                </button>
              )}

              {!isReply && !showReplies && (
                <button
                  onClick={loadReplies}
                  className="text-violet-400 hover:text-violet-300 text-xs"
                >
                  Show replies
                </button>
              )}
            </div>

            {showReplies && replies.length > 0 && (
              <div className="mt-4">
                {replies.map(reply => (
                  <Comment key={reply.id} comment={reply} isReply={true} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) {
    return (
      <div
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-[#1a1a2e] border border-violet-500/30 rounded-xl p-4 cursor-pointer hover:border-violet-500 transition-all max-w-sm shadow-lg"
      >
        {latestComment ? (
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 p-0.5 flex-shrink-0">
              <div className="w-full h-full rounded-full bg-[#16213e] flex items-center justify-center overflow-hidden">
                {latestComment.avatar_url ? (
                  <img src={latestComment.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm">🍑</span>
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{latestComment.username}</p>
              <p className="text-xs text-gray-400 truncate">{latestComment.comment}</p>
            </div>
            <MessageCircle size={20} className="text-violet-400 flex-shrink-0" />
          </div>
        ) : (
          <div className="flex items-center gap-2 text-gray-400">
            <MessageCircle size={20} />
            <span className="text-sm">No comments yet. Be the first!</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="bg-[#0a0a1a] w-full sm:max-w-2xl h-full sm:h-[80vh] sm:rounded-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-violet-500/20">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageCircle size={24} className="text-violet-400" />
            {comments.length} Comments
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-violet-500/20 rounded-lg transition-all"
          >
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {comments.map(comment => (
            <Comment key={comment.id} comment={comment} />
          ))}
          {comments.length === 0 && (
            <div className="text-center text-gray-500 py-12">
              No comments yet. Be the first to comment! 🍑
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-violet-500/20">
          {replyTo && (
            <div className="mb-2 flex items-center justify-between bg-violet-500/10 p-2 rounded-lg">
              <span className="text-sm text-gray-400">
                Replying to <span className="text-violet-400">{replyTo.username}</span>
              </span>
              <button onClick={() => setReplyTo(null)} className="text-gray-400 hover:text-white">
                <X size={16} />
              </button>
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add comment..."
              className="flex-1 p-3 rounded-xl border-2 border-violet-500/30 bg-[#16213e] text-white focus:border-violet-500 outline-none"
            />
            <button
              type="submit"
              disabled={loading || !newComment.trim()}
              className="p-3 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-xl hover:shadow-lg hover:shadow-violet-500/50 transition-all disabled:opacity-50"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CommentsSection;
