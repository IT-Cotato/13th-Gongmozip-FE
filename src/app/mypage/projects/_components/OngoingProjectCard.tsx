import type { OngoingProject } from "@/queries/useOngoingProjectsQuery";
import { formatYearMonth } from "../_lib/date";
import { TeammateAvatars } from "./TeammateAvatars";

export function OngoingProjectCard({ project }: { project: OngoingProject }) {
  return (
    <div className="flex w-full items-center gap-[10px] rounded-2xl border border-[rgba(97,97,97,0.16)] bg-white p-4">
      <TeammateAvatars teammates={project.teammates} />
      <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
        <p className="w-full truncate px-1 text-[17px] leading-[1.35] font-medium text-[#1F1F1F]">
          {project.projectName}
        </p>
        <p className="flex items-center gap-1 px-1 text-xs leading-[1.35] text-[#616161]">
          <span>{formatYearMonth(project.startDate)}</span>
          <span>~</span>
          <span>진행중</span>
        </p>
      </div>
    </div>
  );
}
