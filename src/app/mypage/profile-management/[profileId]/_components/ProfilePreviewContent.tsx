"use client";

import { useRouter } from "next/navigation";
import { ChevronLeftIcon } from "../../_components/icons";
import { EditIcon } from "@/app/mypage/_components/icons";
import { useProfileDetailQuery } from "@/queries/useProfileDetailQuery";
import { useMemberProfileQuery } from "@/queries/useMemberProfileQuery";
import { useCharacterPalettesQuery } from "@/queries/useCharacterPalettesQuery";
import {
  getCollaborationCharacterMeta,
  getPaletteStyle,
} from "@/app/mypage/_lib/collaborationCharacter";
import { ApiError } from "@/lib/http";
import { useProfileDraftStore } from "@/stores/profileDraftStore";
import { buildProfileDraftFromDetail } from "../../_lib/profileDraft";
import { ProjectSummaryCard } from "./ProjectSummaryCard";

const GENDER_LABEL: Record<string, string> = {
  MALE: "남성",
  FEMALE: "여성",
};

function formatDate(isoDate: string) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

function EmptySectionCard() {
  return (
    <div className="flex w-full flex-col items-start gap-2.5 rounded-2xl border border-[rgba(97,97,97,0.16)] p-4">
      <p className="px-1 text-[17px] leading-[1.35] font-medium text-[#949494]">
        👟 첫 레이스 준비중...
      </p>
    </div>
  );
}

function EmptySectionRow() {
  return (
    <div className="flex gap-2 px-7">
      <div className="flex shrink-0 items-start py-2">
        <span className="mt-2 size-[5px] rounded-full bg-[#ac4a35] opacity-50" />
      </div>
      <p className="text-[17px] leading-[1.5] text-[#949494]">👟 첫 레이스 준비중...</p>
    </div>
  );
}

