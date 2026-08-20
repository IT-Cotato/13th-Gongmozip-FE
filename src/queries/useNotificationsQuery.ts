import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { apiFetch } from "@/lib/http";

export type NotificationCategory = "OTHER" | "MATCHING" | "CHATROOM";

export type NotificationItem = {
  notificationId: number;
  category: NotificationCategory;
  body: string;
  relatedTeamId: number | null;
  isRead: boolean;
  createdAt: string;
};

export type NotificationsResponse = {
  notifications: NotificationItem[];
  hasNext: boolean;
};

type UnreadNotificationsResponse = {
  unreadExists: boolean;
};

export const notificationsQueryKey = (category?: NotificationCategory) =>
  ["notifications", "list", category ?? "ALL"] as const;
export const unreadNotificationsQueryKey = ["notifications", "unread-exists"] as const;

function fetchNotifications(category?: NotificationCategory, cursor?: number) {
  const searchParams = new URLSearchParams();

  if (category) {
    searchParams.set("category", category);
  }

  if (cursor !== undefined) {
    searchParams.set("cursor", String(cursor));
  }

  const queryString = searchParams.toString();

  return apiFetch<NotificationsResponse>(
    `/api/notifications${queryString ? `?${queryString}` : ""}`,
  );
}

function fetchUnreadNotifications() {
  return apiFetch<UnreadNotificationsResponse>("/api/notifications/unread-exists");
}

function readAllNotifications() {
  return apiFetch<void>("/api/notifications/read-all", { method: "PATCH" });
}

export function registerNotificationPushToken(token: string) {
  return apiFetch<void>("/api/notifications/push-tokens", {
    method: "POST",
    body: { token },
  });
}

export function deleteNotificationPushToken(token: string) {
  return apiFetch<void>("/api/notifications/push-tokens", {
    method: "DELETE",
    body: { token },
  });
}

export function useNotificationsQuery(
  category?: NotificationCategory,
  options: { enabled?: boolean; refetchInterval?: number | false } = {},
) {
  return useInfiniteQuery({
    queryKey: notificationsQueryKey(category),
    queryFn: ({ pageParam }) => fetchNotifications(category, pageParam),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasNext || lastPage.notifications.length === 0) {
        return undefined;
      }

      return lastPage.notifications[lastPage.notifications.length - 1].notificationId;
    },
    enabled: options.enabled ?? true,
    refetchInterval: options.refetchInterval,
  });
}

export function useUnreadNotificationsQuery(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: unreadNotificationsQueryKey,
    queryFn: fetchUnreadNotifications,
    enabled: options.enabled ?? true,
  });
}

export function useReadAllNotificationsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: readAllNotifications,
    onSuccess: () => {
      queryClient.setQueryData<UnreadNotificationsResponse>(unreadNotificationsQueryKey, {
        unreadExists: false,
      });
      void queryClient.invalidateQueries({ queryKey: unreadNotificationsQueryKey });
    },
  });
}
