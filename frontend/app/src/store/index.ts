import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { createLoginSlice, LoginSliceState } from "./login";
import { createAgentsSlice, AgentsSliceState } from "./agents";
import { createConversationsSlice, ConversationsSliceState } from "./conversations";
import { createMessagesSlice, MessagesSliceState } from "./messages";

// Combined store state type
export type RootState = LoginSliceState & AgentsSliceState & ConversationsSliceState & MessagesSliceState;

export const useStore = create<RootState>()(
    devtools(
        (set, get) => ({
            ...createLoginSlice(set, get),
            ...createAgentsSlice(set, get),
            ...createConversationsSlice(set, get),
            ...createMessagesSlice(set, get),
        }),
        {
        name: 'chat-analyzer-store',
        serialize: { option: false },
        trace: true,
        }
    )
);

// Convenience selectors
export const useAgents = () => useStore((state) => ({
    agents: state.agents,
    isLoadingAgents: state.isLoadingAgents,
    agentsError: state.agentsError,
    fetchAgents: state.fetchAgents,
    clearAgents: state.clearAgents,
}));

export const useConversations = (agentId?: string) => useStore((state) => ({
    conversations: agentId ? state.getConversationsForAgent(agentId) : [],
    isLoadingConversations: state.isLoadingConversations,
    conversationsError: state.conversationsError,
    fetchConversationsIfNeeded: state.fetchConversationsIfNeeded,
    refreshConversations: state.refreshConversations,
    clearConversationsForAgent: state.clearConversationsForAgent,
}));

export const useMessages = (conversationId?: string) => useStore((state) => ({
    messages: conversationId ? state.getMessagesForConversation(conversationId) : [],
    isLoadingMessages: state.isLoadingMessages,
    messagesError: state.messagesError,
    fetchMessagesForConversation: state.fetchMessagesForConversation,
    refreshMessagesForConversation: state.refreshMessagesForConversation,
    addMessageToConversation: state.addMessageToConversation,
    clearMessagesForConversation: state.clearMessagesForConversation,
}));

// Utility selectors
export const useAgentById = (agentId: string) => useStore((state) => 
    state.agents.find((agent: any) => agent.id === agentId)
);

export const useConversationById = (agentId: string, conversationId: string) => useStore((state) => 
    state.getConversationsForAgent(agentId).find((conv: any) => conv.id === conversationId)
);