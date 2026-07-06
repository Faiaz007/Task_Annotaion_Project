import { create } from "zustand";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: { id: number; email: string; first_name: string; last_name: string } | null;
  setAuth: (access: string, refresh: string) => void;
  setUser: (user: AuthState["user"]) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  (set) => ({
    accessToken: null,
    refreshToken: null,
    user: null,
    setAuth: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
    setUser: (user) => set({ user }),
    logout: () => {
      set({ accessToken: null, refreshToken: null, user: null });
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth-storage");
        // Clear the auth cookie so middleware redirects correctly
        document.cookie = "auth-storage=; path=/; max-age=0; SameSite=Lax";
        window.location.href = "/login";
      }
    },
  }),
  // Zustand v5 persist is different; we persist manually via localStorage in api.ts
);
