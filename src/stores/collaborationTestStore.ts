"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CollaborationTestResponse = {
  optionId: number;
  optionValue: string;
  questionId: number;
};

type CollaborationTestResponses = Record<number, CollaborationTestResponse>;

type CollaborationTestState = {
  responses: CollaborationTestResponses;
  resetResponses: () => void;
  setResponse: (questionId: number, optionId: number, optionValue: string) => void;
};

export const useCollaborationTestStore = create<CollaborationTestState>()(
  persist(
    (set) => ({
      responses: {},
      resetResponses: () => set({ responses: {} }),
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
