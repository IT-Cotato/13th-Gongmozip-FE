"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TeamMatchingProgress from "@/components/team-matching/TeamMatchingProgress";
import { ChevronLeftIcon, CloseIcon, PlusIcon } from "../../_components/icons";
import { ProjectExperienceCard } from "./_components/ProjectExperienceCard";
import {
  ProjectExperienceSheet,
  type ProjectExperienceInput,
} from "./_components/ProjectExperienceSheet";

const MAX_PROJECTS = 10;

// TODO: 프로필 작성 최종 제출(API 연동) 예정
export default function ProjectExperiencePage() {
  const router = useRouter();
  const [hasNoExperience, setHasNoExperience] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [projects, setProjects] = useState<ProjectExperienceInput[]>([]);
  const hasProjects = projects.length > 0;
  const hasReachedMaxProjects = projects.length >= MAX_PROJECTS;

  function handleAddProject() {
    if (hasReachedMaxProjects) return;
    setIsSheetOpen(true);
  }

  function handleSubmitProject(project: ProjectExperienceInput) {
    setProjects((prev) => (prev.length >= MAX_PROJECTS ? prev : [...prev, project]));
  }

  function handleDeleteProject(index: number) {
    setProjects((prev) => prev.filter((_, i) => i !== index));
  }

  function handleEditProject() {
    // TODO: 기존 값으로 채운 수정용 바텀시트 구현 예정
  }

  function handleNext() {
    router.push("/mypage/profile-management/new/certificates");
  }

  return (
    <div className="flex h-full w-full flex-col bg-white">
      <div className="relative flex h-[46px] shrink-0 items-center justify-center px-4">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="이전"
          className="absolute left-4 flex h-6 w-6 items-center justify-center"
        >
          <ChevronLeftIcon />
        </button>
        <h1 className="text-[17px] leading-[1.35] font-semibold text-[#111827]">프로필 작성</h1>
        <button
          type="button"
          onClick={() => router.push("/mypage/profile-management")}
          aria-label="닫기"
          className="absolute right-4 flex h-[38px] w-[38px] items-center justify-center rounded-[14px]"
        >
          <CloseIcon />
        </button>
      </div>

      <TeamMatchingProgress currentStep={2} totalSteps={3} />

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-4 pt-[22px] pb-10">
          <h2 className="px-4 text-[22px] leading-[1.35] font-bold text-[#1f1f1f]">프로젝트 경험</h2>

          <div className="flex flex-col gap-3 px-6">
            <p className="w-full text-[17px] leading-[1.35] font-medium text-[#1f1f1f]">
              2개월 이상 의미있게 진행한
              <br />
              개인/팀 프로젝트가 있나요?
            </p>
            <div className="w-full text-[13px] leading-[1.5] text-[#949494]">
              <p>프로젝트 경험은 최대 10개까지 추가 가능해요.</p>
              <p>
                모든 프로젝트를 적는 것이 아닌
                <br />
                2개월 이상 의미있게 진행한 프로젝트만 적어주세요.
              </p>
              <p>경험이 없어도 괜찮아요.</p>
            </div>
          </div>

          {hasProjects ? (
            <div className="flex flex-col items-center gap-4 px-5">
              <button
                type="button"
                onClick={handleAddProject}
                disabled={hasReachedMaxProjects}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[rgba(97,97,97,0.1)] text-[15px] leading-[1.25] font-semibold text-[#616161] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <PlusIcon />
                추가
              </button>

              {projects.map((project, index) => (
                <ProjectExperienceCard
                  key={`${project.name}-${index}`}
                  project={project}
                  onEdit={handleEditProject}
                  onDelete={() => handleDeleteProject(index)}
                />
              ))}
            </div>
          ) : (
            <div className="flex h-[106px] items-center gap-2 px-4">
              <button
                type="button"
                onClick={() => {
                  setHasNoExperience(true);
                  router.push("/mypage/profile-management/new/certificates");
                }}
                aria-pressed={hasNoExperience}
                className={`flex h-full flex-1 items-center justify-center rounded-[14px] border px-2.5 py-[9px] text-center text-[17px] leading-[1.25] font-semibold ${
                  hasNoExperience
                    ? "border-[#FF7658] text-[#FF7658]"
                    : "border-[rgba(97,97,97,0.5)] text-[#616161]"
                }`}
              >
                프로젝트 경험이
                <br />
                아직 없어요
              </button>
              <button
                type="button"
                onClick={handleAddProject}
                className="flex h-full flex-1 items-center justify-center gap-2 rounded-[14px] bg-[#ff7658] px-2.5 py-[9px] text-[17px] leading-[1.25] font-semibold text-white"
              >
                <PlusIcon />
                프로젝트 입력
              </button>
            </div>
          )}
        </div>
      </div>

      {hasProjects && (
        <div className="sticky bottom-0 flex gap-2.5 bg-gradient-to-t from-white from-[38.462%] to-white/0 p-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="h-12 flex-1 rounded-[14px] border border-[rgba(97,97,97,0.5)] px-2.5 py-[9px] text-[17px] leading-[1.25] font-semibold text-[#616161]"
          >
            이전
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="h-12 flex-1 rounded-[14px] bg-[#FF7658] px-2.5 py-[9px] text-[17px] leading-[1.25] font-semibold text-white"
          >
            다음
          </button>
        </div>
      )}

      {isSheetOpen && (
        <ProjectExperienceSheet
          onClose={() => setIsSheetOpen(false)}
          onSubmit={handleSubmitProject}
        />
      )}
    </div>
  );
}
