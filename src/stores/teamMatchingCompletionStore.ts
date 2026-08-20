"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type TeamMatchingCompletionState = {
  visibleCompletionId: string | null;
  clearVisibleCompletion: (completionId: string) => void;
  seenCompletionIds: string[];
  hasSeenCompletion: (completionId: string) => boolean;
  markCompletionAsSeen: (completionId: string) => void;
  preserveVisibleCompletion: (completionId: string) => void;
};

export const useTeamMatchingCompletionStore = create<TeamMatchingCompletionState>()(
  persist(
    (set, get) => ({
      visibleCompletionId: null,
      clearVisibleCompletion: (completionId) =>
        set((state) =>
          state.visibleCompletionId === completionId ? { visibleCompletionId: null } : state,
        ),
      seenCompletionIds: [],
      hasSeenCompletion: (completionId) => get().seenCompletionIds.includes(completionId),
      markCompletionAsSeen: (completionId) =>
        set((state) => {
          if (state.seenCompletionIds.includes(completionId)) {
            return state;
          }

          return {
            seenCompletionIds: [...state.seenCompletionIds, completionId],
          };
        }),
      preserveVisibleCompletion: (completionId) => set({ visibleCompletionId: completionId }),
    }),
    {
      name: "team-matching-completions",
      partialize: (state) => ({ seenCompletionIds: state.seenCompletionIds }),
    },
  ),
);
