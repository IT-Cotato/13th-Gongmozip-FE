"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import {
  registerGrantedNotificationToken,
  subscribeForegroundNotifications,
  type ForegroundNotification,
} from "@/lib/firebaseMessaging";
import {
  unreadNotificationsQueryKey,
  useNotificationsQuery,
} from "@/queries/useNotificationsQuery";
import { useAuthStore } from "@/stores/useAuthStore";
import { useHasAuthHydrated } from "@/stores/useHasAuthHydrated";

const NOTIFICATION_POLL_INTERVAL_MS = 15000;
const TOAST_DURATION_MS = 5000;

type ToastNotification = ForegroundNotification & {
  notificationId?: number;
};

export default function NotificationToast() {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const hasHydrated = useHasAuthHydrated();
  const accessToken = useAuthStore((state) => state.accessToken);
  const notificationsQuery = useNotificationsQuery(undefined, {
    enabled: hasHydrated && Boolean(accessToken),
    refetchInterval: NOTIFICATION_POLL_INTERVAL_MS,
  });
  const latestNotification = useMemo(() => {
    const notifications = notificationsQuery.data?.pages.flatMap((page) => page.notifications) ?? [];

    return notifications
      .filter((notification) => !notification.isRead)
      .toSorted((a, b) => b.notificationId - a.notificationId)[0];
  }, [notificationsQuery.data]);
  const lastSeenNotificationIdRef = useRef<number | null>(null);
  const lastShownNotificationKeyRef = useRef<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [toastNotification, setToastNotification] = useState<ToastNotification | null>(null);

  const showToast = useCallback((notification: ToastNotification) => {
    const notificationKey = getNotificationKey(notification);

    if (lastShownNotificationKeyRef.current === notificationKey) {
      return;
    }

    lastShownNotificationKeyRef.current = notificationKey;
    setToastNotification(notification);

    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = setTimeout(() => setToastNotification(null), TOAST_DURATION_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!hasHydrated || !accessToken) {
      return;
    }

    void registerGrantedNotificationToken();
  }, [hasHydrated, accessToken]);

  useEffect(() => {
    if (!hasHydrated || !accessToken) {
      return;
    }

    let unsubscribe: (() => void) | null = null;
    let isMounted = true;

    void subscribeForegroundNotifications((notification) => {
      if (!isMounted || shouldSuppressNotification(notification, pathname)) {
        return;
      }

      showToast(notification);
      void queryClient.invalidateQueries({ queryKey: unreadNotificationsQueryKey });
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }).then((nextUnsubscribe) => {
      unsubscribe = nextUnsubscribe;
    });

    return () => {
      isMounted = false;
      unsubscribe?.();
    };
  }, [accessToken, hasHydrated, pathname, queryClient, showToast]);

  useEffect(() => {
    if (!latestNotification) {
      return;
    }

    const lastSeenNotificationId = lastSeenNotificationIdRef.current;
    lastSeenNotificationIdRef.current = Math.max(
      lastSeenNotificationId ?? latestNotification.notificationId,
      latestNotification.notificationId,
    );

    if (
      lastSeenNotificationId === null ||
      latestNotification.notificationId <= lastSeenNotificationId
    ) {
      return;
    }

    showToast({
      body: latestNotification.body,
      category: latestNotification.category,
      createdAt: latestNotification.createdAt,
      notificationId: latestNotification.notificationId,
      relatedTeamId: latestNotification.relatedTeamId,
    });
    void queryClient.invalidateQueries({ queryKey: unreadNotificationsQueryKey });
  }, [latestNotification, queryClient, showToast]);

  if (!toastNotification) {
    return null;
  }

  const href = getNotificationHref(toastNotification);
  const content = <NotificationToastContent notification={toastNotification} />;

  if (href) {
    return (
      <Link
        href={href}
        className="fixed top-[93px] left-1/2 z-50 w-[calc(100%-40px)] max-w-[350px] -translate-x-1/2"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="fixed top-[93px] left-1/2 z-50 w-[calc(100%-40px)] max-w-[350px] -translate-x-1/2">
      {content}
    </div>
  );
}

function NotificationToastContent({ notification }: { notification: ToastNotification }) {
  return (
    <section
      role="status"
      aria-live="polite"
      className="flex w-full items-start gap-2 rounded-2xl bg-white/80 p-5 shadow-[0_53px_15px_0_rgba(0,0,0,0),0_34px_14px_0_rgba(0,0,0,0.01),0_19px_12px_0_rgba(0,0,0,0.05),0_9px_9px_0_rgba(0,0,0,0.09),0_2px_5px_0_rgba(0,0,0,0.10)] backdrop-blur-[2px]"
    >
      <div className="flex h-11 w-[45px] shrink-0 items-center justify-center rounded-full border-2 border-white bg-color-coral-50 p-2.5">
        <BellIcon />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-start gap-4">
          <p className="min-w-0 flex-1 truncate text-[15px] leading-[1.25] font-semibold text-color-gray-850">
            {getNotificationTitle(notification)}
          </p>
          <p className="shrink-0 text-[12px] leading-[1.35] font-normal text-color-gray-650/60">
            {formatNotificationTime(notification.createdAt)}
          </p>
        </div>
        <p className="mt-2 truncate text-[13px] leading-[1.35] font-medium text-color-gray-650">
          {notification.body}
        </p>
      </div>
    </section>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 text-color-coral-500" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6h-1V9a6 6 0 0 0-4.5-5.8V2a1.5 1.5 0 0 0-3 0v1.2A6 6 0 0 0 6 9v7H5a1 1 0 1 0 0 2h14a1 1 0 1 0 0-2Z"
      />
    </svg>
  );
}

function getNotificationTitle(notification: ToastNotification) {
  if (notification.title) {
    return notification.title;
  }

  if (notification.category === "MATCHING") {
    return "매칭 알림";
  }

  if (notification.category === "CHATROOM") {
    return "채팅방 알림";
  }

  return "알림";
}

function getNotificationHref(notification: ToastNotification) {
  if (notification.relatedTeamId !== null) {
    return `/chat/${notification.relatedTeamId}`;
  }

  if (notification.category === "MATCHING") {
    return "/team-matching/status";
  }

  return "/alarm";
}

function getNotificationKey(notification: ToastNotification) {
  if (notification.notificationId !== undefined) {
    return `api-${notification.notificationId}`;
  }

  return `push-${notification.category}-${notification.relatedTeamId ?? "none"}-${notification.body}`;
}

function shouldSuppressNotification(notification: ForegroundNotification, pathname: string) {
  if (notification.relatedTeamId === null) {
    return false;
  }

  return pathname === `/chat/${notification.relatedTeamId}`;
}

function formatNotificationTime(createdAt: string) {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
