import React, { createContext, useState, useEffect, useCallback } from 'react';
import {
  getStoredUser, getAccessToken, clearAuth, setTokens, setStoredUser,
  isImpersonating, getAdminStash, stashAdminSession, clearAdminStash, setImpersonationSession,
} from '../utils/storage';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,             setUserState]        = useState(null);
  const [isAuthenticated,  setIsAuthenticated]  = useState(false);
  const [loading,          setLoading]          = useState(true);
  const [impersonating,    setImpersonating]    = useState(false);
  const [impersonatedBy,   setImpersonatedBy]   = useState(null);

  useEffect(() => {
    const storedUser  = getStoredUser();
    const accessToken = getAccessToken();
    if (storedUser && accessToken) {
      setUserState(storedUser);
      setIsAuthenticated(true);
    }
    if (isImpersonating()) {
      const stash = getAdminStash();
      setImpersonating(true);
      setImpersonatedBy(stash?.user ? { name: stash.user.name, email: stash.user.email } : null);
    }
    setLoading(false);
  }, []);

  const login = useCallback((userData, accessToken, refreshToken) => {
    setTokens(accessToken, refreshToken);
    setStoredUser(userData);
    setUserState(userData);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setUserState(null);
    setIsAuthenticated(false);
  }, []);

  /* Accepts either a plain object or an updater function, like React's setState,
     and persists the result to localStorage so it survives a page refresh. */
  const setUser = useCallback((updater) => {
    setUserState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      setStoredUser(next);
      return next;
    });
  }, []);

  const startImpersonation = useCallback((data) => {
    stashAdminSession();
    const targetUser = {
      id: data.targetUserId, name: data.targetUserName,
      email: data.targetUserEmail, role: data.targetUserRole,
    };
    setImpersonationSession(data.accessToken, targetUser);
    setUserState(targetUser);
    setImpersonating(true);
    setImpersonatedBy({ name: data.adminName, email: data.adminEmail });
  }, []);

  const returnToAdmin = useCallback(async (impersonatedUserId) => {
    const stash = getAdminStash();
    if (!stash) return;
    clearAdminStash();
    setTokens(stash.accessToken, stash.refreshToken);
    setStoredUser(stash.user);
    setUserState(stash.user);
    setImpersonating(false);
    setImpersonatedBy(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated, loading, login, logout, updateUser: setUser, setUser,
      impersonating, impersonatedBy, startImpersonation, returnToAdmin,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
