import React, { useCallback, useState , useEffect} from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  FileUpload,
  Flex,
} from '@chakra-ui/react';
import SideNavigationBar from '@components/SideNavigationBar';
import AddAgentModal from '@Modals/AddAgentModal';
import AddConversationModal from '@Modals/AddConversationModal';
import JotformSignInModal from '@Modals/JotformSignInModal';
import AnalyzeMain from './AnalyzeMain';
import { useNavigate } from 'react-router-dom';
import { routePaths } from '@constants/routePaths';
import { LuUpload } from 'react-icons/lu';
import { useStore } from '@store/index';

const Analyze = () => {
  const agentId = useStore((s: any) => s.selectedAgentId);
  const selectedAgentId = useStore((s: any) => s.selectedAgentId);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isJotformModalOpen, setIsJotformModalOpen] = useState(false);
  const [isAddAgentOpen, setIsAddAgentOpen] = useState(false);
  const navigate = useNavigate();
  const authStatus = useStore((s: any) => s.authStatus);
  const primaryColor = '#0A0807';

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (authStatus !== 'authenticated') {
      navigate(routePaths.login());
      return;
    }
    // Restrict to single file
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const firstFile = files[0];
      setSelectedFile(firstFile);
      setIsAddModalOpen(true);
    }
  };

  const handleHiddenInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (authStatus !== 'authenticated') {
      navigate(routePaths.login());
      return;
    }
    const target = e.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const firstFile = target.files[0];
      setSelectedFile(firstFile);
      setIsAddModalOpen(true);
    }
  }, [authStatus, navigate]);

  const handleDropzoneClick = (e: React.MouseEvent) => {
    if (authStatus !== 'authenticated') {
      e.preventDefault();
      e.stopPropagation();
      navigate(routePaths.login());
    }
  };

  const handleModalClose = useCallback(() => {
    setIsAddModalOpen(false);
  }, []);

  const handleModalFinish = useCallback(() => {
    navigate(routePaths.analyze());
  }, [navigate]);

  // Add delete buttons and click handler
  useEffect(() => {
    const addDeleteButtons = () => {
      const fileItems = document.querySelectorAll('[data-scope="file-upload"][data-part="item"]');
      fileItems.forEach((item) => {
        // Check if delete button already exists
        if (!item.querySelector('.delete-btn')) {
          const deleteBtn = document.createElement('button');
          deleteBtn.className = 'delete-btn';
          deleteBtn.textContent = '×';
          deleteBtn.setAttribute('type', 'button');
          
          deleteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Delete button clicked');
            item.remove();
          });
          
          item.appendChild(deleteBtn);
        }
      });
    };

    // Initial setup
    addDeleteButtons();

    // Watch for new file items being added
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (element.matches('[data-scope="file-upload"][data-part="item"]')) {
                addDeleteButtons();
              }
            }
          });
        }
      });
    });

    const fileUploadRoot = document.querySelector('[data-scope="file-upload"]');
    if (fileUploadRoot) {
      observer.observe(fileUploadRoot, {
        childList: true,
        subtree: true
      });
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <Flex bg="#FFFFFF" align="stretch" height="calc(100vh - 88px)" overflow="hidden">
      <SideNavigationBar selectedAgentId={agentId}/>
      
      <Box flex={1} position="relative" bg="#FFFFFF" overflow="hidden" height="100%">
        {(location.pathname !== "/analyze") ? (
          <AnalyzeMain />
        ) : (
          /* Top Section - Gradient Background */
          <Box py={16}>
            <Container maxW="container.lg">
              
              {/* Large Headline Section */}
              <VStack gap={6} textAlign="center" mb={12}>
                <Heading
                  as="h1"
                  size="2xl"
                  fontWeight="bold"
                  color={primaryColor}
                  fontSize={{ base: "3xl", md: "5xl", lg: "6xl" }}
                  lineHeight="1.2"
                >
                  Upload your conversations file
                </Heading>
                <Text
                  fontSize={{ base: "lg", md: "xl" }}
                  color="gray.600"
                  maxW="800px"
                  lineHeight="1.6"
                >
                  Chat Analyzer's AI instantly analyzes your conversations and provides insights.
                </Text>
              </VStack>
              
              {/* File Upload Section */}
              <VStack gap={8} maxW="2xl" mx="auto">
                {/* Dropzone */}
                <FileUpload.Root 
                  maxW="xl" 
                  alignItems="stretch" 
                  maxFiles={1}
                  accept={["text/csv", "application/json", ".csv", ".json"]}
                >
                  <FileUpload.HiddenInput onChange={handleHiddenInputChange} />
                  <FileUpload.Dropzone
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
                    _active={{
                      borderColor: "#D200D3",
                      bg: "#FFD8FF"
                    }}
                    transition="all 0.3s ease"
                    py={12}
                    px={8}
                    onClick={handleDropzoneClick}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    pointerEvents={isAddModalOpen ? 'none' : 'auto'}
                  >
                    <Box color="#615568" fontSize="4xl">
                      <LuUpload />
                    </Box>
                    <FileUpload.DropzoneContent>
                      <Box 
                        fontSize="xl" 
                        fontWeight="semibold" 
                        color="#0A0807"
                        mb={2}
                      >
                        Drag and drop your conversation files here
                      </Box>
                      <Box color="#615568" fontSize="md">
                        .csv, .json up to 10MB
                      </Box>
                    </FileUpload.DropzoneContent>
                  </FileUpload.Dropzone>
                  <FileUpload.List/>
                </FileUpload.Root>
                {/* Or divider */}
                <HStack gap={4} color="gray.400">
                  <Box flex={1} h="1px" bg="gray.200" />
                  <Text fontSize="sm" fontWeight="medium">or</Text>
                  <Box flex={1} h="1px" bg="gray.200" />
                </HStack>
                
                {/* Jotform Sign-in Section */}
                <VStack gap={4} w="full" maxW="md">
                  <Button
                    size="lg"
                    bg="#B6ED43"
                    color="#0A0807"
                    _hover={{ 
                      bg: '#A0D936',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 20px rgba(182, 237, 67, 0.3)'
                    }}
                    _active={{ bg: '#8BC530' }}
                    borderRadius="xl"
                    px={8}
                    py={4}
                    fontSize="md"
                    fontWeight="semibold"
                    transition="all 0.2s ease"
                    onClick={() => setIsAddAgentOpen(true)}
                  >
                    Add Agent
                  </Button>
                </VStack>

              </VStack>
            </Container>
          </Box>
        )}
      </Box>
      
      <AddConversationModal
        isOpen={isAddModalOpen}
        onClose={handleModalClose}
        initialFile={selectedFile}
        onFinish={handleModalFinish}
      />
      <JotformSignInModal
        isOpen={isJotformModalOpen}
        onClose={() => setIsJotformModalOpen(false)}
      />
      <AddAgentModal isOpen={isAddAgentOpen} onClose={() => setIsAddAgentOpen(false)} />
    </Flex>
  );
};

export default Analyze;
