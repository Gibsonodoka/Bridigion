'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface Question {
  id: string;
  question: string;
  options: string[];
}

interface QuizResult {
  score: number;
  total: number;
  passed: boolean;
  percentage: number;
}

interface QuizPlayerProps {
  questions: Question[];
  onSubmit: (answers: number[]) => Promise<QuizResult | null>;
  lastAttempt?: { score: number; total: number; passed: boolean } | null;
}

export const QuizPlayer = ({ questions, onSubmit, lastAttempt }: QuizPlayerProps) => {
  const [answers, setAnswers] = useState<number[]>(new Array(questions.length).fill(-1));
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);

  const handleSelect = (questionIndex: number, optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (answers.includes(-1)) return;
    setLoading(true);
    try {
      const res = await onSubmit(answers);
      if (res) setResult(res);
    } finally {
      setLoading(false);
    }
  };

  const allAnswered = !answers.includes(-1);

  if (!started && lastAttempt) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">❓ Quiz</h3>
        <div className={`rounded-lg p-4 mb-4 ${lastAttempt.passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <p className={`font-medium text-sm ${lastAttempt.passed ? 'text-green-700' : 'text-red-700'}`}>
            {lastAttempt.passed ? '✅ Passed' : '❌ Failed'} — Last attempt: {lastAttempt.score}/{lastAttempt.total}
          </p>
        </div>
        <Button onClick={() => setStarted(true)} variant="outline">
          {lastAttempt.passed ? 'Retake Quiz' : 'Try Again'}
        </Button>
      </div>
    );
  }

  if (result) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Quiz Results</h3>
        <div className={`rounded-xl p-6 text-center ${result.passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="text-5xl mb-3">{result.passed ? '🎉' : '😔'}</div>
          <p className={`text-2xl font-black mb-1 ${result.passed ? 'text-green-700' : 'text-red-700'}`}>
            {result.percentage}%
          </p>
          <p className={`font-medium ${result.passed ? 'text-green-700' : 'text-red-700'}`}>
            {result.score}/{result.total} correct · {result.passed ? 'Passed!' : 'Failed — 70% required'}
          </p>
        </div>
        {!result.passed && (
          <Button onClick={() => { setResult(null); setAnswers(new Array(questions.length).fill(-1)); }} className="mt-4" variant="outline">
            Try Again
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="font-semibold text-slate-900 mb-2">❓ Quiz</h3>
      <p className="text-sm text-slate-500 mb-6">{questions.length} questions · 70% to pass</p>

      <div className="space-y-6">
        {questions.map((q, qi) => (
          <div key={q.id}>
            <p className="font-medium text-slate-900 mb-3 text-sm">
              {qi + 1}. {q.question}
            </p>
            <div className="space-y-2">
              {q.options.map((option, oi) => (
                <button
                  key={oi}
                  onClick={() => handleSelect(qi, oi)}
                  className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors ${
                    answers[qi] === oi
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Button
        onClick={handleSubmit}
        className="mt-6 w-full"
        disabled={!allAnswered || loading}
      >
        {loading ? 'Submitting...' : 'Submit Quiz'}
      </Button>
    </div>
  );
};