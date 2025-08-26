import React from 'react';
import { Box, Text } from '@chakra-ui/react';

interface OpenAISignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}


const OpenAISignInModal: React.FC<OpenAISignInModalProps> = ({ isOpen, onClose }) => {

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      width="100%"
      height="100%"
      bg="rgba(0, 0, 0, 0.5)"
      zIndex={1000}
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <Text>OpenAI Sign In</Text>
    </Box>
  )
}

export default OpenAISignInModal;