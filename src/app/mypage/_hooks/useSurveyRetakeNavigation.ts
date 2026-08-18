"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/http";
import { fetchSurveyStatus, surveyStatusQueryKey } from "@/queries/useSurveyStatusQuery";

type UseSurveyRetakeNavigationParams = {
  onRetakeLimited: () => void;
  returnTo: string;
};

const SURVEY_STATUS_ERROR_MESSAGE =
  "검사 가능 여부를 확인하지 못했어요. 잠시 후 다시 시도해주세요.";

export function useSurveyRetakeNavigation({
  onRetakeLimited,
  returnTo,
}: UseSurveyRetakeNavigationParams) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isCheckingSurveyStatus, setIsCheckingSurveyStatus] = useState(false);
  const [surveyStatusError, setSurveyStatusError] = useState<string | null>(null);

  async function handleSurveyRetakeClick() {
    if (isCheckingSurveyStatus) return;

    setIsCheckingSurveyStatus(true);
    setSurveyStatusError(null);

    try {
      const surveyStatus = await queryClient.fetchQuery({
        queryFn: fetchSurveyStatus,
        queryKey: surveyStatusQueryKey,
        staleTime: 0,
      });
      const status = surveyStatus.status as string;

      if (status === "SUBMITTED") {
        onRetakeLimited();
        return;
      }

      if (status !== "NONE") {
        setSurveyStatusError(SURVEY_STATUS_ERROR_MESSAGE);
        return;
      }

      router.push(`/collaboration-type?returnTo=${returnTo}`);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        router.push("/login/email");
        return;
      }

      if (error instanceof ApiError && error.code === "SURVEY_409_1") {
        onRetakeLimited();
        return;
      }

      setSurveyStatusError(SURVEY_STATUS_ERROR_MESSAGE);
    } finally {
      setIsCheckingSurveyStatus(false);
    }
  }

  return {
    handleSurveyRetakeClick,
    isCheckingSurveyStatus,
    surveyStatusError,
  };
}
