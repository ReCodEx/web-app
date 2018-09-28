import React from 'react';
import { FormattedMessage } from 'react-intl';
import { LoadingIcon } from '../../icons';
import Box from '../../widgets/Box';

const LoadingGroupDetail = () =>
  <Box
    noPadding={false}
    title={
      <span>
        <LoadingIcon gapRight />
        <FormattedMessage
          id="app.groupDetail.loading"
          defaultMessage="Loading description of the group..."
        />
      </span>
    }
  >
    <FormattedMessage
      id="app.groupDetail.loading"
      defaultMessage="Loading description of the group..."
    />
  </Box>;

export default LoadingGroupDetail;
