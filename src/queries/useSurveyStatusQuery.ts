import { useQuery } from "@tanstack/react-query";

import { ApiError, apiFetch } from "@/lib/http";

export type SurveyStatus = "NONE" | "SUBMITTED";

type SurveyStatusResponse = {
  status: SurveyStatus;
};

export function fetchSurveyStatus() {
  return apiFetch<SurveyStatusResponse>("/api/survey/status");
}

export const surveyStatusQueryKey = ["survey", "status"] as const;

export function useSurveyStatusQuery() {
  return useQuery({
    queryFn: fetchSurveyStatus,
    queryKey: surveyStatusQueryKey,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 401) return false;

      return failureCount < 3;
    },
    select: (response) => response.status,
  });
}
