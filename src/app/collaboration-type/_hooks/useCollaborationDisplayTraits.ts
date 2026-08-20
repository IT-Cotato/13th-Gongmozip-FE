"use client";

import { useSurveyResultQuery } from "@/queries/useSurveyResultQuery";

import {
  getCollaborationDisplayTraits,
  normalizeCollaborationCharacterType,
  type COLLABORATION_RESULT_TYPES,
  type CollaborationCharacterType,
} from "../_data/collaborationTest";

type CollaborationResult = (typeof COLLABORATION_RESULT_TYPES)[number];

export function useCollaborationDisplayTraits(result?: CollaborationResult) {
  const { data: surveyResult } = useSurveyResultQuery();

  if (!result) {
    return [];
  }

  const isSameCharacterType =
    surveyResult?.characterType &&
    normalizeCollaborationCharacterType(surveyResult.characterType as CollaborationCharacterType) ===
      result.characterType;

  return getCollaborationDisplayTraits(result, isSameCharacterType ? surveyResult.axes : null);
}
