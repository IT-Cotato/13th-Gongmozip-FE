"use client";

import Image from "next/image";
import Link from "next/link";

import TeamMatchingStepLayout from "@/components/team-matching/TeamMatchingStepLayout";
import { useProfileListQuery, type ProfileListItem } from "@/queries/useProfileListQuery";
import { useUpdateProfileVisibilityMutation } from "@/queries/useUpdateProfileVisibilityMutation";
import { useTeamMatchingApplicationStore } from "@/stores/teamMatchingApplicationStore";

function formatProfileDate(updatedAt: string) {
  const date = new Date(updatedAt);

  if (Number.isNaN(date.getTime())) {
    return updatedAt;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
}

function ProfileVisibilityToggle({
  isPublic,
  onToggle,
}: {
  isPublic: boolean;
  onToggle: () => void;
}) {
  return (
    <span className="flex items-center gap-2">
      <span className="text-center font-[Pretendard] text-[13px] font-medium leading-[135%] text-[#616161]">
        프로필 공개 설정
      </span>
      <button
        aria-label={isPublic ? "프로필 공개" : "프로필 비공개"}
        className={`flex h-[20px] w-[32px] items-center gap-[10px] rounded-full p-0.5 ${
          isPublic ? "justify-end bg-[#FF7658]" : "justify-start bg-[#616161]"
        }`}
        onClick={onToggle}
        role="switch"
        aria-checked={isPublic}
        type="button"
      >
        <span className="flex h-4 w-4 aspect-square shrink-0 items-center justify-center gap-[10px] rounded-full bg-white">
          <Image
            alt=""
            height={12}
            src={isPublic ? "/icons/team-matching/icon-6.svg" : "/icons/team-matching/icon-7.svg"}
            width={12}
          />
        </span>
      </button>
    </span>
  );
}

function ProfileCard({
  isSelected,
  onSelect,
  profile,
}: {
  isSelected: boolean;
  onSelect: (profileId: number) => void;
  profile: ProfileListItem;
}) {
  const updateVisibilityMutation = useUpdateProfileVisibilityMutation();
  const id = String(profile.profileId);
  const inputId = `${id}-input`;
  const date = formatProfileDate(profile.updatedAt);
  const summary = [profile.schoolName, profile.major, `${profile.grade}학년`]
    .filter(Boolean)
    .join(" · ");

  return (
    <article
      aria-checked={isSelected}
      className={`overflow-hidden rounded-2xl border bg-white ${
        isSelected
          ? "border-[#FF7658] shadow-[0_16px_4px_0_rgba(0,0,0,0),0_10px_4px_0_rgba(0,0,0,0.01),0_6px_3px_0_rgba(0,0,0,0.05),0_3px_3px_0_rgba(0,0,0,0.09),0_1px_1px_0_rgba(0,0,0,0.10)]"
          : "border-[#E8E8E8]"
      }`}
      onClick={() => onSelect(profile.profileId)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(profile.profileId);
        }
      }}
      role="radio"
      tabIndex={0}
    >
      <div className="flex flex-col items-end gap-6 self-stretch p-5">
        <div className="flex w-full items-center justify-between gap-3">
          <label className="flex min-w-0 cursor-pointer items-center gap-1" htmlFor={inputId}>
            <input
              aria-label={`${date} 프로필 선택`}
              checked={isSelected}
              className="sr-only"
              id={inputId}
              name="team-matching-profile"
              onChange={() => onSelect(profile.profileId)}
              type="radio"
            />
            <span className="line-clamp-2 overflow-hidden text-ellipsis font-[Roboto] text-[13px] font-semibold leading-[125%] text-[#AC4A35]">
              {date}
            </span>
            <span className="line-clamp-2 overflow-hidden text-ellipsis font-[Pretendard] text-[13px] font-medium leading-[125%] text-[#616161]">
              수정
            </span>
          </label>
          <ProfileVisibilityToggle
            isPublic={profile.isPublic}
            onToggle={() =>
              updateVisibilityMutation.mutate({
                profileId: String(profile.profileId),
                isPublic: !profile.isPublic,
              })
            }
          />
        </div>

        <div className="w-full">
          <h2 className="flex min-w-0 items-center gap-1 font-[Roboto] text-[17px] font-semibold leading-[135%]">
            <span className="line-clamp-2 overflow-hidden text-ellipsis text-[#1F1F1F]">
              {profile.nickname}
            </span>
          </h2>
          <p className="line-clamp-1 mt-2 flex-1 overflow-hidden text-ellipsis pl-[6px] font-[Pretendard] text-[13px] font-medium leading-[125%] text-[#616161]">
            {summary || "프로필 정보"}
          </p>
        </div>
      </div>

      <button
        className="flex h-10 w-full items-center justify-center border-t border-[#EFEFEF] bg-white text-center font-[Pretendard] text-[13px] font-medium leading-[125%] text-[#616161]"
        type="button"
      >
        수정
      </button>
    </article>
  );
}

