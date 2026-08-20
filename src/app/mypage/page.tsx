"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import BottomNavigation from "@/components/layout/BottomNavigation";
import { HeaderIconLink } from "@/components/layout/HeaderIconButton";
import { SettingsIcon } from "./_components/icons";
import { CharacterAvatar } from "./_components/CharacterAvatar";
import { OnboardingCoachmark } from "./_components/OnboardingCoachmark";
import { CollaborationTypeTestPromptModal } from "./_components/CollaborationTypeTestPromptModal";
import { LogoutConfirmModal } from "./_components/LogoutConfirmModal";
import { SurveyRetakeLimitModal } from "./_components/SurveyRetakeLimitModal";
import { useSurveyRetakeNavigation } from "./_hooks/useSurveyRetakeNavigation";
import { getCollaborationCharacterMeta } from "./_lib/collaborationCharacter";
import { useCollaborationDistanceQuery } from "@/queries/useCollaborationDistanceQuery";
import { useMypageSummaryQuery } from "@/queries/useMypageSummaryQuery";
import { useMemberProfileQuery, getSnsLoginHint } from "@/queries/useMemberProfileQuery";
import { useProfileListQuery } from "@/queries/useProfileListQuery";
import { useCharacterPalettesQuery } from "@/queries/useCharacterPalettesQuery";
import { useLogoutMutation } from "@/queries/useLogoutMutation";
import { useAuthStore } from "@/stores/useAuthStore";
import { ApiError } from "@/lib/http";

const COLLABORATIVE_DISTANCE_STEP = 100;

type MenuItem = {
  label: string;
  href?: string;
  disabled?: boolean;
  hint?: string;
  onClick?: () => void;
};
type MenuSection = { title?: string; items: MenuItem[] };

const MENU_SECTIONS: MenuSection[] = [
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
];

