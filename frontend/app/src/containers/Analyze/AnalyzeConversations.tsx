import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate} from 'react-router-dom';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Button,
  Circle,
  Badge,
  Input,
  Spinner,
} from '@chakra-ui/react';
import { useStore } from '@store/index';
import { Tooltip } from '@components/ui/tooltip';
import { LuInfo } from 'react-icons/lu';
import ConversationMessages from './ConversationMessages';
import AddLabelModal from '@Modals/AddLabelModal';
import ContextChangeModal from '@Modals/ContextChangeModal';
import SemanticSearchModal from '@Modals/SemanticSearchModal';

type Conversation = {
  id: string;
  created_at: string;
  assistant_avatar_url: string | null;
  source: string;
  chat_type: string;
  status: string;
  agent_id: string;
  last_message: string | null;
  label: string | null;
  title: string | null;
};

const mockConversationContextData = {
  conversation_id: "0198c15bd1107e669d3c8420cd06442b4dc3",
  overall_context:
    "Kullanıcı Hacettepe Üniversitesi Bilgisayar Mühendisliği ve Yapay Zekâ programları hakkında bilgi isterken, asistan yanıtlarından memnun değil ve hayal kırıklığı artıyor.",
  topics: [
    {
      topic: "University Overview",
      details:
        "Asistan, Hacettepe Üniversitesi ve ilgili bölümler ile giriş yapıyor.",
      start_message:
        "assistant: Merhaba! 👋 Ben Noupe. Bilgisayar Mühendisliği ve Yapay Zekâ programları hakkında bilgi verebilirim. Nasıl yardımcı olabilirim?",
      end_message:
        "user: üniversite adını söylemeden neden bölüm söyledin salak mısın",
    },
    {
      topic: "Information Request",
      details:
        "Kullanıcı, bölüm başkanı hakkında spesifik bilgi istiyor ve önceki yanıtlara tepkisi olumsuz.",
      start_message: "user: bölüm başkanı kim",
      end_message: "user: hiçbir şey bilmiyorken nasıl yardımcı olabilirsin",
    },
    {
      topic: "Programs & Requirements",
      details:
        "Program içerikleri, başvuru koşulları ve ders yapısı hakkında detay talep ediliyor.",
      start_message:
        "user: ders içerikleri ve başvuru şartları hakkında daha net bilgi ver",
      end_message:
        "assistant: Ders planı ve başvuru koşullarını resmi sayfadan da iletebilirim.",
    },
  ],
  context_changes: [
    {
      details:
        "Genel tanıtımdan spesifik yetkili bilgisine geçiş ve memnuniyetsizlik artışı.",
      from_topic: "University Overview",
      to_topic: "Information Request",
      change_message: "user: bölüm başkanı kim",
    },
    {
      details:
        "Spesifik kişiden program ayrıntılarına doğru kapsam genişletiliyor.",
      from_topic: "Information Request",
      to_topic: "Programs & Requirements",
      change_message:
        "user: ders içerikleri ve başvuru şartları hakkında daha net bilgi ver",
    },
  ],
  created_at: "2025-09-05T14:03:33.790458+03:00",
  updated_at: "2025-09-05T14:03:33.790461+03:00",
};

