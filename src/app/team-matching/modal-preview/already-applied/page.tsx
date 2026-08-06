import TeamMatchingModalPreview from "@/components/team-matching/TeamMatchingModalPreview";

export default function AlreadyAppliedModalPreviewPage() {
  return (
    <TeamMatchingModalPreview
      actions={[{ href: "/team-matching", label: "확인" }]}
      description="매칭신청은 최대 하루에 한번 가능합니다."
      title="이미 매칭에 신청하셨어요."
    />
  );
}
