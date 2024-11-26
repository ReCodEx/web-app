import React from 'react';
import { FormattedMessage } from 'react-intl';

import Box from '../../../widgets/Box';
import { LoadingIcon } from '../../../icons';

const LoadingAssignmentDetails = () => (
  <Box
    title={
      <span>
        <LoadingIcon gapRight={2} />
        <FormattedMessage id="app.assignment.loading" defaultMessage="Loading exercise assignment..." />
      </span>
    }
    noPadding={false}
    collapsable={true}
    isOpen={false}>
    <p>
      <FormattedMessage id="app.assignment.loading" defaultMessage="Loading exercise assignment..." />
    </p>
  </Box>
);

export default LoadingAssignmentDetails;
