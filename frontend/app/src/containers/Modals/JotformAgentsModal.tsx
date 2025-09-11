import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, VStack, Text, HStack, Avatar, Center, Spinner, Checkbox } from '@chakra-ui/react';
import { useStore } from '@store/index';
import { useNavigate } from 'react-router-dom';
import { routePaths } from '@constants/routePaths';
import { AgentItem, JotformAgentsResponse } from '@store/agents';
import { CONNECTION_TYPES } from '@constants/connectionTypes';
import GenericModal from '@components/ui/Modal';

type JotformAgentsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCloseRoot?: () => void;
};

const JotformAgentsModal: React.FC<JotformAgentsModalProps> = ({ isOpen, onClose, onCloseRoot }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [agents, setAgents] = useState<JotformAgentsResponse | null>(null);
  const [selectedAgents, setSelectedAgents] = useState<AgentItem[]>([]);
  const addAgents = useStore((s: any) => s.addAgents);
  const fetchJotformAgents = useStore((s: any) => s.fetchJotformAgents);
  const syncJotformAgents = useStore((s: any) => s.syncJotformAgents);
  const navigateTo = useNavigate();

  const syncedIdSet = useMemo(() => new Set((agents?.synced ?? []).map(a => a.id)), [agents]);
  const newlySelectedAgents = useMemo(
    () => selectedAgents.filter(a => !syncedIdSet.has(a.id)),
    [selectedAgents, syncedIdSet]
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    let isMounted = true;
    const loadAgents = async () => {
      try {
        setIsLoading(true);
        const agentsData = await fetchJotformAgents();
        if (!isMounted) return;
        if (agentsData) {
          setAgents(agentsData);
          setSelectedAgents(agentsData.synced);
        }
      } catch (error) {
        console.error('Failed to fetch agents:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadAgents();
    return () => {
      isMounted = false;
    };
  }, [isOpen, fetchJotformAgents]);

  const isAgentSelected = (agent: AgentItem) => selectedAgents.some(a => a.id === agent.id);

  const handleAgentSelection = (agent: AgentItem, isChecked: boolean) => {
    setSelectedAgents(prev => {
      const isAlreadySelected = prev.some(a => a.id === agent.id);
      if (isChecked && !isAlreadySelected) {
        return [...prev, agent];
      }
      if (!isChecked && isAlreadySelected) {
        return prev.filter(a => a.id !== agent.id);
      }
      return prev;
    });
  };

  const resetModal = () => {
    setAgents(null);
    setSelectedAgents([]);
    setIsLoading(false);
  };

  const handleClose = () => {
    onClose();
    resetModal();
  };

  const handleSubmitAgents = async () => {
    if (newlySelectedAgents.length === 0) {
      alert('Please select at least one agent');
      return;
    }

    try {
      setIsLoading(true);
      await syncJotformAgents(newlySelectedAgents);

      onClose();
      if (onCloseRoot) {
        onCloseRoot();
      }
      navigateTo(routePaths.analyze());
      resetModal();
    } catch (error) {
      console.error('Failed to sync agents:', error);
      alert('Failed to sync selected agents.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GenericModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Select Jotform Agents"
      maxW={'4xl'}
    >
      {isLoading && (
        <Center py={12} minH="40vh" flexDirection="column" gap={3}>
          <Spinner color="#D200D3" />
          <Text color="#615568">Loading...</Text>
        </Center>
      )}

      {!isLoading && agents && (
        <VStack gap={6} align="stretch">
          {agents.synced.length > 0 && (
            <Box>
              <Text fontSize="md" fontWeight="medium" color="#0A0807" mb={3}>
                Already Synced Agents ({agents.synced.length})
              </Text>
              <VStack gap={2} align="stretch" maxH="200px" overflowY="auto">
                {agents.synced.map((agent) => (
                  <HStack key={agent.id} gap={3} p={3} bg="gray.50" borderRadius="md">
                    <Avatar.Root size="sm">
                      <Avatar.Fallback bg="#621CB1" color="white">
                        {agent.name.slice(0, 1).toUpperCase()}
                      </Avatar.Fallback>
                      {agent.avatar_url && <Avatar.Image src={agent.avatar_url} />}
                    </Avatar.Root>
                    <Text fontSize="md" color="#0A0807" flex={1}>
                      {agent.name}
                    </Text>
                    <Checkbox.Root defaultChecked disabled>
                      <Checkbox.HiddenInput />
                      <Checkbox.Control />
                    </Checkbox.Root>
                  </HStack>
                ))}
              </VStack>
            </Box>
          )}

          {agents.unsynced.length > 0 && (
            <Box>
              <Text fontSize="md" fontWeight="medium" color="#0A0807" mb={3}>
                Available Agents ({agents.unsynced.length})
              </Text>
              <VStack gap={2} align="stretch" maxH="300px" overflowY="auto">
                {agents.unsynced.map((agent) => (
                  <HStack key={agent.id} gap={3} p={3} bg="white" border="1px solid" borderColor="gray.200" borderRadius="md">
                    <Avatar.Root size="sm">
                      <Avatar.Fallback bg="#621CB1" color="white">
                        {agent.name.slice(0, 1).toUpperCase()}
                      </Avatar.Fallback>
                      {agent.avatar_url && <Avatar.Image src={agent.avatar_url} />}
                    </Avatar.Root>
                    <Text fontSize="md" color="#0A0807" flex={1}>
                      {agent.name}
                    </Text>
                    <Checkbox.Root
                      defaultChecked={isAgentSelected(agent)}
                      onCheckedChange={(details: any) => handleAgentSelection(agent, details.checked)}
                    >
                      <Checkbox.HiddenInput />
                      <Checkbox.Control />
                    </Checkbox.Root>
                  </HStack>
                ))}
              </VStack>
            </Box>
          )}

          {agents.synced.length === 0 && agents.unsynced.length === 0 && (
            <Center py={8}>
              <Text color="#615568">No agents found in your Jotform account.</Text>
            </Center>
          )}
        </VStack>
      )}

      <HStack mt={8} gap={4} justifyContent="center">
        <Button
          type="button"
          variant="outline"
          onClick={handleClose}
          borderColor="#615568"
          color="#615568"
          _hover={{ borderColor: '#D200D3', color: '#D200D3' }}
        >
          Close
        </Button>
        <Button
          type="button"
          bg="#D200D3"
          color="white"
          _hover={{ bg: '#B6ED43', color: '#0A0807' }}
          onClick={handleSubmitAgents}
          disabled={isLoading || newlySelectedAgents.length === 0}
        >
          {`Sync ${newlySelectedAgents.length} Agent${newlySelectedAgents.length !== 1 ? 's' : ''}`}
        </Button>
      </HStack>
    </GenericModal>
  );
};

export default JotformAgentsModal;


