import Image from "next/image";
import Link from "next/link";

import type { ContestSummary } from "../_types";

type ScrapListProps = {
  contests: ContestSummary[];
};

export function ScrapList({ contests }: ScrapListProps) {
  if (contests.length === 0) {
    return (
      <section aria-label="스크랩한 공모전" className="relative min-h-[560px] pt-4">
        <h2 className="h-[18px] w-[107px] text-[15px] leading-[125%] font-bold text-color-gray-850">
          스크랩한 공모전
        </h2>

        <div className="absolute top-[47px] left-1/2 flex w-full -translate-x-1/2 flex-col items-center text-center">
          <p className="text-[15px] leading-[125%] font-normal text-color-gray-900">
            아직 스크랩한 항목이 없어요.
          </p>
          <p className="mt-2 text-[12px] leading-[135%] font-normal text-color-gray-500">
            관심 있는 공모전을 스크랩하고 공유해보세요.
          </p>
          <Image
            src="/icons/contests/Button/_Asset/tabler_bookmark-filled.svg"
            alt=""
            width={48}
            height={48}
            className="mt-[14px] size-12 opacity-10 grayscale"
          />
        </div>
      </section>
    );
  }

  return (
    <section aria-label="스크랩한 공모전" className="relative pt-4">
      <h2 className="h-[18px] w-[107px] text-[15px] leading-[125%] font-bold text-color-gray-850">
        스크랩한 공모전
      </h2>
      <div className="mt-4 flex flex-col gap-3">
        {contests.map((contest) => (
          <Link
            key={contest.id}
            href={`/contests/${contest.id}`}
            className="block border-b border-color-gray-250 bg-white/80 py-3"
          >
            <h3 className="line-clamp-2 text-[17px] leading-[135%] font-bold text-color-gray-850">{contest.title}</h3>
            <p className="mt-1 truncate text-[13px] leading-[125%] font-medium text-color-gray-650">
              {contest.organizer}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
