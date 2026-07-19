"use client";

import { useRouter } from "next/navigation";
import { ChevronLeftIcon } from "./_components/icons";
import { OngoingProjectSection } from "./_components/OngoingProjectSection";
import { CompletedProjectSection } from "./_components/CompletedProjectSection";
import { CollaborationReviewSection } from "./_components/CollaborationReviewSection";

export default function ProjectsPage() {
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
        <h1 className="text-[17px] leading-[1.35] font-semibold text-[#111111]">프로젝트 관리</h1>
      </div>

      <div className="flex flex-1 flex-col items-start gap-8 overflow-y-auto pt-4 pb-8">
        <OngoingProjectSection />
        <CompletedProjectSection />
        <CollaborationReviewSection />
      </div>
    </div>
  );
}
