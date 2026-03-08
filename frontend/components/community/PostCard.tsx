'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ReactionBar } from './ReactionBar';
import { CommentSection } from './CommentSection';

interface PostCardProps {
  post: {
    id: string;
    content: string;
    image_url?: string;
    created_at: string;
    poster_type: string;
    status?: string;
    reaction_count: number;
    comment_count: number;
    my_reaction?: string | null;
    users?: { id: string; full_name: string; role?: string; identity_verifications?: { selfie_url?: string } | { selfie_url?: string }[] } | null;
    companies?: { id: string; name: string; logo_url?: string } | null;
    admins?: { id: string; full_name: string } | null;
    comments?: unknown[];
  };
  currentUserId?: string;
  onReact: (postId: string, reaction: string) => Promise<void>;
  onAddComment?: (postId: string, content: string) => Promise<void>;
  onDeleteComment?: (postId: string, commentId: string) => Promise<void>;
  showComments?: boolean;
}

const getAvatar = (post: PostCardProps['post']) => {
  if (post.poster_type === 'user') {
    const iv = Array.isArray(post.users?.identity_verifications)
      ? post.users?.identity_verifications[0]
      : post.users?.identity_verifications;
    return iv?.selfie_url || null;
  }
  if (post.poster_type === 'company') return post.companies?.logo_url || null;
  return null;
};

const getName = (post: PostCardProps['post']) => {
  if (post.poster_type === 'user') return post.users?.full_name || 'User';
  if (post.poster_type === 'company') return post.companies?.name || 'Company';
  if (post.poster_type === 'admin') return post.admins?.full_name || 'Bridigion';
  return 'Unknown';
};

const getSubtitle = (post: PostCardProps['post']) => {
  if (post.poster_type === 'user') return post.users?.role ? `Security ${post.users.role}` : 'Member';
  if (post.poster_type === 'company') return 'Company';
  if (post.poster_type === 'admin') return '⭐ Bridigion Staff';
  return '';
};

export const PostCard = ({
  post, currentUserId, onReact,
  onAddComment, onDeleteComment, showComments = false,
}: PostCardProps) => {
  const router = useRouter();
  const [expanded, setExpanded] = useState(showComments);
  const avatar = getAvatar(post);
  const name = getName(post);
  const subtitle = getSubtitle(post);
  const daysAgo = Math.floor((Date.now() - new Date(post.created_at).getTime()) / 86400000);
  const isAdmin = post.poster_type === 'admin';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-11 h-11 rounded-full overflow-hidden bg-slate-100 flex-shrink-0">
          {avatar
            ? <img src={avatar} alt={name} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center font-bold text-slate-400">{name[0]}</div>}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900 text-sm">{name}</span>
            {isAdmin && (
              <span className="px-1.5 py-0.5 bg-slate-900 text-white text-xs rounded-full">Staff</span>
            )}
            {post.status && post.status !== 'approved' && (
              <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full capitalize">{post.status}</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
            <span className="capitalize">{subtitle}</span>
            <span>·</span>
            <span>{daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <p
        className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap cursor-pointer"
        onClick={() => router.push(`/community/${post.id}`)}
      >
        {post.content}
      </p>

      {/* Image */}
      {post.image_url && (
        <div className="mt-3 rounded-xl overflow-hidden">
          <img src={post.image_url} alt="" className="w-full max-h-80 object-cover" />
        </div>
      )}

      {/* Reactions */}
      <ReactionBar
        postId={post.id}
        reactionCount={post.reaction_count}
        commentCount={post.comment_count}
        myReaction={post.my_reaction}
        onReact={onReact}
        onCommentClick={() => setExpanded(!expanded)}
      />

      {/* Comments */}
      {expanded && onAddComment && onDeleteComment && (
        <CommentSection
          comments={(post.comments as Parameters<typeof CommentSection>[0]['comments']) || []}
          currentUserId={currentUserId}
          onAdd={(content) => onAddComment(post.id, content)}
          onDelete={(commentId) => onDeleteComment(post.id, commentId)}
        />
      )}
    </div>
  );
};