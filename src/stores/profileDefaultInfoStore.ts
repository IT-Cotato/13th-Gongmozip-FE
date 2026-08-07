"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProfileBasicInfo } from "./profileDraftStore";

type ProfileDefaultInfoState = {
  // accessToken별로 분리 보관 - 같은 브라우저를 여러 계정이 함께 쓰는 경우
  // 한 계정에서 저장한 기본값이 다른 계정에도 그대로 보이는 걸 막기 위함.
  // memberId는 API 응답을 통해 비동기로만 알 수 있어 하이드레이션 시점에
  // 쓸 수 없고, accessToken은 로그인 즉시 동기적으로 알 수 있어 이걸 키로 쓴다.
  defaultBasicInfoByAccount: Record<string, ProfileBasicInfo>;
  setDefaultBasicInfo: (accessToken: string, info: ProfileBasicInfo) => void;
  clearDefaultBasicInfo: (accessToken: string) => void;
};

export const useProfileDefaultInfoStore = create<ProfileDefaultInfoState>()(
  persist(
    (set) => ({
      defaultBasicInfoByAccount: {},
      setDefaultBasicInfo: (accessToken, info) =>
        set((state) => ({
          defaultBasicInfoByAccount: { ...state.defaultBasicInfoByAccount, [accessToken]: info },
        })),
      clearDefaultBasicInfo: (accessToken) =>
        set((state) => {
          const next = { ...state.defaultBasicInfoByAccount };
          delete next[accessToken];
          return { defaultBasicInfoByAccount: next };
        }),
    }),
    {
      name: "profile-default-basic-info",
    },
  ),
);
