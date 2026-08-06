import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/http";
import { MEMBER_PROFILE_QUERY_KEY, type MemberProfile } from "./useMemberProfileQuery";

export type UpdateMarketingConsentRequest = {
  marketingConsentEmail: boolean;
  marketingConsentSms: boolean;
};

function updateMarketingConsent(payload: UpdateMarketingConsentRequest) {
  return apiFetch<void>("/api/members/me/marketing-consents", {
    method: "PATCH",
    body: payload,
  });
}

export function useUpdateMarketingConsentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMarketingConsent,
    onSuccess: (_data, payload) => {
      queryClient.setQueryData<MemberProfile>(MEMBER_PROFILE_QUERY_KEY, (current) =>
        current ? { ...current, ...payload } : current,
      );
    },
  });
}
