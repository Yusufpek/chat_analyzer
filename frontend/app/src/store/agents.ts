import { request } from "@api/requestLayer";
import { AgentDetailsContent, AgentDetailsResponse } from "@utils/dashboardUtils";

export interface AgentItem {
	id: string;
	name: string;
	avatar_url: string | null;
	connection_type: string;
	label_choices: string[] | null;
	jotform_render_url?: string | null;
}

export interface JotformAgentsResponse {
	unsynced: AgentItem[];
	synced: AgentItem[];
}

export interface AgentsSliceState {
	agents: AgentItem[];
	setAgents: (agents: AgentItem[]) => void;
	addAgents: (agentsToAdd: AgentItem[]) => void;
	connectionAgents: Record<string, AgentItem[]>;
	getAgentsForConnection: (connectionType: string) => AgentItem[];
	setAgentsForConnection: (connectionType: string, agents: AgentItem[]) => void;
	fetchAgentsForConnection: (connectionType: string) => Promise<void>;
	selectedConnectionType: string;
	setSelectedConnectionType: (connectionType: string) => void;
	isLoadingAgents: boolean;
	setIsLoadingAgents: (isLoading: boolean) => void;
	agentsError: string | null;
	setAgentsError: (error: string | null) => void;
	fetchAgents: (connection_type?: string) => Promise<void>;
	clearAgents: () => void;
	deleteAgent: (agentId: string) => Promise<void>;
	updateAgentLabels: (agentId: string, labelChoices: string[]) => void;
	
	// Agent details state and functions
	agentDetails: Record<string, AgentDetailsContent>;
	isLoadingAgentDetails: boolean;
	agentDetailsError: string | null;
	fetchAgentDetails: (agentId: string) => Promise<void>;
	clearAgentDetails: (agentId?: string) => void;
	
	// Jotform specific functions
	fetchJotformAgents: () => Promise<JotformAgentsResponse | null>;
	syncJotformAgents: (agents: AgentItem[]) => Promise<void>;

	// Analyze/Qdrant
	qdrantSearch: (agentId: string, query: string) => Promise<any[]>;
}


type SetState = (partial: Partial<AgentsSliceState> | ((state: AgentsSliceState) => Partial<AgentsSliceState>)) => void;
type GetState = () => AgentsSliceState;

