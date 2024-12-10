import React from 'react';
import { FormattedMessage } from 'react-intl';
import Box from '../../widgets/Box';
import { WarningIcon } from '../../icons';

const FailedSubmissionDetail = () => (
  <Box
    title={
      <span>
        <WarningIcon gapRight={2} />
        <FormattedMessage
          id="app.failedSubmissionDetail.title"
          defaultMessage="Cannot load evaluation of the solution"
        />
      </span>
    }
    noPadding={false}
    type={'warning'}
    isOpen={true}>
    <FormattedMessage
      id="app.failedSubmissionDetail.description"
      defaultMessage="Make sure you are connected to the Internet and repeat the action after a while."
    />
  </Box>
);

export default FailedSubmissionDetail;
