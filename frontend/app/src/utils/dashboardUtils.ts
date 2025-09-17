export type Conversation = {
  id: string;
  created_at: string;
  source: string;
  chat_type: string;
  status: string;
  agent_id: string;
  last_message: string | null;
};

export type Message = {
  id: string;
  content: string;
  created_at: string;
  sender_type: 'assistant' | 'user' | string;
  conversation: string;
};

export type AgentDetailsContent = {
  id: string;
  avatar_url: string | null;
  name: string;
  jotform_render_url?: string | null;
  total_conversations: number;
  total_messages: number;
  sentiment_score: number;
  total_sentiment_count: number;
  super_positive_count: number;
  positive_count: number;
  neutral_count: number;
  negative_count: number;
  super_negative_count: number;
};

export type AgentDetailsResponse = {
  status: 'SUCCESS' | 'FAIL';
  content: AgentDetailsContent;
  duration?: string;
};

export const formatDuration = (ms: number): string => {
  if (!Number.isFinite(ms) || ms < 0) return '-';
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
};

export const getConversationsByDay = (conversations: Conversation[]): Map<string, number> => {
  const map = new Map<string, number>();
  for (const c of conversations) {
    const d = new Date(c.created_at);
    const key = d.toISOString().slice(0, 10);
    map.set(key, (map.get(key) || 0) + 1);
  }
  return map;
};

export const getConversationsTrend = (conversationsByDay: Map<string, number>): Array<[string, number]> => {
  const entries = Array.from(conversationsByDay.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  return entries as Array<[string, number]>;
};

export const getChartData = (conversationsTrend: Array<[string, number]>) => {
  return conversationsTrend.map(([date, count]) => ({ 
    conversations: count, 
    date: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }));
};

export const getWeekdayData = (conversations: Conversation[]): Array<[string, number]> => {
  const weekday = new Map<string, number>();
  for (const c of conversations) {
    const d = new Date(c.created_at);
    const day = d.toLocaleString(undefined, { weekday: 'short' });
    weekday.set(day, (weekday.get(day) || 0) + 1);
  }
  const order = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const map = new Map<string, number>();
  weekday.forEach((v, k) => map.set(k.slice(0, 3), (map.get(k.slice(0, 3)) || 0) + v));
  return order.map((d) => [d, map.get(d) || 0]) as Array<[string, number]>;
};

export const getResponseTimeStats = (messages: Message[]) => {
  type Pair = { deltaMs: number };
  const pairs: Pair[] = [];
  const byConv = new Map<string, Message[]>();
  
  // Group messages by conversation
  for (const m of messages) {
    const list = byConv.get(m.conversation) || [];
    list.push(m);
    byConv.set(m.conversation, list);
  }
  
  // Calculate response times
  for (const [, listRaw] of byConv.entries()) {
    const list = listRaw.slice().sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    let lastUserAt: number | null = null;
    for (const m of list) {
      const t = new Date(m.created_at).getTime();
      if (m.sender_type === 'user') {
        lastUserAt = t;
      } else if (m.sender_type === 'assistant' && lastUserAt != null) {
        const delta = t - lastUserAt;
        if (delta >= 0) pairs.push({ deltaMs: delta });
        lastUserAt = null;
      }
    }
  }
  
  const deltas = pairs.map((p) => p.deltaMs).sort((a, b) => a - b);
  const avg = deltas.length ? deltas.reduce((a, b) => a + b, 0) / deltas.length : 0;
  const p50 = deltas.length ? (deltas.length % 2 ? deltas[(deltas.length - 1) / 2] : (deltas[deltas.length / 2 - 1] + deltas[deltas.length / 2]) / 2) : 0;
  const p90 = deltas.length ? deltas[Math.max(Math.floor(deltas.length * 0.9) - 1, 0)] : 0;
  const min = deltas.length ? deltas[0] : 0;
  const max = deltas.length ? deltas[deltas.length - 1] : 0;
  
  return { count: deltas.length, avg, p50, p90, min, max };
};

export const getSentimentTotals = (details: AgentDetailsContent | null) => {
  const total = details?.total_sentiment_count || 0;
  const superPositive = details?.super_positive_count || 0;
  const positive = details?.positive_count || 0;
  const neutral = details?.neutral_count || 0;
  const negative = details?.negative_count || 0;
  const superNegative = details?.super_negative_count || 0;
  const combinedPositive = superPositive + positive;
  const combinedNegative = superNegative + negative;
  
  const pct = (v: number) => (total ? Math.round((v / total) * 100) : 0);
  
  return {
    total,
    superPositive,
    positive,
    neutral,
    negative,
    superNegative,
    positiveCombined: combinedPositive,
    negativeCombined: combinedNegative,
    superPositivePct: pct(superPositive),
    positivePct: pct(positive),
    neutralPct: pct(neutral),
    negativePct: pct(negative),
    superNegativePct: pct(superNegative),
  };
};

export const getAllMessages = (conversations: Conversation[], messagesByConversation: Record<string, Message[]>) => {
  if (!Array.isArray(conversations) || conversations.length === 0) return [];
  
  const all: Message[] = [];
  for (const c of conversations) {
    const list = (messagesByConversation?.[c.id] || []) as Message[];
    if (Array.isArray(list) && list.length) all.push(...list);
  }
  
  return all.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
};

export const getAgentName = (agents: any[], agentId: string) => {
  return agents?.find((a: any) => a.id === agentId)?.name || 'Unknown';
};
