import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthState = {
  accessToken: string | null;
  setAccessToken: (accessToken: string) => void;
  clearAccessToken: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      setAccessToken: (accessToken) => set({ accessToken }),
      clearAccessToken: () => set({ accessToken: null }),
    }),
    { name: "auth-storage" },
  ),
);
