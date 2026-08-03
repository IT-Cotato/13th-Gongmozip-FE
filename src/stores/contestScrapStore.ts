"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { MOCK_CONTESTS } from "@/app/contests/_data/mockContests";

type ContestScrapState = {
  scrappedContestIds: string[];
  setScrapStatus: (contestId: string, isScrapped: boolean) => void;
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
