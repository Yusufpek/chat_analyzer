import React, { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
} from '@chakra-ui/react';
import { useStore } from '@store/index';
import ConversationMessages from './ConversationMessages';

type Conversation = {
  id: string;
  created_at: string;
  assistant_avatar_url: string | null;
  source: string;
  chat_type: string;
  status: string;
  agent_id: string;
  last_message: string | null;
};

const AnalyzeConversations= () => {
  const navigate = useNavigate();
  const { agentId, convID } = useParams();
  const agents = useStore((s: any) => s.agents);

  
  // Zustand store hooks
  const conversationsByAgent = useStore((s: any) => s.conversationsByAgent);
  const fetchConversationsIfNeeded = useStore((s: any) => s.fetchConversationsIfNeeded);
  const isLoadingConversations = useStore((s: any) => s.isLoadingConversations);
  const conversationsFromStore: Conversation[] = (agentId && conversationsByAgent?.[agentId]) || [];

  useEffect(() => {
    if (!agentId) return;
    if (fetchConversationsIfNeeded) fetchConversationsIfNeeded(agentId);
  }, [agentId, fetchConversationsIfNeeded]);

  const sortedConversations = useMemo(() => {
    const list = Array.isArray(conversationsFromStore) ? conversationsFromStore : [];
    return [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [conversationsFromStore]);

  return (
    <Flex minH="100%" bg="#FFFFFF" align="stretch">
      {/* Left conversations list */}
      <Box w="360px" className="ca-bg-light-pink ca-border-right-gray" overflowY="auto" minH="100%">
        <VStack align="stretch" gap={1} p={4}>
          <Text className="ca-color-primary" fontSize="xl" fontWeight="bold">Conversations</Text>
          {sortedConversations.map((conv) => (
            <HStack
              key={conv.id}
              p={3}
              gap={3}
              borderRadius="xl"
              className="ca-border-gray"
              border="1px solid"
              bg="#FFFFFF"
              _hover={{ bg: '#FFF6FF', borderColor: '#D200D3' }}
              cursor="pointer"
              onClick={() => navigate(`/analyze/${agentId}/conversations/${conv.id}`)}
            >
              <Box
                w="36px"
                h="36px"
                borderRadius="full"
                bg="#0A0807"
                display="flex"
                alignItems="center"
                justifyContent="center"
                overflow="hidden"
                flexShrink={0}
              >
                <img src={agents.find((agent: any) => agent.id === conv.agent_id)?.avatar_url} style={{ width: '100%', height: '100%' }} />
              </Box>
              <VStack align="start" flex={1} minW={0} gap={1}>
                <Text className="ca-color-primary" fontSize="sm" fontWeight="medium" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap" w="100%">
                  {conv.source} · {conv.chat_type}
                </Text>
                <Text className="ca-color-quaternary" fontSize="xs" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap" w="100%">
                  {new Date(conv.created_at).toLocaleString()}
                </Text>
                <Text className="ca-color-primary" fontSize="sm" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap" w="100%">
                  {conv.last_message}
                </Text>
              </VStack>
            </HStack>
          ))}
        </VStack>
      </Box>

      {/* Right conversation messages pane */}
      <Box flex={1} bg="#FFF6FF">
        {convID ? (
          <ConversationMessages />
        ) : (
          <Box h="100%" display="flex" alignItems="center" justifyContent="center">
            <Text className="ca-color-quaternary" fontSize="sm">Select a conversation to view messages</Text>
          </Box>
        )}
      </Box>
    </Flex>
  );
};

export default AnalyzeConversations;