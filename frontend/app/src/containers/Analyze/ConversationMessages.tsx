import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, VStack, HStack, Text, Avatar } from '@chakra-ui/react';

import { useStore } from '@store/index';  

const ConversationMessages = () => {
  const location = useLocation();
  const highlightText: string | undefined = (location.state as any)?.highlightText;
  const agentId = useStore((s: any) => s.selectedAgentId);
  const convID = useStore((s: any) => s.selectedConversationId);

  const fetchMessagesForConversation = useStore((s: any) => s.fetchMessagesForConversation);
  const messagesByConversation = useStore((s: any) => s.messagesByConversation);
  const isLoadingMessages = useStore((s: any) => s.isLoadingMessages);
  const agents = useStore((s: any) => s.agents);
  const user = useStore((s: any) => s.user);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const messages = (convID && messagesByConversation?.[convID]) || [];

  const agentAvatarUrl = useMemo(() => {
    if (!agentId || !Array.isArray(agents)) return null;
    const agent = agents.find((a: any) => String(a.id) === String(agentId));
    return agent?.avatar_url || null;
  }, [agentId, agents]);

  const agent = useMemo(() => {
    if (!agentId || !Array.isArray(agents)) return null;
    return agents.find((a: any) => String(a.id) === String(agentId));
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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [sortedMessages.length]);

  useEffect(() => {
    if (!highlightText) return;
    // Find the first message containing the highlight text
    const target = sortedMessages.find((m: any) => typeof m?.content === 'string' && m.content.includes(highlightText));
    if (target && target.id) {
      setHighlightedId(String(target.id));
      const el = messageRefs.current[String(target.id)];
      if (el && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      // Remove highlight after a delay
      const t = setTimeout(() => setHighlightedId(null), 2500);
      return () => clearTimeout(t);
    }
  }, [highlightText, sortedMessages]);

  return (
    <Box flex={1} bg="#FFF6FF" display="flex" flexDirection="column" height="100%" overflow="auto">
      <Box
        ref={scrollRef}
        flex={1}
        overflowY="auto"
        px={6}
        py={4}
        height="100%"
      >
        <VStack align="stretch" gap={3}>
          {isLoadingMessages && (
            <Text className="ca-color-quaternary" fontSize="sm">Loading messages...</Text>
          )}
          {sortedMessages.map((msg: any) => {
            const isUser = msg.sender_type === 'user';
            return (
              <HStack key={msg.id} justify={isUser ? 'flex-end' : 'flex-start'} align="flex-end" gap={3} ref={(el) => { messageRefs.current[String(msg.id)] = el; }}>
                {!isUser && (
                  <Avatar.Root w="36px" h="36px" borderRadius="full" overflow="hidden" flexShrink={0} transform="translateY(2px)">
                    <Avatar.Fallback bg="#621CB1" color="white">A</Avatar.Fallback>
                    {agentAvatarUrl ? <Avatar.Image src={agentAvatarUrl} /> : null}
                  </Avatar.Root>
                )}
                <Box
                  maxW="70%"
                  bg={highlightedId === String(msg.id) ? '#FFF3B0' : (isUser ? '#FFD8FF' : '#FFFFFF')}
                  color={isUser ? '#0A0807' : '#0A0807'}
                  borderRadius="12px"
                  className={isUser ? 'ca-border-tertiary' : 'ca-border-gray'}
                  border="1px solid"
                  px={4}
                  py={3}
                  boxShadow={highlightedId === String(msg.id) ? '0 0 0 3px rgba(255, 215, 0, 0.6)' : (isUser ? '0 4px 12px rgba(210, 0, 211, 0.15)' : '0 2px 8px rgba(0,0,0,0.05)')}
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
        <Box mt={6} mb={2} display="flex" alignItems="center" justifyContent="center">
          <Box display="flex" alignItems="center" gap={4}>
            <Avatar.Root w="56px" h="56px" borderRadius="full" overflow="hidden" flexShrink={0}>
              <Avatar.Fallback bg="#621CB1" color="white" fontSize="2xl">
                {agent?.name ? agent.name[0] : 'A'}
              </Avatar.Fallback>
              {agentAvatarUrl ? <Avatar.Image src={agentAvatarUrl} /> : null}
            </Avatar.Root>
            <Text fontSize="2xl" fontWeight="bold" className="ca-color-primary">
              {agent?.name || 'Agent'}
            </Text>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ConversationMessages;


