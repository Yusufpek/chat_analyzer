import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Flex, HStack, SimpleGrid, Text, VStack, Badge } from '@chakra-ui/react';
import { useStore } from '@store/index';

type Conversation = {
  id: string;
  created_at: string;
  source: string;
  chat_type: string;
  status: string;
  agent_id: string;
  last_message: string | null;
};

type Message = {
  id: string;
  content: string;
  created_at: string;
  sender_type: 'assistant' | 'user' | string;
  conversation: string;
};

const formatDuration = (ms: number): string => {
  if (!Number.isFinite(ms) || ms < 0) return '-';
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
};

const safeDate = (d: string) => new Date(d);
const wordCount = (t: string) => (t?.trim() ? t.trim().split(/\s+/).length : 0);
const charCount = (t: string) => (t ? t.length : 0);

const AnalyzeStatistics = () => {
  const { agentId } = useParams();

  const agents = useStore((s: any) => s.agents);
  const conversationsByAgent = useStore((s: any) => s.conversationsByAgent);
  const fetchConversationsIfNeeded = useStore((s: any) => s.fetchConversationsIfNeeded);
  const isLoadingConversations = useStore((s: any) => s.isLoadingConversations);

  const messagesByConversation = useStore((s: any) => s.messagesByConversation);
  const fetchMessagesForConversation = useStore((s: any) => s.fetchMessagesForConversation);
  const isLoadingMessages = useStore((s: any) => s.isLoadingMessages);

  const agent = useMemo(() => {
    if (!agentId) return null;
    return Array.isArray(agents) ? agents.find((a: any) => String(a.id) === String(agentId)) : null;
  }, [agents, agentId]);

  const conversations: Conversation[] = useMemo(() => {
    if (!agentId) return [] as Conversation[];
    const list = (conversationsByAgent?.[agentId] || []) as Conversation[];
    return Array.isArray(list) ? list : [];
  }, [agentId, conversationsByAgent]);

  useEffect(() => {
    if (!agentId) return;
    if (fetchConversationsIfNeeded) fetchConversationsIfNeeded(agentId);
  }, [agentId, fetchConversationsIfNeeded]);

  // Ensure messages are loaded for each conversation (sequential to respect global loading flag)
  useEffect(() => {
    if (!Array.isArray(conversations) || conversations.length === 0) return;
    let cancelled = false;
    const load = async () => {
      for (const c of conversations) {
        if (cancelled) break;
        const has = Array.isArray(messagesByConversation?.[c.id]);
        if (!has) {
          // sequentially await to avoid skipping due to global isLoadingMessages flag
          try {
            // eslint-disable-next-line no-await-in-loop
            await fetchMessagesForConversation(c.id);
          } catch {}
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations.map((c) => c.id).join('|')]);

  // Flatten loaded messages for this agent's conversations
  const messages: Message[] = useMemo(() => {
    if (!Array.isArray(conversations) || conversations.length === 0) return [];
    const all: Message[] = [];
    for (const c of conversations) {
      const list = (messagesByConversation?.[c.id] || []) as Message[];
      if (Array.isArray(list) && list.length) all.push(...list);
    }
    // sort ascending by time
    return all.sort((a, b) => safeDate(a.created_at).getTime() - safeDate(b.created_at).getTime());
  }, [conversations, messagesByConversation]);

  // Conversation-level quick stats
  const conversationsByDay = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of conversations) {
      const d = safeDate(c.created_at);
      const key = d.toISOString().slice(0, 10);
      map.set(key, (map.get(key) || 0) + 1);
    }
    return map;
  }, [conversations]);

  // Message-level stats
  const messageStats = useMemo(() => {
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
    const median = (arr: number[]) => (arr.length ? (arr.length % 2 ? arr[(arr.length - 1) / 2] : (arr[arr.length / 2 - 1] + arr[arr.length / 2]) / 2) : 0);

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
  }, [messages]);

  // Active times by weekday and hour (prefer messages; fallback to conversations if no messages)
  const { weekdayMap, hourMap } = useMemo(() => {
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
  }, [messages, conversations]);

  // Response time stats (user -> assistant deltas)
  const responseTimeStats = useMemo(() => {
    type Pair = { deltaMs: number };
    const pairs: Pair[] = [];
    for (const c of conversations) {
      const list = ((messagesByConversation?.[c.id] || []) as Message[]).slice().sort((a, b) => safeDate(a.created_at).getTime() - safeDate(b.created_at).getTime());
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
  }, [conversations, messagesByConversation]);

  // Conversation message counts and durations
  const conversationAggregation = useMemo(() => {
    type Row = { id: string; msgCount: number; durationMs: number };
    const rows: Row[] = [];
    for (const c of conversations) {
      const list = ((messagesByConversation?.[c.id] || []) as Message[]).slice().sort((a, b) => safeDate(a.created_at).getTime() - safeDate(b.created_at).getTime());
      const msgCount = list.length;
      const durationMs = msgCount ? safeDate(list[list.length - 1].created_at).getTime() - safeDate(list[0].created_at).getTime() : 0;
      rows.push({ id: c.id, msgCount, durationMs });
    }
    const msgCounts = rows.map((r) => r.msgCount).sort((a, b) => a - b);
    const durations = rows.map((r) => r.durationMs).sort((a, b) => a - b);
    const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
    const med = (arr: number[]) => (arr.length ? (arr.length % 2 ? arr[(arr.length - 1) / 2] : (arr[arr.length / 2 - 1] + arr[arr.length / 2]) / 2) : 0);
    const topByMsgs = rows.slice().sort((a, b) => b.msgCount - a.msgCount).slice(0, 3);
    const topByDuration = rows.slice().sort((a, b) => b.durationMs - a.durationMs).slice(0, 3);
    return {
      rows,
      avgMsgs: avg(msgCounts),
      medMsgs: med(msgCounts),
      minMsgs: msgCounts[0] || 0,
      maxMsgs: msgCounts[msgCounts.length - 1] || 0,
      avgDuration: avg(durations),
      medDuration: med(durations),
      minDuration: durations[0] || 0,
      maxDuration: durations[durations.length - 1] || 0,
      topByMsgs,
      topByDuration,
    };
  }, [conversations, messagesByConversation]);

  // Render helpers
  const StatCard = ({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) => (
    <Box p={4} bg="#FFFFFF" border="1px solid" className="ca-border-gray" borderRadius="md">
      <Text className="ca-color-quaternary" fontSize="xs">{label}</Text>
      <Text className="ca-color-primary" fontSize="xl" fontWeight="bold">{value}</Text>
      {hint ? <Text className="ca-color-quinary" fontSize="xs">{hint}</Text> : null}
    </Box>
  );

  const BarList = ({ data, unit }: { data: Array<[string, number]>; unit?: string }) => {
    const max = data.reduce((m, [, v]) => Math.max(m, v), 0) || 1;
    return (
      <VStack align="stretch" gap={2}>
        {data.map(([label, v]) => (
          <HStack key={label} gap={3} align="center">
            <Box minW="72px">
              <Text className="ca-color-primary" fontSize="xs">{label}</Text>
            </Box>
            <Box flex={1} h="10px" bg="#E1DFE0" borderRadius="6px" overflow="hidden">
              <Box h="100%" bg="#621CB1" style={{ width: `${(v / max) * 100}%` }} />
            </Box>
            <Box minW="48px" textAlign="right">
              <Text className="ca-color-quaternary" fontSize="xs">{v}{unit ? ` ${unit}` : ''}</Text>
            </Box>
          </HStack>
        ))}
      </VStack>
    );
  };

  const weekdayData = useMemo(() => {
    // Order weekdays Mon..Sun based on current locale short names
    const order = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const entries: Array<[string, number]> = [];
    // Map keys might be localized; attempt to map by first 3 letters
    const map = new Map<string, number>();
    weekdayMap.forEach((v, k) => map.set(k.slice(0, 3), (map.get(k.slice(0, 3)) || 0) + v));
    for (const d of order) entries.push([d, map.get(d) || 0]);
    return entries;
  }, [weekdayMap]);

  const hourData = useMemo(() => {
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
  }, [hourMap]);

  const conversationsTrend = useMemo(() => {
    const entries = Array.from(conversationsByDay.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    return entries as Array<[string, number]>;
  }, [conversationsByDay]);

  const sourceBreakdown = useMemo(() => {
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
  }, [conversations]);

  return (
    <Box p={6} minH="100%" bg="#FFF6FF">
      <VStack align="stretch" gap={6}>
        <HStack justify="space-between" align="center">
          <VStack align="start" gap={0}>
            <Text className="ca-color-primary" fontSize="2xl" fontWeight="bold">
              Analyze Statistics
            </Text>
            <HStack gap={2}>
              <Text className="ca-color-quaternary" fontSize="sm">
                Agent:
              </Text>
              <Badge colorScheme="purple" variant="subtle">
                {agent?.name || agentId || 'Unknown'}
              </Badge>
            </HStack>
          </VStack>
          <HStack gap={3}>
            {isLoadingConversations || isLoadingMessages ? (
              <Text className="ca-color-quaternary" fontSize="xs">Loading data…</Text>
            ) : null}
            <Text className="ca-color-quinary" fontSize="xs">
              {conversations.length} conversations, {messageStats.totalMessages} messages
            </Text>
          </HStack>
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 3, lg: 4 }} gap={4}>
          <Box _hover={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}>
            <StatCard label="Total Conversations" value={conversations.length} />
          </Box>
          <Box _hover={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}>
            <StatCard label="Total Messages" value={messageStats.totalMessages} />
          </Box>
          <Box _hover={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}>
            <StatCard label="User Messages" value={messageStats.userCount} />
          </Box>
          <Box _hover={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}>
            <StatCard label="Assistant Messages" value={messageStats.assistantCount} />
          </Box>
          <Box _hover={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}>
            <StatCard label="Total Words" value={messageStats.totalWords} />
          </Box>
          <Box _hover={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}>
            <StatCard label="Total Characters" value={messageStats.totalChars} />
          </Box>
          <Box _hover={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}>
            <StatCard label="Avg Words / Msg" value={messageStats.avgWords.toFixed(1)} />
          </Box>
          <Box _hover={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}>
            <StatCard label="Avg Chars / Msg" value={messageStats.avgChars.toFixed(1)} />
          </Box>
          <Box _hover={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}>
            <StatCard label="Median Words / Msg" value={messageStats.medianWords} />
          </Box>
          <Box _hover={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}>
            <StatCard label="Median Chars / Msg" value={messageStats.medianChars} />
          </Box>
          <Box _hover={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}>
            <StatCard label="Avg Msgs / Conversation" value={conversationAggregation.avgMsgs.toFixed(1)} />
          </Box>
          <Box _hover={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}>
            <StatCard label="Median Msgs / Conversation" value={conversationAggregation.medMsgs} />
          </Box>
        </SimpleGrid>

        <Box>
          <Text className="ca-color-primary" fontSize="lg" fontWeight="bold" mb={3}>Activity</Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
            <Box p={6} bg="#FFFFFF" border="1px solid" className="ca-border-gray" borderRadius="lg" _hover={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }} transition="all 0.2s ease-in-out">
              <HStack mb={4} align="center">
                <Box w={3} h={3} bg="blue.400" borderRadius="full" />
                <Text className="ca-color-quaternary" fontSize="md" fontWeight="semibold">Most Active Weekdays</Text>
              </HStack>
              <VStack align="stretch" gap={2}>
                {weekdayData.map((item, index) => (
                  <HStack key={item[0]} justify="space-between" p={3} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.100">
                    <HStack gap={3}>
                      <Badge variant="solid" colorScheme="blue" borderRadius="full" px={2}>
                        #{index + 1}
                      </Badge>
                      <Text className="ca-color-primary" fontSize="sm" fontWeight="medium">
                        {item[0]}
                      </Text>
                    </HStack>
                    <Badge variant="subtle" colorScheme="blue" fontSize="sm" px={3} py={1}>
                      {item[1]} conversations
                    </Badge>
                  </HStack>
                ))}
                {!weekdayData.length ? (
                  <Box p={4} textAlign="center">
                    <Text className="ca-color-quaternary" fontSize="sm">No weekday data available</Text>
                  </Box>
                ) : null}
              </VStack>
            </Box>
            <Box p={6} bg="#FFFFFF" border="1px solid" className="ca-border-gray" borderRadius="lg" _hover={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }} transition="all 0.2s ease-in-out">
              <HStack mb={4} align="center">
                <Box w={3} h={3} bg="green.400" borderRadius="full" />
                <Text className="ca-color-quaternary" fontSize="md" fontWeight="semibold">Active Hours (local)</Text>
              </HStack>
              <VStack align="stretch" gap={2}>
                {hourData.map((item, index) => (
                  <HStack key={item[0]} justify="space-between" p={3} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.100">
                    <HStack gap={3}>
                      <Badge variant="solid" colorScheme="green" borderRadius="full" px={2}>
                        #{index + 1}
                      </Badge>
                      <Text className="ca-color-primary" fontSize="sm" fontWeight="medium">
                        {item[0]}
                      </Text>
                    </HStack>
                    <Badge variant="subtle" colorScheme="green" fontSize="sm" px={3} py={1}>
                      {item[1]} conversations
                    </Badge>
                  </HStack>
                ))}
                {!hourData.length ? (
                  <Box p={4} textAlign="center">
                    <Text className="ca-color-quaternary" fontSize="sm">No hour data available</Text>
                  </Box>
                ) : null}
              </VStack>
            </Box>
          </SimpleGrid>
        </Box>

        <Box>
          <Text className="ca-color-primary" fontSize="lg" fontWeight="bold" mb={3}>Conversation Trends</Text>
          <Box p={6} bg="#FFFFFF" border="1px solid" className="ca-border-gray" borderRadius="lg" _hover={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }} transition="all 0.2s ease-in-out">
            <HStack mb={4} align="center">
              <Box w={3} h={3} bg="purple.400" borderRadius="full" />
              <Text className="ca-color-quaternary" fontSize="md" fontWeight="semibold">Conversations by Date</Text>
            </HStack>
            {conversationsTrend.length ? (
              <VStack align="stretch" gap={2}>
                {conversationsTrend.map((item, index) => (
                  <HStack key={item[0]} justify="space-between" p={3} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.100">
                    <HStack gap={3}>
                      <Badge variant="solid" colorScheme="purple" borderRadius="full" px={2}>
                        #{index + 1}
                      </Badge>
                      <Text className="ca-color-primary" fontSize="sm" fontWeight="medium">
                        {item[0]}
                      </Text>
                    </HStack>
                    <Badge variant="subtle" colorScheme="purple" fontSize="sm" px={3} py={1}>
                      {item[1]} conversations
                    </Badge>
                  </HStack>
                ))}
              </VStack>
            ) : (
              <Box p={4} textAlign="center">
                <Text className="ca-color-quaternary" fontSize="sm">No conversation data</Text>
              </Box>
            )}
          </Box>
        </Box>

        <Box>
          <Text className="ca-color-primary" fontSize="lg" fontWeight="bold" mb={3}>Response Times</Text>
          <SimpleGrid columns={{ base: 1, md: 3, lg: 5 }} gap={4}>
            <Box _hover={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}>
            <StatCard label="Samples" value={responseTimeStats.count} />
            </Box>
            <Box _hover={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}>
            <StatCard label="Average" value={formatDuration(responseTimeStats.avg)} />
            </Box>
            <Box _hover={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}>
            <StatCard label="Median" value={formatDuration(responseTimeStats.p50)} />
            </Box>
            <Box _hover={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}>
            <StatCard label="P90" value={formatDuration(responseTimeStats.p90)} />
            </Box>
            <Box _hover={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}>
            <StatCard label="Min / Max" value={`${formatDuration(responseTimeStats.min)} / ${formatDuration(responseTimeStats.max)}`} />
            </Box>
          </SimpleGrid>
        </Box>

        <Box>
          <Text className="ca-color-primary" fontSize="lg" fontWeight="bold" mb={4}>Conversation Details</Text>
          <VStack gap={4} align="stretch">
            <Box 
              p={6} 
              bg="#FFFFFF" 
              border="1px solid" 
              className="ca-border-gray" 
              borderRadius="lg"
              boxShadow="0 2px 8px rgba(0, 0, 0, 0.06)"
              _hover={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}
              transition="all 0.2s ease-in-out"
            >
              <HStack mb={3} align="center">
                <Box w={3} h={3} bg="purple.400" borderRadius="full" />
                <Text className="ca-color-quaternary" fontSize="md" fontWeight="semibold">Messages per Conversation</Text>
              </HStack>
              <SimpleGrid columns={{ base: 2, md: 4 }} gap={3}>
                <VStack align="start" gap={1}>
                  <Text className="ca-color-quaternary" fontSize="xs" textTransform="uppercase" letterSpacing="wide">Average</Text>
                  <Text className="ca-color-primary" fontSize="lg" fontWeight="bold">{conversationAggregation.avgMsgs.toFixed(1)}</Text>
                </VStack>
                <VStack align="start" gap={1}>
                  <Text className="ca-color-quaternary" fontSize="xs" textTransform="uppercase" letterSpacing="wide">Median</Text>
                  <Text className="ca-color-primary" fontSize="lg" fontWeight="bold">{conversationAggregation.medMsgs}</Text>
                </VStack>
                <VStack align="start" gap={1}>
                  <Text className="ca-color-quaternary" fontSize="xs" textTransform="uppercase" letterSpacing="wide">Min</Text>
                  <Text className="ca-color-primary" fontSize="lg" fontWeight="bold">{conversationAggregation.minMsgs}</Text>
                </VStack>
                <VStack align="start" gap={1}>
                  <Text className="ca-color-quaternary" fontSize="xs" textTransform="uppercase" letterSpacing="wide">Max</Text>
                  <Text className="ca-color-primary" fontSize="lg" fontWeight="bold">{conversationAggregation.maxMsgs}</Text>
                </VStack>
              </SimpleGrid>
            </Box>

            <Box 
              p={6} 
              bg="#FFFFFF" 
              border="1px solid" 
              className="ca-border-gray" 
              borderRadius="lg"
              boxShadow="0 2px 8px rgba(0, 0, 0, 0.06)"
              _hover={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}
              transition="all 0.2s ease-in-out"
            >
              <HStack mb={3} align="center">
                <Box w={3} h={3} bg="blue.400" borderRadius="full" />
                <Text className="ca-color-quaternary" fontSize="md" fontWeight="semibold">Conversation Duration</Text>
              </HStack>
              <SimpleGrid columns={{ base: 2, md: 4 }} gap={3}>
                <VStack align="start" gap={1}>
                  <Text className="ca-color-quaternary" fontSize="xs" textTransform="uppercase" letterSpacing="wide">Average</Text>
                  <Text className="ca-color-primary" fontSize="lg" fontWeight="bold">{formatDuration(conversationAggregation.avgDuration)}</Text>
                </VStack>
                <VStack align="start" gap={1}>
                  <Text className="ca-color-quaternary" fontSize="xs" textTransform="uppercase" letterSpacing="wide">Median</Text>
                  <Text className="ca-color-primary" fontSize="lg" fontWeight="bold">{formatDuration(conversationAggregation.medDuration)}</Text>
                </VStack>
                <VStack align="start" gap={1}>
                  <Text className="ca-color-quaternary" fontSize="xs" textTransform="uppercase" letterSpacing="wide">Min</Text>
                  <Text className="ca-color-primary" fontSize="lg" fontWeight="bold">{formatDuration(conversationAggregation.minDuration)}</Text>
                </VStack>
                <VStack align="start" gap={1}>
                  <Text className="ca-color-quaternary" fontSize="xs" textTransform="uppercase" letterSpacing="wide">Max</Text>
                  <Text className="ca-color-primary" fontSize="lg" fontWeight="bold">{formatDuration(conversationAggregation.maxDuration)}</Text>
                </VStack>
              </SimpleGrid>
            </Box>

            <Box 
              p={6} 
              bg="#FFFFFF" 
              border="1px solid" 
              className="ca-border-gray" 
              borderRadius="lg"
              boxShadow="0 2px 8px rgba(0, 0, 0, 0.06)"
              _hover={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}
              transition="all 0.2s ease-in-out"
            >
              <HStack mb={4} align="center">
                <Box w={3} h={3} bg="green.400" borderRadius="full" />
                <Text className="ca-color-quaternary" fontSize="md" fontWeight="semibold">Top Conversations by Messages</Text>
              </HStack>
              <VStack align="stretch" gap={3}>
                {conversationAggregation.topByMsgs.map((r, index) => (
                  <HStack 
                    key={r.id} 
                    justify="space-between" 
                    p={3} 
                    bg="gray.50" 
                    borderRadius="md"
                    border="1px solid"
                    borderColor="gray.100"
                  >
                    <HStack gap={3}>
                      <Badge variant="solid" colorScheme="purple" borderRadius="full" px={2}>
                        #{index + 1}
                      </Badge>
                      <Text className="ca-color-primary" fontSize="sm" fontWeight="medium" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                        {r.id}
                      </Text>
                    </HStack>
                    <Badge variant="subtle" colorScheme="purple" fontSize="sm" px={3} py={1}>
                      {r.msgCount} messages
                    </Badge>
                  </HStack>
                ))}
                {!conversationAggregation.topByMsgs.length ? (
                  <Box p={4} textAlign="center">
                    <Text className="ca-color-quaternary" fontSize="sm">No conversation data available</Text>
                  </Box>
                ) : null}
              </VStack>
            </Box>

            <Box 
              p={6} 
              bg="#FFFFFF" 
              border="1px solid" 
              className="ca-border-gray" 
              borderRadius="lg"
              boxShadow="0 2px 8px rgba(0, 0, 0, 0.06)"
              _hover={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}
              transition="all 0.2s ease-in-out"
            >
              <HStack mb={4} align="center">
                <Box w={3} h={3} bg="orange.400" borderRadius="full" />
                <Text className="ca-color-quaternary" fontSize="md" fontWeight="semibold">Top Conversations by Duration</Text>
              </HStack>
              <VStack align="stretch" gap={3}>
                {conversationAggregation.topByDuration.map((r, index) => (
                  <HStack 
                    key={r.id} 
                    justify="space-between" 
                    p={3} 
                    bg="gray.50" 
                    borderRadius="md"
                    border="1px solid"
                    borderColor="gray.100"
                  >
                    <HStack gap={3}>
                      <Badge variant="solid" colorScheme="orange" borderRadius="full" px={2}>
                        #{index + 1}
                      </Badge>
                      <Text className="ca-color-primary" fontSize="sm" fontWeight="medium" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                        {r.id}
                      </Text>
                    </HStack>
                    <Badge variant="subtle" colorScheme="orange" fontSize="sm" px={3} py={1}>
                      {formatDuration(r.durationMs)}
                    </Badge>
                  </HStack>
                ))}
                {!conversationAggregation.topByDuration.length ? (
                  <Box p={4} textAlign="center">
                    <Text className="ca-color-quaternary" fontSize="sm">No conversation data available</Text>
                  </Box>
                ) : null}
              </VStack>
            </Box>
          </VStack>
        </Box>

        <Box>
          <Text className="ca-color-primary" fontSize="lg" fontWeight="bold" mb={3}>Breakdown</Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
            <Box p={6} bg="#FFFFFF" border="1px solid" className="ca-border-gray" borderRadius="lg" _hover={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }} transition="all 0.2s ease-in-out">
              <HStack mb={4} align="center">
                <Box w={3} h={3} bg="teal.400" borderRadius="full" />
                <Text className="ca-color-quaternary" fontSize="md" fontWeight="semibold">By Source</Text>
              </HStack>
              <VStack align="stretch" gap={2}>
                {sourceBreakdown.source.map((item, index) => (
                  <HStack key={item[0]} justify="space-between" p={3} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.100">
                    <HStack gap={3}>
                      <Badge variant="solid" colorScheme="teal" borderRadius="full" px={2}>
                        #{index + 1}
                      </Badge>
                      <Text className="ca-color-primary" fontSize="sm" fontWeight="medium">
                        {item[0]}
                      </Text>
                    </HStack>
                    <Badge variant="subtle" colorScheme="teal" fontSize="sm" px={3} py={1}>
                      {item[1]} conversations
                    </Badge>
                  </HStack>
                ))}
                {!sourceBreakdown.source.length ? (
                  <Box p={4} textAlign="center">
                    <Text className="ca-color-quaternary" fontSize="sm">No source data available</Text>
                  </Box>
                ) : null}
              </VStack>
            </Box>
            <Box p={6} bg="#FFFFFF" border="1px solid" className="ca-border-gray" borderRadius="lg" _hover={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }} transition="all 0.2s ease-in-out">
              <HStack mb={4} align="center">
                <Box w={3} h={3} bg="pink.400" borderRadius="full" />
                <Text className="ca-color-quaternary" fontSize="md" fontWeight="semibold">By Chat Type</Text>
              </HStack>
              <VStack align="stretch" gap={2}>
                {sourceBreakdown.type.map((item, index) => (
                  <HStack key={item[0]} justify="space-between" p={3} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.100">
                    <HStack gap={3}>
                      <Badge variant="solid" colorScheme="pink" borderRadius="full" px={2}>
                        #{index + 1}
                      </Badge>
                      <Text className="ca-color-primary" fontSize="sm" fontWeight="medium">
                        {item[0]}
                      </Text>
                    </HStack>
                    <Badge variant="subtle" colorScheme="pink" fontSize="sm" px={3} py={1}>
                      {item[1]} conversations
                    </Badge>
                  </HStack>
                ))}
                {!sourceBreakdown.type.length ? (
                  <Box p={4} textAlign="center">
                    <Text className="ca-color-quaternary" fontSize="sm">No chat type data available</Text>
                  </Box>
                ) : null}
              </VStack>
            </Box>
          </SimpleGrid>
        </Box>

        <Box h="1px" bg="#E1DFE0" />
        <Text className="ca-color-quinary" fontSize="xs">
          Notes: Message-level metrics are computed from loaded conversations. If you just opened this page, we load messages sequentially, so numbers may refine in a few seconds.
        </Text>
      </VStack>
    </Box>
  );
};

export default AnalyzeStatistics;
