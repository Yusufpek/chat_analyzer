import React, { useState } from 'react';
import { Field, Input, Checkbox, Button, Stack, Text, Box, Heading } from "@chakra-ui/react";
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '@store/index';
import { routePaths } from '../constants/routePaths';

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    agreeToMarketing: false
  });
  const navigateTo = useNavigate();
  const register = useStore((s: any) => s.register);
  const isLoadingRegister = useStore((s: any) => s.isLoadingRegister);
  const registerError = useStore((s: any) => s.registerError);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      username: formData.username,
      password: formData.password,
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
    };

    try {
      const ok = await register(payload);
      if (ok) {
        navigateTo(routePaths.login());
      }
    } catch (error) {
      console.error('Signup failed:', error);
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
            Create Account
          </Heading>
          <Text 
            fontSize="1rem"
            lineHeight="1.5rem"
            color="#615568"
          >
            Please fill in the form below to create your account
          </Text>
        </Box>

        {/* Signup Form */}
        <form onSubmit={handleSignup}>
          <Stack gap="1.75rem" align="stretch">
            {/* Name Fields */}
            <Stack direction="row" gap="1rem">
              <Field.Root flex="1">
                <Field.Label style={{
                  fontSize: "0.875rem",
                  lineHeight: "1.25rem",
                  fontWeight: "600",
                  color: "#0A0807",
                  marginBottom: "0.5rem"
                }}>
                  First Name
                </Field.Label>
                <Input
                  color = "black" 
                  type="text"
                  placeholder="Enter your first name"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
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

              <Field.Root flex="1">
                <Field.Label style={{
                  fontSize: "0.875rem",
                  lineHeight: "1.25rem",
                  fontWeight: "600",
                  color: "#0A0807",
                  marginBottom: "0.5rem"
                }}>
                  Last Name
                </Field.Label>
                <Input
                  color = "black" 
                  type="text"
                  placeholder="Enter your last name"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
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
            </Stack>

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
                color = "black" 
                type="email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
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

            {/* username Field */}
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
                color = "black" 
                type="text"
                placeholder="Enter your username"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
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

            {/* Password Fields */}
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
                color = "black" 
                type="password"
                placeholder="Create your password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
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

            <Field.Root>
              <Field.Label style={{
                fontSize: "0.875rem",
                lineHeight: "1.25rem",
                fontWeight: "600",
                color: "#0A0807",
                marginBottom: "0.5rem"
              }}>
                Confirm Password
              </Field.Label>
              <Input
                color = "black" 
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
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

            {/* Terms and Conditions */}
            <Stack gap="1rem">
              <Checkbox.Root 
                checked={formData.agreeToTerms}
                onCheckedChange={() => setFormData(prev => ({
                  ...prev,
                  agreeToTerms: !prev.agreeToTerms
                }))}
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
                  <Text style={{
                    fontSize: "0.875rem",
                    lineHeight: "1.25rem",
                    color: "#374151"
                  }}>
                    I agree to the{' '}
                    <Link to="/terms" style={{
                      color: "#D200D3",
                      textDecoration: "none"
                    }}>
                      Terms of Service
                    </Link>
                    {' '}and{' '}
                    <Link to="/privacy" style={{
                      color: "#D200D3",
                      textDecoration: "none"
                    }}>
                      Privacy Policy
                    </Link>
                  </Text>
                </Checkbox.Label>
              </Checkbox.Root>

              <Checkbox.Root 
                checked={formData.agreeToMarketing}
                onCheckedChange={() => setFormData(prev => ({
                  ...prev,
                  agreeToMarketing: !prev.agreeToMarketing
                }))}
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
                  I would like to receive marketing emails
                </Checkbox.Label>
              </Checkbox.Root>
            </Stack>

            {/* Signup Button */}
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
              disabled={isLoadingRegister}
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
              {isLoadingRegister ? 'Creating...' : 'Create Account'}
            </Button>
          </Stack>
        </form>

        {registerError && (
          <Text color="red.500" fontSize="0.875rem" textAlign="center">
            {registerError}
          </Text>
        )}

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

        {/* Social Signup Buttons */}
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
            Sign up with Google
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
            Sign up with Facebook
          </Button>
        </Stack>

        {/* Login Link */}
        <Box textAlign="center">
          <Text 
            fontSize="0.875rem"
            lineHeight="1.25rem"
            color="#6B7280"
          >
            Already have an account?{' '}
            <Link to="/login">
              <Text 
                as="span" 
                color="#D200D3"
                fontWeight="600"
                cursor="pointer"
                _hover={{ color: '#B91C5B' }}
              >
                Login
              </Text>
            </Link>
          </Text>
        </Box>
      </Stack>
    </Box>
  );
};

export default Signup;
