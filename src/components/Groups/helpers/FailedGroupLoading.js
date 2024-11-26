import React from 'react';
import { FormattedMessage } from 'react-intl';
import { WarningIcon } from '../../icons';

const FailedGroupLoading = () => (
  <div>
    <p>
      <WarningIcon gapRight={2} />
      <FormattedMessage
        id="app.failedGroupDetail.msg"
        defaultMessage="Cannot load group detail. Please try again later."
      />
    </p>
  </div>
);

export default FailedGroupLoading;
