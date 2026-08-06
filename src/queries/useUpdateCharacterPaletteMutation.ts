import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/http";
import { currentCharacterQueryKey, type CurrentCharacter } from "./useCurrentCharacterQuery";
import { characterPalettesQueryKey, type PaletteCode } from "./useCharacterPalettesQuery";
import { mypageSummaryQueryKey } from "./useMypageSummaryQuery";

function updateCharacterPalette(paletteCode: PaletteCode) {
  return apiFetch<CurrentCharacter>("/api/characters/me/palette", {
    method: "PATCH",
    body: { paletteCode },
  });
}

export function useUpdateCharacterPaletteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCharacterPalette,
    onSuccess: (data) => {
      queryClient.setQueryData(currentCharacterQueryKey, data);
      queryClient.invalidateQueries({ queryKey: characterPalettesQueryKey });
      queryClient.invalidateQueries({ queryKey: mypageSummaryQueryKey });
    },
  });
}
