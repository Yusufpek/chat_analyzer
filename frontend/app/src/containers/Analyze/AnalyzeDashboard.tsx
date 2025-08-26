import React from 'react';
import { useParams } from 'react-router-dom';
import { 
  Text, 
  Grid, 
  GridItem, 
  Box, 
  VStack, 
  HStack,
  Flex,
  Progress,
  Badge
} from '@chakra-ui/react';
import { useStore } from '@store/index';
import { CONNECTION_TYPE_LABELS } from '@constants/connectionTypes';

const AnalyzeDashboard = () => {
  const { convID } = useParams();
  const agents = useStore((s: any) => s.agents);
  const selectedConnectionType = useStore((s: any) => s.selectedConnectionType);
  const { agentId } = useParams();
  // Mock data for charts
  const sentimentData = [
    { month: "January", positive: 65, negative: 20, neutral: 15 },
    { month: "February", positive: 70, negative: 15, neutral: 15 },
    { month: "March", positive: 75, negative: 10, neutral: 15 },
    { month: "April", positive: 80, negative: 12, neutral: 8 },
    { month: "May", positive: 85, negative: 8, neutral: 7 },
    { month: "June", positive: 90, negative: 5, neutral: 5 },
  ];

  const messageVolumeData = [
    { month: "January", count: 150 },
    { month: "February", count: 180 },
    { month: "March", count: 220 },
    { month: "April", count: 190 },
    { month: "May", count: 250 },
    { month: "June", count: 280 },
  ];

  const sentimentDistribution = [
    { name: "Pozitif", value: 67, color: "#77AB0C" },
    { name: "Negatif", value: 15, color: "#FF0048" },
    { name: "Nötr", value: 18, color: "#8C8C8C" },
  ];

  const weeklyActivity = [
    { week: "Week 1", count: 45 },
    { week: "Week 2", count: 67 },
    { week: "Week 3", count: 89 },
    { week: "Week 4", count: 34 },
    { week: "Week 5", count: 56 },
  ];

  return (
    <Box 
      p={6} 
      className="ca-bg-light-pink" 
      minH="100%"
    >
      <VStack gap={6} align="stretch">
        {/* Header */}
        <Box>
          <Text className="ca-color-primary" fontSize="3xl" fontWeight="bold" mb={2}>
            Analyze Dashboard
          </Text>
                      <HStack gap={2}>
              <Text className="ca-color-quaternary" fontSize="sm">
                Agent:
              </Text>
              <Badge colorScheme="purple" variant="subtle">
                {agents?.find((a: any) => a.id === agentId)?.name || 'Unknown'}
              </Badge>
              <Text className="ca-color-quaternary" fontSize="sm">
                Type:
              </Text>
              <Badge colorScheme="teal" variant="subtle">
                {(() => {
                  const agent = agents?.find((a: any) => a.id === agentId);
                  const typeKey = (agent?.connection_type || selectedConnectionType) as keyof typeof CONNECTION_TYPE_LABELS;
                  return CONNECTION_TYPE_LABELS[typeKey] || 'Unknown';
                })()}
              </Badge>
            </HStack>
        </Box>

        {/* Stats Cards */}
        <Grid templateColumns="repeat(4, 1fr)" gap={4}>
          <Box className="ca-bg-quaternary-opacity-20 ca-border-gray" p={4} borderRadius="lg" border="1px solid">
            <VStack align="start" gap={2}>
              <Text className="ca-color-quaternary" fontSize="sm" fontWeight="medium">
                Total Messages
              </Text>
              <Text className="ca-color-primary" fontSize="2xl" fontWeight="bold">
                1,234
              </Text>
              <HStack>
                <Text className="ca-color-green" fontSize="sm">↑ 23.36%</Text>
                <Text className="ca-color-quaternary" fontSize="xs">compared to last month</Text>
              </HStack>
            </VStack>
          </Box>
          
          <Box className="ca-bg-quaternary-opacity-20 ca-border-gray" p={4} borderRadius="lg" border="1px solid">
            <VStack align="start" gap={2}>
              <Text className="ca-color-quaternary" fontSize="sm" fontWeight="medium">
                Positive Sentiment
              </Text>
              <Text className="ca-color-green" fontSize="2xl" fontWeight="bold">
                67%
              </Text>
              <HStack>
                <Text className="ca-color-green" fontSize="sm">↑ 12.5%</Text>
                <Text className="ca-color-quaternary" fontSize="xs">compared to last month</Text>
              </HStack>
            </VStack>
          </Box>
          
          <Box className="ca-bg-quaternary-opacity-20 ca-border-gray" p={4} borderRadius="lg" border="1px solid">
            <VStack align="start" gap={2}>
              <Text className="ca-color-quaternary" fontSize="sm" fontWeight="medium">
                Average Response Time
              </Text>
              <Text className="ca-color-primary" fontSize="2xl" fontWeight="bold">
                2.3s
              </Text>
              <HStack>
                <Text className="ca-color-green" fontSize="sm">↓ 8.2%</Text>
                <Text className="ca-color-quaternary" fontSize="xs">compared to last month</Text>
              </HStack>
            </VStack>
          </Box>
          
          <Box className="ca-bg-quaternary-opacity-20 ca-border-gray" p={4} borderRadius="lg" border="1px solid">
            <VStack align="start" gap={2}>
              <Text className="ca-color-quaternary" fontSize="sm" fontWeight="medium">
                Customer Satisfaction
              </Text>
              <Text className="ca-color-green" fontSize="2xl" fontWeight="bold">
                4.8/5
              </Text>
              <HStack>
                <Text className="ca-color-green" fontSize="sm">↑ 0.3</Text>
                <Text className="ca-color-quaternary" fontSize="xs">compared to last month</Text>
              </HStack>
            </VStack>
          </Box>
        </Grid>

        {/* Charts Grid */}
        <Grid templateColumns="repeat(2, 1fr)" gap={6}>
          {/* Sentiment Over Time */}
          <GridItem>
            <Box className="ca-bg-quaternary-opacity-20 ca-border-gray" p={6} borderRadius="lg" border="1px solid">
              <Text className="ca-color-primary" fontSize="xl" fontWeight="bold" mb={4}>
                Sentiment Over Time
              </Text>
              <VStack gap={3} align="stretch">
                {sentimentData.map((item, index) => (
                  <Box key={index}>
                    <HStack justify="space-between" mb={2}>
                      <Text className="ca-color-quaternary" fontSize="sm">{item.month}</Text>
                      <HStack gap={2}>
                        <Badge className="ca-bg-quaternary-opacity-20 ca-color-green" fontSize="xs">
                          Positive: {item.positive}%
                        </Badge>
                        <Badge className="ca-bg-quaternary-opacity-20 ca-color-red" fontSize="xs">
                          Negative: {item.negative}%
                        </Badge>
                      </HStack>
                    </HStack>
                    <HStack gap={1}>
                      <Box 
                        flex={1}
                        h="8px"
                        bg="#E1DFE0"
                        borderRadius="full"
                        overflow="hidden"
                      >
                        <Box 
                          h="100%"
                          bg="#77AB0C"
                          w={`${item.positive}%`}
                        />
                      </Box>
                      <Box 
                        flex={1}
                        h="8px"
                        bg="#E1DFE0"
                        borderRadius="full"
                        overflow="hidden"
                      >
                        <Box 
                          h="100%"
                          bg="#FF0048"
                          w={`${item.negative}%`}
                        />
                      </Box>
                      <Box 
                        flex={1}
                        h="8px"
                        bg="#E1DFE0"
                        borderRadius="full"
                        overflow="hidden"
                      >
                        <Box 
                          h="100%"
                          bg="#8C8C8C"
                          w={`${item.neutral}%`}
                        />
                      </Box>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            </Box>
          </GridItem>

          {/* Message Volume */}
          <GridItem>
            <Box className="ca-bg-quaternary-opacity-20 ca-border-gray" p={6} borderRadius="lg" border="1px solid">
              <Text className="ca-color-primary" fontSize="xl" fontWeight="bold" mb={4}>
                Message Volume
              </Text>
              <VStack gap={3} align="stretch">
                {messageVolumeData.map((item, index) => (
                  <Box key={index}>
                    <HStack justify="space-between" mb={2}>
                      <Text className="ca-color-quaternary" fontSize="sm">{item.month}</Text>
                      <Text className="ca-color-primary" fontSize="sm" fontWeight="medium">
                        {item.count} message
                      </Text>
                    </HStack>
                    <Box 
                      h="12px"
                      bg="#E1DFE0"
                      borderRadius="full"
                      overflow="hidden"
                    >
                      <Box 
                        h="100%"
                        bg="linear-gradient(90deg, #D200D3 0%, #621CB1 100%)"
                        w={`${(item.count / 300) * 100}%`}
                      />
                    </Box>
                  </Box>
                ))}
              </VStack>
            </Box>
          </GridItem>

          {/* Sentiment Distribution */}
          <GridItem>
            <Box className="ca-bg-quaternary-opacity-20 ca-border-gray" p={6} borderRadius="lg" border="1px solid">
              <Text className="ca-color-primary" fontSize="xl" fontWeight="bold" mb={4} textAlign="center">
                Sentiment Distribution
              </Text>
              <VStack gap={4} align="stretch">
                {sentimentDistribution.map((item, index) => (
                  <Box key={index}>
                    <HStack justify="space-between" mb={2}>
                      <Text className="ca-color-quaternary" fontSize="sm">{item.name}</Text>
                      <Text className="ca-color-primary" fontSize="sm" fontWeight="medium">
                        {item.value}%
                      </Text>
                    </HStack>
                    <Box 
                      h="10px"
                      bg="#E1DFE0"
                      borderRadius="full"
                      overflow="hidden"
                    >
                      <Box 
                        h="100%"
                        bg={item.color}
                        w={`${item.value}%`}
                      />
                    </Box>
                  </Box>
                ))}
              </VStack>
            </Box>
          </GridItem>

          {/* Weekly Activity */}
          <GridItem>
            <Box className="ca-bg-quaternary-opacity-20 ca-border-gray" p={6} borderRadius="lg" border="1px solid">
              <Text className="ca-color-primary" fontSize="xl" fontWeight="bold" mb={4}>
                Weekly Activity
              </Text>
              <VStack gap={3} align="stretch">
                {weeklyActivity.map((item, index) => (
                  <Box key={index}>
                    <HStack justify="space-between" mb={2}>
                      <Text className="ca-color-quaternary" fontSize="sm">{item.week}</Text>
                      <Text className="ca-color-primary" fontSize="sm" fontWeight="medium">
                        {item.count} activities
                      </Text>
                    </HStack>
                    <Box 
                      h="12px"
                      bg="#E1DFE0"
                      borderRadius="full"
                      overflow="hidden"
                    >
                      <Box 
                        h="100%"
                        bg="linear-gradient(90deg, #B6ED43 0%, #77AB0C 100%)"
                        w={`${(item.count / 100) * 100}%`}
                      />
                    </Box>
                  </Box>
                ))}
              </VStack>
            </Box>
          </GridItem>
        </Grid>
      </VStack>
    </Box>
  );
};

export default AnalyzeDashboard;
