"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type CollaborationTestResponses = Record<number, string>;

type CollaborationTestState = {
  responses: CollaborationTestResponses;
  resetResponses: () => void;
  setResponse: (questionId: number, option: string) => void;
};

export const useCollaborationTestStore = create<CollaborationTestState>()(
  persist(
    (set) => ({
      responses: {},
      resetResponses: () => set({ responses: {} }),
      setResponse: (questionId, option) =>
        set((state) => ({
          responses: {
            ...state.responses,
            [questionId]: option,
          },
        })),
    }),
    {
      name: "collaboration-test-responses",
    },
  ),
);
