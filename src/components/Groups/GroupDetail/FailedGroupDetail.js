import React from 'react';
import { FormattedMessage } from 'react-intl';
import { WarningIcon } from '../../Icons';

const FailedGroupDetail = () => (
  <div>
    <p>
      <WarningIcon /> <FormattedMessage id="app.failedGroupDetail.msg" defaultMessage="Cannot load group detail. Please try again later." />
    </p>
  </div>
);

export default FailedGroupDetail;
