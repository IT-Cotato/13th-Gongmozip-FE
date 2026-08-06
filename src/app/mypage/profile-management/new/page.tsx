"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import TeamMatchingProgress from "@/components/team-matching/TeamMatchingProgress";
import { EditIcon } from "../../_components/icons";
import { CheckCircleIcon, CloseIcon } from "../_components/icons";
import { ExitProfileWriteModal } from "../_components/ExitProfileWriteModal";
import { useProfileDraftStore } from "@/stores/profileDraftStore";
import { useProfileDefaultInfoStore } from "@/stores/profileDefaultInfoStore";
import { useMemberProfileQuery } from "@/queries/useMemberProfileQuery";
import { useUpdateProfileImageMutation } from "@/queries/useUpdateProfileImageMutation";

const INPUT_CLASS =
  "h-11 w-full rounded-xl bg-[rgba(97,97,97,0.1)] px-5 py-3 text-[13px] leading-[1.5] text-[#1F1F1F] outline-none placeholder:text-[#949494]";

const GPA_FORMAT_REGEX = /^\d+(\.\d{1,2})?$/;

function FieldLabel({
  label,
  htmlFor,
  required,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="flex items-center px-1 text-[17px] leading-[1.25] font-medium text-[#1f1f1f]"
    >
      {label}
      {required && <span className="text-[#FF7658]">*</span>}
    </label>
  );
}

