"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshIcon } from "../../_components/icons";
import {
  useGenerateProjectAiSummaryMutation,
  useProjectAiSummaryQuery,
} from "@/queries/useProjectAiSummaryQuery";
import { profileDetailQueryKey } from "@/queries/useProfileDetailQuery";
import { ApiError } from "@/lib/http";
import type { ProfileProject } from "@/queries/useProfileDetailQuery";

const POLL_INTERVAL_MS = 2000;

function formatMonth(isoDate: string | null) {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}`;
}

type ProjectSummaryCardProps = {
  profileId: string;
  project: ProfileProject;
};

export function ProjectSummaryCard({ profileId, project }: ProjectSummaryCardProps) {
  const queryClient = useQueryClient();
  const [isPolling, setIsPolling] = useState(false);
  const generateMutation = useGenerateProjectAiSummaryMutation();
  const summaryQuery = useProjectAiSummaryQuery(profileId, project.projectId, {
    enabled: isPolling,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "PENDING" || status === "PROCESSING" ? POLL_INTERVAL_MS : false;
    },
  });

  const isGenerating =
    generateMutation.isPending ||
    (isPolling &&
      (summaryQuery.data === undefined ||
        summaryQuery.data.status === "PENDING" ||
        summaryQuery.data.status === "PROCESSING"));

  const hasFailed = isPolling && summaryQuery.data?.status === "FAILED";
  const displaySummary =
    isPolling && summaryQuery.data?.status === "COMPLETED"
      ? summaryQuery.data.summary
      : (project.aiSummary ?? project.description);

  const errorMessage =
    (generateMutation.error instanceof ApiError ? generateMutation.error.message : null) ??
    (hasFailed ? "AI 요약 생성에 실패했어요. 다시 시도해주세요." : null);

  // 폴링이 COMPLETED에 도달하면, 이 화면을 벗어났다 재진입해도 방금 재산출한 요약이
  // 그대로 보이도록 프로필 상세 쿼리를 무효화해 서버의 최신 aiSummary를 반영한다.
  useEffect(() => {
    if (summaryQuery.data?.status === "COMPLETED") {
      queryClient.invalidateQueries({ queryKey: profileDetailQueryKey(profileId) });
    }
  }, [summaryQuery.data?.status, queryClient, profileId]);

  function handleRegenerate() {
    if (isGenerating) return;
    setIsPolling(true);
    generateMutation.mutate(
      { profileId, projectId: project.projectId },
      {
        // 생성 요청 자체가 실패하면 폴링을 시작할 근거가 없다 - isPolling을 켠 채로
        // 두면 재산출 버튼이 영영 비활성 상태로 멈추므로, 다시 시도할 수 있게 되돌린다.
        onError: () => setIsPolling(false),
      },
    );
  }

  return (
    <div
      key={project.projectId}
      className="flex w-full flex-col gap-2.5 rounded-2xl border border-[rgba(97,97,97,0.16)] p-4"
    >
      <div className="flex flex-col gap-1">
        <p className="px-1 text-[17px] leading-[1.35] font-medium text-[#1f1f1f]">
          {project.projectName}
        </p>
        <div className="flex items-center gap-1 px-1 text-xs leading-[1.35] text-[#616161]">
          <span>{formatMonth(project.startedAt)}</span>
          <span>~</span>
          <span>{project.isOngoing ? "진행중" : formatMonth(project.endedAt)}</span>
        </div>
      </div>
      <div className="flex w-full flex-col gap-2 rounded-xl bg-[#f5f5f5] px-2 py-4">
        <p className="line-clamp-2 px-1 text-[13px] leading-[1.5] text-[#616161]">
          {displaySummary}
        </p>
        <div className="flex items-center justify-end gap-1 px-1">
          {errorMessage && (
            <p role="alert" className="mr-auto text-xs leading-[1.35] text-[#BB5260]">
              {errorMessage}
            </p>
          )}
          <button
            type="button"
            onClick={handleRegenerate}
            disabled={isGenerating}
            className="flex items-center gap-1 text-xs leading-[1.35] font-semibold text-[#616161] disabled:opacity-50"
          >
            <RefreshIcon className={isGenerating ? "animate-spin" : ""} />
            {isGenerating ? "생성 중..." : "재산출"}
          </button>
        </div>
      </div>
    </div>
  );
}
