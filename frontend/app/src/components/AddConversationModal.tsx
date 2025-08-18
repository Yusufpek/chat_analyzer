import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Flex, 
  Text, 
  VStack, 
  HStack,
  Input,
  Spinner,
  Avatar,
  Icon,
  useDisclosure
} from "@chakra-ui/react";
import { LuUpload } from "react-icons/lu";

// Type definitions
interface AvatarTemplate {
  id: number;
  name: string;
  image: string;
}

// Avatar templates from public/avatars folder
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

interface AddConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddConversationModal: React.FC<AddConversationModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [conversationName, setConversationName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setUploadedFile(files[0]);
      setCurrentStep(1);
    }
  };

  const handleFileUpload = (files: File[]) => {
    if (files.length > 0) {
      setUploadedFile(files[0]);
      setCurrentStep(1);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      if (currentStep === 1 && conversationName.trim()) {
        setCurrentStep(2);
      } else if (currentStep === 2 && selectedAvatar) {
        setCurrentStep(3);
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
          setIsLoading(false);
          handleClose();
        }, 3000);
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
              cursor="pointer"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.txt,.csv,.json';
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
                <Icon size="xl" color="#615568">
                  <LuUpload />
                </Icon>
                <Box fontSize="xl" fontWeight="semibold" color="#0A0807" textAlign="center">
                  Drag and drop your conversation files here
                </Box>
                <Box color="#615568" fontSize="md" textAlign="center">
                  .txt, .csv, .json up to 10MB
                </Box>
              </VStack>
            </Box>
          </VStack>
        );
      case 1:
        return (
          <VStack gap={6} maxW="md" mx="auto">
            <Text fontSize="lg" fontWeight="medium" color="#0A0807">
              What would you like to call this conversation?
            </Text>
            <Input 
              placeholder="Enter conversation name..." 
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
              Choose an avatar for your conversation
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
          </VStack>
        );
      default:
        return null;
    }
  };

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="rgba(0, 0, 0, 0.5)"
      zIndex={1000}
      display={isOpen ? "flex" : "none"}
      alignItems="center"
      justifyContent="center"
      onClick={handleClose}
    >
      <Box
        bg="white"
        borderRadius="xl"
        p={8}
        maxW="2xl"
        w="90%"
        maxH="90vh"
        overflowY="auto"
        onClick={(e) => e.stopPropagation()}
      >
        <Flex justifyContent="space-between" alignItems="center" mb={6}>
          <Text fontSize="2xl" fontWeight="bold" color="#0A0807">
            Add New Conversation
          </Text>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            color="#615568"
            _hover={{ color: "#D200D3" }}
          >
            ✕
          </Button>
        </Flex>
        
        {/* Steps Indicator */}
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
              disabled={isLoading}
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
      </Box>
    </Box>
  );
};

export default AddConversationModal;
