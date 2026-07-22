import BottomNavigation from "@/components/layout/BottomNavigation";
import Image from "next/image";

import { ContestListSection } from "./_components/ContestListSection";
import { MOCK_CONTESTS } from "./_data/mockContests";

export default function ContestsPage() {
  return (
    <main className="flex h-full w-full flex-col bg-white text-color-gray-850">
      <header className="flex shrink-0 items-center justify-between self-stretch bg-white px-4 py-1">
        <button type="button" aria-label="뒤로가기" className="flex size-8 items-center justify-center">
          <span className="block h-2.5 w-2.5 rotate-45 border-b-2 border-l-2 border-color-gray-850" />
        </button>
        <h1 className="flex h-[38px] flex-col justify-center self-stretch text-center text-[17px] leading-[135%] font-semibold text-color-gray-900">
          공모전 정보
        </h1>
        <button type="button" aria-label="스크랩한 공모전" className="flex size-8 items-center justify-center">
          <Image
            src="/icons/contests/Button/_Asset/tabler_bookmark-filled.svg"
            alt=""
            width={24}
            height={24}
            className="size-6 shrink-0"
          />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto pb-8">
        <ContestListSection contests={MOCK_CONTESTS} />
      </div>

      <BottomNavigation unreadChatCount={9} />
    </main>
  );
}
