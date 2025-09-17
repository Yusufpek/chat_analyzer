import React, { useState } from 'react';
import { Box, Button, HStack, Text, VStack, Badge, Center } from '@chakra-ui/react';
import GenericModal from '@components/ui/Modal';
import { AgentItem } from '@store/agents';
import { request } from '@api/requestLayer';
import { useStore } from '@store/index';

export type ManageLabelsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  agent: AgentItem | null;
  onLabelDeleted?: () => void;
};

const ManageLabelsModal: React.FC<ManageLabelsModalProps> = ({ isOpen, onClose, agent, onLabelDeleted }) => {
  const [deletingLabel, setDeletingLabel] = useState<string | null>(null);
  const updateAgentLabels = useStore((s: any) => s.updateAgentLabels);
  const labels = Array.isArray(agent?.label_choices) ? agent!.label_choices! : [];

  const handleDeleteClick = async (label: string) => {
    if (!agent?.id) return;
    try {
      setDeletingLabel(label);
      const updatedLabels = labels.filter((l) => l !== label);
      await request(`/api/agent/${agent.id}/`, {
        method: 'PUT',
        body: JSON.stringify({ label_choices: updatedLabels }),
      });
      
      // Update store immediately
      updateAgentLabels(agent.id, updatedLabels);
      
      // Close modal and refresh data
      onClose();
      if (onLabelDeleted) {
        onLabelDeleted();
      }
    } catch (error) {
      console.error('Failed to update labels:', error);
    } finally {
      setDeletingLabel(null);
    }
  };

  return (
    <GenericModal
      isOpen={isOpen}
      onClose={onClose}
      title="Manage Labels"
      maxW="lg"
      bodyProps={{ p: 0 }}
    >
      <VStack align="stretch" gap={3}>
        {!agent ? (
          <Center py={8}>
            <Text color="#615568">Agent bulunamadı.</Text>
          </Center>
        ) : labels.length === 0 ? (
          <Center py={8}>
            <Text color="#615568">Bu agent için hiç label yok.</Text>
          </Center>
        ) : (
          labels.map((label) => (
            <HStack key={label} justifyContent="space-between" className="ca-border-gray" border="1px solid" borderRadius="md" p={3} bg="#FFFFFF">
              <Badge colorScheme="purple" borderRadius="md" px={2} py={1} fontSize="0.75rem">
                {label}
              </Badge>
              <Button
                type="button"
                size="sm"
                variant="outline"
                borderColor="#E53E3E"
                color="#E53E3E"
                _hover={{ borderColor: '#C53030', color: '#C53030' }}
                onClick={() => handleDeleteClick(label)}
                disabled={deletingLabel === label}
              >
                {deletingLabel === label ? 'Deleting...' : 'Delete'}
              </Button>
            </HStack>
          ))
        )}
      </VStack>
    </GenericModal>
  );
};

export default ManageLabelsModal;


