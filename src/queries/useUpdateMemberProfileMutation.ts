import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/http";
import {
  MEMBER_PROFILE_QUERY_KEY,
  type MemberGender,
  type MemberProfile,
} from "./useMemberProfileQuery";

export type UpdateMemberProfileRequest = {
  name: string;
  gender: MemberGender;
  birthDate: string;
};

function updateMemberProfile(payload: UpdateMemberProfileRequest) {
  return apiFetch<MemberProfile>("/api/members/me", {
    method: "PATCH",
    body: payload,
  });
}

export function useUpdateMemberProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMemberProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(MEMBER_PROFILE_QUERY_KEY, data);
    },
  });
}
