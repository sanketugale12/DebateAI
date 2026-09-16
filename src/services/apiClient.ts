import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { User, DebateSession, DebateMessage, DebateResult, ArgumentAnalysis, FallacyDetection } from '../types';

const TOKEN_STORAGE_KEY = 'debateai_jwt_token';

// Create configured Axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Automatically attach JWT token if present
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    try {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Ignore localStorage access issues
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401s and standardize errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('API returned 401 Unauthorized - clearing expired token');
      try {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      } catch {
        // ignore
      }
    }
    return Promise.reject(error);
  }
);

// Auth Service using Axios
export const authApi = {
  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_STORAGE_KEY);
    } catch {
      return null;
    }
  },

  setToken(token: string): void {
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } catch (e) {
      console.warn('Failed to store JWT token in localStorage', e);
    }
  },

  clearToken(): void {
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch {
      // ignore
    }
  },

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await apiClient.post('/auth/login', { email, password });
    if (res.data.token) {
      this.setToken(res.data.token);
    }
    return res.data;
  },

  async register(
    name: string,
    email: string,
    password: string,
    tier: string
  ): Promise<{ token: string; user: User }> {
    const res = await apiClient.post('/auth/register', { name, email, password, tier });
    if (res.data.token) {
      this.setToken(res.data.token);
    }
    return res.data;
  },

  async getMe(): Promise<User> {
    const res = await apiClient.get('/auth/me');
    return res.data.user;
  },

  async forgotPassword(email: string): Promise<{ status: string; code: string; message: string }> {
    const res = await apiClient.post('/auth/forgot-password', { email });
    return res.data;
  },

  async resetPassword(email: string, code: string, newPassword: string): Promise<{ status: string; message: string }> {
    const res = await apiClient.post('/auth/reset-password', { email, code, newPassword });
    return res.data;
  }
};

// Debate Backend Service using Axios
export const debateApi = {
  async respond(payload: {
    topic: string;
    category?: string;
    userPosition: string;
    aiPosition: string;
    difficulty: string;
    roundNumber: number;
    phaseName: string;
    userArgument: string;
  }): Promise<{ status: string; message: string; phaseName: string }> {
    const res = await apiClient.post('/debate/respond', payload);
    return res.data;
  },

  async analyze(payload: {
    topic: string;
    category?: string;
    userPosition: string;
    aiPosition: string;
    roundNumber: number;
    phaseName: string;
    userArgument: string;
  }): Promise<Partial<ArgumentAnalysis>> {
    const res = await apiClient.post('/debate/analyze', payload);
    return res.data;
  },

  async detectFallacies(payload: {
    topic: string;
    userArgument: string;
  }): Promise<{ fallacies: Array<{ fallacyType: string; explanation: string; suggestion: string }> }> {
    const res = await apiClient.post('/debate/fallacies', payload);
    return res.data;
  },

  async judge(payload: {
    session: DebateSession;
    messages: DebateMessage[];
  }): Promise<Partial<DebateResult>> {
    const res = await apiClient.post('/debate/judge', payload);
    return res.data;
  },

  async saveSession(session: DebateSession, messages: DebateMessage[], result?: DebateResult): Promise<{ id: string }> {
    const res = await apiClient.post('/debates', { session, messages, result });
    return res.data;
  },

  async listDebates(): Promise<{ debates: DebateSession[] }> {
    const res = await apiClient.get('/debates');
    return res.data;
  }
};
