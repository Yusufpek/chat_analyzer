import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Text, 
  Grid, 
  GridItem, 
  Box, 
  VStack, 
  HStack,
  Badge,
  Spinner,
  Avatar,
  Flex
} from '@chakra-ui/react';
import { Chart, useChart } from "@chakra-ui/charts";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LineChart, Tooltip, Line } from "recharts";
import { useStore } from '@store/index';
import { CONNECTION_TYPE_LABELS } from '@constants/connectionTypes';
import {
  Conversation,
  Message,
  formatDuration,
  getConversationsByDay,
  getConversationsTrend,
  getChartData,
  getWeekdayData,
  getResponseTimeStats,
  getSentimentTotals,
  getAllMessages,
  getAgentName
} from '@utils/dashboardUtils';
import { request } from '@api/requestLayer';



const AnalyzeDashboard = () => {
  const agents = useStore((s: any) => s.agents);
  const navigate = useNavigate();
  const selectedConnectionType = useStore((s: any) => s.selectedConnectionType);
  const agentId = useStore((s: any) => s.selectedAgentId);

  // Store selectors
  const conversationsByAgent = useStore((s: any) => s.conversationsByAgent);
  const fetchConversations = useStore((s: any) => s.fetchConversations);
  const isLoadingConversations = useStore((s: any) => s.isLoadingConversations);

  const messagesByConversation = useStore((s: any) => s.messagesByConversation);
  const isLoadingMessages = useStore((s: any) => s.isLoadingMessages);

  // Agent details from store
  const agentDetails = useStore((s: any) => s.agentDetails);
  const fetchAgentDetails = useStore((s: any) => s.fetchAgentDetails);
  const isLoadingAgentDetails = useStore((s: any) => s.isLoadingAgentDetails);
  const agentDetailsError = useStore((s: any) => s.agentDetailsError);

  // Do NOT auto-fetch messages for dashboard to keep it light; show stats if already loaded

  useEffect(() => {
    if (!agentId) return;
    if (fetchConversations) fetchConversations(agentId);
    if (fetchAgentDetails) fetchAgentDetails(agentId);
  }, [agentId, fetchConversations, fetchAgentDetails]);

  const conversations: Conversation[] = useMemo(() => {
    if (!agentId) return [] as Conversation[];
    const list = (conversationsByAgent?.[agentId] || []) as Conversation[];
    return Array.isArray(list) ? list : [];
  }, [agentId, conversationsByAgent]);

  
  const messages: Message[] = useMemo(() => {
    return getAllMessages(conversations, messagesByConversation);
  }, [conversations, messagesByConversation]);

  
  const conversationsByDay = useMemo(() => {
    return getConversationsByDay(conversations);
  }, [conversations]);

  const conversationsTrend = useMemo(() => {
    return getConversationsTrend(conversationsByDay);
  }, [conversationsByDay]);

  const chartData = useMemo(() => {
    return getChartData(conversationsTrend);
  }, [conversationsTrend]);

  const conversationsChart = useChart({
    data: chartData,
    series: [{ name: "conversations", color: "tertiary" }],
  });

  const weekdayData = useMemo(() => {
    return getWeekdayData(conversations);
  }, [conversations]);

  // Response time stats
  const responseTimeStats = useMemo(() => {
    return getResponseTimeStats(messages);
  }, [messages]);

  // Get agent details from store
  const details = agentId ? agentDetails[agentId] || null : null;

  // Sentiment distribution from details
  const sentimentTotals = useMemo(() => {
    return getSentimentTotals(details);
  }, [details]);

  const agentName = useMemo(() => getAgentName(agents, agentId || ''), [agents, agentId]);

  const loadingAny = isLoadingAgentDetails || isLoadingConversations;

  // Grouped topics (qdrant grouped) state
  const [groupedTopics, setGroupedTopics] = useState<any[]>([]);
  const [isLoadingGrouped, setIsLoadingGrouped] = useState<boolean>(false);
  const [groupedError, setGroupedError] = useState<string | null>(null);
  const [openTopicIndexes, setOpenTopicIndexes] = useState<Set<number>>(new Set());

  const toggleTopic = (idx: number) => {
    setOpenTopicIndexes((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  useEffect(() => {
    let isCancelled = false;
    const fetchGrouped = async () => {
      if (!agentId) return;
      setIsLoadingGrouped(true);
      setGroupedError(null);
      try {
        const data = await request(`/api/analyze/qdrant_grouped/${agentId}`, { method: 'GET' });
        const content = Array.isArray(data?.content) ? data.content : [];
        if (!isCancelled) setGroupedTopics(content.slice(0, 3));
      } catch (e: any) {
        if (!isCancelled) setGroupedError(e?.message || 'Failed to load grouped topics');
      } finally {
        if (!isCancelled) setIsLoadingGrouped(false);
      }
    };
    fetchGrouped();
    return () => { isCancelled = true; };
  }, [agentId]);

  return (
    <Box 
      p={6} 
      className="ca-bg-light-pink" 
      minH="100%"
    >
      <VStack gap={6} align="stretch">
        {/* Header */}
        <Box>
          <Text className="ca-color-primary" fontSize="3xl" fontWeight="bold" mb={2}>
            Analyze Dashboard
          </Text>
          <HStack gap={2}>
              <Text className="ca-color-quaternary" fontSize="sm">
                Agent:
              </Text>
              <Badge colorScheme="purple" variant="subtle">
                {agentName}
              </Badge>
              <Text className="ca-color-quaternary" fontSize="sm">
                Type:
              </Text>
              <Badge colorScheme="teal" variant="subtle">
                {(() => {
                  const agent = agents?.find((a: any) => a.id === agentId);
                  const typeKey = (agent?.connection_type || selectedConnectionType) as keyof typeof CONNECTION_TYPE_LABELS;
                  return CONNECTION_TYPE_LABELS[typeKey] || 'Unknown';
                })()}
              </Badge>
              {loadingAny ? (
                <HStack gap={2}>
                  <Spinner size="xs" />
                  <Text className="ca-color-quaternary" fontSize="xs">Loading…</Text>
                </HStack>
              ) : null}
          </HStack>
        </Box>
      

        {/* Stats Cards */}
        <Grid templateColumns="repeat(4, 1fr)" gap={4}>
          <Box className="ca-bg-quaternary-opacity-20 ca-border-gray" p={4} borderRadius="lg" border="1px solid">
            <VStack align="start" gap={2}>
              <Text className="ca-color-quaternary" fontSize="sm" fontWeight="medium">
                Total Messages
              </Text>
              <Text className="ca-color-primary" fontSize="2xl" fontWeight="bold">
                {details ? details.total_messages : '-'}
              </Text>
              <HStack>
                <Text className="ca-color-quaternary" fontSize="xs">in {details ? details.total_conversations : '-'} conversations</Text>
              </HStack>
            </VStack>
          </Box>
          
          <Box className="ca-bg-quaternary-opacity-20 ca-border-gray" p={4} borderRadius="lg" border="1px solid">
            <VStack align="start" gap={2}>
              <Text className="ca-color-quaternary" fontSize="sm" fontWeight="medium">
                Positive Sentiment
              </Text>
              <Text className="ca-color-green" fontSize="2xl" fontWeight="bold">
                {details ? ((sentimentTotals.positivePct) + '%') : '-'}
              </Text>
              <HStack>
                <Text className="ca-color-quaternary" fontSize="xs">{details ? `${sentimentTotals.positive} positive of ${sentimentTotals.total}` : ''}</Text>
              </HStack>
            </VStack>
          </Box>
          
          <Box className="ca-bg-quaternary-opacity-20 ca-border-gray" p={4} borderRadius="lg" border="1px solid">
            <VStack align="start" gap={2}>
              <Text className="ca-color-quaternary" fontSize="sm" fontWeight="medium">
                Average Response Time
              </Text>
              <Text className="ca-color-primary" fontSize="2xl" fontWeight="bold">
                {messages.length ? formatDuration(responseTimeStats.avg) : '-'}
              </Text>
              <HStack>
                <Text className="ca-color-quaternary" fontSize="xs">based on {responseTimeStats.count} samples</Text>
              </HStack>
            </VStack>
          </Box>
          
          <Box className="ca-bg-quaternary-opacity-20 ca-border-gray" p={4} borderRadius="lg" border="1px solid">
            <VStack align="start" gap={2}>
              <Text className="ca-color-quaternary" fontSize="sm" fontWeight="medium">
                Customer Satisfaction
              </Text>
              <Text className="ca-color-green" fontSize="2xl" fontWeight="bold">
                {details ? `${details.sentiment_score.toFixed(2)}/5` : '-'}
              </Text>
              <HStack>
                <Text className="ca-color-quaternary" fontSize="xs">sentiment score</Text>
              </HStack>
            </VStack>
          </Box>
        </Grid>

        {/* Charts Grid */}
        <Grid templateColumns="repeat(2, 1fr)" gap={6}>

          {/* Sentiment Distribution */}
          <GridItem>
            <Flex direction="column" gap={4}>
              <Box className="ca-bg-quaternary-opacity-20 ca-border-gray" p={6} borderRadius="lg" border="1px solid">
                <Text className="ca-color-primary" fontSize="xl" fontWeight="bold" mb={6} textAlign="center">
                  Sentiment Distribution
                </Text>
                <HStack gap={8} align="stretch" justify="center">
                  {details ? (
                    <>
                      {/* Super Positive */}
                      <Box>
                        <VStack justify="space-between" align="center" mb={4}>
                          <VStack gap={4} align="center">
                            <Box
                              w="80px"
                              h="80px"
                              borderRadius="full"
                              className="ca-bg-light-pink"
                              border="2px solid"
                              borderColor="#D200D3"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              position="relative"
                            >
                              <Text 
                                fontSize="6xl"
                                _hover={{ transform: "scale(1.15)", transition: "transform 0.2s", cursor: "pointer" }}
                                transition="transform 0.2s"
                              >😍</Text>
                            </Box>
                            <VStack align="center" gap={1}>
                              <Text className="ca-color-quaternary" fontSize="lg" fontWeight="medium" textAlign="center">Super Positive</Text>
                              <Text className="ca-color-primary" textAlign="center" fontSize="sm">{sentimentTotals.superPositive} messages</Text>
                            </VStack>
                          </VStack>
                          <Text className="ca-color-primary" fontSize="3xl" fontWeight="bold">
                            {sentimentTotals.superPositivePct}%
                          </Text>
                        </VStack>
                      </Box>

                      {/* Positive */}
                      <Box>
                        <VStack justify="space-between" align="center" mb={4}>
                          <VStack gap={4} align="center">
                            <Box
                              w="80px"
                              h="80px"
                              borderRadius="full"
                              className="ca-bg-light-pink"
                              border="2px solid"
                              borderColor="#D200D3"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              position="relative"
                            >
                              <Text 
                                fontSize="6xl"
                                _hover={{ transform: "scale(1.15)", transition: "transform 0.2s", cursor: "pointer" }}
                                transition="transform 0.2s"
                              >😊</Text>
                            </Box>
                            <VStack align="center" gap={1}>
                              <Text className="ca-color-quaternary" fontSize="lg" fontWeight="medium" textAlign="center">Positive</Text>
                              <Text className="ca-color-primary" textAlign="center" fontSize="sm">{sentimentTotals.positive} messages</Text>
                            </VStack>
                          </VStack>
                          <Text className="ca-color-primary" fontSize="3xl" fontWeight="bold">
                            {sentimentTotals.positivePct}%
                          </Text>
                        </VStack>
                      </Box>

                      {/* Neutral */}
                      <Box>
                        <VStack justify="space-between" align="center" mb={4}>
                          <VStack gap={4} align="center">
                            <Box
                              w="80px"
                              h="80px"
                              borderRadius="full"
                              className="ca-bg-light-pink"
                              border="2px solid"
                              borderColor="#D200D3"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              position="relative"
                            >
                              <Text 
                                fontSize="6xl"
                                _hover={{ transform: "scale(1.15)", transition: "transform 0.2s", cursor: "pointer" }}
                                transition="transform 0.2s"
                              >😐</Text>
                            </Box>
                            <VStack align="center" gap={1}>
                              <Text className="ca-color-quaternary" fontSize="lg" fontWeight="medium" textAlign="center">Neutral</Text>
                              <Text className="ca-color-primary" textAlign="center" fontSize="sm">{sentimentTotals.neutral} messages</Text>
                            </VStack>
                          </VStack>
                          <Text className="ca-color-primary" fontSize="3xl" fontWeight="bold">
                            {sentimentTotals.neutralPct}%
                          </Text>
                        </VStack>
                      </Box>

                      {/* Negative */}
                      <Box>
                        <VStack justify="space-between" align="center" mb={4}>
                          <VStack gap={4} align="center">
                            <Box
                              w="80px"
                              h="80px"
                              borderRadius="full"
                              className="ca-bg-light-pink"
                              border="2px solid"
                              borderColor="#D200D3"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              position="relative"
                            >
                              <Text 
                                fontSize="6xl"
                                _hover={{ transform: "scale(1.15)", transition: "transform 0.2s", cursor: "pointer" }}
                                transition="transform 0.2s"
                              >😞</Text>
                            </Box>
                            <VStack align="center" gap={1}>
                              <Text className="ca-color-quaternary" fontSize="lg" fontWeight="medium" textAlign="center">Negative</Text>
                              <Text className="ca-color-primary" textAlign="center" fontSize="sm">{sentimentTotals.negative} messages</Text>
                            </VStack>
                          </VStack>
                          <Text className="ca-color-primary" fontSize="3xl" fontWeight="bold">
                            {sentimentTotals.negativePct}%
                          </Text>
                        </VStack>
                      </Box>

                      {/* Super Negative */}
                      <Box>
                        <VStack justify="space-between" align="center" mb={4}>
                          <VStack gap={4} align="center">
                            <Box
                              w="80px"
                              h="80px"
                              borderRadius="full"
                              className="ca-bg-light-pink"
                              border="2px solid"
                              borderColor="#D200D3"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              position="relative"
                            >
                              <Text 
                                fontSize="6xl"
                                _hover={{ transform: "scale(1.15)", transition: "transform 0.2s", cursor: "pointer" }}
                                transition="transform 0.2s"
                              >😡</Text>
                            </Box>
                            <VStack align="center" gap={1}>
                              <Text className="ca-color-quaternary" fontSize="lg" fontWeight="medium" textAlign="center">Super Negative</Text>
                              <Text className="ca-color-primary" textAlign="center" fontSize="sm">{sentimentTotals.superNegative} messages</Text>
                            </VStack>
                          </VStack>
                          <Text className="ca-color-primary" fontSize="3xl" fontWeight="bold">
                            {sentimentTotals.superNegativePct}%
                          </Text>
                        </VStack>
                      </Box>
                    </>
                  ) : (
                    <Box p={8} textAlign="center">
                      <Text className="ca-color-quaternary" fontSize="lg">No sentiment data</Text>
                    </Box>
                  )}
                </HStack>
              </Box>

              <Box className="ca-bg-quaternary-opacity-20 ca-border-gray" p={6} borderRadius="lg" border="1px solid">
                <Text className="ca-color-primary" fontSize="xl" fontWeight="bold" mb={4}>
                  Weekly Activity
                </Text>
                {weekdayData.length > 0 ? (
                  <Box>
                    <Chart.Root maxH="sm" chart={useChart({
                      data: weekdayData.map(([day, count]) => ({ day, activities: count })),
                      series: [{ name: "activities", color: "secondary" }],
                    })}>
                      <BarChart data={weekdayData.map(([day, count]) => ({ day, activities: count }))} barSize={32}>
                        <CartesianGrid stroke="#D3D3D3" vertical={false} />
                        <XAxis 
                          axisLine={false} 
                          tickLine={false} 
                          dataKey="day"
                          tick={{ fill: '#615568', fontSize: 12 }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#615568', fontSize: 12 }}
                        />
                        <Bar
                          isAnimationActive={false}
                          dataKey="activities"
                          fill="url(#weeklyActivityGradient)"
                          radius={[4, 4, 0, 0]}
                        />
                        <defs>
                          <linearGradient id="weeklyActivityGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#B6ED43" />
                            <stop offset="100%" stopColor="#77AB0C" />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </Chart.Root>
                  </Box>
                ) : (
                  <Box p={4} textAlign="center">
                    <Text className="ca-color-quaternary" fontSize="sm">No activity data</Text>
                  </Box>
                )}
              </Box>
            </Flex>
          </GridItem>

          {/* Top Related Topics (Grouped Messages) */}
          <GridItem>
            <Flex direction="column" gap={4}>
              <Box className="ca-bg-quaternary-opacity-20 ca-border-gray" p={6} borderRadius="lg" border="1px solid">
                <Text className="ca-color-primary" fontSize="xl" fontWeight="bold" mb={4}>
                  Top Related Topics
                </Text>
                {isLoadingGrouped ? (
                  <HStack gap={2}>
                    <Spinner size="sm" />
                    <Text className="ca-color-quaternary" fontSize="sm">Loading grouped topics…</Text>
                  </HStack>
                ) : groupedError ? (
                  <Text className="ca-color-red" fontSize="sm">{}</Text>
                ) : groupedTopics.length === 0 ? (
                  <Box p={4} textAlign="center">
                    <Text className="ca-color-quaternary" fontSize="sm">No grouped topics</Text>
                  </Box>
                ) : (
                  <VStack align="stretch" gap={2}>
                    {groupedTopics.map((item: any, index: number) => {
                      const isOpen = openTopicIndexes.has(index);
                      return (
                        <Box key={index} borderTop={index === 0 ? 'none' : '1px solid #D3D3D3'}>
                          <Box
                            onClick={() => toggleTopic(index)}
                            cursor="pointer"
                            _hover={{ backgroundColor: '#FFF6FF' }}
                            p={3}
                            borderRadius="md"
                          >
                            <HStack justify="space-between">
                              <Text className="ca-color-primary" fontWeight="medium">{item?.overview || 'Untitled topic'}</Text>
                              <HStack gap={2}>
                                <Badge colorScheme="purple" variant="subtle">{item?.payloads ? Object.keys(item.payloads).length : 0} messages</Badge>
                                {typeof item?.total_score === 'number' ? (
                                  <Badge 
                                    colorScheme="purple" 
                                    variant="solid"
                                    bg="#D200D3"
                                    color="white"
                                    fontSize="xs"
                                    px={2}
                                    py={1}
                                    borderRadius="md"
                                    fontWeight="medium"
                                    boxShadow="0 1px 3px rgba(210, 0, 211, 0.3)"
                                  >
                                    Score: {item.total_score.toFixed(2)}
                                  </Badge>
                                ) : null}
                                <Text className="ca-color-quaternary" fontSize="sm">{isOpen ? 'Hide' : 'Show'}</Text>
                              </HStack>
                            </HStack>
                          </Box>
                          {isOpen ? (
                            <Box px={4} pb={4}>
                              {item.payloads ? (
                                <VStack align="start" gap={2}>
                                  {Object.values(item.payloads).map((p: any, i: number) => {
                                    const content = p?.content ?? '';
                                    const conversationId = p?.conversation_id ?? null;
                                    return (
                                      <Text
                                        key={i}
                                        className="ca-color-quaternary"
                                        fontSize="sm"
                                        cursor={conversationId ? 'pointer' : 'default'}
                                        _hover={conversationId ? { textDecoration: 'underline' } : undefined}
                                        onClick={() => {
                                          if (!conversationId) return;
                                          try {
                                            useStore.getState().setSelectedConversationId(conversationId);
                                            navigate('/analyze/conversations', { state: { highlightText: content } });
                                          } catch (e) {}
                                        }}
                                      >
                                        • {content}
                                      </Text>
                                    );
                                  })}
                                </VStack>
                              ) : (
                                <Text className="ca-color-quaternary" fontSize="sm">No payloads</Text>
                              )}
                            </Box>
                          ) : null}
                        </Box>
                      );
                    })}
                  </VStack>
                )}
              </Box>
            
              {/* Message Volume (use conversations by day) */}
              <Box className="ca-bg-quaternary-opacity-20 ca-border-gray" p={6} borderRadius="lg" border="1px solid">
                <Text className="ca-color-primary" fontSize="xl" fontWeight="bold" mb={4}>
                  Conversations Volume
                </Text>
                {conversationsTrend.length > 0 ? (
                  <Box>
                    <Chart.Root maxH="sm" chart={conversationsChart}>
                      <LineChart data={chartData}>
                        <CartesianGrid stroke="#D3D3D3" vertical={false} />
                        <XAxis
                          axisLine={false}
                          dataKey="date"
                          tickFormatter={(value) => value}
                          stroke="#D3D3D3"
                          tick={{ fill: '#615568', fontSize: 12 }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tickMargin={10}
                          stroke="#D3D3D3"
                          tick={{ fill: '#615568', fontSize: 12 }}
                        />
                        <Tooltip
                          animationDuration={100}
                          cursor={false}
                          content={<Chart.Tooltip />}
                        />
                        <Line
                          isAnimationActive={false}
                          dataKey="conversations"
                          stroke="#D200D3"
                          strokeWidth={3}
                          dot={{ fill: '#D200D3', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: '#D200D3', strokeWidth: 2 }}
                        />
                      </LineChart>
                    </Chart.Root>
                  </Box>
                ) : (
                  <Box p={4} textAlign="center">
                    <Text className="ca-color-quaternary" fontSize="sm">No conversation data</Text>
                  </Box>
                  )}
              </Box>
            </Flex>
          </GridItem>
        </Grid>
      </VStack>
    </Box>
  );
};

export default AnalyzeDashboard;
