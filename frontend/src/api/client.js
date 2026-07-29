import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const ACCESS_KEY = 'bn_access_token';
const REFRESH_KEY = 'bn_refresh_token';

export const tokenStorage = {
  getAccess: () => localStorage.getItem(ACCESS_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  setTokens: (access, refresh) => {
    localStorage.setItem(ACCESS_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

export const publicApi = axios.create({ baseURL: `${API_URL}/api` });

export const adminApi = axios.create({ baseURL: `${API_URL}/api` });

adminApi.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise = null;

adminApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = tokenStorage.getRefresh();
      if (!refresh) {
        tokenStorage.clear();
        return Promise.reject(error);
      }
      try {
        if (!refreshPromise) {
          refreshPromise = axios
            .post(`${API_URL}/api/auth/token/refresh/`, { refresh })
            .finally(() => {
              refreshPromise = null;
            });
        }
        const { data } = await refreshPromise;
        tokenStorage.setTokens(data.access);
        original.headers.Authorization = `Bearer ${data.access}`;
        return adminApi(original);
      } catch (refreshError) {
        tokenStorage.clear();
        window.location.href = '/admin-panel/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export async function login(username, password) {
  const { data } = await axios.post(`${API_URL}/api/auth/token/`, { username, password });
  tokenStorage.setTokens(data.access, data.refresh);
  return data;
}

export function logout() {
  tokenStorage.clear();
}

export function isAuthenticated() {
  return Boolean(tokenStorage.getAccess());
}
