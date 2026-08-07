import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/http";
import { useAuthStore } from "@/stores/useAuthStore";
import { fetchProfileDetail } from "./useProfileDetailQuery";
import { profileListQueryKey, type ProfileListResponse } from "./useProfileListQuery";

// The backend rejects DELETE /api/profiles/{id} with 409 while the profile still
// has projects/awards/certifications attached, so those must be deleted first.
async function deleteProfile(profileId: string) {
  const encodedId = encodeURIComponent(profileId);
  const detail = await fetchProfileDetail(profileId);

  await Promise.all([
    ...detail.projects.map((project) =>
      apiFetch<void>(`/api/profiles/${encodedId}/projects/${project.projectId}`, {
        method: "DELETE",
      }),
    ),
    ...detail.awards.map((award) =>
      apiFetch<void>(`/api/profiles/${encodedId}/awards/${award.awardId}`, {
        method: "DELETE",
      }),
    ),
    ...detail.certifications.map((certification) =>
      apiFetch<void>(`/api/profiles/${encodedId}/certifications/${certification.certificationId}`, {
        method: "DELETE",
      }),
    ),
  ]);

  return apiFetch<void>(`/api/profiles/${encodedId}`, {
    method: "DELETE",
  });
}

export function useDeleteProfileMutation() {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);

  return useMutation({
    mutationFn: deleteProfile,
    onSuccess: (_data, profileId) => {
      queryClient.setQueryData<ProfileListResponse>(profileListQueryKey(accessToken), (current) =>
        current
          ? {
              profileCount: current.profileCount - 1,
              profiles: current.profiles.filter(
                (profile) => String(profile.profileId) !== profileId,
              ),
            }
          : current,
      );
    },
  });
}
