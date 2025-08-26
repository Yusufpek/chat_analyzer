import React, { useState } from 'react';
import { Box, Button, VStack, Text, HStack, Flex } from '@chakra-ui/react';
import AddConversationModal from './AddConversationModal';
import JotformAgentsModal from './JotformAgentsModal';

type AddAgentModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const AddAgentModal: React.FC<AddAgentModalProps> = ({ isOpen, onClose }) => {
  const [isAddConversationOpen, setIsAddConversationOpen] = useState(false);
  const [isJotformAgentsOpen, setIsJotformAgentsOpen] = useState(false);

  const handleClose = () => {
    onClose();
    setIsAddConversationOpen(false);
  };

  const openAddConversation = () => {
    onClose();
    setIsAddConversationOpen(true);
  };
  const openJotformAgents = () => {
    onClose();
    setIsJotformAgentsOpen(true);
  };

  return (
    <>
      {/* Root Modal */}
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="rgba(0, 0, 0, 0.5)"
        zIndex={1000}
        display={isOpen ? 'flex' : 'none'}
        alignItems="center"
        justifyContent="center"
        onClick={handleClose}
      >
        <Box
          bg="white"
          borderRadius="xl"
          p={8}
          maxW="md"
          w="90%"
          maxH="90vh"
          overflowY="auto"
          onClick={(e) => e.stopPropagation()}
        >
          <Flex justifyContent="space-between" alignItems="center" mb={6}>
            <Text fontSize="2xl" fontWeight="bold" color="#0A0807">
              Add Agent
            </Text>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              color="#615568"
              _hover={{ color: '#D200D3' }}
            >
              ✕
            </Button>
          </Flex>

          <VStack gap={6} align="stretch">
            <Button
              type="button"
              onClick={openJotformAgents}
              bg="#B6ED43"
              color="#0A0807"
              _hover={{ 
                bg: '#A0D936',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 20px rgba(182, 237, 67, 0.3)'
              }}
              _active={{ bg: '#8BC530' }}
              borderRadius="full"
              px={8}
              py={6}
              fontSize="md"
              fontWeight="semibold"
              transition="all 0.2s ease"
            >
              Add Agent From Jotform
            </Button>
            <Button
              type="button"
              onClick={openAddConversation}
              bg="#D200D3"
              color="white"
              _hover={{ 
                bg: '#D200D3',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 20px rgba(210, 0, 211, 0.3)'
              }}
              borderRadius="full"
              px={8}
              py={6}
              fontSize="md"
              fontWeight="semibold"
              transition="all 0.2s ease"
            >
              Add Agent From Txt, csv or json
            </Button>
          </VStack>
        </Box>
      </Box>

      {/* Nested: AddConversationModal */}
      <AddConversationModal
        isOpen={isAddConversationOpen}
        onClose={() => setIsAddConversationOpen(false)}
      />
      {/* Nested: JotformAgentsModal */}
      <JotformAgentsModal
        isOpen={isJotformAgentsOpen}
        onClose={() => setIsJotformAgentsOpen(false)}
        onCloseRoot={handleClose}
      />
    </>
  );
};

export default AddAgentModal;


