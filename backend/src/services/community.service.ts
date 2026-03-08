import { supabaseAdmin } from '../config/supabase';

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const posterSelect = `
  user_id, company_id, admin_id, poster_type,
  users(id, full_name, role),
  companies(id, name, logo_url),
  admins!community_posts_admin_id_fkey(id, full_name)
`;

// ─── POSTS ────────────────────────────────────────────────────────────────────

export const createPost = async (data: {
  poster_type: string;
  user_id?: string;
  company_id?: string;
  admin_id?: string;
  content: string;
  image_url?: string;
}) => {
  const status = data.admin_id ? 'approved' : 'pending';
  const { data: post, error } = await supabaseAdmin
    .from('community_posts')
    .insert({ ...data, status })
    .select()
    .single();
  if (error) { console.error('❌ Create post:', error.message); return null; }
  return post;
};

export const getFeed = async (userId: string, page = 1) => {
  const from = (page - 1) * 20;

  const { data, error, count } = await supabaseAdmin
    .from('community_posts')
    .select(`
      id, content, image_url, status, created_at, poster_type,
      ${posterSelect},
      post_comments(count),
      post_reactions(count)
    `, { count: 'exact' })
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .range(from, from + 19);

  if (error) { console.error('❌ Get feed:', error.message); return { data: [], total: 0 }; }

  const postIds = (data || []).map((p: { id: string }) => p.id);
  const { data: myReactions } = await supabaseAdmin
    .from('post_reactions')
    .select('post_id, reaction')
    .eq('user_id', userId)
    .in('post_id', postIds);

  const reactionMap = new Map((myReactions || []).map((r: { post_id: string; reaction: string }) => [r.post_id, r.reaction]));

  return {
    data: (data || []).map((post: Record<string, unknown>) => ({
      ...post,
      my_reaction: reactionMap.get(post.id as string) || null,
      comment_count: (post.post_comments as Array<{ count: number }>)?.[0]?.count || 0,
      reaction_count: (post.post_reactions as Array<{ count: number }>)?.[0]?.count || 0,
    })),
    total: count || 0,
  };
};

export const getPostById = async (id: string, userId?: string) => {
  const { data: post, error } = await supabaseAdmin
    .from('community_posts')
    .select(`
      id, content, image_url, status, created_at, poster_type,
      ${posterSelect},
      post_reactions(count),
      post_comments(
        id, content, created_at, poster_type,
        users(id, full_name),
        companies(id, name, logo_url),
        admins!post_comments_admin_id_fkey(id, full_name)
      )
    `)
    .eq('id', id)
    .single();

  if (error || !post) return null;

  let myReaction = null;
  if (userId) {
    const { data: reaction } = await supabaseAdmin
      .from('post_reactions')
      .select('reaction')
      .eq('post_id', id)
      .eq('user_id', userId)
      .single();
    myReaction = reaction?.reaction || null;
  }

  return {
    ...post,
    my_reaction: myReaction,
    reaction_count: (post.post_reactions as Array<{ count: number }>)?.[0]?.count || 0,
    comments: post.post_comments || [],
  };
};

export const getUserPosts = async (userId: string) => {
  const { data, error } = await supabaseAdmin
    .from('community_posts')
    .select(`id, content, image_url, status, created_at, post_comments(count), post_reactions(count)`)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) return [];
  return (data || []).map((p: Record<string, unknown>) => ({
    ...p,
    comment_count: (p.post_comments as Array<{ count: number }>)?.[0]?.count || 0,
    reaction_count: (p.post_reactions as Array<{ count: number }>)?.[0]?.count || 0,
  }));
};

export const getCompanyPosts = async (companyId: string) => {
  const { data, error } = await supabaseAdmin
    .from('community_posts')
    .select(`id, content, image_url, status, created_at, post_comments(count), post_reactions(count)`)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });
  if (error) return [];
  return (data || []).map((p: Record<string, unknown>) => ({
    ...p,
    comment_count: (p.post_comments as Array<{ count: number }>)?.[0]?.count || 0,
    reaction_count: (p.post_reactions as Array<{ count: number }>)?.[0]?.count || 0,
  }));
};

// ─── COMMENTS ─────────────────────────────────────────────────────────────────

export const addComment = async (data: {
  post_id: string;
  poster_type: string;
  user_id?: string;
  company_id?: string;
  admin_id?: string;
  content: string;
}) => {
  const { data: comment, error } = await supabaseAdmin
    .from('post_comments')
    .insert(data)
    .select(`
      id, content, created_at, poster_type,
      users(id, full_name),
      companies(id, name, logo_url),
      admins!post_comments_admin_id_fkey(id, full_name)
    `)
    .single();
  if (error) { console.error('❌ Add comment:', error.message); return null; }
  return comment;
};

