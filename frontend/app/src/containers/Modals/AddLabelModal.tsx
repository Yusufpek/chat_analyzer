import React, { useState } from 'react';
import { Box, Button, Input, Text } from '@chakra-ui/react';
import GenericModal from '@components/ui/Modal';
import '../../styles/colors.css';

export type AddLabelModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (labelText: string) => void;
};

const AddLabelModal: React.FC<AddLabelModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [labelText, setLabelText] = useState('');

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(labelText);
    }
    onClose();
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
        >
          Submit
        </Button>
      </Box>
    </GenericModal>
  );
};

export default AddLabelModal;
