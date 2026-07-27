"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { MOCK_CONTESTS } from "@/app/contests/_data/mockContests";

type ContestScrapState = {
  scrappedContestIds: string[];
  toggleScrap: (contestId: string) => void;
  removeScrap: (contestId: string) => void;
};

const initialScrappedContestIds = MOCK_CONTESTS.filter((contest) => contest.isScrapped).map(
  (contest) => contest.id,
);

export const useContestScrapStore = create<ContestScrapState>()(
  persist(
    (set) => ({
      scrappedContestIds: initialScrappedContestIds,
      toggleScrap: (contestId) =>
        set((state) => {
          const isAlreadyScrapped = state.scrappedContestIds.includes(contestId);

          return {
            scrappedContestIds: isAlreadyScrapped
              ? state.scrappedContestIds.filter(
                  (scrappedContestId) => scrappedContestId !== contestId,
                )
              : [...state.scrappedContestIds, contestId],
          };
        }),
      removeScrap: (contestId) =>
        set((state) => ({
          scrappedContestIds: state.scrappedContestIds.filter(
            (scrappedContestId) => scrappedContestId !== contestId,
          ),
        })),
    }),
    {
      name: "contest-scraps",
    },
  ),
);
