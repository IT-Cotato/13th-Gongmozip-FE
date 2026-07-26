import Link from "next/link";

export default function ContestNotFound() {
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
          공모전 정보
        </h1>
        <div aria-hidden="true" className="size-8" />
      </header>

      <section className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <h2 className="text-xl leading-[135%] font-semibold text-color-gray-900">공모전을 찾을 수 없어요</h2>
        <p className="text-sm leading-[150%] text-color-gray-500">삭제되었거나 존재하지 않는 공모전입니다.</p>
        <Link
          href="/contests"
          className="mt-3 rounded-full bg-color-gray-900 px-5 py-3 text-sm font-semibold text-white"
        >
          목록으로 돌아가기
        </Link>
      </section>
    </main>
  );
}
