// Common utility functions for store slices

export const mergeEntitiesById = <T extends { id: string | number }>(
  current: T[],
  newItems: T[]
): T[] => {
  const mergedMap = new Map<string, T>();
  
  [...current, ...newItems].forEach((item) => {
    if (item?.id) {
      mergedMap.set(String(item.id), item);
    }
  });
  
  return Array.from(mergedMap.values());
};

export const sortByCreatedAt = <T extends { created_at: string }>(items: T[]): T[] => {
  return [...items].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
};

export const validateId = (id: string | number | undefined): boolean => {
  return Boolean(id && String(id).trim());
};

export const createErrorHandler = (setError: (error: string | null) => void) => {
  return (error: any, defaultMessage: string) => {
    const errorMessage = error?.message || defaultMessage;
    setError(errorMessage);
  };
};

// Type guards
export const isAgentItem = (item: any): item is { id: string; name: string; avatar_url: string | null; connection_type: string } => {
  return item && typeof item.id === 'string' && typeof item.name === 'string' && typeof item.connection_type === 'string';
};

export const isConversationItem = (item: any): item is {
  id: string;
  created_at: string;
  source: string;
  chat_type: string;
  status: string;
  agent_id: string;
  last_message: string | null;
} => {
  return item && 
    typeof item.id === 'string' && 
    typeof item.created_at === 'string' &&
    typeof item.agent_id === 'string';
};

export const isMessageItem = (item: any): item is {
  id: string;
  content: string;
  created_at: string;
  sender_type: string;
  conversation: string;
} => {
  return item && 
    typeof item.id === 'string' && 
    typeof item.content === 'string' &&
    typeof item.conversation === 'string';
};
