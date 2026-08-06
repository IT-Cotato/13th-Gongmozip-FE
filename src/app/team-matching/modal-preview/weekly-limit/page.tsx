import TeamMatchingModalPreview from "@/components/team-matching/TeamMatchingModalPreview";

export default function WeeklyLimitModalPreviewPage() {
  return (
    <TeamMatchingModalPreview
      actions={[{ href: "/team-matching", label: "확인" }]}
      description="최근 2주간 협업거리가 많이 감소했어요."
      title="매칭 참여가 1주일간 제한됩니다."
    />
  );
}
