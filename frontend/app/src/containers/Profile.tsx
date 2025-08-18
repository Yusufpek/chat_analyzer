import React, { useState } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Button,
  Heading,
  Badge,
  Input,
  Textarea,
  Flex,
  Icon,
  SimpleGrid,
} from '@chakra-ui/react';
import { FiEdit3, FiSave, FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiAward } from 'react-icons/fi';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'Ahmet Seref Eker',
    email: 'ahmet.seref@example.com',
    phone: '+90 555 123 4567',
    location: 'Istanbul, Turkey',
    bio: 'Full-stack developer passionate about creating innovative web applications. Specialized in React, TypeScript, and modern web technologies.',
    joinDate: 'March 2023',
    totalProjects: 24,
    completedTasks: 156,
    memberSince: '1 year'
  });

  const handleSave = () => {
    setIsEditing(false);
    // Show success message
    console.log('Profile updated successfully');
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Show cancel message
    console.log('Changes cancelled');
  };

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
            <Text 
              className="ca-text-xl ca-color-quaternary"
              maxW="2xl"
              mx="auto"
            >
              Manage your account settings and preferences
            </Text>
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
                      {profileData.name.split(' ').map(n => n[0]).join('')}
                    </Text>
                  </Box>
                  <VStack align="start" gap={2}>
                    <Heading size="lg" className="ca-bold">
                      {profileData.name}
                    </Heading>
                    <Text className="ca-text-lg">
                      Full Stack Developer
                    </Text>
                    <Badge 
                      colorScheme="green" 
                      className="ca-semibold"
                      px={3}
                      py={1}
                      borderRadius="full"
                    >
                      Active Member
                    </Badge>
                  </VStack>
                </HStack>
                <Button
                  onClick={isEditing ? handleSave : () => setIsEditing(true)}
                  className="ca-button ca-bg-secondary ca-color-primary ca-semibold"
                  _hover={{
                    bg: '#A8D93A',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(182, 237, 67, 0.3)'
                  }}
                  transition="all 0.3s ease"
                >
                  <Icon as={isEditing ? FiSave : FiEdit3} mr={2} />
                  {isEditing ? 'Save Changes' : 'Edit Profile'}
                </Button>
              </Flex>
            </Box>

            {/* Card Body */}
            <Box p={8}>
              <SimpleGrid columns={{ base: 1, lg: 2 }} gap={8}>
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
                          Full Name
                        </Text>
                        {isEditing ? (
                          <Input 
                            value={profileData.name}
                            onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                            className="ca-input ca-focus-tertiary"
                            borderColor="#D3D3D3"
                            _focus={{ borderColor: '#D200D3', boxShadow: '0 0 0 1px #D200D3' }}
                          />
                        ) : (
                          <Text className="ca-color-primary ca-medium">
                            {profileData.name}
                          </Text>
                        )}
                      </Box>
                    </HStack>

                    <HStack gap={4}>
                      <Icon as={FiMail} className="ca-color-tertiary" boxSize={5} />
                      <Box flex={1}>
                        <Text className="ca-color-quaternary ca-medium" fontSize="sm">
                          Email Address
                        </Text>
                        {isEditing ? (
                          <Input 
                            value={profileData.email}
                            onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                            className="ca-input ca-focus-tertiary"
                            borderColor="#D3D3D3"
                            _focus={{ borderColor: '#D200D3', boxShadow: '0 0 0 1px #D200D3' }}
                          />
                        ) : (
                          <Text className="ca-color-primary ca-medium">
                            {profileData.email}
                          </Text>
                        )}
                      </Box>
                    </HStack>

                    <HStack gap={4}>
                      <Icon as={FiPhone} className="ca-color-tertiary" boxSize={5} />
                      <Box flex={1}>
                        <Text className="ca-color-quaternary ca-medium" fontSize="sm">
                          Phone Number
                        </Text>
                        {isEditing ? (
                          <Input 
                            value={profileData.phone}
                            onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                            className="ca-input ca-focus-tertiary"
                            borderColor="#D3D3D3"
                            _focus={{ borderColor: '#D200D3', boxShadow: '0 0 0 1px #D200D3' }}
                          />
                        ) : (
                          <Text className="ca-color-primary ca-medium">
                            {profileData.phone}
                          </Text>
                        )}
                      </Box>
                    </HStack>

                    <HStack gap={4}>
                      <Icon as={FiMapPin} className="ca-color-tertiary" boxSize={5} />
                      <Box flex={1}>
                        <Text className="ca-color-quaternary ca-medium" fontSize="sm">
                          Location
                        </Text>
                        {isEditing ? (
                          <Input 
                            value={profileData.location}
                            onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                            className="ca-input ca-focus-tertiary"
                            borderColor="#D3D3D3"
                            _focus={{ borderColor: '#D200D3', boxShadow: '0 0 0 1px #D200D3' }}
                          />
                        ) : (
                          <Text className="ca-color-primary ca-medium">
                            {profileData.location}
                          </Text>
                        )}
                      </Box>
                    </HStack>

                    <HStack gap={4}>
                      <Icon as={FiCalendar} className="ca-color-tertiary" boxSize={5} />
                      <Box flex={1}>
                        <Text className="ca-color-quaternary ca-medium" fontSize="sm">
                          Member Since
                        </Text>
                        <Text className="ca-color-primary ca-medium">
                          {profileData.joinDate} ({profileData.memberSince})
                        </Text>
                      </Box>
                    </HStack>
                  </VStack>
                </VStack>

                {/* Bio Section */}
                <VStack gap={6} align="stretch">
                  <Heading size="md" className="ca-color-primary ca-semibold">
                    About Me
                  </Heading>
                  
                  {isEditing ? (
                    <Textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                      placeholder="Tell us about yourself..."
                      className="ca-input ca-focus-tertiary"
                      borderColor="#D3D3D3"
                      _focus={{ borderColor: '#D200D3', boxShadow: '0 0 0 1px #D200D3' }}
                      minH="120px"
                      resize="vertical"
                    />
                  ) : (
                    <Text className="ca-color-primary ca-medium leading-relaxed">
                      {profileData.bio}
                    </Text>
                  )}

                  <Box borderTop="1px solid #D3D3D3" className="ca-border-top-gray" />

                  {/* Statistics */}
                  <VStack gap={4} align="stretch">
                    <Heading size="sm" className="ca-color-primary ca-semibold">
                      Activity Statistics
                    </Heading>
                    
                    <SimpleGrid columns={2} gap={4}>
                      <Box>
                        <Text className="ca-color-quaternary ca-medium" fontSize="sm">
                          Total Projects
                        </Text>
                        <Text className="ca-color-tertiary ca-bold ca-text-2xl">
                          {profileData.totalProjects}
                        </Text>
                        <Text className="ca-color-quaternary" fontSize="sm">
                          <Icon as={FiAward} mr={1} />
                          Completed
                        </Text>
                      </Box>
                      
                      <Box>
                        <Text className="ca-color-quaternary ca-medium" fontSize="sm">
                          Tasks Completed
                        </Text>
                        <Text className="ca-color-tertiary ca-bold ca-text-2xl">
                          {profileData.completedTasks}
                        </Text>
                        <Text className="ca-color-quaternary" fontSize="sm">
                          This month
                        </Text>
                      </Box>
                    </SimpleGrid>
                  </VStack>
                </VStack>
              </SimpleGrid>

              {/* Action Buttons */}
              {isEditing && (
                <Box mt={8} pt={6} borderTop="1px solid #D3D3D3">
                  <HStack gap={4} justify="center">
                    <Button
                      onClick={handleSave}
                      className="ca-button ca-bg-secondary ca-color-primary ca-semibold"
                      _hover={{
                        bg: '#A8D93A',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(182, 237, 67, 0.3)'
                      }}
                      transition="all 0.3s ease"
                    >
                      <Icon as={FiSave} mr={2} />
                      Save Changes
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      className="ca-button ca-border-gray ca-color-primary ca-semibold"
                      _hover={{
                        bg: '#F7F7F7',
                        borderColor: '#D200D3',
                        color: '#D200D3'
                      }}
                      transition="all 0.3s ease"
                    >
                      Cancel
                    </Button>
                  </HStack>
                </Box>
              )}
            </Box>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default Profile;
