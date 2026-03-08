'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { PostComposer } from '@/components/community/PostComposer';

interface Post {
  id: string; content: string; status: string; poster_type: string;
  created_at: string;
  users?: { full_name: string } | null;
  companies?: { name: string } | null;
  admins?: { full_name: string } | null;
  post_comments?: { count: number }[];
  post_reactions?: { count: number }[];
}

const statusColors: Record<string, string> = {
  approved: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  rejected: 'bg-red-100 text-red-700',
  flagged: 'bg-orange-100 text-orange-700',
};

const getPosterName = (post: Post) => {
  if (post.poster_type === 'user') return post.users?.full_name || 'User';
  if (post.poster_type === 'company') return post.companies?.name || 'Company';
  if (post.poster_type === 'admin') return post.admins?.full_name || 'Admin';
  return 'Unknown';
};

export default function AdminCommunityPage() {
  const router = useRouter();
  const [pendingPosts, setPendingPosts] = useState<Post[]>([]);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'pending' | 'all' | 'post'>('pending');
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState('');

  const getToken = () => localStorage.getItem('admin_token') || '';

  const fetchData = useCallback(async () => {
    const token = getToken();
     console.log('Admin token:', token ? '✅ exists' : '❌ MISSING');
    if (!token) { router.push('/admin/login'); return; }
    setLoading(true);

    // Fetch pending — non-critical, never redirect
    try {
      const pendingRes = await authApi.communityAdminGetPending(token);
      setPendingPosts((pendingRes.data.data as Post[]) || []);
    } catch (err) {
      console.error('Pending posts error:', err);
    }

    // Fetch all posts — non-critical, never redirect
    try {
      const allRes = await authApi.communityAdminGetAll(token, filter || undefined);
      setAllPosts((allRes.data.data as Post[]) || []);
    } catch (err) {
      console.error('All posts error:', err);
    }

    setLoading(false);
  }, [filter, router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleModerate = async (id: string, status: string) => {
    setUpdating(id);
    try {
      await authApi.communityAdminModerate(getToken(), id, status);
      setPendingPosts(prev => prev.filter(p => p.id !== id));
      setAllPosts(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    } catch (err) {
      console.error('Moderate error:', err);
    } finally {
      setUpdating(null);
    }
  };

  const handleAdminPost = async (content: string, imageUrl?: string) => {
    try {
      await authApi.communityAdminCreatePost(getToken(), { content, image_url: imageUrl });
      fetchData();
      setTab('all');
    } catch (err) {
      console.error('Admin post error:', err);
    }
  };

  const PostRow = ({ post }: { post: Post }) => (
    <div className="p-5 hover:bg-slate-50">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-slate-900">{getPosterName(post)}</span>
            <span className="text-xs text-slate-400 capitalize">· {post.poster_type}</span>
            <span className="text-xs text-slate-400">· {new Date(post.created_at).toLocaleDateString()}</span>
          </div>
          <p className="text-sm text-slate-700 line-clamp-3">{post.content}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
            <span>💬 {post.post_comments?.[0]?.count || 0}</span>
            <span>👍 {post.post_reactions?.[0]?.count || 0}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[post.status]}`}>
            {post.status}
          </span>
          {post.status === 'pending' && (
            <div className="flex gap-2">
              <button
                onClick={() => handleModerate(post.id, 'approved')}
                disabled={updating === post.id}
                className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                Approve
              </button>
              <button
                onClick={() => handleModerate(post.id, 'rejected')}
                disabled={updating === post.id}
                className="px-3 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-lg hover:bg-red-200 disabled:opacity-50 transition-colors"
              >
                Reject
              </button>
            </div>
          )}
          {post.status === 'approved' && (
            <button
              onClick={() => handleModerate(post.id, 'flagged')}
              disabled={updating === post.id}
              className="px-3 py-1 bg-orange-100 text-orange-600 text-xs font-medium rounded-lg hover:bg-orange-200 disabled:opacity-50 transition-colors"
            >
              Flag
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Community</h1>
            <p className="text-slate-500 text-sm mt-1">
              {pendingPosts.length > 0 && (
                <span className="text-yellow-600 font-medium">{pendingPosts.length} pending review · </span>
              )}
              Moderate posts and publish announcements
            </p>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {([
            { key: 'pending', label: `⏳ Pending (${pendingPosts.length})` },
            { key: 'all', label: '📋 All Posts' },
            { key: 'post', label: '✍️ Post Announcement' },
          ] as const).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t.key ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Pending tab */}
        {tab === 'pending' && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {loading ? (
              <div className="p-6 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 bg-slate-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : pendingPosts.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-4xl mb-3">✅</p>
                <p className="font-medium text-slate-900">All caught up!</p>
                <p className="text-slate-500 text-sm mt-1">No posts pending review</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {pendingPosts.map(post => <PostRow key={post.id} post={post} />)}
              </div>
            )}
          </div>
        )}

        {/* All Posts tab */}
        {tab === 'all' && (
          <div>
            <div className="flex gap-2 mb-4">
              {[
                { value: '', label: 'All' },
                { value: 'approved', label: 'Approved' },
                { value: 'pending', label: 'Pending' },
                { value: 'rejected', label: 'Rejected' },
                { value: 'flagged', label: 'Flagged' },
              ].map(f => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    filter === f.value
                      ? 'bg-slate-900 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              {loading ? (
                <div className="p-6 space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-20 bg-slate-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : allPosts.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">No posts found</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {allPosts.map(post => <PostRow key={post.id} post={post} />)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Post Announcement tab */}
        {tab === 'post' && (
          <div className="max-w-2xl">
            <p className="text-sm text-slate-500 mb-4">
              Admin posts are published immediately without review and shown with a <strong>Staff</strong> badge.
            </p>
            <PostComposer
              authorName="Admin"
              onSubmit={handleAdminPost}
              placeholder="Write an announcement for the community..."
            />
          </div>
        )}
      </main>
    </div>
  );
}