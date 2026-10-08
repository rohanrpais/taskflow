// ------------------------------------------------------------------
// Authentication context.
//
// Manages three states: loading (checking SecureStore on cold start),
// authenticated (user + token present), unauthenticated.
//
// Registers a 401 callback so any API call that gets a 401 triggers
// an automatic sign-out with a user-visible message.
//
// On cold start:
//   1. Check SecureStore for a saved JWT.
//   2. If found, call GET /api/auth/me to restore the session.
//   3. If /me returns 401 → token is invalid/expired → clear it.
//   4. If /me fails due to network error → clear state but don't
//      falsely treat it as token expiration. Show an alert.
// ------------------------------------------------------------------

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { Alert } from "react-native";
import axios from "axios";
import type { User } from "../types";
import { api } from "../api/services";
import { saveToken, getToken, removeToken } from "../utils/token";
import { setOnUnauthorized } from "../api/client";

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Called on 401 from any API request
  const handleUnauthorized = useCallback(async () => {
    await removeToken();
    setToken(null);
    setUser(null);
    Alert.alert(
      "Session Expired",
      "Your session has expired. Please log in again.",
    );
  }, []);

  // Register the 401 callback once
  useEffect(() => {
    setOnUnauthorized(handleUnauthorized);
  }, [handleUnauthorized]);

  // On cold start, check SecureStore for an existing token
  useEffect(() => {
    const init = async () => {
      try {
        const stored = await getToken();
        if (!stored) {
          // No saved token — remain unauthenticated
          return;
        }

        setToken(stored);

        try {
          const { data } = await api.auth.me();
          setUser(data);
        } catch (meError) {
          if (axios.isAxiosError(meError) && meError.response?.status === 401) {
            // Token is invalid or expired — clear it
            await removeToken();
            setToken(null);
          } else if (axios.isAxiosError(meError) && !meError.response) {
            // Network error — server unreachable. Don't clear the token yet
            // because the token might still be valid. Clear user state so the
            // user is shown the login screen but preserve the token for retry.
            setToken(null);
            Alert.alert(
              "Connection Error",
              "Could not reach the server to restore your session. Please check your connection and try again.",
            );
          } else {
            // Other server error (5xx, etc.)
            await removeToken();
            setToken(null);
            Alert.alert(
              "Server Error",
              "Something went wrong while restoring your session. Please log in again.",
            );
          }
        }
      } catch {
        // SecureStore access error — remain unauthenticated
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = async (newToken: string, newUser: User) => {
    await saveToken(newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = async () => {
    try {
      if (token) await api.auth.logout();
    } catch {
      // ignore — stateless logout; even if the backend call fails
      // (token already expired, network error, etc.) we still clear locally
    } finally {
      await removeToken();
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
