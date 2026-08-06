import { EditIcon } from "@/app/mypage/_components/icons";
import { CloseIcon } from "../../../_components/icons";
import type { ProjectExperienceInput } from "./ProjectExperienceSheet";

const CATEGORY_CHIP_STYLE: Record<string, { bg: string; text: string }> = {
  "공모전 출품": { bg: "#EBF7FE", text: "#12384F" },
  "교내 프로젝트": { bg: "#EEFBF2", text: "#184224" },
  "대외활동 프로젝트": { bg: "#F5F5F5", text: "#616161" },
};

function formatMonthLabel(value: string) {
  if (!value) return "-";
  const [year, month] = value.split("-");
  return `${year}.${month}`;
}

type ProjectExperienceCardProps = {
  project: ProjectExperienceInput;
  onEdit: () => void;
  onDelete: () => void;
};

export function ProjectExperienceCard({ project, onEdit, onDelete }: ProjectExperienceCardProps) {
  const chipStyle =
    CATEGORY_CHIP_STYLE[project.category] ?? CATEGORY_CHIP_STYLE["대외활동 프로젝트"];

  return (
    <div className="relative flex w-full flex-col items-start gap-2.5 rounded-2xl border border-[rgba(97,97,97,0.16)] p-4">
      <span
        className="rounded-full px-2 py-1 text-xs leading-[1.35] font-semibold"
        style={{ backgroundColor: chipStyle.bg, color: chipStyle.text }}
      >
        {project.category}
      </span>

      <div className="flex w-full flex-col gap-1">
        <p className="px-1 text-[17px] leading-[1.35] font-medium text-[#1f1f1f]">{project.name}</p>
        <div className="flex items-center gap-1 px-1 text-xs leading-[1.35] text-[#616161]">
          <span>{formatMonthLabel(project.startMonth)}</span>
          <span>~</span>
          <span>{formatMonthLabel(project.endMonth)}</span>
        </div>

        {project.content.trim().length > 0 && (
          <div className="w-full rounded-xl bg-[#F5F5F5] px-2 py-4">
            <p className="line-clamp-2 px-1 text-[13px] leading-[1.5] text-[#616161]">
              {project.content}
            </p>
          </div>
        )}
      </div>

      <div className="absolute top-[15px] right-[15px] flex items-center gap-1">
        <button
          type="button"
          aria-label="프로젝트 수정"
          onClick={onEdit}
          className="flex size-7 items-center justify-center rounded-[10px]"
        >
          <EditIcon />
        </button>
        <button
          type="button"
          aria-label="프로젝트 삭제"
          onClick={onDelete}
          className="flex size-7 items-center justify-center rounded-[10px]"
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );
}
