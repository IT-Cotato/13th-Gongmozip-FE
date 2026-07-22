"use client";

import { useOngoingProjectsQuery } from "@/queries/useOngoingProjectsQuery";
import { EmptyState } from "./EmptyState";
import { OngoingProjectCard } from "./OngoingProjectCard";

export function OngoingProjectList() {
  const { data, isLoading, isError, refetch } = useOngoingProjectsQuery();

  if (isLoading) {
    return (
      <p className="px-4 py-16 text-center text-[13px] text-[#949494]">
        진행중인 프로젝트를 불러오는 중이에요...
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

  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon="💨"
        title="지금은 잠시 숨 고르는 중!"
        description="새로운 프로젝트가 시작되면 여기서 확인할 수 있어요."
      />
    );
  }

  return (
    <div className="flex w-full flex-col items-start gap-2 px-4">
      {data.map((project) => (
        <OngoingProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
