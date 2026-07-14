import { ApiError } from "./api";

const statusMessages: Record<number, string> = {
  401: "Your session has expired. Please sign in again.",
  403: "You do not have permission to perform that action.",
  404: "The requested content could not be found.",
  409: "This content changed. Refresh and try again.",
  422: "Please review the form and try again.",
  429: "Too many attempts. Please wait and try again."
};

export function messageFromError(error: unknown) {
  if (error instanceof ApiError) {
    return statusMessages[error.status] ??
      (error.status >= 500
        ? "The server is temporarily unavailable. Please try again."
        : error.status >= 400
          ? "We could not complete that request. Please try again."
          : error.message);
  }
  if (error instanceof TypeError) return "We could not connect to the server. Please try again.";
  if (error instanceof Error) {
    const message = error.message.trim();
    if (message.startsWith("{") || message.startsWith("[")) {
      return "We could not complete that request. Please try again.";
    }
    return message || "Something went wrong. Please try again.";
  }
  return "Something went wrong. Please try again.";
}

export function validationMessagesFromError(error: unknown) {
  if (!(error instanceof ApiError) || error.status !== 422) return {};
  return Object.fromEntries(
    error.validationIssues.flatMap((issue) => {
      const field = issue.loc.at(-1);
      if (typeof field !== "string") return [];
      const message = issue.msg.replace(/^Value error,\s*/i, "");
      return [[field, message]];
    })
  );
}
