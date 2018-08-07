import React from 'react';
import { FormattedMessage } from 'react-intl';
import { WarningIcon } from '../../icons';

const FailedLoadingSolutionsTableRow = () =>
  <div className="text-center em-padding">
    <WarningIcon gapRight />
    <FormattedMessage
      id="app.solutionsTable.failedLoading"
      defaultMessage="Could not load this submission."
    />
  </div>;

export default FailedLoadingSolutionsTableRow;
