import type { CollaborationCharacterKey } from "@/queries/useMypageSummaryQuery";
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
