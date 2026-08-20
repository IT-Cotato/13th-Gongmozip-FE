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

  const serviceWorkerRegistration = await navigator.serviceWorker.ready;
  const token = await getToken(messaging, {
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration,
  });

  if (token) {
    await registerNotificationPushToken(token);
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

function mapMessagePayloadToNotification(payload: MessagePayload): ForegroundNotification | null {
  const body = payload.notification?.body ?? payload.data?.body ?? payload.data?.message;

  if (!body) {
    return null;
  }

  return {
    body,
    category: parseNotificationCategory(payload.data?.category),
    createdAt: payload.data?.createdAt ?? new Date().toISOString(),
    relatedTeamId: parseNullableNumber(payload.data?.teamId ?? payload.data?.relatedTeamId),
    title: payload.notification?.title ?? payload.data?.title,
  };
}

function parseNotificationCategory(value: string | undefined): NotificationCategory {
  if (value === "MATCHING" || value === "CHATROOM" || value === "OTHER") {
    return value;
  }

  return "OTHER";
}

function parseNullableNumber(value: string | undefined) {
  if (!value) {
    return null;
  }

  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : null;
}
