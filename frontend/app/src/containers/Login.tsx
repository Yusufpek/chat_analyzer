import React, { useState } from 'react';
import { Field, Input, Checkbox, Button, Stack, Text, Box, Heading } from "@chakra-ui/react";
import { Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Login attempt:', { email, password, rememberMe });
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
              Please enter your email and password to login
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
                  Email
                </Field.Label>
                <Input 
                  type="email"
                  color="#000000"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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

              {/* Remember Me & Forgot Password */}
              <Stack direction="row" justify="space-between" align="center">
                <Checkbox.Root
                  onCheckedChange={() => setRememberMe(!rememberMe)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control 
                    border="1px solid #E5E5E5"
                    borderRadius="0.375rem"
                    _checked={{ 
                      bg: '#D200D3',
                      borderColor: '#D200D3'
                    }}
                  />
                  <Checkbox.Label style={{
                    fontSize: "0.875rem",
                    lineHeight: "1.25rem",
                    color: "#374151"
                  }}>
                    Remember me
                  </Checkbox.Label>
                </Checkbox.Root>
                
                <Link to="/forgot-password">
                  <Text 
                    fontSize="0.875rem"
                    lineHeight="1.25rem"
                    color="#D200D3"
                    cursor="pointer"
                    _hover={{ color: '#B91C5B' }}
                    fontWeight="500"
                  >
                    Forgot password?
                  </Text>
                </Link>
              </Stack>

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
