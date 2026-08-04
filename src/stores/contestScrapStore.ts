"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type ContestScrapState = {
  scrappedContestIds: string[];
  resetScraps: () => void;
  setScrapStatus: (contestId: string, isScrapped: boolean) => void;
};

export const useContestScrapStore = create<ContestScrapState>()(
  persist(
    (set) => ({
      scrappedContestIds: [],
      resetScraps: () => set({ scrappedContestIds: [] }),
      setScrapStatus: (contestId, isScrapped) =>
        set((state) => {
          const isAlreadyScrapped = state.scrappedContestIds.includes(contestId);

          if (isAlreadyScrapped === isScrapped) {
            return state;
          }

          return {
            scrappedContestIds: isScrapped
              ? [...state.scrappedContestIds, contestId]
              : state.scrappedContestIds.filter(
                  (scrappedContestId) => scrappedContestId !== contestId,
                ),
          };
        }),
    }),
    {
      name: "contest-scraps",
    },
  ),
);
