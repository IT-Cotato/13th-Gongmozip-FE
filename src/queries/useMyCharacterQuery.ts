import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/http";
import type { SurveyCharacterType } from "@/queries/useSubmitSurveyMutation";

export type MyCharacter = {
  characterType: SurveyCharacterType;
  displayName: string;
  paletteCode: string;
  catchphrase: string;
  hashtags: string[];
  features: string[];
  submittedAt: string;
  paletteUpdatedAt: string;
};

export const myCharacterQueryKey = ["characters", "me"] as const;

export function fetchMyCharacter() {
  return apiFetch<MyCharacter>("/api/characters/me");
}

export function useMyCharacterQuery() {
  return useQuery({
    queryKey: myCharacterQueryKey,
    queryFn: fetchMyCharacter,
  });
}
