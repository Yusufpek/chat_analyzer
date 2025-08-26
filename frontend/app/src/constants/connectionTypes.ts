export const CONNECTION_TYPES = {
  JOTFORM: 'jotform',
  CHATGPT: 'chatgpt',
  FILE: 'file',
} as const;

export type ConnectionType = typeof CONNECTION_TYPES[keyof typeof CONNECTION_TYPES];

export const CONNECTION_TYPE_LABELS: Record<ConnectionType, string> = {
  [CONNECTION_TYPES.JOTFORM]: 'JotForm',
  [CONNECTION_TYPES.CHATGPT]: 'ChatGPT',
  [CONNECTION_TYPES.FILE]: 'File',
};
