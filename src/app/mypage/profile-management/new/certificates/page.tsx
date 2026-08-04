"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TeamMatchingProgress from "@/components/team-matching/TeamMatchingProgress";
import { ChevronLeftIcon, CloseIcon, PlusIcon } from "../../_components/icons";
import { ExitProfileWriteModal } from "../../_components/ExitProfileWriteModal";
import { CertificateCard, type Certificate } from "./_components/CertificateCard";
import { CertificateSheet } from "./_components/CertificateSheet";

// TODO: 자격증 수정용 바텀시트 디자인 전달받으면 구현 예정
export default function CertificatesPage() {
  const router = useRouter();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  function handleAddCertificate() {
    setIsSheetOpen(true);
  }

  function handleSubmitCertificate(certificate: Certificate) {
    setCertificates((prev) => [...prev, certificate]);
  }

  function handleEditCertificate() {
    // TODO: 기존 값으로 채운 수정용 바텀시트 구현 예정
  }

  function handleDeleteCertificate(index: number) {
    setCertificates((prev) => prev.filter((_, i) => i !== index));
  }

  function handleNext() {
    router.push("/mypage/profile-management/new/complete");
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
                onEdit={handleEditCertificate}
                onDelete={() => handleDeleteCertificate(index)}
              />
            ))}
          </div>
        </div>
      </div>

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

      {isSheetOpen && (
        <CertificateSheet
          onClose={() => setIsSheetOpen(false)}
          onSubmit={handleSubmitCertificate}
        />
      )}

      <ExitProfileWriteModal
        onExit={() => router.push("/mypage/profile-management")}
        onOpenChange={setIsExitModalOpen}
        open={isExitModalOpen}
      />
    </div>
  );
}