export const deleteComment = async (id: string, requesterId: string) => {
  const { error } = await supabaseAdmin
    .from('post_comments')
    .delete()
    .eq('id', id)
    .or(`user_id.eq.${requesterId},company_id.eq.${requesterId},admin_id.eq.${requesterId}`);
  if (error) return false;
  return true;
};

// ─── REACTIONS ────────────────────────────────────────────────────────────────

export const toggleReaction = async (data: {
  post_id: string;
  poster_type: string;
  user_id?: string;
  company_id?: string;
  reaction: string;
}) => {
  const matchField = data.user_id ? 'user_id' : 'company_id';
  const matchValue = data.user_id || data.company_id;

  const { data: existing } = await supabaseAdmin
    .from('post_reactions')
    .select('id, reaction')
    .eq('post_id', data.post_id)
    .eq(matchField, matchValue!)
    .single();

  if (existing) {
    if (existing.reaction === data.reaction) {
      await supabaseAdmin.from('post_reactions').delete().eq('id', existing.id);
      return { action: 'removed', reaction: null };
    } else {
      await supabaseAdmin.from('post_reactions').update({ reaction: data.reaction }).eq('id', existing.id);
      return { action: 'changed', reaction: data.reaction };
    }
  }

  await supabaseAdmin.from('post_reactions').insert(data);
  return { action: 'added', reaction: data.reaction };
};

export const getReactionCount = async (postId: string) => {
  const { count } = await supabaseAdmin
    .from('post_reactions')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId);
  return count || 0;
};

// ─── FOLLOWS ──────────────────────────────────────────────────────────────────

export const followUser = async (followerId: string, targetUserId: string) => {
  const { data, error } = await supabaseAdmin
    .from('community_follows')
    .insert({ follower_user_id: followerId, following_user_id: targetUserId })
    .select()
    .single();
  if (error) return null;
  return data;
};

export const unfollowUser = async (followerId: string, targetUserId: string) => {
  const { error } = await supabaseAdmin
    .from('community_follows')
    .delete()
    .eq('follower_user_id', followerId)
    .eq('following_user_id', targetUserId);
  return !error;
};

export const followCompany = async (followerId: string, companyId: string) => {
  const { data, error } = await supabaseAdmin
    .from('community_follows')
    .insert({ follower_user_id: followerId, following_company_id: companyId })
    .select()
    .single();
  if (error) return null;
  return data;
};

export const unfollowCompany = async (followerId: string, companyId: string) => {
  const { error } = await supabaseAdmin
    .from('community_follows')
    .delete()
    .eq('follower_user_id', followerId)
    .eq('following_company_id', companyId);
  return !error;
};

export const getFollowStatus = async (followerId: string, targetUserId?: string, targetCompanyId?: string) => {
  let query = supabaseAdmin
    .from('community_follows')
    .select('id')
    .eq('follower_user_id', followerId);

  if (targetUserId) query = query.eq('following_user_id', targetUserId);
  if (targetCompanyId) query = query.eq('following_company_id', targetCompanyId);

  const { data } = await query.single();
  return !!data;
};

// ─── ADMIN: MODERATION ────────────────────────────────────────────────────────

export const getPendingPosts = async (page = 1) => {
  const from = (page - 1) * 20;
  const { data, error, count } = await supabaseAdmin
    .from('community_posts')
    .select(`
      id, content, image_url, status, created_at, poster_type,
      ${posterSelect}
    `, { count: 'exact' })
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .range(from, from + 19);

  if (error) {
    console.error('❌ getPendingPosts error:', error.message);
    return { data: [], total: 0 };
  }
  return { data: data || [], total: count || 0 };
};

export const moderatePost = async (id: string, status: string, adminId: string) => {
  const { data, error } = await supabaseAdmin
    .from('community_posts')
    .update({ status, reviewed_by: adminId, reviewed_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) return null;
  return data;
};

export const getAllPostsAdmin = async (status?: string, page = 1) => {
  const from = (page - 1) * 20;
  let query = supabaseAdmin
    .from('community_posts')
    .select(`
      id, content, status, created_at, poster_type,
      ${posterSelect},
      post_comments(count),
      post_reactions(count)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + 19);
  if (status) query = query.eq('status', status);
  const { data, error, count } = await query;
  if (error) {
    console.error('❌ getAllPostsAdmin error:', error.message);
    return { data: [], total: 0 };
  }
  return { data: data || [], total: count || 0 };
};