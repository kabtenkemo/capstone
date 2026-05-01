export interface AuthProfile {
  userId: number;
  username: string;
  email: string;
  points: number;
  level: string | null;
  className: string | null;
  userRole: string | null;
}

export interface LoginResponse {
  token?: string;
  Token?: string;
  role?: string;
  Role?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface PointRequestPayload {
  studentId: number;
  amount: number;
  reason: string;
}

export interface CommentRequestPayload {
  content: string;
  targetUserId: number;
}

export interface StudentOption {
  userId: number;
  username: string;
  classId: number | null;
  className: string | null;
  parentId?: number | null;
}

export interface LeaderboardEntry {
  username: string;
  points: number;
  levelName: string | null;
  classId: number | null;
}

export interface PointHistoryEntry {
  historyId: number;
  amount: number;
  reason: string;
  createdAt: string;
  teacherName: string;
  studentName?: string;
  studentClassId?: number | null;
}

export interface CommentEntry {
  commentId: number;
  content: string;
  createdAt: string;
  authorName: string;
  authorRole?: string | null;
  targetStudentName?: string | null;
  targetStudentClassId?: number | null;
}
