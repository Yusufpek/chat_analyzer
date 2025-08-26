import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Box, Tabs, TabsList, TabsTrigger, TabsContent } from "@chakra-ui/react";
import AnalyzeDashboard from './AnalyzeDashboard';
import AnalyzeConversations from './AnalyzeConversations';
import AnalyzeStatistics from './AnalyzeStatistics';
import AnalyzeSentiment from './AnalyzeSentiment';
import AnalyzeSettings from './AnalyzeSettings';

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
    if (location.pathname.includes('/settings')) return 'settings';
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
      case 'settings':
        navigate(`/analyze/${agentId}/settings`);
        break;
    }
  };

  return (
    <Box position="relative" bg="#000000" width="full" minH="100%">
      <Tabs.Root 
        defaultValue={getActiveTab()}
        onValueChange={handleTabChange}
        width="full"
        height="full"
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
          <TabsTrigger 
            value="settings"
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
            Settings
          </TabsTrigger>
        </TabsList>
        
        <Box pos="relative" minH="calc(100vh - 120px)" width="full" bg="#FFF6FF">
          <TabsContent value="dashboard" position="relative" minH="calc(100vh - 120px)">
            <AnalyzeDashboard/>
          </TabsContent>
          <TabsContent value="conversations" position="relative" minH="calc(100vh - 120px)">
            <AnalyzeConversations />
          </TabsContent>
          <TabsContent value="statistics" position="relative" minH="calc(100vh - 120px)">
            <AnalyzeStatistics />
          </TabsContent>
          <TabsContent value="sentiment" position="relative" minH="calc(100vh - 120px)">
            <AnalyzeSentiment />
          </TabsContent>
          <TabsContent value="settings" position="relative" minH="calc(100vh - 120px)">
            <AnalyzeSettings />
          </TabsContent>
        </Box>
      </Tabs.Root>
    </Box>
  );
};

export default AnalyzeMain; 
