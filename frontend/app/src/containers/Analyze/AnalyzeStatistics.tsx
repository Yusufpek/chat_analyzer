import React, { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Box, HStack, SimpleGrid, Text, VStack, Badge } from '@chakra-ui/react';
import { useStore } from '@store/index';
import {
  type Conversation,
  type Message,
  formatDuration,
  safeDate,
  wordCount,
  charCount,
  getConversationsByDay,
  getMessageStats,
  getActivityMaps,
  getResponseTimeStats,
  getConversationAggregation,
  getWeekdayData,
  getHourData,
  getConversationsTrend,
  getSourceBreakdown,
  getFlattenedMessages,
} from '@utils/statisticsUtils';

const AnalyzeStatistics = () => {
  const { agentId } = useParams();

  const agents = useStore((s: any) => s.agents);
  const conversationsByAgent = useStore((s: any) => s.conversationsByAgent);
  const fetchConversations = useStore((s: any) => s.fetchConversations);
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
    if (fetchConversations) fetchConversations(agentId);
  }, [agentId, fetchConversations]);

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
    return getFlattenedMessages(conversations, messagesByConversation);
  }, [conversations, messagesByConversation]);

  // Conversation-level quick stats
  const conversationsByDay = useMemo(() => {
    return getConversationsByDay(conversations);
  }, [conversations]);

  // Message-level stats
  const messageStats = useMemo(() => {
    return getMessageStats(messages);
  }, [messages]);

  // Active times by weekday and hour (prefer messages; fallback to conversations if no messages)
  const { weekdayMap, hourMap } = useMemo(() => {
    return getActivityMaps(messages, conversations);
  }, [messages, conversations]);

  // Response time stats (user -> assistant deltas)
  const responseTimeStats = useMemo(() => {
    return getResponseTimeStats(conversations, messagesByConversation);
  }, [conversations, messagesByConversation]);

  // Conversation message counts and durations
  const conversationAggregation = useMemo(() => {
    return getConversationAggregation(conversations, messagesByConversation);
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
    return getWeekdayData(weekdayMap);
  }, [weekdayMap]);

  const hourData = useMemo(() => {
    return getHourData(hourMap);
  }, [hourMap]);

  const conversationsTrend = useMemo(() => {
    return getConversationsTrend(conversationsByDay);
  }, [conversationsByDay]);

  const sourceBreakdown = useMemo(() => {
    return getSourceBreakdown(conversations);
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
