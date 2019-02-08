import React from 'react';
import { FormattedMessage } from 'react-intl';
import { WarningIcon } from '../../icons';

const FailedGroupDetail = () => (
  <div>
    <p>
      <WarningIcon gapRight />
      <FormattedMessage
        id="app.failedGroupDetail.msg"
        defaultMessage="Cannot load group detail. Please try again later."
      />
    </p>
  </div>
);

export default FailedGroupDetail;
