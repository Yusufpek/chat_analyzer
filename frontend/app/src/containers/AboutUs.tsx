import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  SimpleGrid,
  Icon,
} from '@chakra-ui/react';
import { 
  FaChartLine, 
  FaComments, 
  FaBrain, 
  FaClock,
  FaHeart,
  FaChartBar
} from 'react-icons/fa';

const AboutUs = () => {
  const bgColor = 'white';
  const purpleBg = '#621CB1';
  const primaryColor = '#0A0807';
  const secondaryColor = '#B6ED43';

  return (
    <Box>
      {/* Top Section - White Background */}
      <Box bg={bgColor} py={16}>
        <Container maxW="container.lg">
          {/* Banner */}
          <Box
            bg={secondaryColor}
            color={primaryColor}
            px={6}
            py={3}
            borderRadius="xl"
            textAlign="center"
            mb={8}
            maxW="600px"
            mx="auto"
          >
            <Text fontSize="lg" fontWeight="semibold">
              Chat Analyzer is proudly developed by <strong>Junior Newton AI Team</strong>
            </Text>
          </Box>

          {/* Main Heading */}
          <VStack gap={6} textAlign="center">
            <Heading
              as="h1"
              size="2xl"
              color={primaryColor}
              fontWeight="bold"
              mb={4}
            >
              About Us
            </Heading>
            
            <Text
              fontSize="xl"
              color={primaryColor}
              maxW="800px"
              lineHeight="1.8"
            >
              Chat Analyzer is an AI-powered conversation analysis tool. It's your intelligent 
              companion that instantly processes your chat conversations and extracts meaningful 
              insights like it's been part of your team forever. No complex setup, no scripts — 
              just upload your conversations and let AI do the analysis.
            </Text>
          </VStack>
        </Container>
      </Box>

      {/* Middle Section - Purple Background */}
      <Box bg={purpleBg} py={16}>
        <Container maxW="container.lg">
          <VStack gap={8} textAlign="center">
            <Text
              fontSize="xl"
              color="white"
              maxW="700px"
              lineHeight="1.8"
            >
              Chat Analyzer offers a simplified yet powerful version of conversation analytics, 
              designed for quick setup and smooth, efficient insight generation.
            </Text>

            {/* Features Grid */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6} w="full" mt={8}>
              <VStack
                bg="white"
                p={6}
                borderRadius="xl"
                gap={4}
                textAlign="center"
                boxShadow="lg"
              >
                <Icon as={FaChartLine} w={8} h={8} color={purpleBg} />
                <Text fontWeight="bold" color={primaryColor}>
                  Conversation Statistics
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Total conversations, messages, words, and character counts
                </Text>
              </VStack>

              <VStack
                bg="white"
                p={6}
                borderRadius="xl"
                gap={4}
                textAlign="center"
                boxShadow="lg"
              >
                <Icon as={FaClock} w={8} h={8} color={purpleBg} />
                <Text fontWeight="bold" color={primaryColor}>
                  Activity Patterns
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Most active days, times, and conversation frequency trends
                </Text>
              </VStack>

              <VStack
                bg="white"
                p={6}
                borderRadius="xl"
                gap={4}
                textAlign="center"
                boxShadow="lg"
              >
                <Icon as={FaBrain} w={8} h={8} color={purpleBg} />
                <Text fontWeight="bold" color={primaryColor}>
                  Sentiment Analysis
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Positive, negative, and neutral sentiment distribution
                </Text>
              </VStack>

              <VStack
                bg="white"
                p={6}
                borderRadius="xl"
                gap={4}
                textAlign="center"
                boxShadow="lg"
              >
                <Icon as={FaComments} w={8} h={8} color={purpleBg} />
                <Text fontWeight="bold" color={primaryColor}>
                  Keyword Analysis
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Most frequently used keywords and popular topics
                </Text>
              </VStack>

              <VStack
                bg="white"
                p={6}
                borderRadius="xl"
                gap={4}
                textAlign="center"
                boxShadow="lg"
              >
                <Icon as={FaHeart} w={8} h={8} color={purpleBg} />
                <Text fontWeight="bold" color={primaryColor}>
                  Tone Analysis
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Formal/informal, polite/harsh, humorous/serious detection
                </Text>
              </VStack>

              <VStack
                bg="white"
                p={6}
                borderRadius="xl"
                gap={4}
                textAlign="center"
                boxShadow="lg"
              >
                <Icon as={FaChartBar} w={8} h={8} color={purpleBg} />
                <Text fontWeight="bold" color={primaryColor}>
                  Response Analytics
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Response time stats and message length analysis
                </Text>
              </VStack>
            </SimpleGrid>

            <Button
              size="lg"
              bg="white"
              color={purpleBg}
              _hover={{ bg: 'gray.100' }}
              px={8}
              py={4}
              borderRadius="xl"
              fontWeight="bold"
              mt={8}
            >
              Try Chat Analyzer
            </Button>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
};

export default AboutUs;
