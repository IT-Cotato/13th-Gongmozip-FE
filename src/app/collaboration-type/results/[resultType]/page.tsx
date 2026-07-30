import Image from "next/image";
import { notFound } from "next/navigation";

import { COLLABORATION_RESULT_TYPES } from "../../_data/collaborationTest";

type CollaborationTypeResultPageProps = {
  params: Promise<{
    resultType: string;
  }>;
};

export function generateStaticParams() {
  return COLLABORATION_RESULT_TYPES.map((result) => ({
    resultType: result.id,
  }));
}

export default async function CollaborationTypeResultPage({
  params,
}: CollaborationTypeResultPageProps) {
  const { resultType } = await params;
  const result = COLLABORATION_RESULT_TYPES.find((item) => item.id === resultType);

  if (!result) {
    notFound();
  }

  return (
    <main className="relative flex h-full w-full flex-col overflow-hidden bg-white text-[#1F1F1F]">
      <header className="z-10 flex h-[46px] shrink-0 items-center justify-between bg-white px-4 py-1">
        <span className="h-6 w-6" aria-hidden="true" />
        <h1 className="text-center font-[Roboto] text-[17px] font-semibold leading-[135%] text-[#111111]">
          협업 유형 검사
        </h1>
        <button
          aria-label="협업 유형 검사 닫기"
          className="flex h-6 w-6 items-center justify-center"
          type="button"
        >
          <Image alt="" height={24} priority src="/icons/contests/x.svg" width={24} />
        </button>
      </header>

      <div className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto px-4 pb-7 pt-[38px]">
        <section
          className="mx-auto flex w-[318px] max-w-full flex-col items-center justify-center rounded-[12px] border-2 bg-white py-4"
          style={{ borderColor: result.themeColor }}
        >
          <h2
            className="flex h-[39px] self-stretch items-center justify-center text-center font-[Pretendard] text-[30px] font-bold leading-[135%]"
            style={{ color: result.titleColor }}
          >
            {result.name}
          </h2>

          <p
            className="mt-2 flex h-8 max-w-full items-center justify-center gap-2.5 rounded-[75px] px-[13px] py-2 text-center font-[Pretendard] text-[13px] font-semibold leading-[125%] whitespace-nowrap text-white"
            style={{ width: `${result.quoteBoxWidth}px`, backgroundColor: result.quoteBoxColor }}
          >
            {result.quote}
          </p>

          <Image
            alt={`${result.name} 캐릭터`}
            className="mt-[11px] h-[142px] w-[142px] object-contain"
            height={142}
            priority
            src={result.imageSrc}
            width={142}
          />

          <p
            className="mt-[3px] w-[286px] max-w-[calc(100%-24px)] text-center font-[Pretendard] text-[12px] font-semibold leading-[135%]"
            style={{ color: result.titleColor }}
          >
            {result.hashtags.join(" ")}
          </p>

          <div className="mt-[21px] w-[286px] max-w-[calc(100%-24px)] rounded-[8px] bg-[#F9F8F4] px-[13px] py-[13px]">
            <h3 className="font-[Pretendard] text-[12px] font-bold leading-[135%] text-[#1F1F1F]">
              당신의 협업스타일의 특징은?
            </h3>

            <div className="mt-[9px] flex flex-col gap-[8px]">
              {result.traits.map((trait) => (
                <div
                  className="grid grid-cols-[40px_1fr_40px] items-center gap-[8px]"
                  key={trait.left}
                >
                  <span
                    className="font-[Pretendard] text-[12px] font-semibold leading-[135%]"
                    style={{ color: result.titleColor }}
                  >
                    {trait.left}
                  </span>
                  <div className="h-[5px] rounded-[90px] bg-[#E8E8E8]">
                    <div
                      className="h-full rounded-[90px]"
                      style={{
                        width: `${trait.percentage}%`,
                        backgroundColor: result.themeColor,
                      }}
                    />
                  </div>
                  <span className="text-right font-[Pretendard] text-[12px] font-semibold leading-[135%] text-[#C8C8C8]">
                    {trait.right}
                  </span>
                </div>
              ))}
            </div>

            <ul className="mt-[9px] flex flex-col gap-[3px] font-[Pretendard] text-[12px] font-normal leading-[150%] text-[#616161]">
              {result.descriptions.map((description) => (
                <li key={description}>· {description}</li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <div className="shrink-0 bg-white px-4 pb-3 pt-2">
        <button
          className="flex h-[51px] w-full items-center justify-center rounded-[14px] bg-[#EFEFEF] px-8 py-[9px] font-[Roboto] text-[15px] font-bold leading-none text-[#616161]"
          type="button"
        >
          나가기
        </button>
        <button
          className="mt-[10px] flex h-[51px] w-full items-center justify-center rounded-[14px] bg-[#FF7658] px-8 py-[9px] font-[Roboto] text-[15px] font-bold leading-none text-white"
          type="button"
        >
          저장하기
        </button>
      </div>
    </main>
  );
}
