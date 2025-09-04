import React, { useState } from 'react';
import { Button, VStack } from '@chakra-ui/react';
import AddConversationModal from '@Modals/AddConversationModal';
import AddFromProductModal from '@Modals/AddFromProductModal';
import GenericModal from '@components/ui/Modal';

type AddAgentModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const AddAgentModal: React.FC<AddAgentModalProps> = ({ isOpen, onClose }) => {
  const [isAddConversationOpen, setIsAddConversationOpen] = useState(false);
  const [isAddFromProductOpen, setIsAddFromProductOpen] = useState(false);

  const handleClose = () => {
    onClose();
    setIsAddConversationOpen(false);
  };

  const openAddConversation = () => {
    onClose();
    setIsAddConversationOpen(true);
  };
  const openAddFromProduct = () => {
    onClose();
    setIsAddFromProductOpen(true);
  };

  return (
    <>
      <GenericModal
        isOpen={isOpen}
        onClose={handleClose}
        title="Add Agent"
        maxW="md"
      >
        <VStack gap={6} align="stretch">
          <Button
            type="button"
            onClick={openAddFromProduct}
            bg="#B6ED43"
            color="#0A0807"
            _hover={{ 
              bg: '#A0D936',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 20px rgba(182, 237, 67, 0.3)'
            }}
            _active={{ bg: '#8BC530' }}
            borderRadius="full"
            px={8}
            py={6}
            fontSize="md"
            fontWeight="semibold"
            transition="all 0.2s ease"
          >
            Add Agent From From Product
          </Button>
          <Button
            type="button"
            onClick={openAddConversation}
            bg="#D200D3"
            color="white"
            _hover={{ 
              bg: '#D200D3',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 20px rgba(210, 0, 211, 0.3)'
            }}
            borderRadius="full"
            px={8}
            py={6}
            fontSize="md"
            fontWeight="semibold"
            transition="all 0.2s ease"
          >
            Import Agent From TXT, CSV or JSON
          </Button>
        </VStack>
      </GenericModal>

      {/* AddConversationModal */}
      <AddConversationModal
        isOpen={isAddConversationOpen}
        onClose={() => setIsAddConversationOpen(false)}
      />
      {/* AddFromProductModal */}
      <AddFromProductModal
        isOpen={isAddFromProductOpen}
        onClose={() => setIsAddFromProductOpen(false)}
      />
    </>
  );
};

export default AddAgentModal;


