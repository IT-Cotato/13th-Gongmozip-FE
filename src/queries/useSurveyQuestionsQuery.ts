import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/http";

type ApiResponse<T> = {
  code: string;
  data: T;
  message: string;
  status: number;
};

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

type SurveyQuestionsResponse = ApiResponse<{
  questions: SurveyQuestion[];
}>;

function getSurveyQuestions() {
  return apiFetch<SurveyQuestionsResponse>("/api/survey/questions");
}

export const surveyQueryKeys = {
  questions: ["survey", "questions"] as const,
};

export function useSurveyQuestionsQuery() {
  return useQuery({
    queryFn: getSurveyQuestions,
    queryKey: surveyQueryKeys.questions,
    select: (response) => response.data.questions,
    staleTime: Infinity,
  });
}
