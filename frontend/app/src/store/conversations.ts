import { request } from "@api/requestLayer";

export interface ConversationItem {
	id: string;
	created_at: string;
	source: string;
	chat_type: string;
	status: string;
	agent_id: string;
	last_message: string | null;
	assistant_avatar_url?: string | null;
	label?: string | null;
	title?: string | null;
}

export interface ConversationsSliceState {
	conversationsByAgent: Record<string, ConversationItem[]>;
	isLoadingConversations: boolean;
	conversationsError: string | null;
	setConversationsForAgent: (agentId: string, conversations: ConversationItem[]) => void;
	addConversationsForAgent: (agentId: string, conversationsToAdd: ConversationItem[]) => void;
	clearConversationsForAgent: (agentId: string) => void;
	clearAllConversations: () => void;
	getConversationsForAgent: (agentId: string) => ConversationItem[];
	fetchConversations: (agentId: string) => Promise<void>;
	refreshConversations: (agentId: string) => Promise<void>;
	fetchContextChangeDetails: (conversationId: string) => Promise<any>;
}


type SetState = (partial: Partial<ConversationsSliceState> | ((state: ConversationsSliceState) => Partial<ConversationsSliceState>)) => void;
type GetState = () => ConversationsSliceState;

export const createConversationsSlice = (set: SetState, get: GetState): ConversationsSliceState => ({
	conversationsByAgent: {},
	isLoadingConversations: false,
	conversationsError: null,
	setConversationsForAgent: (agentId: string, conversations: ConversationItem[]) => {
		if (!agentId) return;
		set((state) => ({
			conversationsByAgent: {
				...state.conversationsByAgent,
				[agentId]: conversations,
			},
		}));
	},
	addConversationsForAgent: (agentId: string, conversationsToAdd: ConversationItem[]) => {
		if (!agentId) return;
		const current = get().conversationsByAgent?.[agentId] || [];
		const mergedMap = new Map<string, ConversationItem>();
		[...current, ...conversationsToAdd].forEach((conversation) => {
			if (conversation?.id) {
				mergedMap.set(String(conversation.id), conversation);
			}
		});
		const merged = Array.from(mergedMap.values());
		set((state) => ({
			conversationsByAgent: {
				...state.conversationsByAgent,
				[agentId]: merged,
			},
		}));
	},
	clearConversationsForAgent: (agentId: string) => {
		if (!agentId) return;
		set((state) => {
			const next = { ...state.conversationsByAgent };
			delete next[agentId];
			return { conversationsByAgent: next };
		});
	},
	clearAllConversations: () => {
		set({ conversationsByAgent: {} });
	},
	getConversationsForAgent: (agentId: string): ConversationItem[] => {
		if (!agentId) return [];
		return get().conversationsByAgent?.[agentId] || [];
	},
	fetchConversations: async (agentId: string) => {
		if (!agentId) return;
		const { isLoadingConversations } = get();
		if (isLoadingConversations) return;

		set({ isLoadingConversations: true, conversationsError: null });
		try {
			const data = await request(`/api/chat/conversations/${agentId}`, { method: "GET" });
			const content = Array.isArray(data?.content) ? (data.content as ConversationItem[]) : [];
			set((state) => ({
				conversationsByAgent: {
					...state.conversationsByAgent,
					[agentId]: content,
				},
				isLoadingConversations: false,
			}));
		} catch (error: any) {
			const errorMessage = error?.message || "Failed to load conversations";
			set({ conversationsError: errorMessage, isLoadingConversations: false });
		}
	},
	refreshConversations: async (agentId: string) => {
		if (!agentId) return;
		set({ isLoadingConversations: true, conversationsError: null });
		try {
			const data = await request(`/api/chat/conversations/${agentId}`, { method: "GET" });
			const content = Array.isArray(data?.content) ? (data.content as ConversationItem[]) : [];
			set((state) => ({
				conversationsByAgent: {
					...state.conversationsByAgent,
					[agentId]: content,
				},
				isLoadingConversations: false,
			}));
		} catch (error: any) {
			const errorMessage = error?.message || "Failed to refresh conversations";
			set({ conversationsError: errorMessage, isLoadingConversations: false });
		}
	},
	fetchContextChangeDetails: async (conversationId: string) => {
		if (!conversationId) return null;
		try {
			const data = await request(`/api/analyze/context_change/${conversationId}/details/`, { method: "GET" });
			return data?.content ?? null;
		} catch (error) {
			return null;
		}
	},
});


