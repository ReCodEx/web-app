import React from 'react';
import { FormattedMessage } from 'react-intl';
import { LoadingIcon } from '../../icons';

const LoadingSolutionsTable = () => (
  <div className="text-center em-padding">
    <LoadingIcon gapRight />
    <FormattedMessage id="app.solutionsTable.loading" defaultMessage="Loading submitted solutions..." />
  </div>
);

export default LoadingSolutionsTable;
