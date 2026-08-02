import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/http";

import { surveyStatusQueryKey } from "./useSurveyStatusQuery";

export type SubmitSurveyAnswer = {
  questionId: number;
  selectedOptionId: number;
};

export type SubmitSurveyRequest = {
  answers: SubmitSurveyAnswer[];
};

export type SurveyCharacterType =
  | "LEAD_RUNNER"
  | "TRACK_RUNNER"
  | "BOOST_RUNNER"
  | "FREE_RUNNER";

export type SurveyExtroversionType = "I" | "A" | "E";

export type SurveyAxis = {
  leftLabel: string;
  rightLabel: string;
  score: number;
};

export type SurveyCharacter = {
  characterType: SurveyCharacterType;
  displayName: string;
  paletteCode: string;
  catchphrase: string;
  hashtags: string[];
  features: string[];
  submittedAt: string;
  paletteUpdatedAt: string;
};

export type SubmitSurveyResponse = {
  characterType: SurveyCharacterType;
  extroversionType: SurveyExtroversionType;
  characterXScore: number;
  characterYScore: number;
  agreeablenessScore: number;
  conscientiousnessScore: number;
  honestyHumilityScore: number;
  extroversionScore: number;
  goalPreferenceScore: number;
  workStyleScore: number;
  communicationStyleScore: number;
  axes: SurveyAxis[];
  character: SurveyCharacter;
};

export function submitSurvey(payload: SubmitSurveyRequest) {
  return apiFetch<SubmitSurveyResponse>("/api/survey/submit", {
    method: "POST",
    body: payload,
  });
}

export function useSubmitSurveyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitSurvey,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: surveyStatusQueryKey });
    },
  });
}
