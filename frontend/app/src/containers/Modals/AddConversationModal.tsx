import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Button, 
  Text, 
  VStack, 
  HStack,
  Input,
  Spinner,
  Avatar,
} from "@chakra-ui/react";
import GenericModal from '@components/ui/Modal';
import { LuUpload } from "react-icons/lu";
import { request } from "@api/requestLayer";
import { useStore } from "@store/index";
import { useNavigate } from "react-router-dom";
import { routePaths } from "@constants/routePaths";
import { CONNECTION_TYPES } from "@constants/connectionTypes";

// Type definitions
interface AvatarTemplate {
  id: number;
  name: string;
  image: string;
}

const avatarTemplates: AvatarTemplate[] = [
  { id: 1, name: "Bot 1", image: "/avatars/bottts-1755467308615.png" },
  { id: 2, name: "Bot 2", image: "/avatars/bottts-1755467311500.png" },
  { id: 3, name: "Bot 3", image: "/avatars/bottts-1755467265882.png" },
  { id: 4, name: "Bot 4", image: "/avatars/bottts-1755467268842.png" },
  { id: 5, name: "Bot 21", image: "/avatars/bottts-1755467204953.png" },
  { id: 6, name: "Bot 6", image: "/avatars/bottts-1755467305457.png" },
  { id: 7, name: "Bot 7", image: "/avatars/bottts-1755467254710.png" },
  { id: 8, name: "Bot 8", image: "/avatars/bottts-1755467262863.png" },
  { id: 9, name: "Bot 9", image: "/avatars/bottts-1755467241042.png" },
  { id: 10, name: "Bot 10", image: "/avatars/bottts-1755467244064.png" },
  { id: 11, name: "Bot 11", image: "/avatars/bottts-1755467250757.png" },
  { id: 12, name: "Bot 12", image: "/avatars/bottts-1755467233465.png" },
  { id: 13, name: "Bot 13", image: "/avatars/bottts-1755467238099.png" },
  { id: 14, name: "Bot 14", image: "/avatars/bottts-1755467222697.png" },
  { id: 15, name: "Bot 15", image: "/avatars/bottts-1755467226300.png" },
  { id: 16, name: "Bot 16", image: "/avatars/bottts-1755467229372.png" },
  { id: 17, name: "Bot 17", image: "/avatars/bottts-1755467213889.png" },
  { id: 18, name: "Bot 18", image: "/avatars/bottts-1755467217616.png" },
  { id: 19, name: "Bot 19", image: "/avatars/bottts-1755467210341.png" },
  { id: 20, name: "Bot 20", image: "/avatars/bottts-1755467181840.png" },
];

const getRandomAvatarTemplate = (): AvatarTemplate => {
  const index = Math.floor(Math.random() * avatarTemplates.length);
  return avatarTemplates[index];
};

interface AddConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFile?: File | null;
  onFinish?: () => void;
}

