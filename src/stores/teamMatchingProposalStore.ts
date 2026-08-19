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
  pendingExpectedPenalty: number | null;
  pendingProposalId: string | null;
  acceptProposal: (proposalId: string) => void;
  passProposal: (proposalId: string, distanceReductionMeters?: number) => void;
  setPendingProposal: (proposalId: string, expectedPenalty?: number | null) => void;
  setPendingProposalId: (proposalId: string) => void;
};

export const useTeamMatchingProposalStore = create<TeamMatchingProposalState>()(
  persist(
    (set) => ({
      lastResult: null,
      pendingExpectedPenalty: null,
      pendingProposalId: null,
      acceptProposal: (proposalId) =>
        set({
          lastResult: {
            decidedAt: new Date().toISOString(),
            proposalId,
            status: "accepted",
          },
          pendingExpectedPenalty: null,
          pendingProposalId: null,
        }),
      passProposal: (proposalId, distanceReductionMeters) =>
        set({
          lastResult: {
            decidedAt: new Date().toISOString(),
            distanceReductionMeters:
              distanceReductionMeters ?? TEAM_MATCHING_PASS_DISTANCE_REDUCTION_METERS,
            proposalId,
            status: "passed",
          },
          pendingExpectedPenalty: null,
          pendingProposalId: null,
        }),
      setPendingProposal: (proposalId, expectedPenalty) =>
        set({
          pendingExpectedPenalty: expectedPenalty && expectedPenalty > 0 ? expectedPenalty : null,
          pendingProposalId: proposalId,
        }),
      setPendingProposalId: (proposalId) => set({ pendingProposalId: proposalId }),
    }),
    {
      name: "team-matching-proposal",
    },
  ),
);
