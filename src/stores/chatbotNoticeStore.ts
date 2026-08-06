"use client";

import { create } from "zustand";

export type ChatbotNoticeAction = "added" | "removed";

export type ChatbotNotice = {
  id: string;
  action: ChatbotNoticeAction;
  actorName: string;
};

type ChatbotNoticeState = {
  chatbotEnabledByRoomId: Record<string, boolean>;
  noticesByRoomId: Record<string, ChatbotNotice[]>;
  toggleChatbot: (roomId: string, actorName: string) => void;
};

export const useChatbotNoticeStore = create<ChatbotNoticeState>()((set) => ({
  chatbotEnabledByRoomId: {},
  noticesByRoomId: {},
  toggleChatbot: (roomId, actorName) =>
    set((state) => {
      const isCurrentlyEnabled = state.chatbotEnabledByRoomId[roomId] ?? true;
      const action: ChatbotNoticeAction = isCurrentlyEnabled ? "removed" : "added";
      const currentNotices = state.noticesByRoomId[roomId] ?? [];

      return {
        chatbotEnabledByRoomId: {
          ...state.chatbotEnabledByRoomId,
          [roomId]: !isCurrentlyEnabled,
        },
        noticesByRoomId: {
          ...state.noticesByRoomId,
          [roomId]: [
            ...currentNotices,
            {
              id: `${roomId}-${action}-${Date.now()}`,
              action,
              actorName,
            },
          ],
        },
      };
    }),
}));
