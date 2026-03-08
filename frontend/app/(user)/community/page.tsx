'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { UserSidebar } from '@/components/user/UserSidebar';
import { PostCard } from '@/components/community/PostCard';
import { PostComposer } from '@/components/community/PostComposer';

interface Post {
  id: string; content: string; image_url?: string; created_at: string;
  poster_type: string; reaction_count: number; comment_count: number;
  my_reaction?: string | null;
  users?: { id: string; full_name: string; role?: string; identity_verifications?: { selfie_url?: string } } | null;
  companies?: { id: string; name: string; logo_url?: string } | null;
  admins?: { id: string; full_name: string } | null;
}

export default function CommunityFeedPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<{ id: string; full_name: string; identity_verifications?: { selfie_url?: string } } | null>(null);
  const [tab, setTab] = useState<'feed' | 'mine'>('feed');

  const getToken = () => localStorage.getItem('user_token') || '';

  const fetchFeed = useCallback(async () => {
    const token = getToken();
    if (!token) { router.push('/login'); return; }
    setLoading(true);

    // Fetch feed — redirect only if this fails (real auth error)
    try {
      const feedRes = await (tab === 'feed'
        ? authApi.communityGetFeed(token)
        : authApi.communityGetMyPosts(token));
      setPosts((feedRes.data.data as Post[]) || []);
    } catch (err) {
      console.error('Feed fetch error:', err);
    } finally {
      setLoading(false);
    }

    // Profile fetch is non-critical — never redirect on failure
    try {
      const profileRes = await authApi.userGetProfile(token);
      setUserProfile(profileRes.data.data as typeof userProfile);
    } catch (err) {
      console.error('Profile fetch error:', err);
    }
  }, [tab, router]);

  useEffect(() => { fetchFeed(); }, [fetchFeed]);

  const handleCreatePost = async (content: string, imageUrl?: string) => {
    try {
      await authApi.communityCreatePost(getToken(), { content, image_url: imageUrl });
      if (tab === 'mine') fetchFeed();
    } catch (err) {
      console.error('Create post error:', err);
    }
  };

  const handleReact = async (postId: string, reaction: string) => {
    try {
      await authApi.communityReact(getToken(), postId, reaction);
    } catch (err) {
      console.error('React error:', err);
    }
  };

  const handleAddComment = async (postId: string, content: string) => {
    try {
      const res = await authApi.communityAddComment(getToken(), postId, content);
      const newComment = res.data.data;
      setPosts(prev => prev.map(p =>
        p.id === postId
          ? { ...p, comment_count: p.comment_count + 1, comments: [...((p as unknown as { comments: unknown[] }).comments || []), newComment] }
          : p
      ));
    } catch (err) {
      console.error('Comment error:', err);
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    try {
      await authApi.communityDeleteComment(getToken(), postId, commentId);
      setPosts(prev => prev.map(p =>
        p.id === postId
          ? { ...p, comment_count: Math.max(0, p.comment_count - 1) }
          : p
      ));
    } catch (err) {
      console.error('Delete comment error:', err);
    }
  };

  const selfieUrl = Array.isArray(userProfile?.identity_verifications)
    ? (userProfile?.identity_verifications as Array<{ selfie_url?: string }>)[0]?.selfie_url
    : userProfile?.identity_verifications?.selfie_url;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <UserSidebar />
      <main className="flex-1 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Community</h1>
            <p className="text-slate-500 text-sm mt-1">Connect with security professionals</p>
          </div>

          <div className="mb-6">
            <PostComposer
              authorName={userProfile?.full_name || 'You'}
              authorAvatar={selfieUrl}
              onSubmit={handleCreatePost}
            />
          </div>

          <div className="flex gap-2 mb-6">
            {(['feed', 'mine'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  tab === t ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {t === 'feed' ? '🌍 Feed' : '📝 My Posts'}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => <div key={i} className="bg-slate-200 rounded-xl h-40 animate-pulse" />)}
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <p className="text-4xl mb-3">💬</p>
              <p className="font-medium text-slate-900">
                {tab === 'feed' ? 'No posts yet' : "You haven't posted anything yet"}
              </p>
              <p className="text-slate-500 text-sm mt-1">
                {tab === 'feed' ? 'Be the first to post something!' : 'Share something with the community'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={userProfile?.id}
                  onReact={handleReact}
                  onAddComment={handleAddComment}
                  onDeleteComment={handleDeleteComment}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}