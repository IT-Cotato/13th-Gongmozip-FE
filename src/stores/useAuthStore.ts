import { create } from "zustand";
import { persist } from "zustand/middleware";

import { useCollaborationTestStore } from "./collaborationTestStore";

type AuthState = {
  accessToken: string | null;
  setAccessToken: (accessToken: string) => void;
  clearAccessToken: () => void;
};

export const AUTH_STORAGE_KEY = "auth-storage";

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      setAccessToken: (accessToken) => set({ accessToken }),
      clearAccessToken: () => {
        useCollaborationTestStore.getState().resetCollaborationTest();
        set({ accessToken: null });
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
      partialize: (state) => ({ accessToken: state.accessToken }),
    },
  ),
);
