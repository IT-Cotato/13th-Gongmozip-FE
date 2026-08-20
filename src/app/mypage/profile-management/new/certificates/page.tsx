"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TeamMatchingProgress from "@/components/team-matching/TeamMatchingProgress";
import { ChevronLeftIcon, CloseIcon, PlusIcon } from "../../_components/icons";
import { ExitProfileWriteModal } from "../../_components/ExitProfileWriteModal";
import { CertificateCard, type Certificate } from "./_components/CertificateCard";
import { CertificateSheet } from "./_components/CertificateSheet";
import { useProfileDraftStore } from "@/stores/profileDraftStore";
import {
  useCreateProfileWithDetailsMutation,
  useUpdateProfileWithDetailsMutation,
} from "@/queries/useCreateProfileWithDetailsMutation";
import { useUpdateProfileVisibilityMutation } from "@/queries/useUpdateProfileVisibilityMutation";
import { ApiError } from "@/lib/http";

export default function CertificatesPage() {
  const router = useRouter();
  const draftBasicInfo = useProfileDraftStore((state) => state.basicInfo);
  const draftProjects = useProfileDraftStore((state) => state.projects);
  const draftCertificates = useProfileDraftStore((state) => state.certificates);
  const setDraftCertificates = useProfileDraftStore((state) => state.setCertificates);
  const editingProfileId = useProfileDraftStore((state) => state.editingProfileId);
  const setEditingProfileId = useProfileDraftStore((state) => state.setEditingProfileId);
  const isEditingExistingProfile = useProfileDraftStore((state) => state.isEditingExistingProfile);
  const resetProfileDraft = useProfileDraftStore((state) => state.resetProfileDraft);
  const createProfileMutation = useCreateProfileWithDetailsMutation();
  const updateProfileMutation = useUpdateProfileWithDetailsMutation();
  const visibilityMutation = useUpdateProfileVisibilityMutation();
  const isSubmitting =
    createProfileMutation.isPending ||
    updateProfileMutation.isPending ||
    visibilityMutation.isPending;
  const [certificates, setCertificates] = useState<Certificate[]>(draftCertificates);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function handleAddCertificate() {
    setEditingIndex(null);
    setIsSheetOpen(true);
  }

  function handleSubmitCertificate(certificate: Certificate) {
    if (editingIndex !== null) {
      setCertificates((prev) =>
        prev.map((existing, i) => (i === editingIndex ? certificate : existing)),
      );
      return;
    }
    setCertificates((prev) => [...prev, certificate]);
  }

  function handleEditCertificate(index: number) {
    setEditingIndex(index);
    setIsSheetOpen(true);
  }

  function handleCloseSheet() {
    setIsSheetOpen(false);
    setEditingIndex(null);
  }

  function handleDeleteCertificate(index: number) {
    setCertificates((prev) => prev.filter((_, i) => i !== index));
  }

  function handleNext() {
    if (isSubmitting) return;
    setSubmitError(null);

    const onError = (error: unknown) => {
      const message =
        error instanceof ApiError
          ? error.message
          : "프로필 등록에 실패했습니다. 다시 시도해주세요.";

      // 닉네임은 1단계 입력 항목이라 정상 흐름이라면 이미 1단계에서 검증이 끝나
      // 있지만, 만일을 대비한 방어 처리로 남겨둔다. 그대로 여기 띄우면 자격증
      // 문제로 오해하기 쉬우므로 1단계로 돌려보내 닉네임 입력창 옆에 보여준다.
      if (message.includes("닉네임")) {
        useProfileDraftStore.getState().setNicknameError(message);
        router.replace("/mypage/profile-management/new");
        return;
      }

      setSubmitError(message);
    };

    if (isEditingExistingProfile) {
      if (editingProfileId === null) return;
      updateProfileMutation.mutate(
        {
          profileId: editingProfileId,
          basicInfo: draftBasicInfo,
          projects: draftProjects,
          certificates,
        },
        {
          onSuccess: () => {
            resetProfileDraft();
            router.replace(`/mypage/profile-management/${editingProfileId}`);
          },
          onError,
        },
      );
      return;
    }

    // 새 프로필 작성 흐름에서는 1단계("다음")에서 이미 프로필이 생성돼
    // editingProfileId를 갖고 있으므로, 여기서는 그 프로필을 수정(PATCH)해
    // 프로젝트/자격증을 마저 채운다. 완료 화면에서 "프로젝트 경험/자격증
    // 추가"로 같은 프로필에 이어서 더 담을 수 있으므로 초안은 지우지 않는다
    // (진짜로 나갈 때인 완료하기/이탈 시점에 지운다).
    if (editingProfileId !== null) {
      updateProfileMutation.mutate(
        {
          profileId: editingProfileId,
          basicInfo: draftBasicInfo,
          projects: draftProjects,
          certificates,
        },
        {
          onSuccess: () => {
            // 1단계에서 생성될 때는 비공개(isPublic: false)였다 - 프로젝트/자격증까지
            // 다 채운 지금에야 다른 사용자에게 보여도 되는 상태이므로 공개로 전환한다.
            // 공개 전환이 실패해도 프로필 내용 자체는 이미 저장됐으니 완료 화면으로는
            // 그대로 넘어간다(비공개 상태로 남을 뿐, 목록에서 다시 공개로 바꿀 수 있음).
            visibilityMutation.mutate(
              { profileId: String(editingProfileId), isPublic: true },
              {
                onSettled: () => router.replace("/mypage/profile-management/new/complete"),
              },
            );
          },
          onError,
        },
      );
      return;
    }

    // 1단계를 거치지 않고 이 화면으로 바로 진입한 경우를 대비한 방어적 fallback.
    createProfileMutation.mutate(
      { basicInfo: draftBasicInfo, projects: draftProjects, certificates },
      {
        onSuccess: (data) => {
          setEditingProfileId(data.profileId);
          router.replace("/mypage/profile-management/new/complete");
        },
        onError,
      },
    );
  }

  return (
    <div className="flex h-full w-full flex-col bg-white">
      <div className="relative flex h-[46px] shrink-0 items-center justify-center px-4">
        <button
          type="button"
          onClick={() => {
            setDraftCertificates(() => certificates);
            router.replace("/mypage/profile-management/new/experience");
          }}
          aria-label="이전"
          className="absolute left-4 flex h-6 w-6 items-center justify-center"
        >
          <ChevronLeftIcon />
        </button>
        <h1 className="text-[17px] leading-[1.35] font-semibold text-[#111827]">
          {isEditingExistingProfile ? "프로필 수정" : "프로필 작성"}
        </h1>
        <button
          type="button"
          onClick={() => setIsExitModalOpen(true)}
          aria-label="닫기"
          className="absolute right-4 flex h-[38px] w-[38px] items-center justify-center rounded-[14px]"
        >
          <CloseIcon />
        </button>
      </div>

      <TeamMatchingProgress currentStep={3} totalSteps={3} />

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-4 pt-[22px] pb-10">
          <h2 className="px-4 text-[22px] leading-[1.35] font-bold text-[#1f1f1f]">보유 자격증</h2>

          <div className="flex flex-col gap-3 px-6">
            <p className="w-full text-[17px] leading-[1.35] font-medium text-[#1f1f1f]">
              보유하고 있는 자격증을 등록해주세요.
            </p>
            <p className="w-full text-[13px] leading-[1.5] text-[#949494]">
              유효기간이 아직 유효한 자격증만 등록해주세요.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 px-5">
            <button
              type="button"
              onClick={handleAddCertificate}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[rgba(97,97,97,0.1)] text-[15px] leading-[1.25] font-semibold text-[#616161]"
            >
              <PlusIcon />
              추가
            </button>

            {certificates.map((certificate, index) => (
              <CertificateCard
                key={`${certificate.name}-${index}`}
                certificate={certificate}
                onEdit={() => handleEditCertificate(index)}
                onDelete={() => handleDeleteCertificate(index)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 flex flex-col gap-2 bg-gradient-to-t from-white from-[38.462%] to-white/0 p-4">
        {submitError && <p className="px-1 text-xs leading-[1.35] text-[#BB5260]">{submitError}</p>}
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={() => {
              setDraftCertificates(() => certificates);
              router.replace("/mypage/profile-management/new/experience");
            }}
            disabled={isSubmitting}
            className="h-12 flex-1 rounded-[14px] border border-[rgba(97,97,97,0.5)] px-2.5 py-[9px] text-[17px] leading-[1.25] font-semibold text-[#616161] disabled:opacity-50"
          >
            이전
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting}
            className="h-12 flex-1 rounded-[14px] bg-[#FF7658] px-2.5 py-[9px] text-[17px] leading-[1.25] font-semibold text-white disabled:opacity-50"
          >
            {isEditingExistingProfile
              ? isSubmitting
                ? "수정 중..."
                : "수정 완료"
              : isSubmitting
                ? "등록 중..."
                : "다음"}
          </button>
        </div>
      </div>

      {isSheetOpen && (
        <CertificateSheet
          onClose={handleCloseSheet}
          onSubmit={handleSubmitCertificate}
          initialCertificate={editingIndex !== null ? certificates[editingIndex] : undefined}
        />
      )}

      <ExitProfileWriteModal
        onExit={() => {
          // 1~3단계는 서로 push가 아닌 replace로만 이동하므로 스택에는 마법사 진입
          // 시점에 쌓인 엔트리 하나뿐이다. replace로 나가면 그 위에 엔트리가 하나
          // 더 쌓여 뒤로가기 시 마법사로 되돌아오므로, back()으로 진입 화면(목록/
          // 미리보기)으로 정확히 되돌아간다.
          resetProfileDraft();
          router.back();
        }}
        onOpenChange={setIsExitModalOpen}
        open={isExitModalOpen}
      />
    </div>
  );
}
