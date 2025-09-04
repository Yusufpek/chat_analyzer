import React from 'react';
import { Box, Flex, Text, Button } from '@chakra-ui/react';

export type GenericModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  maxW?: string | number;
  bodyProps?: React.ComponentProps<typeof Box>;
  headerRight?: React.ReactNode;
  footer?: React.ReactNode;
  hideHeader?: boolean;
  hideClose?: boolean;
  containerProps?: React.ComponentProps<typeof Box>;
  children?: React.ReactNode;
};

const GenericModal: React.FC<GenericModalProps> = ({
  isOpen,
  onClose,
  title,
  maxW = 'md',
  bodyProps,
  headerRight,
  footer,
  hideHeader = false,
  hideClose = false,
  containerProps,
  children,
}) => {
  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="rgba(0, 0, 0, 0.5)"
      zIndex={1000}
      display={isOpen ? 'flex' : 'none'}
      alignItems="center"
      justifyContent="center"
      onClick={onClose}
    >
      <Box
        bg="white"
        borderRadius="xl"
        p={hideHeader ? 0 : 8}
        maxW={maxW}
        w="90%"
        maxH="90vh"
        overflowY="auto"
        onClick={(e) => e.stopPropagation()}
        {...containerProps}
      >
        {!hideHeader && (
          <Flex justifyContent="space-between" alignItems="center" mb={6}>
            <Text fontSize="2xl" fontWeight="bold" color="#0A0807">
              {title}
            </Text>
            {!hideClose ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                color="#615568"
                _hover={{ color: '#D200D3' }}
              >
                ✕
              </Button>
            ) : (
              headerRight || null
            )}
          </Flex>
        )}

        <Box {...bodyProps}>
          {children}
        </Box>

        {footer && (
          <Box mt={8}>
            {footer}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default GenericModal;


