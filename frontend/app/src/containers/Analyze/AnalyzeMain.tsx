import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Tabs, TabsList, TabsTrigger, TabsContent } from "@chakra-ui/react";
import AnalyzeDashboard from './AnalyzeDashboard';
import AnalyzeConversations from './AnalyzeConversations';
import AnalyzeStatistics from './AnalyzeStatistics';
import AnalyzeSentiment from './AnalyzeSentiment';
import AnalyzeSettings from './AnalyzeSettings';
import { useStore } from '@store/index';


const AnalyzeMain = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Store selectors
  const agents = useStore((s: any) => s.agents);
  const selectedAgentId = useStore((s: any) => s.selectedAgentId);
  const setSelectedAgentId = useStore((s: any) => s.setSelectedAgentId);
  const fetchAgents = useStore((s: any) => s.fetchAgents);
  const authStatus = useStore((s: any) => s.authStatus);
  const authInitialized = useStore((s: any) => s.authInitialized);

  // Determine which tab is active based on current path
  const getActiveTab = () => {
    if (location.pathname.includes('/dashboard')) return 'dashboard';
    if (location.pathname.includes('/conversations')) return 'conversations';
    if (location.pathname.includes('/statistics')) return 'statistics';
    if (location.pathname.includes('/sentiment')) return 'sentiment';
    if (location.pathname.includes('/settings')) return 'settings';
    return "dashboard";
    
  };

  // Set last added agent as selected when on dashboard tab and no agent is selected
  useEffect(() => {
    const setLastAgentIfNeeded = async () => {
      // Only run if user is authenticated and we're on dashboard tab
      if (!authInitialized || authStatus !== 'authenticated') return;
      if (!location.pathname.includes('/dashboard')) return;
      
      // If no agent is selected, try to set the last added agent (most recent)
      if (!selectedAgentId) {
        // If agents are already loaded and there are agents, set the last one
        if (agents && agents.length > 0) {
          setSelectedAgentId(agents[agents.length - 1].id);
          return;
        }
        
        // If no agents loaded yet, try to fetch them
        try {
          const fetchedAgents = await fetchAgents();
          if (fetchedAgents && fetchedAgents.length > 0) {
            setSelectedAgentId(fetchedAgents[fetchedAgents.length - 1].id);
          }
        } catch (error) {
          console.error('Failed to fetch agents for dashboard:', error);
        }
      }
    };

    setLastAgentIfNeeded();
  }, [authInitialized, authStatus, location.pathname, selectedAgentId, agents, setSelectedAgentId, fetchAgents]);

  const handleTabChange = (details: { value: string }) => {
    switch (details.value) {
      case 'dashboard':
        navigate(`/analyze/dashboard`);
        break;
      case 'conversations':
        navigate(`/analyze/conversations`);
        break;
      case 'statistics':
        navigate(`/analyze/statistics`);
        break;
      case 'sentiment':
        navigate(`/analyze/sentiment`);
        break;
      case 'settings':
        navigate(`/analyze/settings`);
        break;
    }
  };

  return (
    <Box position="relative" bg="#FFF6FF" width="full" height="100%" display="flex" flexDirection="column" overflow="hidden">
      <Tabs.Root 
        value={getActiveTab()}
        onValueChange={handleTabChange}
        width="full"
        height="full"
        display="flex"
        flexDirection="column"
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
        
        <Box pos="relative" width="full" bg="#FFF6FF" flex="1" overflow="hidden" height="calc(100% - 60px)">
          <TabsContent value="dashboard" position="relative" height="100%" overflow="auto">
            <AnalyzeDashboard/>
          </TabsContent>
          <TabsContent value="conversations" position="relative" height="100%" overflow="auto">
            <AnalyzeConversations />
          </TabsContent>
          <TabsContent value="statistics" position="relative" height="100%" overflow="auto">
            <AnalyzeStatistics />
          </TabsContent>
          <TabsContent value="sentiment" position="relative" height="100%" overflow="auto">
            <AnalyzeSentiment />
          </TabsContent>
          <TabsContent value="settings" position="relative" height="100%" overflow="auto">
            <AnalyzeSettings />
          </TabsContent>
        </Box>
      </Tabs.Root>
    </Box>
  );
};

export default AnalyzeMain; 
