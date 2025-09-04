import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text
} from '@chakra-ui/react';
import { useStore } from '@store/index';
import { CONNECTION_TYPE_LABELS } from '@constants/connectionTypes';
import GenericModal from '@components/ui/Modal';

interface ManageAgentsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ManageAgentsModal: React.FC<ManageAgentsModalProps> = ({ isOpen, onClose }) => {
  const agents = useStore((s: any) => s.agents);
  const deleteAgent = useStore((s: any) => s.deleteAgent);

  return (
    <GenericModal
      isOpen={isOpen}
      onClose={onClose}
      title="Manage Agents"
      maxW="xl"
      containerProps={{ bg: '#FFF4FF' }}
    >
      <VStack gap={4} align="stretch">
        {agents && agents.length > 0 ? (
          agents.map((agent: any) => (
            <HStack
              key={agent.id}
              p={4}
              borderRadius="lg"
              bg="white"
              border="1px solid #E2E8F0"
              _hover={{
                borderColor: "#D200D3",
                boxShadow: "0 2px 8px rgba(210, 0, 211, 0.1)"
              }}
              transition="all 0.2s ease"
            >
              <Box
                w="48px"
                h="48px"
                borderRadius="full"
                bg="#000000"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="#FFFFFF"
                fontSize="sm"
                fontWeight="bold"
                flexShrink={0}
              >
                <img 
                  src={agent.avatar_url || "public/avatars/bottts-1755467181840.png"}
                  style={{ width: "100%", height: "100%", borderRadius: "50%" }}
                  alt={agent.name}
                />
              </Box>
              <VStack align="start" flex={1} gap={1}>
                <Text fontWeight="semibold" color="#0A0807" fontSize="md">
                  {agent.name}
                </Text>
                <Text fontSize="xs" color="#615568">
                  {CONNECTION_TYPE_LABELS[agent.connection_type as keyof typeof CONNECTION_TYPE_LABELS] || 'Unknown'} Agent
                </Text>
              </VStack>
              <Box
                as="button"
                onClick={async () => {
                  try {
                    await deleteAgent(agent.id);
                  } catch (error) {
                    console.error('Failed to delete agent:', error);
                  }
                }}
                bg="#E53E3E"
                color="white"
                px={3}
                py={2}
                borderRadius="md"
                fontSize="sm"
                fontWeight="medium"
                _hover={{
                  bg: "#C53030",
                  transform: "scale(1.05)",
                  boxShadow: "0 2px 8px rgba(229, 62, 62, 0.3)"
                }}
                _active={{
                  transform: "scale(0.95)"
                }}
                transition="all 0.2s ease"
              >
                Delete
              </Box>
            </HStack>
          ))
        ) : (
          <Box
            p={8}
            textAlign="center"
            color="gray.500"
            bg="white"
            borderRadius="lg"
            border="1px dashed #E2E8F0"
          >
            <Text>No agents found</Text>
          </Box>
        )}
      </VStack>
    </GenericModal>
  );
};

export default ManageAgentsModal;
