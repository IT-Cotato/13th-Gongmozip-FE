import Image from "next/image";
import Link from "next/link";

const navItems = [
  {
    label: "홈",
    href: "/",
    icon: "/icons/team-matching/_Asset/icon-5.svg",
  },
  {
    label: "공모전",
    href: "#",
    icon: "/icons/team-matching/_Asset/icon-3.svg",
  },
  {
    label: "팀원매칭",
    href: "/team-matching",
    icon: "/icons/team-matching/_Asset/icon-4.svg",
    active: true,
  },
  {
    label: "채팅방",
    href: "#",
    icon: "/icons/team-matching/_Asset/icon-2.svg",
    badge: "9",
  },
  {
    label: "마이페이지",
    href: "#",
    icon: "/icons/team-matching/_Asset/icon.svg",
  },
];

const countdownDigits = ["0", "1", "3", "0", "1", "0"];

function CountdownCard() {
  return (
    <section className="mx-auto mt-4 flex h-[143px] w-[358px] max-w-[calc(100%-32px)] flex-col items-center gap-2 rounded-2xl bg-[#F9F8F4] p-4 text-center">
      <div className="flex items-start justify-center gap-[10px] rounded-[10px] bg-[#1F1F1F] px-2 py-[5px] text-[14px] font-bold leading-none text-white">
        팀원 매칭 마감까지
      </div>

      <div className="flex h-[49px] items-center justify-center gap-1 self-stretch">
        {countdownDigits.map((digit, index) => (
          <div className="contents" key={`${digit}-${index}`}>
            <span className="flex h-[49px] w-[42px] flex-col items-center justify-center gap-[10px] rounded-[5px] bg-white px-3 py-1 text-[36px] font-bold leading-none text-[#2A2A2A] shadow-[0_5px_1px_0_rgba(0,0,0,0),0_3px_1px_0_rgba(0,0,0,0.01),0_2px_1px_0_rgba(0,0,0,0.05),0_1px_1px_0_rgba(0,0,0,0.09)]">
              {digit}
            </span>
            {index === 1 || index === 3 ? (
              <span className="text-[28px] font-bold leading-none text-[#DFDFDF]">
                :
              </span>
            ) : null}
          </div>
        ))}
      </div>

      <p className="h-5 self-stretch text-center font-[Roboto] text-[13px] font-normal not-italic leading-[150%] text-[rgba(97,97,97,0.60)]">
        매일 오후 4시 매칭 결과 발표
      </p>
    </section>
  );
}

function InfoCard({
  title,
  description,
  descriptionValue,
  tone,
}: {
  title: string;
  description: string;
  descriptionValue?: string;
  tone: "coral" | "gray";
}) {
  return (
    <Link
      className={`mx-auto flex w-[358px] max-w-[calc(100%-32px)] items-center justify-between rounded-2xl px-5 py-4 ${
        tone === "coral" ? "bg-[#FFF1EE]" : "bg-[#F5F5F5]"
      } ${tone === "coral" ? "h-[74px]" : "h-[89px]"}`}
      href="#"
    >
      <span className="text-left">
        <strong className="block text-left font-[Pretendard] text-[17px] font-medium not-italic leading-[135%] text-black">
          {title}
        </strong>
        <span className="mt-[3px] flex items-center gap-1 text-left font-[Pretendard] text-[13px] font-medium not-italic leading-[125%] text-[#949494]">
          <span className="whitespace-pre-line">{description}</span>
          {descriptionValue ? (
            <span className="font-[Roboto] text-[13px] font-semibold not-italic leading-[125%] text-[#616161]">
              {descriptionValue}
            </span>
          ) : null}
        </span>
      </span>

      <Image
        src="/icons/team-matching/Button/_Asset/icon-1.svg"
        alt=""
        width={20}
        height={20}
      />
    </Link>
  );
}

