"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon, PlusIcon } from "../../_components/icons";

export default function ProfileCompletePage() {
  const router = useRouter();

  return (
    <div className="relative isolate flex h-full w-full flex-col overflow-hidden bg-white">
      <Image
        src="/images/mypage/profileCompleteBlob.svg"
        alt=""
        aria-hidden="true"
        width={256}
        height={314}
        className="pointer-events-none absolute top-[90px] -left-[113px] -z-10 w-[256px] rotate-[-76.82deg]"
      />

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
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-3 px-6 pt-6">
          <h2 className="text-[22px] leading-[1.35] font-bold text-[#1f1f1f]">
            팀원 매칭에 필요한
            <br />
            프로필 작성을 완료했어요 !
          </h2>
          <p className="text-[17px] leading-[1.5] font-medium text-[#616161]">
            언제든 마이페이지에서
            <br />
            프로필을 수정할 수 있습니다.
            <br />
            혹시 까먹고 못적은 정보가 있다면,
            <br />
            지금 추가하세요.
          </p>
        </div>

        <div className="relative mx-auto mt-6 h-[155px] w-[340px] max-w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/mypage/profileCompleteCharacters.png"
            alt="프로필 작성을 축하하는 공모집 캐릭터들"
            className="absolute left-0 w-full max-w-none"
            style={{ top: "-66.45%", height: "219.35%" }}
          />
        </div>

        <div className="flex flex-col gap-2 px-4 pt-4 pb-6">
          <button
            type="button"
            onClick={() => router.push("/mypage/profile-management/new/experience")}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-[rgba(97,97,97,0.1)] text-[17px] leading-[1.25] font-semibold text-[#616161]"
          >
            <PlusIcon />
            프로젝트 경험 추가
          </button>
          <button
            type="button"
            onClick={() => router.push("/mypage/profile-management/new/certificates")}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-[rgba(97,97,97,0.1)] text-[17px] leading-[1.25] font-semibold text-[#616161]"
          >
            <PlusIcon />
            보유 자격증 추가
          </button>
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
          onClick={() => router.push("/mypage")}
          className="h-12 flex-1 rounded-[14px] bg-[#FF7658] px-2.5 py-[9px] text-[17px] leading-[1.25] font-semibold text-white"
        >
          완료하기
        </button>
      </div>
    </div>
  );
}