export const createAgentsSlice = (set: SetState, get: GetState): AgentsSliceState => ({
	agents: [],
	connectionAgents: {},
	selectedConnectionType: 'jotform',
	agentDetails: {},
	isLoadingAgentDetails: false,
	agentDetailsError: null,
	setAgents: (agents: AgentItem[]) => {
		set({ agents });
	},
	addAgents: (agentsToAdd: AgentItem[]) => {
		const current = get().agents;
		const mergedMap = new Map<string, AgentItem>();
		[...current, ...agentsToAdd].forEach((agent) => {
			if (agent?.id) {
				mergedMap.set(String(agent.id), agent);
			}
		});
		const merged = Array.from(mergedMap.values());
		set({ agents: merged });
	},
	getAgentsForConnection: (connectionType: string) => {
		const map = get().connectionAgents || {};
		return map[connectionType] || [];
	},
	setAgentsForConnection: (connectionType: string, agents: AgentItem[]) => {
		const current = get().connectionAgents || {};
		set({ connectionAgents: { ...current, [connectionType]: agents } });

		// Keep flat list merged
		const flatMerged = new Map<string, AgentItem>();
		[...get().agents, ...agents].forEach((agent) => {
			if (agent?.id) flatMerged.set(String(agent.id), agent);
		});
		set({ agents: Array.from(flatMerged.values()) });
	},
	setSelectedConnectionType: (connectionType: string) => {
		set({ selectedConnectionType: connectionType });
	},
	clearAgents: () => {
		set({ agents: [], connectionAgents: {} });
	},
	deleteAgent: async (agentId: string) => {
		try {
			await request(`/api/agent/${agentId}/`, { method: "DELETE" });
			
			// Remove agent from local state
			const currentAgents = get().agents;
			const updatedAgents = currentAgents.filter(agent => agent.id !== agentId);
			// Also update per-connection cache
			const currentConn = get().connectionAgents || {};
			const updatedConn: Record<string, AgentItem[]> = {};
			Object.entries(currentConn).forEach(([key, list]) => {
				updatedConn[key] = list.filter(a => a.id !== agentId);
			});
			set({ agents: updatedAgents, connectionAgents: updatedConn });
		} catch (error: any) {
			const errorMessage = error?.message || "Failed to delete agent";
			set({ agentsError: errorMessage });
			throw error;
		}
	},
	updateAgentLabels: (agentId: string, labelChoices: string[]) => {
		const currentAgents = get().agents;
		const updatedAgents = currentAgents.map(agent => 
			agent.id === agentId 
				? { ...agent, label_choices: labelChoices }
				: agent
		);
		
		// Also update per-connection cache
		const currentConn = get().connectionAgents || {};
		const updatedConn: Record<string, AgentItem[]> = {};
		Object.entries(currentConn).forEach(([key, list]) => {
			updatedConn[key] = list.map(agent => 
				agent.id === agentId 
					? { ...agent, label_choices: labelChoices }
					: agent
			);
		});
		
		set({ agents: updatedAgents, connectionAgents: updatedConn });
	},
	isLoadingAgents: false,
	setIsLoadingAgents: (isLoading: boolean) => set({ isLoadingAgents: isLoading }),
	agentsError: null,
	setAgentsError: (error: string | null) => set({ agentsError: error }),
	
	fetchAgents: async (connection_type?: string) => {
		// Do not fetch if user is not authenticated
		const stateAny = get() as any;
		if (stateAny?.authStatus !== "authenticated") return [];

		const { isLoadingAgents } = get();
		if (isLoadingAgents) return [];

		set({ isLoadingAgents: true, agentsError: null });
		try {
			const url = connection_type
				? `/api/connection/${connection_type}/agent/`
				: `/api/agent/`;
			const data = await request(url, { method: "GET" });
			const content = Array.isArray(data?.content) ? data.content : [];
			set({ agents: content, isLoadingAgents: false });
			if (connection_type) {
				get().setAgentsForConnection(connection_type, content);
			}
			return content;
		} catch (error: any) {
			const errorMessage = error?.message || "Failed to load agents";
			set({ agentsError: errorMessage, isLoadingAgents: false });
			return [];
		}
	},
	
	fetchAgentsForConnection: async (connectionType: string) => {
		// Do not fetch if user is not authenticated
		const stateAny = get() as any;
		if (stateAny?.authStatus !== "authenticated") return;

		// If cached, do nothing
		const cached = get().getAgentsForConnection(connectionType);
		if (cached && cached.length > 0) return ;

		const { isLoadingAgents } = get();
		if (isLoadingAgents) return;

		set({ isLoadingAgents: true, agentsError: null });
		try {
			const data = await request(`/api/connection/${connectionType}/agent/`, { method: "GET" });
			const content = Array.isArray(data?.content) ? data.content : [];
			get().setAgentsForConnection(connectionType, content);
			set({ isLoadingAgents: false });
		} catch (error: any) {
			const errorMessage = error?.message || `Failed to load agents for ${connectionType}`;
			set({ agentsError: errorMessage, isLoadingAgents: false });
		}
	},
	
	fetchJotformAgents: async () => {
		try {
			const response = await request('/api/jotform/agents/', { method: 'GET' });
			if (response.status === 'SUCCESS') {
				return response.content;
			} else {
				throw new Error('Failed to fetch Jotform agents');
			}
		} catch (error) {
			console.error('Failed to fetch Jotform agents:', error);
			throw error;
		}
	},
	
	syncJotformAgents: async (agents: AgentItem[]) => {
		try {
			const payload = {
				agents: agents.map(agent => ({
					id: agent.id,
					name: agent.name,
					avatar_url: agent.avatar_url,
					jotform_render_url: agent.jotform_render_url || `https://agent.jotform.com/${agent.id}`,
					connection_type: 'jotform',
					label_choices: agent.label_choices || null
				}))
			};

			await request('/api/agent/', {
				method: 'POST',
				body: JSON.stringify(payload),
			});

			// Add agents to store
			get().addAgents(payload.agents);
			
			// Update connection-specific cache
			const currentConnectionAgents = get().getAgentsForConnection('jotform');
			const updatedConnectionAgents = [...currentConnectionAgents, ...payload.agents];
			get().setAgentsForConnection('jotform', updatedConnectionAgents);
		} catch (error) {
			console.error('Failed to sync Jotform agents:', error);
			throw error;
		}
	},

	// Analyze/Qdrant
	qdrantSearch: async (agentId: string, query: string) => {
		const trimmed = (query || '').trim();
		if (!trimmed) return [];
		if (!agentId) throw new Error('Agent ID required');
		const data = await request('/api/analyze/qdrant_search/', {
			method: 'POST',
			body: JSON.stringify({ agent_id: agentId, query: trimmed })
		});
		const content = Array.isArray((data as any)?.content) ? (data as any).content : [];
		return content;
	},
	
	fetchAgentDetails: async (agentId: string) => {
		// Do not fetch if user is not authenticated
		const stateAny = get() as any;
		if (stateAny?.authStatus !== "authenticated") return;

		// If already cached, do nothing
		const currentDetails = get().agentDetails;
		if (currentDetails[agentId]) return;

		const { isLoadingAgentDetails } = get();
		if (isLoadingAgentDetails) return;

		set({ isLoadingAgentDetails: true, agentDetailsError: null });
		try {
			const res: AgentDetailsResponse = await request(`/api/agent/${agentId}/details`, { method: 'GET' });
			if (res?.status === 'SUCCESS') {
				const currentDetails = get().agentDetails;
				set({ 
					agentDetails: { ...currentDetails, [agentId]: res.content },
					isLoadingAgentDetails: false 
				});
			} else {
				set({ 
					agentDetailsError: 'Failed to load agent details',
					isLoadingAgentDetails: false 
				});
			}
		} catch (error: any) {
			set({ 
				agentDetailsError: error?.message || 'Failed to load agent details',
				isLoadingAgentDetails: false 
			});
		}
	},
	
	clearAgentDetails: (agentId?: string) => {
		if (agentId) {
			const currentDetails = get().agentDetails;
			const { [agentId]: removed, ...remaining } = currentDetails;
			set({ agentDetails: remaining });
		} else {
			set({ agentDetails: {} });
		}
	},
});

