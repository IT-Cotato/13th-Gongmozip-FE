"use client";

import { useState } from "react";
import { useCompletedProjectsQuery } from "@/queries/useCompletedProjectsQuery";
import { useDeleteCompletedProjectMutation } from "@/queries/useDeleteCompletedProjectMutation";
import { ApiError } from "@/lib/http";
import { CompletedProjectCard } from "./CompletedProjectCard";
import { DeleteCompletedProjectConfirmModal } from "./DeleteCompletedProjectConfirmModal";
import { EmptyState } from "./EmptyState";

export function CompletedProjectList() {
  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCompletedProjectsQuery();
  const deleteMutation = useDeleteCompletedProjectMutation();
  const [pendingDeleteTeamId, setPendingDeleteTeamId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const projects = data?.pages.flatMap((page) => page.projects) ?? [];

  function openDeleteConfirm(teamId: number) {
    setDeleteError(null);
    setPendingDeleteTeamId(teamId);
  }

  function closeDeleteConfirm() {
    setDeleteError(null);
    setPendingDeleteTeamId(null);
  }

  function handleConfirmDelete() {
    if (pendingDeleteTeamId === null) return;
    setDeleteError(null);
    deleteMutation.mutate(pendingDeleteTeamId, {
      onSuccess: () => setPendingDeleteTeamId(null),
      onError: (error) => {
        setDeleteError(
          error instanceof ApiError ? error.message : "삭제에 실패했어요. 다시 시도해주세요.",
        );
      },
    });
  }

  if (isLoading) {
    return (
      <p className="px-4 py-16 text-center text-[13px] text-[#949494]">
        완료한 프로젝트를 불러오는 중이에요...
      </p>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 px-4 py-16">
        <p className="text-[13px] text-[#949494]">프로젝트 목록을 불러오지 못했어요.</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="rounded-full bg-[#F5F5F5] px-4 py-2 text-[13px] font-medium text-[#1F1F1F]"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <EmptyState
        icon="👟"
        title="아직 완주한 프로젝트가 없어요."
        description="프로젝트를 완료하면 이곳에 기록이 쌓여요"
      />
    );
  }

  return (
    <div className="flex w-full flex-col items-start gap-2 px-4">
      {projects.map((project) => (
        <CompletedProjectCard
          key={project.teamId}
          project={project}
          onDelete={() => openDeleteConfirm(project.teamId)}
        />
      ))}
      {hasNextPage && (
        <button
          type="button"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="w-full rounded-full bg-[#F5F5F5] px-4 py-2 text-[13px] font-medium text-[#1F1F1F] disabled:opacity-50"
        >
          {isFetchingNextPage ? "불러오는 중..." : "더보기"}
        </button>
      )}

      {pendingDeleteTeamId !== null && (
        <DeleteCompletedProjectConfirmModal
          onCancel={closeDeleteConfirm}
          onConfirm={handleConfirmDelete}
          isDeleting={deleteMutation.isPending}
          errorMessage={deleteError}
        />
      )}
    </div>
  );
}
