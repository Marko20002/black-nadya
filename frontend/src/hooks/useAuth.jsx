import { createContext, useContext, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import {
  ensureCsrfCookie,
  getSessionExpiresAt,
  isAuthenticated as checkAuth,
  login as apiLogin,
  logout as apiLogout,
} from '../api/client';

const AuthContext = createContext(null);

const CHECK_INTERVAL_MS = 30 * 1000;
const WARN_AT_15_MIN_MS = 15 * 60 * 1000;
const WARN_AT_5_MIN_MS = 5 * 60 * 1000;

export function AuthProvider({ children }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const warnedRef = useRef({ fifteen: false, five: false });

  useEffect(() => {
    (async () => {
      try {
        await ensureCsrfCookie();
      } catch {
        // Non-fatal — the CSRF cookie also gets set on the first admin
        // request if this bootstrap call fails for some reason.
      }
      const ok = await checkAuth();
      setAuthenticated(ok);
      setCheckingAuth(false);
    })();
  }, []);

  const login = async (username, password) => {
    await apiLogin(username, password);
    warnedRef.current = { fifteen: false, five: false };
    setAuthenticated(true);
  };

  const logout = async () => {
    await apiLogout().catch(() => {});
    setAuthenticated(false);
  };

  // Session-expiry countdown, visible on every admin page (this provider
  // wraps the whole app) — matters because unsaved edits like a homepage
  // logo/background upload would otherwise be silently lost when the
  // session cuts off.
  useEffect(() => {
    if (!authenticated) return undefined;

    const tick = () => {
      const expiresAt = getSessionExpiresAt();
      if (!expiresAt) return;
      const msLeft = expiresAt.getTime() - Date.now();

      if (msLeft <= 0) {
        toast.error('Your session has expired. Please log in again.');
        logout();
        return;
      }
      if (msLeft <= WARN_AT_5_MIN_MS && !warnedRef.current.five) {
        warnedRef.current.five = true;
        toast.error(
          'Your session expires in 5 minutes — save now or you may lose unsaved changes.',
          { duration: 10000 }
        );
      } else if (msLeft <= WARN_AT_15_MIN_MS && !warnedRef.current.fifteen) {
        warnedRef.current.fifteen = true;
        toast('Your session will expire in 15 minutes. Please save any changes.', {
          duration: 10000,
          icon: '⏳',
        });
      }
    };

    tick();
    const id = setInterval(tick, CHECK_INTERVAL_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated]);

  return (
    <AuthContext.Provider value={{ authenticated, checkingAuth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
