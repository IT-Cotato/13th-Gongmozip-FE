import type { CompletedProject } from "@/queries/useCompletedProjectsQuery";
import { getProjectBadgeImage, getProjectBadgeLabel } from "../_lib/badge";
import { formatYearMonth } from "../_lib/date";
import { CloseIcon } from "./icons";

export function CompletedProjectCard({
  project,
  onDelete,
}: {
  project: CompletedProject;
  onDelete: () => void;
}) {
  return (
    <div className="relative flex w-full items-center gap-[10px] rounded-2xl border border-[rgba(97,97,97,0.16)] bg-white p-4">
      <div className="flex size-[68px] shrink-0 items-center justify-center overflow-hidden">
        <img
          src={getProjectBadgeImage(project.medal)}
          alt={getProjectBadgeLabel(project.medal)}
          className="size-full object-contain"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
        <p className="w-full truncate px-1 text-[17px] leading-[1.35] font-medium text-[#1F1F1F]">
          {project.contestTitle}
        </p>
        <p className="flex items-center gap-1 px-1 text-xs leading-[1.35] text-[#616161]">
          <span>{formatYearMonth(project.completedAt)} 완료</span>
        </p>
      </div>
      <button
        type="button"
        onClick={onDelete}
        aria-label="완료 기록 삭제"
        className="absolute top-[15px] right-[15px] flex size-7 items-center justify-center rounded-[10px]"
      >
        <CloseIcon />
      </button>
    </div>
  );
}
