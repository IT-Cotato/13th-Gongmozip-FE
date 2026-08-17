import type { CSSProperties } from "react";
import type { CollaborationCharacterKey } from "@/queries/useMypageSummaryQuery";
import type { Palette } from "@/queries/useCharacterPalettesQuery";
import {
  COLLABORATION_CHARACTER_TYPE_TO_RESULT_TYPE,
  COLLABORATION_RESULT_TYPES,
} from "@/app/collaboration-type/_data/collaborationTest";

export function getCollaborationCharacterMeta(characterType: CollaborationCharacterKey) {
  const resultTypeId = COLLABORATION_CHARACTER_TYPE_TO_RESULT_TYPE[characterType];
  const resultType = COLLABORATION_RESULT_TYPES.find((type) => type.id === resultTypeId);

  return {
    label: resultType?.name ?? characterType,
    badgeColor: resultType?.themeColor ?? "#C8C8C8",
    imageSrc: resultType?.imageSrc ?? null,
  };
}

// 캐릭터 관리 화면에서 고른 배경(paletteCode)을 단색/그라데이션 스타일로 변환한다.
// 캐릭터 아바타를 보여주는 모든 화면(프로필 미리보기, 프로필 관리 목록, 채팅 프로필
// 미리보기 등)이 이 함수로 동일한 배경을 그려야 캐릭터 관리에서 바꾼 색이 일관되게 보인다.
export function getPaletteStyle(palette: Palette | undefined): CSSProperties {
  if (!palette) return { backgroundColor: "#EFEFEF" };
  if (palette.style === "GRADIENT" && palette.secondaryHex) {
    return {
      backgroundImage: `linear-gradient(45deg, ${palette.primaryHex}, ${palette.secondaryHex})`,
    };
  }
  return { backgroundColor: palette.primaryHex };
}
