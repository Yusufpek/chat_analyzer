import React from 'react';
import { Box, Flex, Text, VStack, HStack, Badge, Timeline } from '@chakra-ui/react';
import { LuShip, LuPackage, LuCheck } from 'react-icons/lu';
import GenericModal from '@components/ui/Modal';

type Topic = {
  topic: string;
  details: string;
  start_message: string;
  end_message?: string;
};

type ContextChange = {
  from_topic: string;
  to_topic: string;
  change_message: string;
  details?: string;
};

type ConversationContextData = {
  conversation_id: string;
  overall_context?: string;
  topics: Topic[];
  context_changes?: ContextChange[];
  created_at?: string;
  updated_at?: string;
};

type ContextChangeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  data: ConversationContextData | null;
};

const IndicatorIcon: React.FC<{ index: number; isLast: boolean }> = ({ index, isLast }) => {
  if (isLast) return <LuCheck />;
  if (index === 0) return <LuShip />;
  return <LuPackage />;
};

const TimelineItem: React.FC<{ topic: Topic; index: number; isLast: boolean; expanded: boolean; onToggle: () => void }> = ({ topic, index, isLast, expanded, onToggle }) => {
  const Icon = isLast ? LuCheck : index === 0 ? LuShip : LuPackage;
  return (
    <Timeline.Item>
      <Timeline.Connector>
        <Timeline.Separator />
        <Timeline.Indicator>
          <Icon />
        </Timeline.Indicator>
      </Timeline.Connector>
      <Timeline.Content>
        <Timeline.Title>
          <HStack gap={2} align="center">
            <Text fontSize="lg" fontWeight="bold" className="ca-color-primary">{topic.topic}</Text>
          </HStack>
        </Timeline.Title>
        <Text mt={2} className="ca-color-senary" cursor="pointer" onClick={onToggle}>
          {expanded ? 'Hide details' : 'Details'}
        </Text>
        {expanded && (
          <>
            <Timeline.Description>
              <Text className="ca-color-quaternary">{topic.details}</Text>
            </Timeline.Description>
            <VStack align="stretch" gap={2} mt={2}>
              <Box className="ca-bg-light-pink" borderRadius="md" p={3}>
                <Text fontWeight="semibold" className="ca-color-senary">Start</Text>
                <Text className="ca-color-primary" mt={1}>{topic.start_message}</Text>
              </Box>
              {topic.end_message && (
                <Box borderRadius="md" p={3} border="1px solid #E1DFE0">
                  <Text fontWeight="semibold" className="ca-color-senary">End</Text>
                  <Text className="ca-color-primary" mt={1}>{topic.end_message}</Text>
                </Box>
              )}
            </VStack>
          </>
        )}
      </Timeline.Content>
    </Timeline.Item>
  );
};

const ContextChangeModal: React.FC<ContextChangeModalProps> = ({ isOpen, onClose, data }) => {
  const topics = data?.topics || [];
  const createdAt = data?.created_at ? new Date(data.created_at) : null;
  const [expandedTopics, setExpandedTopics] = React.useState<Set<number>>(new Set());

  const toggleTopic = (index: number) => {
    setExpandedTopics(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <GenericModal
      isOpen={isOpen}
      onClose={onClose}
      title="Conversation Timeline"
      maxW="800px"
      bodyProps={{ px: 0 }}
    >
      <Box px={8} pb={4}>
        {data?.overall_context && (
          <Box mb={4}>
            <Text className="ca-color-quaternary">Overall Context</Text>
            <Text className="ca-color-primary" mt={1}>{data.overall_context}</Text>
          </Box>
        )}

        <Timeline.Root>
          {topics.map((t, i) => (
            <TimelineItem
              key={`${t.topic}-${i}`}
              topic={t}
              index={i}
              isLast={i === topics.length - 1}
              expanded={expandedTopics.has(i)}
              onToggle={() => toggleTopic(i)}
            />
          ))}
        </Timeline.Root>

        {data?.context_changes && data.context_changes.length > 0 && (
          <Box mt={8}>
            <Text fontSize="lg" fontWeight="bold" className="ca-color-primary" mb={2}>Context Changes</Text>
            <VStack align="stretch" gap={3}>
              {data.context_changes.map((c, idx) => (
                <Box key={`${c.from_topic}-${c.to_topic}-${idx}`} className="ca-border-gray" borderRadius="md" p={3}>
                  <HStack justify="space-between" align="center" mb={1}>
                    <Text className="ca-color-primary">{c.from_topic} → {c.to_topic}</Text>
                    <Badge className="ca-bg-secondary">&nbsp;</Badge>
                  </HStack>
                  {c.details && <Text className="ca-color-quaternary" mb={1}>{c.details}</Text>}
                  <Text className="ca-color-primary">{c.change_message}</Text>
                </Box>
              ))}
            </VStack>
          </Box>
        )}
      </Box>
    </GenericModal>
  );
};

export default ContextChangeModal;