function BottomNavigation() {
  return (
    <nav className="absolute bottom-0 left-0 right-0 z-10 flex h-16 items-center justify-center self-stretch border-t border-[rgba(97,97,97,0.08)] bg-white py-1">
      <div className="grid w-full grid-cols-5">
        {navItems.map((item) => (
          <Link
            aria-current={item.active ? "page" : undefined}
            className="flex min-w-0 flex-col items-center justify-center gap-[2px]"
            href={item.href}
            key={item.label}
          >
            <span className="relative h-6 w-6">
              {item.active ? (
                <span
                  className="block h-6 w-6 bg-[#1F1F1F]"
                  style={{
                    WebkitMask: `url("${item.icon}") center / contain no-repeat`,
                    mask: `url("${item.icon}") center / contain no-repeat`,
                  }}
                />
              ) : (
                <Image src={item.icon} alt="" width={24} height={24} />
              )}

              {item.badge ? (
                <span className="absolute -right-[6px] -top-[5px] flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-[#FF7658] px-[3px] text-[9px] font-bold leading-none text-white">
                  {item.badge}
                </span>
              ) : null}
            </span>
            <span
              className={`whitespace-nowrap text-[12px] font-bold leading-[16px] ${
                item.active ? "text-[#1F1F1F]" : "text-[#949494]"
              }`}
            >
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

function FixedApplyButton() {
  return (
    <Link
      className="absolute bottom-20 left-1/2 z-10 flex h-12 w-[358px] max-w-[calc(100%-32px)] -translate-x-1/2 items-center justify-center self-stretch rounded-[14px] bg-[#FF7658] px-8 py-[9px] text-[18px] font-bold leading-none text-white"
      href="/team-matching/profile"
    >
      매칭 신청하기
    </Link>
  );
}

export default function TeamMatchingPage() {
  return (
    <main className="fixed left-1/2 top-0 h-[851px] max-h-dvh w-full max-w-[390px] -translate-x-1/2 overflow-hidden bg-white text-[#1F1F1F]">
      <div className="relative flex h-full flex-col overflow-hidden bg-white">
        <header className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between self-stretch bg-white px-4 py-1">
          <span className="h-6 w-6" aria-hidden="true" />
          <h1 className="flex h-[38px] flex-col justify-center self-stretch text-center font-[Roboto] text-[17px] font-semibold not-italic leading-[135%] text-[#111111]">
            팀원 매칭
          </h1>
          <span className="h-6 w-6" aria-hidden="true" />
        </header>

        <div className="flex-1 overflow-y-auto pb-[154px] pt-[46px]">
          <section className="pt-6 text-center">
            <div
              aria-label="팀원 매칭 캐릭터"
              className="mx-auto aspect-[357/139] h-[139px] w-[357px] max-w-[calc(100%-32px)]"
              role="img"
              style={{
                backgroundImage:
                  'url("/images/team-matching/teammatching.png")',
                backgroundPosition: "0px -110.006px",
                backgroundRepeat: "no-repeat",
                backgroundSize: "100% 257.669%",
              }}
            />

            <h2 className="mt-4 flex flex-col items-center gap-1 self-stretch text-center font-[Roboto] text-[22px] font-bold not-italic leading-[135%] text-[#1F1F1F]">
              <span className="flex h-[30px] items-center justify-center">
                지금{" "}
                <span className="mx-[4px] inline-flex h-[30px] items-center rounded-[6px] bg-[#EFEFEF] px-[5px]">
                  000
                </span>{" "}
                명이
              </span>
              <span className="flex h-[30px] items-center justify-center">
                함께할 팀을 찾고 있어요!
              </span>
            </h2>

            <div className="mt-2 flex items-center justify-center gap-2">
              <span className="flex items-center justify-center gap-[10px] rounded-full bg-[#F5F5F5] px-2 py-1 text-center font-[Pretendard] text-[13px] font-medium not-italic leading-[135%] text-[#616161]">
                # 개인별 협업 유형 분석
              </span>
              <span className="flex items-center justify-center gap-[10px] rounded-full bg-[#F5F5F5] px-2 py-1 text-center font-[Pretendard] text-[13px] font-medium not-italic leading-[135%] text-[#616161]">
                #개인 역량별 최적 조합
              </span>
            </div>
          </section>

          <CountdownCard />

          <div className="mt-6 h-[6px] w-[390px] max-w-full bg-[rgba(97,97,97,0.08)]" />

          <section className="mt-6 space-y-4">
            <InfoCard
              title="나의 매칭현황"
              description="매칭결과까지"
              descriptionValue="01:24:30"
              tone="coral"
            />
            <InfoCard
              title="AI 분석 매칭 안내"
              description={`공모집의 AI 기반 팀매칭은\n어떻게 이루어지는지 알아보세요.`}
              tone="gray"
            />
          </section>

        </div>

        <FixedApplyButton />
        <BottomNavigation />
      </div>
    </main>
  );
}
