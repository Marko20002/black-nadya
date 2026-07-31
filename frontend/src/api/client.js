import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const SESSION_EXPIRES_KEY = 'bn_session_expires_at';

// Auth tokens live in httpOnly cookies now — never read/written by JS.
// withCredentials lets those cookies (and Django's CSRF cookie) travel on
// cross-origin requests; withXSRFToken forces axios to echo the CSRF cookie
// back as a header even cross-origin (its same-origin default would
// otherwise skip that entirely, since frontend and backend are on different
// hosts).
const sharedConfig = {
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
};

export const publicApi = axios.create(sharedConfig);

export const adminApi = axios.create(sharedConfig);

// Requests to these never go through the 401 -> refresh -> retry dance below
// — retrying a failed login/refresh/logout with another refresh attempt
// would just chase its own tail (and clobber the login page's own error
// handling with a hard redirect).
const AUTH_ENDPOINT_PATTERNS = ['/auth/token/', '/auth/logout/'];

let refreshPromise = null;

adminApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const isAuthEndpoint = AUTH_ENDPOINT_PATTERNS.some((p) => original?.url?.includes(p));

    if (error.response?.status === 401 && original && !original._retry && !isAuthEndpoint) {
      original._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = axios
            .post(`${API_URL}/api/auth/token/refresh/`, null, { withCredentials: true })
            .finally(() => {
              refreshPromise = null;
            });
        }
        await refreshPromise;
        return adminApi(original);
      } catch (refreshError) {
        sessionStorage.removeItem(SESSION_EXPIRES_KEY);
        if (!window.location.pathname.startsWith('/admin-panel/login')) {
          window.location.href = '/admin-panel/login';
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export async function ensureCsrfCookie() {
  await publicApi.get('/auth/csrf/');
}

export async function login(username, password) {
  const { data } = await adminApi.post('/auth/token/', { username, password });
  if (data?.session_expires_at) {
    sessionStorage.setItem(SESSION_EXPIRES_KEY, data.session_expires_at);
  }
  return data;
}

export async function logout() {
  try {
    await adminApi.post('/auth/logout/');
  } finally {
    sessionStorage.removeItem(SESSION_EXPIRES_KEY);
  }
}

export async function isAuthenticated() {
  // A 401 here just means "not logged in", which is a completely normal
  // outcome (e.g. every fresh visit to /admin-panel/login) — this must NOT
  // go through adminApi's interceptor, or that 401 triggers a refresh
  // attempt, which also 401s, which redirects to the login page, which
  // re-mounts the app and repeats the exact same check forever.
  try {
    await axios.get(`${API_URL}/api/auth/me/`, {
      withCredentials: true,
      withXSRFToken: true,
      xsrfCookieName: 'csrftoken',
      xsrfHeaderName: 'X-CSRFToken',
    });
    return true;
  } catch {
    return false;
  }
}

export function getSessionExpiresAt() {
  const value = sessionStorage.getItem(SESSION_EXPIRES_KEY);
  return value ? new Date(value) : null;
}
