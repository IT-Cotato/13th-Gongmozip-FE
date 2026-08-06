"use client";

import { useRouter } from "next/navigation";
import { ContestScrapsContent } from "@/app/contests/scraps/_components/ContestScrapsContent";
import { ChevronLeftIcon } from "./_components/icons";

export default function ScrapPage() {
  const router = useRouter();

  return (
    <div className="flex h-full w-full flex-col bg-white">
      <div className="relative flex items-center justify-center px-4 py-1">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="뒤로가기"
          className="absolute left-4 flex h-6 w-6 items-center justify-center"
        >
          <ChevronLeftIcon />
        </button>
        <h1 className="text-[17px] leading-[1.35] font-semibold text-[#111111]">스크랩</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        <ContestScrapsContent />
      </div>
    </div>
  );
}
