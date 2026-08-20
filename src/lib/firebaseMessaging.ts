"use client";

import { initializeApp, getApps, type FirebaseOptions } from "firebase/app";
import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
  type MessagePayload,
  type Messaging,
} from "firebase/messaging";

import {
  type NotificationCategory,
  registerNotificationPushToken,
} from "@/queries/useNotificationsQuery";

export type ForegroundNotification = {
  body: string;
  category: NotificationCategory;
  createdAt: string;
  relatedTeamId: number | null;
  title?: string;
};

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function isFirebaseMessagingConfigured() {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.projectId &&
      firebaseConfig.messagingSenderId &&
      firebaseConfig.appId &&
      process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
  );
}

export function getNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return null;
  }

  return Notification.permission;
}

export async function registerGrantedNotificationToken() {
  if (!isFirebaseMessagingConfigured() || !("Notification" in window)) {
    return;
  }

  if (Notification.permission !== "granted") {
    return;
  }

  const messaging = await getFirebaseMessaging();
  if (!messaging) {
    return;
  }

  const serviceWorkerRegistration = await getFirebaseMessagingServiceWorkerRegistration();
  const token = await getToken(messaging, {
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration,
  });

  if (token) {
    await registerNotificationPushToken(token);
  }
}

export async function requestNotificationPermissionAndRegisterToken() {
  if (!isFirebaseMessagingConfigured() || !("Notification" in window)) {
    return;
  }

  const permission = await Notification.requestPermission();

  if (permission === "granted") {
    await registerGrantedNotificationToken();
  }
}

export async function subscribeForegroundNotifications(
  onNotification: (notification: ForegroundNotification) => void,
) {
  if (!isFirebaseMessagingConfigured()) {
    return null;
  }

  const messaging = await getFirebaseMessaging();
  if (!messaging) {
    return null;
  }

  return onMessage(messaging, (payload) => {
    const notification = mapMessagePayloadToNotification(payload);

    if (notification) {
      onNotification(notification);
    }
  });
}

async function getFirebaseMessaging(): Promise<Messaging | null> {
  if (!(await isSupported())) {
    return null;
  }

  const app = getApps()[0] ?? initializeApp(firebaseConfig);

  return getMessaging(app);
}

async function getFirebaseMessagingServiceWorkerRegistration() {
  if (!("serviceWorker" in navigator)) {
    return undefined;
  }

  return navigator.serviceWorker.register("/firebase-messaging-sw.js", {
    scope: "/firebase-cloud-messaging-push-scope",
    updateViaCache: "none",
  });
}

function mapMessagePayloadToNotification(payload: MessagePayload): ForegroundNotification | null {
  const relatedTeamId = parseNullableNumber(payload.data?.teamId ?? payload.data?.relatedTeamId);
  const body =
    payload.notification?.body ??
    payload.data?.body ??
    payload.data?.message ??
    payload.data?.content ??
    payload.data?.text ??
    payload.data?.lastMessage ??
    payload.data?.chatMessage ??
    payload.data?.messageBody ??
    payload.data?.messageContent ??
    (relatedTeamId !== null ? "새 메시지가 도착했어요." : undefined);

  if (!body) {
    return null;
  }

  return {
    body,
    category: parseNotificationCategory(payload.data?.category, relatedTeamId),
    createdAt: payload.data?.createdAt ?? new Date().toISOString(),
    relatedTeamId,
    title: payload.notification?.title ?? payload.data?.title ?? getFallbackTitle(relatedTeamId),
  };
}

function parseNotificationCategory(
  value: string | undefined,
  relatedTeamId: number | null,
): NotificationCategory {
  if (value === "MATCHING" || value === "CHATROOM" || value === "OTHER") {
    return value;
  }

  if (relatedTeamId !== null) {
    return "CHATROOM";
  }

  return "OTHER";
}

function getFallbackTitle(relatedTeamId: number | null) {
  return relatedTeamId !== null ? "채팅방 알림" : undefined;
}

function parseNullableNumber(value: string | undefined) {
  if (!value) {
    return null;
  }

  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : null;
}
