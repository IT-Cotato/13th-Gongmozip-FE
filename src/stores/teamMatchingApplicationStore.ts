import { create } from "zustand";
import { persist } from "zustand/middleware";

import type {
  MatchingContestCategory,
  MatchingLeaderPreference,
} from "@/queries/useTodayMatchingApplicationQuery";

type TeamMatchingApplicationDraft = {
  profileId: number | null;
  contestCategory: MatchingContestCategory | null;
  leaderPreference: MatchingLeaderPreference | null;
  setContestCategory: (contestCategory: MatchingContestCategory) => void;
  setLeaderPreference: (leaderPreference: MatchingLeaderPreference) => void;
  setProfileId: (profileId: number) => void;
  reset: () => void;
};

const initialDraft = {
  profileId: null,
  contestCategory: null,
  leaderPreference: null,
};

export const useTeamMatchingApplicationStore = create<TeamMatchingApplicationDraft>()(
  persist(
    (set) => ({
      ...initialDraft,
      setContestCategory: (contestCategory) => set({ contestCategory }),
      setLeaderPreference: (leaderPreference) => set({ leaderPreference }),
      setProfileId: (profileId) => set({ profileId }),
      reset: () => set(initialDraft),
    }),
    {
      name: "team-matching-application-draft",
    },
  ),
);
