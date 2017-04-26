import React from 'react';
import { FormattedMessage } from 'react-intl';
import { LoadingIcon } from '../../icons';
import Box from '../../widgets/Box';

const LoadingGroupDetail = () => (
  <Box
    noPadding={false}
    title={
      <span>
        <LoadingIcon />
        {' '}
        <FormattedMessage
          id="app.groupDetail.loading"
          defaultMessage="Loading group's description ..."
        />
      </span>
    }
  >
    <FormattedMessage
      id="app.groupDetail.loading"
      defaultMessage="Loading group's description ..."
    />
  </Box>
);

export default LoadingGroupDetail;
