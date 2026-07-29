import { createContext, useContext, useState } from 'react';
import { login as apiLogin, logout as apiLogout, isAuthenticated as checkAuth } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authenticated, setAuthenticated] = useState(checkAuth());

  const login = async (username, password) => {
    await apiLogin(username, password);
    setAuthenticated(true);
  };

  const logout = () => {
    apiLogout();
    setAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ authenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
