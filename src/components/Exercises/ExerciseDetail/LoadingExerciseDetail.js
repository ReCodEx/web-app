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
    }>
    <LoadingIcon gapRight />
    <FormattedMessage
      id="app.exercises.loadingDetail"
      defaultMessage="Loading the detail of the exercise"
    />
  </Box>
);

export default LoadingExerciseDetail;
