import { Request, Response, NextFunction } from 'express';
import { AdminRequest } from '../middlewares/adminAuth.middleware';
import { UserRequest } from '../middlewares/userAuth.middleware';
import { CompanyRequest } from '../middlewares/companyAuth.middleware';
import {
  createPost, getFeed, getPostById, getUserPosts, getCompanyPosts,
  addComment, deleteComment,
  toggleReaction, getReactionCount,
  followUser, unfollowUser, followCompany, unfollowCompany, getFollowStatus,
  getPendingPosts, moderatePost, getAllPostsAdmin,
} from '../services/community.service';
import { notifyCommunityPostUpdate } from '../services/notification.service';
import { supabaseAdmin } from '../config/supabase';

// ─── USER ─────────────────────────────────────────────────────────────────────

export const userGetFeedHandler = async (req: UserRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const page = Number(req.query.page) || 1;
    const result = await getFeed(userId, page);
    res.status(200).json({ status: 'success', data: result.data, meta: { total: result.total, page } });
  } catch (error) { next(error); }
};

export const userCreatePostHandler = async (req: UserRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { data: user } = await supabaseAdmin.from('users').select('verification_status').eq('id', userId).single();
    if (!user || user.verification_status !== 'verified') {
      res.status(403).json({ status: 'error', message: 'You must be verified to post.' }); return;
    }
    const { content, image_url } = req.body;
    if (!content) { res.status(400).json({ status: 'error', message: 'Content is required.' }); return; }
    const post = await createPost({ poster_type: 'user', user_id: userId, content, image_url });
    if (!post) { res.status(500).json({ status: 'error', message: 'Failed to create post.' }); return; }
    res.status(201).json({ status: 'success', message: 'Post submitted for review.', data: post });
  } catch (error) { next(error); }
};

export const userGetPostHandler = async (req: UserRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const post = await getPostById(req.params.id as string, req.user!.id);
    if (!post) { res.status(404).json({ status: 'error', message: 'Post not found.' }); return; }
    res.status(200).json({ status: 'success', data: post });
  } catch (error) { next(error); }
};

export const userGetMyPostsHandler = async (req: UserRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const posts = await getUserPosts(req.user!.id);
    res.status(200).json({ status: 'success', data: posts });
  } catch (error) { next(error); }
};

export const userAddCommentHandler = async (req: UserRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { content } = req.body;
    const post_id = req.params.id as string;
    if (!content) { res.status(400).json({ status: 'error', message: 'Content is required.' }); return; }
    const comment = await addComment({ post_id, poster_type: 'user', user_id: req.user!.id, content });
    if (!comment) { res.status(500).json({ status: 'error', message: 'Failed to add comment.' }); return; }
    res.status(201).json({ status: 'success', data: comment });
  } catch (error) { next(error); }
};

export const userDeleteCommentHandler = async (req: UserRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const success = await deleteComment(req.params.commentId as string, req.user!.id);
    if (!success) { res.status(500).json({ status: 'error', message: 'Failed to delete comment.' }); return; }
    res.status(200).json({ status: 'success', message: 'Comment deleted.' });
  } catch (error) { next(error); }
};

export const userToggleReactionHandler = async (req: UserRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { reaction } = req.body;
    const post_id = req.params.id as string;
    if (!reaction) { res.status(400).json({ status: 'error', message: 'Reaction is required.' }); return; }
    const result = await toggleReaction({ post_id, poster_type: 'user', user_id: req.user!.id, reaction });
    const count = await getReactionCount(post_id);
    res.status(200).json({ status: 'success', data: { ...result, count } });
  } catch (error) { next(error); }
};

export const userFollowUserHandler = async (req: UserRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const targetId = req.params.userId as string;
    const followerId = req.user!.id;
    if (targetId === followerId) { res.status(400).json({ status: 'error', message: 'Cannot follow yourself.' }); return; }
    const isFollowing = await getFollowStatus(followerId, targetId);
    if (isFollowing) {
      await unfollowUser(followerId, targetId);
      res.status(200).json({ status: 'success', message: 'Unfollowed.', data: { following: false } });
    } else {
      await followUser(followerId, targetId);
      res.status(200).json({ status: 'success', message: 'Following.', data: { following: true } });
    }
  } catch (error) { next(error); }
};

