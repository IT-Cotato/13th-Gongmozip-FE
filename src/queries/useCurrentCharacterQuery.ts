import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/http";
import type { CollaborationCharacterType } from "@/types/collaboration";
import type { PaletteCode } from "./useCharacterPalettesQuery";

export type CurrentCharacter = {
  characterType: CollaborationCharacterType;
  displayName: string;
  paletteCode: PaletteCode;
  catchphrase: string;
  hashtags: string[];
  features: string[];
  submittedAt: string;
  paletteUpdatedAt: string;
};

export const currentCharacterQueryKey = ["characters", "me"] as const;

function fetchCurrentCharacter() {
  return apiFetch<CurrentCharacter>("/api/characters/me");
}

export function useCurrentCharacterQuery() {
  return useQuery({
    queryKey: currentCharacterQueryKey,
    queryFn: fetchCurrentCharacter,
  });
}
