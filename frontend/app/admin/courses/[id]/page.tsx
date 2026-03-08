'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { authApi } from '@/lib/api';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface QuizQuestion { id: string; question: string; options: string[]; correct_index: number; }
interface Lesson { id: string; title: string; type: string; order_index: number; duration_minutes?: number; content?: string; video_url?: string; quiz_questions?: QuizQuestion[]; }
interface Course { id: string; title: string; description?: string; status: string; role_target?: string; duration_minutes?: number; lessons?: Lesson[]; }

export default function AdminCourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState<string | null>(null);
  const [newLesson, setNewLesson] = useState({ title: '', type: 'text', content: '', video_url: '', duration_minutes: '' });
  const [newQuestion, setNewQuestion] = useState({ question: '', options: ['', '', '', ''], correct_index: 0 });

  const getToken = () => localStorage.getItem('admin_token') || '';

  const fetchCourse = useCallback(() => {
    const token = getToken();
    if (!token) { router.push('/admin/login'); return; }
    setLoading(true);
    authApi.adminLmsGetCourse(token, id)
      .then(res => setCourse(res.data.data as Course))
      .catch(() => router.push('/admin/courses'))
      .finally(() => setLoading(false));
  }, [id, router]);

  useEffect(() => { fetchCourse(); }, [fetchCourse]);

  const handlePublish = async () => {
    setSaving(true);
    try {
      await authApi.adminLmsUpdateCourse(getToken(), id, {
        status: course?.status === 'published' ? 'draft' : 'published',
      });
      fetchCourse();
    } finally {
      setSaving(false);
    }
  };

  const handleAddLesson = async () => {
    if (!newLesson.title) return;
    try {
      await authApi.adminLmsCreateLesson(getToken(), id, {
        title: newLesson.title,
        type: newLesson.type,
        content: newLesson.content || undefined,
        video_url: newLesson.video_url || undefined,
        duration_minutes: newLesson.duration_minutes ? Number(newLesson.duration_minutes) : undefined,
        order_index: (course?.lessons?.length || 0),
      });
      setNewLesson({ title: '', type: 'text', content: '', video_url: '', duration_minutes: '' });
      setShowAddLesson(false);
      fetchCourse();
    } catch {
      console.error('Failed to add lesson');
    }
  };

  const handleAddQuestion = async (lessonId: string) => {
    if (!newQuestion.question || newQuestion.options.some(o => !o)) return;
    try {
      await authApi.adminLmsCreateQuestion(getToken(), lessonId, {
        question: newQuestion.question,
        options: newQuestion.options,
        correct_index: newQuestion.correct_index,
        order_index: 0,
      });
      setNewQuestion({ question: '', options: ['', '', '', ''], correct_index: 0 });
      setShowAddQuestion(null);
      fetchCourse();
    } catch {
      console.error('Failed to add question');
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <button onClick={() => router.push('/admin/courses')} className="text-sm text-slate-500 hover:text-slate-900 mb-6 flex items-center gap-1">
          ← Back to Courses
        </button>

        {loading ? (
          <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="bg-slate-200 rounded-xl h-32 animate-pulse" />)}</div>
        ) : course ? (
          <div className="space-y-6">

            {/* Course Header */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">{course.title}</h1>
                  {course.description && <p className="text-slate-500 text-sm mt-1">{course.description}</p>}
                  <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
                    <span className="capitalize">Target: {course.role_target || 'All roles'}</span>
                    <span>{course.duration_minutes || 0} min</span>
                    <span className={`px-2 py-0.5 rounded-full font-medium capitalize ${course.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {course.status}
                    </span>
                  </div>
                </div>
                <Button
                  onClick={handlePublish}
                  disabled={saving}
                  className={course.status === 'published' ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}
                >
                  {saving ? 'Saving...' : course.status === 'published' ? 'Unpublish' : '🚀 Publish'}
                </Button>
              </div>
            </div>

            {/* Lessons */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900">Lessons ({course.lessons?.length || 0})</h3>
                <Button onClick={() => setShowAddLesson(!showAddLesson)} variant="outline">
                  + Add Lesson
                </Button>
              </div>

              {/* Add Lesson Form */}
              {showAddLesson && (
                <div className="p-6 border-b border-slate-100 bg-slate-50 space-y-4">
                  <h4 className="font-medium text-slate-900 text-sm">New Lesson</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label>Title *</Label>
                      <Input placeholder="Lesson title" value={newLesson.title} onChange={e => setNewLesson(p => ({ ...p, title: e.target.value }))} />
                    </div>
                    <div className="space-y-1">
                      <Label>Type</Label>
                      <select value={newLesson.type} onChange={e => setNewLesson(p => ({ ...p, type: e.target.value }))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                        <option value="text">Text</option>
                        <option value="video">Video</option>
                        <option value="quiz">Quiz</option>
                      </select>
                    </div>
                  </div>
                  {newLesson.type === 'video' && (
                    <div className="space-y-1">
                      <Label>Video URL</Label>
                      <Input placeholder="YouTube / Vimeo URL" value={newLesson.video_url} onChange={e => setNewLesson(p => ({ ...p, video_url: e.target.value }))} />
                    </div>
                  )}
                  {newLesson.type === 'text' && (
                    <div className="space-y-1">
                      <Label>Content</Label>
                      <textarea
                        placeholder="Lesson content..."
                        value={newLesson.content}
                        onChange={e => setNewLesson(p => ({ ...p, content: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg p-3 text-sm resize-none h-24 focus:outline-none"
                      />
                    </div>
                  )}
                  <div className="space-y-1 w-32">
                    <Label>Duration (min)</Label>
                    <Input type="number" placeholder="15" value={newLesson.duration_minutes} onChange={e => setNewLesson(p => ({ ...p, duration_minutes: e.target.value }))} />
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={handleAddLesson}>Add Lesson</Button>
                    <Button variant="outline" onClick={() => setShowAddLesson(false)}>Cancel</Button>
                  </div>
                </div>
              )}

              {/* Lessons List */}
              {!course.lessons || course.lessons.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">No lessons yet. Add your first lesson.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {course.lessons.sort((a, b) => a.order_index - b.order_index).map((lesson, i) => (
                    <div key={lesson.id} className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {i + 1}
                          </span>
                          <div>
                            <p className="font-medium text-slate-900 text-sm">{lesson.title}</p>
                            <p className="text-xs text-slate-400 capitalize">{lesson.type} · {lesson.duration_minutes || 0} min</p>
                          </div>
                        </div>
                        {lesson.type === 'quiz' && (
                          <Button variant="outline" onClick={() => setShowAddQuestion(showAddQuestion === lesson.id ? null : lesson.id)}>
                            + Add Question
                          </Button>
                        )}
                      </div>

                      {/* Quiz Questions */}
                      {lesson.quiz_questions && lesson.quiz_questions.length > 0 && (
                        <div className="ml-10 space-y-2">
                          {lesson.quiz_questions.map((q, qi) => (
                            <div key={q.id} className="bg-slate-50 rounded-lg p-3 text-sm">
                              <p className="font-medium text-slate-700">{qi + 1}. {q.question}</p>
                              <div className="mt-1 space-y-1">
                                {q.options.map((opt, oi) => (
                                  <p key={oi} className={`text-xs pl-2 ${oi === q.correct_index ? 'text-green-600 font-medium' : 'text-slate-400'}`}>
                                    {oi === q.correct_index ? '✓' : '○'} {opt}
                                  </p>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add Question Form */}
                      {showAddQuestion === lesson.id && (
                        <div className="ml-10 mt-3 bg-slate-50 rounded-lg p-4 space-y-3">
                          <h5 className="font-medium text-slate-900 text-sm">New Question</h5>
                          <div className="space-y-1">
                            <Label>Question</Label>
                            <Input placeholder="Enter question..." value={newQuestion.question} onChange={e => setNewQuestion(p => ({ ...p, question: e.target.value }))} />
                          </div>
                          <div className="space-y-2">
                            <Label>Options (mark correct one)</Label>
                            {newQuestion.options.map((opt, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name="correct"
                                  checked={newQuestion.correct_index === i}
                                  onChange={() => setNewQuestion(p => ({ ...p, correct_index: i }))}
                                  className="flex-shrink-0"
                                />
                                <Input
                                  placeholder={`Option ${i + 1}`}
                                  value={opt}
                                  onChange={e => {
                                    const opts = [...newQuestion.options];
                                    opts[i] = e.target.value;
                                    setNewQuestion(p => ({ ...p, options: opts }));
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-3">
                            <Button onClick={() => handleAddQuestion(lesson.id)}>Add Question</Button>
                            <Button variant="outline" onClick={() => setShowAddQuestion(null)}>Cancel</Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-slate-500">Course not found.</p>
        )}
      </main>
    </div>
  );
}