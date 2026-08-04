"use client";

import { useParams } from "next/navigation";

import { MemberReviewFlow } from "../../_components/member-review";

export default function MemberReviewPreviewPage() {
  const params = useParams<{ roomId: string }>();

  return <MemberReviewFlow roomId={params.roomId} />;
}
