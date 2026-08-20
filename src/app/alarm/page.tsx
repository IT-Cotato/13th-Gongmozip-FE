"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  type NotificationCategory,
  type NotificationItem,
  useNotificationsQuery,
  useReadAllNotificationsMutation,
} from "@/queries/useNotificationsQuery";
import { useAuthStore } from "@/stores/useAuthStore";
import { useHasAuthHydrated } from "@/stores/useHasAuthHydrated";

type NotificationFilter = {
  label: string;
  category?: NotificationCategory;
};

const FILTERS: NotificationFilter[] = [
  { label: "전체" },
  { label: "기타", category: "OTHER" },
  { label: "매칭", category: "MATCHING" },
  { label: "채팅방", category: "CHATROOM" },
];

function AlarmHeader() {
  return (
    <header className="shrink-0 bg-white">
      <div className="relative flex h-[46px] items-center justify-center border-b border-color-gray-650/8 px-4 py-1">
        <Link
          href="/"
          aria-label="뒤로가기"
          className="absolute left-4 flex size-[38px] items-center justify-center rounded-[14px]"
        >
          <Image
            src="/icons/alarm/chevron-left.svg"
            alt=""
            width={7}
            height={12}
            className="h-[11.667px] w-[6.667px]"
          />
        </Link>
        <h1 className="flex h-[38px] items-center justify-center text-[17px] leading-[1.35] font-semibold text-color-gray-900">
          알림
        </h1>
      </div>
    </header>
  );
}

function FilterSection({
  selectedCategory,
  onSelectCategory,
}: {
  selectedCategory?: NotificationCategory;
  onSelectCategory: (category?: NotificationCategory) => void;
}) {
  return (
    <section className="flex h-16 shrink-0 items-center justify-center bg-white px-5 py-4">
      <div className="flex min-w-0 flex-1 items-start gap-1">
        {FILTERS.map((filter) => {
          const isActive = selectedCategory === filter.category;

          return (
            <button
              key={filter.label}
              type="button"
              onClick={() => onSelectCategory(filter.category)}
              className={`flex h-8 items-center justify-center rounded-full px-2.5 py-2 text-[15px] leading-[1.25] font-semibold ${
                isActive
                  ? "bg-color-gray-850 text-white"
                  : "bg-color-gray-650/10 text-color-gray-650"
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function NotificationList({
  notifications,
  isError,
  isFetchingNextPage,
  isLoading,
  hasNextPage,
  onFetchNextPage,
}: {
  notifications: NotificationItem[];
  isError: boolean;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  hasNextPage: boolean;
  onFetchNextPage: () => void;
}) {
  if (isLoading) {
    return <AlarmStatus message="알림을 불러오는 중이에요." />;
  }

  if (isError) {
    return <AlarmStatus message="알림을 불러오지 못했어요." />;
  }

  if (notifications.length === 0) {
    return <AlarmStatus message="아직 도착한 알림이 없어요." />;
  }

  return (
    <div className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto">
      <ul className="divide-y divide-color-gray-650/8">
        {notifications.map((notification) => (
          <NotificationRow key={notification.notificationId} notification={notification} />
        ))}
      </ul>

      {hasNextPage ? (
        <div className="px-5 py-4">
          <button
            type="button"
            onClick={onFetchNextPage}
            disabled={isFetchingNextPage}
            className="flex h-11 w-full items-center justify-center rounded-[14px] bg-color-gray-150 text-[15px] leading-[1.25] font-semibold text-color-gray-650 disabled:opacity-60"
          >
            {isFetchingNextPage ? "불러오는 중" : "더보기"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function NotificationRow({ notification }: { notification: NotificationItem }) {
  const href = getNotificationHref(notification);
  const content = (
    <>
      <div
        className={`mt-1 size-2.5 shrink-0 rounded-full ${
          notification.isRead ? "bg-transparent" : "bg-color-gray-400"
        }`}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <p className="break-keep text-[15px] leading-[1.45] font-medium text-color-gray-850">
          {notification.body}
        </p>
        <p className="mt-1 text-[12px] leading-[1.35] font-medium text-color-gray-500">
          {formatNotificationTime(notification.createdAt)}
        </p>
      </div>
      {href ? (
        <Image
          src="/icons/team-matching/icon-1.svg"
          alt=""
          width={20}
          height={20}
          className="mt-0.5 size-5 shrink-0 opacity-50"
        />
      ) : null}
    </>
  );
  const className = `flex w-full items-start gap-3 px-5 py-4 text-left ${
    notification.isRead ? "bg-white" : "bg-color-gray-650/8"
  }`;

  if (href) {
    return (
      <li>
        <Link href={href} className={className}>
          {content}
        </Link>
      </li>
    );
  }

  return (
    <li>
      <div className={className}>{content}</div>
    </li>
  );
}

function AlarmStatus({ message }: { message: string }) {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center px-6 text-center text-[13px] leading-[1.35] font-medium text-color-gray-650">
      {message}
    </div>
  );
}

export default function AlarmPage() {
  const router = useRouter();
  const hasHydrated = useHasAuthHydrated();
  const accessToken = useAuthStore((state) => state.accessToken);
  const [selectedCategory, setSelectedCategory] = useState<NotificationCategory | undefined>();
  const hasRequestedReadAll = useRef(false);
  const notificationsQuery = useNotificationsQuery(selectedCategory, {
    enabled: hasHydrated && Boolean(accessToken),
  });
  const readAllNotificationsMutation = useReadAllNotificationsMutation();
  const notifications = useMemo(
    () => notificationsQuery.data?.pages.flatMap((page) => page.notifications) ?? [],
    [notificationsQuery.data],
  );

  useEffect(() => {
    if (hasHydrated && !accessToken) {
      router.replace("/login");
    }
  }, [accessToken, hasHydrated, router]);

  useEffect(() => {
    if (!hasHydrated || !accessToken || hasRequestedReadAll.current) {
      return;
    }

    hasRequestedReadAll.current = true;
    readAllNotificationsMutation.mutate();
  }, [accessToken, hasHydrated, readAllNotificationsMutation]);

  if (!hasHydrated || !accessToken) {
    return (
      <p className="px-4 py-16 text-center text-[13px] text-[#949494]">
        로그인이 필요해요. 로그인 페이지로 이동할게요...
      </p>
    );
  }

  return (
    <main className="flex h-full w-full flex-col overflow-hidden bg-white text-color-gray-850">
      <AlarmHeader />
      <FilterSection selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />

      <section
        aria-label="알림 목록"
        className="min-h-0 flex-1 border-t border-color-gray-650/8 bg-white"
      >
        <NotificationList
          notifications={notifications}
          isLoading={notificationsQuery.isLoading}
          isError={notificationsQuery.isError}
          hasNextPage={notificationsQuery.hasNextPage}
          isFetchingNextPage={notificationsQuery.isFetchingNextPage}
          onFetchNextPage={() => {
            void notificationsQuery.fetchNextPage();
          }}
        />
      </section>
    </main>
  );
}

function getNotificationHref(notification: NotificationItem) {
  if (notification.relatedTeamId !== null) {
    return `/chat/${notification.relatedTeamId}`;
  }

  if (notification.category === "MATCHING") {
    return "/team-matching/status";
  }

  return null;
}

function formatNotificationTime(createdAt: string) {
  const timestamp = new Date(createdAt).getTime();

  if (!Number.isFinite(timestamp)) {
    return "";
  }

  const diffMs = Date.now() - timestamp;
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) {
    return "방금 전";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}분 전`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}시간 전`;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
  }).format(timestamp);
}
