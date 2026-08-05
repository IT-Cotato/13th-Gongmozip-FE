import type { CollaborationCharacterKey } from "@/queries/useMypageSummaryQuery";
import {
  COLLABORATION_CHARACTER_TYPE_TO_RESULT_TYPE,
  COLLABORATION_RESULT_TYPES,
} from "@/app/collaboration-type/_data/collaborationTest";

export const COLLABORATION_CHARACTER_IMAGE: Record<CollaborationCharacterKey, string> = {
  TRACK_RUNNER: "/images/trackRunner.svg",
  FREE_RUNNER: "/images/freeRunner.svg",
  LEAD_RUNNER: "/images/leadRunner.svg",
  BOOST_RUNNER: "/images/boosterRunner.svg",
  BOOSTER_RUNNER: "/images/boosterRunner.svg",
};

export function getCollaborationCharacterMeta(characterType: CollaborationCharacterKey) {
  const resultTypeId = COLLABORATION_CHARACTER_TYPE_TO_RESULT_TYPE[characterType];
  const resultType = COLLABORATION_RESULT_TYPES.find((type) => type.id === resultTypeId);

  return {
    label: resultType?.name ?? characterType,
    badgeColor: resultType?.themeColor ?? "#C8C8C8",
  };
}
