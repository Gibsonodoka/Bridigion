'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { CompanySidebar } from '@/components/marketplace/CompanySidebar';
import { PostComposer } from '@/components/community/PostComposer';

interface Post {
  id: string; content: string; status: string;
  comment_count: number; reaction_count: number; created_at: string;
}

const statusColors: Record<string, string> = {
  approved: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function CompanyCommunityPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<{ name: string; logo_url?: string } | null>(null);

  const getToken = () => localStorage.getItem('company_token') || '';

  const fetchData = useCallback(async () => {
    const token = getToken();
    if (!token) { router.push('/company/login'); return; }
    setLoading(true);

    // Fetch posts — non-critical, never redirect
    try {
      const postsRes = await authApi.communityCompanyGetPosts(token);
      setPosts((postsRes.data.data as Post[]) || []);
    } catch (err) {
      console.error('Company posts fetch error:', err);
    }

    // Fetch profile — non-critical, never redirect
    try {
      const profileRes = await authApi.companyProfile(token);
      setCompany(profileRes.data.data as { name: string; logo_url?: string });
    } catch (err) {
      console.error('Company profile fetch error:', err);
    }

    setLoading(false);
  }, [router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handlePost = async (content: string, imageUrl?: string) => {
    const token = getToken();
    try {
      await authApi.communityCompanyCreatePost(token, { content, image_url: imageUrl });
      fetchData();
    } catch (err) {
      console.error('Create post error:', err);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <CompanySidebar />
      <main className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Community</h1>
          <p className="text-slate-500 text-sm mt-1">Share updates with the Bridigion community</p>
        </div>

        <div className="max-w-2xl space-y-6">
          <PostComposer
            authorName={company?.name || 'Company'}
            authorAvatar={company?.logo_url}
            onSubmit={handlePost}
            placeholder="Share a company update, job tip, or announcement..."
          />

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900">Your Posts</h3>
            </div>

            {loading ? (
              <div className="p-6 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-3xl mb-2">📢</p>
                <p className="text-slate-500 text-sm">No posts yet. Share something above!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {posts.map(post => (
                  <div key={post.id} className="px-6 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm text-slate-800 flex-1 line-clamp-2">{post.content}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize flex-shrink-0 ${statusColors[post.status]}`}>
                        {post.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                      <span>💬 {post.comment_count}</span>
                      <span>👍 {post.reaction_count}</span>
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}