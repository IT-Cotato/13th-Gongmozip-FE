"use client";

import { create } from "zustand";

type ContactInquiryAuthState = {
  email: string | null;
  password: string | null;
  setContactInquiryAuth: (email: string, password: string) => void;
  clearContactInquiryAuth: () => void;
};

// In-memory only (not persisted): 문의 비밀번호를 localStorage/URL에 남기지 않기 위해
// 문의내역 인증 결과를 탭이 열려있는 동안만 들고 있는다.
export const useContactInquiryAuthStore = create<ContactInquiryAuthState>()((set) => ({
  email: null,
  password: null,
  setContactInquiryAuth: (email, password) => set({ email, password }),
  clearContactInquiryAuth: () => set({ email: null, password: null }),
}));
