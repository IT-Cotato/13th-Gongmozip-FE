import { useQuery } from "@tanstack/react-query";

import { ApiError, apiFetch } from "@/lib/http";
import type { SubmitSurveyResponse } from "@/queries/useSubmitSurveyMutation";

export type SurveyResultResponse = SubmitSurveyResponse;

export const surveyResultQueryKey = ["survey", "result"] as const;

export function fetchSurveyResult() {
  return apiFetch<SurveyResultResponse>("/api/survey/result");
}

export function useSurveyResultQuery() {
  return useQuery({
    queryFn: fetchSurveyResult,
    queryKey: surveyResultQueryKey,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && (error.status === 401 || error.status === 404)) {
        return false;
      }

      return failureCount < 3;
    },
  });
}
