import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  VStack, 
  HStack,
  Text,
  useDisclosure,
  Menu,
  Portal,
  Spinner
} from "@chakra-ui/react";
import { useStore } from '@store/index';
import AddAgentModal from '@Modals/AddAgentModal';
import ManageAgentsModal from '@Modals/ManageAgentsModal';
import { CONNECTION_TYPE_LABELS, CONNECTION_TYPES, ConnectionType } from '@constants/connectionTypes';

interface SideNavigationBarProps {
  selectedAgentId?: string;
  onAddConversation?: () => void;
}

const CONNECTION_TYPE_EMOJIS: Record<ConnectionType, string> = {
  [CONNECTION_TYPES.JOTFORM]: '/jotform.png',
  [CONNECTION_TYPES.CHATGPT]: '/gpt.png',
  [CONNECTION_TYPES.FILE]: '📁',
};

const SideNavigationBar: React.FC<SideNavigationBarProps> = ({ 
  selectedAgentId,
  onAddConversation 
}) => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isNavClose, setIsNavClose] = useState(false);
  const selectedConnectionType = useStore((s: any) => s.selectedConnectionType) as ConnectionType;
  const setSelectedConnectionType = useStore((s: any) => s.setSelectedConnectionType);
  const { 
    open: isAddAgentOpen, 
    onOpen: onOpenAddAgent, 
    onClose: onCloseAddAgent 
  } = useDisclosure();
  const { 
    open: isManageAgentsOpen, 
    onOpen: onManageAgentsOpen, 
    onClose: onManageAgentsClose 
  } = useDisclosure();
  const navigate = useNavigate();
  const getAgentsForConnection = useStore((s: any) => s.getAgentsForConnection);
  const fetchAgentsForConnection = useStore((s: any) => s.fetchAgentsForConnection);
  const authStatus = useStore((s: any) => s.authStatus);
  const authInitialized = useStore((s: any) => s.authInitialized);
  const isLoadingAgents = useStore((s: any) => s.isLoadingAgents);

  const handleAddAgent = () => {
    if (!authInitialized || authStatus !== 'authenticated') {
      navigate('/login');
      return;
    }
    if (onAddConversation) {
      onAddConversation();
    } else {
      onOpenAddAgent();
    }
  };

  useEffect(() => {
    if (!authInitialized || authStatus !== 'authenticated') return;
    const cached = getAgentsForConnection(selectedConnectionType);
    if (!cached || cached.length === 0) {
      fetchAgentsForConnection(selectedConnectionType);
    }
  }, [selectedConnectionType, authStatus, authInitialized, getAgentsForConnection]);

  const filteredAgents = getAgentsForConnection(selectedConnectionType) || [];

  return (
    <>
      <Box
        position="relative"
        bg="#FFF4FF"
        boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
        transition="width 0.3s cubic-bezier(0.7,0,0.3,1)"
        width={isNavOpen ? "280px" : "90px"}
        onMouseEnter={() => setIsNavOpen(true)}
        onMouseLeave={() => setIsNavOpen(false)}
        overflow="hidden"
        minH="100vh"
        flexShrink={0}
        alignSelf="stretch"
      >
        <VStack gap={4} p={4} align="stretch" h="100%" justify="space-between">
          <VStack gap={4} align="stretch">
            {/* Connection Type Header */}
            <Box
              bg="#FFF6FF"
              border="2px solid #0A0807"
              borderRadius="lg"
              mb={2}
              boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
            >
              <Menu.Root>
                <Menu.Trigger asChild>
                  <Button
                    variant="ghost"
                    w="100%"
                    h="56px"
                    p={0}
                    pl={isNavOpen ? 4 : 0}
                    pr={isNavOpen ? 4 : 0}
                    bg="transparent"
                    color="#0A0807"
                    _hover={{ bg: "rgba(210, 0, 211, 0.1)" }}
                    _active={{ bg: "rgba(210, 0, 211, 0.15)" }}
                    _focus={{ bg: "transparent", boxShadow: "none" }}
                    _focusVisible={{ bg: "transparent", boxShadow: "none" }}
                    _expanded={{ bg: "rgba(210, 0, 211, 0.1)" }}
                    transition="all 0.35s cubic-bezier(0.4, 0, 0.2, 1)"
                    position="relative"
                    justifyContent="center"
                  >
                    <HStack justify={isNavOpen ? "flex-start" : "center"} w="100%" gap={2}
                      transition="all 0.35s cubic-bezier(0.4, 0, 0.2, 1)"
                    >
                        {CONNECTION_TYPE_EMOJIS[selectedConnectionType].startsWith('/') ? (
                          <Box
                            w="36px"
                            h="36px"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                          >
                            <img 
                              src={CONNECTION_TYPE_EMOJIS[selectedConnectionType]}
                              alt="JotForm"
                              style={{ width: "100%", height: "100%", objectFit: "contain" }}
                            />
                          </Box>
                        ) : (
                          <Text fontSize="xl">
                            {CONNECTION_TYPE_EMOJIS[selectedConnectionType]}
                          </Text>
                        )}
                        {isNavOpen && (
                          <Text
                            fontSize="lg"
                            fontWeight="bold"
                            color="#0A0807"
                            whiteSpace="nowrap"
                          >
                            {CONNECTION_TYPE_LABELS[selectedConnectionType]}
                          </Text>
                        )}
                      </HStack>
                  </Button>
                </Menu.Trigger>
                <Portal>
                  <Menu.Positioner>
                    <Menu.Content
                      bg="#FFF6FF"
                      border="2px solid #0A0807"
                      borderRadius="md"
                      boxShadow="0 4px 8px rgba(0, 0, 0, 0.15)"
                      w="245px"
                      py={1}
                    >
                      {Object.entries(CONNECTION_TYPE_LABELS).map(([key, label]) => (
                        <Menu.Item
                          key={key}
                          value={key}
                          bg="transparent"
                          color="#0A0807"
                          _hover={{ 
                            bg: "rgba(210, 0, 211, 0.1)",
                            color: "#D200D3"
                          }}
                          _active={{ bg: "rgba(210, 0, 211, 0.2)" }}
                          onClick={() => setSelectedConnectionType(key as ConnectionType)}
                        >
                          <HStack gap={2}>
                            {CONNECTION_TYPE_EMOJIS[key as ConnectionType].startsWith('/') ? (
                              <Box
                                w="20px"
                                h="20px"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                              >
                                <img 
                                  src={CONNECTION_TYPE_EMOJIS[key as ConnectionType]}
                                  alt={label}
                                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                                />
                              </Box>
                            ) : (
                              <Text fontSize="lg">
                                {CONNECTION_TYPE_EMOJIS[key as ConnectionType]}
                              </Text>
                            )}
                            <Text>{label}</Text>
                          </HStack>
                        </Menu.Item>
                      ))}
                    </Menu.Content>
                  </Menu.Positioner>
                </Portal>
              </Menu.Root>
            </Box>

            {/* Agent List */}
            <VStack gap={3} align="stretch">
              {isLoadingAgents ? (
                <Box p={2} textAlign="center">
                  <Spinner size="md" color="#000000"/>
                </Box>
              ) : (
                filteredAgents.map((agent: any) => (
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
                      bg: "#000000",
                      transform: "scale(1.1)"
                    }}
                    transition="all 0.2s ease"
                  >
                    <img 
                      src={agent.avatar_url || "public/avatars/bottts-1755467181840.png"}
                      style={{ width: "100%", height: "100%", borderRadius: "50%" }}
                    />
                  </Box>
                  {isNavOpen && (
                    <VStack align="start" flex={1} gap={0} minW={0}>
                      <Text 
                        fontSize="sm" 
                        fontWeight="medium"
                        whiteSpace="nowrap"
                        overflow="hidden"
                        textOverflow="ellipsis"
                        transition="opacity 0.2s ease"
                        opacity={isNavOpen ? 1 : 0}
                        color="#0A0807"
                        w="100%"
                        minW={0}
                      >
                        {agent.name}
                      </Text>
                      
                    </VStack>
                  )}
                </HStack>
              ))
              )}
            </VStack>

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
                  textAlign="center"
                >
                  Add Agent
                </Text>
              )}
            </Button>

            {/* Settings/Manage Agents Button */}
            <Button
            bg="#615568"
            color="white"
            size="sm"
            onClick={onManageAgentsOpen}
            justifyContent={isNavOpen ? "flex-start" : "center"}
            px={isNavOpen ? 4 : 2}
            minW="auto"
            w="100%"
            borderRadius="full"
            _hover={{
              bg: "#B6ED43",
              color: "black",
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
                <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
              </svg>
            </Box>
            {isNavOpen && (
              <Text 
                whiteSpace="nowrap" 
                overflow="hidden"
                transition="opacity 0.2s ease"
                opacity={isNavOpen ? 1 : 0}
                fontWeight="medium"
                textAlign="center"
              >
                Manage Agents
              </Text>
            )}
            </Button>
          </VStack>
        </VStack>
      </Box>
      
      {/* Add Agent Modal */}
      <AddAgentModal isOpen={isAddAgentOpen} onClose={onCloseAddAgent} />
      
      {/* Manage Agents Modal */}
      <ManageAgentsModal isOpen={isManageAgentsOpen} onClose={onManageAgentsClose} />
    </>
  );
};

export default SideNavigationBar;
