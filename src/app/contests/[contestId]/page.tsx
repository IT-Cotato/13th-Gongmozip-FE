import Image from "next/image";
import Link from "next/link";

import { ContestInfo } from "../_components/ContestInfo";
import { SendCandidateSheet } from "../_components/SendCandidateSheet";
import { ShareContestModal } from "../_components/ShareContestModal";
import { ScrapContestModal } from "../_components/ScrapContestModal";
import { MOCK_CONTESTS } from "../_data/mockContests";

type ContestDetailPageProps = {
  params: Promise<{
    contestId: string;
  }>;
};

export default async function ContestDetailPage({ params }: ContestDetailPageProps) {
  const { contestId } = await params;
  const contestIndex = MOCK_CONTESTS.findIndex((item) => item.id === contestId);
  const contest = contestIndex >= 0 ? MOCK_CONTESTS[contestIndex] : MOCK_CONTESTS[0];
  const posterIndex = contestIndex >= 0 ? contestIndex + 1 : 1;

  return (
    <main className="flex h-full w-full flex-col bg-white text-color-gray-850">
      <header className="flex w-full max-w-[390px] shrink-0 items-center justify-between bg-white px-4 py-1">
        <Link
          href="/contests"
          aria-label="공모전 목록으로 돌아가기"
          className="flex size-8 items-center justify-center"
        >
          <Image src="/icons/contests/left.svg" alt="" width={20} height={20} className="size-5 shrink-0" />
        </Link>
        <h1 className="flex h-[38px] items-center justify-center text-center text-[17px] leading-[135%] font-semibold text-color-gray-900">
          상세정보
        </h1>
        <div aria-hidden="true" className="size-8" />
      </header>

      <div className="flex-1 overflow-y-auto">
        <ContestInfo contest={contest} posterIndex={posterIndex} />
      </div>

      <ShareContestModal />
      <ScrapContestModal />
      <SendCandidateSheet />
    </main>
  );
}
