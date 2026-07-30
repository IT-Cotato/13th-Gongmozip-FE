"use client";

import { useParams } from "next/navigation";

import { LeaderElectionFlow } from "../_components/LeaderElectionFlow";

export default function ChatRoomPage() {
  const params = useParams<{ roomId: string }>();

  return <LeaderElectionFlow roomId={params.roomId} />;
}
