import React, { useState } from 'react';
import {
  Box,
  Flex,
  Text,
  Button,
  Container,
  VStack,
  Avatar,
  Menu,
  Portal,
  HStack,
  Stack,
  Skeleton,
  SkeletonCircle,
} from '@chakra-ui/react';

import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '@store/index';
import { CONNECTION_TYPES, CONNECTION_TYPE_LABELS } from '@constants/connectionTypes';

export const Header = () => {
  const isUserLoggedIn = useStore((s: any) => s.authStatus === 'authenticated');
  const authStatus = useStore((s: any) => s.authStatus);
  const authInitialized = useStore((s: any) => s.authInitialized);
  const isLoadingLogin = useStore((s: any) => s.isLoadingLogin);
  const user = useStore((s: any) => s.user);
  const setSelectedConnectionType = useStore((s: any) => s.setSelectedConnectionType);
  const setSelectedAgentId = useStore((s: any) => s.setSelectedAgentId);
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const showAuthSkeleton = authStatus === 'loading' || !authInitialized || isLoadingLogin;
  
  
  const textColor = '#0A0807';
  const hoverColor = '#D200D3';
  

  const navLinkStyle = {
    color: textColor,
    fontWeight: 450,
    fontSize: '1.25rem',
    textDecoration: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    transition: 'all 0.3s ease',
    display: 'inline-block',
    lineHeight: '1.5',
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Navigation link component for reuse
  const NavLink = ({ to, children, isExternal = false }: { to: string; children: React.ReactNode; isExternal?: boolean }) => {
    const [isHovered, setIsHovered] = useState(false);
    const active = !isExternal && isActive(to);
    const linkColor = isHovered ? hoverColor : textColor;
    const underlineColor = isHovered ? hoverColor : textColor;

    if (isExternal) {
      return (
        <RouterLink
          to={to}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            ...navLinkStyle,
            color: linkColor,
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {children}
        </RouterLink>
      );
    }

    return (
      <Box position="relative" display="inline-block">
        <RouterLink
          to={to}
          style={{
            ...navLinkStyle,
            color: linkColor,
            position: 'relative',
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => setIsMenuOpen(false)}
        >
          {children}
        </RouterLink>
        {active && (
          <Box
            position="absolute"
            bottom="0"
            left="50%"
            transform="translateX(-50%)"
            width="80%"
            height="2px"
            backgroundColor={underlineColor}
            borderRadius="1px"
            transition="background-color 0.3s"
          />
        )}
      </Box>
    );
  };

  // Analyze dropdown component
  const AnalyzeDropdown = () => {
    const [isHovered, setIsHovered] = useState(false);
    const active = isActive('/analyze');
    const linkColor = isHovered ? hoverColor : textColor;
    const underlineColor = isHovered ? hoverColor : textColor;

    return (
      <Box position="relative" display="inline-block">
        <Menu.Root>
          <Menu.Trigger asChild>
            <Box
              as="button"
              style={{
                ...navLinkStyle,
                color: linkColor,
                position: 'relative',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              Analyze
            </Box>
          </Menu.Trigger>
          <Portal>
            <Menu.Positioner>
              <Menu.Content
                bg="white"
                border="1px solid #D3D3D3"
                borderRadius="0.5rem"
                boxShadow="0 4px 12px rgba(0, 0, 0, 0.15)"
                minW="180px"
                py={1}
              >
                <Menu.Item
                  value={CONNECTION_TYPES.JOTFORM}
                  style={{
                    color: textColor,
                    fontSize: '1rem',
                    fontWeight: 450,
                    padding: '0.75rem 1rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  _hover={{
                    bg: '#FFF6FF',
                    color: hoverColor,
                  }}
                  _focus={{
                    bg: '#FFF6FF',
                    color: hoverColor,
                  }}
                  onClick={() => { setSelectedConnectionType(CONNECTION_TYPES.JOTFORM); navigate('/analyze'); setIsMenuOpen(false); }}
                >
                  {CONNECTION_TYPE_LABELS[CONNECTION_TYPES.JOTFORM]}
                </Menu.Item>
                <Menu.Item
                  value={CONNECTION_TYPES.FILE}
                  style={{
                    color: textColor,
                    fontSize: '1rem',
                    fontWeight: 450,
                    padding: '0.75rem 1rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  _hover={{
                    bg: '#FFF6FF',
                    color: hoverColor,
                  }}
                  _focus={{
                    bg: '#FFF6FF',
                    color: hoverColor,
                  }}
                  onClick={() => { setSelectedConnectionType(CONNECTION_TYPES.FILE); navigate('/analyze'); setIsMenuOpen(false); }}
                >
                  {CONNECTION_TYPE_LABELS[CONNECTION_TYPES.FILE]}
                </Menu.Item>
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>
        {active && (
          <Box
            position="absolute"
            bottom="0"
            left="50%"
            transform="translateX(-50%)"
            width="80%"
            height="2px"
            backgroundColor={underlineColor}
            borderRadius="1px"
            transition="background-color 0.3s"
          />
        )}
      </Box>
    );
  };

  // Mobile navigation link component
  const MobileNavLink = ({ to, children, isExternal = false }: { to: string; children: React.ReactNode; isExternal?: boolean }) => {
    const active = !isExternal && isActive(to);
    
    if (isExternal) {
      return (
        <a
          href={to}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block',
            padding: '12px 16px',
            color: textColor,
            fontWeight: 450,
            fontSize: '1.125rem',
            borderBottom: '1px solid #D3D3D3',
            textDecoration: 'none',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = hoverColor;
            e.currentTarget.style.backgroundColor = '#FFF6FF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = textColor;
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          {children}
        </a>
      );
    }

    return (
      <RouterLink
        to={to}
        style={{
          display: 'block',
          padding: '12px 16px',
          color: active ? hoverColor : textColor,
          fontWeight: 450,
          fontSize: '1.125rem',
          borderBottom: '1px solid #D3D3D3',
          backgroundColor: active ? '#FFF6FF' : 'transparent',
          textDecoration: 'none',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = hoverColor;
          e.currentTarget.style.backgroundColor = '#FFF6FF';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = active ? hoverColor : textColor;
          e.currentTarget.style.backgroundColor = active ? '#FFF6FF' : 'transparent';
        }}
        onClick={() => setIsMenuOpen(false)}
      >
        {children}
      </RouterLink>
    );
  };

  return (
    <Box
      as="header"
      bg="white"
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex={1000}
      borderBottom="1px solid #E2E8F0"
    >
      <Container maxW="82.5rem" px={4}>
        <Flex
          justify="space-between"
          align="center"
          py={4}
          minH="5.5rem"
        >
          {/* Logo/App Name */}
          <RouterLink 
            to="/" 
            style={{ textDecoration: 'none'}}
          >
            <Text
              fontSize="1.5rem"
              fontWeight={700}
              color={textColor}
              _hover={{ color: hoverColor }}
              transition="color 0.3s ease"
              cursor="pointer"
            >
              Chat Analyzer
            </Text>
          </RouterLink>

          {/* Desktop Navigation and Button Container */}
          <Flex gap={8} align="center">
            {/* Desktop Navigation */}
            <Flex gap={1} display={{ base: 'none', md: 'flex' }} alignItems="center">
              <NavLink to="/about">About Us</NavLink>
              <NavLink to="https://form.jotform.com/252263897399981" isExternal>Contact Us</NavLink>
              <AnalyzeDropdown />
            </Flex>

            {/* User Avatar or Login Button */}
            {showAuthSkeleton ? (
              <HStack gap="5" display={{ base: 'none', md: 'flex' }}>
                <SkeletonCircle size="12" />
                <Stack flex="1">
                  <Skeleton height="5" />
                  <Skeleton height="5" width="80%" />
                </Stack>
              </HStack>
            ) : isUserLoggedIn ? (
              <RouterLink to="/profile" style={{ textDecoration: 'none' }}>
                <Box
                  cursor="pointer"
                  borderRadius="full"
                  _hover={{
                    transform: 'scale(1.05)',
                    transition: 'transform 0.2s ease',
                  }}
                >
                  <Avatar.Root size="md">
                    {typeof user?.profile_image === 'string' && user.profile_image ? (
                      <Avatar.Image src={user.profile_image} />
                    ) : null}
                    <Avatar.Fallback name={(((`${user?.first_name || ''} ${user?.last_name || ''}`).trim()) || user?.username || 'User')} />
                  </Avatar.Root>
                </Box>
              </RouterLink>
            ) : (
              <RouterLink to="/login" style={{ textDecoration: 'none' }}>
                <Button
                  bg={'black'}
                  color={'white'}
                  fontWeight={600}
                  fontSize="1.125rem"
                  px={6}
                  py={3}
                  borderRadius="0.625rem"
                  _hover={{
                    bg: 'grey',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(182, 237, 67, 0.3)',
                  }}
                  _active={{
                    transform: 'translateY(0)',
                  }}
                  transition="all 0.3s ease"
                  display={{ base: 'none', md: 'flex' }}
                >
                  Login
                </Button>
              </RouterLink>
            )}

            {/* Mobile Menu Button */}
            <Box
              as="button"
              display={{ base: 'flex', md: 'none' }}
              alignItems="center"
              justifyContent="center"
              w="40px"
              h="40px"
              bg="transparent"
              border="none"
              color={textColor}
              fontSize="1.5rem"
              cursor="pointer"
              borderRadius="0.5rem"
              transition="all 0.3s ease"
              _hover={{
                color: hoverColor,
                backgroundColor: '#FFF6FF',
              }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              ☰
            </Box>
          </Flex>
        </Flex>
      </Container>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <Box
          position="absolute"
          top="100%"
          left={0}
          right={0}
          bg="white"
          borderTop="1px solid #D3D3D3"
          boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
          zIndex={1001}
          display={{ base: 'block', md: 'none' }}
        >
          <VStack gap={0} align="stretch">
            <MobileNavLink to="/">Home</MobileNavLink>
            <MobileNavLink to="/about">About Us</MobileNavLink>
            <MobileNavLink to="https://form.jotform.com/252263897399981" isExternal>Contact Us</MobileNavLink>
            <MobileNavLink to="/analyze">Analyze</MobileNavLink>
            
            {/* Mobile Login Button */}
            {showAuthSkeleton ? (
              <Box p={4} borderTop="1px solid #D3D3D3">
                <HStack gap="5">
                  <SkeletonCircle size="12" />
                  <Stack flex="1">
                    <Skeleton height="5" />
                    <Skeleton height="5" width="80%" />
                  </Stack>
                </HStack>
              </Box>
            ) : !isUserLoggedIn && (
              <Box p={4} borderTop="1px solid #D3D3D3">
                <RouterLink to="/login" onClick={() => setIsMenuOpen(false)} style={{ textDecoration: 'none' }}>
                  <Button
                    bg={'black'}
                    color={'white'}
                    fontWeight={600}
                    fontSize="1.125rem"
                    w="full"
                    py={3}
                    borderRadius="0.625rem"
                    _hover={{
                      bg: 'grey',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(182, 237, 67, 0.3)',
                    }}
                    _active={{
                      transform: 'translateY(0)',
                    }}
                    transition="all 0.3s ease"
                  >
                    Login
                  </Button>
                </RouterLink>
              </Box>
            )}
          </VStack>
        </Box>
      )}
    </Box>
  );
};
