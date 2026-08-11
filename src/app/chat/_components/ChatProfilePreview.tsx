"use client";

import Image from "next/image";

import { getCollaborationResultByCharacterType } from "@/app/collaboration-type/_data/collaborationTest";
import { usePublicProfileQuery, type PublicProfile } from "@/queries/usePublicProfileQuery";

import type { ChatMember } from "../_data/mockMessages";

type ChatProfilePreviewProps = {
  member: ChatMember;
  onClose: () => void;
};

const GENDER_LABEL: Record<string, string> = {
  MALE: "남성",
  FEMALE: "여성",
};

export function ChatProfilePreview({ member, onClose }: ChatProfilePreviewProps) {
  const profileId = member.profileId === undefined ? null : String(member.profileId);
  const profileQuery = usePublicProfileQuery(profileId);
  const profile = profileQuery.data;

  return (
    <div className="absolute inset-0 z-50 flex h-full w-full flex-col bg-white">
      <header className="flex h-[143px] shrink-0 items-start justify-between px-4 pt-[47px]">
        <button
          aria-label="닫기"
          className="flex size-12 items-center justify-center rounded-[16px] text-[32px] leading-none text-[#1f1f1f]"
          onClick={onClose}
          type="button"
        >
          ×
        </button>
        <button
          className="flex w-[75px] flex-col items-center justify-center gap-1 text-[9px] leading-[1.35] text-[#616161]"
          type="button"
        >
          <span className="relative flex size-12 items-center justify-center rounded-[16px] bg-[rgba(97,97,97,0.1)]">
            <span className="absolute top-[13px] left-[21px] size-2 rotate-45 bg-[#1f1f1f]" />
            <span className="absolute top-[25px] left-[13px] size-2 rounded-full bg-[#1f1f1f]" />
            <span className="absolute top-[25px] right-[13px] size-2 bg-[#1f1f1f]" />
          </span>
          <span>협업후기 작성</span>
        </button>
      </header>

      {profileQuery.isLoading ? (
        <p className="px-6 py-16 text-center text-[13px] leading-[1.5] text-[#949494]">
          프로필을 불러오는 중이에요.
        </p>
      ) : null}

      {profileQuery.isError || !profileId ? (
        <div className="flex flex-col items-center gap-3 px-6 py-16">
          <p className="text-center text-[13px] leading-[1.5] text-[#949494]">
            프로필 정보를 불러오지 못했어요.
          </p>
          {profileId ? (
            <button
              className="rounded-full bg-[#f5f5f5] px-4 py-2 text-[13px] font-medium text-[#1f1f1f]"
              onClick={() => profileQuery.refetch()}
              type="button"
            >
              다시 시도
            </button>
          ) : null}
        </div>
      ) : null}

      {profile ? <ProfileBody member={member} profile={profile} /> : null}
    </div>
  );
}

