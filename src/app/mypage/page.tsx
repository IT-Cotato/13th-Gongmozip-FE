"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomNavigation from "@/components/layout/BottomNavigation";
import { AvatarPlaceholderIcon, EditIcon, SettingsIcon } from "./_components/icons";
import { OnboardingCoachmark } from "./_components/OnboardingCoachmark";
import { CollaborationTypeTestPromptModal } from "./_components/CollaborationTypeTestPromptModal";
import { COLLABORATION_CHARACTER_IMAGE } from "./_lib/collaborationCharacter";
import { useMypageSummaryQuery } from "@/queries/useMypageSummaryQuery";

const COLLABORATIVE_DISTANCE_MAX = 500;
const COLLABORATIVE_DISTANCE_STEP = 100;

type MenuItem = { label: string; href?: string };
type MenuSection = { title?: string; items: MenuItem[] };

const MENU_SECTIONS: MenuSection[] = [
  {
    title: "정보관리",
    items: [
      { label: "회원정보 수정", href: "/mypage/edit-profile" },
      { label: "비밀번호 변경", href: "/mypage/change-password" },
    ],
  },
  {
    title: "고객지원",
    items: [{ label: "문의하기", href: "/contact" }],
  },
  {
    title: "법적정보 및 기타",
    items: [
      { label: "공모집 서비스 이용약관", href: "/terms" },
      { label: "개인정보 처리방침", href: "/privacy" },
    ],
  },
  {
    items: [{ label: "로그아웃" }],
  },
];

