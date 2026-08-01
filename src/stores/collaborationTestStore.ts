"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CollaborationTestResponse = {
  optionId: number;
  questionId: number;
};

type CollaborationTestResponses = Record<number, CollaborationTestResponse>;

type CollaborationTestState = {
  responses: CollaborationTestResponses;
  resetResponses: () => void;
  setResponse: (questionId: number, optionId: number) => void;
};

export const useCollaborationTestStore = create<CollaborationTestState>()(
  persist(
    (set) => ({
      responses: {},
      resetResponses: () => set({ responses: {} }),
      setResponse: (questionId, optionId) =>
        set((state) => ({
          responses: {
            ...state.responses,
            [questionId]: {
              optionId,
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
