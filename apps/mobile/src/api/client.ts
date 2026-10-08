// ------------------------------------------------------------------
// Axios API client for the mobile app.
//
// API_BASE_URL is read from the app.json extra field so it can be
// changed per environment without touching source code.
//
// The 401 interceptor only triggers for authenticated endpoints.
// Public auth endpoints (login, register) handle their own 401s
// through the normal error flow to avoid false "session expired" alerts.
// ------------------------------------------------------------------

import axios from "axios";
import Constants from "expo-constants";
import { getToken } from "../utils/token";

const extra = Constants.expoConfig?.extra ?? {};

// Configurable via EXPO_PUBLIC_API_URL environment variable (preferred for production)
// or app.json → expo.extra.apiBaseUrl
// Falls back to 10.0.2.2 which is the Android emulator alias for host localhost.
const API_BASE_URL: string =
  process.env.EXPO_PUBLIC_API_URL ??
  extra.apiBaseUrl ?? 
  "http://10.0.2.2:3000/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Attach JWT to every outgoing request
apiClient.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global 401 handler — the auth context listens for this event
let onUnauthorized: (() => void) | null = null;

export function setOnUnauthorized(cb: () => void) {
  onUnauthorized = cb;
}

// Public auth endpoints that return 401 for invalid credentials,
// not for expired tokens. Don't trigger the global 401 handler for these.
const PUBLIC_AUTH_PATHS = ["/auth/login", "/auth/register"];

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && onUnauthorized) {
      const requestUrl = error.config?.url ?? "";
      const isPublicAuth = PUBLIC_AUTH_PATHS.some((p) =>
        requestUrl.endsWith(p),
      );
      if (!isPublicAuth) {
        onUnauthorized();
      }
    }
    return Promise.reject(error);
  },
);
