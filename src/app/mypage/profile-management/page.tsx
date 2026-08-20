"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon, PlusIcon, ProfilePlaceholderIcon } from "./_components/icons";
import { ProfileCard } from "./_components/ProfileCard";
import { DeleteProfileConfirmModal } from "./_components/DeleteProfileConfirmModal";
import { useProfileListQuery } from "@/queries/useProfileListQuery";
import { useProfilePreviewsQuery } from "@/queries/useProfilePreviewQuery";
import { useDeleteProfileMutation } from "@/queries/useDeleteProfileMutation";
import { useUpdateProfileVisibilityMutation } from "@/queries/useUpdateProfileVisibilityMutation";
import { useMemberProfileQuery } from "@/queries/useMemberProfileQuery";
import { useMypageSummaryQuery } from "@/queries/useMypageSummaryQuery";
import { useCharacterPalettesQuery } from "@/queries/useCharacterPalettesQuery";
import { getCollaborationCharacterMeta, getPaletteStyle } from "../_lib/collaborationCharacter";
import { ApiError } from "@/lib/http";

export default function ProfileManagementPage() {
  const router = useRouter();
  const profileListQuery = useProfileListQuery();
  const memberProfileQuery = useMemberProfileQuery();
  const summaryQuery = useMypageSummaryQuery();
  const palettesQuery = useCharacterPalettesQuery();
  const profiles = profileListQuery.data?.profiles ?? [];
  const profileIds = profiles.map((profile) => String(profile.profileId));
  const previewQueries = useProfilePreviewsQuery(profileIds);
  const deleteProfileMutation = useDeleteProfileMutation();
  const visibilityMutation = useUpdateProfileVisibilityMutation();
  const [profileIdPendingDelete, setProfileIdPendingDelete] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const isLoading = profileListQuery.isLoading;
  const isError = profileListQuery.isError;
  const hasProfiles = profiles.length > 0;
  const publicProfileCount = profiles.filter((profile) => profile.isPublic).length;
  const characterMeta = summaryQuery.data?.character
    ? getCollaborationCharacterMeta(summaryQuery.data.character.characterType)
    : null;
  const characterPalette = palettesQuery.data?.palettes.find(
    (palette) => palette.paletteCode === summaryQuery.data?.character?.paletteCode,
  );

  function handleCreateProfile() {
    router.push("/mypage/profile-management/new");
  }

  function handleConfirmDelete() {
    if (!profileIdPendingDelete) return;
    setDeleteError(null);
    deleteProfileMutation.mutate(profileIdPendingDelete, {
      onSuccess: () => setProfileIdPendingDelete(null),
      onError: (error) => {
        setDeleteError(
          error instanceof ApiError
            ? error.message
            : "프로필 삭제에 실패했습니다. 다시 시도해주세요.",
        );
      },
    });
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#f5f5f5]">
      <div className="relative z-10 flex h-[46px] shrink-0 items-center justify-center bg-white px-4">
        <button
          type="button"
          onClick={() => router.push("/mypage")}
          aria-label="뒤로가기"
          className="absolute left-4 flex h-6 w-6 items-center justify-center"
        >
          <ChevronLeftIcon />
        </button>
        <h1 className="text-[17px] leading-[1.35] font-semibold text-[#111111]">프로필 관리</h1>
      </div>

      {isLoading && (
        <p className="px-4 py-16 text-center text-[13px] text-[#949494]">
          프로필을 불러오는 중이에요...
        </p>
      )}

      {isError && !isLoading && (
        <div className="flex flex-col items-center gap-3 px-4 py-16">
          <p className="text-[13px] text-[#949494]">프로필 목록을 불러오지 못했어요.</p>
          <button
            type="button"
            onClick={() => profileListQuery.refetch()}
            className="rounded-full bg-white px-4 py-2 text-[13px] font-medium text-[#1F1F1F]"
          >
            다시 시도
          </button>
        </div>
      )}

      {!isLoading && !isError && (
        <div className="flex flex-1 flex-col overflow-y-auto">
          <div className="flex items-center gap-2 bg-white px-6 py-5">
            <div
              className="flex size-[67px] shrink-0 items-center justify-center overflow-hidden rounded-full"
              style={
                characterMeta ? getPaletteStyle(characterPalette) : { backgroundColor: "#fff" }
              }
            >
              {characterMeta?.imageSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={characterMeta.imageSrc} alt="" className="size-[85%] object-contain" />
              ) : (
                <ProfilePlaceholderIcon />
              )}
            </div>
            <div className="flex flex-1 flex-col items-start">
              <p className="w-full text-[13px] leading-[1.5] text-[#616161]">
                {memberProfileQuery.data?.name ? `${memberProfileQuery.data.name}님` : "회원님"}
              </p>
              <p className="flex w-full items-center gap-1 text-[20px] leading-[1.35] font-semibold whitespace-nowrap">
                <span className="text-[#1f1f1f]">프로필</span>
                <span className="text-[#ac4a35]">{profileListQuery.data?.profileCount ?? 0}</span>
                <span className="text-[#1f1f1f]">개</span>
              </p>
              <p className="flex w-full items-center gap-1 text-[13px] leading-[1.5] whitespace-nowrap text-[#1f1f1f]">
                <span>프로필</span>
                <span>{publicProfileCount}개</span>
                <span>공개 중</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 p-4">
            <button
              type="button"
              onClick={handleCreateProfile}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#ff7658] text-[15px] leading-[1.25] font-semibold text-white"
            >
              <PlusIcon />
              프로필 추가
            </button>

            {hasProfiles ? (
              <div className="flex flex-col gap-4">
                {profiles.map((profile, index) => {
                  const previewQuery = previewQueries[index];
                  const preview = previewQuery?.data;
                  if (!preview) return null;

                  return (
                    <ProfileCard
                      key={profile.profileId}
                      preview={preview}
                      updatedAt={profile.updatedAt}
                      onToggleVisibility={() =>
                        visibilityMutation.mutate({
                          profileId: String(profile.profileId),
                          isPublic: !preview.isPublic,
                        })
                      }
                      onDelete={() => {
                        setDeleteError(null);
                        setProfileIdPendingDelete(String(profile.profileId));
                      }}
                    />
                  );
                })}
              </div>
            ) : (
              <p className="px-1 py-8 text-center text-[13px] leading-[1.5] text-[#949494]">
                등록된 프로필이 없어요. 프로필을 작성하러 가볼까요?
              </p>
            )}
          </div>
        </div>
      )}

      {profileIdPendingDelete && (
        <DeleteProfileConfirmModal
          onCancel={() => {
            setProfileIdPendingDelete(null);
            setDeleteError(null);
          }}
          onConfirm={handleConfirmDelete}
          isDeleting={deleteProfileMutation.isPending}
          error={deleteError}
        />
      )}
    </div>
  );
}
