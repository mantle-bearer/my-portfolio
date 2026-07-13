import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useEffect } from "react";
import { api, type UserRead } from "./api";

type LoginBody = {
  email: string;
  password: string;
};

type SignupBody = LoginBody & {
  full_name?: string;
};

type AuthContextValue = {
  user: UserRead | null;
  isLoading: boolean;
  login: (body: LoginBody) => Promise<void>;
  signup: (body: SignupBody) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const me = useQuery({
    queryKey: ["me"],
    queryFn: () => api<UserRead | null>("/auth/me"),
    retry: false
  });

  useEffect(() => {
    const handleExpiredSession = () => {
      queryClient.setQueryData(["me"], null);
    };
    window.addEventListener("auth:expired", handleExpiredSession);
    return () => window.removeEventListener("auth:expired", handleExpiredSession);
  }, [queryClient]);

  async function login(body: LoginBody) {
    const user = await api<UserRead>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body)
    });
    queryClient.setQueryData(["me"], user);
  }

  async function signup(body: SignupBody) {
    const user = await api<UserRead>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(body)
    });
    queryClient.setQueryData(["me"], user);
  }

  async function logout() {
    await api("/auth/logout", { method: "POST", body: "{}" }).catch(() => undefined);
    queryClient.setQueryData(["me"], null);
    queryClient.clear();
  }

  async function refreshMe() {
    await queryClient.invalidateQueries({ queryKey: ["me"] });
  }

  return (
    <AuthContext.Provider
      value={{
        user: me.data ?? null,
        isLoading: me.isLoading,
        login,
        signup,
        logout,
        refreshMe
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