function calculateAge(birthDate: string) {
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

export function ProfilePreviewContent({ profileId }: { profileId: string }) {
  const router = useRouter();
  const profileQuery = useProfileDetailQuery(profileId);
  const memberQuery = useMemberProfileQuery();
  const palettesQuery = useCharacterPalettesQuery();
  const profile = profileQuery.data;
  const member = memberQuery.data;
  const characterMeta = profile?.character
    ? getCollaborationCharacterMeta(profile.character.characterType)
    : null;
  const characterPalette = palettesQuery.data?.palettes.find(
    (palette) => palette.paletteCode === profile?.character?.paletteCode,
  );
  const setBasicInfo = useProfileDraftStore((state) => state.setBasicInfo);
  const setProjects = useProfileDraftStore((state) => state.setProjects);
  const setCertificates = useProfileDraftStore((state) => state.setCertificates);
  const setEditingProfileId = useProfileDraftStore((state) => state.setEditingProfileId);
  const setEditingExistingProfile = useProfileDraftStore(
    (state) => state.setEditingExistingProfile,
  );

  function handleEdit() {
    if (!profile) return;
    const draft = buildProfileDraftFromDetail(profile);
    setBasicInfo(draft.basicInfo);
    setProjects(() => draft.projects);
    setCertificates(() => draft.certificates);
    setEditingProfileId(profile.profileId);
    setEditingExistingProfile(true);
    router.push("/mypage/profile-management/new");
  }

  const isLoading = profileQuery.isLoading;
  const isUnauthorized =
    profileQuery.error instanceof ApiError && profileQuery.error.status === 401;
  const isError = profileQuery.isError && !isUnauthorized;

  if (isUnauthorized) {
    router.replace("/login/email");
  }

  const age = member?.birthDate ? calculateAge(member.birthDate) : null;
  const birthYear = member?.birthDate ? new Date(member.birthDate).getFullYear() : null;

  return (
    <div className="flex h-full w-full flex-col bg-white">
      <div className="relative flex h-[46px] shrink-0 items-center justify-center px-4">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="뒤로가기"
          className="absolute left-4 flex h-6 w-6 items-center justify-center"
        >
          <ChevronLeftIcon />
        </button>
        <h1 className="text-[17px] leading-[1.35] font-semibold text-[#111827]">프로필 미리보기</h1>
        <button
          type="button"
          aria-label="프로필 수정"
          onClick={handleEdit}
          disabled={!profile}
          className="absolute right-4 flex h-6 w-6 items-center justify-center text-[#1f1f1f] disabled:opacity-50"
        >
          <EditIcon />
        </button>
      </div>

      {isLoading && (
        <p className="px-4 py-16 text-center text-[13px] text-[#949494]">
          프로필을 불러오는 중이에요...
        </p>
      )}

      {isError && (
        <div className="flex flex-col items-center gap-3 px-4 py-16">
          <p className="text-[13px] text-[#949494]">프로필 정보를 불러오지 못했어요.</p>
          <button
            type="button"
            onClick={() => profileQuery.refetch()}
            className="rounded-full bg-[#F5F5F5] px-4 py-2 text-[13px] font-medium text-[#1F1F1F]"
          >
            다시 시도
          </button>
        </div>
      )}

      {profile && (
        <div className="flex-1 overflow-y-auto pb-10">
          <p className="px-6 pt-2 text-[13px] leading-[1.25] font-medium text-[#616161]">
            <span className="font-semibold text-[#616161]">{formatDate(profile.updatedAt)}</span>{" "}
            수정
          </p>

          <div className="flex items-center gap-4 px-6 py-4">
            <div
              className="flex size-[70px] shrink-0 items-center justify-center overflow-hidden rounded-full"
              style={getPaletteStyle(characterPalette)}
            >
              {characterMeta?.imageSrc && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={characterMeta.imageSrc}
                  alt={characterMeta.label}
                  className="size-[85%] object-contain"
                />
              )}
            </div>
            <div className="flex flex-col items-start gap-2">
              <p className="text-[17px] leading-[1.35] font-medium text-black">
                {profile.nickname}
              </p>
              {member && (
                <div className="flex items-center gap-1 text-[13px] leading-[1.5] text-[#616161]">
                  <span>{GENDER_LABEL[member.gender] ?? member.gender}</span>
                  <span>·</span>
                  {age !== null && <span>{age}세</span>}
                  <span className="text-[rgba(97,97,97,0.6)]">/</span>
                  {birthYear !== null && <span>{birthYear}년생</span>}
                </div>
              )}
            </div>
          </div>

          <section className="flex flex-col gap-3 pt-4">
            <h2 className="px-6 text-[17px] leading-[1.35] font-semibold text-[#1f1f1f]">
              학적 정보
            </h2>
            <div className="flex gap-2 px-7">
              <div className="flex shrink-0 items-start py-2">
                <span className="mt-2 size-[5px] rounded-full bg-[#1f1f1f]" />
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3 text-[17px] leading-[1.5] text-[#1f1f1f]">
                  <span>{profile.schoolName}</span>
                  <span>{profile.grade}학년</span>
                </div>
                <div className="flex items-center gap-1 text-[13px] leading-[1.5] text-[#616161]">
                  <span>{profile.major}</span>
                  {profile.secondaryMajor && (
                    <>
                      <span className="size-[2px] rounded-full bg-[#616161]" />
                      <span>{profile.secondaryMajor}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1 text-[13px] leading-[1.5] text-[#616161]">
                  <span>학점</span>
                  <span>
                    {profile.gpa} / {profile.gpaScale}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-3 pt-8">
            <h2 className="px-6 text-[17px] leading-[1.35] font-semibold text-[#1f1f1f]">
              프로젝트 경험
            </h2>
            {profile.projects.length > 0 ? (
              <div className="flex flex-col gap-4 px-5">
                {profile.projects.map((project) => (
                  <ProjectSummaryCard
                    key={project.projectId}
                    profileId={profileId}
                    project={project}
                  />
                ))}
              </div>
            ) : (
              <div className="px-5">
                <EmptySectionCard />
              </div>
            )}
          </section>

          <section className="flex flex-col gap-3 pt-8">
            <h2 className="px-6 text-[17px] leading-[1.35] font-semibold text-[#1f1f1f]">
              프로젝트 수상 내용
            </h2>
            {profile.awards.length > 0 ? (
              <div className="flex flex-col gap-2">
                {profile.awards.map((award) => (
                  <div key={award.awardId} className="flex gap-2 px-7">
                    <div className="flex shrink-0 items-start py-2">
                      <span className="mt-2 size-[5px] rounded-full bg-[#ac4a35]" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-[17px] leading-[1.5] text-[#1f1f1f]">{award.awardName}</p>
                      <p className="text-[13px] leading-[1.5] text-[#616161]">
                        {[award.organizationName, award.awardRank].filter(Boolean).join(" ")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptySectionRow />
            )}
          </section>

          <section className="flex flex-col gap-3 pt-8">
            <h2 className="px-6 text-[17px] leading-[1.35] font-semibold text-[#1f1f1f]">
              보유 자격증
            </h2>
            {profile.certifications.length > 0 ? (
              <div className="flex flex-col items-center gap-2 px-5">
                {profile.certifications.map((certification) => (
                  <div
                    key={certification.certificationId}
                    className="flex w-full flex-col gap-2.5 rounded-2xl border border-[rgba(97,97,97,0.16)] p-4"
                  >
                    <span className="w-fit rounded-full bg-[#616161] px-2 py-1 text-xs font-semibold text-white">
                      {certification.categoryName}
                    </span>
                    <div className="flex flex-col gap-1 px-1">
                      <p className="text-[17px] leading-[1.35] font-medium text-[#1f1f1f]">
                        {certification.certificateName}
                      </p>
                      <div className="flex items-center gap-1 text-xs leading-[1.35] text-[#616161]">
                        <span>{new Date(certification.acquiredAt).getFullYear()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-5">
                <EmptySectionCard />
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
