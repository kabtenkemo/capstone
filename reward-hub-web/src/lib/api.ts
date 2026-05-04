import type {
  AuthProfile,
  CommentEntry,
  CommentRequestPayload,
  LeaderboardEntry,
  LoginPayload,
  LoginResponse,
  PointHistoryEntry,
  PointRequestPayload,
  StudentOption
} from '../types';

// Default API endpoints for dev/prod. In Vercel production we prefer the
// configured VITE_API_BASE_URL (set to `/api`), otherwise fall back to the
// deployed backend URL to avoid mixed-content or routing issues.
const _env = import.meta.env;
const defaultProd = 'https://reward-hub.runasp.net/api';
const defaultDev = 'https://localhost:7199/api';
const envBase = _env.VITE_API_BASE_URL;
const API_BASE_URL = normalizeApiBase(resolveApiBase(_env.PROD, envBase));

function resolveApiBase(isProd: boolean, envValue?: string) {
  if (!isProd) {
    return envValue || defaultDev;
  }

  if (!envValue) {
    return '/api';
  }

  const isHttpsPage = typeof window !== 'undefined' && window.location?.protocol === 'https:';
  if (isHttpsPage && envValue.startsWith('http:')) {
    return '/api';
  }

  return envValue || defaultProd;
}

function normalizeApiBase(rawBase: string) {
  const trimmed = rawBase.replace(/\/$/, '');
  if (trimmed.endsWith('/api')) {
    return trimmed;
  }

  return `${trimmed}/api`;
}

function getToken() {
  return localStorage.getItem('rewardhub_token');
}

function parseTokenResponse(payload: LoginResponse) {
  return payload.token ?? payload.Token ?? '';
}

async function readError(response: Response) {
  const text = await response.text();

  if (!text) {
    return `Request failed with status ${response.status}`;
  }

  try {
    const parsed = JSON.parse(text) as { message?: string; Message?: string; error?: string; Error?: string };
    return parsed.message ?? parsed.Message ?? parsed.error ?? parsed.Error ?? text;
  } catch {
    return text;
  }
}

async function request<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(init.headers);
  const hasBody = init.body !== undefined && init.body !== null;

  if (hasBody && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const authToken = token ?? getToken();
  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as T;
  }
}

export const api = {
  login: async (payload: LoginPayload) => {
    const response = await request<LoginResponse>('/Auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    }, undefined);

    return {
      token: parseTokenResponse(response),
      role: response.role ?? response.Role ?? null
    };
  },
  me: async () => request<AuthProfile>('/Auth/me'),
  child: async () => request<AuthProfile>('/Auth/child'),
  students: async () => request<StudentOption[]>('/Auth/students', { method: 'GET' }),
  leaderboard: async () => request<LeaderboardEntry[]>('/Points/leaderboard', { method: 'GET' }, undefined),
  addPoints: async (payload: PointRequestPayload) => request('/Points/add', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  deductPoints: async (payload: PointRequestPayload) => request('/Points/deduct', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  historyAll: async () => request<PointHistoryEntry[]>('/Points/all-history', { method: 'GET' }),
  historyByClass: async (classId: number) => request<PointHistoryEntry[]>(`/Points/class/${classId}`, { method: 'GET' }),
  historyByStudent: async (studentId: number) => request<PointHistoryEntry[]>(`/Points/student/${studentId}`, { method: 'GET' }),
  commentsAll: async () => request<CommentEntry[]>('/Comments/all', { method: 'GET' }),
  commentsByClass: async (classId: number) => request<CommentEntry[]>(`/Comments/class/${classId}`, { method: 'GET' }),
  commentsByStudent: async (studentId: number) => request<CommentEntry[]>(`/Comments/student/${studentId}`, { method: 'GET' }),
  addComment: async (payload: CommentRequestPayload) => request('/Comments/add', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
};
