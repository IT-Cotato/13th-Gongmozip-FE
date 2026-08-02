"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { CollaborationCharacterType } from "@/types/collaboration";

export type CollaborationTestResponse = {
  optionId: number;
  optionValue: string;
  questionId: number;
};

type CollaborationTestResponses = Record<number, CollaborationTestResponse>;

type CollaborationTestState = {
  submittedCharacterType: CollaborationCharacterType | null;
  responses: CollaborationTestResponses;
  resetResponses: () => void;
  setSubmittedCharacterType: (characterType: CollaborationCharacterType) => void;
  setResponse: (questionId: number, optionId: number, optionValue: string) => void;
};

export const useCollaborationTestStore = create<CollaborationTestState>()(
  persist(
    (set) => ({
      submittedCharacterType: null,
      responses: {},
      resetResponses: () => set({ responses: {} }),
      setSubmittedCharacterType: (characterType) =>
        set({ submittedCharacterType: characterType }),
      setResponse: (questionId, optionId, optionValue) =>
        set((state) => ({
          responses: {
            ...state.responses,
            [questionId]: {
              optionId,
              optionValue,
              questionId,
            },
          },
        })),
    }),
    {
      name: "collaboration-test-responses",
    },
  ),
);
