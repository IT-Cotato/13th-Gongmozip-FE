"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type TeamMatchingCompletionState = {
  seenCompletionIds: string[];
  hasSeenCompletion: (completionId: string) => boolean;
  markCompletionAsSeen: (completionId: string) => void;
};

export const useTeamMatchingCompletionStore = create<TeamMatchingCompletionState>()(
  persist(
    (set, get) => ({
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
    }),
    {
      name: "team-matching-completions",
    },
  ),
);
