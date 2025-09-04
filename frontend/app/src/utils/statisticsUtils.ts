// Types
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

// Basic utility functions
export const formatDuration = (ms: number): string => {
  if (!Number.isFinite(ms) || ms < 0) return '-';
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
};

export const safeDate = (d: string) => new Date(d);
export const wordCount = (t: string) => (t?.trim() ? t.trim().split(/\s+/).length : 0);
export const charCount = (t: string) => (t ? t.length : 0);

// Statistical helper functions
export const median = (arr: number[]) => {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  return sorted.length % 2 
    ? sorted[(sorted.length - 1) / 2] 
    : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
};

export const average = (arr: number[]) => {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
};

// Conversation statistics
export const getConversationsByDay = (conversations: Conversation[]) => {
  const map = new Map<string, number>();
  for (const c of conversations) {
    const d = safeDate(c.created_at);
    const key = d.toISOString().slice(0, 10);
    map.set(key, (map.get(key) || 0) + 1);
  }
  return map;
};

// Message statistics
export const getMessageStats = (messages: Message[]) => {
  const totalMessages = messages.length;
  let totalWords = 0;
  let totalChars = 0;
  let userCount = 0;
  let assistantCount = 0;

  const wordsPerMsg: number[] = [];
  const charsPerMsg: number[] = [];

  for (const m of messages) {
    const w = wordCount(m.content);
    const ch = charCount(m.content);
    totalWords += w;
    totalChars += ch;
    wordsPerMsg.push(w);
    charsPerMsg.push(ch);
    if (m.sender_type === 'user') userCount += 1;
    else if (m.sender_type === 'assistant') assistantCount += 1;
  }

  const avgWords = totalMessages ? totalWords / totalMessages : 0;
  const avgChars = totalMessages ? totalChars / totalMessages : 0;

  const sortedWords = [...wordsPerMsg].sort((a, b) => a - b);
  const sortedChars = [...charsPerMsg].sort((a, b) => a - b);

  return {
    totalMessages,
    totalWords,
    totalChars,
    avgWords,
    avgChars,
    medianWords: median(sortedWords),
    medianChars: median(sortedChars),
    userCount,
    assistantCount,
  };
};

// Activity analysis
export const getActivityMaps = (messages: Message[], conversations: Conversation[]) => {
  const weekday = new Map<string, number>();
  const hour = new Map<number, number>();
  const source = messages.length ? messages : conversations;
  const getDate = (item: any) => safeDate(item.created_at);
  
  for (const it of source) {
    const d = getDate(it);
    // getUTCDay returns 0..6 (Sun..Sat). Use local day for display consistency.
    const day = d.toLocaleString(undefined, { weekday: 'short' });
    const h = d.getHours();
    weekday.set(day, (weekday.get(day) || 0) + 1);
    hour.set(h, (hour.get(h) || 0) + 1);
  }
  
  // Ensure all 24 hours exist
  for (let h = 0; h < 24; h++) if (!hour.has(h)) hour.set(h, 0);
  
  return { weekdayMap: weekday, hourMap: hour };
};

// Response time analysis
export const getResponseTimeStats = (conversations: Conversation[], messagesByConversation: Record<string, Message[]>) => {
  type Pair = { deltaMs: number };
  const pairs: Pair[] = [];
  
  for (const c of conversations) {
    const list = ((messagesByConversation?.[c.id] || []) as Message[])
      .slice()
      .sort((a, b) => safeDate(a.created_at).getTime() - safeDate(b.created_at).getTime());
    
    let lastUserAt: number | null = null;
    for (const m of list) {
      const t = safeDate(m.created_at).getTime();
      if (m.sender_type === 'user') {
        lastUserAt = t;
      } else if (m.sender_type === 'assistant' && lastUserAt != null) {
        const delta = t - lastUserAt;
        if (delta >= 0) pairs.push({ deltaMs: delta });
        lastUserAt = null; // only measure first assistant reply to a user message
      }
    }
  }
  
  const deltas = pairs.map((p) => p.deltaMs).sort((a, b) => a - b);
  const avg = deltas.length ? deltas.reduce((a, b) => a + b, 0) / deltas.length : 0;
  const min = deltas.length ? deltas[0] : 0;
  const max = deltas.length ? deltas[deltas.length - 1] : 0;
  const p50 = deltas.length ? (deltas.length % 2 ? deltas[(deltas.length - 1) / 2] : (deltas[deltas.length / 2 - 1] + deltas[deltas.length / 2]) / 2) : 0;
  const p90 = deltas.length ? deltas[Math.floor(deltas.length * 0.9) - 1 >= 0 ? Math.floor(deltas.length * 0.9) - 1 : 0] : 0;
  
  return { count: deltas.length, avg, min, max, p50, p90 };
};

