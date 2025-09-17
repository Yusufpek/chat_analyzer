import React, { useEffect, useMemo } from 'react';
import { Box, HStack, SimpleGrid, Text, VStack, Badge, Spinner } from '@chakra-ui/react';
import { useStore } from '@store/index';
import { CONNECTION_TYPE_LABELS } from '@constants/connectionTypes';


const AnalyzeSentiment = () => {
  const agentId = useStore((s: any) => s.selectedAgentId);

  const agents = useStore((s: any) => s.agents);
  const selectedConnectionType = useStore((s: any) => s.selectedConnectionType);
  const conversationsByAgent = useStore((s: any) => s.conversationsByAgent);

  // Agent details from store
  const agentDetails = useStore((s: any) => s.agentDetails);
  const fetchAgentDetails = useStore((s: any) => s.fetchAgentDetails);
  const isLoadingAgentDetails = useStore((s: any) => s.isLoadingAgentDetails);
  const agentDetailsError = useStore((s: any) => s.agentDetailsError);

  const agent = useMemo(() => {
    if (!agentId) return null;
    return Array.isArray(agents) ? agents.find((a: any) => String(a.id) === String(agentId)) : null;
  }, [agents, agentId]);

  const conversations = useMemo(() => {
    if (!agentId) return [];
    const list = (conversationsByAgent?.[agentId] || []);
    return Array.isArray(list) ? list : [];
  }, [agentId, conversationsByAgent]);

  // Get agent details from store
  const details = agentId ? agentDetails[agentId] || null : null;

  useEffect(() => {
    if (!agentId) return;
    if (fetchAgentDetails) fetchAgentDetails(agentId);
  }, [agentId, fetchAgentDetails]);

  const totalAnalyzed = details?.total_sentiment_count || 0;
  const isLoading = isLoadingAgentDetails;
  const error = agentDetailsError;

  const sentimentBreakdown = useMemo(() => {
    if (!details) return [] as { key: string; label: string; count: number; color: string; }[];
    return [
      { key: 'super_positive_count', label: 'Super Positive', count: details.super_positive_count, color: 'green' },
      { key: 'positive_count', label: 'Positive', count: details.positive_count, color: 'green' },
      { key: 'neutral_count', label: 'Neutral', count: details.neutral_count, color: 'gray' },
      { key: 'negative_count', label: 'Negative', count: details.negative_count, color: 'red' },
      { key: 'super_negative_count', label: 'Super Negative', count: details.super_negative_count, color: 'red' },
    ];
  }, [details]);

  const percent = (count: number, total: number) => {
    if (!total) return 0;
    return Math.round((count / total) * 100);
    };

  const StatCard = ({ label, value, hint, color = "primary" }: { label: string; value: React.ReactNode; hint?: string; color?: string }) => (
    <Box p={4} bg="#FFFFFF" border="1px solid" className="ca-border-gray" borderRadius="md">
      <Text className="ca-color-quaternary" fontSize="xs">{label}</Text>
      <Text className={`ca-color-${color}`} fontSize="xl" fontWeight="bold">{value}</Text>
      {hint ? <Text className="ca-color-quinary" fontSize="xs">{hint}</Text> : null}
    </Box>
  );

  return (
    <Box p={6} minH="100%" bg="#FFF6FF">
      <VStack align="stretch" gap={6}>
        <HStack justify="space-between" align="center">
          <VStack align="start" gap={0}>
            <Text className="ca-color-primary" fontSize="2xl" fontWeight="bold">
              Analyze Sentiment
            </Text>
            <HStack gap={2}>
              <Text className="ca-color-quaternary" fontSize="sm">
                Agent:
              </Text>
              <Badge colorScheme="purple" variant="subtle">
                {agent?.name || agentId || 'Unknown'}
              </Badge>
              <Text className="ca-color-quaternary" fontSize="sm">
                Type:
              </Text>
              <Badge colorScheme="teal" variant="subtle">
                {(() => {
                  const typeKey = (agent?.connection_type || selectedConnectionType) as keyof typeof CONNECTION_TYPE_LABELS;
                  return CONNECTION_TYPE_LABELS[typeKey] || 'Unknown';
                })()}
              </Badge>
            </HStack>
          </VStack>
          <Text className="ca-color-quinary" fontSize="xs">
            {conversations.length} conversations loaded
          </Text>
        </HStack>

        {isLoading && (
          <Box p={8} bg="#FFFFFF" border="1px solid" className="ca-border-gray" borderRadius="lg" display="flex" alignItems="center" justifyContent="center">
            <HStack gap={3}>
              <Spinner size="sm" />
              <Text className="ca-color-quaternary" fontSize="sm">Loading sentiment details…</Text>
            </HStack>
          </Box>
        )}

        {error && (
          <Box p={4} bg="#FFF5F5" border="1px solid" borderColor="#FEB2B2" borderRadius="md">
            <Text className="ca-color-quaternary" fontSize="sm">{error}</Text>
          </Box>
        )}

        {!isLoading && !error && details && (
          <>
            <Box>
              <Text className="ca-color-primary" fontSize="lg" fontWeight="bold" mb={3}>Overview</Text>
              <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                <Box _hover={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}>
                  <StatCard 
                    label="Sentiment Score" 
                    value={details.sentiment_score.toFixed(2)} 
                    hint="Average score"
                    color="green"
                  />
                </Box>
                <Box _hover={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}>
                  <StatCard 
                    label="Analyzed Conversations" 
                    value={details.total_sentiment_count} 
                    hint="with sentiment result"
                  />
                </Box>
                <Box _hover={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}>
                  <StatCard 
                    label="Messages (Total)" 
                    value={details.total_messages} 
                    hint={`${details.total_conversations} conversations`}
                  />
                </Box>
              </SimpleGrid>
            </Box>

            <Box>
              <Text className="ca-color-primary" fontSize="lg" fontWeight="bold" mb={3}>Sentiment Breakdown</Text>
              <Box p={6} bg="#FFFFFF" border="1px solid" className="ca-border-gray" borderRadius="lg" _hover={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }} transition="all 0.2s ease-in-out">
                <VStack align="stretch" gap={3}>
                  {sentimentBreakdown.map((item) => (
                    <HStack key={item.key} justify="space-between" p={3} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.100">
                      <HStack gap={3}>
                        <Badge variant="solid" colorScheme={item.color as any} borderRadius="full" px={2}>
                          {item.label}
                        </Badge>
                      </HStack>
                      <HStack gap={2}>
                        <Text className="ca-color-quaternary" fontSize="sm">
                          {item.count} occurrences
                        </Text>
                        <Badge variant="subtle" colorScheme={item.color as any} fontSize="sm" px={3} py={1}>
                          {percent(item.count, totalAnalyzed)}%
                        </Badge>
                      </HStack>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            </Box>
          </>
        )}
      </VStack>
    </Box>
  );
};

export default AnalyzeSentiment;
