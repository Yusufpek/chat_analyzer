export const navigate = (pathCallback: (...args: any[]) => string, ...args: any[]) => {

  const path = pathCallback(...args);
  const params = typeof window !== 'undefined' && window?.location?.search
    ? new URLSearchParams(window.location.search)
    : '';
  if (params) {
    return `${path}?${params}`;
  }
  return path;
};

export const routePaths = {
  apiRoute: () => {
    return '/API';
  },
  mainRoute: () => {
    return '/';
  },
  landing: () => {
    return '/';
  },
  login: () => {
    return '/login';
  },
  signup: () => {
    return '/signup';
  },
  about: () => {
    return '/about';
  },
  contact: () => {
    return '/contact';
  },
  profile: () => {
    return '/profile';
  },
  analyze: () => {
    return `/analyze`;
  },
  analyzeMain: (agentId: string = "") => {
    return `/analyze/${agentId}`;
  },
  analyzeDashboard: (agentId: string = "") => {
    return `/analyze/${agentId}/dashboard`;
  },
  analyzeStatistics: (agentId: string = "") => {
    return `/analyze/${agentId}/statistics`;
  },
  analyzeSentiment: (agentId: string = "") => {
    return `/analyze/${agentId}/sentiment`;
  },
  analyzeConversations: (agentId: string = "") => {
    return `/analyze/${agentId}/conversations`;
  },
  analyzeConversationDetail: (agentId: string = '', convId: string = '') => {
    return `/analyze/${agentId}/conversations/${convId}`;
  },
  navigate
};
