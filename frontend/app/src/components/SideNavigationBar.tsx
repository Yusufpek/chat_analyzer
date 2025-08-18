import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  VStack, 
  HStack,
  Text,
  useDisclosure
} from "@chakra-ui/react";
import AddConversationModal from './AddConversationModal';

interface Agent {
  id: number;
  name: string;
  image: string;
}

interface SideNavigationBarProps {
  agents: Agent[];
  selectedAgentId?: string;
  onAddConversation?: () => void;
}

const SideNavigationBar: React.FC<SideNavigationBarProps> = ({ 
  agents,
  selectedAgentId,
  onAddConversation 
}) => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const { open: isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();

  const handleAddAgent = () => {
    if (onAddConversation) {
      onAddConversation();
    } else {
      onOpen();
    }
  };

  return (
    <>
      <Box
        position="relative"
        bg="#FFF4FF"
        boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
        transition="width 0.3s cubic-bezier(0.7,0,0.3,1)"
        width={isNavOpen ? "250px" : "80px"}
        onMouseEnter={() => setIsNavOpen(true)}
        onMouseLeave={() => setIsNavOpen(false)}
        overflow="hidden"
      >
        <VStack gap={4} p={4} align="stretch">
          {/* Add Agent Button */}
          <Button
            bg="#D200D3"
            color="#0A0807"
            size="sm"
            onClick={handleAddAgent}
            justifyContent={isNavOpen ? "flex-start" : "center"}
            px={isNavOpen ? 4 : 2}
            minW="auto"
            w="100%"
            borderRadius="full"
            _hover={{
              bg: "#B6ED43",
              color: "#0A0807",
              transform: "scale(1.05)",
              boxShadow: "0 4px 12px rgba(210, 0, 211, 0.3)"
            }}
            _active={{
              transform: "scale(0.95)"
            }}
            transition="all 0.2s ease"
            h="40px"
          >
            <Box
              w="24px"
              h="24px"
              borderRadius="full"
              bg="rgba(255, 255, 255, 0.2)"
              display="flex"
              alignItems="center"
              justifyContent="center"
              mr={isNavOpen ? 2 : 0}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </Box>
            {isNavOpen && (
              <Text 
                whiteSpace="nowrap" 
                overflow="hidden"
                transition="opacity 0.2s ease"
                opacity={isNavOpen ? 1 : 0}
                fontWeight="medium"
              >
                Add Conversation
              </Text>
            )}
          </Button>

          {/* Agent List */}
          <VStack gap={3} align="stretch">
            {agents.map((agent) => (
              <HStack
                key={agent.id}
                gap={3}
                p={2}
                borderRadius="md"
                _hover={{ 
                  bg: "#FFF6FF",
                  border: "1px solid #D200D3"
                }}
                cursor="pointer"
                transition="all 0.2s ease"
                minH="40px"
                alignItems="center"
                border="1px solid transparent"
                onClick={() => navigate(`/analyze/${agent.id}`)}
                bg={selectedAgentId === agent.id.toString() ? "#FFF6FF" : "transparent"}
                borderColor={selectedAgentId === agent.id.toString() ? "#D200D3" : "transparent"}
              >
                <Box
                  w="32px"
                  h="32px"
                  borderRadius="full"
                  bg="#000000"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  color="#FFFFFF"
                  fontSize="sm"
                  fontWeight="bold"
                  flexShrink={0}
                  _hover={{
                    bg: "#D200D3",
                    transform: "scale(1.1)"
                  }}
                  transition="all 0.2s ease"
                >
                  <img 
                    src={agent.image} 
                    style={{ width: "100%", height: "100%", borderRadius: "50%" }}
                  />
                </Box>
                {isNavOpen && (
                  <Text 
                    fontSize="sm" 
                    fontWeight="medium"
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    transition="opacity 0.2s ease"
                    opacity={isNavOpen ? 1 : 0}
                    flex={1}
                    color="#0A0807"
                  >
                    {agent.name}
                  </Text>
                )}
              </HStack>
            ))}
          </VStack>
        </VStack>
      </Box>

      {/* Add Conversation Modal */}
      <AddConversationModal isOpen={isOpen} onClose={onClose} />
    </>
  );
};

export default SideNavigationBar;
