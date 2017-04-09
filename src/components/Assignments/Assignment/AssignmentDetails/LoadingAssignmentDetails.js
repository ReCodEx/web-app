import React from 'react';
import { FormattedMessage } from 'react-intl';

import Box from '../../../AdminLTE/Box';
import { LoadingIcon } from '../../../Icons';

const LoadingAssignmentDetails = () => (
  <Box
    title={(
      <span>
        <LoadingIcon /> <FormattedMessage id="app.assignment.loading" defaultMessage="Loading exercise assignment ..." />
      </span>
    )}
    noPadding={false}
    collapsable={true}
    isOpen={false}>
    <p>
      <FormattedMessage id="app.assignment.loading" defaultMessage="Loading exercise assignment ..." />
    </p>
  </Box>
);

export default LoadingAssignmentDetails;
