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
import { ApiError } from "@/lib/http";

export default function CertificatesPage() {
  const router = useRouter();
  const draftBasicInfo = useProfileDraftStore((state) => state.basicInfo);
  const draftProjects = useProfileDraftStore((state) => state.projects);
  const draftCertificates = useProfileDraftStore((state) => state.certificates);
  const editingProfileId = useProfileDraftStore((state) => state.editingProfileId);
  const resetProfileDraft = useProfileDraftStore((state) => state.resetProfileDraft);
  const createProfileMutation = useCreateProfileWithDetailsMutation();
  const updateProfileMutation = useUpdateProfileWithDetailsMutation();
  const isSubmitting = createProfileMutation.isPending || updateProfileMutation.isPending;
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
      setSubmitError(
        error instanceof ApiError ? error.message : "프로필 등록에 실패했습니다. 다시 시도해주세요.",
      );
    };

    if (editingProfileId !== null) {
      updateProfileMutation.mutate(
        { profileId: editingProfileId, basicInfo: draftBasicInfo, projects: draftProjects, certificates },
        {
          onSuccess: () => {
            resetProfileDraft();
            router.push(`/mypage/profile-management/${editingProfileId}`);
          },
          onError,
        },
      );
      return;
    }

    createProfileMutation.mutate(
      { basicInfo: draftBasicInfo, projects: draftProjects, certificates },
      {
        onSuccess: () => {
          resetProfileDraft();
          router.push("/mypage/profile-management/new/complete");
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
          onClick={() => router.back()}
          aria-label="이전"
          className="absolute left-4 flex h-6 w-6 items-center justify-center"
        >
          <ChevronLeftIcon />
        </button>
        <h1 className="text-[17px] leading-[1.35] font-semibold text-[#111827]">
          {editingProfileId !== null ? "프로필 수정" : "프로필 작성"}
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
        {submitError && (
          <p className="px-1 text-xs leading-[1.35] text-[#BB5260]">{submitError}</p>
        )}
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={() => router.back()}
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
            {editingProfileId !== null
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
          const exitDestination =
            editingProfileId !== null
              ? `/mypage/profile-management/${editingProfileId}`
              : "/mypage/profile-management";
          resetProfileDraft();
          router.push(exitDestination);
        }}
        onOpenChange={setIsExitModalOpen}
        open={isExitModalOpen}
      />
    </div>
  );
}
