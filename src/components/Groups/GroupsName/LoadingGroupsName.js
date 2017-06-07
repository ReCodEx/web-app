import React from 'react';
import { FormattedMessage } from 'react-intl';
import { LoadingIcon } from '../../icons';

const LoadingGroupsName = () =>
  <div>
    <LoadingIcon />
    <FormattedMessage
      id="app.groupsName.loading"
      defaultMessage="Loading ..."
    />
  </div>;

export default LoadingGroupsName;
