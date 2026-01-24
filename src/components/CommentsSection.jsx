import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from '../context/AuthContext';
import { Heart, MessageCircle, Send, ArrowLeft, X, Copy, Check } from 'lucide-react';
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
  const [profilePopup, setProfilePopup] = useState(null);
  const [copied, setCopied] = useState(false);
  const [likedComments, setLikedComments] = useState(new Set());
  const [commentFilter, setCommentFilter] = useState('episode'); // 'episode' or 'all'

  useEffect(() => {
    fetchComments();
    if (user) {
      fetchUserLikes();
    }
    const subscription = supabase
      .channel(`comments-${animeId}-${episodeNumber}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'comments' }, 
        () => fetchComments()
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }, [animeId, episodeNumber, user, commentFilter]);

  const fetchComments = async () => {
    let query = supabase
      .from('comments')
      .select('*')
      .eq('anime_id', animeId)
      .is('parent_comment_id', null)
      .order('created_at', { ascending: false });

    // Filter by episode or show all
    if (commentFilter === 'episode') {
      query = query.eq('episode_number', episodeNumber);
    }

    const { data, error } = await query;

    if (!error && data) {
      setComments(data);
      if (data.length > 0) setLatestComment(data[0]);
    }
  };

  const fetchUserLikes = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('comment_likes')
      .select('comment_id')
      .eq('user_id', user.id);
    
    if (data) {
      setLikedComments(new Set(data.map(like => like.comment_id)));
    }
  };

  const fetchReplies = async (commentId) => {
    const { data } = await supabase
      .from('comments')
      .select('*')
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
    
    try {
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
          comment_text: newComment,
          parent_comment_id: replyTo?.id || null,
          likes: 0
        }
      ]);

      if (error) throw error;

      setNewComment('');
      setReplyTo(null);
      await fetchComments();
    } catch (error) {
      alert('Error posting comment: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (commentId) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      const isLiked = likedComments.has(commentId);

      if (isLiked) {
        await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);

        const { data: comment } = await supabase
          .from('comments')
          .select('likes')
          .eq('id', commentId)
          .single();

        await supabase
          .from('comments')
          .update({ likes: Math.max(0, (comment?.likes || 1) - 1) })
          .eq('id', commentId);

        setLikedComments(prev => {
          const newSet = new Set(prev);
          newSet.delete(commentId);
          return newSet;
        });
      } else {
        await supabase
          .from('comment_likes')
          .insert({ comment_id: commentId, user_id: user.id });

        const { data: comment } = await supabase
          .from('comments')
          .select('likes')
          .eq('id', commentId)
          .single();

        await supabase
          .from('comments')
          .update({ likes: (comment?.likes || 0) + 1 })
          .eq('id', commentId);

        setLikedComments(prev => new Set([...prev, commentId]));
      }

      await fetchComments();
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const showProfilePopup = async (userId, username) => {
    setProfilePopup({ userId, username });
  };

  const copyUserId = () => {
    if (profilePopup) {
      navigator.clipboard.writeText(profilePopup.userId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const viewFullProfile = () => {
    if (profilePopup) {
      setProfilePopup(null);
      setIsOpen(false);
      navigate('/profile');
    }
  };

  const Comment = ({ comment, isReply = false }) => {
    const [showReplies, setShowReplies] = useState(false);
    const [replies, setReplies] = useState([]);
    const [replyCount, setReplyCount] = useState(0);

    useEffect(() => {
      loadReplyCount();
    }, [comment.id]);

    const loadReplyCount = async () => {
      const { count } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('parent_comment_id', comment.id);
      setReplyCount(count || 0);
    };

    const loadReplies = async () => {
      const data = await fetchReplies(comment.id);
      setReplies(data);
      setShowReplies(true);
    };

    return (
      <div className={`${isReply ? 'ml-8 sm:ml-12' : ''} mb-4`}>
        <div className="flex gap-3">
          <div
            onClick={() => showProfilePopup(comment.user_id, comment.username)}
            className="cursor-pointer flex-shrink-0"
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

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span
                onClick={() => showProfilePopup(comment.user_id, comment.username)}
                className="font-semibold text-white cursor-pointer hover:text-violet-400 truncate"
              >
                {comment.username}
              </span>
              <span className="text-xs text-gray-500 flex-shrink-0">
                {new Date(comment.created_at).toLocaleDateString()}
              </span>
              {commentFilter === 'all' && (
                <span className="text-xs bg-violet-500/20 text-violet-400 px-2 py-0.5 rounded">
                  EP {comment.episode_number}
                </span>
              )}
            </div>

            <p className="text-gray-300 mb-2 break-words">{comment.comment_text}</p>

            <div className="flex items-center gap-4 text-sm flex-wrap">
              <button
                onClick={() => handleLike(comment.id)}
                className="flex items-center gap-1 text-gray-400 hover:text-red-400 transition-all"
              >
                <Heart size={16} className={likedComments.has(comment.id) ? 'fill-red-400 text-red-400' : ''} />
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

              {!isReply && !showReplies && replyCount > 0 && (
                <button
                  onClick={loadReplies}
                  className="text-violet-400 hover:text-violet-300 text-xs"
                >
                  Show {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
                </button>
              )}
            </div>

            {showReplies && replies.length > 0 && (
              <div className="mt-4 space-y-4">
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
      <div className="flex justify-center my-8 px-4">
        <div
          onClick={() => setIsOpen(true)}
          className="w-full max-w-2xl bg-[#1a1a2e] border border-violet-500/30 rounded-xl p-4 cursor-pointer hover:border-violet-500 transition-all shadow-lg"
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
                <p className="text-xs text-gray-400 truncate">{latestComment.comment_text}</p>
              </div>
              <MessageCircle size={20} className="text-violet-400 flex-shrink-0" />
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-400 justify-center">
              <MessageCircle size={20} />
              <span className="text-sm">No comments yet. Be the first!</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-center my-8 px-4">
        <div className="bg-[#1a1a2e] w-full max-w-2xl rounded-2xl border border-violet-500/20 flex flex-col" style={{ maxHeight: '80vh' }}>
          <div className="flex-shrink-0">
            <div className="flex items-center justify-between p-4 border-b border-violet-500/20">
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-violet-500/20 rounded-lg transition-all"
              >
                <ArrowLeft size={24} className="text-gray-400" />
              </button>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <MessageCircle size={24} className="text-violet-400" />
                {comments.length} Comments
              </h2>
              <div className="w-10"></div>
            </div>

            {/* Filter Toggle */}
            <div className="flex gap-2 p-3 bg-[#16213e]">
              <button
                onClick={() => setCommentFilter('episode')}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                  commentFilter === 'episode'
                    ? 'bg-gradient-to-r from-violet-500 to-cyan-500 text-white'
                    : 'bg-[#1a1a2e] text-gray-400 hover:text-white'
                }`}
              >
                Episode {episodeNumber}
              </button>
              <button
                onClick={() => setCommentFilter('all')}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                  commentFilter === 'all'
                    ? 'bg-gradient-to-r from-violet-500 to-cyan-500 text-white'
                    : 'bg-[#1a1a2e] text-gray-400 hover:text-white'
                }`}
              >
                All Episodes
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ minHeight: 0 }}>
            {comments.map(comment => (
              <Comment key={comment.id} comment={comment} />
            ))}
            {comments.length === 0 && (
              <div className="text-center text-gray-500 py-12">
                No comments yet. Be the first to comment! 🍑
              </div>
            )}
          </div>

          <div className="p-3 border-t border-violet-500/20 bg-[#16213e] flex-shrink-0">
            {replyTo && (
              <div className="mb-2 flex items-center justify-between bg-violet-500/10 p-2 rounded-lg">
                <span className="text-sm text-gray-400 truncate flex-1">
                  Replying to <span className="text-violet-400">{replyTo.username}</span>
                </span>
                <button onClick={() => setReplyTo(null)} className="text-gray-400 hover:text-white ml-2 flex-shrink-0">
                  <X size={16} />
                </button>
              </div>
            )}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={user ? "Add comment..." : "Login to comment"}
                disabled={!user}
                className="flex-1 min-w-0 p-2.5 rounded-xl border-2 border-violet-500/30 bg-[#0a0a1a] text-white text-sm focus:border-violet-500 outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading || !newComment.trim() || !user}
                className="px-3 py-2.5 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-xl hover:shadow-lg hover:shadow-violet-500/50 transition-all disabled:opacity-50 flex-shrink-0"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Profile Popup */}
      {profilePopup && (
        <div 
          className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4"
          onClick={() => setProfilePopup(null)}
        >
          <div 
            className="bg-[#1a1a2e] rounded-2xl p-6 border border-violet-500/20 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-white">Profile</h3>
              <button
                onClick={() => setProfilePopup(null)}
                className="p-1 hover:bg-violet-500/20 rounded-lg transition-all"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Username</label>
                <div className="p-3 rounded-xl bg-[#16213e] text-white">
                  {profilePopup.username}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">User ID</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-3 rounded-xl bg-[#16213e] text-white font-mono text-xs overflow-hidden text-ellipsis">
                    {profilePopup.userId}
                  </div>
                  <button
                    onClick={copyUserId}
                    className="p-3 bg-violet-500/20 rounded-xl hover:bg-violet-500/30 transition-all"
                  >
                    {copied ? <Check size={20} className="text-green-400" /> : <Copy size={20} />}
                  </button>
                </div>
                {copied && (
                  <p className="text-green-400 text-sm mt-2">Copied! ✓</p>
                )}
              </div>

              <button
                onClick={viewFullProfile}
                className="w-full p-3 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-xl font-bold hover:shadow-lg hover:shadow-violet-500/50 transition-all"
              >
                View Full Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CommentsSection;
