import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Flex, HStack, SimpleGrid, Text, VStack, Badge } from '@chakra-ui/react';
import { useStore } from '@store/index';
import { CONNECTION_TYPE_LABELS } from '@constants/connectionTypes';

// Mock data types
type SentimentData = {
  date: string;
  positive: number;
  negative: number;
  neutral: number;
  total: number;
};

type EmotionData = {
  emotion: string;
  count: number;
  percentage: number;
  color: string;
};

type ToneData = {
  category: string;
  value: number;
  maxValue: number;
  description: string;
};

type LanguageComplexity = {
  metric: string;
  value: number;
  unit: string;
  description: string;
  status: 'good' | 'average' | 'poor';
};

type KeywordTrend = {
  keyword: string;
  frequency: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
};

const AnalyzeSentiment = () => {
  const { agentId } = useParams();

  const agents = useStore((s: any) => s.agents);
  const selectedConnectionType = useStore((s: any) => s.selectedConnectionType);
  const conversationsByAgent = useStore((s: any) => s.conversationsByAgent);

  const agent = useMemo(() => {
    if (!agentId) return null;
    return Array.isArray(agents) ? agents.find((a: any) => String(a.id) === String(agentId)) : null;
  }, [agents, agentId]);

  const conversations = useMemo(() => {
    if (!agentId) return [];
    const list = (conversationsByAgent?.[agentId] || []);
    return Array.isArray(list) ? list : [];
  }, [agentId, conversationsByAgent]);

  // Mock sentiment timeline data (last 7 days)
  const sentimentTimeline: SentimentData[] = useMemo(() => {
    const today = new Date();
    const data: SentimentData[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().slice(0, 10),
        positive: Math.floor(Math.random() * 50) + 20,
        negative: Math.floor(Math.random() * 20) + 5,
        neutral: Math.floor(Math.random() * 30) + 10,
        total: 0
      });
    }
    
    // Calculate totals
    return data.map(item => ({
      ...item,
      total: item.positive + item.negative + item.neutral
    }));
  }, []);

  // Mock emotional diversity data
  const emotionalDiversity: EmotionData[] = useMemo(() => [
    { emotion: 'Happy', count: 45, percentage: 35, color: 'green' },
    { emotion: 'Frustrated', count: 28, percentage: 22, color: 'red' },
    { emotion: 'Neutral', count: 25, percentage: 19, color: 'black' },
    { emotion: 'Excited', count: 15, percentage: 12, color: 'blue' },
    { emotion: 'Confused', count: 12, percentage: 9, color: 'orange' },
    { emotion: 'Satisfied', count: 5, percentage: 4, color: 'teal' }
  ], []);

  // Mock tone analysis data
  const toneAnalysis: ToneData[] = useMemo(() => [
    { category: 'Formal vs Informal', value: 65, maxValue: 100, description: '65% formal, 35% informal' },
    { category: 'Polite vs Harsh', value: 78, maxValue: 100, description: '78% polite, 22% harsh' },
    { category: 'Humorous vs Serious', value: 42, maxValue: 100, description: '42% humorous, 58% serious' },
    { category: 'Professional vs Casual', value: 71, maxValue: 100, description: '71% professional, 29% casual' },
    { category: 'Enthusiastic vs Reserved', value: 55, maxValue: 100, description: '55% enthusiastic, 45% reserved' }
  ], []);

  // Mock language complexity data
  const languageComplexity: LanguageComplexity[] = useMemo(() => [
    { metric: 'Average Sentence Length', value: 15.2, unit: 'words', description: 'Medium complexity', status: 'average' },
    { metric: 'Vocabulary Richness', value: 0.68, unit: 'diversity score', description: 'Good variety', status: 'good' },
    { metric: 'Reading Level', value: 8.5, unit: 'grade level', description: 'High school level', status: 'good' },
    { metric: 'Unique Words Ratio', value: 0.42, unit: 'ratio', description: 'Moderate repetition', status: 'average' },
    { metric: 'Complex Sentences', value: 23, unit: '%', description: 'Good balance', status: 'good' },
    { metric: 'Filler Words', value: 12, unit: '%', description: 'Acceptable level', status: 'average' }
  ], []);

  // Mock keyword trends data
  const keywordTrends: KeywordTrend[] = useMemo(() => [
    { keyword: 'customer service', frequency: 45, trend: 'up', change: 12 },
    { keyword: 'technical issue', frequency: 38, trend: 'down', change: -8 },
    { keyword: 'refund', frequency: 32, trend: 'up', change: 15 },
    { keyword: 'product quality', frequency: 28, trend: 'stable', change: 2 },
    { keyword: 'delivery time', frequency: 25, trend: 'down', change: -5 },
    { keyword: 'user experience', frequency: 22, trend: 'up', change: 18 },
    { keyword: 'pricing', frequency: 19, trend: 'stable', change: 1 },
    { keyword: 'support team', frequency: 16, trend: 'up', change: 9 }
  ], []);

  // Calculate overall sentiment metrics
  const overallSentiment = useMemo(() => {
    const totalPositive = sentimentTimeline.reduce((sum, day) => sum + day.positive, 0);
    const totalNegative = sentimentTimeline.reduce((sum, day) => sum + day.negative, 0);
    const totalNeutral = sentimentTimeline.reduce((sum, day) => sum + day.neutral, 0);
    const total = totalPositive + totalNegative + totalNeutral;
    
    return {
      positive: totalPositive,
      negative: totalNegative,
      neutral: totalNeutral,
      total,
      positivePercentage: total > 0 ? Math.round((totalPositive / total) * 100) : 0,
      negativePercentage: total > 0 ? Math.round((totalNegative / total) * 100) : 0,
      neutralPercentage: total > 0 ? Math.round((totalNeutral / total) * 100) : 0
    };
  }, [sentimentTimeline]);

  // Render helpers
  const StatCard = ({ label, value, hint, color = "primary" }: { label: string; value: React.ReactNode; hint?: string; color?: string }) => (
    <Box p={4} bg="#FFFFFF" border="1px solid" className="ca-border-gray" borderRadius="md">
      <Text className="ca-color-quaternary" fontSize="xs">{label}</Text>
      <Text className={`ca-color-${color}`} fontSize="xl" fontWeight="bold">{value}</Text>
      {hint ? <Text className="ca-color-quinary" fontSize="xs">{hint}</Text> : null}
    </Box>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'green';
      case 'average': return 'yellow';
      case 'poor': return 'red';
      default: return 'gray';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '↗';
      case 'down': return '↘';
      case 'stable': return '→';
      default: return '→';
    }
  };

  const getTrendColor = (trend: string, change: number) => {
    if (trend === 'up') return 'green';
    if (trend === 'down') return 'red';
    return 'gray';
  };

  return (
    <Box p={6} minH="100%" bg="#FFF6FF">
      <VStack align="stretch" gap={6}>
        <HStack justify="space-between" align="center">
          <VStack align="start" gap={0}>
            <Text className="ca-color-primary" fontSize="2xl" fontWeight="bold">
              Analyze Sentiment
            </Text>
            <HStack gap={2}>
              <Text className="ca-color-quaternary" fontSize="sm">
                Agent:
              </Text>
              <Badge colorScheme="purple" variant="subtle">
                {agent?.name || agentId || 'Unknown'}
              </Badge>
              <Text className="ca-color-quaternary" fontSize="sm">
                Type:
              </Text>
              <Badge colorScheme="teal" variant="subtle">
                {(() => {
                  const typeKey = (agent?.connection_type || selectedConnectionType) as keyof typeof CONNECTION_TYPE_LABELS;
                  return CONNECTION_TYPE_LABELS[typeKey] || 'Unknown';
                })()}
              </Badge>
            </HStack>
          </VStack>
          <Text className="ca-color-quinary" fontSize="xs">
            {conversations.length} conversations analyzed
          </Text>
        </HStack>

        {/* Overall Sentiment Overview */}
        <Box>
          <Text className="ca-color-primary" fontSize="lg" fontWeight="bold" mb={3}>Overall Sentiment Overview</Text>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
            <Box _hover={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}>
              <StatCard 
                label="Positive Sentiment" 
                value={`${overallSentiment.positivePercentage}%`} 
                hint={`${overallSentiment.positive} interactions`}
                color="green"
              />
            </Box>
            <Box _hover={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}>
              <StatCard 
                label="Negative Sentiment" 
                value={`${overallSentiment.negativePercentage}%`} 
                hint={`${overallSentiment.negative} interactions`}
                color="red"
              />
            </Box>
            <Box _hover={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}>
              <StatCard 
                label="Neutral Sentiment" 
                value={`${overallSentiment.neutralPercentage}%`} 
                hint={`${overallSentiment.neutral} interactions`}
              />
            </Box>
          </SimpleGrid>
        </Box>

        {/* Sentiment Timeline */}
        <Box>
          <Text className="ca-color-primary" fontSize="lg" fontWeight="bold" mb={3}>Sentiment Timeline (Last 7 Days)</Text>
          <Box p={6} bg="#FFFFFF" border="1px solid" className="ca-border-gray" borderRadius="lg" _hover={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }} transition="all 0.2s ease-in-out">
            <HStack mb={4} align="center">
              <Box w={3} h={3} bg="purple.400" borderRadius="full" />
              <Text className="ca-color-quaternary" fontSize="md" fontWeight="semibold">Daily Sentiment Distribution</Text>
            </HStack>
            <VStack align="stretch" gap={3}>
              {sentimentTimeline.map((day, index) => (
                <Box key={day.date} p={4} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.100">
                  <HStack justify="space-between" mb={2}>
                    <Text className="ca-color-primary" fontSize="sm" fontWeight="medium">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </Text>
                    <Text className="ca-color-quaternary" fontSize="xs">
                      {day.total} total interactions
                    </Text>
                  </HStack>
                  <VStack align="stretch" gap={2}>
                    <HStack justify="space-between">
                      <HStack gap={2}>
                        <Box w={3} h={3} bg="green.400" borderRadius="full" />
                        <Text className="ca-color-primary" fontSize="xs">Positive</Text>
                      </HStack>
                      <Text className="ca-color-quaternary" fontSize="xs">{day.positive} ({day.total > 0 ? Math.round((day.positive / day.total) * 100) : 0}%)</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <HStack gap={2}>
                        <Box w={3} h={3} bg="red.400" borderRadius="full" />
                        <Text className="ca-color-primary" fontSize="xs">Negative</Text>
                      </HStack>
                      <Text className="ca-color-quaternary" fontSize="xs">{day.negative} ({day.total > 0 ? Math.round((day.negative / day.total) * 100) : 0}%)</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <HStack gap={2}>
                        <Box w={3} h={3} bg="gray.400" borderRadius="full" />
                        <Text className="ca-color-primary" fontSize="xs">Neutral</Text>
                      </HStack>
                      <Text className="ca-color-quaternary" fontSize="xs">{day.neutral} ({day.total > 0 ? Math.round((day.neutral / day.total) * 100) : 0}%)</Text>
                    </HStack>
                  </VStack>
                </Box>
              ))}
            </VStack>
          </Box>
        </Box>

        {/* Emotional Diversity */}
        <Box>
          <Text className="ca-color-primary" fontSize="lg" fontWeight="bold" mb={3}>Emotional Diversity</Text>
          <Box p={6} bg="#FFFFFF" border="1px solid" className="ca-border-gray" borderRadius="lg" _hover={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }} transition="all 0.2s ease-in-out">
            <HStack mb={4} align="center">
              <Box w={3} h={3} bg="blue.400" borderRadius="full" />
              <Text className="ca-color-quaternary" fontSize="md" fontWeight="semibold">Emotion Distribution</Text>
            </HStack>
            <VStack align="stretch" gap={3}>
              {emotionalDiversity.map((emotion, index) => (
                <HStack key={emotion.emotion} justify="space-between" p={3} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.100">
                  <HStack gap={3}>
                    <Badge variant="solid" colorScheme={emotion.color as any} borderRadius="full" px={2}>
                      #{index + 1}
                    </Badge>
                    <Text className="ca-color-primary" fontSize="sm" fontWeight="medium">
                      {emotion.emotion}
                    </Text>
                  </HStack>
                  <HStack gap={2}>
                    <Text className="ca-color-quaternary" fontSize="sm">
                      {emotion.count} occurrences
                    </Text>
                    <Badge variant="subtle" colorScheme={emotion.color as any} fontSize="sm" px={3} py={1}>
                      {emotion.percentage}%
                    </Badge>
                  </HStack>
                </HStack>
              ))}
            </VStack>
          </Box>
        </Box>

        {/* Tone Analysis */}
        <Box>
          <Text className="ca-color-primary" fontSize="lg" fontWeight="bold" mb={3}>Tone Analysis</Text>
          <Box p={6} bg="#FFFFFF" border="1px solid" className="ca-border-gray" borderRadius="lg" _hover={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }} transition="all 0.2s ease-in-out">
            <HStack mb={4} align="center">
              <Box w={3} h={3} bg="green.400" borderRadius="full" />
              <Text className="ca-color-quaternary" fontSize="md" fontWeight="semibold">Communication Style Metrics</Text>
            </HStack>
            <VStack align="stretch" gap={4}>
              {toneAnalysis.map((tone, index) => (
                <Box key={tone.category} p={4} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.100">
                  <HStack justify="space-between" mb={2}>
                    <Text className="ca-color-primary" fontSize="sm" fontWeight="medium">
                      {tone.category}
                    </Text>
                    <Text className="ca-color-quaternary" fontSize="sm">
                      {tone.value}/{tone.maxValue}
                    </Text>
                  </HStack>
                    <Box w="100%" h="8px" bg="#D200D3" borderRadius="md" mb={2} overflow="hidden">
                      <Box
                        h="100%" 
                        bg="#D200D3" 
                        className="ca-border-gray"
                        borderRadius="md"
                        style={{ width: `${(tone.value / tone.maxValue) * 100}%` }}
                        transition="width 0.3s ease"
                      /> 
                    </Box>
                  <Text className="ca-color-quinary" fontSize="xs">
                    {tone.description}
                  </Text>
                </Box>
              ))}
            </VStack>
          </Box>
        </Box>

        {/* Language Complexity */}
        <Box>
          <Text className="ca-color-primary" fontSize="lg" fontWeight="bold" mb={3}>Language Complexity</Text>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
            {languageComplexity.map((metric) => (
              <Box key={metric.metric} _hover={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}>
                <Box p={4} bg="#FFFFFF" border="1px solid" className="ca-border-gray" borderRadius="md">
                  <HStack justify="space-between" mb={2}>
                    <Text className="ca-color-quaternary" fontSize="xs">{metric.metric}</Text>
                    <Badge 
                      variant="subtle" 
                      colorScheme={getStatusColor(metric.status) as any} 
                      fontSize="xs"
                    >
                      {metric.status}
                    </Badge>
                  </HStack>
                  <Text className="ca-color-primary" fontSize="lg" fontWeight="bold">
                    {metric.value} {metric.unit}
                  </Text>
                  <Text className="ca-color-quinary" fontSize="xs">{metric.description}</Text>
                </Box>
              </Box>
            ))}
          </SimpleGrid>
        </Box>

        {/* Keyword Trends */}
        <Box>
          <Text className="ca-color-primary" fontSize="lg" fontWeight="bold" mb={3}>Keyword & Phrase Trends</Text>
          <Box p={6} bg="#FFFFFF" border="1px solid" className="ca-border-gray" borderRadius="lg" _hover={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }} transition="all 0.2s ease-in-out">
            <HStack mb={4} align="center">
              <Box w={3} h={3} bg="orange.400" borderRadius="full" />
              <Text className="ca-color-quaternary" fontSize="md" fontWeight="semibold">Most Mentioned Topics</Text>
            </HStack>
            <VStack align="stretch" gap={3}>
              {keywordTrends.map((keyword, index) => (
                <HStack key={keyword.keyword} justify="space-between" p={3} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.100">
                  <HStack gap={3}>
                    <Badge variant="solid" colorScheme="purple" borderRadius="full" px={2}>
                      #{index + 1}
                    </Badge>
                    <Text className="ca-color-primary" fontSize="sm" fontWeight="medium">
                      "{keyword.keyword}"
                    </Text>
                  </HStack>
                  <HStack gap={2}>
                    <Text className="ca-color-quaternary" fontSize="sm">
                      {keyword.frequency} mentions
                    </Text>
                    <HStack gap={1}>
                      <Text className={`ca-color-${getTrendColor(keyword.trend, keyword.change)}`} fontSize="sm" fontWeight="bold">
                        {getTrendIcon(keyword.trend)}
                      </Text>
                      <Badge 
                        variant="subtle" 
                        colorScheme={getTrendColor(keyword.trend, keyword.change) as any} 
                        fontSize="xs" 
                        px={2} 
                        py={1}
                      >
                        {keyword.change > 0 ? '+' : ''}{keyword.change}%
                      </Badge>
                    </HStack>
                  </HStack>
                </HStack>
              ))}
            </VStack>
          </Box>
        </Box>

        <Box h="1px" bg="#E1DFE0" />
        <Text className="ca-color-quinary" fontSize="xs">
          Note: This analysis is based on mock data for demonstration purposes. Real sentiment analysis will be implemented when backend integration is available.
        </Text>
      </VStack>
    </Box>
  );
};

export default AnalyzeSentiment;
