import React from 'react';
import { useParams } from 'react-router-dom';
import { Text } from '@chakra-ui/react';

const AnalyzeSentiment = () => {
  const { convID } = useParams();

  return (
    <Text color="black" fontSize="2xl" fontWeight="bold">
      Analyze Sentiment
    </Text>
  );
};

export default AnalyzeSentiment;
