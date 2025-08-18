import React from 'react';
import { Box, Container, VStack, Text } from '@chakra-ui/react';


export const Footer = () => {
    const footerBg = '#0A0807';
    const tertiaryColor = '#D200D3';

    return (
        <footer style={{ 
            backgroundColor: '#f8f9fa',
            textAlign: 'center',
            borderTop: '1px solid #dee2e6',
            marginTop: 'auto'
        }}>
          {/* Bottom Section - Black Footer */}
          <Box bg={footerBg} py={12}>
                <Container maxW="container.lg">
                  <VStack gap={4} textAlign="center">
                    <Text
                      fontSize="lg"
                      color="white"
                      maxW="600px"
                    >
                      If you have any thoughts or suggestions, please feel free to contact us at{' '}
                      <Text as="span" color={tertiaryColor} fontWeight="bold">
                        support@chatanalyzer.com
                      </Text>
                    </Text>
                  </VStack>
                </Container>
              </Box>
            <p style={{ margin: 0, color: '#6c757d' }}>
                &copy; {new Date().getFullYear()} Chat Analyzer. All rights reserved.
            </p>
        </footer>
    );
};
