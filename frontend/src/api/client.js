import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const SESSION_EXPIRES_KEY = 'bn_session_expires_at';

// Auth tokens live in httpOnly cookies now — never read/written by JS.
// withCredentials lets those cookies travel on cross-origin requests.
//
// CSRF is NOT handled via axios's built-in xsrfCookieName/withXSRFToken
// cookie-reading shortcut (the standard double-submit-cookie pattern) —
// that only works when the frontend can read the CSRF cookie itself via
// document.cookie, which requires a shared browser-visible cookie scope
// (same site, or a shared parent domain with CSRF_COOKIE_DOMAIN set).
// Here the frontend (blacknadya.com) and API (Railway's own domain, no
// shared parent) don't share one: the browser still attaches the cookie
// correctly to requests, but document.cookie on the frontend's origin can
// never see a cookie that belongs to a different domain, so there's never
// a value for axios to echo back as a header. Instead, ensureCsrfCookie()
// below reads the token from the API response BODY (readable by JS
// regardless of domain, since it's just the frontend's own script reading
// its own response) and attaches it as a fixed default header.
const sharedConfig = {
  baseURL: `${API_URL}/api`,
  withCredentials: true,
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
  const { data } = await publicApi.get('/auth/csrf/');
  if (data?.csrfToken) {
    // Attached to both instances, not just adminApi: CookieJWTAuthentication
    // decides whether to enforce CSRF purely on whether the bn_access
    // cookie is present on the request — not on whether the endpoint
    // actually requires authentication. A browser with an active admin
    // session (e.g. someone testing the admin panel who then submits the
    // public contact/order form in another tab) still sends that cookie to
    // publicApi calls, so those need the header too or they get incorrectly
    // CSRF-blocked despite hitting an AllowAny endpoint.
    adminApi.defaults.headers.common['X-CSRFToken'] = data.csrfToken;
    publicApi.defaults.headers.common['X-CSRFToken'] = data.csrfToken;
  }
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
    await axios.get(`${API_URL}/api/auth/me/`, { withCredentials: true });
    return true;
  } catch {
    return false;
  }
}

export function getSessionExpiresAt() {
  const value = sessionStorage.getItem(SESSION_EXPIRES_KEY);
  return value ? new Date(value) : null;
}