const AnalyzeConversations= () => {
  const navigate = useNavigate();
  const agentId = useStore((s: any) => s.selectedAgentId);
  const convID = useStore((s: any) => s.selectedConversationId);
  const agents = useStore((s: any) => s.agents);
  const agent = useMemo(() => agents?.find((a: any) => a.id === agentId), [agents, agentId]);
  const conversationsByAgent = useStore((s: any) => s.conversationsByAgent);
  const fetchConversations = useStore((s: any) => s.fetchConversations);
  const fetchAgents = useStore((s: any) => s.fetchAgents);
  const isLoadingConversations = useStore((s: any) => s.isLoadingConversations);
  const conversationsFromStore: Conversation[] = (agentId && conversationsByAgent?.[agentId]) || [];
  const [isAddLabelOpen, setIsAddLabelOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [isContextChangeModalOpen, setContextChangeModalOpen] = useState(false);
  const [contextChangeModalData, setContextChangeModalData] = useState<any>(null);
  const [isSemanticSearchModalOpen, setIsSemanticSearchModalOpen] = useState(false);
  const fetchContextChangeDetails = useStore((s: any) => s.fetchContextChangeDetails);

  

  useEffect(() => {
    if (!agentId) return;
    // If conversations already exist in store for this agent, don't fetch
    if (conversationsFromStore.length > 0) return;
  }, [agentId, fetchConversations, conversationsFromStore.length]);

  const sortedConversations = useMemo(() => {
    const list = Array.isArray(conversationsFromStore) ? conversationsFromStore : [];
    
    // Filter conversations based on search term
    const searchFilteredList = searchTerm.trim() 
      ? list.filter(conv => 
          conv.last_message?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : list;

    // Further filter by selected label if any
    const labelFilteredList = selectedLabel
      ? searchFilteredList.filter(conv => conv.label === selectedLabel)
      : searchFilteredList;
    
    return [...labelFilteredList].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [conversationsFromStore, searchTerm, selectedLabel]);

  const availableLabels = useMemo(() => {
    if (!agent?.label_choices || !Array.isArray(agent.label_choices)) {
      return [];
    }
    return agent.label_choices.filter((label: string): label is string => 
      label !== null && label !== undefined && label.trim() !== ''
    ).sort();
  }, [agent?.label_choices]);

  return (
    <Flex bg="#FFFFFF" align="stretch" height="100%" overflow="hidden">
      {/* Left conversations list */}
      <Box w="360px" className="ca-bg-light-pink ca-border-right-gray" display="flex" flexDirection="column">
        {/* Fixed header section */}
        <VStack align="stretch" gap={1} p={4} flexShrink={0}>
          <Text className="ca-color-primary" fontSize="xl" fontWeight="bold">Conversations</Text>
          <HStack w="100%">
            <Input
              placeholder="Search conversations..."
              color="#0A0807"
              variant="outline"
              size="sm"
              border="1px solid #A0AEC0"
              bg="#F7F2FA"
              borderRadius="full"
              _focus={{ bg: "#FFF6FF", borderColor: "#D200D3" }}
              _hover={{ bg: "#FFF6FF" }}
              mb={2}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button
              variant="ghost"
              minW="36px"
              h="36px"
              w="36px"
              p={0}
              mb={2}
              ml={1}
              color="#A0AEC0"
              fontSize="20px"
              borderRadius="full"
              bg="#F7F2FA"
              _hover={{ 
                bg: "#FFF6FF", 
                color: "#D200D3",
                borderColor: "#D200D3",
                transform: "scale(1.05)",
                boxShadow: "0 4px 12px rgba(210, 0, 211, 0.3)"
              }}
              _active={{ bg: "#E2E8F0" }}
              display="flex"
              alignItems="center"
              justifyContent="center"
              aria-label="Search"
              boxShadow="none"
              border="1px solid #E2E8F0"
              transition="all 0.2s ease"
              onClick={() => setIsSemanticSearchModalOpen(true)}
            >
              <img src="/search.png" alt="Search" width="44" height="44" />
            </Button>
          </HStack>
          <Box display="flex" flexWrap="wrap" gap={2}>
            <Button
              className="ca-color-primary ca-bg-light-gray"
              borderRadius="full"
              bg={selectedLabel === null ? "#D200D3" : "#E2E8F0"}
              color={selectedLabel === null ? "#FFFFFF" : "#0A0807"}
              px={4}
              py={2}
              border={selectedLabel === null ? "1px solid #D200D3" : "1px solid #A0AEC0"}
              _hover={{ 
                bg: selectedLabel === null ? "#B800B9" : "#CBD5E0",
                borderColor: selectedLabel === null ? "#B800B9" : "#A0AEC0"
              }}
              fontWeight={selectedLabel === null ? "semibold" : "normal"}
              boxShadow={selectedLabel === null ? "0 2px 4px rgba(210, 0, 211, 0.2)" : "none"}
              onClick={() => setSelectedLabel(null)}
              transition="all 0.2s ease"
            >
              All
            </Button>
            {availableLabels.map((label: string) => (
              <Button
                key={label}
                className="ca-color-primary ca-bg-light-gray"
                borderRadius="full"
                bg={selectedLabel === label ? "#D200D3" : "#E2E8F0"}
                color={selectedLabel === label ? "#FFFFFF" : "#0A0807"}
                px={4}
                py={2}
                border={selectedLabel === label ? "1px solid #D200D3" : "1px solid #A0AEC0"}
                _hover={{ 
                  bg: selectedLabel === label ? "#B800B9" : "#CBD5E0",
                  borderColor: selectedLabel === label ? "#B800B9" : "#A0AEC0"
                }}
                fontSize="sm"
                fontWeight={selectedLabel === label ? "semibold" : "normal"}
                boxShadow={selectedLabel === label ? "0 2px 4px rgba(210, 0, 211, 0.2)" : "none"}
                onClick={() => setSelectedLabel(label)}
                transition="all 0.2s ease"
              >
                {label}
              </Button>
            ))}
            <Circle
              size="36px"
              className="ca-bg-light-gray"
              bg="#E2E8F0"
              color="#0A0807"
              border="1px solid #A0AEC0"
              _hover={{ bg: '#CBD5E0' }}
              display="flex"
              alignItems="center"
              justifyContent="center"
              cursor="pointer"
              onClick={() => setIsAddLabelOpen(true)}
              transition="all 0.2s ease"
            >
              +
            </Circle>
          </Box>
        </VStack>

        {/* Scrollable conversations list */}
        <Box flex={1} overflowY="auto" px={4} pb={4}>
          <VStack align="stretch" gap={1}>
            {sortedConversations.map((conv) => (
              <HStack
                key={conv.id}
                p={3}
                gap={3}
                borderRadius="xl"
                className="ca-border-gray"
                border="1px solid"
                borderColor={convID === conv.id ? '#D200D3' : '#E2E8F0'}
                bg={convID === conv.id ? '#FFF6FF' : '#FFFFFF'}
                boxShadow={convID === conv.id ? '0 2px 8px rgba(210, 0, 211, 0.15)' : 'none'}
                _hover={{ bg: '#FFF6FF', borderColor: '#D200D3' }}
                cursor="pointer"
                onClick={() => {
                  useStore.getState().setSelectedConversationId(conv.id);
                  navigate(`/analyze/conversations`);
                }}
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
                  <HStack justifyContent="space-between" w="100%">
                    <Text className="ca-color-primary" fontSize="sm" fontWeight={convID === conv.id ? 'semibold' : 'medium'} overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap" flex={1}>
                      {conv.title}
                    </Text>
                    <Tooltip content="Learn about context changes." showArrow>
                      <Button
                        size="xs"
                        minW="auto"
                        w="24px"
                        h="24px"
                        p={0}
                        aria-label="Info"
                        variant="solid"
                        className=" ca-color-primary"
                        color="#0A0807"
                        _hover={{ bg: '#CBD5E0', color: '#D200D3' }}
                        _active={{ bg: '#E1DFE0' }}
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            const details = await fetchContextChangeDetails?.(conv.id);
                            if (details) {
                              setContextChangeModalData(details);
                            } else {
                              setContextChangeModalData(null);
                            }
                          } finally {
                            setContextChangeModalOpen(true);
                          }
                        }}
                      >
                        <LuInfo />
                      </Button>
                    </Tooltip>
                    <Badge colorScheme="purple" variant="subtle">{conv.label}</Badge>
                  </HStack>
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

        {/* Fixed footer section */}
        <Box p={4} flexShrink={0}>
          <Button
            className="ca-color-primary ca-bg-light-gray"
            borderRadius="full"
            bg="#E2E8F0"
            color="#0A0807"
            px={4}
            py={2}
            border="1px solid #A0AEC0"
            _hover={{ bg: '#CBD5E0' }}
            onClick={() => {
              if (fetchConversations) fetchConversations(agentId);
            }}
            w="100%"
            loading={isLoadingConversations}
            loadingText="Refreshing..."
            spinner={<Spinner size="sm" color="#0A0807" />}
            disabled={isLoadingConversations}
          >
            Refresh
          </Button>
        </Box>

        <AddLabelModal
          isOpen={isAddLabelOpen}
          onClose={() => setIsAddLabelOpen(false)}
          agent={agent}
          onSubmit={async (newLabel) => {
            // Refresh the agent data to show the new label
            if (fetchAgents) {
              await fetchAgents();
            }
            console.log('Label added:', newLabel);
          }}
        />
      </Box>

      {/* Right conversation messages pane */}
      <Box flex={1} bg="#FFF6FF" height="100%" overflow="hidden">
        {convID ? (
          <ConversationMessages />
        ) : (
          <Box h="100%" display="flex" alignItems="center" justifyContent="center">
            <Text className="ca-color-quaternary" fontSize="sm">Select a conversation to view messages</Text>
          </Box>
        )}
      </Box>
      
      <ContextChangeModal
      isOpen={isContextChangeModalOpen}
      onClose={() => setContextChangeModalOpen(false)}
      data={contextChangeModalData ?? mockConversationContextData}
    />
    
    <SemanticSearchModal
      isOpen={isSemanticSearchModalOpen}
      onClose={() => setIsSemanticSearchModalOpen(false)}
    />
    </Flex>

    
  );
};

export default AnalyzeConversations;