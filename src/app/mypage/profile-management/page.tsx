"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon, PlusIcon, ProfilePlaceholderIcon } from "./_components/icons";
import { ProfileCard } from "./_components/ProfileCard";
import { DeleteProfileConfirmModal } from "./_components/DeleteProfileConfirmModal";
import { useProfileListQuery } from "@/queries/useProfileListQuery";
import { useProfilePreviewsQuery } from "@/queries/useProfilePreviewQuery";
import { useDeleteProfileMutation } from "@/queries/useDeleteProfileMutation";
import { useUpdateProfileVisibilityMutation } from "@/queries/useUpdateProfileVisibilityMutation";

export default function ProfileManagementPage() {
  const router = useRouter();
  const profileListQuery = useProfileListQuery();
  const profiles = profileListQuery.data?.profiles ?? [];
  const profileIds = profiles.map((profile) => String(profile.profileId));
  const previewQueries = useProfilePreviewsQuery(profileIds);
  const deleteProfileMutation = useDeleteProfileMutation();
  const visibilityMutation = useUpdateProfileVisibilityMutation();
  const [profileIdPendingDelete, setProfileIdPendingDelete] = useState<string | null>(null);

  const isLoading = profileListQuery.isLoading;
  const isError = profileListQuery.isError;
  const hasProfiles = profiles.length > 0;

  function handleCreateProfile() {
    router.push("/mypage/profile-management/new");
  }

  function handleConfirmDelete() {
    if (!profileIdPendingDelete) return;
    deleteProfileMutation.mutate(profileIdPendingDelete, {
      onSuccess: () => setProfileIdPendingDelete(null),
    });
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-white">
      <div className="relative z-10 flex h-[46px] shrink-0 items-center justify-center px-4">
        <button
          type="button"
          onClick={() => router.back()}
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
            className="rounded-full bg-[#F5F5F5] px-4 py-2 text-[13px] font-medium text-[#1F1F1F]"
          >
            다시 시도
          </button>
        </div>
      )}

      {!isLoading && !isError && !hasProfiles && (
        <div className="relative isolate flex flex-1 flex-col items-center gap-5 px-5 py-9">
          <Image
            src="/images/mypage/profile-empty-background.svg"
            alt=""
            fill
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 object-cover"
          />

          <div className="flex w-full flex-col items-center gap-1 text-center">
            <p className="w-full text-[17px] leading-[1.5] text-[#1f1f1f]">등록된 프로필이 없어요</p>
            <p className="w-full text-[13px] leading-[1.5] text-[#616161]">
              프로필을 작성하러 가볼까요?
            </p>
          </div>

          <div className="size-[80px] shrink-0">
            <ProfilePlaceholderIcon />
          </div>

          <div className="flex w-full flex-col items-start px-5 py-2.5">
            <button
              type="button"
              onClick={handleCreateProfile}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-[#ff7658] px-2.5 py-[9px] text-[17px] leading-[1.25] font-semibold text-white"
            >
              <PlusIcon />
              프로필 작성하기
            </button>
          </div>
        </div>
      )}

      {!isLoading && !isError && hasProfiles && (
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-5">
          <button
            type="button"
            onClick={handleCreateProfile}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[rgba(97,97,97,0.1)] text-[15px] leading-[1.25] font-semibold text-[#616161]"
          >
            <PlusIcon />
            프로필 추가
          </button>

          <div className="flex flex-col gap-3">
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
                  onDelete={() => setProfileIdPendingDelete(String(profile.profileId))}
                />
              );
            })}
          </div>
        </div>
      )}

      {profileIdPendingDelete && (
        <DeleteProfileConfirmModal
          onCancel={() => setProfileIdPendingDelete(null)}
          onConfirm={handleConfirmDelete}
          isDeleting={deleteProfileMutation.isPending}
        />
      )}
    </div>
  );
}
