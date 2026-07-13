import type {
  ItemList,
  ItemRead,
  PermissionRead,
  RoleRead,
  UserList,
  UserRead
} from "@/api/client";

export type { ItemList, ItemRead, PermissionRead, RoleRead, UserList, UserRead };

export type StatusResponse = {
  app: string;
  version: string;
  environment: string;
  git_sha?: string | null;
  database: string;
  redis: string;
};

export const apiPrefix = "/api/v1";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly detail?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function csrfToken() {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrf_token="))
    ?.split("=")[1];
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = init.method?.toUpperCase() ?? "GET";
  const headers = new Headers(init.headers);
  if (init.body !== undefined && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (!["GET", "HEAD"].includes(method)) {
    const token = csrfToken();
    if (token) headers.set("x-csrf-token", token);
  }
  const response = await fetch(`${apiPrefix}${path}`, {
    ...init,
    headers,
    credentials: "include"
  });
  if (!response.ok) {
    let detail: string | undefined;
    try {
      const payload: unknown = await response.json();
      if (typeof payload === "object" && payload !== null) {
        const candidate = (payload as { detail?: unknown; message?: unknown }).detail ??
          (payload as { message?: unknown }).message;
        if (typeof candidate === "string") detail = candidate;
      } else if (typeof payload === "string") {
        detail = payload;
      }
    } catch {
      detail = undefined;
    }
    if (response.status === 401) {
      window.dispatchEvent(new Event("auth:expired"));
    }
    throw new ApiError(response.status, detail ?? response.statusText, detail);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function hasRole(user: UserRead | null, role: string) {
  return user?.roles?.some((item) => item.name === role) ?? false;
}

export function hasPermission(user: UserRead | null, permission: string) {
  return (
    user?.roles?.some((role) =>
      role.permissions?.some((item) => item.code === permission)
    ) ?? false
  );
}
