import { request } from "@api/requestLayer";

export interface Connection {
  id: number;
  connection_type: string;
  api_key: string;
  sync_interval: number;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreateConnectionPayload {
  connection_type: string;
  api_key: string;
  sync_interval: number;
  config: Record<string, any>;
}

export interface ConnectionSliceState {
  connections: Connection[];
  isLoadingConnections: boolean;
  connectionsError: string | null;
  createConnection: (payload: CreateConnectionPayload) => Promise<Connection | null>;
  fetchConnections: () => Promise<void>;
  clearConnections: () => void;
}

type SetState = (partial: Partial<ConnectionSliceState> | ((state: ConnectionSliceState) => Partial<ConnectionSliceState>)) => void;
type GetState = () => ConnectionSliceState;

export const createConnectionSlice = (set: SetState, get: GetState): ConnectionSliceState => ({
  connections: [],
  isLoadingConnections: false,
  connectionsError: null,

  createConnection: async (payload: CreateConnectionPayload): Promise<Connection | null> => {
    const { isLoadingConnections } = get();
    if (isLoadingConnections) return null;

    set({ isLoadingConnections: true, connectionsError: null });
    try {
      const response = await request('/api/connection/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (response.status === 'CREATED') {
        const newConnection = response.content.content;
        const currentConnections = get().connections;
        set({ 
          connections: [...currentConnections, newConnection],
          isLoadingConnections: false 
        });
        return newConnection;
      } else {
        throw new Error('Failed to create connection');
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to create connection';
      set({ 
        connectionsError: errorMessage,
        isLoadingConnections: false 
      });
      throw error;
    }
  },

  fetchConnections: async (): Promise<void> => {
    const { isLoadingConnections } = get();
    if (isLoadingConnections) return;

    set({ isLoadingConnections: true, connectionsError: null });
    try {
      const response = await request('/api/connection/', { method: 'GET' });
      const connections = Array.isArray(response?.content) ? response.content : [];
      set({ 
        connections,
        isLoadingConnections: false 
      });
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to fetch connections';
      set({ 
        connectionsError: errorMessage,
        isLoadingConnections: false 
      });
    }
  },

  clearConnections: () => {
    set({ connections: [], connectionsError: null });
  },
});
