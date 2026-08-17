"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Toggle } from "@/app/mypage/settings/_components/Toggle";
import type { ProfilePreview } from "@/queries/useProfilePreviewQuery";
import { fetchProfileDetail, profileDetailQueryKey } from "@/queries/useProfileDetailQuery";
import { useProfileDraftStore } from "@/stores/profileDraftStore";
import { buildProfileDraftFromDetail } from "../_lib/profileDraft";

function formatDate(isoDate: string) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

type ProfileCardProps = {
  preview: ProfilePreview;
  updatedAt: string;
  onToggleVisibility: () => void;
  onDelete: () => void;
};

export function ProfileCard({
  preview,
  updatedAt,
  onToggleVisibility,
  onDelete,
}: ProfileCardProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setBasicInfo = useProfileDraftStore((state) => state.setBasicInfo);
  const setProjects = useProfileDraftStore((state) => state.setProjects);
  const setCertificates = useProfileDraftStore((state) => state.setCertificates);
  const setEditingProfileId = useProfileDraftStore((state) => state.setEditingProfileId);
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);
  const [editError, setEditError] = useState(false);
  const projectNames = preview.projectSummaries.map((project) => project.projectName);

  function handleCardClick() {
    router.push(`/mypage/profile-management/${preview.profileId}`);
  }

  async function handleEditClick(event: React.MouseEvent) {
    event.stopPropagation();
    if (isLoadingEdit) return;

    const profileId = String(preview.profileId);
    setIsLoadingEdit(true);
    setEditError(false);

    try {
      const profile = await queryClient.fetchQuery({
        queryKey: profileDetailQueryKey(profileId),
        queryFn: () => fetchProfileDetail(profileId),
      });
      const draft = buildProfileDraftFromDetail(profile);
      setBasicInfo(draft.basicInfo);
      setProjects(() => draft.projects);
      setCertificates(() => draft.certificates);
      setEditingProfileId(profile.profileId);
      router.push("/mypage/profile-management/new");
    } catch {
      setEditError(true);
      setIsLoadingEdit(false);
    }
  }

  return (
    <div className="flex w-full flex-col items-center overflow-hidden rounded-2xl border border-[rgba(97,97,97,0.16)] bg-white">
      <div
        role="button"
        tabIndex={0}
        onClick={handleCardClick}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleCardClick();
          }
        }}
        className="flex w-full cursor-pointer flex-col items-end gap-6 p-5 text-left"
      >
        <div className="flex w-full items-center justify-between">
          <div className="flex flex-1 items-baseline gap-1 text-[13px]">
            <span className="font-semibold text-[#ac4a35]">{formatDate(updatedAt)}</span>
            <span className="font-medium text-[#616161]">수정</span>
          </div>
          <div
            className="flex shrink-0 items-center gap-1"
            onClick={(event) => event.stopPropagation()}
          >
            <span className="text-[13px] font-medium text-[#616161]">프로필 공개 설정</span>
            <Toggle
              checked={preview.isPublic}
              onChange={onToggleVisibility}
              label="프로필 공개 설정"
            />
          </div>
        </div>

        <div className="flex w-full flex-col items-start justify-center gap-2">
          <p className="flex w-full items-center gap-1 text-[17px] font-semibold whitespace-nowrap">
            <span className="text-[#1f1f1f]">주요 프로젝트</span>
            <span className="text-[#ac4a35]">{projectNames.length}</span>
            <span className="text-[#1f1f1f]">개</span>
          </p>
          <p className="w-full truncate px-1.5 text-[13px] font-medium text-[#616161]">
            {projectNames.length > 0 ? projectNames.join(", ") : "등록된 프로젝트가 없어요"}
          </p>
        </div>
      </div>

      <div className="flex h-[42px] w-full items-center justify-center border-t border-[rgba(97,97,97,0.08)]">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
          className="flex h-full flex-1 items-center justify-center border-r border-[rgba(97,97,97,0.08)] p-[10px] text-[15px] font-medium text-[#616161]"
        >
          삭제
        </button>
        <button
          type="button"
          onClick={handleEditClick}
          disabled={isLoadingEdit}
          className="flex h-full flex-1 items-center justify-center p-[10px] text-[15px] font-medium text-[#616161] disabled:opacity-50"
        >
          {isLoadingEdit ? "불러오는 중..." : "수정"}
        </button>
      </div>
      {editError && (
        <p role="alert" className="w-full px-5 pb-3 text-xs text-[#BB5260]">
          프로필 정보를 불러오지 못했어요. 다시 시도해주세요.
        </p>
      )}
    </div>
  );
}
