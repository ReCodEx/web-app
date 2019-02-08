import React from 'react';
import { FormattedMessage } from 'react-intl';
import { LoadingIcon } from '../../icons';

const LoadingGroupsName = () => (
  <span>
    <LoadingIcon gapRight />
    <FormattedMessage id="generic.loading" defaultMessage="Loading..." />
  </span>
);

export default LoadingGroupsName;
