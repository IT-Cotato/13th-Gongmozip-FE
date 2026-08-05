"use client";

import { create } from "zustand";
import type { ProjectExperienceInput } from "@/app/mypage/profile-management/new/experience/_components/ProjectExperienceSheet";
import type { Certificate } from "@/app/mypage/profile-management/new/certificates/_components/CertificateCard";

export type ProfileBasicInfo = {
  nickname: string;
  school: string;
  grade: string;
  major: string;
  doubleMajor: string;
  minor: string;
  gpa: string;
  gpaScale: string;
};

const INITIAL_BASIC_INFO: ProfileBasicInfo = {
  nickname: "",
  school: "",
  grade: "",
  major: "",
  doubleMajor: "",
  minor: "",
  gpa: "",
  gpaScale: "",
};

type ProfileDraftState = {
  basicInfo: ProfileBasicInfo;
  projects: ProjectExperienceInput[];
  certificates: Certificate[];
  setBasicInfo: (info: ProfileBasicInfo) => void;
  setProjects: (updater: (prev: ProjectExperienceInput[]) => ProjectExperienceInput[]) => void;
  setCertificates: (updater: (prev: Certificate[]) => Certificate[]) => void;
  resetProfileDraft: () => void;
};

// In-memory only (not persisted): the "이탈 시 작성 내용이 사라질 수 있어요" exit
// warning throughout this wizard is only accurate if a draft doesn't survive a reload.
export const useProfileDraftStore = create<ProfileDraftState>()((set) => ({
  basicInfo: INITIAL_BASIC_INFO,
  projects: [],
  certificates: [],
  setBasicInfo: (info) => set({ basicInfo: info }),
  setProjects: (updater) => set((state) => ({ projects: updater(state.projects) })),
  setCertificates: (updater) => set((state) => ({ certificates: updater(state.certificates) })),
  resetProfileDraft: () =>
    set({ basicInfo: INITIAL_BASIC_INFO, projects: [], certificates: [] }),
}));
