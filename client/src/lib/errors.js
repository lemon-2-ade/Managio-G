import { toast } from "sonner";

/**
 * Turns any thrown error (axios error, network failure, JS exception) into a
 * consistent shape the UI can render without ever showing raw backend/stack text.
 */
export function normalizeError(error) {
  console.error(error);

  // No response reached the client at all — DNS failure, offline, CORS, server down.
  if (!error?.response) {
    return {
      type: "network",
      title: "Unable to connect",
      message: "We couldn't reach the server. Check your connection and try again.",
      retryable: true,
    };
  }

  const status = error.response.status;
  const backendMessage = error.response.data?.error;

  switch (status) {
    case 401:
      return {
        type: "auth",
        title: "Session expired",
        message: "Please sign in again to continue.",
        retryable: false,
      };
    case 403:
      return {
        type: "permission",
        title: "Access restricted",
        message: "You don't have permission to do that.",
        retryable: false,
      };
    case 404:
      return {
        type: "not_found",
        title: "Not found",
        message: backendMessage || "That item couldn't be found — it may have been removed.",
        retryable: false,
      };
    case 400:
    case 422:
      return {
        type: "validation",
        title: "Check the form",
        message: backendMessage || "Some of the information provided isn't valid.",
        retryable: false,
      };
    case 429:
      return {
        type: "rate_limit",
        title: "Slow down",
        message: "You're doing that a little too quickly. Please wait a moment and try again.",
        retryable: true,
      };
    default:
      if (status >= 500) {
        return {
          type: "server",
          title: "Something went wrong on our side",
          message: "Your data hasn't been lost. Please try again in a moment.",
          retryable: true,
        };
      }
      return {
        type: "unknown",
        title: "Something went wrong",
        message: backendMessage || "Please try again.",
        retryable: true,
      };
  }
}

/** Shows a normalized error as a toast — for actions (submit, delete, save). */
export function showError(error, fallbackTitle) {
  const { title, message } = normalizeError(error);
  toast.error(fallbackTitle || title, { description: message });
}

export function showSuccess(message) {
  toast.success(message);
}
