import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/http";

export type SurveyStatus = "NONE" | "SUBMITTED";

type SurveyStatusResponse = {
  status: SurveyStatus;
};

function getSurveyStatus() {
  return apiFetch<SurveyStatusResponse>("/api/survey/status");
}

export const surveyStatusQueryKey = ["survey", "status"] as const;

export function useSurveyStatusQuery() {
  return useQuery({
    queryFn: getSurveyStatus,
    queryKey: surveyStatusQueryKey,
    select: (response) => response.status,
  });
}
