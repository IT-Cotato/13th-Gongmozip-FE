import Image from "next/image";
import Link from "next/link";

const FILTERS = ["전체", "기타", "매칭", "채팅방"] as const;

function AlarmHeader() {
  return (
    <header className="shrink-0 bg-white">
      <div className="relative flex h-[46px] items-center justify-center border-b border-color-gray-650/8 px-4 py-1">
        <Link
          href="/"
          aria-label="뒤로가기"
          className="absolute left-4 flex size-[38px] items-center justify-center rounded-[14px]"
        >
          <Image
            src="/icons/alarm/chevron-left.svg"
            alt=""
            width={7}
            height={12}
            className="h-[11.667px] w-[6.667px]"
          />
        </Link>
        <h1 className="flex h-[38px] items-center justify-center text-[17px] leading-[1.35] font-semibold text-color-gray-900">
          알림
        </h1>
      </div>
    </header>
  );
}

function FilterSection() {
  return (
    <section className="flex h-16 shrink-0 items-center justify-center bg-white px-5 py-4">
      <div className="flex min-w-0 flex-1 items-start gap-1">
        {FILTERS.map((filter, index) => {
          const isActive = index === 0;

          return (
            <button
              key={filter}
              type="button"
              className={`flex h-8 items-center justify-center rounded-full px-2.5 py-2 text-[15px] leading-[1.25] font-semibold ${
                isActive
                  ? "bg-color-gray-850 text-white"
                  : "bg-color-gray-650/10 text-color-gray-650"
              }`}
            >
              {filter}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default function AlarmPage() {
  return (
    <main className="flex h-full w-full flex-col overflow-hidden bg-white text-color-gray-850">
      <AlarmHeader />
      <FilterSection />

      <section
        aria-label="알림 목록"
        className="min-h-0 flex-1 border-t border-color-gray-650/8 bg-white"
      />
    </main>
  );
}
