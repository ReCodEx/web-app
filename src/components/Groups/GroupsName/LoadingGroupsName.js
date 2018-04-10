import React from 'react';
import { FormattedMessage } from 'react-intl';
import { LoadingIcon } from '../../icons';

const LoadingGroupsName = () =>
  <span>
    <LoadingIcon />&nbsp;&nbsp;
    <FormattedMessage
      id="app.groupsName.loading"
      defaultMessage="Loading ..."
    />
  </span>;

export default LoadingGroupsName;
