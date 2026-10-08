// ------------------------------------------------------------------
// Error extraction utility for API calls.
//
// Converts Axios errors and backend error payloads into user-friendly
// strings. Never exposes raw stack traces, tokens, or internal details.
// ------------------------------------------------------------------

import axios from "axios";

/**
 * Extract a user-friendly error message from an unknown caught error.
 *
 * Backend error shape: { error: { message: string, details?: unknown } }
 */
export function extractErrorMessage(err: unknown): string {
  // Network error — no response received at all
  if (axios.isAxiosError(err)) {
    if (!err.response) {
      return "Unable to reach the server. Please check your internet connection and try again.";
    }

    const status = err.response.status;
    const payload = err.response.data as
      | { error?: { message?: string; details?: unknown[] } }
      | undefined;

    // Try to extract the backend's error message
    const backendMessage = payload?.error?.message;

    // Map common status codes to user-friendly messages
    switch (status) {
      case 400: {
        // Validation errors may have details
        if (payload?.error?.details && Array.isArray(payload.error.details)) {
          // Zod issues — extract the first user-facing message
          const firstDetail = payload.error.details[0] as
            | { message?: string }
            | undefined;
          if (firstDetail?.message) return firstDetail.message;
        }
        return backendMessage || "Invalid request. Please check your input.";
      }
      case 401:
        return backendMessage || "Invalid email or password.";
      case 409:
        return backendMessage || "This email is already registered.";
      case 429:
        return "Too many attempts. Please wait a few minutes and try again.";
      case 500:
        return "Something went wrong on the server. Please try again later.";
      default:
        return backendMessage || "An unexpected error occurred. Please try again.";
    }
  }

  // Non-Axios error (shouldn't normally happen)
  if (err instanceof Error) {
    return "An unexpected error occurred. Please try again.";
  }

  return "An unexpected error occurred. Please try again.";
}
