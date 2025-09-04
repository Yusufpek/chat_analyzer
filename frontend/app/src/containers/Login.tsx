import React from 'react';
import { useState } from 'react';
import { Field, Input, Button, Stack, Text, Box, Heading } from "@chakra-ui/react";
import { Link, useNavigate } from 'react-router-dom'; 
import { routePaths } from '../constants/routePaths';
import { useStore } from '@store/index';

const Login = () => {
  const formatLoginError = (raw: unknown): string => {
    if (!raw) return '';
    const text = String(raw).trim();

    // Try to parse JSON error payloads coming from backend
    try {
      const json = JSON.parse(text);
      if (json && typeof json === 'object') {
        if (typeof (json as any).detail === 'string') return (json as any).detail;
        if (typeof (json as any).message === 'string') return (json as any).message;
        if (Array.isArray((json as any).non_field_errors) && (json as any).non_field_errors.length > 0) {
          return String((json as any).non_field_errors[0]);
        }
        if (Array.isArray((json as any).errors) && (json as any).errors.length > 0) {
          return String((json as any).errors[0]);
        }
      }
    } catch (_) {
      // not JSON, continue with heuristics
    }

    // TODO: fix backend instead of this
    const lower = text.toLowerCase();

    if (lower.includes('invalid') && (lower.includes('username') || lower.includes('password') || lower.includes('credentials')))
      return 'Username or password is incorrect.';
    if (lower.includes('csrf'))
      return 'Authentication failed. Please refresh the page and try again.';
    if (lower.includes('forbidden') || lower.includes('unauthorized') || lower.includes('401') || lower.includes('403'))
      return 'You are not authorized to perform this action.';
    if (lower.includes('not found') || lower.includes('404'))
      return 'Service not found. Please try again later.';
    if (lower.includes('internal server error') || lower.includes('500'))
      return 'Server error. Please try again later.';
    if (lower.includes('failed to fetch') || lower.includes('network') || lower.includes('timeout'))
      return 'Network connection failed. Please check your internet connection and try again.';
    return 'An error occurred during login. Please check your information and try again.';
  };
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigateTo = useNavigate();
  const login = useStore((s: any) => s.login);
  const isLoadingLogin = useStore((s: any) => s.isLoadingLogin);
  const loginError = useStore((s: any) => s.loginError);
  const fetchAgents = useStore((s: any) => s.fetchAgents);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await login(username, password);
    
    if (ok) {
      const fetchedAgents = await fetchAgents();
      if (fetchedAgents && fetchedAgents.length > 0) {
        const firstAgentId = fetchedAgents[0].id;
        navigateTo(routePaths.analyzeDashboard(firstAgentId));
      } else {
        navigateTo(routePaths.landing());
      }
    } else {
      console.log('Login failed, staying on login page');
    }
  };

  return (
      <Box 
        maxW="20rem"
        mx="auto"
        p="2.5rem"
        bg="white"
        borderRadius="2rem"
        boxShadow="0 8px 32px rgba(0, 0, 0, 0.08)"
        maxWidth="40rem"
        
        marginTop={10}
        marginBottom={10}
        style={{
          borderImage: 'linear-gradient(135deg, #F0F0F0 60%, #F8F8FA 100%) 1',
          transition: 'border-color 0.3s ease'
        }}
      >
        <Stack gap="2.5rem" align="stretch">
          {/* Header */}
          <Box textAlign="center">
            <Heading 
              fontSize="1.75rem"
              lineHeight="2.25rem"
              fontWeight="700"
              color="#0A0807"
              mb="0.5rem"
            >
              Welcome
            </Heading>
            <Text 
              fontSize="1rem"
              lineHeight="1.5rem"
              color="#615568"
            >
              Please enter your username and password to login
            </Text>
          </Box>

          {/* Login Form */}
          <form onSubmit={handleLogin}>
            <Stack gap="1.75rem" align="stretch">
              {/* Email Field */}
              <Field.Root>
                <Field.Label style={{
                  fontSize: "0.875rem",
                  lineHeight: "1.25rem",
                  fontWeight: "600",
                  color: "#0A0807",
                  marginBottom: "0.5rem"
                }}>
                  Username
                </Field.Label>
                <Input 
                  type="text"
                  color="#000000"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  height="3.25rem"
                  border="1px solid #E5E5E5"
                  borderRadius="0.875rem"
                  fontSize="0.875rem"
                  lineHeight="1.25rem"
                  _placeholder={{ color: '#9CA3AF' }}
                  _focus={{ 
                    borderColor: '#D200D3',
                    boxShadow: '0 0 0 3px rgba(210, 0, 211, 0.1)'
                  }}
                  _hover={{
                    borderColor: '#D1D5DB'
                  }}
                />
              </Field.Root>

              {/* Password Field */}
              <Field.Root>
                <Field.Label style={{
                  fontSize: "0.875rem",
                  lineHeight: "1.25rem",
                  fontWeight: "600",
                  color: "#0A0807",
                  marginBottom: "0.5rem"
                }}>
                  Password
                </Field.Label>
                <Input 
                  type="password"
                  color="#000000"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  height="3.25rem"
                  border="1px solid #E5E5E5"
                  borderRadius="0.875rem"
                  fontSize="0.875rem"
                  lineHeight="1.25rem"
                  _placeholder={{ color: '#9CA3AF' }}
                  _focus={{ 
                    borderColor: '#D200D3',
                    boxShadow: '0 0 0 3px rgba(210, 0, 211, 0.1)'
                  }}
                  _hover={{
                    borderColor: '#D1D5DB'
                  }}
                />
              </Field.Root>

              {/* Login Button */}
              <Button
                type="submit"
                position="relative"
                overflow="hidden"
                backgroundColor="rgba(182, 237, 67, 1)"
                color="#0A0807"
                fontSize="0.875rem"
                lineHeight="1.25rem"
                fontWeight="600"
                borderRadius="0.875rem"
                height="3.25rem"
                loading={isLoadingLogin}
                disabled={isLoadingLogin}
                _before={{
                  content: '""',
                  position: 'absolute',
                  width: '0',
                  height: '0',
                  borderRadius: '9999px',
                  backgroundColor: '#C6A7C2',
                  opacity: '0',
                  pointerEvents: 'none',
                  transition: '.3s ease-in-out'
                }}
                _hover={{
                  bg: 'rgba(182, 237, 67, 0.9)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(182, 237, 67, 0.3)',
                  _before: {
                    width: '150%',
                    height: '150%',
                    opacity: '.2'
                  }
                }}
                _active={{
                  bg: 'rgba(182, 237, 67, 0.95)',
                  transform: 'translateY(0)'
                }}
                transition="all 0.2s ease"
              >
                Login
              </Button>
              {loginError && (
                <Text color="#DC2626" fontSize="0.875rem">{formatLoginError(loginError)}</Text>
              )}
            </Stack>
          </form>

          {/* Divider */}
          <Stack direction="row" align="center">
            <Box flex="1" height="1px" backgroundColor="#E5E7EB" />
            <Text 
              fontSize="0.75rem"
              lineHeight="1rem"
              color="#6B7280" 
              px="1rem"
              fontWeight="500"
            >
              or
            </Text>
            <Box flex="1" height="1px" backgroundColor="#E5E7EB" />
          </Stack>

          {/* Social Login Buttons */}
          <Stack gap="0.75rem">
            <Button
              variant="outline"
              border="1px solid #E5E5E5"
              color="#374151"
              fontSize="0.875rem"
              lineHeight="1.25rem"
              borderRadius="0.875rem"
              height="3.25rem"
              width="100%"
              fontWeight="500"
              _hover={{
                borderColor: '#D200D3',
                color: '#D200D3',
                bg: 'rgba(210, 0, 211, 0.02)'
              }}
              transition="all 0.2s ease"
            >
              Login with Google
            </Button>
            
            <Button
              variant="outline"
              border="1px solid #E5E5E5"
              color="#374151"
              fontSize="0.875rem"
              lineHeight="1.25rem"
              borderRadius="0.875rem"
              height="3.25rem"
              width="100%"
              fontWeight="500"
              _hover={{
                borderColor: '#D200D3',
                color: '#D200D3',
                bg: 'rgba(210, 0, 211, 0.02)'
              }}
              transition="all 0.2s ease"
            >
              Login with Facebook
            </Button>
          </Stack>

          {/* Sign Up Link */}
          <Box textAlign="center">
            <Text 
              fontSize="0.875rem"
              lineHeight="1.25rem"
              color="#6B7280"
            >
              Don't have an account?{' '}
              <Link to="/signup">
                <Text 
                  as="span" 
                  color="#D200D3"
                  fontWeight="600"
                  cursor="pointer"
                  _hover={{ color: '#B91C5B' }}
                >
                  Sign up
                </Text>
              </Link>
            </Text>
          </Box>
        </Stack>
      </Box>
    
  );
};

export default Login;
