"use client";

import { useOngoingProjectsQuery } from "@/queries/useOngoingProjectsQuery";
import { SectionHeader } from "./SectionHeader";
import { OngoingProjectList } from "./OngoingProjectList";

export function OngoingProjectSection() {
  const { data, isLoading, isError } = useOngoingProjectsQuery();

  return (
    <section className="flex w-full flex-col items-start gap-4">
      <SectionHeader
        title="진행 중인 프로젝트"
        count={!isLoading && !isError ? (data?.length ?? 0) : undefined}
      />
      <OngoingProjectList />
    </section>
  );
}
