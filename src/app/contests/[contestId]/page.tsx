import Link from "next/link";
import { notFound } from "next/navigation";

import { ContestInfo } from "../_components/ContestInfo";
import { MOCK_CONTESTS } from "../_data/mockContests";

type ContestDetailPageProps = {
  params: Promise<{
    contestId: string;
  }>;
};

export default async function ContestDetailPage({ params }: ContestDetailPageProps) {
  const { contestId } = await params;
  const contestIndex = MOCK_CONTESTS.findIndex((item) => item.id === contestId);

  if (contestIndex < 0) {
    notFound();
  }

  const contest = MOCK_CONTESTS[contestIndex];
  const posterIndex = contestIndex + 1;

  return (
    <main className="flex h-full w-full flex-col bg-white text-color-gray-850">
      <header className="flex w-full max-w-[390px] shrink-0 items-center justify-between bg-white px-4 py-1">
        <Link
          href="/contests"
          aria-label="공모전 목록으로 돌아가기"
          className="flex size-8 items-center justify-center"
        >
          <span className="block h-2.5 w-2.5 rotate-45 border-b-2 border-l-2 border-color-gray-850" />
        </Link>
        <h1 className="flex h-[38px] items-center justify-center text-center text-[17px] leading-[135%] font-semibold text-color-gray-900">
          상세정보
        </h1>
        <div aria-hidden="true" className="size-8" />
      </header>

      <div className="scrollbar-hidden flex-1 overflow-y-auto">
        <ContestInfo contest={contest} posterIndex={posterIndex} />
      </div>
    </main>
  );
}
