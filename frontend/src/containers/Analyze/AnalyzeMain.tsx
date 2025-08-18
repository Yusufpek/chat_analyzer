import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Box, Tabs, TabsList, TabsTrigger, TabsContent } from "@chakra-ui/react";
import AnalyzeDashboard from './AnalyzeDashboard';
import AnalyzeConversations from './AnalyzeConversations';
import AnalyzeStatistics from './AnalyzeStatistics';
import AnalyzeSentiment from './AnalyzeSentiment';

// Removed sidebar and mock agents; this component now only renders tabbed content

const AnalyzeMain = () => {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine which tab is active based on current path
  const getActiveTab = () => {
    if (location.pathname.includes('/dashboard')) return 'dashboard';
    if (location.pathname.includes('/conversations')) return 'conversations';
    if (location.pathname.includes('/statistics')) return 'statistics';
    if (location.pathname.includes('/sentiment')) return 'sentiment';
    return 'dashboard'; // default to dashboard
  };

  const handleTabChange = (details: { value: string }) => {
    switch (details.value) {
      case 'dashboard':
        navigate(`/analyze/${agentId}/dashboard`);
        break;
      case 'conversations':
        navigate(`/analyze/${agentId}/conversations`);
        break;
      case 'statistics':
        navigate(`/analyze/${agentId}/statistics`);
        break;
      case 'sentiment':
        navigate(`/analyze/${agentId}/sentiment`);
        break;
    }
  };

  return (
    <Box position="relative" bg="#FFF6FF" width="full">
      <Tabs.Root 
        defaultValue={getActiveTab()}
        onValueChange={handleTabChange}
        width="full"
      >
        <TabsList 
          bg="#FFF6FF"
          borderBottom="2px solid rgba(208, 126, 208, 0.3)"
          px={6}
          py={2}
          gap={2}
        >
          <TabsTrigger 
            value="dashboard"
            color="#0A0807"
            _selected={{
              bg: "#D200D3",
              color: "#0A0807",
              transform: "translateY(-2px)",
              boxShadow: "0 4px 12px rgba(210, 0, 211, 0.3)"
            }}
            _hover={{
              bg: "#FFF6FF",
              color: "#D200D3"
            }}
            style={{
              padding: '12px 24px',
              borderRadius: '8px 8px 0 0',
              fontWeight: 'medium',
              fontSize: '16px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Dashboard
          </TabsTrigger>
          <TabsTrigger 
            value="conversations"
            color="#0A0807"
            _selected={{
              bg: "#D200D3",
              color: "#0A0807",
              transform: "translateY(-2px)",
              boxShadow: "0 4px 12px rgba(210, 0, 211, 0.3)"
            }}
            _hover={{
              bg: "#FFF6FF",
              color: "#D200D3"
            }}
            style={{
              padding: '12px 24px',
              borderRadius: '8px 8px 0 0',
              fontWeight: 'medium',
              fontSize: '16px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Conversations
          </TabsTrigger>
          <TabsTrigger 
            value="statistics"
            color="#0A0807"
            _selected={{
              bg: "#D200D3",
              color: "#0A0807",
              transform: "translateY(-2px)",
              boxShadow: "0 4px 12px rgba(210, 0, 211, 0.3)"
            }}
            _hover={{
              bg: "#FFF6FF",
              color: "#D200D3"
            }}
            style={{
              padding: '12px 24px',
              borderRadius: '8px 8px 0 0',
              fontWeight: 'medium',
              fontSize: '16px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Statistics
          </TabsTrigger>
          <TabsTrigger 
            value="sentiment"
            color="#0A0807"
            _selected={{
              bg: "#D200D3",
              color: "#0A0807",
              transform: "translateY(-2px)",
              boxShadow: "0 4px 12px rgba(210, 0, 211, 0.3)"
            }}
            _hover={{
              bg: "#FFF6FF",
              color: "#D200D3"
            }}
            style={{
              padding: '12px 24px',
              borderRadius: '8px 8px 0 0',
              fontWeight: 'medium',
              fontSize: '16px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Sentiments
          </TabsTrigger>
        </TabsList>
        
        <Box pos="relative" minH="calc(100vh - 80px)" width="full" bg="#FFF6FF">
          <TabsContent value="dashboard" position="absolute" inset="0">
            <AnalyzeDashboard/>
          </TabsContent>
          <TabsContent value="conversations" position="absolute" inset="0">
            <AnalyzeConversations />
          </TabsContent>
          <TabsContent value="statistics" position="absolute" inset="0">
            <AnalyzeStatistics />
          </TabsContent>
          <TabsContent value="sentiment" position="absolute" inset="0">
            <AnalyzeSentiment />
          </TabsContent>
        </Box>
      </Tabs.Root>
    </Box>
  );
};

export default AnalyzeMain; 
