import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/http";

export type PaletteStyle = "DEFAULT" | "SOLID" | "GRADIENT";

export type PaletteCode =
  | "DEFAULT"
  | "SOLID_PINK"
  | "SOLID_MINT"
  | "SOLID_SKY"
  | "SOLID_LEMON"
  | "SOLID_SAND"
  | "SOLID_LAVENDER"
  | "GRADIENT_SUNSET"
  | "GRADIENT_OCEAN"
  | "GRADIENT_FOREST";

export type Palette = {
  paletteCode: PaletteCode;
  displayName: string;
  style: PaletteStyle;
  primaryHex: string;
  secondaryHex: string | null;
  displayOrder: number;
  selected: boolean;
};

export type PaletteListResponse = {
  defaultPaletteCode: PaletteCode;
  palettes: Palette[];
};

export const characterPalettesQueryKey = ["characters", "palettes"] as const;

function fetchCharacterPalettes() {
  return apiFetch<PaletteListResponse>("/api/characters/palettes");
}

export function useCharacterPalettesQuery() {
  return useQuery({
    queryKey: characterPalettesQueryKey,
    queryFn: fetchCharacterPalettes,
  });
}
