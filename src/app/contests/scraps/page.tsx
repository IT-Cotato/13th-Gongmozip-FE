import Image from "next/image";
import Link from "next/link";

import { ScrapList } from "../_components/ScrapList";

export default function ContestScrapsPage() {
  return (
    <main className="relative flex h-full w-full flex-col overflow-hidden bg-white text-color-gray-900">
      <DecorativeShapes />

      <header className="relative z-10 flex w-full max-w-[390px] shrink-0 items-center justify-between bg-white px-4 py-1">
        <Link href="/contests" aria-label="공모전 목록으로 돌아가기" className="flex size-8 items-center justify-center">
          <span className="block h-2.5 w-2.5 rotate-45 border-b-2 border-l-2 border-color-gray-850" />
        </Link>
        <h1 className="flex h-[38px] flex-col justify-center self-stretch text-center text-[17px] leading-[135%] font-semibold text-color-gray-900">
          스크랩
        </h1>
        <div aria-hidden="true" className="size-8" />
      </header>

      <div className="relative z-10 flex-1 overflow-y-auto px-4">
        <ScrapList contests={[]} />
      </div>
    </main>
  );
}

function DecorativeShapes() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <Image
        src="/icons/contests/Frame.svg"
        alt=""
        width={390}
        height={751}
        className="h-full w-full translate-y-[22px] object-cover"
        priority
      />
    </div>
  );
}
