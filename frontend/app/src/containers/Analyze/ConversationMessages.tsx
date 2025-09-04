import React, { useEffect, useMemo, useRef } from 'react';
import { Box, VStack, HStack, Text, Avatar } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { useStore } from '@store/index';  

const ConversationMessages = () => {
  const { agentId, convID } = useParams();

  const fetchMessagesForConversation = useStore((s: any) => s.fetchMessagesForConversation);
  const messagesByConversation = useStore((s: any) => s.messagesByConversation);
  const isLoadingMessages = useStore((s: any) => s.isLoadingMessages);
  const agents = useStore((s: any) => s.agents);
  const user = useStore((s: any) => s.user);

  const messages = (convID && messagesByConversation?.[convID]) || [];

  const agentAvatarUrl = useMemo(() => {
    if (!agentId || !Array.isArray(agents)) return null;
    const agent = agents.find((a: any) => String(a.id) === String(agentId));
    return agent?.avatar_url || null;
  }, [agentId, agents]);

  useEffect(() => {
    if (convID) {
      fetchMessagesForConversation(convID);
    }
  }, [convID, fetchMessagesForConversation]);

  // Sort by created_at ascending to render chronologically
  const sortedMessages = useMemo(() => {
    const list = Array.isArray(messages) ? messages : [];
    return [...list].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [messages]);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [sortedMessages.length]);

  return (
    <Box flex={1} bg="#FFF6FF" display="flex" flexDirection="column" height="100%">
      <Box
        ref={scrollRef}
        flex={1}
        overflowY="auto"
        px={6}
        py={4}
      >
        <VStack align="stretch" gap={3}>
          {isLoadingMessages && (
            <Text className="ca-color-quaternary" fontSize="sm">Loading messages...</Text>
          )}
          {sortedMessages.map((msg: any) => {
            const isUser = msg.sender_type === 'user';
            return (
              <HStack key={msg.id} justify={isUser ? 'flex-end' : 'flex-start'} align="flex-end" gap={3}>
                {!isUser && (
                  <Avatar.Root w="36px" h="36px" borderRadius="full" overflow="hidden" flexShrink={0} transform="translateY(2px)">
                    <Avatar.Fallback bg="#621CB1" color="white">A</Avatar.Fallback>
                    {agentAvatarUrl ? <Avatar.Image src={agentAvatarUrl} /> : null}
                  </Avatar.Root>
                )}
                <Box
                  maxW="70%"
                  bg={isUser ? '#FFD8FF' : '#FFFFFF'}
                  color={isUser ? '#0A0807' : '#0A0807'}
                  borderRadius="12px"
                  className={isUser ? 'ca-border-tertiary' : 'ca-border-gray'}
                  border="1px solid"
                  px={4}
                  py={3}
                  boxShadow={isUser ? '0 4px 12px rgba(210, 0, 211, 0.15)' : '0 2px 8px rgba(0,0,0,0.05)'}
                >
                  <Text fontSize="sm" className="ca-color-primary" whiteSpace="pre-wrap">
                    {msg.content}
                  </Text>
                  <Text fontSize="xs" className="ca-color-quaternary" mt={1} textAlign={isUser ? 'right' : 'left'}>
                    {new Date(msg.created_at).toLocaleString()}
                  </Text>
                </Box>
                {isUser && (
                  <Avatar.Root w="36px" h="36px" borderRadius="full" overflow="hidden" flexShrink={0} transform="translateY(0.5px)">
                    {typeof user?.profile_image === 'string' && user?.profile_image ? (
                      <Avatar.Image src={user.profile_image} />
                    ) : null}
                    <Avatar.Fallback name={(((String(user?.first_name || '') + ' ' + String(user?.last_name || '')).trim()) || user?.username || 'User')} />
                  </Avatar.Root>
                )}
              </HStack>
            );
          })}
        </VStack>
      </Box>
    </Box>
  );
};

export default ConversationMessages;


