import { SectionHeader } from "./SectionHeader";
import { CollaborationReviewList } from "./CollaborationReviewList";

export function CollaborationReviewSection() {
  return (
    <section className="flex w-full flex-col items-start gap-4">
      <SectionHeader title="팀원들에게 받은 협업 후기" />
      <CollaborationReviewList />
    </section>
  );
}