export const userFollowCompanyHandler = async (req: UserRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const companyId = req.params.companyId as string;
    const followerId = req.user!.id;
    const isFollowing = await getFollowStatus(followerId, undefined, companyId);
    if (isFollowing) {
      await unfollowCompany(followerId, companyId);
      res.status(200).json({ status: 'success', message: 'Unfollowed.', data: { following: false } });
    } else {
      await followCompany(followerId, companyId);
      res.status(200).json({ status: 'success', message: 'Following.', data: { following: true } });
    }
  } catch (error) { next(error); }
};

// ─── COMPANY ──────────────────────────────────────────────────────────────────

export const companyCreatePostHandler = async (req: CompanyRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { content, image_url } = req.body;
    if (!content) { res.status(400).json({ status: 'error', message: 'Content is required.' }); return; }
    const post = await createPost({ poster_type: 'company', company_id: req.company!.id, content, image_url });
    if (!post) { res.status(500).json({ status: 'error', message: 'Failed to create post.' }); return; }
    res.status(201).json({ status: 'success', message: 'Post submitted for review.', data: post });
  } catch (error) { next(error); }
};

export const companyGetPostsHandler = async (req: CompanyRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const posts = await getCompanyPosts(req.company!.id);
    res.status(200).json({ status: 'success', data: posts });
  } catch (error) { next(error); }
};

export const companyAddCommentHandler = async (req: CompanyRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { content } = req.body;
    const post_id = req.params.id as string;
    if (!content) { res.status(400).json({ status: 'error', message: 'Content is required.' }); return; }
    const comment = await addComment({ post_id, poster_type: 'company', company_id: req.company!.id, content });
    if (!comment) { res.status(500).json({ status: 'error', message: 'Failed to add comment.' }); return; }
    res.status(201).json({ status: 'success', data: comment });
  } catch (error) { next(error); }
};

export const companyToggleReactionHandler = async (req: CompanyRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { reaction } = req.body;
    const post_id = req.params.id as string;
    if (!reaction) { res.status(400).json({ status: 'error', message: 'Reaction is required.' }); return; }
    const result = await toggleReaction({ post_id, poster_type: 'company', company_id: req.company!.id, reaction });
    const count = await getReactionCount(post_id);
    res.status(200).json({ status: 'success', data: { ...result, count } });
  } catch (error) { next(error); }
};

// ─── ADMIN ────────────────────────────────────────────────────────────────────

export const adminCreatePostHandler = async (req: AdminRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { content, image_url } = req.body;
    if (!content) { res.status(400).json({ status: 'error', message: 'Content is required.' }); return; }
    const post = await createPost({ poster_type: 'admin', admin_id: req.admin!.id, content, image_url });
    if (!post) { res.status(500).json({ status: 'error', message: 'Failed to create post.' }); return; }
    res.status(201).json({ status: 'success', message: 'Post published.', data: post });
  } catch (error) { next(error); }
};

export const adminGetPendingPostsHandler = async (req: AdminRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const result = await getPendingPosts(page);
    res.status(200).json({ status: 'success', data: result.data, meta: { total: result.total, page } });
  } catch (error) { next(error); }
};

export const adminGetAllPostsHandler = async (req: AdminRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const status = req.query.status as string | undefined;
    const page = Number(req.query.page) || 1;
    const result = await getAllPostsAdmin(status, page);
    res.status(200).json({ status: 'success', data: result.data, meta: { total: result.total, page } });
  } catch (error) { next(error); }
};

export const adminModeratePostHandler = async (req: AdminRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;
    if (!['approved', 'rejected', 'flagged'].includes(status)) {
      res.status(400).json({ status: 'error', message: 'Invalid status.' }); return;
    }
    const post = await moderatePost(id, status, req.admin!.id);
    if (!post) { res.status(500).json({ status: 'error', message: 'Failed to moderate post.' }); return; }

    // Notify poster when approved or rejected
    if (status === 'approved' || status === 'rejected') {
      await notifyCommunityPostUpdate(id, status as 'approved' | 'rejected');
    }

    res.status(200).json({ status: 'success', message: `Post ${status}.`, data: post });
  } catch (error) { next(error); }
};