// store/useConversationStore.ts
import { create } from "zustand";

interface Message {
  from: "user" | "agent";
  text: string;
}

interface Conversation {
  conversationId: string;
  messages: Message[];
}

interface Agent {
  agentId: string;
  agentName: string;
  conversations: Conversation[];
}

interface ConversationStore {
  agents: Agent[];
  setAgents: (agents: Agent[]) => void;
  addConversation: (agentId: string, conversation: Conversation) => void;
  addMessage: (agentId: string, conversationId: string, message: Message) => void;
}

export const useConversationStore = create<ConversationStore>((set) => ({
  agents: [],
  setAgents: (agents) => set({ agents }),
  addConversation: (agentId, conversation) =>
    set((state) => ({
      agents: state.agents.map((agent) =>
        agent.agentId === agentId
          ? { ...agent, conversations: [...agent.conversations, conversation] }
          : agent
      ),
    })),
  addMessage: (agentId, conversationId, message) =>
    set((state) => ({
      agents: state.agents.map((agent) =>
        agent.agentId === agentId
          ? {
              ...agent,
              conversations: agent.conversations.map((conv) =>
                conv.conversationId === conversationId
                  ? { ...conv, messages: [...conv.messages, message] }
                  : conv
              ),
            }
          : agent
      ),
    })),
}));