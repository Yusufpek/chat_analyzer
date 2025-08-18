import React from 'react';
import { useParams } from 'react-router-dom';
import { Text } from '@chakra-ui/react';

const AnalyzeStatistics = () => {
  const { convID } = useParams();

  return (
    <Text color="black" fontSize="2xl" fontWeight="bold">
      Analyze Statistics
    </Text>
  );
};

export default AnalyzeStatistics;
