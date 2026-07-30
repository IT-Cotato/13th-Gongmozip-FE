"use client";

import { useRouter } from "next/navigation";
import { EffectiveDateAccordion } from "@/components/legal/EffectiveDateAccordion";
import { PrivacySections } from "@/components/legal/PrivacySections";
import { ChevronLeftIcon } from "./_components/icons";

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className="flex h-full w-full flex-col bg-white">
      <div className="flex-1 overflow-y-auto">
        <div className="relative flex items-center justify-center px-4 py-1">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="뒤로가기"
            className="absolute left-4 flex h-6 w-6 items-center justify-center"
          >
            <ChevronLeftIcon />
          </button>
          <h1 className="text-[17px] leading-[1.35] font-semibold text-[#111111]">
            개인정보 처리방침
          </h1>
        </div>

        <div className="px-6 pt-6 pb-10">
          <h2 className="mb-3 text-lg font-bold text-gray-900">개인정보 처리방침 동의</h2>
          <EffectiveDateAccordion />
          <PrivacySections />
        </div>
      </div>
    </div>
  );
}
