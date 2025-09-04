import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Text, 
  Grid, 
  GridItem, 
  Box, 
  VStack, 
  HStack,
  Badge,
  Spinner
} from '@chakra-ui/react';
import { Chart, useChart } from "@chakra-ui/charts";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LineChart, Tooltip, Line } from "recharts";
import { useStore } from '@store/index';
import { CONNECTION_TYPE_LABELS } from '@constants/connectionTypes';
import { request } from '@api/requestLayer';
import {
  Conversation,
  Message,
  AgentDetailsContent,
  AgentDetailsResponse,
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



const AnalyzeDashboard = () => {
  const agents = useStore((s: any) => s.agents);
  const selectedConnectionType = useStore((s: any) => s.selectedConnectionType);
  const { agentId } = useParams();

  // Store selectors
  const conversationsByAgent = useStore((s: any) => s.conversationsByAgent);
  const fetchConversations = useStore((s: any) => s.fetchConversations);
  const isLoadingConversations = useStore((s: any) => s.isLoadingConversations);

  const messagesByConversation = useStore((s: any) => s.messagesByConversation);
  const isLoadingMessages = useStore((s: any) => s.isLoadingMessages);

  // Do NOT auto-fetch messages for dashboard to keep it light; show stats if already loaded

  const [details, setDetails] = useState<AgentDetailsContent | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  useEffect(() => {
    if (!agentId) return;
    if (fetchConversations) fetchConversations(agentId);
  }, [agentId, fetchConversations]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!agentId) return;
      setIsLoadingDetails(true);
      setDetailsError(null);
      try {
        // TODO: move to store
        const res: AgentDetailsResponse = await request(`/api/agent/${agentId}/details`, { method: 'GET' });
        if (active) {
          if (res?.status === 'SUCCESS') setDetails(res.content);
          else setDetailsError('Failed to load agent details');
        }
      } catch (e: any) {
        if (active) setDetailsError(e?.message || 'Failed to load agent details');
      } finally {
        if (active) setIsLoadingDetails(false);
      }
    };
    load();
    return () => { active = false; };
  }, [agentId]);

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

  // Sentiment distribution from details
  const sentimentTotals = useMemo(() => {
    return getSentimentTotals(details);
  }, [details]);

  const agentName = useMemo(() => getAgentName(agents, agentId || ''), [agents, agentId]);

  const loadingAny = isLoadingDetails || isLoadingConversations;

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
                            <Text fontSize="4xl">😍</Text>
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
                            <Text fontSize="4xl">😊</Text>
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
                            <Text fontSize="4xl">😐</Text>
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
                            <Text fontSize="4xl">😞</Text>
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
                            <Text fontSize="4xl">😡</Text>
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
          </GridItem>

          {/* Weekly Activity */}
          <GridItem>
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
                    <BarChart data={weekdayData.map(([day, count]) => ({ day, activities: count }))} barSize={40}>
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
          </GridItem>

          {/* Message Volume (use conversations by day) */}
          <GridItem>
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
          </GridItem>

          {/* Sentiment Over Time (show overall distribution as bars) */}
          <GridItem>
            <Box className="ca-bg-quaternary-opacity-20 ca-border-gray" p={6} borderRadius="lg" border="1px solid">
              <Text className="ca-color-primary" fontSize="xl" fontWeight="bold" mb={4}>
                Sentiment Overview
              </Text>
              <VStack gap={3} align="stretch">
                <Box>
                    <HStack justify="space-between" mb={2}>
                    <Text className="ca-color-quaternary" fontSize="sm">Super Positive</Text>
                      <HStack gap={2}>
                        <Badge className="ca-bg-quaternary-opacity-20 ca-color-green" fontSize="xs">
                        {details ? `${sentimentTotals.superPositivePct}%` : '-'}
                        </Badge>
                      </HStack>
                    </HStack>
                      <Box 
                        h="8px"
                        bg="#E1DFE0"
                        borderRadius="full"
                        overflow="hidden"
                      >
                        <Box 
                          h="100%"
                          bg="#77AB0C"
                      w={`${details ? sentimentTotals.superPositivePct : 0}%`}
                        />
                      </Box>
                </Box>
                <Box>
                  <HStack justify="space-between" mb={2}>
                    <Text className="ca-color-quaternary" fontSize="sm">Positive</Text>
                    <HStack gap={2}>
                      <Badge className="ca-bg-quaternary-opacity-20 ca-color-green" fontSize="xs">
                        {details ? `${sentimentTotals.positivePct}%` : '-'}
                      </Badge>
                    </HStack>
                  </HStack>
                  <Box 
                        h="8px"
                        bg="#E1DFE0"
                        borderRadius="full"
                        overflow="hidden"
                      >
                        <Box 
                          h="100%"
                      bg="#77AB0C"
                      w={`${details ? sentimentTotals.positivePct : 0}%`}
                        />
                      </Box>
                </Box>
                <Box>
                  <HStack justify="space-between" mb={2}>
                    <Text className="ca-color-quaternary" fontSize="sm">Neutral</Text>
                    <HStack gap={2}>
                      <Badge className="ca-bg-quaternary-opacity-20" fontSize="xs">
                        {details ? `${sentimentTotals.neutralPct}%` : '-'}
                      </Badge>
                    </HStack>
                  </HStack>
                  <Box 
                        h="8px"
                        bg="#E1DFE0"
                        borderRadius="full"
                        overflow="hidden"
                      >
                        <Box 
                          h="100%"
                          bg="#8C8C8C"
                      w={`${details ? sentimentTotals.neutralPct : 0}%`}
                    />
                  </Box>
                </Box>
                <Box>
                  <HStack justify="space-between" mb={2}>
                    <Text className="ca-color-quaternary" fontSize="sm">Negative</Text>
                    <HStack gap={2}>
                      <Badge className="ca-bg-quaternary-opacity-20 ca-color-red" fontSize="xs">
                        {details ? `${sentimentTotals.negativePct}%` : '-'}
                      </Badge>
                    </HStack>
                  </HStack>
                  <Box 
                    h="8px"
                    bg="#E1DFE0"
                    borderRadius="full"
                    overflow="hidden"
                  >
                    <Box 
                      h="100%"
                      bg="#FF0048"
                      w={`${details ? sentimentTotals.negativePct : 0}%`}
                        />
                      </Box>
                </Box>
                <Box>
                  <HStack justify="space-between" mb={2}>
                    <Text className="ca-color-quaternary" fontSize="sm">Super Negative</Text>
                    <HStack gap={2}>
                      <Badge className="ca-bg-quaternary-opacity-20 ca-color-red" fontSize="xs">
                        {details ? `${sentimentTotals.superNegativePct}%` : '-'}
                      </Badge>
                    </HStack>
                  </HStack>
                  <Box 
                    h="8px"
                    bg="#E1DFE0"
                    borderRadius="full"
                    overflow="hidden"
                  >
                    <Box 
                      h="100%"
                      bg="#FF0048"
                      w={`${details ? sentimentTotals.superNegativePct : 0}%`}
                    />
                  </Box>
                </Box>
              </VStack>
            </Box>
          </GridItem>

        </Grid>
      </VStack>
    </Box>
  );
};

export default AnalyzeDashboard;
