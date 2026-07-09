import TeamMatchingStepLayout from "@/components/team-matching/TeamMatchingStepLayout";

export default function TeamMatchingCollaborationTypePage() {
  return (
    <TeamMatchingStepLayout
      actionHref="/team-matching/contest-field"
      actionLabel="다음"
      currentStep={2}
    >
      <h2 className="-mt-px font-[Roboto] text-[22px] font-bold leading-[135%] text-[#1F1F1F]">
        내 협업 유형을 확인해 주세요.
      </h2>
    </TeamMatchingStepLayout>
  );
}
