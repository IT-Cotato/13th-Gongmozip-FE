"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const TEAM_MATCHING_PASS_DISTANCE_REDUCTION_METERS = 3;

export type TeamMatchingProposalStatus = "accepted" | "passed";

export type TeamMatchingProposalResult = {
  decidedAt: string;
  distanceReductionMeters?: number;
  proposalId: string;
  status: TeamMatchingProposalStatus;
};

type TeamMatchingProposalState = {
  lastResult: TeamMatchingProposalResult | null;
  pendingProposalId: string | null;
  acceptProposal: (proposalId: string) => void;
  passProposal: (proposalId: string) => void;
  setPendingProposalId: (proposalId: string) => void;
};

export const useTeamMatchingProposalStore = create<TeamMatchingProposalState>()(
  persist(
    (set) => ({
      lastResult: null,
      pendingProposalId: null,
      acceptProposal: (proposalId) =>
        set({
          lastResult: {
            decidedAt: new Date().toISOString(),
            proposalId,
            status: "accepted",
          },
          pendingProposalId: null,
        }),
      passProposal: (proposalId) =>
        set({
          lastResult: {
            decidedAt: new Date().toISOString(),
            distanceReductionMeters: TEAM_MATCHING_PASS_DISTANCE_REDUCTION_METERS,
            proposalId,
            status: "passed",
          },
          pendingProposalId: null,
        }),
      setPendingProposalId: (proposalId) => set({ pendingProposalId: proposalId }),
    }),
    {
      name: "team-matching-proposal",
    },
  ),
);
