"use client";

import { useCompletedProjectsQuery } from "@/queries/useCompletedProjectsQuery";
import { SectionHeader } from "./SectionHeader";
import { CompletedProjectList } from "./CompletedProjectList";

export function CompletedProjectSection() {
  const { data, isLoading, isError } = useCompletedProjectsQuery();

  return (
    <section className="flex w-full flex-col items-start gap-4">
      <SectionHeader
        title="진행 완료한 프로젝트"
        count={!isLoading && !isError ? (data?.length ?? 0) : undefined}
      />
      <CompletedProjectList />
    </section>
  );
}