export default function MyPage() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useMypageSummaryQuery();
  const [isTestPromptOpen, setIsTestPromptOpen] = useState(false);

  const collaborationType = data?.collaborationType ?? null;

  function handleCharacterManageClick() {
    if (collaborationType) {
      // TODO: 검사 완료 후 캐릭터 관리(재검사/변경 등) 동작 구현 예정
      return;
    }
    setIsTestPromptOpen(true);
  }

  const statsItems = data
    ? [
        {
          label: "프로필 관리",
          count: data.stats.profileManagementCount,
          href: "/mypage/profile-management",
        },
        {
          label: "프로젝트 관리",
          count: data.stats.projectManagementCount,
          href: "/mypage/projects",
        },
        { label: "스크랩", count: data.stats.scrapCount, href: "/mypage/scrap" },
      ]
    : [];

  return (
    <div className="flex h-full w-full flex-col bg-white">
      <div className="flex-1 overflow-y-auto">
        <header className="relative flex items-center justify-center px-4 py-1">
          <h1 className="text-[17px] leading-[1.35] font-semibold text-[#111111]">마이페이지</h1>
          <Link
            href="/mypage/settings"
            aria-label="설정"
            className="absolute right-4 flex h-6 w-6 items-center justify-center text-[#1F1F1F]"
          >
            <SettingsIcon />
          </Link>
        </header>

        {isLoading && (
          <p className="px-4 py-16 text-center text-[13px] text-[#949494]">
            마이페이지를 불러오는 중이에요...
          </p>
        )}

        {isError && !isLoading && (
          <div className="flex flex-col items-center gap-3 px-4 py-16">
            <p className="text-[13px] text-[#949494]">마이페이지 정보를 불러오지 못했어요.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-full bg-[#F5F5F5] px-4 py-2 text-[13px] font-medium text-[#1F1F1F]"
            >
              다시 시도
            </button>
          </div>
        )}

        {data && (
          <>
            <section className="flex flex-col items-center">
              <div className="flex w-full items-start gap-4 px-6 py-4">
                <div className="relative size-[92px] shrink-0">
                  <div className="absolute inset-[3%_5%]">
                    <AvatarPlaceholderIcon />
                  </div>
                  {collaborationType && (
                    <div className="absolute inset-0 overflow-hidden rounded-full">
                      <img
                        src={COLLABORATION_CHARACTER_IMAGE[collaborationType.characterKey]}
                        alt={collaborationType.label}
                        className="absolute inset-[11.67%_11%_11.33%_11%] size-full object-contain"
                      />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleCharacterManageClick}
                    aria-label="캐릭터 관리"
                    className="absolute right-0 bottom-0 flex size-7 items-center justify-center rounded-full border-2 border-white bg-[#EFEFEF] text-black"
                  >
                    <EditIcon />
                  </button>
                </div>
                <div className="flex flex-1 flex-col items-start gap-2">
                  <span
                    className="rounded-full px-2 py-1 text-xs font-semibold text-white"
                    style={{ backgroundColor: collaborationType?.badgeColor ?? "#C8C8C8" }}
                  >
                    {collaborationType?.label ?? "검사 전"}
                  </span>
                  <p className="text-[22px] leading-[1.35] font-bold text-[#1F1F1F]">
                    {data.name}님,
                    <br />
                    안녕하세요!
                  </p>
                </div>
              </div>

              <div className="flex w-full flex-col items-start px-4">
                <div
                  data-coachmark="collab-distance"
                  className="flex w-full flex-col gap-2 rounded-2xl bg-[#F5F5F5] p-4"
                >
                  <p className="text-[13px] leading-[1.25] font-semibold text-[#616161]">
                    협업거리
                  </p>
                  <CollaborativeDistance currentMeters={data.collaborativeDistanceMeters} />
                </div>
              </div>
            </section>

            <div className="flex w-full items-center justify-center py-2">
              {statsItems.map((stat, index) => {
                const className =
                  "flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl py-1";
                const content = (
                  <>
                    <span className="text-[13px] text-[#AC4A35]">{stat.count}</span>
                    <span className="text-xs text-[#1F1F1F]">{stat.label}</span>
                  </>
                );

                return (
                  <Fragment key={stat.label}>
                    {index > 0 && <span className="h-5 w-px shrink-0 bg-[rgba(97,97,97,0.22)]" />}
                    {stat.href ? (
                      <Link
                        href={stat.href}
                        data-coachmark={index === 0 ? "profile-stat" : undefined}
                        className={className}
                      >
                        {content}
                      </Link>
                    ) : (
                      <div
                        data-coachmark={index === 0 ? "profile-stat" : undefined}
                        className={className}
                      >
                        {content}
                      </div>
                    )}
                  </Fragment>
                );
              })}
            </div>

            <div className="flex flex-col items-center">
              <div className="h-[6px] w-full bg-[rgba(97,97,97,0.08)]" />
              <div className="flex w-full flex-col items-start px-4">
                {MENU_SECTIONS.map((section) => (
                  <div
                    key={section.title ?? section.items[0].label}
                    className="flex w-full flex-col gap-4 border-b border-[rgba(97,97,97,0.16)] pt-6 pb-4"
                  >
                    {section.title && (
                      <p className="text-xs leading-[1.35] font-semibold text-[#949494]">
                        {section.title}
                      </p>
                    )}
                    <div className="flex w-full flex-col gap-4 px-2">
                      {section.items.map((item) => (
                        <MenuRow key={item.label} {...item} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <BottomNavigation />
      {data && <OnboardingCoachmark />}
      {isTestPromptOpen && (
        <CollaborationTypeTestPromptModal
          onClose={() => setIsTestPromptOpen(false)}
          onStartTest={() => router.push("/mypage/collaboration-type-test")}
        />
      )}
    </div>
  );
}

function MenuRow({ label, href }: MenuItem) {
  const className = "w-full text-left text-[15px] leading-[1.25] font-medium text-[#1F1F1F]";

  if (href) {
    return (
      <Link href={href} className={className}>
        {label}
      </Link>
    );
  }

  return (
    <button type="button" className={className}>
      {label}
    </button>
  );
}

function CollaborativeDistance({ currentMeters }: { currentMeters: number }) {
  const milestones = Array.from(
    { length: COLLABORATIVE_DISTANCE_MAX / COLLABORATIVE_DISTANCE_STEP + 1 },
    (_, index) => index * COLLABORATIVE_DISTANCE_STEP,
  );
  const filledPercent = Math.min(
    100,
    Math.max(0, (currentMeters / COLLABORATIVE_DISTANCE_MAX) * 100),
  );

  return (
    <div className="flex w-full flex-col items-center gap-1">
      <div className="relative flex h-[10px] w-full items-center justify-between rounded-full border border-white bg-white px-[2px]">
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${filledPercent}%`,
            backgroundImage: "linear-gradient(90deg, #ff7658, #ffad62)",
          }}
        />
        {milestones.map((meters) => (
          <span key={meters} className="relative z-10 size-1 shrink-0 rounded-full bg-white" />
        ))}
      </div>
      <div className="flex w-full items-center justify-between text-xs leading-[1.35] font-semibold text-[#C8C8C8]">
        {milestones.map((meters) => (
          <span key={meters}>{meters}m</span>
        ))}
      </div>
    </div>
  );
}
