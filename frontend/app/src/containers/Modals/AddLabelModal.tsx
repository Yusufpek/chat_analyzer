import React, { useState } from 'react';
import { Box, Button, Input, Text } from '@chakra-ui/react';
import GenericModal from '@components/ui/Modal';
import { request } from '@api/requestLayer';
import { AgentItem } from '@store/agents';
import '../../styles/colors.css';

export type AddLabelModalProps = {
  isOpen: boolean;
  onClose: () => void;
  agent: AgentItem | null;
  onSubmit?: (labelText: string) => void;
};

const AddLabelModal: React.FC<AddLabelModalProps> = ({ isOpen, onClose, agent, onSubmit }) => {
  const [labelText, setLabelText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!agent || !labelText.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Get current labels or empty array if null
      const currentLabels = agent.label_choices || [];
      
      // Add new label if it doesn't already exist
      const newLabels = currentLabels.includes(labelText.trim()) 
        ? currentLabels 
        : [...currentLabels, labelText.trim()];

      // Send PUT request to update agent labels
      await request(`/api/agent/${agent.id}/`, {
        method: 'PUT',
        body: JSON.stringify({
          label_choices: newLabels
        })
      });

      // Call the optional onSubmit callback
      if (onSubmit) {
        onSubmit(labelText.trim());
      }

      // Reset form and close modal
      setLabelText('');
      onClose();
    } catch (error) {
      console.error('Failed to add label:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GenericModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Label"
      maxW="lg"
      bodyProps={{ p: 0 }}
    >
      <Box >
        <Box mb={4}>
          <Text mb={2} className="ca-color-quaternary">Label</Text>
          <Input
            placeholder="Enter label"
            value={labelText}
            color="#0A0807"
            onChange={(e) => setLabelText(e.target.value)}
            className="ca-color-placeholder"
            borderColor="#D3D3D3"
            _hover={{ borderColor: '#C6A7C2' }}
            _focus={{ borderColor: '#D200D3', boxShadow: '0 0 0 1px #D200D3' }}
            bg="#FFFFFF"
          />
        </Box>
        <Button
          onClick={handleSubmit}
          className="ca-bg-tertiary"
          color="#FFFFFF"
          _hover={{ bg: '#B600B7' }}
          loading={isSubmitting}
          loadingText="Adding..."
          disabled={!labelText.trim() || !agent}
        >
          Submit
        </Button>
      </Box>
    </GenericModal>
  );
};

export default AddLabelModal;
