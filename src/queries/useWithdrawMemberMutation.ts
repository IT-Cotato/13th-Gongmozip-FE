import { useMutation } from "@tanstack/react-query";

import { apiFetch } from "@/lib/http";

export type WithdrawMemberReason =
  | "MATCHING_DISSATISFIED"
  | "BAD_MANNER_USER"
  | "NO_LONGER_NEEDED"
  | "NEW_ACCOUNT"
  | "ETC";

export type WithdrawMemberRequest = {
  // 이메일 가입 회원만 검증 대상. SNS 간편가입 회원은 생략한다.
  password?: string;
  reason: WithdrawMemberReason;
  reasonDetail?: string;
};

function withdrawMember(payload: WithdrawMemberRequest) {
  return apiFetch<void>("/api/members/me", {
    method: "DELETE",
    body: payload,
  });
}

export function useWithdrawMemberMutation() {
  return useMutation({
    mutationFn: withdrawMember,
  });
}
