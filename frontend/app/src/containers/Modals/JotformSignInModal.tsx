import React, { useState } from 'react';
import { Box, Button, VStack, Text, Input, HStack, Avatar, Center, Spinner, Checkbox } from '@chakra-ui/react';
import { useStore } from '@store/index';
import { useNavigate } from 'react-router-dom';
import { routePaths } from '@constants/routePaths';
import { AgentItem, JotformAgentsResponse } from '@store/agents';
import GenericModal from '@components/ui/Modal';

//TODO

// most frequent keyword basınca o mesaja gtisin.


// search at conversation, // keyword ile arama


type JotformSignInModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const JotformSignInModal: React.FC<JotformSignInModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [syncInterval, setSyncInterval] = useState('30');
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [agents, setAgents] = useState<JotformAgentsResponse | null>(null);
  const [selectedAgents, setSelectedAgents] = useState<AgentItem[]>([]);
  const [connectionId, setConnectionId] = useState<number | null>(null);
  const fetchJotformAgents = useStore((s: any) => s.fetchJotformAgents);
  const syncJotformAgents = useStore((s: any) => s.syncJotformAgents);
  const createConnection = useStore((s: any) => s.createConnection);
  const authStatus = useStore((s: any) => s.authStatus);
  const navigateTo = useNavigate();

  const steps = [
    { title: 'API Key' },
    { title: 'Select Agents' },
  ];

  const handleCreateConnection = async () => {
    
    if (authStatus !== 'authenticated') {
      onClose();
      navigateTo(routePaths.login());
      return;
    }

    if (!apiKey.trim()) {
      alert('Please enter your API key');
      return;
    }

    try {
      setIsLoading(true);
      const payload = {
        connection_type: "jotform",
        api_key: apiKey,
        sync_interval: parseInt(syncInterval),
        config: {}
      };

      const connection = await createConnection(payload);
      if (connection) {
        setConnectionId(connection.id);
        await loadAgents();
        setCurrentStep(1);
      } else {
        throw new Error('Failed to create connection');
      }
    } catch (error) {
      console.error('Failed to create connection:', error);
      alert('Failed to create connection. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAgents = async () => {
    try {
      const agentsData = await fetchJotformAgents();
      if (agentsData) {
        setAgents(agentsData);
        setSelectedAgents(agentsData.synced);
      }
    } catch (error) {
      console.error('Failed to fetch agents:', error);
      alert('Failed to fetch agents from Jotform.');
    }
  };

  const handleAgentSelection = (agent: AgentItem, isChecked: boolean) => {
    if (isChecked) {
      setSelectedAgents(prev => [...prev, agent]);
    } else {
      setSelectedAgents(prev => prev.filter(a => a.id !== agent.id));
    }
  };

  const handleSubmitAgents = async () => {
    if (selectedAgents.length === 0) {
      alert('Please select at least one agent');
      return;
    }

    try {
      setIsLoading(true);
      await syncJotformAgents(selectedAgents);
      onClose();
      navigateTo(routePaths.analyze());
      resetModal();
    } catch (error) {
      console.error('Failed to sync agents:', error);
      alert('Failed to sync selected agents.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetModal = () => {
    setApiKey('');
    setSyncInterval('30');
    setCurrentStep(0);
    setIsLoading(false);
    setAgents(null);
    setSelectedAgents([]);
    setConnectionId(null);
  };

  const handleClose = () => {
    onClose();
    resetModal();
  };

  const isAgentSelected = (agent: AgentItem) => {
    return selectedAgents.some(a => a.id === agent.id);
  };

  return (
    <GenericModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Sync with Jotform"
      maxW={currentStep === 1 ? '4xl' : 'md'}
    >
      <HStack gap={4} mb={8} justifyContent="center">
        {steps.map((step, index) => (
          <HStack key={index} gap={2}>
            <Box
              w="8"
              h="8"
              borderRadius="full"
              bg={index <= currentStep ? '#D200D3' : '#615568'}
              color="white"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="sm"
              fontWeight="bold"
            >
              {index + 1}
            </Box>
            <Text
              fontSize="sm"
              color={index <= currentStep ? '#0A0807' : '#615568'}
              fontWeight={index === currentStep ? 'bold' : 'normal'}
            >
              {step.title}
            </Text>
          </HStack>
        ))}
      </HStack>

      {currentStep === 0 && (
        <VStack gap={6} align="stretch">
          <Text fontSize="lg" fontWeight="medium" color="#0A0807">
            Enter your Jotform API Key and Sync Interval
          </Text>
          <VStack gap={4} align="stretch">
            <Box>
              <Text fontSize="md" fontWeight="medium" color="#0A0807" mb={2}>
                API Key
              </Text>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste your Jotform API key here..."
                size="lg"
                color="black"
                bg="white"
                borderColor="#615568"
                _focus={{ borderColor: '#D200D3', boxShadow: '0 0 0 1px #D200D3' }}
                _placeholder={{ color: '#615568' }}
              />
            </Box>
            <Box>
              <Text fontSize="md" fontWeight="medium" color="#0A0807" mb={2}>
                Sync Interval (minutes)
              </Text>
              <Input
                type="number"
                value={syncInterval}
                onChange={(e) => setSyncInterval(e.target.value)}
                placeholder="30"
                size="lg"
                color="black"
                bg="white"
                borderColor="#615568"
                _focus={{ borderColor: '#D200D3', boxShadow: '0 0 0 1px #D200D3' }}
                _placeholder={{ color: '#615568' }}
              />
            </Box>
          </VStack>
        </VStack>
      )}

      {currentStep === 1 && agents && (
        <VStack gap={6} align="stretch">
          <Text fontSize="lg" fontWeight="medium" color="#0A0807" textAlign="center">
            Select Agents to Sync
          </Text>
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

          {agents.unsynced.length > 0 && (
            <Box>
              <Text fontSize="md" fontWeight="medium" color="#0A0807" mb={3}>
                Available Agents ({agents.unsynced.length})
              </Text>
              <VStack gap={2} align="stretch" maxH="200px" overflowY="auto">
                {agents.unsynced.map((agent) => (
                  <HStack key={agent.id} gap={3} p={3} bg="white" border="1px solid" borderColor="gray.200" borderRadius="md">
                    <Avatar.Root size="sm">
                      <Avatar.Fallback bg="#621CB1" color="white">
                        {agent.name.slice(0, 1).toUpperCase()}
                      </Avatar.Fallback>
                      {agent.avatar_url &&<Avatar.Image src={agent.avatar_url} />}
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
        {currentStep === 0 && (
          <>
            <Button 
              type="button"
              variant="outline" 
              onClick={handleClose}
              borderColor="#615568"
              color="#615568"
              _hover={{ borderColor: '#D200D3', color: '#D200D3' }}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              onClick={handleCreateConnection}
              bg="#D200D3"
              color="white"
              _hover={{ bg: '#B6ED43', color: '#0A0807' }}
              disabled={isLoading || !apiKey.trim()}
            >
              {isLoading ? <Spinner size="sm" /> : 'Connect & Fetch Agents'}
            </Button>
          </>
        )}
        {currentStep === 1 && (
          <>
            <Button 
              type="button"
              variant="outline" 
              onClick={() => setCurrentStep(0)}
              borderColor="#615568"
              color="#615568"
              _hover={{ borderColor: '#D200D3', color: '#D200D3' }}
            >
              Previous
            </Button>
            <Button 
              type="button"
              onClick={handleSubmitAgents} 
              bg="#D200D3"
              color="white"
              _hover={{ bg: '#B6ED43', color: '#0A0807' }}
              disabled={isLoading || selectedAgents.length === 0}
            >
              {isLoading ? <Spinner size="sm" /> : `Sync ${selectedAgents.length} Agent${selectedAgents.length !== 1 ? 's' : ''}`}
            </Button>
          </>
        )}
      </HStack>
    </GenericModal>
  );
};

export default JotformSignInModal;


