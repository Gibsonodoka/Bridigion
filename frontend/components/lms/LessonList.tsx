'use client';

import { useRouter } from 'next/navigation';

interface Lesson {
  id: string;
  title: string;
  type: string;
  duration_minutes?: number;
  completed?: boolean;
  has_quiz?: boolean;
}

interface LessonListProps {
  courseId: string;
  lessons: Lesson[];
  enrolled: boolean;
}

const typeIcons: Record<string, string> = {
  video: '🎬',
  text: '📄',
  quiz: '❓',
};

export const LessonList = ({ courseId, lessons, enrolled }: LessonListProps) => {
  const router = useRouter();

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h3 className="font-semibold text-slate-900">Course Content</h3>
        <p className="text-sm text-slate-500 mt-0.5">{lessons.length} lessons</p>
      </div>
      <div className="divide-y divide-slate-100">
        {lessons.map((lesson, index) => (
          <div
            key={lesson.id}
            className={`flex items-center gap-4 px-6 py-4 transition-colors ${
              enrolled ? 'hover:bg-slate-50 cursor-pointer' : 'opacity-60 cursor-not-allowed'
            }`}
            onClick={() => enrolled && router.push(`/courses/${courseId}/lessons/${lesson.id}`)}
          >
            {/* Number / Check */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
              lesson.completed ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
            }`}>
              {lesson.completed ? '✓' : index + 1}
            </div>

            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${lesson.completed ? 'text-slate-500' : 'text-slate-900'}`}>
                {lesson.title}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-slate-400">
                  {typeIcons[lesson.type]} {lesson.type}
                </span>
                {lesson.duration_minutes && (
                  <span className="text-xs text-slate-400">· {lesson.duration_minutes} min</span>
                )}
                {lesson.has_quiz && (
                  <span className="text-xs text-slate-400">· has quiz</span>
                )}
              </div>
            </div>

            {enrolled && (
              <span className="text-slate-300 text-sm">→</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};