const AddConversationModal: React.FC<AddConversationModalProps> = ({ isOpen, onClose, initialFile = null, onFinish }) => {
  const routerNavigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(initialFile ? 1 : 0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(initialFile ?? null);
  const [conversationName, setConversationName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarTemplate | null>(getRandomAvatarTemplate());
  const [isLoading, setIsLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  
  const fetchAgents = useStore((s: any) => s.fetchAgents);
  const fetchAgentsForConnection = useStore((s: any) => s.fetchAgentsForConnection);

  useEffect(() => {
    if (isOpen) {
      if (initialFile) {
        setUploadedFile(initialFile);
        setCurrentStep(1);
      } else {
        setUploadedFile(null);
        setCurrentStep(0);
      }
      setSelectedAvatar(getRandomAvatarTemplate());
    }
  }, [isOpen, initialFile]);

  const steps = [
    { title: "Upload Document", description: "Upload your conversation file" },
    { title: "Conversation Name", description: "Give your conversation a name" },
    { title: "Select Avatar", description: "Choose an avatar for your conversation" },
    { title: "Processing", description: "Analyzing your conversation" },
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileUpload = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      const allowedTypes = ['.csv', '.json'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (!allowedTypes.includes(fileExtension)) {
        setUploadError('Please select a .csv or .json file');
        return;
      }
      
      setUploadedFile(file);
      setCurrentStep(1);
      setUploadError(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const allowedTypes = ['.csv', '.json'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (!allowedTypes.includes(fileExtension)) {
        setUploadError('Please select a .csv or .json file');
        return;
      }
      
      setUploadedFile(file);
      setCurrentStep(1);
      setUploadError(null);
    }
  };

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      if (currentStep === 0 && uploadedFile) {
        setCurrentStep(1);
      } else if (currentStep === 1 && conversationName.trim()) {
        setCurrentStep(2);
      } else if (currentStep === 2 && selectedAvatar) {
        if (!uploadedFile) {
          setUploadError('Please select a file first');
          return;
        }
        
        setCurrentStep(3);
        setIsLoading(true);
        setUploadError(null);
        
        try {
          
          const formData = new FormData();
          formData.append('agent_name', conversationName);
          formData.append('agent_avatar_url', selectedAvatar.image);
          formData.append('file', uploadedFile);

          const response = await request('/api/file/connection/', {
            method: 'POST',
            body: formData,
          });

          const createdAgentId = String(response?.content?.id || response?.id || '');
          if (!createdAgentId) {
            throw new Error('Agent ID missing in response');
          }
          
          
          try {
            await fetchAgents();
          } catch (error) {
            console.error('Failed to refresh agents:', error);
          }

          
          try {
            await fetchAgentsForConnection(CONNECTION_TYPES.FILE);
          } catch (error) {
            console.error('Failed to refresh agents for connection:', error);
          }


          try {
            routerNavigate(routePaths.analyzeMain());
          } catch (navError) {
            console.error('Navigation failed:', navError);
          }
          
          
          if (onFinish) {
            onFinish();
          }
          
          
          handleClose();
          
        } catch (error: any) {
          console.error('Upload failed:', error);
          setUploadError(error.message || 'Failed to upload conversation');
          
          setCurrentStep(2);
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    onClose();
    setCurrentStep(0);
    setUploadedFile(null);
    setConversationName('');
    setSelectedAvatar(null);
    setIsLoading(false);
    setUploadError(null);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <VStack gap={8} maxW="2xl" mx="auto">
            <Box
              border="2px dashed"
              borderColor={isDragOver ? "#D200D3" : "#615568"}
              borderRadius="xl"
              bg={isDragOver ? "#FFD8FF" : "#FFF6FF"}
              transform={isDragOver ? "translateY(-2px)" : "none"}
              boxShadow={isDragOver ? "0 10px 25px rgba(210, 0, 211, 0.15)" : "none"}
              _hover={{
                borderColor: "#D200D3",
                bg: "#FFD8FF",
                transform: "translateY(-2px)",
                boxShadow: "0 10px 25px rgba(210, 0, 211, 0.15)"
              }}
              _active={{ borderColor: "#D200D3", bg: "#FFD8FF" }}
              transition="all 0.3s ease"
              py={12}
              px={8}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              cursor={currentStep === 0 ? "pointer" : "default"}
              onClick={() => {
                if (currentStep !== 0) return;
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.csv,.json';
                input.onchange = (e) => {
                  const files = (e.target as HTMLInputElement).files;
                  if (files && files.length > 0) {
                    handleFileUpload(Array.from(files));
                  }
                };
                input.click();
              }}
            >
              <VStack gap={4}>
                <Box color="#615568" fontSize="4xl">
                  <LuUpload />
                </Box>
                <Box fontSize="xl" fontWeight="semibold" color="#0A0807" textAlign="center">
                  Drag and drop your conversation files here
                </Box>
                <Box color="#615568" fontSize="md" textAlign="center">
                  .csv, .json up to 10MB
                </Box>
              </VStack>
            </Box>
          </VStack>
        );
      case 1:
        return (
          <VStack gap={6} maxW="md" mx="auto">
            <Text fontSize="lg" fontWeight="medium" color="#0A0807">
              What would you name the agent
            </Text>
            <Input 
              placeholder="Enter agent name..." 
              value={conversationName}
              onChange={(e) => setConversationName(e.target.value)}
              color="black"
              size="lg"
              borderColor="#615568"
              _focus={{ borderColor: "#D200D3", boxShadow: "0 0 0 1px #D200D3" }}
              _placeholder={{ color: "#615568" }}
            />
          </VStack>
        );
      case 2:
        return (
          <VStack gap={6} maxW="2xl" mx="auto">
            <Text fontSize="lg" fontWeight="medium" color="#0A0807">
              Choose an avatar for your agent
            </Text>
            
            {/* Avatar Preview */}
            <Box
              p={6}
              border="2px solid"
              borderColor="#D3D3D3"
              borderRadius="xl"
              bg="#FFF6FF"
              textAlign="center"
              minH="120px"
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
            >
              {selectedAvatar ? (
                <>
                  <Avatar.Root w="80px"
                    h="80px"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    mb={3}>
                    <Avatar.Fallback bg="#621CB1" color="white" fontSize="2xl">
                    </Avatar.Fallback>
                    <Avatar.Image src={selectedAvatar.image} />
                  </Avatar.Root>
                </>
              ) : (
                <>
                  <Box
                    w="80px"
                    h="80px"
                    borderRadius="full"
                    bg="#615568"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    mb={3}
                  />
                </>
              )}
              <Text color="black" fontSize="xl">{conversationName}</Text>
            </Box>
            
            <Box 
              display="grid" 
              gridTemplateColumns="repeat(auto-fit, minmax(70px, 1fr))" 
              gap={4} 
              w="full"
              justifyItems="center"
              alignItems="center"
              textAlign="center"
            >
              {avatarTemplates.map((avatar) => (
                <Box
                  key={avatar.id}
                  p={2}
                  border="2px solid"
                  borderColor={selectedAvatar?.id === avatar.id ? "#D200D3" : "#D3D3D3"}
                  borderRadius="lg"
                  cursor="pointer"
                  zoom={1.3}
                  _hover={{ borderColor: "#D200D3", bg: "#FFF6FF" }}
                  onClick={() => setSelectedAvatar(avatar)}
                  transition="all 0.2s ease"
                >
                  <Avatar.Root size="lg" mx="auto" mb={2}>
                    <Avatar.Fallback bg="#621CB1" color="white">
                      
                    </Avatar.Fallback>
                    <Avatar.Image src={avatar.image} />
                  </Avatar.Root>
                </Box>
              ))}
            </Box>
          </VStack>
        );
      case 3:
        return (
          <VStack gap={6} maxW="md" mx="auto">
            <Spinner size="xl" color="#D200D3" />
            <Text fontSize="lg" fontWeight="medium" color="#0A0807">
              Analyzing your conversation...
            </Text>
            <Text fontSize="md" color="#615568" textAlign="center">
              This may take a few moments. Please don't close this window.
            </Text>
            {uploadError && (
              <Text fontSize="md" color="red.500" textAlign="center">
                {uploadError}
              </Text>
            )}
          </VStack>
        );
      default:
        return null;
    }
  };

  return (
    <GenericModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Agent Conversation"
      maxW="2xl"
    >
      <HStack gap={4} mb={8} justifyContent="center">
        {steps.map((step, index) => (
          <HStack key={index} gap={2}>
            <Box
              w="8"
              h="8"
              borderRadius="full"
              bg={index <= currentStep ? "#D200D3" : "#615568"}
              color="white"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="sm"
              fontWeight="bold"
            >
              {index + 1}
            </Box>
            <Text
              fontSize="sm"
              color={index <= currentStep ? "#0A0807" : "#615568"}
              fontWeight={index === currentStep ? "bold" : "normal"}
            >
              {step.title}
            </Text>
          </HStack>
        ))}
      </HStack>

      {renderStepContent()}

      <HStack mt={8} gap={4} justifyContent="center">
        {currentStep > 0 && (
          <Button 
            variant="outline" 
            onClick={handlePrev}
            borderColor="#615568"
            color="#615568"
            _hover={{ borderColor: "#D200D3", color: "#D200D3" }}
          >
            Previous
          </Button>
        )}
        {currentStep < steps.length - 1 && (
          <Button 
            onClick={handleNext} 
            bg="#D200D3"
            color="white"
            _hover={{ bg: "#B6ED43", color: "#0A0807" }}
            disabled={isLoading || (currentStep === 0 && !uploadedFile) || (currentStep === 1 && !conversationName.trim()) || (currentStep === 2 && !selectedAvatar)}
          >
            {isLoading ? <Spinner size="sm" /> : "Next"}
          </Button>
        )}
        {currentStep === steps.length - 1 && (
          <Button 
            onClick={handleClose} 
            bg="#D200D3"
            color="white"
            _hover={{ bg: "#B6ED43", color: "#0A0807" }}
            disabled={isLoading}
          >
            {isLoading ? <Spinner size="sm" /> : "Finish"}
          </Button>
        )}
      </HStack>

      {uploadError && currentStep !== 3 && (
        <Text fontSize="sm" color="red.500" textAlign="center" mt={4}>
          {uploadError}
        </Text>
      )}
    </GenericModal>
  );
};

export default AddConversationModal;
