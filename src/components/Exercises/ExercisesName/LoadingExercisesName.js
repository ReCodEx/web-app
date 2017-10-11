import React from 'react';
import { FormattedMessage } from 'react-intl';
import { LoadingIcon } from '../../icons';

const LoadingExercisesName = () => (
  <div>
    <LoadingIcon />{' '}
    <FormattedMessage
      id="app.exercisesName.loading"
      defaultMessage="Loading ..."
    />
  </div>
);

export default LoadingExercisesName;
