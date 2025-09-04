import React, { useState } from 'react';
import { Box, Flex, Text, SimpleGrid, Image } from '@chakra-ui/react';
import { useStore } from '@store/index';
import JotformAgentsModal from '@Modals/JotformAgentsModal';
import JotformSignInModal from '@Modals/JotformSignInModal';
import GenericModal from '@components/ui/Modal';

type AddFromProductModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

// TODO: add modal types

type ProductTile = {
  id: string;
  name: string;
  imageSrc?: string;
  disabled?: boolean;
};

const tiles: ProductTile[] = [
  { id: 'jotform', name: 'Jotform', imageSrc: '/jotform.png' },
  { id: 'openai', name: 'OpenAI', imageSrc: '/gpt.png' },
  // placeholders for future providers
  { id: 'provider-3', name: 'Coming soon', disabled: true },
  { id: 'provider-4', name: 'Coming soon', disabled: true },
  { id: 'provider-5', name: 'Coming soon', disabled: true },
  { id: 'provider-6', name: 'Coming soon', disabled: true },
];

const AddFromProductModal: React.FC<AddFromProductModalProps> = ({ isOpen, onClose }) => {
  const fetchJotformAgents = useStore((s: any) => s.fetchJotformAgents);
  const [isJotformAgentsOpen, setIsJotformAgentsOpen] = useState(false);
  const [isJotformSignInOpen, setIsJotformSignInOpen] = useState(false);

  const handleJotformClick = async () => {
    try {
      const agents = await fetchJotformAgents();
      if (agents) {
        onClose();
        setIsJotformAgentsOpen(true);
        return;
      }
      onClose();
      setIsJotformSignInOpen(true);
    } catch (error) {
      onClose();
      setIsJotformSignInOpen(true);
    }
  };

  return (
    <>
      <GenericModal
        isOpen={isOpen}
        onClose={onClose}
        title="Add From Product"
        maxW="3xl"
        containerProps={{ border: '1px solid #D3D3D3', m: 6 }}
        bodyProps={{ p: 6, pt: 4, className: 'ca-bg-light-pink' as any, m:4 }}
      >
        <SimpleGrid columns={{ base: 2, md: 3 }} gap={6}>
          {tiles.map((tile) => {
            const isDisabled = Boolean(tile.disabled);
            return (
              <Flex
                key={tile.id}
                direction="column"
                align="center"
                justify="center"
                borderRadius="2xl"
                bg="white"
                minH={{ base: '110px', md: '140px' }}
                border="1px solid"
                borderColor="#D3D3D3"
                transition="all 0.2s ease"
                cursor={isDisabled ? 'not-allowed' : 'pointer'}
                _hover={isDisabled ? {} : { transform: 'translateY(-2px)', boxShadow: '0 10px 25px rgba(210, 0, 211, 0.12)', borderColor: '#D200D3' }}
                _active={isDisabled ? {} : { transform: 'translateY(0)' }}
                onClick={() => {
                  if (isDisabled) return;
                  if (tile.id === 'jotform') {
                    handleJotformClick();
                  }
                }}
              >
                {tile.imageSrc ? (
                  <Image src={tile.imageSrc} alt={tile.name} maxH="56px" objectFit="contain" mb={2} />
                ) : (
                  <Box w="56px" h="56px" borderRadius="lg" className="ca-bg-quaternary-opacity-20" />
                )}
                <Text mt={2} fontSize="sm" color={isDisabled ? '#8C8C8C' : '#0A0807'}>{tile.name}</Text>
              </Flex>
            );
          })}
        </SimpleGrid>
      </GenericModal>

      <JotformAgentsModal
        isOpen={isJotformAgentsOpen}
        onClose={() => setIsJotformAgentsOpen(false)}
        onCloseRoot={onClose}
      />
      <JotformSignInModal
        isOpen={isJotformSignInOpen}
        onClose={() => setIsJotformSignInOpen(false)}
      />
    </>
  );
};

export default AddFromProductModal;


