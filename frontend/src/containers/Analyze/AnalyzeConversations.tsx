import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
} from '@chakra-ui/react';

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
  const { agentId } = useParams();
  const conversations: Conversation[] = [
    {
      id: '0198a249b952760489bea80381fa2e3816da',
      created_at: '2025-08-13T08:16:46Z',
      assistant_avatar_url: null,
      source: 'jotform',
      chat_type: 'ai2u',
      status: 'active',
      agent_id: '01989df5271475be9088f614bbe69043fe7c',
      last_message: "Hello! How can I assist you today?",
    },
    {
      id: '0198a23adf4b799da41561bef09509ea935e',
      created_at: '2025-08-13T08:00:40Z',
      assistant_avatar_url: null,
      source: 'jotform',
      chat_type: 'ai2u',
      status: 'active',
      agent_id: '01989df5271475be9088f614bbe69043fe7c',
      last_message: "Thank you for your feedback!",
    },
    {
      id: '01989e8dcfa37db699323c022c698aaa6e22',
      created_at: '2025-08-12T14:52:37Z',
      assistant_avatar_url: null,
      source: 'jotform',
      chat_type: 'ai2u',
      status: 'active',
      agent_id: '01989df5271475be9088f614bbe69043fe7c',
      last_message: "Your request has been received.",
    },
    {
      id: '01989e859ba77abc911d83ac000fe22c58cf',
      created_at: '2025-08-12T14:43:38Z',
      assistant_avatar_url: null,
      source: 'jotform',
      chat_type: 'ai2u',
      status: 'active',
      agent_id: '01989e1b648077d78a5f89a9a75ec75030c4',
      last_message: "Let me check that for you.",
    },
    {
      id: '01989e549b527ab085d0d23bd0efc3edae87',
      created_at: '2025-08-12T14:12:31Z',
      assistant_avatar_url: null,
      source: 'jotform',
      chat_type: 'ai2u',
      status: 'active',
      agent_id: '01989e1b648077d78a5f89a9a75ec75030c4',
      last_message: "Could you please provide more details?",
    },
    {
      id: '01989e5355b87676b302d9ee843331226c63',
      created_at: '2025-08-12T13:48:42Z',
      assistant_avatar_url: null,
      source: 'jotform',
      chat_type: 'ai2u',
      status: 'active',
      agent_id: '01989df5271475be9088f614bbe69043fe7c',
      last_message: "I'm here if you need anything else.",
    },
    {
      id: '01989e4dda587428be422f95bee4137dfc3c',
      created_at: '2025-08-12T13:44:05Z',
      assistant_avatar_url: null,
      source: 'jotform',
      chat_type: 'ai2u',
      status: 'active',
      agent_id: '01989e1b648077d78a5f89a9a75ec75030c4',
      last_message: "The issue has been resolved.",
    },
    {
      id: '01989e07a7097d1aa561a3138cb765bab1d7',
      created_at: '2025-08-12T12:26:07Z',
      assistant_avatar_url: null,
      source: 'jotform',
      chat_type: 'ai2u',
      status: 'active',
      agent_id: '01989df5271475be9088f614bbe69043fe7c',
      last_message: "Is there anything else I can help you with?",
    },
    {
      id: '01989df8c491790a8bf35759ca05267488ff',
      created_at: '2025-08-12T12:09:52Z',
      assistant_avatar_url: null,
      source: 'jotform',
      chat_type: 'ai2u',
      status: 'active',
      agent_id: '01989df5271475be9088f614bbe69043fe7c',
      last_message: "Goodbye! Have a great day!",
    },
  ];

  const sortedConversations = useMemo(() => {
    return [...conversations].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [conversations]);

  return (
    <Flex h="100vh" bg="#FFFFFF">
      {/* Left conversations list */}
      <Box w="360px" className="ca-bg-light-pink ca-border-right-gray" overflowY="auto">
        <VStack align="stretch" gap={3} p={4}>
          <Text className="ca-color-primary" fontSize="xl" fontWeight="bold">Conversations</Text>
          {sortedConversations.map((conv) => (
            <HStack
              key={conv.id}
              p={3}
              gap={3}
              borderRadius="md"
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
                {conv.assistant_avatar_url ? (
                  <img src={conv.assistant_avatar_url} style={{ width: '100%', height: '100%' }} />
                ) : (
                  <Text color="#FFFFFF" fontWeight="bold" fontSize="sm">🤖</Text>
                )}
              </Box>
              <VStack align="start" flex={1}>
                <Text className="ca-color-primary" fontSize="sm" fontWeight="medium">
                  {conv.source} · {conv.chat_type}
                </Text>
                <Text className="ca-color-quaternary" fontSize="xs">
                  {new Date(conv.created_at).toLocaleString()}
                </Text>
                <Text className="ca-color-primary" fontSize="sm" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                  {conv.last_message}
                </Text>
              </VStack>
            </HStack>
          ))}
        </VStack>
      </Box>

      {/* Right side intentionally left blank */}
      <Box flex={1} bg="#FFF6FF" />
    </Flex>
  );
};

export default AnalyzeConversations;