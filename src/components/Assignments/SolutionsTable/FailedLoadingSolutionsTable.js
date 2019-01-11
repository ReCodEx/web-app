import React from 'react';
import { FormattedMessage } from 'react-intl';
import { WarningIcon } from '../../icons';

const FailedLoadingSolutionsTable = () =>
  <div className="text-center em-padding">
    <WarningIcon gapRight />
    <FormattedMessage
      id="app.solutionsTable.failedLoading"
      defaultMessage="Could not load this submission."
    />
  </div>;

export default FailedLoadingSolutionsTable;
