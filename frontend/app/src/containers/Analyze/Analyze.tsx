import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Box, 
  Flex, 
  Image,
  Center,
  Text,
  Button,
  VStack
} from "@chakra-ui/react";
import SideNavigationBar from '@components/SideNavigationBar';
import AddAgentModal from '@components/AddAgentModal';
import AnalyzeMain from './AnalyzeMain';
import { useStore } from '@store/index';

const Analyze = () => {
  const { agentId } = useParams();
  const fetchAgents = useStore((s: any) => s.fetchAgents);
  const [isAddAgentOpen, setIsAddAgentOpen] = useState(false);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  return (
    <Flex minH="100%" bg="#FFFFFF" align="stretch">
      <SideNavigationBar selectedAgentId={agentId} />

      <Box flex={1} position="relative" bg="#FFFFFF" minH="100%" >
        {agentId ? (
          <AnalyzeMain />
        ) : (
          <Center h="100vh" position="relative">
            <VStack gap={10} align="stretch">
              <Text fontSize="4xl" fontWeight="semibold" color="#000000" textAlign="center">Start the magic</Text>
              <Button
                type="button"
                bg="#B6ED43"
                color="#0A0807"
                _hover={{
                  bg: '#A0D936',
                  transform: 'translateY(-4px) scale(1.04)',
                  boxShadow: '0 16px 40px rgba(182, 237, 67, 0.3)'
                }}
                _active={{ bg: '#8BC530' }}
                borderRadius="full"
                px={24}
                py={10}
                fontSize="4xl"
                fontWeight="semibold"
                transition="all 0.2s cubic-bezier(.4,0,.2,1)"
                boxShadow="0 8px 32px rgba(182, 237, 67, 0.15)"
                onClick={() => setIsAddAgentOpen(true)}
              >
                Add Agents
              </Button>
            </VStack>
          </Center>
        )}
      </Box>
      <AddAgentModal isOpen={isAddAgentOpen} onClose={() => setIsAddAgentOpen(false)} />
    </Flex>
  );
};

export default Analyze;