export default function MyPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const summaryQuery = useMypageSummaryQuery();
  const collaborationDistanceQuery = useCollaborationDistanceQuery({
    enabled: summaryQuery.isSuccess,
  });
  const profileQuery = useMemberProfileQuery();
  const profileListQuery = useProfileListQuery();
  const palettesQuery = useCharacterPalettesQuery();
  const logoutMutation = useLogoutMutation();
  const { data } = summaryQuery;
  const isLoading = summaryQuery.isLoading;
  const isError = summaryQuery.isError;
  const [isTestPromptOpen, setIsTestPromptOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isRetakeLimitOpen, setIsRetakeLimitOpen] = useState(false);
  const { handleSurveyRetakeClick, isCheckingSurveyStatus, surveyStatusError } =
    useSurveyRetakeNavigation({
      onRetakeLimited: () => setIsRetakeLimitOpen(true),
      returnTo: "/mypage",
    });
  const isUnauthorized =
    summaryQuery.error instanceof ApiError && summaryQuery.error.status === 401;

  useEffect(() => {
    if (isUnauthorized) {
      router.replace("/login");
    }
  }, [isUnauthorized, router]);

  const collaborationType = data?.character
    ? {
        characterKey: data.character.characterType,
        ...getCollaborationCharacterMeta(data.character.characterType),
      }
    : null;
  const characterPalette = palettesQuery.data?.palettes.find(
    (palette) => palette.paletteCode === data?.character?.paletteCode,
  );

  function handleCharacterManageClick() {
    if (collaborationType) {
      router.push("/mypage/character-management");
      return;
    }
    setIsTestPromptOpen(true);
  }

  function refetch() {
    summaryQuery.refetch();
    collaborationDistanceQuery.refetch();
    profileQuery.refetch();
    profileListQuery.refetch();
  }

  function handleConfirmLogout() {
    if (logoutMutation.isPending) return;

    logoutMutation.mutate(undefined, {
      onSettled: () => {
        // /mypage가 아직 마운트된 상태에서 캐시를 지우면 이 페이지의 쿼리들이
        // 즉시 재요청되고, 그 401 응답이 "인증 필요 시 /login으로 이동"
        // 로직을 같이 건드려서 라우팅이 충돌한다. 먼저 화면을 벗어난 뒤에
        // 토큰/캐시를 정리한다.
        router.replace("/login");
        useAuthStore.getState().clearAccessToken();
        queryClient.clear();
      },
    });
  }

  const isSocialLogin = Boolean(profileQuery.data?.snsLinked);
  // 프로필 조회가 아직 로딩/에러 상태일 때는 소셜로그인 여부를 알 수 없으므로,
  // 성공 응답을 받아 확실히 아닐 때만 비밀번호 변경 링크를 활성화한다.
  const canChangePassword = profileQuery.isSuccess && !isSocialLogin;
  const infoManagementSection: MenuSection = {
    title: "정보관리",
    items: [
      { label: "회원정보 수정", href: "/mypage/edit-profile" },
      canChangePassword
        ? { label: "비밀번호 변경", href: "/mypage/change-password" }
        : {
            label: "비밀번호 변경",
            disabled: true,
            hint: isSocialLogin ? getSnsLoginHint(profileQuery.data?.snsType ?? null) : undefined,
          },
    ],
  };
  const menuSections: MenuSection[] = [
    infoManagementSection,
    ...MENU_SECTIONS,
    { items: [{ label: "로그아웃", onClick: () => setIsLogoutConfirmOpen(true) }] },
  ];

  const isProfileListUnavailable = profileListQuery.isLoading || profileListQuery.isError;
  const collaborationDistance = collaborationDistanceQuery.data
    ? {
        current: collaborationDistanceQuery.data.collaborationPoint,
        max: collaborationDistanceQuery.data.maxCollaborationPoint,
        progress: normalizeProgressPercent(collaborationDistanceQuery.data.gaugePercent),
      }
    : (data?.collaborationDistance ?? { current: 0, max: 0, progress: 0 });

  const statsItems = data
    ? [
        {
          label: "프로필 관리",
          count: isProfileListUnavailable
            ? profileListQuery.isLoading
              ? "···"
              : "-"
            : (profileListQuery.data?.profileCount ?? 0),
          href: "/mypage/profile-management",
        },
        {
          label: "프로젝트 관리",
          count: data.ongoingProjectCount + data.completedProjectCount,
          href: "/mypage/projects",
        },
        { label: "스크랩", count: data.scrapContestCount, href: "/mypage/scrap" },
      ]
    : [];

  return (
    <div className="flex h-full w-full flex-col bg-white">
      <div className="flex-1 overflow-y-auto">
        <header className="relative flex h-[46px] shrink-0 items-center justify-center px-4">
          <h1 className="text-[17px] leading-[1.35] font-semibold text-[#111111]">마이페이지</h1>
          <HeaderIconLink href="/mypage/settings" aria-label="설정" className="absolute right-4">
            <SettingsIcon />
          </HeaderIconLink>
        </header>

        {isLoading && (
          <p className="px-4 py-16 text-center text-[13px] text-[#949494]">
            마이페이지를 불러오는 중이에요...
          </p>
        )}

        {isUnauthorized && !isLoading && (
          <p className="px-4 py-16 text-center text-[13px] text-[#949494]">
            로그인이 필요해요. 로그인 페이지로 이동할게요...
          </p>
        )}

        {isError && !isLoading && !isUnauthorized && (
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
                <CharacterAvatar
                  imageSrc={collaborationType?.imageSrc ?? null}
                  label={collaborationType?.label}
                  palette={characterPalette}
                  onEditClick={handleCharacterManageClick}
                />
                <div className="flex flex-1 flex-col items-start gap-2">
                  <div className="flex w-full items-center justify-between">
                    <span
                      className="rounded-full px-2 py-1 text-xs font-semibold text-white"
                      style={{ backgroundColor: collaborationType?.badgeColor ?? "#C8C8C8" }}
                    >
                      {collaborationType?.label ?? "검사 전"}
                    </span>
                    <button
                      type="button"
                      onClick={handleSurveyRetakeClick}
                      disabled={isCheckingSurveyStatus}
                      className="flex items-center text-[13px] font-semibold text-[#616161] underline disabled:opacity-60"
                    >
                      {isCheckingSurveyStatus ? "확인 중" : "협업 유형 검사"}
                      <img src="/icons/common/tabler_chevron-right.svg" alt="" className="size-5" />
                    </button>
                  </div>
                  {surveyStatusError && (
                    <p role="alert" className="text-xs leading-[1.35] text-[#BB5260]">
                      {surveyStatusError}
                    </p>
                  )}
                  <p className="text-[22px] leading-[1.35] font-bold text-[#1F1F1F]">
                    {profileQuery.data?.name ? `${profileQuery.data.name}님,` : "반가워요,"}
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
                  <CollaborativeDistance
                    current={collaborationDistance.current}
                    max={collaborationDistance.max}
                    progress={collaborationDistance.progress}
                  />
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
                {menuSections.map((section) => (
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
      {data && profileQuery.data?.email && (
        <OnboardingCoachmark accountKey={profileQuery.data.email} />
      )}
      {isTestPromptOpen && (
        <CollaborationTypeTestPromptModal
          onClose={() => setIsTestPromptOpen(false)}
          onStartTest={() => {
            setIsTestPromptOpen(false);
            void handleSurveyRetakeClick();
          }}
        />
      )}
      {isLogoutConfirmOpen && (
        <LogoutConfirmModal
          onCancel={() => setIsLogoutConfirmOpen(false)}
          onConfirm={handleConfirmLogout}
          isLoggingOut={logoutMutation.isPending}
        />
      )}
      {isRetakeLimitOpen && <SurveyRetakeLimitModal onClose={() => setIsRetakeLimitOpen(false)} />}
    </div>
  );
}

function MenuRow({ label, href, disabled, hint, onClick }: MenuItem) {
  const className = "w-full text-left text-[15px] leading-[1.25] font-medium text-[#1F1F1F]";

  if (href) {
    return (
      <Link href={href} className={className}>
        {label}
      </Link>
    );
  }

  if (disabled) {
    return (
      <div className="flex w-full flex-col gap-1">
        <button
          type="button"
          disabled
          aria-disabled="true"
          className={`${className} cursor-not-allowed text-[#C8C8C8]`}
        >
          {label}
        </button>
        <p className={`text-xs ${hint ? "text-[#ac4a35]" : "text-[#949494]"}`}>
          {hint ?? "준비 중인 기능이에요."}
        </p>
      </div>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {label}
    </button>
  );
}

function CollaborativeDistance({
  current,
  max,
  progress,
}: {
  current: number;
  max: number;
  progress: number;
}) {
  const stepCount = Math.floor(max / COLLABORATIVE_DISTANCE_STEP);
  const milestones = Array.from(
    { length: stepCount + 1 },
    (_, index) => index * COLLABORATIVE_DISTANCE_STEP,
  );
  if (milestones[milestones.length - 1] !== max) {
    milestones.push(max);
  }
  const calculatedProgress = max > 0 ? (current / max) * 100 : normalizeProgressPercent(progress);
  const filledPercent = Math.min(100, Math.max(0, calculatedProgress));

  return (
    <div className="flex w-full flex-col items-center gap-1">
      <div className="relative flex h-[10px] w-full items-center justify-between rounded-full border border-white bg-white px-[2px]">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 ease-out"
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

function normalizeProgressPercent(progress: number) {
  return progress > 0 && progress <= 1 ? progress * 100 : progress;
}
