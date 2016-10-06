import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import { LoadingIcon } from '../../Icons';
import Box from '../../AdminLTE/Box';

const LoadingExerciseDetail = () => (
  <Box title={<FormattedMessage id='app.exercise.detailTitle' defaultMessage='Exercise description' />}>
    <LoadingIcon /> <FormattedMessage id='app.exercises.loadingDetail' defaultMessage="Loading exercise's detail" />
  </Box>
);

export default LoadingExerciseDetail;
