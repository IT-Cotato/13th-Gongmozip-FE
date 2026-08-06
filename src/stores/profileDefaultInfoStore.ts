"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProfileBasicInfo } from "./profileDraftStore";

type ProfileDefaultInfoState = {
  defaultBasicInfo: ProfileBasicInfo | null;
  setDefaultBasicInfo: (info: ProfileBasicInfo) => void;
  clearDefaultBasicInfo: () => void;
};

export const useProfileDefaultInfoStore = create<ProfileDefaultInfoState>()(
  persist(
    (set) => ({
      defaultBasicInfo: null,
      setDefaultBasicInfo: (info) => set({ defaultBasicInfo: info }),
      clearDefaultBasicInfo: () => set({ defaultBasicInfo: null }),
    }),
    {
      name: "profile-default-basic-info",
    },
  ),
);
