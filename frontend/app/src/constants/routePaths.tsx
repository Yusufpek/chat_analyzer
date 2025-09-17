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
  analyzeMain: () => {
    return `/analyze`;
  },
  analyzeDashboard: () => {
    return `/analyze/dashboard`;
  },
  analyzeStatistics: () => {
    return `/analyze/statistics`;
  },
  analyzeSentiment: () => {
    return `/analyze/sentiment`;
  },
  analyzeConversations: () => {
    return `/analyze/conversations`;
  },
  analyzeConversationDetail: () => {
    return `/analyze/conversations`;
  },
  analyzeSettings: () => {
    return `/analyze/settings`;
  },
  navigate
};
