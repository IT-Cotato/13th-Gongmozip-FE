import { useQuery } from "@tanstack/react-query";

import { ApiError, apiFetch } from "@/lib/http";

export type SurveyQuestionOption = {
  displayOrder: number;
  optionId: number;
  optionKey: string;
  optionLabel: string;
  optionValue: string;
};

export type SurveyQuestionType = "RATING" | "SINGLE_CHOICE";

export type SurveyQuestion = {
  displayOrder: number;
  options: SurveyQuestionOption[];
  questionId: number;
  questionKey: string;
  questionText: string;
  questionType: SurveyQuestionType;
};

type SurveyQuestionsResponse = {
  questions: SurveyQuestion[];
};

function getSurveyQuestions() {
  return apiFetch<SurveyQuestionsResponse>("/api/survey/questions");
}

export const surveyQuestionsQueryKey = ["survey", "questions"] as const;

export function useSurveyQuestionsQuery() {
  return useQuery({
    queryFn: getSurveyQuestions,
    queryKey: surveyQuestionsQueryKey,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 401) return false;

      return failureCount < 3;
    },
    select: (response) => response.questions,
    staleTime: Infinity,
  });
}
