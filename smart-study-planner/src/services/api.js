import axios from 'axios';
import { API_BASE_URL } from './apiConfig';
import {
  getAccessToken, getRefreshToken, setTokens, clearAuth,
  isImpersonating, getAdminStash, clearAdminStash, setStoredUser,
} from '../utils/storage';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

/* ── Request interceptor: attach token ─────────── */
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

/* ── Response interceptor: refresh on 401 ─────── */
let isRefreshing = false;
let failedQueue  = [];

function processQueue(error, token = null) {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else       prom.resolve(token);
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        processQueue(error, null);
        isRefreshing = false;

        if (isImpersonating()) {
          /* Impersonation session expired (no refresh token by design) —
             silently return to the admin's own session instead of logging out. */
          const stash = getAdminStash();
          clearAdminStash();
          setTokens(stash.accessToken, stash.refreshToken);
          setStoredUser(stash.user);
          window.location.href = '/admin/dashboard';
          return Promise.reject(error);
        }

        clearAuth();
        if (window.location.pathname !== '/login') window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          { refreshToken }
        );
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        setTokens(accessToken, newRefreshToken);
        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuth();
        if (window.location.pathname !== '/login') window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
