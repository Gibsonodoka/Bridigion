'use client';

import { useRouter } from 'next/navigation';
import { ProgressBar } from './ProgressBar';

interface Enrollment {
  status: string;
  progress_percent: number;
}

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    description?: string;
    thumbnail_url?: string;
    role_target?: string;
    duration_minutes?: number;
    lessons?: { count: number }[];
    enrollment?: Enrollment | null;
  };
}

const roleColors: Record<string, string> = {
  guard: 'bg-blue-100 text-blue-700',
  driver: 'bg-purple-100 text-purple-700',
  bouncer: 'bg-slate-100 text-slate-700',
};

export const CourseCard = ({ course }: CourseCardProps) => {
  const router = useRouter();
  const enrollment = course.enrollment;
  const lessonCount = course.lessons?.[0]?.count || 0;

  return (
    <div
      className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer"
      onClick={() => router.push(`/courses/${course.id}`)}
    >
      {/* Thumbnail */}
      <div className="h-40 bg-gradient-to-br from-slate-800 to-slate-600 flex items-center justify-center">
        {course.thumbnail_url ? (
          <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-5xl">📚</span>
        )}
      </div>

      <div className="p-5">
        {/* Tags */}
        <div className="flex items-center gap-2 mb-3">
          {course.role_target && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${roleColors[course.role_target] || 'bg-slate-100 text-slate-600'}`}>
              {course.role_target}
            </span>
          )}
          {!course.role_target && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
              All Roles
            </span>
          )}
          {enrollment?.status === 'completed' && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
              ✓ Completed
            </span>
          )}
        </div>

        <h3 className="font-semibold text-slate-900 mb-1 line-clamp-2">{course.title}</h3>
        {course.description && (
          <p className="text-slate-500 text-sm mb-3 line-clamp-2">{course.description}</p>
        )}

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
          <span>📖 {lessonCount} lessons</span>
          {course.duration_minutes && <span>⏱ {course.duration_minutes} min</span>}
        </div>

        {/* Progress */}
        {enrollment ? (
          <ProgressBar percent={enrollment.progress_percent} size="sm" />
        ) : (
          <div className="text-xs text-slate-400 font-medium">Not enrolled</div>
        )}
      </div>
    </div>
  );
};