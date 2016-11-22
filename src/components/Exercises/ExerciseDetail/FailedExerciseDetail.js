import React from 'react';
import { FormattedMessage } from 'react-intl';
import { WarningIcon } from '../../Icons';

const FailedExerciseDetail = () => (
  <div>
    <p>
      <WarningIcon />{' '}
      <FormattedMessage
        id='app.exercises.failedDetail'
        defaultMessage='Loading the details of the exercise failed. Please make sure you are connected to the Internet and try again later.' />
    </p>
  </div>
);

export default FailedExerciseDetail;
