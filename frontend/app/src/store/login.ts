import { request } from "@api/requestLayer";

export interface User {
  email: string;
  first_name: string;
  last_name: string;
  pk: number;
  profile_image: string | null;
  username: string;
}

export interface LoginSliceState {
  user: User | null;
  setUser: (user: User | null) => void;
  authStatus: 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
  authInitialized: boolean;
  isLoadingLogin: boolean;
  setIsLoadingLogin: (isLoading: boolean) => void;
  loginError: string | null;
  setLoginError: (error: string | null) => void;
  isLoadingRegister: boolean;
  setIsLoadingRegister: (isLoading: boolean) => void;
  registerError: string | null;
  setRegisterError: (error: string | null) => void;
  userError: string | null;
  setUserError: (error: string | null) => void;
  normalizeUser: (payload: any) => User | null;
  bootstrapAuth: () => Promise<void>;
  login: (username: string, password: string) => Promise<boolean>;
  register: (payload: any) => Promise<boolean>;
  logout: () => Promise<void>;
}

type SetState = (partial: Partial<LoginSliceState> | ((state: LoginSliceState) => Partial<LoginSliceState>)) => void;
type GetState = () => LoginSliceState;

export const createLoginSlice = (set: SetState, get: GetState): LoginSliceState => ({
  user: null,
  setUser: (user: User | null) => set({ user }),

  // Auth state
  authStatus: 'idle',
  authInitialized: false,

  // Loading & error states
  isLoadingLogin: false,
  setIsLoadingLogin: (isLoading: boolean) => set({ isLoadingLogin: isLoading }),
  loginError: null,
  setLoginError: (error: string | null) => set({ loginError: error }),

  // Register loading & error states
  isLoadingRegister: false,
  setIsLoadingRegister: (isLoading: boolean) => set({ isLoadingRegister: isLoading }),
  registerError: null,
  setRegisterError: (error: string | null) => set({ registerError: error }),

  userError: null,
  setUserError: (error: string | null) => set({ userError: error }),

  
  normalizeUser: (payload: any): User | null => {
    if (!payload || typeof payload !== 'object') return null;
    
    if (!payload.username || !payload.email || !payload.pk) {
      console.warn('User payload missing required fields:', payload);
      return null;
    }
    
    return {
      email: payload.email || '',
      first_name: payload.first_name || '',
      last_name: payload.last_name || '',
      pk: payload.pk,
      profile_image: payload.profile_image || null,
      username: payload.username || '',
    } as User;
  },

  // Single bootstrap
  bootstrapAuth: async (): Promise<void> => {
    const { authStatus } = get();
    if (authStatus === 'loading') return;
    set({ authStatus: 'loading', userError: null });
    try {

      const me = await request('/api/auth/user/', { method: 'GET' });

      const userPayload = me?.content?.content || null;
      const user = get().normalizeUser(userPayload);
      
      if (user) {
      
        set({ user, authStatus: 'authenticated', userError: null });
      } else {
      
        set({ user: null, authStatus: 'unauthenticated', userError: null });
      }
    } catch (e: any) {

      set({ user: null, authStatus: 'unauthenticated', userError: e?.message || 'Failed to fetch user' });
    } finally {
      set({ authInitialized: true });
    }
  },

  
  // Login flow with isLoading
  login: async (username: string, password: string): Promise<boolean> => {
    const { isLoadingLogin } = get();
    if (isLoadingLogin) return false;


    set({ isLoadingLogin: true, loginError: null, userError: null });
    try {
      
      await request('/api/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });

      await get().bootstrapAuth();
      set({ isLoadingLogin: false });
      // Check final status after bootstrap
      const finalStatus = get().authStatus;
      
      if (finalStatus !== 'authenticated') {
        set({ loginError: 'Login successful but user data could not be loaded' });
        return false;
      }

      return true;
    } catch (error: any) {

      set({ loginError: error?.message || 'Login failed', isLoadingLogin: false, userError: null });
      return false;
    }
  },

  // Register flow
  register: async (
    payload: {
      username: string;
      password: string;
      email: string;
      first_name: string;
      last_name: string;
    }
  ): Promise<boolean> => {
    const { isLoadingRegister } = get();
    if (isLoadingRegister) return false;

    set({ isLoadingRegister: true, registerError: null, userError: null });
    try {
      await request('/api/auth/register/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      set({ isLoadingRegister: false });
      return true;
    } catch (error: any) {
      set({ registerError: error?.message || 'Registration failed', isLoadingRegister: false, userError: null });
      return false;
    }
  },

  logout: async () => {
    try {
      await request('/api/auth/logout/', { method: 'POST' });
    } catch (_) {
      // 
    }
    set({ 
      user: null, 
      authStatus: 'unauthenticated', 
      authInitialized: true,
      userError: null,
      loginError: null,
      registerError: null,
      isLoadingLogin: false,
      isLoadingRegister: false
    });

    // Clear cross-slice collections to avoid showing previous user's data
    try {
      const stateAny = get() as any;
      if (typeof stateAny.clearAgents === 'function') stateAny.clearAgents();
      if (typeof stateAny.clearAllConversations === 'function') stateAny.clearAllConversations();
      if (typeof stateAny.clearAllMessages === 'function') stateAny.clearAllMessages();
      if (typeof stateAny.clearConnections === 'function') stateAny.clearConnections();
      if (typeof stateAny.clearAgentDetails === 'function') stateAny.clearAgentDetails();
    } catch (_) {
      // 
    }
  },
});