export default function CreateProfilePage() {
  const router = useRouter();
  const draftBasicInfo = useProfileDraftStore((state) => state.basicInfo);
  const setDraftBasicInfo = useProfileDraftStore((state) => state.setBasicInfo);
  const editingProfileId = useProfileDraftStore((state) => state.editingProfileId);
  const defaultBasicInfo = useProfileDefaultInfoStore((state) => state.defaultBasicInfo);
  const setDefaultBasicInfo = useProfileDefaultInfoStore((state) => state.setDefaultBasicInfo);
  const clearDefaultBasicInfo = useProfileDefaultInfoStore((state) => state.clearDefaultBasicInfo);

  const [nickname, setNickname] = useState(draftBasicInfo.nickname);
  const [school, setSchool] = useState(draftBasicInfo.school);
  const [grade, setGrade] = useState(draftBasicInfo.grade);
  const [major, setMajor] = useState(draftBasicInfo.major);
  const [doubleMajor, setDoubleMajor] = useState(draftBasicInfo.doubleMajor);
  const [minor, setMinor] = useState(draftBasicInfo.minor);
  const [gpa, setGpa] = useState(draftBasicInfo.gpa);
  const [gpaScale, setGpaScale] = useState(draftBasicInfo.gpaScale);
  const [saveAsDefault, setSaveAsDefault] = useState(true);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  const memberProfileQuery = useMemberProfileQuery();
  const updateProfileImageMutation = useUpdateProfileImageMutation();
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const displayedImageUrl = previewImageUrl ?? memberProfileQuery.data?.profileImageUrl ?? null;

  function handlePhotoButtonClick() {
    photoInputRef.current?.click();
  }

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPreviewImageUrl(objectUrl);

    updateProfileImageMutation.mutate(file, {
      onError: () => setPreviewImageUrl(null),
    });
  }

  // 새 프로필을 처음 작성하는 시점(수정 아님 + 아직 아무것도 안 입력함)에만
  // 저장된 기본값을 불러온다. persist 스토어의 localStorage 복원이 마운트 이후
  // 비동기로 끝나기 때문에, 값이 바뀔 때 렌더 중에 반영한다("Adjusting state
  // when a prop changes" 패턴 - useEffect로 하면 리렌더가 한 번 더 발생함).
  const [appliedDefaultBasicInfo, setAppliedDefaultBasicInfo] = useState(defaultBasicInfo);
  if (
    defaultBasicInfo !== appliedDefaultBasicInfo &&
    editingProfileId === null &&
    defaultBasicInfo &&
    !nickname &&
    !school &&
    !major
  ) {
    setAppliedDefaultBasicInfo(defaultBasicInfo);
    setNickname(defaultBasicInfo.nickname);
    setSchool(defaultBasicInfo.school);
    setGrade(defaultBasicInfo.grade);
    setMajor(defaultBasicInfo.major);
    setDoubleMajor(defaultBasicInfo.doubleMajor);
    setMinor(defaultBasicInfo.minor);
    setGpa(defaultBasicInfo.gpa);
    setGpaScale(defaultBasicInfo.gpaScale);
  }

  const isGpaValid =
    GPA_FORMAT_REGEX.test(gpa.trim()) &&
    GPA_FORMAT_REGEX.test(gpaScale.trim()) &&
    Number(gpa) <= Number(gpaScale);

  const isFormValid =
    nickname.trim().length > 0 && school.trim().length > 0 && major.trim().length > 0 && isGpaValid;

  function handleNext() {
    if (!isFormValid) return;
    const basicInfo = { nickname, school, grade, major, doubleMajor, minor, gpa, gpaScale };
    setDraftBasicInfo(basicInfo);

    if (saveAsDefault) {
      setDefaultBasicInfo(basicInfo);
    } else {
      clearDefaultBasicInfo();
    }

    router.push("/mypage/profile-management/new/experience");
  }

  return (
    <div className="flex h-full w-full flex-col bg-white">
      <div className="relative flex h-[46px] shrink-0 items-center justify-center px-4">
        <h1 className="text-[17px] leading-[1.35] font-semibold text-[#111827]">
          {editingProfileId !== null ? "프로필 수정" : "프로필 작성"}
        </h1>
        <button
          type="button"
          onClick={() => setIsExitModalOpen(true)}
          aria-label="닫기"
          className="absolute right-4 flex h-[38px] w-[38px] items-center justify-center rounded-[14px]"
        >
          <CloseIcon />
        </button>
      </div>

      <TeamMatchingProgress currentStep={1} totalSteps={3} />

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-9 pt-[22px] pb-10">
          <section className="flex flex-col gap-4">
            <h2 className="px-4 text-[22px] leading-[1.35] font-bold text-[#1f1f1f]">기본 정보</h2>
            <div className="flex items-center gap-4 px-6">
              <div className="relative shrink-0">
                {displayedImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={displayedImageUrl}
                    alt=""
                    className="size-[70px] rounded-full object-cover"
                  />
                ) : (
                  <div className="size-[70px] rounded-full bg-[#efefef]" />
                )}
                <button
                  type="button"
                  onClick={handlePhotoButtonClick}
                  disabled={updateProfileImageMutation.isPending}
                  aria-label="프로필 사진 변경"
                  className="absolute right-0 bottom-0 flex size-7 items-center justify-center rounded-full border border-[rgba(97,97,97,0.22)] bg-white disabled:opacity-50"
                >
                  <EditIcon />
                </button>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <FieldLabel label="닉네임" htmlFor="nickname" required />
                <input
                  id="nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="김철수"
                  className={INPUT_CLASS}
                />
              </div>
            </div>
            {updateProfileImageMutation.isError && (
              <p className="px-6 text-xs leading-[1.35] text-[#BB5260]">
                프로필 사진 업로드에 실패했어요. 다시 시도해주세요.
              </p>
            )}
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="px-4 text-[22px] leading-[1.35] font-bold text-[#1f1f1f]">학적 정보</h2>
            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-4 px-5">
                <div className="flex flex-1 flex-col gap-1">
                  <FieldLabel label="학교" htmlFor="school" required />
                  <input
                    id="school"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="학교명"
                    className={INPUT_CLASS}
                  />
                </div>
                <div className="flex w-20 flex-col gap-1">
                  <FieldLabel label="학년" htmlFor="grade" />
                  <input
                    id="grade"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="ex) 3"
                    inputMode="numeric"
                    className={INPUT_CLASS}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1 px-5">
                <FieldLabel label="전공" htmlFor="major" required />
                <input
                  id="major"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  placeholder="전공 및 학위"
                  className={INPUT_CLASS}
                />
              </div>

              <div className="flex flex-col gap-1 px-5">
                <FieldLabel label="복수전공" htmlFor="doubleMajor" />
                <input
                  id="doubleMajor"
                  value={doubleMajor}
                  onChange={(e) => setDoubleMajor(e.target.value)}
                  placeholder="전공 및 학위"
                  className={INPUT_CLASS}
                />
              </div>

              <div className="flex flex-col gap-1 px-5">
                <FieldLabel label="부전공" htmlFor="minor" />
                <input
                  id="minor"
                  value={minor}
                  onChange={(e) => setMinor(e.target.value)}
                  placeholder="전공 및 학위"
                  className={INPUT_CLASS}
                />
              </div>

              <div className="flex items-end gap-1 px-5">
                <div className="flex flex-1 flex-col gap-1">
                  <FieldLabel label="학점" htmlFor="gpa" required />
                  <input
                    id="gpa"
                    value={gpa}
                    onChange={(e) => setGpa(e.target.value)}
                    placeholder="ex) 3.5"
                    inputMode="decimal"
                    className={INPUT_CLASS}
                  />
                </div>
                <span className="pb-3 text-[15px] leading-[1.25] font-semibold text-[#949494]">
                  /
                </span>
                <div className="flex flex-1 flex-col gap-1">
                  <input
                    id="gpaScale"
                    value={gpaScale}
                    onChange={(e) => setGpaScale(e.target.value)}
                    placeholder="기준 학점"
                    aria-label="기준 학점"
                    inputMode="decimal"
                    className={INPUT_CLASS}
                  />
                </div>
              </div>
            </div>
          </section>

          <div className="flex items-center gap-1 px-4">
            <button
              type="button"
              onClick={() => setSaveAsDefault((prev) => !prev)}
              aria-pressed={saveAsDefault}
              className="flex items-center gap-1"
            >
              <span className="flex size-6 shrink-0 items-center justify-center">
                {saveAsDefault ? (
                  <CheckCircleIcon />
                ) : (
                  <span className="block size-6 rounded-full border-2 border-[#c8c8c8]" />
                )}
              </span>
              <span className="text-[13px] leading-[1.25] font-semibold text-[#616161]">
                기본값으로 저장
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 flex gap-2.5 bg-gradient-to-t from-white from-[38.462%] to-white/0 p-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="h-12 flex-1 rounded-[14px] border border-[rgba(97,97,97,0.5)] px-2.5 py-[9px] text-[17px] leading-[1.25] font-semibold text-[#616161]"
        >
          이전
        </button>
        <button
          type="button"
          disabled={!isFormValid}
          onClick={handleNext}
          className={`h-12 flex-1 rounded-[14px] px-2.5 py-[9px] text-[17px] leading-[1.25] font-semibold transition-colors ${
            isFormValid
              ? "bg-[#FF7658] text-white"
              : "cursor-not-allowed bg-[#EFEFEF] text-[#C8C8C8]"
          }`}
        >
          다음
        </button>
      </div>

      <ExitProfileWriteModal
        onExit={() => {
          const exitDestination =
            editingProfileId !== null ? `/mypage/profile-management/${editingProfileId}` : null;
          useProfileDraftStore.getState().resetProfileDraft();
          if (exitDestination) {
            router.push(exitDestination);
          } else {
            router.back();
          }
        }}
        onOpenChange={setIsExitModalOpen}
        open={isExitModalOpen}
      />
    </div>
  );
}
