import React, { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Flex, HStack, VStack, Text, Badge } from '@chakra-ui/react';
import { useStore } from '@store/index';
import { CONNECTION_TYPE_LABELS } from '@constants/connectionTypes';

const AnalyzeSettings = () => {
  const { agentId } = useParams();

  const agents = useStore((s: any) => s.agents);
  const conversationsByAgent = useStore((s: any) => s.conversationsByAgent);
  const fetchConversations = useStore((s: any) => s.fetchConversations);

  useEffect(() => {
    if (agentId && fetchConversations) fetchConversations(agentId);
  }, [agentId, fetchConversations]);

  const agent = useMemo(() => agents?.find((a: any) => String(a.id) === String(agentId)), [agents, agentId]);
  const conversations = useMemo(() => (agentId ? (conversationsByAgent?.[agentId] || []) : []), [conversationsByAgent, agentId]);

  const latestActivity = useMemo(() => {
    if (!conversations || conversations.length === 0) return null;
    const latest = [...conversations].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
    return latest?.created_at || null;
  }, [conversations]);

  return (
    <Box p={6} minH="100%" bg="#FFFFFF">
      <VStack align="stretch" gap={6}>
        <Text className="ca-color-primary" fontSize="2xl" fontWeight="bold">
          Analyze Settings
        </Text>

        {!agent ? (
          <Box
            className="ca-border-gray"
            border="1px dashed"
            borderRadius="xl"
            p={8}
            bg="#FFF6FF"
          >
            <Text className="ca-color-quaternary">Agent bulunamadı.</Text>
          </Box>
        ) : (
          <>
            {/* Agent Info Card */}
            <Flex
              className="ca-border-gray"
              border="1px solid"
              borderRadius="xl"
              p={6}
              gap={5}
              bg="#FFFFFF"
              align="center"
            >
              <Box
                w="64px"
                h="64px"
                borderRadius="full"
                bg="#0A0807"
                overflow="hidden"
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
              >
                {agent?.avatar_url ? (
                  <img src={agent.avatar_url} alt={agent.name} style={{ width: '100%', height: '100%' }} />
                ) : (
                  <Text color="#FFFFFF" fontWeight="bold">{String(agent?.name || 'A').slice(0, 1).toUpperCase()}</Text>
                )}
              </Box>

              <VStack align="start" gap={1} flex={1} minW={0}>
                <HStack gap={3} align="center">
                  <Text className="ca-color-primary" fontSize="xl" fontWeight="semibold">
                    {agent?.name}
                  </Text>
                  <Badge colorScheme="purple" borderRadius="md" px={2} py={0.5} fontSize="0.75rem">
                    {CONNECTION_TYPE_LABELS?.[agent?.connection_type as keyof typeof CONNECTION_TYPE_LABELS] || agent?.connection_type || 'Agent'}
                  </Badge>
                </HStack>
                <Text className="ca-color-quaternary" fontSize="sm">
                  Agent ID: {agent?.id}
                </Text>
              </VStack>
            </Flex>

            {/* Stats */}
            <Flex gap={4} wrap="wrap">
              <Box
                className="ca-border-gray ca-bg-light-pink"
                border="1px solid"
                borderRadius="xl"
                p={5}
                minW="220px"
                flex="0 0 auto"
              >
                <Text className="ca-color-quaternary" fontSize="sm">Total Conversations</Text>
                <Text className="ca-color-primary" fontSize="2xl" fontWeight="bold">{conversations.length}</Text>
              </Box>

              <Box
                className="ca-border-gray"
                border="1px solid"
                borderRadius="xl"
                p={5}
                minW="220px"
                bg="#FFFFFF"
                flex="0 0 auto"
              >
                <Text className="ca-color-quaternary" fontSize="sm">Last Activity</Text>
                <Text className="ca-color-primary" fontSize="lg" fontWeight="medium">
                  {latestActivity ? new Date(latestActivity).toLocaleString() : '—'}
                </Text>
              </Box>
            </Flex>
          </>
        )}
      </VStack>
    </Box>
  );
};

export default AnalyzeSettings;
