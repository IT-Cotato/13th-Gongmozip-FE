import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/http";

export type SurveyQuestionOption = {
  displayOrder: number;
  optionId: number;
  optionKey: string;
  optionLabel: string;
  optionValue: string;
};

export type SurveyQuestion = {
  displayOrder: number;
  options: SurveyQuestionOption[];
  questionId: number;
  questionKey: string;
  questionText: string;
  questionType: "SINGLE_CHOICE";
};

type SurveyQuestionsResponse = {
  questions: SurveyQuestion[];
};

export type SurveyStatus = "NONE" | "SUBMITTED";

type SurveyStatusResponse = {
  status: SurveyStatus;
};

function getSurveyQuestions() {
  return apiFetch<SurveyQuestionsResponse>("/api/survey/questions");
}

function getSurveyStatus() {
  return apiFetch<SurveyStatusResponse>("/api/survey/status");
}

export const surveyQueryKeys = {
  questions: ["survey", "questions"] as const,
  status: ["survey", "status"] as const,
};

export function useSurveyQuestionsQuery() {
  return useQuery({
    queryFn: getSurveyQuestions,
    queryKey: surveyQueryKeys.questions,
    select: (response) => response.questions,
    staleTime: Infinity,
  });
}

export function useSurveyStatusQuery() {
  return useQuery({
    queryFn: getSurveyStatus,
    queryKey: surveyQueryKeys.status,
    select: (response) => response.status,
  });
}
