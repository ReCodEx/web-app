import React from 'react';
import Box from '../../../AdminLTE/Box';
import { WarningIcon } from '../../../Icons';
import { FormattedMessage } from 'react-intl';

const FailedAssignmentDetails = () => (
  <Box
    title={(
      <span>
        <WarningIcon /> <FormattedMessage id='app.assignment.error' defaultMessage='Exercise assignment could not be loaded.' />
      </span>
    )}
    noPadding={false}
    collapsable={true}>
    <p>
      <FormattedMessage
        id='app.assignment.errorExplanation'
        defaultMessage='The assignment of this exercise could not be loaded. Make sure you are connected to the Internet and try again later.' />
    </p>
  </Box>
);

export default FailedAssignmentDetails;
