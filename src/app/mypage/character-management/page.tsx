"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeftIcon } from "./_components/icons";
import { getCollaborationCharacterMeta } from "../_lib/collaborationCharacter";
import {
  useCurrentCharacterQuery,
  type CurrentCharacter,
} from "@/queries/useCurrentCharacterQuery";
import {
  useCharacterPalettesQuery,
  type Palette,
  type PaletteCode,
  type PaletteListResponse,
} from "@/queries/useCharacterPalettesQuery";
import { useUpdateCharacterPaletteMutation } from "@/queries/useUpdateCharacterPaletteMutation";
import { ApiError } from "@/lib/http";

function paletteStyle(palette: Palette | undefined): CSSProperties {
  if (!palette) return { backgroundColor: "#EFEFEF" };
  if (palette.style === "GRADIENT" && palette.secondaryHex) {
    return {
      backgroundImage: `linear-gradient(45deg, ${palette.primaryHex}, ${palette.secondaryHex})`,
    };
  }
  return { backgroundColor: palette.primaryHex };
}

function PaletteSwatch({
  palette,
  selected,
  onSelect,
}: {
  palette: Palette;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={palette.displayName}
      aria-pressed={selected}
      className={`aspect-square w-full max-w-[100px] rounded-full ${
        selected ? "ring-[3px] ring-offset-2 ring-[#1F1F1F]" : ""
      }`}
      style={paletteStyle(palette)}
    />
  );
}

function CharacterManagementContent({
  character,
  palettes,
}: {
  character: CurrentCharacter;
  palettes: PaletteListResponse;
}) {
  const router = useRouter();
  const updatePaletteMutation = useUpdateCharacterPaletteMutation();
  const [selectedCode, setSelectedCode] = useState<PaletteCode>(character.paletteCode);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const meta = getCollaborationCharacterMeta(character.characterType);
  const selectedPalette = palettes.palettes.find((palette) => palette.paletteCode === selectedCode);
  const solidPalettes = palettes.palettes
    .filter((palette) => palette.style === "SOLID")
    .sort((a, b) => a.displayOrder - b.displayOrder);
  const gradientPalettes = palettes.palettes
    .filter((palette) => palette.style === "GRADIENT")
    .sort((a, b) => a.displayOrder - b.displayOrder);

  function handleSubmit() {
    if (updatePaletteMutation.isPending) return;
    setSubmitError(null);
    updatePaletteMutation.mutate(selectedCode, {
      onSuccess: () => router.push("/mypage"),
      onError: (error) => {
        setSubmitError(
          error instanceof ApiError
            ? error.message
            : "캐릭터 색상 저장에 실패했습니다. 다시 시도해주세요.",
        );
      },
    });
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto">
        <div className="relative flex flex-col items-center gap-4 pt-6 pb-2">
          <Link
            href="/collaboration-type"
            className="absolute top-1 right-4 text-[13px] leading-[1.25] font-semibold text-[#616161] underline"
          >
            재검사하기
          </Link>
          <div
            className="flex size-[113px] items-center justify-center overflow-hidden rounded-full border-2 border-[#e8e8e8]"
            style={paletteStyle(selectedPalette)}
          >
            {meta.imageSrc && (
              <img src={meta.imageSrc} alt={meta.label} className="size-[90%] object-contain" />
            )}
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 px-4 pt-8">
          <h2 className="w-full text-[17px] leading-[1.35] font-semibold text-[#1f1f1f]">단색</h2>
          <div className="grid w-full grid-cols-3 gap-4 justify-items-center">
            {solidPalettes.map((palette) => (
              <PaletteSwatch
                key={palette.paletteCode}
                palette={palette}
                selected={selectedCode === palette.paletteCode}
                onSelect={() => setSelectedCode(palette.paletteCode)}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 px-4 pt-8">
          <h2 className="w-full text-[17px] leading-[1.35] font-semibold text-[#1f1f1f]">
            그라데이션
          </h2>
          <div className="grid w-full grid-cols-3 gap-4 justify-items-center">
            {gradientPalettes.map((palette) => (
              <PaletteSwatch
                key={palette.paletteCode}
                palette={palette}
                selected={selectedCode === palette.paletteCode}
                onSelect={() => setSelectedCode(palette.paletteCode)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 flex flex-col gap-2 bg-gradient-to-t from-white from-[38.462%] to-white/0 p-4">
        {submitError && <p className="px-1 text-xs leading-[1.35] text-[#BB5260]">{submitError}</p>}
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={() => setSelectedCode(palettes.defaultPaletteCode)}
            disabled={updatePaletteMutation.isPending}
            className="h-12 flex-1 rounded-[14px] border border-[rgba(97,97,97,0.5)] px-2.5 py-[9px] text-[17px] leading-[1.25] font-semibold text-[#616161] disabled:opacity-50"
          >
            초기화
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={updatePaletteMutation.isPending}
            className="h-12 flex-1 rounded-[14px] bg-[#FF7658] px-2.5 py-[9px] text-[17px] leading-[1.25] font-semibold text-white disabled:opacity-50"
          >
            {updatePaletteMutation.isPending ? "저장 중..." : "완료"}
          </button>
        </div>
      </div>
    </>
  );
}

export default function CharacterManagementPage() {
  const router = useRouter();
  const characterQuery = useCurrentCharacterQuery();
  const palettesQuery = useCharacterPalettesQuery();

  const isLoading = characterQuery.isLoading || palettesQuery.isLoading;
  const isError = characterQuery.isError || palettesQuery.isError;

  return (
    <div className="flex h-full w-full flex-col bg-white">
      <div className="relative flex h-[46px] shrink-0 items-center justify-center px-4">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="뒤로가기"
          className="absolute left-4 flex h-6 w-6 items-center justify-center"
        >
          <ChevronLeftIcon />
        </button>
        <h1 className="text-[17px] leading-[1.35] font-semibold text-[#111111]">캐릭터 관리</h1>
      </div>

      {isLoading && (
        <p className="px-4 py-16 text-center text-[13px] text-[#949494]">
          캐릭터 정보를 불러오는 중이에요...
        </p>
      )}

      {isError && !isLoading && (
        <div className="flex flex-col items-center gap-3 px-4 py-16">
          <p className="text-[13px] text-[#949494]">캐릭터 정보를 불러오지 못했어요.</p>
          <button
            type="button"
            onClick={() => {
              characterQuery.refetch();
              palettesQuery.refetch();
            }}
            className="rounded-full bg-[#F5F5F5] px-4 py-2 text-[13px] font-medium text-[#1F1F1F]"
          >
            다시 시도
          </button>
        </div>
      )}

      {characterQuery.data && palettesQuery.data && (
        <CharacterManagementContent
          key={characterQuery.data.paletteCode}
          character={characterQuery.data}
          palettes={palettesQuery.data}
        />
      )}
    </div>
  );
}
