import React from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Heading,
  Flex,
  Icon,
  SimpleGrid,
  Button,
} from '@chakra-ui/react';
import { FiUser, FiMail } from 'react-icons/fi';
import { useStore } from '@store/index';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const user = useStore((s: any) => s.user);
  const logout = useStore((s: any) => s.logout);
  const navigate = useNavigate();
  const firstName = (user?.first_name || '').trim();
  const lastName = (user?.last_name || '').trim();
  const fullName = (firstName || lastName) ? `${firstName}${firstName && lastName ? ' ' : ''}${lastName}` : (user?.username || 'User');
  const initials = (firstName || lastName)
    ? `${firstName.charAt(0) || ''}${lastName.charAt(0) || ''}`.toUpperCase()
    : (user?.username ? user.username.slice(0, 2).toUpperCase() : 'U');

  return (
    <Box 
      minH="100vh" 
      bg="#FFF6FF" 
      className="ca-bg-light-pink"
      py={8}
    >
      <Container maxW="6xl">
        <VStack gap={8} align="stretch">
          {/* Header Section */}
          <Box textAlign="center" mb={8}>
            <Heading 
              size="2xl" 
              className="ca-title ca-color-primary ca-bold"
              mb={4}
            >
              Profile
            </Heading>
          </Box>

          {/* Main Profile Card */}
          <Box 
            className="ca-modal ca-radius-xl"
            boxShadow="0 4px 20px rgba(0, 0, 0, 0.1)"
            overflow="hidden"
            bg="white"
            color="black"
            borderRadius="xl"
          >
            {/* Card Header */}
            <Box 
              bg="linear-gradient(135deg, #D200D3 0%, #621CB1 100%)"
              color="white"
              className="ca-radius-xl"
              p={6}
            >
              <Flex justify="space-between" align="center">
                <HStack gap={6}>
                  <Box
                    w="80px"
                    h="80px"
                    borderRadius="full"
                    bg="white"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    border="4px solid white"
                    overflow="hidden"
                  >
                    <Text 
                      fontSize="2xl" 
                      fontWeight="bold" 
                      color="#D200D3"
                      className="ca-bold"
                    >
                      {initials}
                    </Text>
                  </Box>
                  <VStack align="start" gap={2}>
                    <Heading size="lg" className="ca-bold">
                      {fullName}
                    </Heading>
                    {user?.username && (
                      <Text className="ca-text-lg">
                        @{user.username}
                      </Text>
                    )}
                  </VStack>
                </HStack>
              </Flex>
            </Box>

            {/* Card Body */}
            <Box p={8}>
              <SimpleGrid columns={{ base: 1, lg: 1 }} gap={8}>
                {/* Personal Information */}
                <VStack gap={6} align="stretch">
                  <Heading size="md" className="ca-color-primary ca-semibold">
                    Personal Information
                  </Heading>
                  
                  <VStack gap={4} align="stretch">

                  <HStack gap={4}>
                      <Icon as={FiUser} className="ca-color-tertiary" boxSize={5} />
                      <Box flex={1}>
                        <Text className="ca-color-quaternary ca-medium" fontSize="sm">
                          Username
                        </Text>
                        <Text className="ca-color-primary ca-medium">
                          {user?.username || '-'}
                        </Text>
                      </Box>
                    </HStack>
                    
                    <HStack gap={4}>
                      <Icon as={FiUser} className="ca-color-tertiary" boxSize={5} />
                      <Box flex={1}>
                        <Text className="ca-color-quaternary ca-medium" fontSize="sm">
                          Full Name
                        </Text>
                        <Text className="ca-color-primary ca-medium">
                          {fullName}
                        </Text>
                      </Box>
                    </HStack>

                    <HStack gap={4}>
                      <Icon as={FiMail} className="ca-color-tertiary" boxSize={5} />
                      <Box flex={1}>
                        <Text className="ca-color-quaternary ca-medium" fontSize="sm">
                          Email Address
                        </Text>
                        <Text className="ca-color-primary ca-medium">
                          {user?.email || '-'}
                        </Text>
                      </Box>
                    </HStack>

                    {/* Logout (small, inside grid) */}
                    <Box pt={2} display="flex" justifyContent="flex-end">
                      <Button
                        size="sm"
                        bg={'black'}
                        color={'white'}
                        fontWeight={600}
                        px={4}
                        py={2}
                        borderRadius="0.5rem"
                        _hover={{
                          bg: 'grey',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 3px 8px rgba(182, 237, 67, 0.25)',
                        }}
                        _active={{ transform: 'translateY(0)' }}
                        transition="all 0.2s ease"
                        onClick={() => { logout(); navigate('/login'); }}
                      >
                        Logout
                      </Button>
                    </Box>
                  </VStack>
                </VStack>
              </SimpleGrid>
            </Box>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default Profile;
