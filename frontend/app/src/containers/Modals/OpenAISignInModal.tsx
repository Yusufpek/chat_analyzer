import React from 'react';
import { Text } from '@chakra-ui/react';
import GenericModal from '@components/ui/Modal';

interface OpenAISignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}


const OpenAISignInModal: React.FC<OpenAISignInModalProps> = ({ isOpen, onClose }) => {

  return (
    <GenericModal isOpen={isOpen} onClose={onClose} title="OpenAI Sign In">
      <Text>OpenAI Sign In</Text>
    </GenericModal>
  )
}

export default OpenAISignInModal;