import React from 'react';
import { useParams } from 'react-router-dom';
import { 
  Box, 
  Flex, 
  Image,
  Center,
  Text
} from "@chakra-ui/react";
import SideNavigationBar from '@components/SideNavigationBar';
import AnalyzeMain from './AnalyzeMain';

const mockAgents = [
  { id: 1, name: "OpenAI 1", image: "/avatars/bottts-1755467181840.png" },
  { id: 2, name: "Jotform Agent Sue", image: "/avatars/bottts-1755467217616.png" },
  { id: 3, name: "Technical Help", image: "/avatars/bottts-1755467265882.png" },
];

const Analyze = () => {
  const { agentId } = useParams();

  return (
    <Flex h="100vh" bg="#FFFFFF">
      <SideNavigationBar agents={mockAgents} selectedAgentId={agentId} />

      <Box flex={1} position="relative" bg="#FFF6FF">
        {agentId ? (
          <AnalyzeMain />
        ) : (
          <Center h="100%" position="relative">
            <Box
              position="absolute"
              right="50%"
              top="30%"
              transform="translateY(-50%)"
              zIndex={2}
              zoom={5}
            >
              <Image
                src="/arrrw.png"
                alt="Add new conversation guide"
                w="120px"
                h="auto"
                filter="drop-shadow(0 4px 8px rgba(0,0,0,0.1))"
                rotate="260deg"
              />
            </Box>
            <Box
              position="absolute"
              right="15%"
              top="45%"
              transform="translateY(-50%)"
              zIndex={3}
            >
              <Text
                fontSize="3rem"
                fontWeight="medium"
                color="#000000"
                textShadow="0 2px 4px rgba(0,0,0,0.1)"
                fontFamily="sans-serif"
                letterSpacing="1px"
              >
                Add new conversation
              </Text>
            </Box>
          </Center>
        )}
      </Box>
    </Flex>
  );
};

export default Analyze;
