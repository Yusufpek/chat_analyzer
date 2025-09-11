export interface SelectedSliceState {
	selectedAgentId: string;
	setSelectedAgentId: (agentId: string) => void;
	selectedConversationId: string;
	setSelectedConversationId: (conversationId: string) => void;
}


type SetState = (partial: Partial<SelectedSliceState> | ((state: SelectedSliceState) => Partial<SelectedSliceState>)) => void;
type GetState = () => SelectedSliceState;

export const createSelectedSlice = (set: SetState, get: GetState): SelectedSliceState => ({
	selectedAgentId: '',
	selectedConversationId: '',
	setSelectedAgentId: (agentId: string) => set({ 
		selectedAgentId: agentId,
		selectedConversationId: '' // Reset conversation ID when agent changes
	}),
	setSelectedConversationId: (conversationId: string) => set({ selectedConversationId: conversationId }),
});
