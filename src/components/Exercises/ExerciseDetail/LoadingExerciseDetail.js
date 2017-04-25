import React from 'react';
import { FormattedMessage } from 'react-intl';
import { LoadingIcon } from '../../icons';
import Box from '../../widgets/Box';

const LoadingExerciseDetail = () => (
  <Box
    title={
      <FormattedMessage
        id="app.exercise.detailTitle"
        defaultMessage="Exercise description"
      />
    }
  >
    <LoadingIcon />
    {' '}
    <FormattedMessage
      id="app.exercises.loadingDetail"
      defaultMessage="Loading exercise's detail"
    />
  </Box>
);

export default LoadingExerciseDetail;
