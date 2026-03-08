'use client';

import { useState } from 'react';

interface ReactionBarProps {
  postId: string;
  reactionCount: number;
  commentCount: number;
  myReaction?: string | null;
  onReact: (postId: string, reaction: string) => Promise<void>;
  onCommentClick?: () => void;
}

const reactions = [
  { type: 'like', emoji: '👍' },
  { type: 'fire', emoji: '🔥' },
  { type: 'clap', emoji: '👏' },
];

export const ReactionBar = ({
  postId, reactionCount, commentCount,
  myReaction, onReact, onCommentClick,
}: ReactionBarProps) => {
  const [showPicker, setShowPicker] = useState(false);
  const [localCount, setLocalCount] = useState(reactionCount);
  const [localReaction, setLocalReaction] = useState(myReaction);

  const handleReact = async (type: string) => {
    setShowPicker(false);
    const wasReacted = localReaction === type;
    setLocalReaction(wasReacted ? null : type);
    setLocalCount(prev => wasReacted ? Math.max(0, prev - 1) : prev + 1);
    await onReact(postId, type);
  };

  const currentEmoji = reactions.find(r => r.type === localReaction)?.emoji;

  return (
    <div className="flex items-center gap-4 pt-3 border-t border-slate-100 relative">
      {/* Reaction button */}
      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
            localReaction ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <span>{currentEmoji || '👍'}</span>
          <span>{localCount > 0 ? localCount : 'React'}</span>
        </button>

        {/* Reaction picker */}
        {showPicker && (
          <div className="absolute bottom-8 left-0 bg-white rounded-xl border border-slate-200 shadow-lg p-2 flex gap-1 z-10">
            {reactions.map(r => (
              <button
                key={r.type}
                onClick={() => handleReact(r.type)}
                className={`w-9 h-9 rounded-lg text-lg hover:bg-slate-100 transition-colors flex items-center justify-center ${
                  localReaction === r.type ? 'bg-slate-100 ring-2 ring-slate-300' : ''
                }`}
              >
                {r.emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Comment button */}
      <button
        onClick={onCommentClick}
        className="flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors"
      >
        <span>💬</span>
        <span>{commentCount > 0 ? commentCount : 'Comment'}</span>
      </button>
    </div>
  );
};