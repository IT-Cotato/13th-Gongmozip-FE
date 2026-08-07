"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProfileBasicInfo } from "./profileDraftStore";

type ProfileDefaultInfoState = {
  // accessToken을 키로 쓰면 apiFetch의 조용한 토큰 재발급(reissue) 때마다
  // accessToken 값이 바뀌어서 저장해둔 기본값을 못 찾게 되고(localStorage에는
  // 옛 토큰 키로 계속 쌓이기만 함), 그 문제를 피하기 위해 계정 구분 없이
  // 단일 슬롯으로 보관한다. 대신 계정 전환 시 이전 값이 보이지 않도록
  // useAuthStore.clearAccessToken에서 로그아웃할 때 함께 비운다.
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
