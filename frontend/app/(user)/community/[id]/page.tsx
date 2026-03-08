'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { authApi } from '@/lib/api';
import { UserSidebar } from '@/components/user/UserSidebar';
import { PostCard } from '@/components/community/PostCard';

export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [post, setPost] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>('');

  const getToken = () => localStorage.getItem('user_token') || '';

  const fetchPost = useCallback(async () => {
    const token = getToken();
    if (!token) { router.push('/login'); return; }

    // Fetch post — redirect to community if not found
    try {
      const postRes = await authApi.communityGetPost(token, id);
      setPost(postRes.data.data);
    } catch (err) {
      console.error('Post fetch error:', err);
      router.push('/community');
      return;
    } finally {
      setLoading(false);
    }

    // Profile fetch is non-critical — never redirect on failure
    try {
      const profileRes = await authApi.userGetProfile(token);
      setUserId((profileRes.data.data as { id: string }).id);
    } catch (err) {
      console.error('Profile fetch error:', err);
    }
  }, [id, router]);

  useEffect(() => { fetchPost(); }, [fetchPost]);

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
      setPost((prev: unknown) => {
        const p = prev as Record<string, unknown>;
        return {
          ...p,
          comments: [...((p.comments as unknown[]) || []), newComment],
          comment_count: (p.comment_count as number) + 1,
        };
      });
    } catch (err) {
      console.error('Comment error:', err);
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    try {
      await authApi.communityDeleteComment(getToken(), postId, commentId);
      setPost((prev: unknown) => {
        const p = prev as Record<string, unknown>;
        return {
          ...p,
          comments: ((p.comments as Array<{ id: string }>) || []).filter(c => c.id !== commentId),
          comment_count: Math.max(0, (p.comment_count as number) - 1),
        };
      });
    } catch (err) {
      console.error('Delete comment error:', err);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <UserSidebar />
      <main className="flex-1 p-8">
        <button
          onClick={() => router.push('/community')}
          className="text-sm text-slate-500 hover:text-slate-900 mb-6 flex items-center gap-1"
        >
          ← Back to Community
        </button>

        <div className="max-w-2xl">
          {loading ? (
            <div className="bg-slate-200 rounded-xl h-64 animate-pulse" />
          ) : post ? (
            <PostCard
              post={post as Parameters<typeof PostCard>[0]['post']}
              currentUserId={userId}
              onReact={handleReact}
              onAddComment={handleAddComment}
              onDeleteComment={handleDeleteComment}
              showComments={true}
            />
          ) : (
            <p className="text-slate-500">Post not found.</p>
          )}
        </div>
      </main>
    </div>
  );
}