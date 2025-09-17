import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, VStack, HStack, Text, Input, Button, Spinner, Badge } from '@chakra-ui/react';
import GenericModal from '@components/ui/Modal';
import { request } from '@api/requestLayer';
import { useStore } from '@store/index';

type SemanticSearchModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const SemanticSearchModal: React.FC<SemanticSearchModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const agentId = useStore((s: any) => s.selectedAgentId);
  const handleSearch = async () => {
    const trimmed = (searchQuery || '').trim();
    if (!trimmed) return;
    if (!agentId) {
      setError('Please select an agent first.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const content = await useStore.getState().qdrantSearch(agentId, trimmed);
      setResults(content);
    } catch (e: any) {
      setError(e?.message || 'Search failed');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setResults([]);
    setError(null);
  };

  return (
    <GenericModal
      isOpen={isOpen}
      onClose={onClose}
      title="Semantic Search"
      maxW="2xl"
    >
      <VStack gap={6} align="stretch">
        {/* Search Bar */}
        <Box>
          <HStack gap={2} w="100%">
            <Input
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="lg"
              color="#0A0807"
              bg="#F7F2FA"
              border="1px solid #A0AEC0"
              borderRadius="full"
              _focus={{ 
                bg: "#FFF6FF", 
                borderColor: "#D200D3",
                boxShadow: "0 0 0 1px #D200D3"
              }}
              _hover={{ bg: "#FFF6FF" }}
              _placeholder={{ color: "#A0AEC0" }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch();
              }}
            />
            <Button
              onClick={handleSearch}
              disabled={!searchQuery.trim() || !agentId}
              bg="#D200D3"
              color="white"
              _hover={{ bg: '#b000b1' }}
              borderRadius="full"
            >
              Search
            </Button>
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                color="#A0AEC0"
                _hover={{ color: "#D200D3" }}
                minW="auto"
                w="32px"
                h="32px"
                p={0}
                borderRadius="full"
              >
                ✕
              </Button>
            )}
          </HStack>
        </Box>

        {/* Search Results Area */}
        <Box
          minH="400px"
          bg="#F7F2FA"
          borderRadius="xl"
          border="1px solid #E2E8F0"
          p={2}
        >
          {isLoading ? (
            <HStack justify="center" align="center" h="100%" gap={3}>
              <Spinner size="sm" />
              <Text color="#615568">Searching…</Text>
            </HStack>
          ) : error ? (
            <Box textAlign="center">
              <Text color="#D200D3" fontSize="sm">{error}</Text>
            </Box>
          ) : results.length > 0 ? (
            <VStack align="stretch" gap={2}>
              {results.map((item: any, idx: number) => {
                const content = item?.payload?.content ?? '';
                const conversationId = item?.payload?.conversation_id || item?.payload?.conversationId || item?.payload?.conversation_id_str || null;
                const score = typeof item?.score === 'number' ? item.score : null;
                return (
                  <Box
                    key={idx}
                    p={3}
                    bg="white"
                    borderRadius="md"
                    border="1px solid #E2E8F0"
                    _hover={{ backgroundColor: '#FFF6FF' }}
                    cursor="pointer"
                    onClick={() => {
                      if (!conversationId) return;
                      try {
                        useStore.getState().setSelectedConversationId(conversationId);
                        navigate('/analyze/conversations', { state: { highlightText: content } });
                        onClose();
                      } catch (e) {}
                    }}
                  >
                    <HStack justify="space-between" align="start">
                      <Text
                        color="#0A0807"
                        _hover={{
                          textDecoration: 'underline',
                          textDecorationColor: '#D200D3',
                          textUnderlineOffset: '4px',
                          textDecorationThickness: '2px',
                        }}
                        transition="text-decoration 0.2s"
                      >
                        {content}
                      </Text>
                      {score !== null ? (
                        <HStack>
                          <Text color="#615568" fontSize="sm">Score:</Text>
                          <Badge colorScheme="purple" variant="subtle">{score.toFixed(3)}</Badge>
                        </HStack>
                      ) : null}
                    </HStack>
                  </Box>
                );
              })}
            </VStack>
          ) : (
            <VStack gap={4} align="center" justify="center" h="100%">
              <Text color="#615568" fontSize="lg" textAlign="center">
                Start typing to search your conversations
              </Text>
              <Text color="#A0AEC0" fontSize="sm" textAlign="center">
                Use semantic search to find relevant conversations based on meaning, not just keywords
              </Text>
            </VStack>
          )}
        </Box>
      </VStack>
    </GenericModal>
  );
};

export default SemanticSearchModal;