export default function TeamMatchingProfilePage() {
  const { data, isError, isLoading } = useProfileListQuery();
  const selectedProfileId = useTeamMatchingApplicationStore((state) => state.profileId);
  const setSelectedProfileId = useTeamMatchingApplicationStore((state) => state.setProfileId);
  const profiles = data?.profiles ?? [];

  return (
    <TeamMatchingStepLayout
      actionDisabled={isLoading || isError || selectedProfileId === null}
      actionHref="/team-matching/collaboration-type"
      actionLabel="다음"
      currentStep={1}
    >
      <section>
        <h2 className="font-[Roboto] text-[22px] font-bold leading-[135%] text-[#1F1F1F]">
          프로필 선택
        </h2>
        <p className="mt-4 self-stretch pl-2 font-[Pretendard] text-[17px] font-medium leading-[135%] text-[#1F1F1F]">
          팀원 매칭에 사용할 프로필을 선택해주세요.
        </p>
        <p className="mt-3 self-stretch whitespace-pre-line pl-2 font-[Roboto] text-[13px] font-normal leading-[150%] text-[#949494]">
          {"프로필 공개 설정을 켜놓으면,\n팀원이 내 프로필을 열람할 수 있어요."}
        </p>

        <Link
          href="/mypage/profile-management/new"
          className="mt-5 flex h-12 w-full appearance-none items-center justify-center gap-1 self-stretch rounded-xl border-0 bg-[rgba(97,97,97,0.10)] p-2 text-center font-[Roboto] text-[15px] font-semibold leading-[125%] text-[#616161]"
        >
          <Image alt="" height={24} src="/icons/team-matching/tabler_plus.svg" width={24} />
          프로필 추가
        </Link>
      </section>

      <section className="mt-5 space-y-5">
        {isLoading && (
          <p className="rounded-[8px] bg-[#F9F8F4] px-4 py-6 text-center font-[Pretendard] text-[13px] font-medium leading-[135%] text-[#616161]">
            프로필을 불러오고 있어요.
          </p>
        )}
        {isError && (
          <p className="rounded-[8px] bg-[#F9F8F4] px-4 py-6 text-center font-[Pretendard] text-[13px] font-medium leading-[135%] text-[#616161]">
            프로필을 불러오지 못했어요.
          </p>
        )}
        {!isLoading && !isError && profiles.length === 0 && (
          <p className="rounded-[8px] bg-[#F9F8F4] px-4 py-6 text-center font-[Pretendard] text-[13px] font-medium leading-[135%] text-[#616161]">
            매칭에 사용할 프로필이 없어요.
          </p>
        )}
        {profiles.map((profile) => (
          <ProfileCard
            key={profile.profileId}
            profile={profile}
            isSelected={selectedProfileId === profile.profileId}
            onSelect={setSelectedProfileId}
          />
        ))}
      </section>
    </TeamMatchingStepLayout>
  );
}
