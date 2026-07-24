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
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="234"
        height="265"
        viewBox="0 0 91 265"
        fill="none"
        className="absolute top-[92px] left-[-96px]"
      >
        <path
          opacity="0.2"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M-27.0321 0.20409C-2.54803 -1.68211 21.8483 9.71539 40.5089 25.718C58.006 40.722 63.6635 64.194 72.463 85.525C80.9273 106.044 91.3696 125.888 90.9899 148.089C90.5791 172.112 83.6754 195.68 70.239 215.575C55.7256 237.065 37.8938 262.164 12.1443 264.835C-13.8369 267.531 -30.654 236.378 -55.6048 228.631C-79.9693 221.066 -111.582 238.185 -130.15 220.654C-148.422 203.403 -142.025 172.727 -141.462 147.571C-140.976 125.818 -136.463 104.894 -127.12 85.254C-117.901 65.872 -104.555 49.518 -88.216 35.634C-69.8779 20.052 -51.0007 2.05059 -27.0321 0.20409Z"
          fill="#FF9179"
        />
      </svg>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="351"
        height="349"
        viewBox="0 0 244 349"
        fill="none"
        className="absolute top-[180px] right-[-210px]"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M190.902 0.302292C238.712 -4.09671 275.424 40.3803 306.003 77.3613C333.176 110.222 347.167 149.809 349.709 192.358C352.453 238.3 353.89 290.128 320.614 321.953C287.669 353.464 235.818 352.154 190.902 344.245C153.526 337.664 129.748 306.741 100.06 283.119C63.4312 253.973 1.23317 239.127 0.0171716 192.358C-1.19683 145.644 62.2592 129.916 95.2162 96.7583C128.405 63.3653 143.999 4.61829 190.902 0.302292Z"
          fill="#FFF7EF"
        />
      </svg>

      <Image
        src="/icons/contests/Vector.svg"
        alt=""
        width={159}
        height={145}
        className="absolute top-[368px] left-[-102px] h-[144.209px] w-[158.537px]"
      />
    </div>
  );
}
