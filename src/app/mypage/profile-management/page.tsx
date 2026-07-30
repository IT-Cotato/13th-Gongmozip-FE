"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon, PlusIcon, ProfilePlaceholderIcon } from "./_components/icons";

// TODO: 프로필 목록 조회 API 연동 후 프로필 있음/없음 상태 분기 구현 예정
export default function ProfileManagementPage() {
  const router = useRouter();

  function handleCreateProfile() {
    router.push("/mypage/profile-management/new");
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-white">
      <div className="relative z-10 flex h-[46px] items-center justify-center px-4">
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

      <div className="relative flex flex-1 flex-col items-center gap-5 px-5 py-9">
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
    </div>
  );
}