// Conversation aggregation
export const getConversationAggregation = (conversations: Conversation[], messagesByConversation: Record<string, Message[]>) => {
  type Row = { id: string; msgCount: number; durationMs: number };
  const rows: Row[] = [];
  
  for (const c of conversations) {
    const list = ((messagesByConversation?.[c.id] || []) as Message[])
      .slice()
      .sort((a, b) => safeDate(a.created_at).getTime() - safeDate(b.created_at).getTime());
    
    const msgCount = list.length;
    const durationMs = msgCount 
      ? safeDate(list[list.length - 1].created_at).getTime() - safeDate(list[0].created_at).getTime() 
      : 0;
    
    rows.push({ id: c.id, msgCount, durationMs });
  }
  
  const msgCounts = rows.map((r) => r.msgCount).sort((a, b) => a - b);
  const durations = rows.map((r) => r.durationMs).sort((a, b) => a - b);
  
  const topByMsgs = rows.slice().sort((a, b) => b.msgCount - a.msgCount).slice(0, 3);
  const topByDuration = rows.slice().sort((a, b) => b.durationMs - a.durationMs).slice(0, 3);
  
  return {
    rows,
    avgMsgs: average(msgCounts),
    medMsgs: median(msgCounts),
    minMsgs: msgCounts[0] || 0,
    maxMsgs: msgCounts[msgCounts.length - 1] || 0,
    avgDuration: average(durations),
    medDuration: median(durations),
    minDuration: durations[0] || 0,
    maxDuration: durations[durations.length - 1] || 0,
    topByMsgs,
    topByDuration,
  };
};

// Data processing for charts
export const getWeekdayData = (weekdayMap: Map<string, number>) => {
  // Order weekdays Mon..Sun based on current locale short names
  const order = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const entries: Array<[string, number]> = [];
  
  // Map keys might be localized; attempt to map by first 3 letters
  const map = new Map<string, number>();
  weekdayMap.forEach((v, k) => map.set(k.slice(0, 3), (map.get(k.slice(0, 3)) || 0) + v));
  
  for (const d of order) entries.push([d, map.get(d) || 0]);
  return entries;
};

export const getHourData = (hourMap: Map<number, number>) => {
  const list: Array<[string, number]> = [];
  const hourGroups = new Map<string, number>();
  
  // 3 saatlik gruplar oluştur
  for (let i = 0; i < 24; i += 3) {
    const startHour = i;
    const endHour = i + 2;
    const groupKey = `${startHour.toString().padStart(2, '0')}:00-${endHour.toString().padStart(2, '0')}:59`;
    hourGroups.set(groupKey, 0);
  }
  
  // Saat verilerini gruplara dağıt
  for (const [hour, count] of hourMap.entries()) {
    const groupIndex = Math.floor(hour / 3);
    const startHour = groupIndex * 3;
    const endHour = startHour + 2;
    const groupKey = `${startHour.toString().padStart(2, '0')}:00-${endHour.toString().padStart(2, '0')}:59`;
    hourGroups.set(groupKey, (hourGroups.get(groupKey) || 0) + count);
  }
  
  // Grupları sırala ve listeye ekle
  const sorted = Array.from(hourGroups.entries()).sort((a, b) => {
    const aStart = parseInt(a[0].split(':')[0]);
    const bStart = parseInt(b[0].split(':')[0]);
    return aStart - bStart;
  });
  
  for (const [groupKey, count] of sorted) {
    if (count > 0) { // Sadece veri olan grupları göster
      list.push([groupKey, count]);
    }
  }
  
  return list;
};

export const getConversationsTrend = (conversationsByDay: Map<string, number>) => {
  const entries = Array.from(conversationsByDay.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  return entries as Array<[string, number]>;
};

export const getSourceBreakdown = (conversations: Conversation[]) => {
  const bySource = new Map<string, number>();
  const byType = new Map<string, number>();
  
  for (const c of conversations) {
    bySource.set(c.source, (bySource.get(c.source) || 0) + 1);
    byType.set(c.chat_type, (byType.get(c.chat_type) || 0) + 1);
  }
  
  return {
    source: Array.from(bySource.entries()).sort((a, b) => b[1] - a[1]),
    type: Array.from(byType.entries()).sort((a, b) => b[1] - a[1]),
  };
};

// Message processing
export const getFlattenedMessages = (conversations: Conversation[], messagesByConversation: Record<string, Message[]>) => {
  if (!Array.isArray(conversations) || conversations.length === 0) return [];
  
  const all: Message[] = [];
  for (const c of conversations) {
    const list = (messagesByConversation?.[c.id] || []) as Message[];
    if (Array.isArray(list) && list.length) all.push(...list);
  }
  
  // sort ascending by time
  return all.sort((a, b) => safeDate(a.created_at).getTime() - safeDate(b.created_at).getTime());
};
