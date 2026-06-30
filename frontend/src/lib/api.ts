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

function csrfToken() {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrf_token="))
    ?.split("=")[1];
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = init.method?.toUpperCase() ?? "GET";
  const headers = new Headers(init.headers);
  if (init.body !== undefined) {
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
    const detail = await response.text();
    throw new Error(detail || response.statusText);
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
