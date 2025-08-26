import { request } from "@api/requestLayer";

export interface MessageItem {
  id: string;
  content: string;
  created_at: string;
  sender_type: "assistant" | "user" | string;
  conversation: string;
}

export interface MessagesSliceState {
  messagesByConversation: Record<string, MessageItem[]>;
  isLoadingMessages: boolean;
  messagesError: string | null;
  setMessagesForConversation: (conversationId: string, messages: MessageItem[]) => void;
  addMessagesForConversation: (conversationId: string, messagesToAdd: MessageItem[]) => void;
  addMessageToConversation: (conversationId: string, message: MessageItem) => void;
  clearMessagesForConversation: (conversationId: string) => void;
  clearAllMessages: () => void;
  getMessagesForConversation: (conversationId: string) => MessageItem[];
  fetchMessagesForConversation: (conversationId: string) => Promise<void>;
  refreshMessagesForConversation: (conversationId: string) => Promise<void>;
}

// Zustand store types
type SetState = (partial: Partial<MessagesSliceState> | ((state: MessagesSliceState) => Partial<MessagesSliceState>)) => void;
type GetState = () => MessagesSliceState;

export const createMessagesSlice = (set: SetState, get: GetState): MessagesSliceState => ({
  messagesByConversation: {},
  isLoadingMessages: false,
  messagesError: null,
  setMessagesForConversation: (conversationId: string, messages: MessageItem[]) => {
    if (!conversationId) return;
    set((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: messages,
      },
    }));
  },
  addMessagesForConversation: (conversationId: string, messagesToAdd: MessageItem[]) => {
    if (!conversationId) return;
    const current = get().messagesByConversation?.[conversationId] || [];
    const mergedMap = new Map<string, MessageItem>();
    [...current, ...messagesToAdd].forEach((message) => {
      if (message?.id) {
        mergedMap.set(String(message.id), message);
      }
    });
    const merged = Array.from(mergedMap.values());
    set((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: merged,
      },
    }));
  },
  addMessageToConversation: (conversationId: string, message: MessageItem) => {
    if (!conversationId || !message?.id) return;
    const current = get().messagesByConversation?.[conversationId] || [];
    const updatedMessages = [...current, message];
    set((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: updatedMessages,
      },
    }));
  },
  clearMessagesForConversation: (conversationId: string) => {
    if (!conversationId) return;
    set((state) => {
      const next = { ...state.messagesByConversation };
      delete next[conversationId];
      return { messagesByConversation: next };
    });
  },
  clearAllMessages: () => {
    set({ messagesByConversation: {} });
  },
  getMessagesForConversation: (conversationId: string): MessageItem[] => {
    if (!conversationId) return [];
    return get().messagesByConversation?.[conversationId] || [];
  },
  fetchMessagesForConversation: async (conversationId: string) => {
    if (!conversationId) return;
    const { isLoadingMessages } = get();
    if (isLoadingMessages) return;

    set({ isLoadingMessages: true, messagesError: null });
    try {
      const data = await request(
        `/api/chat/conversation/${conversationId}/messages/`,
        { method: "GET" }
      );
      const content = Array.isArray(data?.content) ? (data.content as MessageItem[]) : [];
      set((state) => ({
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: content,
        },
        isLoadingMessages: false,
      }));
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to load messages";
      set({ messagesError: errorMessage, isLoadingMessages: false });
    }
  },
  refreshMessagesForConversation: async (conversationId: string) => {
    if (!conversationId) return;
    set({ isLoadingMessages: true, messagesError: null });
    try {
      const data = await request(
        `/api/chat/conversation/${conversationId}/messages/`,
        { method: "GET" }
      );
      const content = Array.isArray(data?.content) ? (data.content as MessageItem[]) : [];
      set((state) => ({
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: content,
        },
        isLoadingMessages: false,
      }));
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to refresh messages";
      set({ messagesError: errorMessage, isLoadingMessages: false });
    }
  },
});


