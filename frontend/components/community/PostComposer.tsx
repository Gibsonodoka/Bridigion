'use client';

import { useState } from 'react';

interface PostComposerProps {
  authorName: string;
  authorAvatar?: string | null;
  onSubmit: (content: string, imageUrl?: string) => Promise<void>;
  placeholder?: string;
}

export const PostComposer = ({ authorName, authorAvatar, onSubmit, placeholder }: PostComposerProps) => {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit(content.trim(), imageUrl || undefined);
      setContent('');
      setImageUrl('');
      setShowImageInput(false);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 flex-shrink-0">
          {authorAvatar
            ? <img src={authorAvatar} alt={authorName} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-sm font-bold text-slate-400">{authorName[0]}</div>}
        </div>

        {/* Input */}
        <div className="flex-1">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={placeholder || "What's on your mind?"}
            className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-300 min-h-[80px]"
          />

          {showImageInput && (
            <input
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              placeholder="Paste image URL..."
              className="w-full mt-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          )}

          <div className="flex items-center justify-between mt-3">
            <button
              onClick={() => setShowImageInput(!showImageInput)}
              className="text-sm text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1"
            >
              🖼️ {showImageInput ? 'Remove image' : 'Add image'}
            </button>

            <div className="flex items-center gap-3">
              {submitted && (
                <span className="text-xs text-green-600 font-medium">✓ Submitted for review</span>
              )}
              <button
                onClick={handleSubmit}
                disabled={submitting || !content.trim()}
                className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 disabled:opacity-40 transition-colors"
              >
                {submitting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};