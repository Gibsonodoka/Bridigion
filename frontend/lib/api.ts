import axios from 'axios';
import {
  ApiResponse,
  OtpPayload,
  VerifyOtpPayload,
  ProfilePayload,
  RolePayload,
  NinPayload,
  SubmitDocumentsPayload,
  AdminStats,
  VerificationUser,
} from '@/types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export const authApi = {
  sendOtp: (payload: OtpPayload) =>
    api.post<ApiResponse<{ phone: string }>>('/auth/send-otp', payload),

  verifyOtp: (payload: VerifyOtpPayload) =>
    api.post<ApiResponse<{ phone: string; verified: boolean }>>('/auth/verify-otp', payload),

  completeProfile: (payload: ProfilePayload) =>
    api.post<ApiResponse<ProfilePayload>>('/auth/complete-profile', payload),

  selectRole: (payload: RolePayload) =>
    api.post<ApiResponse<RolePayload>>('/auth/select-role', payload),

  verifyNin: (payload: NinPayload) =>
    api.post<ApiResponse<{ verified: boolean }>>('/verification/nin', payload),

  submitDocuments: (payload: SubmitDocumentsPayload) =>
    api.post<ApiResponse<{ userId: string }>>('/verification/submit', payload),

  // Admin endpoints
  adminLogin: (payload: { email: string; password: string }) =>
    api.post<ApiResponse<{ token: string; admin: { id: string; email: string; full_name: string; role: string } }>>('/admin/login', payload),

  adminGetStats: (token: string) =>
    api.get<ApiResponse<AdminStats>>('/admin/stats', {
      headers: { Authorization: `Bearer ${token}` },
    }),

  adminGetVerifications: (token: string, page = 1) =>
    api.get<ApiResponse<VerificationUser[]>>(`/admin/verifications?page=${page}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  adminGetUser: (token: string, id: string) =>
    api.get<ApiResponse<VerificationUser>>(`/admin/verifications/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  adminApprove: (token: string, id: string) =>
    api.put<ApiResponse<object>>(`/admin/verifications/${id}/approve`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  adminReject: (token: string, id: string, reason: string) =>
    api.put<ApiResponse<object>>(`/admin/verifications/${id}/reject`, { reason }, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  adminFlag: (token: string, id: string, reason: string) =>
    api.put<ApiResponse<object>>(`/admin/verifications/${id}/flag`, { reason }, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  adminGetUsers: (token: string, page = 1, filters?: { status?: string; role?: string; search?: string }) => {
    const params = new URLSearchParams({ page: String(page), ...filters });
    return api.get<ApiResponse<VerificationUser[]>>(`/admin/users?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // User login
userLoginSendOtp: (payload: { phone: string }) =>
  api.post<ApiResponse<{ phone: string }>>('/user/login/send-otp', payload),

userLoginVerifyOtp: (payload: { phone: string; otp: string }) =>
  api.post<ApiResponse<{
    token: string;
    user: {
      id: string;
      phone: string;
      email?: string;
      full_name?: string;
      role?: string;
      verification_status: string;
    };
  }>>('/user/login/verify-otp', payload),

userGetProfile: (token: string) =>
  api.get<ApiResponse<VerificationUser>>('/user/profile', {
    headers: { Authorization: `Bearer ${token}` },
  }),

  userUpdateProfile: (token: string, payload: { full_name?: string; email?: string; date_of_birth?: string }) =>
  api.put<ApiResponse<VerificationUser>>('/user/profile', payload, {
    headers: { Authorization: `Bearer ${token}` },
  }),

  userGetStatus: (token: string) =>
  api.get<ApiResponse<{
    status: string;
    steps: { key: string; label: string; done: boolean }[];
    manualReview: boolean;
  }>>('/user/status', {
    headers: { Authorization: `Bearer ${token}` },
  }),
  uploadSelfie: (payload: { phone: string; imageData: string }) =>
  api.post<ApiResponse<{ selfieUrl: string }>>('/verification/selfie', payload),

  // LMS - User
lmsGetCourses: (token: string) =>
  api.get<ApiResponse<unknown[]>>('/lms/courses', { headers: { Authorization: `Bearer ${token}` } }),

lmsGetCourse: (token: string, id: string) =>
  api.get<ApiResponse<unknown>>(`/lms/courses/${id}`, { headers: { Authorization: `Bearer ${token}` } }),

lmsEnroll: (token: string, id: string) =>
  api.post<ApiResponse<unknown>>(`/lms/courses/${id}/enroll`, {}, { headers: { Authorization: `Bearer ${token}` } }),

lmsGetEnrollments: (token: string) =>
  api.get<ApiResponse<unknown[]>>('/lms/enrollments', { headers: { Authorization: `Bearer ${token}` } }),

lmsGetLesson: (token: string, courseId: string, lessonId: string) =>
  api.get<ApiResponse<unknown>>(`/lms/courses/${courseId}/lessons/${lessonId}`, { headers: { Authorization: `Bearer ${token}` } }),

lmsCompleteLesson: (token: string, lessonId: string, courseId: string) =>
  api.post<ApiResponse<unknown>>(`/lms/lessons/${lessonId}/complete`, { courseId }, { headers: { Authorization: `Bearer ${token}` } }),

lmsSubmitQuiz: (token: string, lessonId: string, courseId: string, answers: number[]) =>
  api.post<ApiResponse<unknown>>(`/lms/lessons/${lessonId}/quiz`, { courseId, answers }, { headers: { Authorization: `Bearer ${token}` } }),

  // LMS - Admin
  adminLmsGetCourses: (token: string, page = 1) =>
    api.get<ApiResponse<unknown[]>>(`/lms/admin/courses?page=${page}`, { headers: { Authorization: `Bearer ${token}` } }),

  adminLmsGetCourse: (token: string, id: string) =>
    api.get<ApiResponse<unknown>>(`/lms/admin/courses/${id}`, { headers: { Authorization: `Bearer ${token}` } }),

  adminLmsCreateCourse: (token: string, payload: object) =>
    api.post<ApiResponse<unknown>>('/lms/admin/courses', payload, { headers: { Authorization: `Bearer ${token}` } }),

  adminLmsUpdateCourse: (token: string, id: string, payload: object) =>
    api.put<ApiResponse<unknown>>(`/lms/admin/courses/${id}`, payload, { headers: { Authorization: `Bearer ${token}` } }),

  adminLmsDeleteCourse: (token: string, id: string) =>
    api.delete<ApiResponse<unknown>>(`/lms/admin/courses/${id}`, { headers: { Authorization: `Bearer ${token}` } }),

  adminLmsCreateLesson: (token: string, courseId: string, payload: object) =>
    api.post<ApiResponse<unknown>>(`/lms/admin/courses/${courseId}/lessons`, payload, { headers: { Authorization: `Bearer ${token}` } }),

  adminLmsCreateQuestion: (token: string, lessonId: string, payload: object) =>
    api.post<ApiResponse<unknown>>(`/lms/admin/lessons/${lessonId}/questions`, payload, { headers: { Authorization: `Bearer ${token}` } }),

  // ─── Marketplace: Company ─────────────────────────────────────────────────────
companyRegister: (payload: object) =>
  api.post<ApiResponse<unknown>>('/marketplace/company/register', payload),
companyLogin: (payload: object) =>
  api.post<ApiResponse<{ token: string; company: unknown }>>('/marketplace/company/login', payload),
companyProfile: (token: string) =>
  api.get<ApiResponse<unknown>>('/marketplace/company/profile', { headers: { Authorization: `Bearer ${token}` } }),
companyGetJobs: (token: string) =>
  api.get<ApiResponse<unknown[]>>('/marketplace/company/jobs', { headers: { Authorization: `Bearer ${token}` } }),
companyCreateJob: (token: string, payload: object) =>
  api.post<ApiResponse<unknown>>('/marketplace/company/jobs', payload, { headers: { Authorization: `Bearer ${token}` } }),
companyGetApplications: (token: string, jobId: string) =>
  api.get<ApiResponse<unknown[]>>(`/marketplace/company/jobs/${jobId}/applications`, { headers: { Authorization: `Bearer ${token}` } }),
companyUpdateApplication: (token: string, id: string, status: string) =>
  api.put<ApiResponse<unknown>>(`/marketplace/company/applications/${id}`, { status }, { headers: { Authorization: `Bearer ${token}` } }),
companyGetTalent: (token: string, role?: string) =>
  api.get<ApiResponse<unknown[]>>(`/marketplace/company/talent${role ? `?role=${role}` : ''}`, { headers: { Authorization: `Bearer ${token}` } }),

// ─── Marketplace: User ────────────────────────────────────────────────────────
userGetJobs: (token: string, role?: string) =>
  api.get<ApiResponse<unknown[]>>(`/marketplace/jobs${role ? `?role=${role}` : ''}`, { headers: { Authorization: `Bearer ${token}` } }),
userGetJob: (token: string, id: string) =>
  api.get<ApiResponse<unknown>>(`/marketplace/jobs/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
userApplyJob: (token: string, id: string, cover_note?: string) =>
  api.post<ApiResponse<unknown>>(`/marketplace/jobs/${id}/apply`, { cover_note }, { headers: { Authorization: `Bearer ${token}` } }),
userGetApplications: (token: string) =>
  api.get<ApiResponse<unknown[]>>('/marketplace/applications', { headers: { Authorization: `Bearer ${token}` } }),

// ─── Marketplace: Admin ───────────────────────────────────────────────────────
adminGetCompanies: (token: string, page = 1) =>
  api.get<ApiResponse<unknown[]>>(`/marketplace/admin/companies?page=${page}`, { headers: { Authorization: `Bearer ${token}` } }),
adminUpdateCompany: (token: string, id: string, status: string) =>
  api.put<ApiResponse<unknown>>(`/marketplace/admin/companies/${id}`, { status }, { headers: { Authorization: `Bearer ${token}` } }),
adminGetMarketplaceJobs: (token: string, status?: string) =>
  api.get<ApiResponse<unknown[]>>(`/marketplace/admin/jobs${status ? `?status=${status}` : ''}`, { headers: { Authorization: `Bearer ${token}` } }),
adminUpdateMarketplaceJob: (token: string, id: string, status: string) =>
  api.put<ApiResponse<unknown>>(`/marketplace/admin/jobs/${id}`, { status }, { headers: { Authorization: `Bearer ${token}` } }),
adminCreateMarketplaceJob: (token: string, payload: object) =>
  api.post<ApiResponse<unknown>>('/marketplace/admin/jobs', payload, { headers: { Authorization: `Bearer ${token}` } }),

// ─── Community: User ──────────────────────────────────────────────────────────
communityGetFeed: (token: string, page = 1) =>
  api.get<ApiResponse<unknown[]>>(`/community/feed?page=${page}`, { headers: { Authorization: `Bearer ${token}` } }),
communityCreatePost: (token: string, payload: object) =>
  api.post<ApiResponse<unknown>>('/community/posts', payload, { headers: { Authorization: `Bearer ${token}` } }),
communityGetPost: (token: string, id: string) =>
  api.get<ApiResponse<unknown>>(`/community/posts/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
communityGetMyPosts: (token: string) =>
  api.get<ApiResponse<unknown[]>>('/community/posts/mine', { headers: { Authorization: `Bearer ${token}` } }),
communityAddComment: (token: string, postId: string, content: string) =>
  api.post<ApiResponse<unknown>>(`/community/posts/${postId}/comments`, { content }, { headers: { Authorization: `Bearer ${token}` } }),
communityDeleteComment: (token: string, postId: string, commentId: string) =>
  api.delete<ApiResponse<unknown>>(`/community/posts/${postId}/comments/${commentId}`, { headers: { Authorization: `Bearer ${token}` } }),
communityReact: (token: string, postId: string, reaction: string) =>
  api.post<ApiResponse<unknown>>(`/community/posts/${postId}/react`, { reaction }, { headers: { Authorization: `Bearer ${token}` } }),
communityFollowUser: (token: string, userId: string) =>
  api.post<ApiResponse<unknown>>(`/community/follow/user/${userId}`, {}, { headers: { Authorization: `Bearer ${token}` } }),
communityFollowCompany: (token: string, companyId: string) =>
  api.post<ApiResponse<unknown>>(`/community/follow/company/${companyId}`, {}, { headers: { Authorization: `Bearer ${token}` } }),

// ─── Community: Company ───────────────────────────────────────────────────────
communityCompanyCreatePost: (token: string, payload: object) =>
  api.post<ApiResponse<unknown>>('/community/company/posts', payload, { headers: { Authorization: `Bearer ${token}` } }),
communityCompanyGetPosts: (token: string) =>
  api.get<ApiResponse<unknown[]>>('/community/company/posts', { headers: { Authorization: `Bearer ${token}` } }),
communityCompanyAddComment: (token: string, postId: string, content: string) =>
  api.post<ApiResponse<unknown>>(`/community/company/posts/${postId}/comments`, { content }, { headers: { Authorization: `Bearer ${token}` } }),
communityCompanyReact: (token: string, postId: string, reaction: string) =>
  api.post<ApiResponse<unknown>>(`/community/company/posts/${postId}/react`, { reaction }, { headers: { Authorization: `Bearer ${token}` } }),

// ─── Community: Admin ─────────────────────────────────────────────────────────
communityAdminCreatePost: (token: string, payload: object) =>
  api.post<ApiResponse<unknown>>('/community/admin/posts', payload, { headers: { Authorization: `Bearer ${token}` } }),
communityAdminGetPending: (token: string, page = 1) =>
  api.get<ApiResponse<unknown[]>>(`/community/admin/posts/pending?page=${page}`, { headers: { Authorization: `Bearer ${token}` } }),
communityAdminGetAll: (token: string, status?: string) =>
  api.get<ApiResponse<unknown[]>>(`/community/admin/posts${status ? `?status=${status}` : ''}`, { headers: { Authorization: `Bearer ${token}` } }),
communityAdminModerate: (token: string, id: string, status: string) =>
  api.put<ApiResponse<unknown>>(`/community/admin/posts/${id}/moderate`, { status }, { headers: { Authorization: `Bearer ${token}` } }),
// ─── Notifications: User ──────────────────────────────────────────────────────
getNotifications: (token: string, page = 1) =>
  api.get<ApiResponse<unknown>>(`/notifications/user?page=${page}`, { headers: { Authorization: `Bearer ${token}` } }),
markAllNotificationsRead: (token: string) =>
  api.put<ApiResponse<unknown>>('/notifications/read-all', {}, { headers: { Authorization: `Bearer ${token}` } }),
markNotificationRead: (token: string, id: string) =>
  api.put<ApiResponse<unknown>>(`/notifications/${id}/read`, {}, { headers: { Authorization: `Bearer ${token}` } }),

// ─── Notifications: Company ───────────────────────────────────────────────────
getCompanyNotifications: (token: string, page = 1) =>
  api.get<ApiResponse<unknown>>(`/notifications/company?page=${page}`, { headers: { Authorization: `Bearer ${token}` } }),
markAllCompanyNotificationsRead: (token: string) =>
  api.put<ApiResponse<unknown>>('/notifications/read-all/company', {}, { headers: { Authorization: `Bearer ${token}` } }),

// ─── Notifications: Admin ─────────────────────────────────────────────────────
getAdminNotifications: (token: string, page = 1) =>
  api.get<ApiResponse<unknown>>(`/notifications/admin?page=${page}`, { headers: { Authorization: `Bearer ${token}` } }),
markAllAdminNotificationsRead: (token: string) =>
  api.put<ApiResponse<unknown>>('/notifications/read-all/admin', {}, { headers: { Authorization: `Bearer ${token}` } }),
  };

  

export default api;