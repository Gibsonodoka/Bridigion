'use client';

import { useState } from 'react';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  poster_type: string;
  users?: { id: string; full_name: string; identity_verifications?: { selfie_url?: string } | { selfie_url?: string }[] } | null;
  companies?: { id: string; name: string; logo_url?: string } | null;
  admins?: { id: string; full_name: string } | null;
}

interface CommentSectionProps {
  comments: Comment[];
  currentUserId?: string;
  onAdd: (content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
}

const getAvatar = (comment: Comment) => {
  if (comment.poster_type === 'user') {
    const iv = Array.isArray(comment.users?.identity_verifications)
      ? comment.users?.identity_verifications[0]
      : comment.users?.identity_verifications;
    return iv?.selfie_url || null;
  }
  if (comment.poster_type === 'company') return comment.companies?.logo_url || null;
  return null;
};

const getName = (comment: Comment) => {
  if (comment.poster_type === 'user') return comment.users?.full_name || 'User';
  if (comment.poster_type === 'company') return comment.companies?.name || 'Company';
  if (comment.poster_type === 'admin') return `${comment.admins?.full_name || 'Admin'} · Bridigion`;
  return 'Unknown';
};

export const CommentSection = ({ comments, currentUserId, onAdd, onDelete }: CommentSectionProps) => {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      await onAdd(text.trim());
      setText('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-4 space-y-4">
      {/* Add comment */}
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center text-xs font-bold text-slate-500">
          U
        </div>
        <div className="flex-1 flex gap-2">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSubmit()}
            placeholder="Write a comment..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
          <button
            onClick={handleSubmit}
            disabled={submitting || !text.trim()}
            className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 disabled:opacity-40 transition-colors"
          >
            Post
          </button>
        </div>
      </div>

      {/* Comments list */}
      {comments.length > 0 && (
        <div className="space-y-3">
          {comments.map(comment => {
            const avatar = getAvatar(comment);
            const name = getName(comment);
            const isAdmin = comment.poster_type === 'admin';
            const canDelete = comment.users?.id === currentUserId;

            return (
              <div key={comment.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 flex-shrink-0">
                  {avatar
                    ? <img src={avatar} alt={name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-400">{name[0]}</div>}
                </div>
                <div className="flex-1">
                  <div className="bg-slate-50 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-slate-900">{name}</span>
                      {isAdmin && (
                        <span className="px-1.5 py-0.5 bg-slate-900 text-white text-xs rounded-full">Staff</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-700">{comment.content}</p>
                  </div>
                  <div className="flex items-center gap-3 mt-1 px-1">
                    <span className="text-xs text-slate-400">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                    {canDelete && (
                      <button
                        onClick={() => onDelete(comment.id)}
                        className="text-xs text-red-400 hover:text-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};