function ProfileBody({ member, profile }: { member: ChatMember; profile: PublicProfile }) {
  const character = profile.character
    ? getCollaborationResultByCharacterType(profile.character.characterType)
    : undefined;
  const profileImageSrc = member.avatarSrc ?? character?.imageSrc;
  const schoolTitle = profile.schoolRegion || profile.schoolName;
  const age = profile.age ?? calculateAge(profile.birthDate);
  const birthYear = profile.birthYear ?? getBirthYear(profile.birthDate);
  const genderText = profile.gender ? (GENDER_LABEL[profile.gender] ?? profile.gender) : null;
  const hasPersonalInfo = Boolean(genderText || age !== null || birthYear !== null);

  return (
    <div className="flex-1 overflow-y-auto pb-10">
      <section className="flex h-[78px] items-center gap-4 px-6">
        <div className="relative flex size-[73px] shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-[#ebf7fe]">
          {profileImageSrc ? (
            <Image src={profileImageSrc} alt="" fill sizes="73px" className="object-cover" />
          ) : (
            <span className="text-[22px] font-semibold text-[#616161]">
              {profile.nickname.slice(0, 1)}
            </span>
          )}
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="truncate text-[17px] leading-[1.35] font-medium text-[#1f1f1f]">
            {profile.nickname}
          </h1>
          {hasPersonalInfo ? (
            <div className="flex flex-wrap items-center gap-1 text-[13px] leading-[1.5] text-[#616161]">
              {genderText ? <span>{genderText}</span> : null}
              {genderText && age !== null ? <Dot /> : null}
              {age !== null ? <span>{age}세</span> : null}
              {(genderText || age !== null) && birthYear !== null ? (
                <span className="text-[rgba(97,97,97,0.6)]">/</span>
              ) : null}
              {birthYear !== null ? <span>{birthYear}년생</span> : null}
            </div>
          ) : (
            <p className="text-[13px] leading-[1.5] text-[#616161]">
              {character?.name ?? "협업 유형 검사 전"}
            </p>
          )}
        </div>
      </section>

      <div className="mt-8 flex flex-col gap-8">
        <ProfileSection title="학적 정보">
          <BulletRow>
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-x-3 text-[17px] leading-[1.5] text-[#1f1f1f]">
                <span>{schoolTitle}</span>
                <span>{profile.grade}학년</span>
              </div>
              <div className="flex flex-wrap items-center gap-1 text-[13px] leading-[1.5] text-[#616161]">
                <span>{profile.major}</span>
                {profile.secondaryMajor ? (
                  <>
                    <Dot />
                    <span>{profile.secondaryMajor}</span>
                  </>
                ) : null}
              </div>
              {profile.gpa !== undefined && profile.gpa !== null ? (
                <div className="flex items-center gap-1 text-[13px] leading-[1.5] text-[#616161]">
                  <span>학점</span>
                  <span>
                    {profile.gpa} / {profile.gpaScale ?? "-"}
                  </span>
                </div>
              ) : null}
            </div>
          </BulletRow>
        </ProfileSection>

        <ProfileSection title="프로젝트 경험">
          {profile.projects.length > 0 ? (
            <div className="flex flex-col gap-4 px-5">
              {profile.projects.map((project) => (
                <article
                  className="flex w-full flex-col gap-2.5 rounded-2xl border border-[rgba(97,97,97,0.16)] p-4"
                  key={`${project.projectName}-${project.role}`}
                >
                  <span className="w-fit rounded-full bg-[#ebf7fe] px-2 py-1 text-[12px] leading-[1.35] font-semibold text-[#12384f]">
                    {project.role || "공모전 출품"}
                  </span>
                  <div className="flex flex-col gap-1">
                    <p className="px-1 text-[17px] leading-[1.35] font-medium text-[#1f1f1f]">
                      {project.projectName}
                    </p>
                    {project.aiSummary ? (
                      <div className="mt-1 rounded-xl bg-[#f5f5f5] px-2 py-4">
                        <p className="line-clamp-2 px-1 text-[13px] leading-[1.5] text-[#616161]">
                          {project.aiSummary}
                        </p>
                      </div>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="px-5">
              <EmptyCard />
            </div>
          )}
        </ProfileSection>

        <ProfileSection title="프로젝트 수상 내용">
          {profile.awards.length > 0 ? (
            <div className="flex flex-col gap-2">
              {profile.awards.map((award) => (
                <BulletRow key={`${award.awardName}-${award.organizationName}`} tone="brand">
                  <div className="flex flex-col gap-1">
                    <p className="text-[17px] leading-[1.5] text-[#1f1f1f]">{award.awardName}</p>
                    {award.organizationName ? (
                      <p className="text-[13px] leading-[1.5] text-[#616161]">
                        {award.organizationName}
                      </p>
                    ) : null}
                  </div>
                </BulletRow>
              ))}
            </div>
          ) : (
            <EmptyRow />
          )}
        </ProfileSection>

        <ProfileSection title="보유 자격증">
          {profile.certifications.length > 0 ? (
            <div className="flex flex-col gap-2 px-5">
              {profile.certifications.map((certification) => (
                <article
                  className="flex w-full flex-col gap-2.5 rounded-2xl border border-[rgba(97,97,97,0.16)] p-4"
                  key={certification.certificateName}
                >
                  <span className="w-fit rounded-full bg-[#616161] px-2 py-1 text-[12px] leading-[1.35] font-semibold text-white">
                    자격증
                  </span>
                  <p className="px-1 text-[17px] leading-[1.35] font-medium text-[#1f1f1f]">
                    {certification.certificateName}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <div className="px-5">
              <EmptyCard />
            </div>
          )}
        </ProfileSection>
      </div>
    </div>
  );
}

function ProfileSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="px-6 text-[17px] leading-[1.35] font-semibold text-[#1f1f1f]">{title}</h2>
      {children}
    </section>
  );
}

function BulletRow({
  children,
  tone = "normal",
}: {
  children: React.ReactNode;
  tone?: "normal" | "brand";
}) {
  return (
    <div className="flex gap-[31px] px-7">
      <div className="flex shrink-0 items-start py-2">
        <span
          className={`mt-2 size-[5px] rounded-full ${
            tone === "brand" ? "bg-[#ac4a35]" : "bg-[#1f1f1f]"
          }`}
        />
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function Dot() {
  return <span className="size-0.5 rounded-full bg-[#616161]" />;
}

function EmptyCard() {
  return (
    <div className="flex w-full flex-col items-start gap-2.5 rounded-2xl border border-[rgba(97,97,97,0.16)] p-4">
      <p className="px-1 text-[17px] leading-[1.35] font-medium text-[#949494]">
        등록된 내용이 없어요.
      </p>
    </div>
  );
}

function EmptyRow() {
  return (
    <BulletRow tone="brand">
      <p className="text-[17px] leading-[1.5] text-[#949494]">등록된 내용이 없어요.</p>
    </BulletRow>
  );
}

function calculateAge(birthDate: string | null | undefined) {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());

  if (!hasHadBirthdayThisYear) age -= 1;

  return age;
}

function getBirthYear(birthDate: string | null | undefined) {
  if (!birthDate) return null;
  const birth = new Date(birthDate);

  return Number.isNaN(birth.getTime()) ? null : birth.getFullYear();
}
